import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, Sparkles, SlidersHorizontal, Plane, Loader2, LogOut } from "lucide-react";
import { mockMatches } from "@/lib/mock-data";
import { CountdownTimer } from "@/components/CountdownTimer";
import { CompatibilityBadge } from "@/components/CompatibilityBadge";
import { useApp } from "@/lib/app-state";
import { getAICompatibility } from "@/lib/matching.functions";
import { toast } from "sonner";
import { signOut } from "@/lib/use-auth";

export function MatchesGrid() {
  const { setScreen, setActiveChatId, preferences } = useApp();
  const [aiScores, setAiScores] = useState<Record<string, { compatibility: number; reason: string }>>({});
  const [loading, setLoading] = useState(false);

  const handleMatch = (id: string) => {
    setActiveChatId(id);
    setScreen("chat");
  };

  const filteredMatches = mockMatches.filter((match) => {
    if (preferences.genderPref === "women" && match.gender !== "woman") return false;
    if (preferences.genderPref === "men" && match.gender !== "man") return false;
    return true;
  });

  const fetchAIScores = useCallback(async () => {
    if (filteredMatches.length === 0) return;
    setLoading(true);

    try {
      const result = await getAICompatibility({
        data: {
          user: {
            name: "You",
            age: 28,
            gender: "Man",
            interests: preferences.genderPref === "everyone" ? "Everyone" : preferences.genderPref === "women" ? "Women" : "Men",
            arrivalHabit: "Right on time",
            travelStyle: "Spontaneous",
            zodiac: "Leo",
            destination: "Barcelona",
          },
          candidates: filteredMatches.map((m) => ({
            name: m.name,
            age: m.age,
            gender: m.gender === "woman" ? "Woman" : "Man",
            nationality: m.nationality,
            arrivalHabit: m.arrivalHabit,
            travelStyle: m.travelStyle,
            zodiac: m.zodiac,
            destination: m.destination,
            bio: m.bio,
            coincidences: m.coincidences,
          })),
          preferences,
        },
      });

      if (result.error) {
        toast.error(result.error);
      }

      if (result.results.length > 0) {
        const scores: Record<string, { compatibility: number; reason: string }> = {};
        result.results.forEach((r) => {
          scores[r.candidateName] = { compatibility: r.compatibility, reason: r.reason };
        });
        setAiScores(scores);
      }
    } catch (err) {
      console.error("Failed to fetch AI scores:", err);
    } finally {
      setLoading(false);
    }
  }, [filteredMatches.length, preferences]);

  useEffect(() => {
    fetchAIScores();
  }, []);

  const getCompatibility = (match: typeof filteredMatches[0]) => {
    const aiScore = aiScores[match.name];
    return aiScore ? aiScore.compatibility : match.compatibility;
  };

  const sortedMatches = [...filteredMatches].sort((a, b) => getCompatibility(b) - getCompatibility(a));

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
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 text-coral animate-spin" />}
            <button
              onClick={() => setScreen("preferences")}
              className="h-10 w-10 rounded-xl bg-card flex items-center justify-center border border-border hover:bg-accent transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => signOut()}
              title="Sign out"
              className="h-10 w-10 rounded-xl bg-card flex items-center justify-center border border-border hover:bg-accent transition-colors"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        {loading && (
          <div className="mt-2 text-[10px] text-coral uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> AI is analyzing compatibility…
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {sortedMatches.map((match, i) => {
          const compat = getCompatibility(match);
          const aiReason = aiScores[match.name]?.reason;

          return (
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
                  <CompatibilityBadge percentage={compat} className="mt-1.5" />
                  {aiReason && (
                    <p className="text-[9px] text-muted-foreground/70 mt-0.5 line-clamp-2 italic">{aiReason}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <CountdownTimer targetTime={match.boardingTime} variant="clock" size="sm" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">
                      Boards<br />in
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
