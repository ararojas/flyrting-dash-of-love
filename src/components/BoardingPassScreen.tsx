import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, MapPin, Plane, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";

export function BoardingPassScreen() {
  const { setScreen } = useApp();
  const [uploaded, setUploaded] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-midnight">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center max-w-sm w-full"
      >
        <div className="h-20 w-20 rounded-2xl bg-card flex items-center justify-center mb-6 border border-border">
          <ScanLine className="h-10 w-10 text-coral" />
        </div>

        <h1 className="font-display text-3xl font-bold">Verify Your Flight</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Upload your boarding pass and enable location to start flyrting
        </p>

        <div className="w-full mt-8 space-y-4">
          {/* Boarding pass upload */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setUploaded(true)}
            className={`w-full rounded-2xl border-2 border-dashed p-6 text-left transition-all ${
              uploaded
                ? "border-timer bg-timer/10"
                : "border-coral/30 bg-card hover:border-coral/60"
            }`}
          >
            <div className="flex items-center gap-4">
              {uploaded ? (
                <div className="h-12 w-12 rounded-xl bg-timer/20 flex items-center justify-center">
                  <Plane className="h-6 w-6 text-timer" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-xl bg-coral/20 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-coral" />
                </div>
              )}
              <div>
                <p className="font-semibold text-foreground">
                  {uploaded ? "Boarding pass verified ✓" : "Upload Boarding Pass"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {uploaded
                    ? "CDG → BCN • Gate B14 • 14:35"
                    : "Photo, PDF, or scan"}
                </p>
              </div>
            </div>
          </motion.button>

          {/* Location */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocationGranted(true)}
            className={`w-full rounded-2xl border-2 border-dashed p-6 text-left transition-all ${
              locationGranted
                ? "border-timer bg-timer/10"
                : "border-coral/30 bg-card hover:border-coral/60"
            }`}
          >
            <div className="flex items-center gap-4">
              {locationGranted ? (
                <div className="h-12 w-12 rounded-xl bg-timer/20 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-timer" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-xl bg-coral/20 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-coral" />
                </div>
              )}
              <div>
                <p className="font-semibold text-foreground">
                  {locationGranted ? "Airport confirmed ✓" : "Enable Location"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locationGranted
                    ? "Charles de Gaulle Airport (CDG)"
                    : "We need to confirm you're at an airport"}
                </p>
              </div>
            </div>
          </motion.button>
        </div>

        <Button
          variant="coral"
          size="lg"
          className="w-full mt-8 rounded-xl py-6"
          disabled={!uploaded || !locationGranted}
          onClick={() => setScreen("preferences")}
        >
          Start Flyrting
        </Button>
      </motion.div>
    </div>
  );
}
