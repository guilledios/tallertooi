import type { QuestionOption } from "../types";

type Stat = QuestionOption & {
  count: number;
};

type Props = {
  stats: Stat[];
  total: number;
  correctAnswer?: string;
  revealCorrect?: boolean;
  hidden?: boolean;
};

export function LiveBarChart({ stats, total, correctAnswer, revealCorrect, hidden }: Props) {
  if (hidden) {
    return <div className="empty-state">Resultados ocultos para la audiencia.</div>;
  }

  return (
    <div className="chart" aria-label="Gráfico de respuestas">
      {stats.map((stat) => {
        const percent = total === 0 ? 0 : Math.round((stat.count / total) * 100);
        const isCorrect = revealCorrect && stat.key === correctAnswer;

        return (
          <div className="bar-row" key={stat.key}>
            <div className="bar-label">
              <strong>{stat.key}</strong>
              <span>{stat.text}</span>
            </div>
            <div className="bar-track">
              <div className={isCorrect ? "bar-fill correct" : "bar-fill"} style={{ width: `${percent}%` }} />
            </div>
            <div className="bar-count">
              {stat.count} · {percent}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
