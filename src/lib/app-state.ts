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

export interface SessionData {
  id: string;
  flightNumber: string;
  departureAirport: string;
  destinationAirport: string;
  boardingTime: string; // ISO string
  gate: string | null;
  passengerName: string | null;
  locationVerified: boolean;
}

export interface ChatPartner {
  userId: string;
  displayName: string | null;
  selfieDataUrl: string | null;
  avatarUrl: string | null;
  nationality: string | null;
  boardingTime: string | null;   // ISO string
  destinationAirport: string | null;
  gate: string | null;
  coincidences: number;
  bio: string | null;
}

export interface AppState {
  screen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  activeChatId: string | null;   // conversationId (UUID)
  setActiveChatId: (id: string | null) => void;
  activeChatPartner: ChatPartner | null;
  setActiveChatPartner: (partner: ChatPartner | null) => void;
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  /** conversationIds the user has opened */
  openedChats: string[];
  openChat: (conversationId: string, partner: ChatPartner) => void;
  activeSession: SessionData | null;
  setActiveSession: (session: SessionData | null) => void;
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
  activeChatPartner: null,
  setActiveChatPartner: () => {},
  preferences: defaultPreferences,
  setPreferences: () => {},
  openedChats: [],
  openChat: () => {},
  activeSession: null,
  setActiveSession: () => {},
});

export const useApp = () => useContext(AppContext);
