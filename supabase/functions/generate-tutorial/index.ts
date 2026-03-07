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
    const { recipeName, description, ingredients, steps, tips } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an enthusiastic, expert cooking instructor creating a detailed cooking tutorial. Write in a warm, encouraging tone as if you're personally guiding someone through the recipe step by step.

Format your tutorial using markdown with these sections:
# 🍳 Cooking Tutorial: [Recipe Name]

## Before You Start
- Kitchen setup tips, mise en place advice
- Equipment needed

## Ingredient Prep
- How to properly measure, cut, and prepare each ingredient
- Common mistakes to avoid during prep

## Step-by-Step Walkthrough
For each step, provide:
- **What to do** with detailed technique guidance
- **What to look for** (visual/smell/sound cues)
- **Timing tips** (exact times and what to watch for)
- **Beginner tips** for tricky parts
- **Common mistakes** to avoid

## Pro Tips & Techniques
- Advanced tips for leveling up the dish
- Variations and substitutions
- How to plate/present beautifully

## Troubleshooting
- What to do if something goes wrong
- How to fix common issues

Keep it conversational, detailed, and beginner-friendly. Use emojis sparingly for warmth.`;

    const userPrompt = `Create a detailed cooking tutorial for:

Recipe: ${recipeName}
Description: ${description}

Ingredients:
${ingredients.map((i: { item: string; amount: string }) => `- ${i.amount} ${i.item}`).join("\n")}

Steps:
${steps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

${tips ? `Chef's Tips: ${tips}` : ""}`;

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
          stream: true,
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
        JSON.stringify({ error: "Failed to generate tutorial. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-tutorial error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
