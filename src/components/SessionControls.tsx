import { Eye, EyeOff, RotateCcw, SkipForward, Square, CheckCircle2, Play, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import type { Answer, QuizSession } from "../types";
import { closeSession, deleteCurrentAnswers, moveToQuestion, updateSession } from "../hooks/useSession";

type Props = {
  session: QuizSession;
  answers: Answer[];
};

export function SessionControls({ session, answers }: Props) {
  const hasStarted = session.currentQuestionIndex >= 0;
  const isLastQuestion = session.currentQuestionIndex >= session.questions.length - 1;
  const [durationSeconds, setDurationSeconds] = useState(session.questionDurationSeconds || 30);

  useEffect(() => {
    setDurationSeconds(session.questionDurationSeconds || 30);
  }, [session.questionDurationSeconds]);

  async function startOrNext() {
    const nextIndex = hasStarted ? Math.min(session.currentQuestionIndex + 1, session.questions.length - 1) : 0;
    await moveToQuestion(session, nextIndex, durationSeconds);
  }

  async function resetCurrentVote() {
    await deleteCurrentAnswers(session.id, answers);
    await moveToQuestion(session, session.currentQuestionIndex, durationSeconds);
  }

  return (
    <div className="control-stack">
      <label className="timer-setting">
        <span>
          <Timer size={18} />
          Segundos por pregunta
        </span>
        <input
          type="number"
          min="5"
          max="600"
          step="5"
          value={durationSeconds}
          onChange={(event) => setDurationSeconds(Number(event.target.value))}
        />
      </label>

      <div className="toolbar">
        <button className="button primary" type="button" onClick={() => void startOrNext()} disabled={isLastQuestion && hasStarted}>
          {hasStarted ? <SkipForward size={18} /> : <Play size={18} />}
          {hasStarted ? "Siguiente" : "Iniciar"}
        </button>

        <button
          className="button secondary"
          type="button"
          onClick={() => void updateSession(session.id, { showResults: !session.showResults })}
        >
          {session.showResults ? <EyeOff size={18} /> : <Eye size={18} />}
          {session.showResults ? "Ocultar resultados" : "Mostrar resultados"}
        </button>

        <button
          className="button secondary"
          type="button"
          onClick={() => void updateSession(session.id, { showCorrectAnswer: !session.showCorrectAnswer })}
          disabled={!hasStarted}
        >
          <CheckCircle2 size={18} />
          {session.showCorrectAnswer ? "Ocultar correcta" : "Revelar correcta"}
        </button>

        <button className="button secondary" type="button" onClick={() => void resetCurrentVote()} disabled={!hasStarted}>
          <RotateCcw size={18} />
          Reiniciar votación
        </button>

        <button className="button danger" type="button" onClick={() => void closeSession(session.id)}>
          <Square size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
