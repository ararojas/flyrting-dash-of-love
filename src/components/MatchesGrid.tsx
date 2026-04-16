import { motion } from "framer-motion";
import { MapPin, Sparkles, SlidersHorizontal, Plane } from "lucide-react";
import { mockMatches } from "@/lib/mock-data";
import { CountdownTimer } from "@/components/CountdownTimer";
import { StarRating } from "@/components/StarRating";
import { useApp } from "@/lib/app-state";

export function MatchesGrid() {
  const { setScreen, setActiveChatId } = useApp();

  const handleMatch = (id: string) => {
    setActiveChatId(id);
    setScreen("chat");
  };

  return (
    <div className="min-h-screen bg-gradient-midnight px-4 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-midnight/80 backdrop-blur-xl pt-6 pb-4 px-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gradient-coral">Flyrting</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" />
              <span>Charles de Gaulle (CDG)</span>
              <span className="mx-1">•</span>
              <Plane className="h-3 w-3" />
              <span>Gate B14</span>
            </div>
          </div>
          <button
            onClick={() => setScreen("preferences")}
            className="h-10 w-10 rounded-xl bg-card flex items-center justify-center border border-border hover:bg-accent transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {mockMatches.map((match, i) => (
          <motion.button
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => handleMatch(match.id)}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border text-left transition-all hover:border-coral/40 hover:glow-coral"
          >
            {/* Photo */}
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={match.photo}
                alt={match.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

              {/* Coincidence badge */}
              {match.coincidences > 0 && (
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-fate/90 px-2 py-1 text-[10px] font-semibold text-coral-foreground glow-fate">
                  <Sparkles className="h-3 w-3" />
                  {match.coincidences}× fate
                </div>
              )}

              {/* Flag */}
              <div className="absolute top-2 left-2 text-lg">
                {match.nationalityFlag}
              </div>

              {/* Bottom info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-lg font-bold text-foreground">{match.name}</span>
                  <span className="text-sm text-muted-foreground">{match.age}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                  <Plane className="h-3 w-3" />
                  <span>{match.destination}</span>
                  <span>• {match.gate}</span>
                </div>
                <StarRating rating={match.starRating} className="mt-1.5" />
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Boards in</span>
                  <CountdownTimer targetTime={match.boardingTime} className="text-xs" />
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
