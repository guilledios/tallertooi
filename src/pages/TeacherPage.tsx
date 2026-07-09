import { Plus, Save } from "lucide-react";
import { useState } from "react";
import { AikenUploader } from "../components/AikenUploader";
import { QuestionSetLibrary } from "../components/QuestionSetLibrary";
import { TeacherDashboard } from "../components/TeacherDashboard";
import { deleteQuestionSet, saveQuestionSet, useQuestionSets } from "../hooks/useQuestionSets";
import { createSession } from "../hooks/useSession";
import type { Question } from "../types";

type Props = {
  userId: string;
  initialSessionId?: string;
};

export function TeacherPage({ userId, initialSessionId }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { questionSets, error: questionSetsError } = useQuestionSets(userId);

  async function handleCreateSession(nextQuestions = questions) {
    if (nextQuestions.length === 0) {
      setError("Cargá un archivo Aiken antes de crear la sesión.");
      return;
    }

    try {
      setCreating(true);
      const newSessionId = await createSession(userId, nextQuestions);
      setSessionId(newSessionId);
      window.location.hash = `#/teacher/${newSessionId}`;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo crear la sesión.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveQuestionSet() {
    if (questions.length === 0) {
      setError("Cargá preguntas antes de guardar el simulacro.");
      return;
    }

    if (!selectedTitle.trim()) {
      setError("Poné un nombre para el simulacro.");
      return;
    }

    try {
      setSaving(true);
      await saveQuestionSet(userId, selectedTitle.trim(), questions);
      setError(null);
      setSuccess("Simulacro guardado.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar el simulacro.");
    } finally {
      setSaving(false);
    }
  }

  function handleQuestionsLoaded(nextQuestions: Question[]) {
    setQuestions(nextQuestions);
    setSelectedTitle("");
    setSuccess(null);
    setError(null);
  }

  function handleUseQuestionSet(nextQuestions: Question[], title: string) {
    setQuestions(nextQuestions);
    setSelectedTitle(title);
    setSuccess(`Simulacro seleccionado: ${title}`);
    setError(null);
  }

  async function handleDeleteQuestionSet(questionSetId: string) {
    try {
      await deleteQuestionSet(questionSetId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo eliminar el simulacro.");
    }
  }

  if (sessionId) {
    return <TeacherDashboard sessionId={sessionId} />;
  }

  return (
    <main className="teacher-start">
      <AikenUploader onQuestionsLoaded={handleQuestionsLoaded} />

      <section className="panel session-start-panel">
        <p className="eyebrow">Sesión</p>
        <h2>Crear clase en vivo</h2>
        <p className="muted">{questions.length > 0 ? `${questions.length} preguntas listas.` : "Todavía no hay preguntas cargadas."}</p>
        <label>
          Nombre del simulacro
          <input
            value={selectedTitle}
            onChange={(event) => setSelectedTitle(event.target.value)}
            placeholder="Ej: Repaso final TOOI"
          />
        </label>
        {error && <p className="error">{error}</p>}
        {questionSetsError && <p className="error">{questionSetsError}</p>}
        {success && <p className="success">{success}</p>}
        <div className="action-row">
          <button className="button primary" type="button" onClick={() => void handleCreateSession()} disabled={creating || questions.length === 0}>
            <Plus size={18} />
            Crear sesión
          </button>
          <button className="button secondary" type="button" onClick={() => void handleSaveQuestionSet()} disabled={saving || questions.length === 0}>
            <Save size={18} />
            Guardar simulacro
          </button>
        </div>
      </section>

      <QuestionSetLibrary
        questionSets={questionSets}
        onUse={handleUseQuestionSet}
        onCreateSession={(nextQuestions) => void handleCreateSession(nextQuestions)}
        onDelete={(questionSetId) => void handleDeleteQuestionSet(questionSetId)}
      />
    </main>
  );
}
