import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AppContext,
  type AppScreen,
  type UserPreferences,
  type SessionData,
  type ChatPartner,
  defaultPreferences,
} from "@/lib/app-state";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { SignupScreen } from "@/components/SignupScreen";
import { BoardingPassScreen } from "@/components/BoardingPassScreen";
import { PreferencesScreen } from "@/components/PreferencesScreen";
import { MatchesGrid } from "@/components/MatchesGrid";
import { ChatScreen } from "@/components/ChatScreen";
import { FlightExtensionScreen } from "@/components/FlightExtensionScreen";
import { PostDateScreen } from "@/components/PostDateScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { ChatsListScreen } from "@/components/ChatsListScreen";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { getActiveSession } from "@/lib/session.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Flyrting — Love at First Flight" },
      { name: "description", content: "Meet amazing people at your airport gate. Every connection has a countdown." },
      { property: "og:title", content: "Flyrting — Love at First Flight" },
      { property: "og:description", content: "The dating app that only works at airports." },
    ],
  }),
});

function Index() {
  const [screen, setScreen] = useState<AppScreen>("welcome");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatPartner, setActiveChatPartner] = useState<ChatPartner | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [openedChats, setOpenedChats] = useState<string[]>([]);
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);

  const { user, loading } = useAuth();
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const onProfileScreen = screen === "profile";

  // Check profile completion whenever the user changes or returns from the profile screen
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setProfileChecked(true);
      setProfileCompleted(null);
      return;
    }
    if (profileCompleted === null) setProfileChecked(false);
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("id", user.id)
        .maybeSingle();
      setProfileCompleted(!!data?.profile_completed);
      setProfileChecked(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, onProfileScreen]);

  // Restore active session from DB when a returning user logs in
  useEffect(() => {
    if (!user || activeSession) return;
    (async () => {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const token = authSession?.access_token;
      if (!token) return;
      const result = await getActiveSession({ data: { token } });
      if (result.session) {
        const s = result.session as {
          id: string;
          flight_number: string;
          departure_airport: string;
          destination_airport: string;
          boarding_time: string;
          gate: string | null;
          passenger_name: string | null;
          location_verified: boolean;
        };
        setActiveSession({
          id: s.id,
          flightNumber: s.flight_number,
          departureAirport: s.departure_airport,
          destinationAirport: s.destination_airport,
          boardingTime: s.boarding_time,
          gate: s.gate,
          passengerName: s.passenger_name,
          locationVerified: s.location_verified,
        });
      }
    })();
  }, [user, activeSession]);

  // Route based on auth + profile state
  useEffect(() => {
    if (loading || !profileChecked) return;
    if (!user) {
      setScreen("welcome");
      return;
    }
    if (profileCompleted === false && screen !== "profile") {
      setScreen("profile");
      return;
    }
    if (profileCompleted && (screen === "welcome" || screen === "signup")) {
      setScreen(activeSession ? "matches" : "boarding-pass");
    }
  }, [user, loading, profileChecked, profileCompleted, screen, activeSession]);

  if (loading || (user && !profileChecked)) {
    return (
      <div className="mx-auto max-w-md min-h-screen flex items-center justify-center bg-gradient-midnight">
        <Loader2 className="h-8 w-8 text-coral animate-spin" />
      </div>
    );
  }

  const openChat = (conversationId: string, partner: ChatPartner) => {
    setActiveChatId(conversationId);
    setActiveChatPartner(partner);
    setOpenedChats((prev) => (prev.includes(conversationId) ? prev : [...prev, conversationId]));
    setScreen("chat");
  };

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        activeChatId,
        setActiveChatId,
        activeChatPartner,
        setActiveChatPartner,
        preferences,
        setPreferences,
        openedChats,
        openChat,
        activeSession,
        setActiveSession,
      }}
    >
      <div className="mx-auto max-w-md min-h-screen">
        {screen === "welcome" && <WelcomeScreen />}
        {screen === "signup" && <SignupScreen />}
        {screen === "boarding-pass" && <BoardingPassScreen />}
        {screen === "preferences" && <PreferencesScreen />}
        {screen === "matches" && <MatchesGrid />}
        {screen === "chat" && <ChatScreen />}
        {screen === "extend-flight" && <FlightExtensionScreen />}
        {screen === "post-date" && <PostDateScreen />}
        {screen === "profile" && <ProfileScreen isOnboarding={profileCompleted === false} />}
        {screen === "chats-list" && <ChatsListScreen />}
      </div>
    </AppContext.Provider>
  );
}
