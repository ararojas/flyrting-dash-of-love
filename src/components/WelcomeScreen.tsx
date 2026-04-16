import { motion } from "framer-motion";
import { Heart, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";

export function WelcomeScreen() {
  const { setScreen } = useApp();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-midnight">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="relative mb-8"
        >
          <div className="h-24 w-24 rounded-full bg-gradient-sunset flex items-center justify-center glow-coral">
            <Plane className="h-12 w-12 text-coral-foreground" strokeWidth={1.5} />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1"
          >
            <Heart className="h-8 w-8 fill-coral text-coral" />
          </motion.div>
        </motion.div>

        <h1 className="font-display text-5xl font-bold tracking-tight">
          <span className="text-gradient-coral">Flyrting</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground font-display italic">
          Love at first flight
        </p>
        <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
          Meet incredible people at your airport gate.
          Every connection has a countdown — make the most of it.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3">
          <Button variant="coral" size="lg" className="w-full text-base py-6 rounded-xl" onClick={() => setScreen("signup")}>
            Get Started
          </Button>
          <Button variant="ghost" size="lg" className="w-full text-muted-foreground" onClick={() => setScreen("boarding-pass")}>
            I already have an account
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground/60">
          Only works at airports • Location services required
        </p>
      </motion.div>
    </div>
  );
}
