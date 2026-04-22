import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, Sparkles, SlidersHorizontal, Plane, Loader2, LogOut, User as UserIcon, MessageCircle } from "lucide-react";
import { mockMatches } from "@/lib/mock-data";
import { CountdownTimer } from "@/components/CountdownTimer";
import { CompatibilityBadge } from "@/components/CompatibilityBadge";
import { useApp } from "@/lib/app-state";
import { getAICompatibility } from "@/lib/matching.functions";
import { toast } from "sonner";
import { signOut, useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function MatchesGrid() {
  const { setScreen, openChat, preferences } = useApp();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    age: number | null;
    gender: string | null;
    interested_in: string | null;
    nationality: string | null;
  } | null>(null);
  const [aiScores, setAiScores] = useState<Record<string, { compatibility: number; reason: string }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("age,gender,interested_in,nationality")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) setProfile(data ?? null);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleMatch = (id: string) => {
    openChat(id);
  };

  // Apply preferences AND profile-based filtering (mutual interest, age range, etc.)
  const myAge = profile?.age ?? null;
  const myGenderLower = (profile?.gender ?? "").toLowerCase(); // "woman" | "man" | "non-binary"
  const myNationality = profile?.nationality ?? null;

  const filteredMatches = mockMatches.filter((match) => {
    // 1. Who I want to see (preferences screen overrides profile interested_in)
    const showPref = preferences.genderPref;
    if (showPref === "women" && match.gender !== "woman") return false;
    if (showPref === "men" && match.gender !== "man") return false;

    // 2. Mutual interest — does THIS match want to see my gender?
    if (myGenderLower) {
      const wants = match.interestedIn; // "women" | "men" | "everyone"
      if (wants === "women" && myGenderLower !== "woman") return false;
      if (wants === "men" && myGenderLower !== "man") return false;
    }

    // 3. Age range preference
    if (myAge && preferences.ageRange !== "any") {
      const range = parseInt(preferences.ageRange, 10);
      if (!Number.isNaN(range) && Math.abs(match.age - myAge) > range) return false;
    }

    // 4. Nationality preference
    if (myNationality && preferences.nationality !== "any") {
      const sameNationality = match.nationality === myNationality;
      if (preferences.nationality === "same" && !sameNationality) return false;
      if (preferences.nationality === "different" && sameNationality) return false;
    }

    // 5. Destination preference (mock "same flight" = matches with same destination as Barcelona demo)
    if (preferences.destination === "same" && match.destination !== "Barcelona") return false;
    if (preferences.destination === "different" && match.destination === "Barcelona") return false;

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
          <div className="flex items-center gap-1.5">
            {loading && <Loader2 className="h-4 w-4 text-coral animate-spin" />}
            <button
              onClick={() => setScreen("chats-list")}
              title="Your chats"
              className="h-10 w-10 rounded-xl bg-card flex items-center justify-center border border-border hover:bg-accent transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setScreen("profile")}
              title="Edit profile"
              className="h-10 w-10 rounded-xl bg-card flex items-center justify-center border border-border hover:bg-accent transition-colors"
            >
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setScreen("preferences")}
              title="Preferences"
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
                {/* Stronger gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10" />

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

                {/* Bottom info overlay — high-contrast white text on dark gradient */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-lg font-bold text-white drop-shadow">{match.name}</span>
                        <span className="text-sm text-white/85">{match.age}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-white/85">
                        <Plane className="h-3 w-3" />
                        <span className="truncate">{match.destination}</span>
                        <span>• {match.gate}</span>
                      </div>
                      <CompatibilityBadge percentage={compat} className="mt-1.5" />
                      {aiReason && (
                        <p className="text-[10px] text-white/75 mt-1 line-clamp-2 italic leading-snug">{aiReason}</p>
                      )}
                    </div>
                    {/* Clock with label ON TOP */}
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <span className="text-[9px] text-white/85 uppercase tracking-wider leading-tight text-center">
                        Boards in
                      </span>
                      <CountdownTimer targetTime={match.boardingTime} variant="clock" size="sm" />
                    </div>
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
