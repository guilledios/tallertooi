import { useEffect, useState } from "react";
import type { Timestamp } from "firebase/firestore";

export function useCountdown(target?: Timestamp | null) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => secondsUntil(target));

  useEffect(() => {
    setRemainingSeconds(secondsUntil(target));

    if (!target) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds(secondsUntil(target));
    }, 250);

    return () => window.clearInterval(timer);
  }, [target]);

  return remainingSeconds;
}

function secondsUntil(target?: Timestamp | null) {
  if (!target) {
    return null;
  }

  return Math.max(0, Math.ceil((target.toMillis() - Date.now()) / 1000));
}
