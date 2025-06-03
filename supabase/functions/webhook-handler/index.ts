import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

function calculateBackoff(attempt: number): number {
  return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), 1000 * 60 * 60); // Max 1 hour
}

function generateHmac(secret: string, payload: string): string {
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const message = encoder.encode(payload);
  const hmac = new Deno.createHmac("sha256", key);
  hmac.update(message);
  return hmac.digest("hex");
}

async function deliverWebhook(
  webhook: any,
  payload: any,
  attempt: number = 1
): Promise<{ success: boolean; status?: number; response?: any }> {
  const signature = generateHmac(webhook.secret, JSON.stringify(payload));
  
  try {
    const response = await fetch(webhook.endpoint_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        ...webhook.headers,
      },
      body: JSON.stringify(payload),
    });

    return {
      success: response.ok,
      status: response.status,
      response: await response.text(),
    };
  } catch (error) {
    console.error(`Webhook delivery attempt ${attempt} failed:`, error);
    
    if (attempt < MAX_RETRIES) {
      const delay = calculateBackoff(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      return deliverWebhook(webhook, payload, attempt + 1);
    }
    
    return { success: false };
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { event_type, payload } = await req.json();

    // Get active webhooks for this event
    const { data: webhooks, error: webhookError } = await supabaseClient
      .from("webhooks")
      .select("*")
      .eq("status", "active")
      .contains("events", [event_type]);

    if (webhookError) throw webhookError;

    // Process each webhook
    const results = await Promise.all(
      webhooks.map(async (webhook) => {
        // Check filters
        if (webhook.filters && Object.keys(webhook.filters).length > 0) {
          const matches = Object.entries(webhook.filters).every(([key, value]) => {
            const path = key.split(".");
            let current = payload;
            for (const segment of path) {
              current = current[segment];
              if (current === undefined) return false;
            }
            return current === value;
          });
          
          if (!matches) return null;
        }

        // Deliver webhook
        const result = await deliverWebhook(webhook, payload);

        // Log result
        await supabaseClient.from("webhook_logs").insert({
          webhook_id: webhook.id,
          event_type,
          payload,
          response_status: result.status,
          response_body: result.response,
          attempt_count: result.success ? 1 : MAX_RETRIES,
        });

        // Update webhook status if needed
        if (!result.success) {
          await supabaseClient
            .from("webhooks")
            .update({
              status: "failed",
              retry_count: webhook.retry_count + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", webhook.id);
        }

        return result;
      })
    );

    return new Response(
      JSON.stringify({ delivered: results.filter(Boolean).length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});