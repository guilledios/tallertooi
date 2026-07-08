import { FileText } from "lucide-react";
import { useRef, useState } from "react";
import { parseAiken } from "../parser/aikenParser";
import type { Question } from "../types";

type Props = {
  onQuestionsLoaded: (questions: Question[]) => void;
};

export function AikenUploader({ onQuestionsLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file?: File) {
    if (!file) return;

    try {
      const text = await file.text();
      const questions = parseAiken(text);
      setFileName(file.name);
      setError(null);
      onQuestionsLoaded(questions);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo leer el archivo.");
      onQuestionsLoaded([]);
    }
  }

  return (
    <section className="panel upload-panel">
      <div>
        <p className="eyebrow">Archivo Aiken</p>
        <h2>Cargá las preguntas del taller</h2>
        <p className="muted">Usá un archivo .txt con alternativas A., B., C. y una línea ANSWER: por pregunta.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".txt,text/plain"
        onChange={(event) => void handleFile(event.target.files?.[0])}
        hidden
      />

      <button className="button secondary" type="button" onClick={() => inputRef.current?.click()}>
        <FileText size={18} />
        Seleccionar .txt
      </button>

      {fileName && <p className="success">Archivo cargado: {fileName}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
