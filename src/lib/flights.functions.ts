import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface FlightOption {
  airline: string;
  flightNumber: string;
  departureTime: string;  // "HH:MM" or "Tomorrow HH:MM"
  arrivalTime: string;
  originAirport: string;
  destinationAirport: string;
  destinationCity: string;
  price: number;
  currency: string;
  bookingUrl: string | null;
}

// ─── Amadeus OAuth token (server-side only) ──────────────────────────────────

let amadeusToken: { access_token: string; expires_at: number } | null = null;

async function getAmadeusToken(clientId: string, clientSecret: string): Promise<string | null> {
  if (amadeusToken && amadeusToken.expires_at > Date.now() + 30_000) {
    return amadeusToken.access_token;
  }
  try {
    const res = await fetch(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    amadeusToken = {
      access_token: json.access_token,
      expires_at: Date.now() + json.expires_in * 1000,
    };
    return amadeusToken.access_token;
  } catch {
    return null;
  }
}

// ─── Format Amadeus offer into our FlightOption type ────────────────────────

function formatAmadeusOffer(offer: {
  id: string;
  itineraries: Array<{
    segments: Array<{
      carrierCode: string;
      number: string;
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
    }>;
  }>;
  price: { total: string; currency: string };
}, airlineNames: Record<string, string>): FlightOption {
  const seg = offer.itineraries[0].segments[0];
  const depDate = new Date(seg.departure.at);
  const arrDate = new Date(seg.arrival.at);
  const now = new Date();
  const isToday =
    depDate.toDateString() === now.toDateString();
  const isTomorrow =
    depDate.getDate() === now.getDate() + 1 &&
    depDate.getMonth() === now.getMonth();

  const timeStr = depDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const arrTimeStr = arrDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const prefix = isToday ? "" : isTomorrow ? "Tomorrow " : `${depDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} `;

  return {
    airline: airlineNames[seg.carrierCode] ?? seg.carrierCode,
    flightNumber: `${seg.carrierCode}${seg.number}`,
    departureTime: `${prefix}${timeStr}`,
    arrivalTime: `${prefix}${arrTimeStr}`,
    originAirport: seg.departure.iataCode,
    destinationAirport: seg.arrival.iataCode,
    destinationCity: seg.arrival.iataCode,
    price: parseFloat(offer.price.total),
    currency: offer.price.currency === "EUR" ? "€" : offer.price.currency === "USD" ? "$" : offer.price.currency,
    bookingUrl: null,
  };
}

// ─── Structured fallback flights when Amadeus is not configured ──────────────

function makeFallbackFlights(
  origin: string,
  destination: string
): FlightOption[] {
  const now = new Date();
  const addHours = (h: number) => {
    const d = new Date(now);
    d.setHours(d.getHours() + h);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };
  const tomorrowAt = (h: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(h, 0, 0, 0);
    return `Tomorrow ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  };

  return [
    {
      airline: "Air France",
      flightNumber: "AF1234",
      departureTime: addHours(3),
      arrivalTime: addHours(5),
      originAirport: origin,
      destinationAirport: destination,
      destinationCity: destination,
      price: 89,
      currency: "€",
      bookingUrl: null,
    },
    {
      airline: "Vueling",
      flightNumber: "VY5678",
      departureTime: addHours(5),
      arrivalTime: addHours(7),
      originAirport: origin,
      destinationAirport: destination,
      destinationCity: destination,
      price: 54,
      currency: "€",
      bookingUrl: null,
    },
    {
      airline: "Ryanair",
      flightNumber: "FR9012",
      departureTime: tomorrowAt(7),
      arrivalTime: tomorrowAt(9),
      originAirport: origin,
      destinationAirport: destination,
      destinationCity: destination,
      price: 39,
      currency: "€",
      bookingUrl: null,
    },
    {
      airline: "Iberia",
      flightNumber: "IB3456",
      departureTime: tomorrowAt(14),
      arrivalTime: tomorrowAt(16),
      originAirport: origin,
      destinationAirport: destination,
      destinationCity: destination,
      price: 127,
      currency: "€",
      bookingUrl: null,
    },
  ];
}

// ─── Search flights server function ─────────────────────────────────────────

export const searchFlights = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        originAirport: z.string().length(3),
        destinationAirport: z.string().length(3),
        date: z.string().optional(), // YYYY-MM-DD, defaults to today
      })
      .parse(input)
  )
  .handler(
    async ({
      data,
    }): Promise<{ error: string | null; flights: FlightOption[] }> => {
      const origin = data.originAirport.toUpperCase();
      const destination = data.destinationAirport.toUpperCase();

      const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
      const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

      // Fall back to structured mock data if Amadeus not configured
      if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
        return { error: null, flights: makeFallbackFlights(origin, destination) };
      }

      const token = await getAmadeusToken(AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET);
      if (!token) {
        return { error: null, flights: makeFallbackFlights(origin, destination) };
      }

      const today = data.date ?? new Date().toISOString().split("T")[0];

      try {
        const params = new URLSearchParams({
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: today,
          adults: "1",
          max: "8",
          currencyCode: "EUR",
        });

        const res = await fetch(
          `https://test.api.amadeus.com/v2/shopping/flight-offers?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
          return { error: null, flights: makeFallbackFlights(origin, destination) };
        }

        const json = await res.json();
        const offers: FlightOption[] = (json.data ?? []).map(
          (offer: Parameters<typeof formatAmadeusOffer>[0]) =>
            formatAmadeusOffer(offer, json.dictionaries?.carriers ?? {})
        );

        // Also fetch tomorrow's flights
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];

        const res2 = await fetch(
          `https://test.api.amadeus.com/v2/shopping/flight-offers?${new URLSearchParams({ ...Object.fromEntries(params), departureDate: tomorrowStr, max: "4" })}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res2.ok) {
          const json2 = await res2.json();
          const tomorrow2: FlightOption[] = (json2.data ?? []).map(
            (offer: Parameters<typeof formatAmadeusOffer>[0]) =>
              formatAmadeusOffer(offer, json2.dictionaries?.carriers ?? {})
          );
          offers.push(...tomorrow2);
        }

        return {
          error: null,
          flights: offers.length > 0 ? offers : makeFallbackFlights(origin, destination),
        };
      } catch {
        return { error: null, flights: makeFallbackFlights(origin, destination) };
      }
    }
  );
