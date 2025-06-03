import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { Configuration, OpenAIApi } from "npm:openai@4.12.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const configuration = new Configuration({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});
const openai = new OpenAIApi(configuration);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const {
      query,
      filters = {},
      limit = 10,
      userContext = {},
    } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query is required and must be a string" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Generate embedding for search query
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: query.replace(/\n/g, " "),
    });

    const [{ embedding }] = embeddingResponse.data.data;

    // Perform similarity search
    const { data: searchResults, error: searchError } = await supabaseClient.rpc(
      "search_prompts",
      {
        query_embedding: embedding,
        similarity_threshold: 0.7,
        match_count: limit,
        filter_categories: filters.categories,
        filter_models: filters.models,
      }
    );

    if (searchError) {
      throw searchError;
    }

    // Apply context-based scoring
    const scoredResults = searchResults.map((result: any) => {
      let contextScore = 0;
      
      // User preference matching
      if (userContext.preferredCategories?.includes(result.category)) {
        contextScore += 0.2;
      }
      if (userContext.preferredModels?.includes(result.model)) {
        contextScore += 0.1;
      }

      // Calculate final score
      const finalScore = (
        result.similarity * 0.6 + 
        contextScore * 0.3 +
        (result.engagement_score || 0) * 0.1
      );

      return {
        ...result,
        score: finalScore,
      };
    });

    // Sort by final score
    scoredResults.sort((a, b) => b.score - a.score);

    return new Response(
      JSON.stringify(scoredResults),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});