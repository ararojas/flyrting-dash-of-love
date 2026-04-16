import { motion } from "framer-motion";
import { ArrowLeft, Heart, Plane, Clock } from "lucide-react";
import { mockFlights, mockMatches } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";

export function FlightExtensionScreen() {
  const { setScreen, activeChatId } = useApp();
  const match = mockMatches.find(m => m.id === activeChatId) || mockMatches[0];

  return (
    <div className="min-h-screen bg-gradient-midnight px-6 py-8">
      <button onClick={() => setScreen("chat")} className="text-muted-foreground hover:text-foreground mb-6">
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
            Later flights to {match.destination} — extend your time with {match.name}
          </p>
        </div>

        <div className="space-y-3">
          {mockFlights.map((flight, i) => (
            <motion.div
              key={flight.flightNumber}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-card border border-border p-4 hover:border-coral/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-coral" />
                    <span className="font-semibold text-sm">{flight.airline}</span>
                    <span className="text-xs text-muted-foreground">{flight.flightNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{flight.departure} → {flight.arrival}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">→ {flight.destination}</p>
                </div>
                <div className="text-right">
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
          <Button variant="coral" size="lg" className="w-full rounded-xl py-6">
            Book & Stay Longer 💕
          </Button>
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
