import { BarChart3, CheckCircle2, Timer, Trophy, Users } from "lucide-react";
import { useMemo } from "react";
import { useCountdown } from "../hooks/useCountdown";
import { useAllAnswers, useAnswers, useAnswerStats, useParticipants, useSession } from "../hooks/useSession";
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
  const allAnswers = useAllAnswers(sessionId);
  const stats = useAnswerStats(answers, session?.questions ?? [], session?.currentQuestionIndex ?? -1);
  const currentQuestion = session?.questions[session.currentQuestionIndex];
  const url = joinUrl(sessionId);
  const remainingSeconds = useCountdown(session?.questionEndsAt);
  const displayMode = session?.displayMode ?? "full";
  const correctResponders = useMemo(() => {
    const participantsById = new Map(participants.map((participant) => [participant.id, participant.name]));

    return answers
      .filter((answer) => answer.isCorrect)
      .map((answer) => ({
        id: answer.id,
        name: participantsById.get(answer.participantId) ?? "Sin nombre"
      }))
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [answers, participants]);
  const participantRanking = useMemo(() => {
    const totalQuestions = session?.questions.length ?? 0;

    return participants
      .map((participant) => {
        const participantAnswers = allAnswers.filter((answer) => answer.participantId === participant.id);
        const correct = participantAnswers.filter((answer) => answer.isCorrect).length;
        const percent = totalQuestions === 0 ? 0 : Math.round((correct / totalQuestions) * 100);

        return {
          id: participant.id,
          name: participant.name,
          answered: participantAnswers.length,
          correct,
          percent
        };
      })
      .sort((first, second) => second.correct - first.correct || second.percent - first.percent || first.name.localeCompare(second.name));
  }, [allAnswers, participants, session?.questions.length]);
  const questionRanking = useMemo(() => {
    return (session?.questions ?? [])
      .map((question, questionIndex) => {
        const questionAnswers = allAnswers.filter((answer) => answer.questionIndex === questionIndex);
        const correct = questionAnswers.filter((answer) => answer.isCorrect).length;
        const percent = questionAnswers.length === 0 ? 0 : Math.round((correct / questionAnswers.length) * 100);

        return {
          id: question.id,
          index: questionIndex,
          text: question.text,
          answered: questionAnswers.length,
          correct,
          percent
        };
      })
      .sort((first, second) => {
        if (first.answered === 0 && second.answered > 0) return 1;
        if (second.answered === 0 && first.answered > 0) return -1;
        return first.percent - second.percent || second.answered - first.answered;
      });
  }, [allAnswers, session?.questions]);

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
          <div className="status-stack">
            <span className={`status-pill ${session.status}`}>{session.status}</span>
            <span className="mode-pill">{displayMode === "keypad" ? "Modo proyector" : "Modo completo"}</span>
          </div>
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
            <section className="correct-panel">
              <div className="correct-heading">
                <CheckCircle2 size={18} />
                <h2>Respondieron correctamente</h2>
                <span>{correctResponders.length}</span>
              </div>
              {correctResponders.length > 0 ? (
                <div className="name-list">
                  {correctResponders.map((responder) => (
                    <span className="name-chip" key={responder.id}>
                      {responder.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted compact">Todavía no hay respuestas correctas.</p>
              )}
            </section>
          </>
        ) : (
          <div className="empty-state">Compartí el código y presioná Iniciar cuando quieras mostrar la primera pregunta.</div>
        )}

        {currentQuestion && remainingSeconds !== null && (
          <div className={remainingSeconds === 0 ? "countdown expired" : "countdown"}>
            <Timer size={20} />
            <span>{remainingSeconds === 0 ? "Tiempo terminado" : `${remainingSeconds}s`}</span>
          </div>
        )}

        {session.status === "closed" && (
          <section className="final-results">
            <div className="ranking-card">
              <div className="ranking-heading">
                <Trophy size={20} />
                <div>
                  <p className="eyebrow">Cierre de sesión</p>
                  <h2>Ranking de participantes</h2>
                </div>
              </div>
              {participantRanking.length > 0 ? (
                <ol className="ranking-list">
                  {participantRanking.map((participant, index) => (
                    <li className="ranking-row" key={participant.id}>
                      <span className="rank-position">{index + 1}</span>
                      <span className="rank-name">{participant.name}</span>
                      <span className="rank-score">
                        {participant.correct}/{session.questions.length}
                      </span>
                      <span className="rank-percent">{participant.percent}%</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="muted compact">No hubo participantes en esta sesión.</p>
              )}
            </div>

            <div className="ranking-card">
              <div className="ranking-heading">
                <BarChart3 size={20} />
                <div>
                  <p className="eyebrow">Análisis de preguntas</p>
                  <h2>Mayor y menor acierto</h2>
                </div>
              </div>
              {questionRanking.length > 0 ? (
                <div className="question-ranking">
                  {questionRanking.map((question) => (
                    <div className="question-rank-row" key={question.id}>
                      <div>
                        <strong>Pregunta {question.index + 1}</strong>
                        <p>{question.text}</p>
                      </div>
                      <span>
                        {question.answered > 0 ? `${question.correct}/${question.answered} · ${question.percent}%` : "Sin respuestas"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted compact">No hay preguntas para analizar.</p>
              )}
            </div>
          </section>
        )}

        <SessionControls session={session} answers={answers} />
      </main>
    </div>
  );
}
