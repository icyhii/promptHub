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

    const { prompt_id, input, model } = await req.json();

    // Validate input
    if (!prompt_id || !input || !model) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get prompt from database
    const { data: prompt, error: promptError } = await supabaseClient
      .from('prompts')
      .select('*')
      .eq('id', prompt_id)
      .single();

    if (promptError || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mock LLM call (replace with actual LLM integration)
    const output = {
      text: `Generated response for prompt: ${prompt.title}`,
      tokens: 150,
    };

    // Log execution
    const { error: executionError } = await supabaseClient
      .from('prompt_executions')
      .insert({
        prompt_id,
        input,
        output,
        model,
        runtime_stats: { duration_ms: 1000 },
      });

    if (executionError) {
      return new Response(
        JSON.stringify({ error: 'Failed to log execution' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log token usage
    await supabaseClient
      .from('token_usage_logs')
      .insert({
        prompt_id,
        model,
        token_count: output.tokens,
      });

    return new Response(
      JSON.stringify(output),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});