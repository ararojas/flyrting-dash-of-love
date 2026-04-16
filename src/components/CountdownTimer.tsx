import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetTime: Date;
  className?: string;
  urgent?: boolean;
}

export function CountdownTimer({ targetTime, className = "", urgent }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const isUrgent = urgent ?? timeLeft.totalMinutes < 30;
  const timerColor = isUrgent ? "text-timer-urgent timer-pulse" : "text-timer";

  return (
    <div className={`font-body font-semibold tabular-nums ${timerColor} ${className}`}>
      {timeLeft.hours > 0 && <span>{timeLeft.hours}h </span>}
      <span>{timeLeft.minutes}m</span>
      <span className="text-xs opacity-70"> {timeLeft.seconds}s</span>
    </div>
  );
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
