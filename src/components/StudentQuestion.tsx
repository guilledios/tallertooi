import { Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { submitAnswer, touchParticipant, useAnswers, useSession } from "../hooks/useSession";
import { LiveBarChart } from "./LiveBarChart";
import { useAnswerStats } from "../hooks/useSession";

type Props = {
  sessionId: string;
  participantId: string;
  name: string;
};

export function StudentQuestion({ sessionId, participantId, name }: Props) {
  const { session, loading, error } = useSession(sessionId);
  const answers = useAnswers(sessionId, session?.currentQuestionIndex);
  const stats = useAnswerStats(answers, session?.questions ?? [], session?.currentQuestionIndex ?? -1);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const currentQuestion = session?.questions[session.currentQuestionIndex];
  const ownAnswer = useMemo(
    () => answers.find((answer) => answer.participantId === participantId),
    [answers, participantId]
  );

  useEffect(() => {
    setSelected(null);
  }, [session?.currentQuestionIndex]);

  useEffect(() => {
    if (!sessionId || !participantId) return;

    void touchParticipant(sessionId, participantId);
    const timer = window.setInterval(() => {
      void touchParticipant(sessionId, participantId);
    }, 30000);

    return () => window.clearInterval(timer);
  }, [participantId, sessionId]);

  async function handleSubmit() {
    if (!session || !currentQuestion || !selected || ownAnswer) return;

    try {
      setSubmitting(true);
      await submitAnswer(session, participantId, session.currentQuestionIndex, selected);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="panel">Cargando pregunta...</div>;
  if (error || !session) return <div className="panel error">{error ?? "Sesión no disponible."}</div>;
  if (session.status === "closed") return <div className="panel join-card"><h1>La sesión finalizó</h1><p className="muted">Gracias, {name}.</p></div>;

  if (!currentQuestion) {
    return (
      <div className="panel join-card">
        <p className="eyebrow">{session.id}</p>
        <h1>Esperando al docente</h1>
        <p className="muted">La primera pregunta aparecerá automáticamente.</p>
      </div>
    );
  }

  return (
    <main className="panel student-question">
      <p className="eyebrow">
        {name} · Pregunta {session.currentQuestionIndex + 1} de {session.questions.length}
      </p>
      <h1>{currentQuestion.text}</h1>

      <div className="answer-grid">
        {currentQuestion.options.map((option) => {
          const checked = selected === option.key || ownAnswer?.selectedOption === option.key;
          const correct = session.showCorrectAnswer && option.key === currentQuestion.answer;

          return (
            <button
              type="button"
              className={correct ? "answer-option correct" : checked ? "answer-option selected" : "answer-option"}
              key={option.key}
              onClick={() => setSelected(option.key)}
              disabled={Boolean(ownAnswer)}
            >
              <strong>{option.key}</strong>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>

      {ownAnswer ? (
        <div className="success">Respuesta enviada. Esperá la siguiente indicación del docente.</div>
      ) : (
        <button className="button primary full" type="button" onClick={() => void handleSubmit()} disabled={!selected || submitting}>
          <Send size={18} />
          Enviar respuesta
        </button>
      )}

      {session.showResults && (
        <section className="student-results">
          <h2>Resultados</h2>
          <LiveBarChart
            stats={stats}
            total={answers.length}
            correctAnswer={currentQuestion.answer}
            revealCorrect={session.showCorrectAnswer}
          />
        </section>
      )}
    </main>
  );
}
