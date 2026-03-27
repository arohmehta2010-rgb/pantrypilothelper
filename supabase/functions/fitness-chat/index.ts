import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are FitForge Coach, an expert fitness and nutrition advisor. You help users with:

1. **Exercise Form & Technique**: Provide detailed form guidance. When discussing specific exercises, include a YouTube search link formatted as a markdown link like this: [Watch proper form →](https://www.youtube.com/results?search_query=proper+form+exercise+name+tutorial). Replace spaces with + in the URL.

2. **Workout Alternatives**: When a user can't do an exercise (injury, no equipment, etc.), suggest 2-3 alternatives with the same muscle group targets.

3. **Nutrition Advice**: Pre-workout and post-workout meals, macro breakdowns, hydration tips, supplement advice. Be specific with portions and timing.

4. **Recovery & Rest**: Sleep recommendations, stretching routines, active recovery days.

5. **Progress Tips**: How to break plateaus, progressive overload strategies, deload weeks.

Keep responses concise but thorough. Use bullet points and bold text for readability. Be encouraging and supportive. If asked about medical conditions or injuries, recommend consulting a healthcare professional while still offering general guidance.

Always format YouTube links as clickable markdown links when referencing exercise demonstrations.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      throw new Error("Failed to get AI response");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
