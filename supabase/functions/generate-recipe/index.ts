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
    const { diet, preferences, ingredients, appliances } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a professional chef and nutritionist. Generate exactly 5 different recipes based on the user's dietary restrictions, food preferences, available appliances, and available ingredients.

Rules:
- Primarily use the ingredients provided, but you may suggest 1-3 common pantry staples per recipe if needed
- Respect ALL dietary restrictions strictly
- Each recipe should be distinctly different (different cuisines, cooking methods, or styles)
- Provide realistic nutrition estimates per serving
- Provide a realistic cost estimate in USD
- Steps should be clear and detailed enough for a beginner
- Keep recipes practical and achievable in a home kitchen
- For imageQuery, provide a VERY SPECIFIC 3-5 word description of the finished plated dish as it would appear in a food photography photo. Be descriptive about the actual dish appearance, not generic. Examples: "golden crispy chicken thighs rosemary", "creamy mushroom risotto parmesan shavings", "colorful vegan buddha bowl quinoa"
- The servings field MUST be a plain integer number (e.g. 4), never a string or expression`;

    const userPrompt = `Generate 5 recipes with these constraints:
- Dietary restrictions: ${diet.join(", ")}
- Food preferences: ${preferences.length > 0 ? preferences.join(", ") : "None specified"}
- Available appliances: ${appliances ? appliances.join(", ") : "Any"}
- Available ingredients: ${ingredients.join(", ")}`;

    console.log("Calling AI gateway with tool calling...");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_recipes",
                description: "Return exactly 5 generated recipes",
                parameters: {
                  type: "object",
                  properties: {
                    recipes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", description: "Recipe name" },
                          description: { type: "string", description: "A brief appetizing description" },
                          imageQuery: { type: "string", description: "3-5 word specific description of the finished plated dish for food photography search" },
                          category: { type: "string", description: "e.g. High Protein, Comfort Food, Quick & Easy, Healthy, Vegan" },
                          servings: { type: "integer", description: "Number of servings" },
                          prepTime: { type: "string", description: "e.g. 15 min" },
                          cookTime: { type: "string", description: "e.g. 30 min" },
                          estimatedCost: { type: "string", description: "e.g. $8-12" },
                          ingredients: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                item: { type: "string" },
                                amount: { type: "string" }
                              },
                              required: ["item", "amount"],
                              additionalProperties: false
                            }
                          },
                          steps: {
                            type: "array",
                            items: { type: "string" }
                          },
                          nutrition: {
                            type: "object",
                            properties: {
                              calories: { type: "integer" },
                              protein: { type: "string" },
                              carbs: { type: "string" },
                              fat: { type: "string" },
                              fiber: { type: "string" },
                              sugar: { type: "string" },
                              sodium: { type: "string" }
                            },
                            required: ["calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium"],
                            additionalProperties: false
                          },
                          tips: { type: "string", description: "Optional helpful cooking tips" }
                        },
                        required: ["name", "description", "imageQuery", "category", "servings", "prepTime", "cookTime", "estimatedCost", "ingredients", "steps", "nutrition"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["recipes"],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "return_recipes" } },
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
        JSON.stringify({ error: "Failed to generate recipes. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Extract from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      // Fallback: try parsing content directly
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        try {
          const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const parsed = JSON.parse(cleaned);
          return new Response(JSON.stringify({ recipes: parsed.recipes || [parsed] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch {
          console.error("Failed to parse fallback content:", content?.substring(0, 500));
        }
      }
      console.error("No tool call in AI response:", JSON.stringify(data).substring(0, 500));
      return new Response(
        JSON.stringify({ error: "No response from AI. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let recipesData;
    try {
      recipesData = JSON.parse(toolCall.function.arguments);
    } catch (parseErr) {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments?.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse recipes. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipes = recipesData.recipes || [recipesData];

    return new Response(JSON.stringify({ recipes }), {
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
