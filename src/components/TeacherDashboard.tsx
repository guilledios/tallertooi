import { Users } from "lucide-react";
import { useAnswers, useAnswerStats, useParticipants, useSession } from "../hooks/useSession";
import { joinUrl } from "../utils/routes";
import { LiveBarChart } from "./LiveBarChart";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { SessionControls } from "./SessionControls";

type Props = {
  sessionId: string;
};

export function TeacherDashboard({ sessionId }: Props) {
  const { session, loading, error } = useSession(sessionId);
  const participants = useParticipants(sessionId);
  const answers = useAnswers(sessionId, session?.currentQuestionIndex);
  const stats = useAnswerStats(answers, session?.questions ?? [], session?.currentQuestionIndex ?? -1);
  const currentQuestion = session?.questions[session.currentQuestionIndex];
  const url = joinUrl(sessionId);

  if (loading) return <div className="panel">Cargando sesión...</div>;
  if (error || !session) return <div className="panel error">{error ?? "Sesión no disponible."}</div>;

  return (
    <div className="dashboard-grid">
      <aside className="panel session-card">
        <p className="eyebrow">Sesión en vivo</p>
        <h2 className="session-code">{session.id}</h2>
        <QRCodeDisplay value={url} label="Escanear para entrar" />
        <a className="link" href={url}>
          Abrir enlace de estudiantes
        </a>
        <div className="metric">
          <Users size={18} />
          <span>{participants.length} participantes</span>
        </div>
      </aside>

      <main className="panel question-panel">
        <div className="question-header">
          <div>
            <p className="eyebrow">
              {session.currentQuestionIndex >= 0
                ? `Pregunta ${session.currentQuestionIndex + 1} de ${session.questions.length}`
                : `${session.questions.length} preguntas cargadas`}
            </p>
            <h1>{currentQuestion?.text ?? "Listo para iniciar"}</h1>
          </div>
          <span className={`status-pill ${session.status}`}>{session.status}</span>
        </div>

        {currentQuestion ? (
          <>
            <ul className="option-list">
              {currentQuestion.options.map((option) => (
                <li className={session.showCorrectAnswer && option.key === currentQuestion.answer ? "option correct" : "option"} key={option.key}>
                  <strong>{option.key}</strong>
                  <span>{option.text}</span>
                </li>
              ))}
            </ul>
            <div className="results-heading">
              <h2>Respuestas</h2>
              <span>{answers.length} enviadas</span>
            </div>
            <LiveBarChart
              stats={stats}
              total={answers.length}
              correctAnswer={currentQuestion.answer}
              revealCorrect={session.showCorrectAnswer}
              hidden={!session.showResults}
            />
          </>
        ) : (
          <div className="empty-state">Compartí el código y presioná Iniciar cuando quieras mostrar la primera pregunta.</div>
        )}

        <SessionControls session={session} answers={answers} />
      </main>
    </div>
  );
}
