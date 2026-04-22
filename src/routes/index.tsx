import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppContext, type AppScreen, type UserPreferences, defaultPreferences } from "@/lib/app-state";
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
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const { user, loading } = useAuth();
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const onProfileScreen = screen === "profile";

  // Check profile completion whenever the user changes OR returns from the profile screen
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
    // Re-check when user navigates away from the profile screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, onProfileScreen]);

  // Route based on auth + profile state
  useEffect(() => {
    if (loading || !profileChecked) return;
    if (!user) {
      setScreen("welcome");
      return;
    }
    // First-time user → must create profile
    if (profileCompleted === false && screen !== "profile") {
      setScreen("profile");
      return;
    }
    // Returning user landing on auth screens → forward into the app
    if (profileCompleted && (screen === "welcome" || screen === "signup")) {
      setScreen("boarding-pass");
    }
  }, [user, loading, profileChecked, profileCompleted, screen]);

  if (loading || (user && !profileChecked)) {
    return (
      <div className="mx-auto max-w-md min-h-screen flex items-center justify-center bg-gradient-midnight">
        <Loader2 className="h-8 w-8 text-coral animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ screen, setScreen, activeChatId, setActiveChatId, preferences, setPreferences }}>
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
