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

    const systemPrompt = `You are a professional chef and nutritionist. Generate exactly 5 different recipes based on the user's dietary restrictions, food preferences, and available ingredients.

Return the recipes by calling the provided tool function.

Rules:
- Primarily use the ingredients provided, but you may suggest 1-3 common pantry staples per recipe if needed
- Respect ALL dietary restrictions strictly
- Each recipe should be distinctly different (different cuisines, cooking methods, or styles)
- Provide realistic nutrition estimates per serving
- Provide a realistic cost estimate in USD
- Steps should be clear and detailed enough for a beginner
- Keep recipes practical and achievable in a home kitchen
- For imageQuery, provide 2-3 descriptive words for the finished dish (e.g. "chicken stir fry", "pasta carbonara", "vegan buddha bowl") — this will be used to find a matching photo`;

    const userPrompt = `Generate 5 recipes with these constraints:
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
          tools: [
            {
              type: "function",
              function: {
                name: "return_recipes",
                description: "Return 5 generated recipes",
                parameters: {
                  type: "object",
                  properties: {
                    recipes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" },
                          imageQuery: { type: "string", description: "2-3 word search term for a photo of this dish" },
                          category: { type: "string", description: "e.g. High Protein, Comfort Food, Quick & Easy, Healthy, Vegan, Vegetarian" },
                          servings: { type: "number" },
                          prepTime: { type: "string" },
                          cookTime: { type: "string" },
                          estimatedCost: { type: "string" },
                          ingredients: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                item: { type: "string" },
                                amount: { type: "string" },
                              },
                              required: ["item", "amount"],
                              additionalProperties: false,
                            },
                          },
                          steps: { type: "array", items: { type: "string" } },
                          nutrition: {
                            type: "object",
                            properties: {
                              calories: { type: "number" },
                              protein: { type: "string" },
                              carbs: { type: "string" },
                              fat: { type: "string" },
                              fiber: { type: "string" },
                              sugar: { type: "string" },
                              sodium: { type: "string" },
                            },
                            required: ["calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium"],
                            additionalProperties: false,
                          },
                          tips: { type: "string" },
                        },
                        required: ["name", "description", "imageQuery", "category", "servings", "prepTime", "cookTime", "estimatedCost", "ingredients", "steps", "nutrition"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["recipes"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_recipes" } },
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
    
    // Extract from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      // Fallback: try content
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        const recipes = parsed.recipes || [parsed];
        return new Response(JSON.stringify({ recipes }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("No tool call or content in AI response");
    }

    const args = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ recipes: args.recipes }), {
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
