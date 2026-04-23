import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Sparkles, SlidersHorizontal, Plane, Loader2, LogOut, User as UserIcon, MessageCircle,
} from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { CompatibilityBadge } from "@/components/CompatibilityBadge";
import { useApp, type ChatPartner } from "@/lib/app-state";
import { getAICompatibility } from "@/lib/matching.functions";
import { getAirportMatches, openConversation, type AirportMatch } from "@/lib/social.functions";
import { mockMatches } from "@/lib/mock-data";
import { toast } from "sonner";
import { signOut, useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

// Convert mock profiles into AirportMatch shape for demo mode
const DEMO_MATCHES: AirportMatch[] = mockMatches.map((m) => ({
  userId: `demo-${m.id}`,
  displayName: m.name,
  selfieDataUrl: m.photo,
  avatarUrl: null,
  age: m.age,
  gender: m.gender,
  interestedIn: m.interestedIn,
  nationality: m.nationality,
  zodiac: m.zodiac,
  arrivalHabit: m.arrivalHabit,
  travelStyle: m.travelStyle,
  bio: m.bio,
  hobbies: null,
  boardingTime: m.boardingTime.toISOString(),
  destinationAirport: m.destination,
  gate: m.gate,
  coincidences: m.coincidences,
}));

const NATIONALITY_FLAGS: Record<string, string> = {
  French: "🇫🇷", Italian: "🇮🇹", Spanish: "🇪🇸", German: "🇩🇪", British: "🇬🇧",
  American: "🇺🇸", Brazilian: "🇧🇷", Japanese: "🇯🇵", Korean: "🇰🇷", Chinese: "🇨🇳",
  Indian: "🇮🇳", Mexican: "🇲🇽", Australian: "🇦🇺", Canadian: "🇨🇦", Dutch: "🇳🇱",
  Swedish: "🇸🇪", Norwegian: "🇳🇴", Danish: "🇩🇰", Finnish: "🇫🇮", Portuguese: "🇵🇹",
  Greek: "🇬🇷", Turkish: "🇹🇷", Nigerian: "🇳🇬", South_African: "🇿🇦", Kenyan: "🇰🇪",
  Argentine: "🇦🇷", Colombian: "🇨🇴", Chilean: "🇨🇱", Peruvian: "🇵🇪", Singaporean: "🇸🇬",
  Thai: "🇹🇭", Vietnamese: "🇻🇳", Indonesian: "🇮🇩", Malaysian: "🇲🇾", Filipino: "🇵🇭",
  Egyptian: "🇪🇬", Moroccan: "🇲🇦", Saudi: "🇸🇦", Emirati: "🇦🇪", Qatari: "🇶🇦",
  Polish: "🇵🇱", Czech: "🇨🇿", Hungarian: "🇭🇺", Romanian: "🇷🇴", Austrian: "🇦🇹",
  Swiss: "🇨🇭", Belgian: "🇧🇪", Irish: "🇮🇪", Scottish: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", Russian: "🇷🇺",
};

function getFlag(nationality: string | null): string {
  if (!nationality) return "🌍";
  const key = nationality.replace(/\s+/g, "_");
  return NATIONALITY_FLAGS[key] ?? NATIONALITY_FLAGS[nationality] ?? "🌍";
}

export function MatchesGrid() {
  const { setScreen, openChat, preferences, activeSession } = useApp();
  const { user } = useAuth();

  const [matches, setMatches] = useState<AirportMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [aiScores, setAiScores] = useState<Record<string, { compatibility: number; reason: string }>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [openingChat, setOpeningChat] = useState<string | null>(null);

  const [profile, setProfile] = useState<{
    age: number | null;
    gender: string | null;
    interested_in: string | null;
    nationality: string | null;
    arrival_habit: string | null;
    travel_style: string | null;
    zodiac: string | null;
  } | null>(null);

  // Load current user's profile
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("age,gender,interested_in,nationality,arrival_habit,travel_style,zodiac,display_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => { if (!cancelled) setProfile(data ?? null); });
    return () => { cancelled = true; };
  }, [user]);

  // Fetch real matches at the same airport
  useEffect(() => {
    if (!activeSession) return;
    let cancelled = false;
    (async () => {
      setLoadingMatches(true);
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        const token = authSession?.access_token;
        if (!token) return;
        const result = await getAirportMatches({ data: { token, sessionId: activeSession.id } });
        if (!cancelled) {
          if (result.error) toast.error(result.error);
          else setMatches(result.matches);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load matches");
      } finally {
        if (!cancelled) setLoadingMatches(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeSession]);

  // Apply preference + mutual interest filters
  const myAge = profile?.age ?? null;
  const myGenderLower = (profile?.gender ?? "").toLowerCase();
  const myNationality = profile?.nationality ?? null;
  const myDestination = activeSession?.destinationAirport ?? null;

  const filteredMatches = matches.filter((match) => {
    const showPref = preferences.genderPref;
    if (showPref === "women" && match.gender?.toLowerCase() !== "woman") return false;
    if (showPref === "men" && match.gender?.toLowerCase() !== "man") return false;

    // Mutual interest check
    if (myGenderLower && match.interestedIn) {
      const wants = match.interestedIn.toLowerCase();
      if (wants === "women" && myGenderLower !== "woman") return false;
      if (wants === "men" && myGenderLower !== "man") return false;
    }

    // Age range
    if (myAge && match.age && preferences.ageRange !== "any") {
      const range = parseInt(preferences.ageRange, 10);
      if (!Number.isNaN(range) && Math.abs(match.age - myAge) > range) return false;
    }

    // Nationality preference
    if (myNationality && preferences.nationality !== "any") {
      const same = match.nationality === myNationality;
      if (preferences.nationality === "same" && !same) return false;
      if (preferences.nationality === "different" && same) return false;
    }

    // Destination preference
    if (myDestination && preferences.destination !== "any") {
      const sameDestination = match.destinationAirport === myDestination;
      if (preferences.destination === "same" && !sameDestination) return false;
      if (preferences.destination === "different" && sameDestination) return false;
    }

    return true;
  });

  const fetchAIScores = useCallback(async () => {
    if (filteredMatches.length === 0 || !profile) return;
    setAiLoading(true);
    try {
      const result = await getAICompatibility({
        data: {
          user: {
            name: user?.email?.split("@")[0] ?? "You",
            age: profile.age ?? 28,
            gender: profile.gender ?? "Person",
            interests:
              preferences.genderPref === "everyone"
                ? "Everyone"
                : preferences.genderPref === "women"
                ? "Women"
                : "Men",
            arrivalHabit: profile.arrival_habit ?? "On time",
            travelStyle: profile.travel_style ?? "Explorer",
            zodiac: profile.zodiac ?? "Unknown",
            destination: activeSession?.destinationAirport ?? "Unknown",
          },
          candidates: filteredMatches.map((m) => ({
            name: m.displayName ?? "Unknown",
            age: m.age ?? 25,
            gender: m.gender ?? "Person",
            nationality: m.nationality ?? "Unknown",
            arrivalHabit: m.arrivalHabit ?? "On time",
            travelStyle: m.travelStyle ?? "Explorer",
            zodiac: m.zodiac ?? "Unknown",
            destination: m.destinationAirport,
            bio: m.bio ?? "Traveller at heart",
            coincidences: m.coincidences,
          })),
          preferences,
        },
      });
      if (result.error) toast.error(result.error);
      if (result.results.length > 0) {
        const scores: Record<string, { compatibility: number; reason: string }> = {};
        result.results.forEach((r) => {
          scores[r.candidateName] = { compatibility: r.compatibility, reason: r.reason };
        });
        setAiScores(scores);
      }
    } catch {
      // AI scoring is non-critical
    } finally {
      setAiLoading(false);
    }
  }, [filteredMatches.length, preferences, profile, activeSession, user]);

  useEffect(() => {
    if (filteredMatches.length > 0 && profile) fetchAIScores();
  }, [filteredMatches.length, profile]);

  const getCompatibility = (match: AirportMatch): number => {
    const aiScore = aiScores[match.displayName ?? ""];
    if (aiScore) return aiScore.compatibility;
    if (match.userId.startsWith("demo-")) {
      const mockId = match.userId.replace("demo-", "");
      return mockMatches.find((m) => m.id === mockId)?.compatibility ?? 75;
    }
    return 75;
  };

  // Fall back to demo data when the airport is empty
  const isDemoMode = !loadingMatches && filteredMatches.length === 0;
  const displayMatches = isDemoMode
    ? DEMO_MATCHES.filter((m) => {
        const showPref = preferences.genderPref;
        if (showPref === "women" && m.gender?.toLowerCase() !== "woman") return false;
        if (showPref === "men" && m.gender?.toLowerCase() !== "man") return false;
        return true;
      })
    : filteredMatches;

  const sortedMatches = [...displayMatches].sort(
    (a, b) => getCompatibility(b) - getCompatibility(a)
  );

  const handleMatchClick = async (match: AirportMatch) => {
    if (openingChat) return;

    const partner: ChatPartner = {
      userId: match.userId,
      displayName: match.displayName,
      selfieDataUrl: match.selfieDataUrl,
      avatarUrl: match.avatarUrl,
      nationality: match.nationality,
      boardingTime: match.boardingTime,
      destinationAirport: match.destinationAirport,
      gate: match.gate,
      coincidences: match.coincidences,
      bio: match.bio,
    };

    // Demo match — open chat locally without touching the DB
    if (match.userId.startsWith("demo-")) {
      openChat(`demo-${match.userId}`, partner);
      return;
    }

    setOpeningChat(match.userId);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const token = authSession?.access_token;
      if (!token) { toast.error("Not signed in"); return; }

      const result = await openConversation({ data: { token, targetUserId: match.userId } });
      if (result.error || !result.conversationId) {
        toast.error(result.error ?? "Could not open conversation");
        return;
      }
      openChat(result.conversationId, partner);
    } catch {
      toast.error("Failed to open conversation");
    } finally {
      setOpeningChat(null);
    }
  };

  const isLoading = loadingMatches || aiLoading;

  return (
    <div className="min-h-screen bg-gradient-midnight px-4 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-midnight/80 backdrop-blur-xl pt-6 pb-4 px-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gradient-coral">Flyrting</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" />
              <span>
                {activeSession
                  ? `${activeSession.departureAirport} → ${activeSession.destinationAirport}`
                  : "No active session"}
              </span>
              {activeSession?.gate && (
                <>
                  <span className="mx-1">•</span>
                  <Plane className="h-3 w-3" />
                  <span>Gate {activeSession.gate}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isLoading && <Loader2 className="h-4 w-4 text-coral animate-spin" />}
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
        {aiLoading && (
          <div className="mt-2 text-[10px] text-coral uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> AI is analyzing compatibility…
          </div>
        )}
      </div>


      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {sortedMatches.map((match, i) => {
          const compat = getCompatibility(match);
          const aiReason = aiScores[match.displayName ?? ""]?.reason;
          const photo = match.selfieDataUrl ?? match.avatarUrl;
          const isOpening = openingChat === match.userId;

          return (
            <motion.button
              key={match.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleMatchClick(match)}
              disabled={!!openingChat}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border text-left transition-all hover:border-coral/40 hover:glow-coral"
            >
              {/* Photo */}
              <div className="relative aspect-[3/4] overflow-hidden bg-card">
                {photo ? (
                  <img
                    src={photo}
                    alt={match.displayName ?? ""}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <UserIcon className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
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
                  {getFlag(match.nationality)}
                </div>

                {/* Hover overlay */}
                {match.bio && (
                  <div className="absolute inset-0 bg-midnight/92 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col p-3 pointer-events-none">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-base font-bold text-white">{match.displayName}</span>
                      <span className="text-xs text-white/80">
                        {match.age && `${match.age} · `}{match.nationality}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/90 mt-2 leading-snug line-clamp-4">{match.bio}</p>
                    <div className="mt-auto space-y-1 text-[10px] text-white/80">
                      {match.travelStyle && (
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-2.5 w-2.5 text-coral shrink-0" />
                          <span className="truncate">{match.travelStyle}</span>
                        </div>
                      )}
                      {(match.zodiac || match.arrivalHabit) && (
                        <div className="flex items-center gap-1.5">
                          <Plane className="h-2.5 w-2.5 text-coral shrink-0" />
                          <span className="truncate">
                            {[match.zodiac, match.arrivalHabit].filter(Boolean).join(" · ")}
                          </span>
                        </div>
                      )}
                      {aiReason && <p className="text-coral italic line-clamp-2 pt-1">{aiReason}</p>}
                    </div>
                  </div>
                )}

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-lg font-bold text-white drop-shadow">
                          {match.displayName ?? "Traveller"}
                        </span>
                        {match.age && <span className="text-sm text-white/85">{match.age}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-white/85">
                        <Plane className="h-3 w-3" />
                        <span className="truncate">{match.destinationAirport}</span>
                        {match.gate && <span>· Gate {match.gate}</span>}
                      </div>
                      <CompatibilityBadge percentage={compat} className="mt-1.5" />
                    </div>
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <span className="text-[9px] text-white/85 uppercase tracking-wider leading-tight text-center">
                        Boards in
                      </span>
                      {isOpening ? (
                        <Loader2 className="h-6 w-6 text-coral animate-spin" />
                      ) : (
                        <CountdownTimer targetTime={new Date(match.boardingTime)} variant="clock" size="sm" />
                      )}
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
