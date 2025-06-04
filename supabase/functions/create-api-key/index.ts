import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { name, permissions } = await req.json();

    // Validate input
    if (!name?.trim()) {
      return new Response(
        JSON.stringify({ error: "Name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!permissions || typeof permissions !== "object") {
      return new Response(
        JSON.stringify({ error: "Valid permissions object is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate API key
    const key = new Uint8Array(32);
    crypto.getRandomValues(key);
    const apiKey = `ph_${Array.from(key).map(b => b.toString(16).padStart(2, '0')).join('')}`;
    
    // Generate hash
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create API token record
    const { data: token, error } = await supabaseClient
      .from('api_tokens')
      .insert({
        name,
        token: hashHex, // Store hash only
        permissions,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      })
      .select('id, name, created_at, permissions, expires_at')
      .single();

    if (error) throw error;

    // Log creation in audit trail
    await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'api_token.created',
        entity_type: 'api_token',
        entity_id: token.id,
        metadata: {
          name: token.name,
          permissions: token.permissions,
        }
      });

    // Return token info with the actual key (shown only once)
    return new Response(
      JSON.stringify({ ...token, key: apiKey }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error creating API key:', error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to create API key",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});