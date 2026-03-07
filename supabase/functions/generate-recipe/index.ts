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
    const { diet, preferences, ingredients } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a professional chef and nutritionist. Generate a single recipe based on the user's dietary restrictions, food preferences, and available ingredients.

You MUST respond with a valid JSON object (no markdown, no code blocks, just pure JSON) with this exact structure:
{
  "name": "Recipe Name",
  "description": "A brief appetizing description",
  "servings": 4,
  "prepTime": "15 min",
  "cookTime": "30 min",
  "estimatedCost": "$8-12",
  "ingredients": [
    { "item": "ingredient name", "amount": "1 cup" }
  ],
  "steps": [
    "Step 1 description",
    "Step 2 description"
  ],
  "nutrition": {
    "calories": 350,
    "protein": "25g",
    "carbs": "40g",
    "fat": "12g",
    "fiber": "6g",
    "sugar": "8g",
    "sodium": "450mg"
  },
  "tips": "Optional helpful cooking tips"
}

Rules:
- Primarily use the ingredients provided, but you may suggest 1-3 common pantry staples if needed
- Respect ALL dietary restrictions strictly
- Provide realistic nutrition estimates per serving
- Provide a realistic cost estimate in USD
- Steps should be clear and detailed enough for a beginner
- Keep the recipe practical and achievable in a home kitchen`;

    const userPrompt = `Generate a recipe with these constraints:
- Dietary restrictions: ${diet.join(", ")}
- Food preferences: ${preferences.length > 0 ? preferences.join(", ") : "None specified"}
- Available ingredients: ${ingredients.join(", ")}`;

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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response, handling potential markdown code blocks
    let recipeJson;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      recipeJson = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse recipe JSON:", content);
      throw new Error("Failed to parse recipe from AI response");
    }

    return new Response(JSON.stringify({ recipe: recipeJson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recipe error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
