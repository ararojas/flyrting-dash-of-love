import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Plane, Heart } from "lucide-react";
import { mockMatches } from "@/lib/mock-data";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useApp } from "@/lib/app-state";

export function ChatsListScreen() {
  const { setScreen, openChat, openedChats } = useApp();

  // Only show matches the user has actually opened a chat with.
  const conversations = mockMatches.filter((m) => openedChats.includes(m.id));

  return (
    <div className="min-h-screen bg-gradient-midnight px-4 pb-8">
      <div className="sticky top-0 z-10 bg-midnight/80 backdrop-blur-xl pt-6 pb-4 px-2 flex items-center gap-3">
        <button onClick={() => setScreen("matches")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-coral">
          <MessageCircle className="h-5 w-5" />
          <h1 className="font-display text-2xl font-bold text-foreground">Your chats</h1>
        </div>
      </div>

      <div className="mt-2 space-y-2">
        {conversations.length === 0 && (
          <div className="flex flex-col items-center text-center mt-16 px-6">
            <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center mb-4">
              <Heart className="h-7 w-7 text-coral/60" />
            </div>
            <p className="text-sm font-medium text-foreground">No chats yet</p>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-[260px]">
              Open Flyrting and tap on someone you like — your conversations will land here.
            </p>
            <button
              onClick={() => setScreen("matches")}
              className="mt-5 rounded-xl bg-coral text-coral-foreground px-4 py-2 text-sm font-semibold glow-coral"
            >
              Browse Flyrting
            </button>
          </div>
        )}
        {conversations.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => openChat(m.id)}
            className="w-full flex items-center gap-3 rounded-2xl bg-card border border-border p-3 text-left hover:border-coral/40 transition-colors"
          >
            <img src={m.photo} alt={m.name} className="h-14 w-14 rounded-full object-cover border-2 border-coral/40" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-foreground truncate">{m.name}</span>
                <span className="text-sm">{m.nationalityFlag}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <Plane className="h-3 w-3" />
                <span className="truncate">{m.destination} • {m.gate}</span>
              </div>
              <p className="text-xs text-muted-foreground/80 truncate mt-1 italic">{m.bio}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Boards in</span>
              <CountdownTimer targetTime={m.boardingTime} variant="clock" size="sm" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}