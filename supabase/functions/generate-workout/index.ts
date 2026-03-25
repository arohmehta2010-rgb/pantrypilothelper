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
    const { stats, equipment } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const equipmentList = equipment.length > 0 ? equipment.join(", ") : "bodyweight only";

    const prompt = `Create a personalized workout plan with these details:

- Gender: ${stats.gender}
- Age: ${stats.age}
- Weight: ${stats.weight} ${stats.weightUnit}
- Height: ${stats.height} ${stats.heightUnit}
- Fitness Level: ${stats.fitnessLevel}
- Goal: ${stats.goal}
- Days per week: ${stats.daysPerWeek}
- Available equipment: ${equipmentList}

Return a JSON object with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "title": "Plan title",
  "summary": "Brief 1-2 sentence summary",
  "days": [
    {
      "day": "Day 1",
      "focus": "e.g. Upper Body Push",
      "warmup": "5 min warmup description",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": "8-12",
          "rest": "60-90s",
          "notes": "optional form tip"
        }
      ],
      "cooldown": "5 min cooldown description"
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"]
}

Include ${stats.daysPerWeek} workout days. Each day should have 4-6 exercises using ONLY the available equipment. Make it realistic and appropriate for the fitness level.`;

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
            {
              role: "system",
              content:
                "You are a certified personal trainer. You create safe, effective, personalized workout plans. Always return valid JSON only, no markdown formatting.",
            },
            { role: "user", content: prompt },
          ],
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
      throw new Error("Failed to generate workout plan");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // Strip markdown code blocks if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const plan = JSON.parse(content);

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
