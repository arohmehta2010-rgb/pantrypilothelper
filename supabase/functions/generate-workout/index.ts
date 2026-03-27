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
    const { stats, equipment, customDayFocuses } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const equipmentList = equipment.length > 0 ? equipment.join(", ") : "bodyweight only";

    const splitName = stats.split || "custom";
    const daysPerWeek = stats.daysPerWeek || 4;

    const customSchedule = customDayFocuses && customDayFocuses.length > 0
      ? `\n- Custom day schedule: ${customDayFocuses.map((f: string, i: number) => `Day ${i + 1}: ${f}`).join(", ")}`
      : "";

    const prompt = `Create a personalized workout plan with these details:

- Gender: ${stats.gender}
- Age: ${stats.age}
- Weight: ${stats.weight} ${stats.weightUnit}
- Height: ${stats.height} ${stats.heightUnit}
- Fitness Level: ${stats.fitnessLevel}
- Goal: ${stats.goal}
- Workout Split: ${splitName}
- Days per week: ${daysPerWeek}${customSchedule}
- Available equipment: ${equipmentList}

Use the person's weight (${stats.weight} ${stats.weightUnit}), age (${stats.age}), and gender (${stats.gender}) to calculate realistic calorie burn estimates for each exercise and each day's total. Heavier individuals burn more calories. Older individuals may burn slightly fewer. Factor in exercise intensity and duration.

INTENSITY GUIDELINES based on fitness level "${stats.fitnessLevel}":
${stats.fitnessLevel === "beginner" ? "- Use 3 sets per exercise, higher rep ranges (10-15), longer rest periods (90-120s), focus on compound movements and machine-based exercises for safety. Recommend lighter weights relative to the user's body weight." : ""}${stats.fitnessLevel === "intermediate" ? "- Use 3-4 sets per exercise, moderate rep ranges (8-12), moderate rest (60-90s), include supersets and progressive overload strategies. Recommend moderate weights." : ""}${stats.fitnessLevel === "advanced" ? "- Use 4-5 sets per exercise, varied rep ranges (6-15 including heavy sets), shorter rest (45-75s), include advanced techniques like drop sets, rest-pause sets, and tempo manipulation. Recommend challenging weights." : ""}

Return a JSON object with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "title": "Plan title",
  "summary": "Brief 1-2 sentence summary mentioning calorie context",
  "weeklyCalories": 2500,
  "days": [
    {
      "day": "Day 1",
      "focus": "e.g. Upper Body Push",
      "warmup": "5 min warmup description",
      "totalCalories": 450,
      "estimatedDuration": "55 min",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": "8-12",
          "rest": "60-90s",
          "notes": "optional brief tip including suggested weight if applicable",
          "caloriesBurned": 65,
          "formCues": [
            "Step 1: Setup position description",
            "Step 2: Movement execution description",
            "Step 3: Key form point"
          ],
          "targetMuscles": ["Primary muscle", "Secondary muscle"],
          "commonMistakes": [
            "Mistake 1 and how to avoid it",
            "Mistake 2 and how to avoid it"
          ]
        }
      ],
      "cooldown": "5 min cooldown description"
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"]
}

IMPORTANT RULES:
- Include exactly ${daysPerWeek} workout days following the "${splitName}" split pattern.${customDayFocuses && customDayFocuses.length > 0 ? `\n- IMPORTANT: Each day's focus MUST match the custom schedule provided above (${customDayFocuses.join(", ")}).` : ""}
- Each day should have 4-6 exercises using ONLY the available equipment.
- For EVERY exercise, provide detailed formCues (3-5 steps), targetMuscles (1-3 muscles), commonMistakes (2-3 mistakes), and caloriesBurned (realistic estimate for this person).
- Include totalCalories per day and weeklyCalories for the full plan.
- Include estimatedDuration per day (total time including rest).
- Where applicable, suggest specific weights in the notes field based on the user's body weight and fitness level.
- The formCues should be step-by-step instructions for proper form that a beginner could follow.
- Make it realistic and appropriate for the ${stats.fitnessLevel} fitness level.
- CRITICAL: You MUST return EXACTLY ${daysPerWeek} days in the "days" array. No more, no less.`;

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
                "You are a certified personal trainer and movement specialist. You create safe, effective, personalized workout plans with detailed form instructions. Always return valid JSON only, no markdown formatting.",
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
