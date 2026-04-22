import { createContext, useContext } from "react";

export type AppScreen =
  | "welcome"
  | "signup"
  | "boarding-pass"
  | "preferences"
  | "matches"
  | "chat"
  | "extend-flight"
  | "post-date"
  | "profile"
  | "chats-list";

export interface UserPreferences {
  nationality: string;
  destination: string;
  ageRange: string;
  genderPref: string;
}

export interface AppState {
  screen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  /** IDs of matches the user has opened a chat with. */
  openedChats: string[];
  openChat: (id: string) => void;
}

export const defaultPreferences: UserPreferences = {
  nationality: "any",
  destination: "any",
  ageRange: "any",
  genderPref: "everyone",
};

export const AppContext = createContext<AppState>({
  screen: "welcome",
  setScreen: () => {},
  activeChatId: null,
  setActiveChatId: () => {},
  preferences: defaultPreferences,
  setPreferences: () => {},
  openedChats: [],
  openChat: () => {},
});

export const useApp = () => useContext(AppContext);
