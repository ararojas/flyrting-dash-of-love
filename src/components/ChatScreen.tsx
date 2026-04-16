import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Clock, Plane, Sparkles } from "lucide-react";
import { mockMatches, mockChat, type ChatMessage } from "@/lib/mock-data";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useApp } from "@/lib/app-state";

export function ChatScreen() {
  const { setScreen, activeChatId } = useApp();
  const match = mockMatches.find(m => m.id === activeChatId) || mockMatches[0];
  const [messages, setMessages] = useState<ChatMessage[]>(mockChat);
  const [input, setInput] = useState("");
  const [showExtendPopup, setShowExtendPopup] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show extend popup after 3 seconds for demo
  useEffect(() => {
    const timer = setTimeout(() => setShowExtendPopup(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = { id: `m${Date.now()}`, senderId: "me", text: input, timestamp: new Date() };
    setMessages(prev => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-midnight">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-midnight/90 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("matches")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src={match.photo} alt={match.name} className="h-10 w-10 rounded-full object-cover border-2 border-coral" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold">{match.name}</span>
              <span className="text-sm">{match.nationalityFlag}</span>
              {match.coincidences > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] bg-fate/20 text-fate rounded-full px-1.5 py-0.5">
                  <Sparkles className="h-2.5 w-2.5" /> {match.coincidences}× crossed paths
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Plane className="h-3 w-3" /> {match.destination} • {match.gate}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Boards in</p>
            <CountdownTimer targetTime={match.boardingTime} className="text-sm" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => {
          const isMe = msg.senderId === "me";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                isMe
                  ? "bg-coral text-coral-foreground rounded-br-md"
                  : "bg-card text-foreground rounded-bl-md border border-border"
              }`}>
                {msg.text}
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Extend date popup */}
      {showExtendPopup && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-2 rounded-2xl bg-card border border-gold/30 p-4 glow-gold"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-gold" />
            <span className="font-display font-bold text-gold">Time is running out!</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {match.name} boards in less than an hour. Want to extend your date?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowExtendPopup(false); setScreen("extend-flight"); }}
              className="flex-1 rounded-xl bg-gradient-sunset py-2.5 text-sm font-semibold text-coral-foreground glow-coral"
            >
              Extend Date ✈️
            </button>
            <button
              onClick={() => setShowExtendPopup(false)}
              className="rounded-xl bg-muted px-4 py-2.5 text-sm text-muted-foreground"
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-midnight/90 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Say something spontaneous…"
            className="flex-1 rounded-xl bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral"
          />
          <button
            onClick={sendMessage}
            className="h-11 w-11 rounded-xl bg-coral flex items-center justify-center text-coral-foreground hover:opacity-90 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
