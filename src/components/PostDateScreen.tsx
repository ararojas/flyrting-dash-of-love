import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Phone, Star } from "lucide-react";
import { mockMatches } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";

export function PostDateScreen() {
  const { setScreen, activeChatId } = useApp();
  const match = mockMatches.find(m => m.id === activeChatId) || mockMatches[0];
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-midnight">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex flex-col items-center text-center"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-24 w-24 rounded-full bg-timer/20 flex items-center justify-center"
            >
              <Phone className="h-12 w-12 text-timer" />
            </motion.div>
          </div>
          <h1 className="font-display text-3xl font-bold">It's a match! 💕</h1>
          <p className="text-muted-foreground mt-2">
            Both of you had a great time. Here's {match.name}'s number:
          </p>
          <p className="mt-4 font-display text-2xl font-bold text-gold">+39 347 XXX XXXX</p>
          <p className="text-xs text-muted-foreground mt-2">
            {match.name} also received your number
          </p>
          <Button variant="coral" className="mt-8 rounded-xl" onClick={() => setScreen("matches")}>
            Back to Matches
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-midnight">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <img src={match.photo} alt={match.name} className="h-24 w-24 rounded-full object-cover border-2 border-coral mb-4" />
        <h1 className="font-display text-3xl font-bold">How was your date?</h1>
        <p className="text-muted-foreground mt-2">
          Rate your time with {match.name}
        </p>

        <div className="flex gap-2 mt-6">
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} onClick={() => setRating(i)} className="transition-transform hover:scale-110">
              <Star className={`h-10 w-10 ${i <= rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`} />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 w-full">
            <p className="text-sm text-muted-foreground mb-4">
              {rating >= 4 ? "✨ Amazing! If they feel the same, we'll exchange numbers" : rating >= 3 ? "Nice! Thanks for the feedback" : "We'll keep looking for your perfect match"}
            </p>
            <Button variant="coral" size="lg" className="w-full rounded-xl py-6" onClick={() => setSubmitted(true)}>
              <Heart className="h-4 w-4 mr-2" />
              Submit Rating
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
