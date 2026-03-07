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
    const { recipeName, description, ingredients, steps, nutrition, tips } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a professional chef and nutritionist. Given a recipe, generate 6 alternative versions adapted for different dietary needs and common allergies.

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks). The JSON must have this structure:
{
  "alternatives": [
    {
      "dietLabel": "e.g. Gluten-Free, Dairy-Free, Nut-Free, Vegan, Halal, Kosher",
      "name": "Adapted recipe name",
      "description": "Brief description of how this version differs",
      "keySwaps": ["Swap 1: original → replacement", "Swap 2: original → replacement"],
      "nutrition": {
        "calories": 350,
        "protein": "25g",
        "carbs": "40g",
        "fat": "12g"
      }
    }
  ]
}

Rules:
- Generate exactly 6 alternatives covering: Gluten-Free, Dairy-Free, Nut-Free, Vegan, Halal, and Kosher
- If the original recipe already fits a diet, note that and suggest an enhanced version
- Key swaps should be specific ingredient substitutions
- Nutrition estimates should reflect the substitutions
- Keep the spirit of the original dish intact`;

    const userPrompt = `Generate 6 diet/allergy-adapted alternatives for:

Recipe: ${recipeName}
Description: ${description}

Ingredients:
${ingredients.map((i: { item: string; amount: string }) => `- ${i.amount} ${i.item}`).join("\n")}

Steps:
${steps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

Nutrition: ${JSON.stringify(nutrition)}
${tips ? `Tips: ${tips}` : ""}`;

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
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to generate alternatives. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse alternatives JSON:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse alternatives. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-alternatives error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
