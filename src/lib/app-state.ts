import { createContext, useContext } from "react";

export type AppScreen =
  | "welcome"
  | "signup"
  | "boarding-pass"
  | "preferences"
  | "matches"
  | "chat"
  | "extend-flight"
  | "post-date";

export interface AppState {
  screen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
}

export const AppContext = createContext<AppState>({
  screen: "welcome",
  setScreen: () => {},
  activeChatId: null,
  setActiveChatId: () => {},
});

export const useApp = () => useContext(AppContext);
