import { Eye, EyeOff, RotateCcw, SkipForward, Square, CheckCircle2, Play } from "lucide-react";
import type { Answer, QuizSession } from "../types";
import { closeSession, deleteCurrentAnswers, updateSession } from "../hooks/useSession";

type Props = {
  session: QuizSession;
  answers: Answer[];
};

export function SessionControls({ session, answers }: Props) {
  const hasStarted = session.currentQuestionIndex >= 0;
  const isLastQuestion = session.currentQuestionIndex >= session.questions.length - 1;

  async function startOrNext() {
    const nextIndex = hasStarted ? Math.min(session.currentQuestionIndex + 1, session.questions.length - 1) : 0;
    await updateSession(session.id, {
      currentQuestionIndex: nextIndex,
      currentQuestionKey: String(nextIndex),
      showCorrectAnswer: false,
      status: "live"
    });
  }

  return (
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

      <button
        className="button secondary"
        type="button"
        onClick={() => void deleteCurrentAnswers(session.id, answers)}
        disabled={!hasStarted || answers.length === 0}
      >
        <RotateCcw size={18} />
        Reiniciar votación
      </button>

      <button className="button danger" type="button" onClick={() => void closeSession(session.id)}>
        <Square size={18} />
        Cerrar sesión
      </button>
    </div>
  );
}
