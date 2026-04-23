import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Plane, Clock, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";
import { searchFlights, type FlightOption } from "@/lib/flights.functions";
import { toast } from "sonner";

export function FlightExtensionScreen() {
  const { setScreen, activeChatPartner, activeSession } = useApp();
  const partner = activeChatPartner;

  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookedFlight, setBookedFlight] = useState<FlightOption | null>(null);

  // Prefer a flight to the partner's destination; fall back to user's own destination
  const targetDestination =
    partner?.destinationAirport ?? activeSession?.destinationAirport ?? "BCN";
  const originAirport = activeSession?.departureAirport ?? "CDG";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await searchFlights({
          data: {
            originAirport,
            destinationAirport: targetDestination,
          },
        });
        if (!cancelled) {
          if (result.error) toast.error(result.error);
          else setFlights(result.flights);
        }
      } catch {
        if (!cancelled) toast.error("Could not load flights");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [originAirport, targetDestination]);

  if (bookedFlight) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-midnight">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="h-20 w-20 rounded-full bg-coral/20 flex items-center justify-center mb-6"
          >
            <Heart className="h-10 w-10 text-coral fill-coral" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold">Love wins! 💕</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            You're on {bookedFlight.flightNumber} to {bookedFlight.destinationAirport}.
            Go find {partner?.displayName ?? "them"}!
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Cost of love: {bookedFlight.currency}{bookedFlight.price}
          </p>
          <Button
            variant="coral"
            className="mt-8 rounded-xl"
            onClick={() => setScreen("chat")}
          >
            Back to Chat
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-midnight px-6 py-8">
      <button
        onClick={() => setScreen("chat")}
        className="text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-coral/20 mb-4"
          >
            <Heart className="h-8 w-8 text-coral fill-coral" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold">Don't let it end here</h1>
          <p className="text-muted-foreground mt-2 text-sm font-display italic">
            How much does the love of your life cost?
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Later flights {originAirport} → {targetDestination}
            {partner?.displayName ? ` — extend your time with ${partner.displayName}` : ""}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 text-coral animate-spin" />
          </div>
        )}

        {!loading && flights.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No later flights found for this route.
          </p>
        )}

        <div className="space-y-3">
          {flights.map((flight, i) => (
            <motion.div
              key={`${flight.flightNumber}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl bg-card border border-border p-4 hover:border-coral/40 transition-all cursor-pointer group"
              onClick={() => setBookedFlight(flight)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-coral shrink-0" />
                    <span className="font-semibold text-sm">{flight.airline}</span>
                    <span className="text-xs text-muted-foreground">{flight.flightNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {flight.departureTime} → {flight.arrivalTime}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    → {flight.destinationAirport}
                  </p>
                  {flight.bookingUrl && (
                    <a
                      href={flight.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 inline-flex items-center gap-1 text-[10px] text-coral hover:underline"
                    >
                      Book directly <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-display text-2xl font-bold text-gradient-gold">
                    {flight.currency}{flight.price}
                  </p>
                  <p className="text-[10px] text-muted-foreground">for love</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => setScreen("post-date")}
          >
            Say goodbye for now
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
