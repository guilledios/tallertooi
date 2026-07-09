import { Library, Play, Trash2 } from "lucide-react";
import type { Question, QuestionSet } from "../types";

type Props = {
  questionSets: QuestionSet[];
  onUse: (questions: Question[], title: string) => void;
  onCreateSession: (questions: Question[]) => void;
  onDelete: (questionSetId: string) => void;
};

export function QuestionSetLibrary({ questionSets, onUse, onCreateSession, onDelete }: Props) {
  return (
    <section className="panel library-panel">
      <div>
        <p className="eyebrow">Biblioteca</p>
        <h2>Simulacros guardados</h2>
        <p className="muted">Elegí un banco para crear una sesión nueva sin volver a subir el archivo.</p>
      </div>

      {questionSets.length === 0 ? (
        <div className="empty-state">Todavía no guardaste simulacros.</div>
      ) : (
        <div className="set-list">
          {questionSets.map((questionSet) => (
            <article className="set-card" key={questionSet.id}>
              <div>
                <div className="set-title">
                  <Library size={18} />
                  <h3>{questionSet.title}</h3>
                </div>
                <p className="muted compact">{questionSet.questions.length} preguntas</p>
              </div>

              <div className="set-actions">
                <button className="button primary" type="button" onClick={() => onCreateSession(questionSet.questions)}>
                  <Play size={18} />
                  Crear sesión
                </button>
                <button className="button secondary" type="button" onClick={() => onUse(questionSet.questions, questionSet.title)}>
                  Usar
                </button>
                <button className="button danger icon-button" type="button" onClick={() => onDelete(questionSet.id)} aria-label="Eliminar simulacro">
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
