import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { findNearestAirport } from "./airports";

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

function userClient(token: string) {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

// ─── Parse boarding pass image via Gemini Vision ────────────────────────────

export const parseBoardingPass = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string().min(1),
        imageDataUrl: z.string().min(10),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const { data: { user }, error: authErr } = await userClient(data.token).auth.getUser();
    if (authErr || !user) return { error: "Unauthorized", parsed: null };

    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) return { error: "AI service not configured", parsed: null };

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
              role: "user",
              content: [
                { type: "image_url", image_url: { url: data.imageDataUrl } },
                {
                  type: "text",
                  text: `Extract the following from this boarding pass and respond using the provided tool:
- flightNumber: the flight code (e.g. "AF1234")
- departureAirport: 3-letter IATA airport code (e.g. "CDG")
- destinationAirport: 3-letter IATA airport code (e.g. "BCN")
- boardingTime: boarding time as an ISO 8601 string using today's date if no date is visible
- gate: gate code if visible (e.g. "B14"), otherwise null
- passengerName: passenger name if visible, otherwise null`,
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_boarding_pass",
                description: "Return structured data extracted from a boarding pass",
                parameters: {
                  type: "object",
                  properties: {
                    flightNumber: { type: "string" },
                    departureAirport: { type: "string" },
                    destinationAirport: { type: "string" },
                    boardingTime: { type: "string" },
                    gate: { type: ["string", "null"] },
                    passengerName: { type: ["string", "null"] },
                  },
                  required: [
                    "flightNumber",
                    "departureAirport",
                    "destinationAirport",
                    "boardingTime",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "extract_boarding_pass" },
          },
        }),
      });

      if (!response.ok) {
        return { error: "Boarding pass scan failed — please enter details manually", parsed: null };
      }

      const json = await response.json();
      const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        return { error: "Could not read boarding pass", parsed: null };
      }

      const parsed = JSON.parse(toolCall.function.arguments) as {
        flightNumber: string;
        departureAirport: string;
        destinationAirport: string;
        boardingTime: string;
        gate: string | null;
        passengerName: string | null;
      };

      return { error: null, parsed };
    } catch {
      return { error: "Boarding pass parsing failed", parsed: null };
    }
  });

// ─── Verify user's device location against known airports ──────────────────

export const verifyLocation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ lat: z.number(), lon: z.number() }).parse(input)
  )
  .handler(async ({ data }) => {
    const airport = findNearestAirport(data.lat, data.lon, 15);
    return { airport };
  });

// ─── Create an airport session from a verified boarding pass ────────────────

const createSessionSchema = z.object({
  token: z.string().min(1),
  flightNumber: z.string().min(1).max(10),
  departureAirport: z.string().length(3),
  destinationAirport: z.string().length(3),
  boardingTime: z.string(),
  gate: z.string().optional().nullable(),
  passengerName: z.string().optional().nullable(),
  locationVerified: z.boolean().default(false),
});

export const createSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createSessionSchema.parse(input))
  .handler(async ({ data }) => {
    const client = userClient(data.token);
    const { data: { user }, error: authErr } = await client.auth.getUser();
    if (authErr || !user) return { error: "Unauthorized", session: null };

    const departure = data.departureAirport.toUpperCase();
    const destination = data.destinationAirport.toUpperCase();

    // Deactivate any existing active sessions for this user
    await client
      .from("sessions")
      .update({ is_active: false } as never)
      .eq("user_id", user.id)
      .eq("is_active", true as never);

    const { data: session, error } = await client
      .from("sessions")
      .insert({
        user_id: user.id,
        flight_number: data.flightNumber.toUpperCase(),
        departure_airport: departure,
        destination_airport: destination,
        boarding_time: data.boardingTime,
        gate: data.gate ?? null,
        passenger_name: data.passengerName ?? null,
        location_verified: data.locationVerified,
        is_active: true,
      } as never)
      .select()
      .single();

    if (error) return { error: error.message, session: null };

    // Record the airport visit for coincidence detection
    await client.from("airport_visits").insert({
      user_id: user.id,
      airport_code: departure,
      session_id: (session as { id: string }).id,
    } as never);

    return { error: null, session };
  });

// ─── Get the current user's active session ──────────────────────────────────

export const getActiveSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(1) }).parse(input)
  )
  .handler(async ({ data }) => {
    const client = userClient(data.token);
    const { data: { user }, error: authErr } = await client.auth.getUser();
    if (authErr || !user) return { session: null };

    const { data: session } = await client
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true as never)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return { session };
  });

// ─── Deactivate all active sessions for the current user ───────────────────
// Called on every fresh sign-in so the user must scan a new boarding pass.

export const deactivateSessions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(1) }).parse(input)
  )
  .handler(async ({ data }) => {
    const client = userClient(data.token);
    const { data: { user }, error: authErr } = await client.auth.getUser();
    if (authErr || !user) return { error: "Unauthorized" };

    const { error } = await client
      .from("sessions")
      .update({ is_active: false } as never)
      .eq("user_id", user.id)
      .eq("is_active", true as never);

    return { error: error?.message ?? null };
  });
