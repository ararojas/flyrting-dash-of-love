import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetTime: Date;
  className?: string;
  urgent?: boolean;
  /**
   * "inline" — text only (legacy compact display)
   * "clock"  — bigger circular clock with gradient color by time-left
   */
  variant?: "inline" | "clock";
  size?: "sm" | "md" | "lg";
}

export function CountdownTimer({
  targetTime,
  className = "",
  urgent,
  variant = "inline",
  size = "md",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const totalMinutes = timeLeft.totalMinutes;
  const tone = getTone(totalMinutes, urgent);

  if (variant === "inline") {
    return (
      <div
        className={`font-body font-semibold tabular-nums ${tone.textClass} ${tone.pulse ? "timer-pulse" : ""} ${className}`}
      >
        {timeLeft.hours > 0 && <span>{timeLeft.hours}h </span>}
        <span>{timeLeft.minutes}m</span>
        <span className="text-xs opacity-70"> {timeLeft.seconds}s</span>
      </div>
    );
  }

  const sizeMap = {
    sm: { box: "h-16 w-16", icon: "h-4 w-4", time: "text-xs", label: "text-[8px]" },
    md: { box: "h-24 w-24", icon: "h-5 w-5", time: "text-base", label: "text-[9px]" },
    lg: { box: "h-32 w-32", icon: "h-6 w-6", time: "text-xl", label: "text-[10px]" },
  }[size];

  // 6 hours = 360 minutes is full ring
  const progress = Math.min(1, totalMinutes / 360);
  const ringStyle = {
    background: `conic-gradient(${tone.ringColor} ${progress * 360}deg, oklch(0.28 0.04 260) 0deg)`,
  };

  return (
    <div
      className={`relative ${sizeMap.box} rounded-full p-[3px] ${tone.glow} ${tone.pulse ? "timer-pulse" : ""} ${className}`}
      style={ringStyle}
    >
      <div className="h-full w-full rounded-full bg-card flex flex-col items-center justify-center gap-0.5">
        <Clock className={`${sizeMap.icon} ${tone.textClass}`} />
        <div className={`font-body font-bold tabular-nums ${sizeMap.time} ${tone.textClass} leading-none`}>
          {timeLeft.hours > 0 ? `${timeLeft.hours}h ${timeLeft.minutes}m` : `${timeLeft.minutes}m`}
        </div>
        <span className={`${sizeMap.label} uppercase tracking-wider text-muted-foreground`}>
          {timeLeft.hours > 0 ? `${timeLeft.seconds}s` : `${timeLeft.seconds}s left`}
        </span>
      </div>
    </div>
  );
}

function getTone(totalMinutes: number, forceUrgent?: boolean) {
  // < 60 min  → red (urgent)
  // 60–180    → orange
  // 180–360   → yellow-green
  // >= 360    → green
  if (forceUrgent || totalMinutes < 60) {
    return {
      textClass: "text-timer-urgent",
      ringColor: "oklch(0.7 0.2 30)",
      glow: "shadow-[0_0_24px_oklch(0.7_0.2_30/40%)]",
      pulse: true,
    };
  }
  if (totalMinutes < 180) {
    return {
      textClass: "text-[oklch(0.78_0.17_55)]",
      ringColor: "oklch(0.78 0.17 55)",
      glow: "shadow-[0_0_20px_oklch(0.78_0.17_55/35%)]",
      pulse: false,
    };
  }
  if (totalMinutes < 360) {
    return {
      textClass: "text-[oklch(0.82_0.16_110)]",
      ringColor: "oklch(0.82 0.16 110)",
      glow: "shadow-[0_0_20px_oklch(0.82_0.16_110/30%)]",
      pulse: false,
    };
  }
  return {
    textClass: "text-timer",
    ringColor: "oklch(0.75 0.15 145)",
    glow: "shadow-[0_0_22px_oklch(0.75_0.15_145/35%)]",
    pulse: false,
  };
}

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const totalMinutes = Math.floor(diff / 60000);
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    totalMinutes,
  };
}
