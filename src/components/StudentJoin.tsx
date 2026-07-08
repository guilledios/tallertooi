import { LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { joinSession, useSession } from "../hooks/useSession";
import { normalizeSessionCode } from "../utils/sessionCode";

type Props = {
  initialSessionId?: string;
  participantId: string;
  onJoined: (sessionId: string, name: string) => void;
};

export function StudentJoin({ initialSessionId, participantId, onJoined }: Props) {
  const [sessionCode, setSessionCode] = useState(initialSessionId ?? "");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalizedCode = normalizeSessionCode(sessionCode);
  const { session } = useSession(normalizedCode || undefined);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!normalizedCode || !name.trim()) {
      setError("Ingresá código y alias.");
      return;
    }
    if (!session) {
      setError("No se encontró una sesión con ese código.");
      return;
    }
    if (session.status === "closed") {
      setError("Esta sesión ya está cerrada.");
      return;
    }

    try {
      setSubmitting(true);
      await joinSession(normalizedCode, participantId, name.trim());
      onJoined(normalizedCode, name.trim());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo entrar a la sesión.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel join-card" onSubmit={(event) => void handleSubmit(event)}>
      <p className="eyebrow">Ingreso estudiante</p>
      <h1>Entrar al taller</h1>
      <label>
        Código de sesión
        <input value={sessionCode} onChange={(event) => setSessionCode(event.target.value.toUpperCase())} placeholder="ABC123" />
      </label>
      <label>
        Nombre o alias
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu alias" />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="button primary full" type="submit" disabled={submitting}>
        <LogIn size={18} />
        Entrar
      </button>
    </form>
  );
}
