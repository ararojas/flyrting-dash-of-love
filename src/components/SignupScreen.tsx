import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Camera, User, Compass, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";

const ZODIAC_SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

export function SignupScreen() {
  const { setScreen } = useApp();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [interests, setInterests] = useState("");
  const [arrivalHabit, setArrivalHabit] = useState("");
  const [zodiac, setZodiac] = useState("");
  const [travelStyle, setTravelStyle] = useState("");

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraReady(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setCameraError("Camera access denied. Please allow camera in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCameraError("Your camera is busy in another app or tab. Close it and try again.");
      } else {
        setCameraError("Could not access camera. Try again.");
      }
    }
  }, []);

  const takeSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setCameraError("Camera is still loading. Wait a second and try capture again.");
      return;
    }

    const size = Math.min(width, height);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCameraError("Could not capture photo. Try again.");
      return;
    }

    const sx = (width - size) / 2;
    const sy = (height - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    if (dataUrl === "data:,") {
      setCameraError("Photo capture failed. Please try again.");
      return;
    }

    setSelfieData(dataUrl);
    setCameraError(null);
    stopCamera();
  }, [stopCamera]);

  const retakeSelfie = useCallback(() => {
    setSelfieData(null);
    setCameraError(null);
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (step !== 3) {
      stopCamera();
    }
  }, [step, stopCamera]);

  useEffect(() => {
    if (!cameraActive || !streamRef.current || !videoRef.current) return;

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    const markReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setCameraReady(true);
        setCameraError(null);
      }
    };

    video.onloadedmetadata = () => {
      video.play().then(markReady).catch(() => {
        setCameraError("Camera preview could not start. Try again.");
      });
    };

    if (video.readyState >= 1) {
      video.play().then(markReady).catch(() => {
        setCameraError("Camera preview could not start. Try again.");
      });
    }

    return () => {
      video.onloadedmetadata = null;
    };
  }, [cameraActive]);

  const steps = [
    {
      icon: <User className="h-8 w-8" />,
      title: "Who are you?",
      subtitle: "Let's get the basics",
      content: (
        <div className="flex flex-col gap-4">
          <input className="rounded-xl bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          <input className="rounded-xl bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral" placeholder="Age" type="number" value={age} onChange={e => setAge(e.target.value)} />
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">What's your gender?</p>
            <div className="grid grid-cols-3 gap-2">
              {["Woman", "Man", "Non-binary"].map(g => (
                <button key={g} onClick={() => setGender(g)} className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${gender === g ? "bg-coral text-coral-foreground glow-coral" : "bg-input text-muted-foreground hover:bg-accent"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Who do you want to match with?</p>
            <div className="grid grid-cols-3 gap-2">
              {["Women", "Men", "Everyone"].map(i => (
                <button key={i} onClick={() => setInterests(i)} className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${interests === i ? "bg-coral text-coral-foreground glow-coral" : "bg-input text-muted-foreground hover:bg-accent"}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <Compass className="h-8 w-8" />,
      title: "Your travel persona",
      subtitle: "How do you fly?",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">When do you arrive at the airport?</p>
          <div className="grid grid-cols-1 gap-2">
            {["3 hours early (better safe!)", "Right on time", "Running through the terminal"].map(h => (
              <button key={h} onClick={() => setArrivalHabit(h)} className={`rounded-xl px-4 py-3 text-sm text-left font-medium transition-all ${arrivalHabit === h ? "bg-coral text-coral-foreground glow-coral" : "bg-input text-muted-foreground hover:bg-accent"}`}>
                {h}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Travel style?</p>
          <div className="grid grid-cols-2 gap-2">
            {["Spontaneous", "Planned", "Luxury", "Backpacker"].map(s => (
              <button key={s} onClick={() => setTravelStyle(s)} className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${travelStyle === s ? "bg-coral text-coral-foreground glow-coral" : "bg-input text-muted-foreground hover:bg-accent"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "One more thing…",
      subtitle: "The stars want to know",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Your zodiac sign</p>
          <div className="grid grid-cols-3 gap-2">
            {ZODIAC_SIGNS.map(z => (
              <button key={z} onClick={() => setZodiac(z)} className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${zodiac === z ? "bg-fate text-coral-foreground glow-fate" : "bg-input text-muted-foreground hover:bg-accent"}`}>
                {z}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: <Camera className="h-8 w-8" />,
      title: "Live selfie time",
      subtitle: "No old photos allowed — show the real you",
      content: (
        <div className="flex flex-col items-center gap-6">
          <canvas ref={canvasRef} className="hidden" />

          {selfieData ? (
            <>
              <img
                src={selfieData}
                alt="Your selfie"
                className="h-48 w-48 rounded-full object-cover border-2 border-coral"
              />
              <Button variant="outline" className="rounded-xl gap-2" onClick={retakeSelfie}>
                <RotateCcw className="h-4 w-4" /> Retake
              </Button>
            </>
          ) : cameraActive ? (
            <>
              <div className="h-48 w-48 rounded-full overflow-hidden border-2 border-coral">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover scale-x-[-1]"
                />
              </div>
              {cameraError && (
                <p className="text-xs text-destructive text-center max-w-[250px]">{cameraError}</p>
              )}
              <Button variant="coral" className="rounded-xl gap-2" onClick={takeSelfie} disabled={!cameraReady}>
                <Camera className="h-4 w-4" /> {cameraReady ? "Capture" : "Starting camera…"}
              </Button>
            </>
          ) : (
            <>
              <div className="h-48 w-48 rounded-full bg-input border-2 border-dashed border-coral/40 flex items-center justify-center">
                <Camera className="h-16 w-16 text-muted-foreground/40" />
              </div>
              <Button variant="coral" className="rounded-xl gap-2" onClick={startCamera}>
                <Camera className="h-4 w-4" /> Open Camera
              </Button>
              {cameraError && (
                <p className="text-xs text-destructive text-center max-w-[250px]">{cameraError}</p>
              )}
            </>
          )}
          <p className="text-xs text-muted-foreground/60">Camera opens for a fresh photo each session</p>
        </div>
      ),
    },
  ];

  const canProceed = step === 0 ? name && age && gender && interests
    : step === 1 ? arrivalHabit && travelStyle
    : step === 2 ? zodiac
    : !!selfieData;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-midnight px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => step > 0 ? setStep(step - 1) : setScreen("welcome")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-1.5 flex-1">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-coral" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="flex-1 flex flex-col"
        >
          <div className="flex items-center gap-3 text-coral mb-2">
            {steps[step].icon}
          </div>
          <h2 className="font-display text-3xl font-bold">{steps[step].title}</h2>
          <p className="text-muted-foreground mt-1 mb-6">{steps[step].subtitle}</p>
          {steps[step].content}
        </motion.div>
      </AnimatePresence>

      {step < steps.length - 1 && (
        <div className="mt-auto pt-6">
          <Button
            variant="coral"
            size="lg"
            className="w-full rounded-xl py-6"
            disabled={!canProceed}
            onClick={() => setStep(step + 1)}
          >
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {step === steps.length - 1 && (
        <div className="mt-auto pt-6">
          <Button variant="coral" size="lg" className="w-full rounded-xl py-6" onClick={() => setScreen("boarding-pass")}>
            Complete Profile <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
