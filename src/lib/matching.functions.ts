import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildMatchPrompt, type MatchInput, type MatchResult } from "./matching.server";

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const matchInputSchema = z.object({
  user: z.object({
    name: z.string().min(1).max(100),
    age: z.number().min(18).max(100),
    gender: z.string().min(1).max(50),
    interests: z.string().min(1).max(50),
    arrivalHabit: z.string().min(1).max(100),
    travelStyle: z.string().min(1).max(100),
    zodiac: z.string().min(1).max(50),
    destination: z.string().min(1).max(100),
  }),
  candidates: z.array(z.object({
    name: z.string().min(1).max(100),
    age: z.number().min(18).max(100),
    gender: z.string().min(1).max(50),
    nationality: z.string().min(1).max(100),
    arrivalHabit: z.string().min(1).max(100),
    travelStyle: z.string().min(1).max(100),
    zodiac: z.string().min(1).max(50),
    destination: z.string().min(1).max(100),
    bio: z.string().min(1).max(500),
    coincidences: z.number().min(0).max(100),
  })).min(1).max(20),
  preferences: z.object({
    nationality: z.string().min(1).max(50),
    destination: z.string().min(1).max(50),
    ageRange: z.string().min(1).max(50),
    genderPref: z.string().min(1).max(50),
  }),
});

export const getAICompatibility = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => matchInputSchema.parse(input))
  .handler(async ({ data }): Promise<{ results: MatchResult[]; error: string | null }> => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return { results: [], error: "AI service not configured" };
    }

    const inputs: MatchInput[] = data.candidates.map((candidate) => ({
      user: data.user,
      candidate,
      preferences: data.preferences,
    }));

    const prompt = buildMatchPrompt(inputs);

    try {
      const response = await fetch(AI_GATEWAY_URL, {
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
              content: "You are a compatibility matching AI. Always respond using the provided tool.",
            },
            { role: "user", content: prompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_compatibility_scores",
                description: "Return compatibility scores for each candidate",
                parameters: {
                  type: "object",
                  properties: {
                    results: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          candidateName: { type: "string" },
                          compatibility: { type: "number", minimum: 0, maximum: 100 },
                          reason: { type: "string" },
                        },
                        required: ["candidateName", "compatibility", "reason"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["results"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_compatibility_scores" } },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return { results: [], error: "AI rate limit reached, please try again shortly." };
        }
        if (status === 402) {
          return { results: [], error: "AI credits exhausted. Please add funds." };
        }
        const body = await response.text();
        console.error(`AI gateway error [${status}]:`, body);
        return { results: [], error: "AI matching temporarily unavailable." };
      }

      const json = await response.json();
      const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        console.error("Unexpected AI response format:", JSON.stringify(json));
        return { results: [], error: "Could not parse AI response." };
      }

      const parsed = JSON.parse(toolCall.function.arguments) as { results: MatchResult[] };
      return { results: parsed.results, error: null };
    } catch (err) {
      console.error("AI matching error:", err);
      return { results: [], error: "AI matching failed. Using default scores." };
    }
  });
