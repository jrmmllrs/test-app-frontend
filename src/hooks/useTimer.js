import { useState, useEffect, useRef } from "react";

export const useTimer = (initialTime, onTimeout) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const startedRef = useRef(false); // ← NEW FLAG

  // Reset timer when test loads
  useEffect(() => {
    setTimeLeft(initialTime);
    startedRef.current = initialTime > 0; // mark as started only when we get valid time
  }, [initialTime]);

  // Countdown logic
  useEffect(() => {
    if (!startedRef.current) return; // do nothing until timer truly starts

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && onTimeout) {
      onTimeout();
      startedRef.current = false; // prevent multiple calls
    }
  }, [timeLeft, onTimeout]);

  return timeLeft;
};
