import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop";

async function searchPexelsImage(
  query: string,
  recipeName: string,
  category: string,
  pexelsKey: string,
  usedIds: Set<number>
): Promise<string> {
  const searchTerms = [
    query,
    recipeName,
    category ? `${category} dish` : "",
    "plated food",
  ].filter(Boolean);

  try {
    for (const term of searchTerms) {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(`${term} food`)}&per_page=10&orientation=landscape`;
      const resp = await fetch(url, {
        headers: { Authorization: pexelsKey },
      });

      if (!resp.ok) {
        console.error("Pexels API error:", resp.status, "for", term);
        continue;
      }

      const data = await resp.json();
      const photos = data.photos || [];

      // Pick first valid, non-duplicate image URL
      for (const photo of photos) {
        const imageUrl = photo?.src?.large || photo?.src?.medium || photo?.src?.small || "";
        if (imageUrl && !usedIds.has(photo.id)) {
          usedIds.add(photo.id);
          return imageUrl;
        }
      }

      // fallback to first valid result for this term
      const firstValid = photos.find((photo: any) => photo?.src?.large || photo?.src?.medium || photo?.src?.small);
      if (firstValid) {
        return firstValid.src.large || firstValid.src.medium || firstValid.src.small;
      }
    }

    return FALLBACK_IMAGE_URL;
  } catch (err) {
    console.error("Pexels search error:", err);
    return FALLBACK_IMAGE_URL;
  }
}

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

    const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");

    const systemPrompt = `You are a professional chef and nutritionist. Generate exactly 5 different recipes based on the user's dietary restrictions, food preferences, available appliances, and available ingredients.

Rules:
- Primarily use the ingredients provided, but you may suggest 1-3 common pantry staples per recipe if needed
- Respect ALL dietary restrictions strictly
- Each recipe should be distinctly different (different cuisines, cooking methods, or styles)
- Provide realistic nutrition estimates per serving
- Provide a realistic cost estimate in USD
- Steps should be clear and detailed enough for a beginner
- Keep recipes practical and achievable in a home kitchen
- For imageQuery, provide a VERY SPECIFIC 2-4 word description of the finished dish as it would look in a food photo. Focus on the main dish name, not ingredients. Examples: "beef ramen bowl", "grilled salmon fillet", "vegetable stir fry", "stuffed bell peppers"
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
                          name: { type: "string" },
                          description: { type: "string" },
                          imageQuery: { type: "string", description: "2-4 word dish name for photo search" },
                          category: { type: "string" },
                          servings: { type: "integer" },
                          prepTime: { type: "string" },
                          cookTime: { type: "string" },
                          estimatedCost: { type: "string" },
                          ingredients: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: { item: { type: "string" }, amount: { type: "string" } },
                              required: ["item", "amount"],
                              additionalProperties: false
                            }
                          },
                          steps: { type: "array", items: { type: "string" } },
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
                          tips: { type: "string" }
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
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "Failed to generate recipes. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();

    // Extract from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let recipes: any[];

    if (toolCall) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        recipes = parsed.recipes || [parsed];
      } catch {
        console.error("Failed to parse tool call:", toolCall.function.arguments?.substring(0, 500));
        return new Response(JSON.stringify({ error: "Failed to parse recipes. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } else {
      // Fallback: parse content
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        try {
          const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const parsed = JSON.parse(cleaned);
          recipes = parsed.recipes || [parsed];
        } catch {
          return new Response(JSON.stringify({ error: "Failed to parse recipes. Please try again." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } else {
        return new Response(JSON.stringify({ error: "No response from AI. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Fetch real images from Pexels for each recipe
    if (PEXELS_API_KEY) {
      console.log("Fetching Pexels images for", recipes.length, "recipes...");
      const usedIds = new Set<number>();
      const imagePromises = recipes.map((recipe) =>
        searchPexelsImage(
          recipe.imageQuery || recipe.name,
          recipe.name || "dish",
          recipe.category || "",
          PEXELS_API_KEY,
          usedIds
        )
      );
      const images = await Promise.all(imagePromises);
      recipes = recipes.map((recipe, i) => ({
        ...recipe,
        image: images[i] || FALLBACK_IMAGE_URL,
      }));
      console.log("Pexels images attached.");
    }

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
