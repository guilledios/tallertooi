import { Plus } from "lucide-react";
import { useState } from "react";
import { AikenUploader } from "../components/AikenUploader";
import { TeacherDashboard } from "../components/TeacherDashboard";
import { createSession } from "../hooks/useSession";
import type { Question } from "../types";

type Props = {
  userId: string;
  initialSessionId?: string;
};

export function TeacherPage({ userId, initialSessionId }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateSession() {
    if (questions.length === 0) {
      setError("Cargá un archivo Aiken antes de crear la sesión.");
      return;
    }

    try {
      setCreating(true);
      const newSessionId = await createSession(userId, questions);
      setSessionId(newSessionId);
      window.location.hash = `#/teacher/${newSessionId}`;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo crear la sesión.");
    } finally {
      setCreating(false);
    }
  }

  if (sessionId) {
    return <TeacherDashboard sessionId={sessionId} />;
  }

  return (
    <main className="teacher-start">
      <AikenUploader onQuestionsLoaded={setQuestions} />

      <section className="panel">
        <p className="eyebrow">Sesión</p>
        <h2>Crear clase en vivo</h2>
        <p className="muted">{questions.length > 0 ? `${questions.length} preguntas listas.` : "Todavía no hay preguntas cargadas."}</p>
        {error && <p className="error">{error}</p>}
        <button className="button primary" type="button" onClick={() => void handleCreateSession()} disabled={creating || questions.length === 0}>
          <Plus size={18} />
          Crear sesión
        </button>
      </section>
    </main>
  );
}
