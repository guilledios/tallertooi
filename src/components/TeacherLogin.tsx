import { LogIn } from "lucide-react";
import { FormEvent, useState } from "react";

type Props = {
  error?: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
};

export function TeacherLogin({ error, onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSubmitting(true);
      await onLogin(email.trim(), password);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel join-card login-card" onSubmit={(event) => void handleSubmit(event)}>
      <p className="eyebrow">Acceso docente</p>
      <h1>Entrar al panel</h1>
      <p className="muted">Usá el usuario docente de Firebase para crear y controlar simulacros.</p>

      <label>
        Email
        <input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>

      <label>
        Contraseña
        <input
          autoComplete="current-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {error && <p className="error">{error}</p>}

      <button className="button primary full" type="submit" disabled={submitting}>
        <LogIn size={18} />
        Entrar
      </button>
    </form>
  );
}
