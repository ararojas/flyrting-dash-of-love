import { useState } from "react";
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
      </div>
    </AppContext.Provider>
  );
}
