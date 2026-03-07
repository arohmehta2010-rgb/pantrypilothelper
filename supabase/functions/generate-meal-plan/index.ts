import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bodyStats, weightGoal, dailyTargets, dietPreferences, days = 7 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Generate a ${days}-day meal plan for weight loss.

User stats: ${bodyStats.age}yo ${bodyStats.gender}, ${bodyStats.weightKg}kg, ${bodyStats.heightCm}cm, activity: ${bodyStats.activityLevel}
Goal: ${weightGoal.currentWeightKg}kg → ${weightGoal.targetWeightKg}kg, losing ${weightGoal.weeklyGoalKg}kg/week
Daily targets: ${dailyTargets.calories} kcal, ${dailyTargets.protein}g protein, ${dailyTargets.carbs}g carbs, ${dailyTargets.fat}g fat
Diet preferences: ${dietPreferences || "None"}

For each day provide breakfast, lunch, dinner, and 1 snack. Each meal needs: name, calories, protein (g), carbs (g), fat (g), brief description.
Keep meals practical, varied, and easy to prepare.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a certified nutritionist creating personalized meal plans. Return structured data only." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_meal_plan",
            description: "Create a structured meal plan",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "Name for this meal plan" },
                days: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "string" },
                      meals: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            type: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
                            name: { type: "string" },
                            calories: { type: "number" },
                            protein: { type: "number" },
                            carbs: { type: "number" },
                            fat: { type: "number" },
                            description: { type: "string" },
                          },
                          required: ["type", "name", "calories", "protein", "carbs", "fat"],
                        },
                      },
                    },
                    required: ["day", "meals"],
                  },
                },
              },
              required: ["name", "days"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_meal_plan" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    const mealPlan = JSON.parse(toolCall.function.arguments);
    
    return new Response(JSON.stringify({ mealPlan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("meal-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
