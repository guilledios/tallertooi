import { useState } from "react";
import { StudentJoin } from "../components/StudentJoin";
import { StudentQuestion } from "../components/StudentQuestion";

type Props = {
  userId: string;
  initialSessionId?: string;
};

export function StudentPage({ userId, initialSessionId }: Props) {
  const [joined, setJoined] = useState<{ sessionId: string; name: string } | null>(() => {
    const stored = sessionStorage.getItem("quiz-taller-student");
    if (!stored) return null;

    try {
      return JSON.parse(stored) as { sessionId: string; name: string };
    } catch {
      return null;
    }
  });

  function handleJoined(sessionId: string, name: string) {
    const next = { sessionId, name };
    sessionStorage.setItem("quiz-taller-student", JSON.stringify(next));
    setJoined(next);
    window.location.hash = `#/join/${sessionId}`;
  }

  if (joined && (!initialSessionId || joined.sessionId === initialSessionId)) {
    return <StudentQuestion sessionId={joined.sessionId} participantId={userId} name={joined.name} />;
  }

  return <StudentJoin initialSessionId={initialSessionId} participantId={userId} onJoined={handleJoined} />;
}
