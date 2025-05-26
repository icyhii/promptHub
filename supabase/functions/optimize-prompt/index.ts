import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { prompt_id, method, goals } = await req.json();

    // Validate input
    if (!prompt_id || !method || !goals) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create optimization job
    const { data: job, error: jobError } = await supabaseClient
      .from('optimization_jobs')
      .insert({
        prompt_id,
        method,
        status: 'processing',
        result_summary: { goals },
      })
      .select()
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Failed to create optimization job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mock optimization process (replace with actual optimization logic)
    const optimizedPrompt = {
      content: 'Optimized prompt content',
      metrics: {
        conciseness: 85,
        clarity: 90,
        effectiveness: 88,
      },
    };

    // Update job with results
    const { error: updateError } = await supabaseClient
      .from('optimization_jobs')
      .update({
        status: 'completed',
        result_summary: {
          ...job.result_summary,
          optimized: optimizedPrompt,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update optimization job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ job_id: job.id, result: optimizedPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});