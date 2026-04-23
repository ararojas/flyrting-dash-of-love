import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload, MapPin, Plane, ScanLine, Loader2, CheckCircle2, AlertCircle, Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";
import { parseBoardingPass, verifyLocation, createSession } from "@/lib/session.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SessionData } from "@/lib/app-state";

interface ParsedFlight {
  flightNumber: string;
  departureAirport: string;
  destinationAirport: string;
  boardingTime: string;
  gate: string | null;
  passengerName: string | null;
}

export function BoardingPassScreen() {
  const { setScreen, setActiveSession } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedFlight | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Manual fallback fields
  const [manual, setManual] = useState(false);
  const [manualFlight, setManualFlight] = useState({
    flightNumber: "",
    departureAirport: "",
    destinationAirport: "",
    boardingTime: "",
    gate: "",
  });

  const [locating, setLocating] = useState(false);
  const [detectedAirport, setDetectedAirport] = useState<{
    code: string; name: string; city: string;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const flightData = manual
    ? {
        flightNumber: manualFlight.flightNumber,
        departureAirport: manualFlight.departureAirport,
        destinationAirport: manualFlight.destinationAirport,
        boardingTime: manualFlight.boardingTime,
        gate: manualFlight.gate || null,
        passengerName: null,
      }
    : parsed;

  const boardingPassReady = !!(
    flightData?.flightNumber &&
    flightData?.departureAirport?.length === 3 &&
    flightData?.destinationAirport?.length === 3 &&
    flightData?.boardingTime
  );

  // ── Upload & parse boarding pass ────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setParseError(null);
    setParsed(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const imageDataUrl = reader.result as string;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) { setParsing(false); setParseError("Not signed in"); return; }

        const result = await parseBoardingPass({ data: { token, imageDataUrl } });
        if (result.error || !result.parsed) {
          setParseError(result.error ?? "Could not read boarding pass — please enter details manually");
          setManual(true);
        } else {
          setParsed(result.parsed);
        }
      } catch {
        setParseError("Scan failed — please enter details manually");
        setManual(true);
      } finally {
        setParsing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // ── Detect location ──────────────────────────────────────────────────────────
  const handleLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await verifyLocation({
            data: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          });
          if (result.airport) {
            setDetectedAirport(result.airport);
          } else {
            setLocationError("No airport detected nearby. Make sure you're at an airport.");
          }
        } catch {
          setLocationError("Location check failed");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Please enable it in your browser settings.");
        } else {
          setLocationError("Could not determine your location");
        }
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  // ── Create session & proceed ─────────────────────────────────────────────────
  const handleStart = async () => {
    if (!flightData || !boardingPassReady) return;
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { toast.error("Not signed in"); setSubmitting(false); return; }

      const result = await createSession({
        data: {
          token,
          flightNumber: flightData.flightNumber,
          departureAirport: flightData.departureAirport.toUpperCase(),
          destinationAirport: flightData.destinationAirport.toUpperCase(),
          boardingTime: flightData.boardingTime,
          gate: flightData.gate ?? null,
          passengerName: flightData.passengerName ?? null,
          locationVerified: !!detectedAirport,
        },
      });

      if (result.error) { toast.error(result.error); setSubmitting(false); return; }

      const s = result.session as {
        id: string; flight_number: string; departure_airport: string;
        destination_airport: string; boarding_time: string;
        gate: string | null; passenger_name: string | null;
        location_verified: boolean;
      };

      const sessionData: SessionData = {
        id: s.id,
        flightNumber: s.flight_number,
        departureAirport: s.departure_airport,
        destinationAirport: s.destination_airport,
        boardingTime: s.boarding_time,
        gate: s.gate,
        passengerName: s.passenger_name,
        locationVerified: s.location_verified,
      };
      setActiveSession(sessionData);
      setScreen("preferences");
    } catch {
      toast.error("Failed to start session. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayAirport = detectedAirport
    ? `${detectedAirport.name} (${detectedAirport.code})`
    : parsed
    ? `Departing ${parsed.departureAirport}`
    : null;

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
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing}
              className={`w-full rounded-2xl border-2 border-dashed p-6 text-left transition-all ${
                boardingPassReady
                  ? "border-timer bg-timer/10"
                  : "border-coral/30 bg-card hover:border-coral/60"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${boardingPassReady ? "bg-timer/20" : "bg-coral/20"}`}>
                  {parsing ? (
                    <Loader2 className="h-6 w-6 text-coral animate-spin" />
                  ) : boardingPassReady ? (
                    <Plane className="h-6 w-6 text-timer" />
                  ) : (
                    <Upload className="h-6 w-6 text-coral" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">
                    {parsing
                      ? "Scanning boarding pass…"
                      : boardingPassReady
                      ? "Boarding pass verified ✓"
                      : "Upload Boarding Pass"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {boardingPassReady && flightData
                      ? `${flightData.flightNumber} · ${flightData.departureAirport} → ${flightData.destinationAirport}${flightData.gate ? ` · Gate ${flightData.gate}` : ""}`
                      : "Photo, PDF, or scan"}
                  </p>
                </div>
              </div>
            </motion.button>

            {parseError && (
              <div className="flex items-start gap-2 mt-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Manual entry toggle */}
            {!manual && (
              <button
                onClick={() => setManual(true)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Edit3 className="h-3 w-3" /> Enter details manually
              </button>
            )}
          </div>

          {/* Manual entry form */}
          {manual && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-2xl bg-card border border-border p-4 space-y-3 text-left"
            >
              <p className="text-sm font-semibold text-foreground">Flight details</p>
              {[
                { label: "Flight number (e.g. AF1234)", key: "flightNumber", placeholder: "AF1234" },
                { label: "Departure airport (IATA)", key: "departureAirport", placeholder: "CDG" },
                { label: "Destination airport (IATA)", key: "destinationAirport", placeholder: "BCN" },
                { label: "Gate (optional)", key: "gate", placeholder: "B14" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</label>
                  <input
                    value={manualFlight[key as keyof typeof manualFlight]}
                    onChange={(e) =>
                      setManualFlight((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className="mt-1 w-full rounded-lg bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral"
                  />
                </div>
              ))}
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Boarding time
                </label>
                <input
                  type="datetime-local"
                  value={manualFlight.boardingTime}
                  onChange={(e) =>
                    setManualFlight((prev) => ({
                      ...prev,
                      boardingTime: new Date(e.target.value).toISOString(),
                    }))
                  }
                  className="mt-1 w-full rounded-lg bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-coral"
                />
              </div>
            </motion.div>
          )}

          {/* Location */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLocation}
            disabled={locating}
            className={`w-full rounded-2xl border-2 border-dashed p-6 text-left transition-all ${
              detectedAirport
                ? "border-timer bg-timer/10"
                : "border-coral/30 bg-card hover:border-coral/60"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${detectedAirport ? "bg-timer/20" : "bg-coral/20"}`}>
                {locating ? (
                  <Loader2 className="h-6 w-6 text-coral animate-spin" />
                ) : detectedAirport ? (
                  <CheckCircle2 className="h-6 w-6 text-timer" />
                ) : (
                  <MapPin className="h-6 w-6 text-coral" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {locating
                    ? "Detecting airport…"
                    : detectedAirport
                    ? "Airport confirmed ✓"
                    : "Enable Location"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {detectedAirport
                    ? displayAirport
                    : "We need to confirm you're at an airport"}
                </p>
              </div>
            </div>
          </motion.button>

          {locationError && (
            <div className="flex items-start gap-2 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}
        </div>

        <Button
          variant="coral"
          size="lg"
          className="w-full mt-8 rounded-xl py-6"
          disabled={!boardingPassReady || submitting}
          onClick={handleStart}
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting…</>
          ) : (
            "Start Flyrting"
          )}
        </Button>

        {!detectedAirport && boardingPassReady && (
          <p className="text-xs text-muted-foreground mt-3">
            Location is optional — enable it to confirm your airport and unlock coincidence detection
          </p>
        )}
      </motion.div>
    </div>
  );
}
