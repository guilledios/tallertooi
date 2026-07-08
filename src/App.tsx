import { GraduationCap } from "lucide-react";
import { TeacherPage } from "./pages/TeacherPage";
import { StudentPage } from "./pages/StudentPage";
import { useAnonymousAuth } from "./hooks/useAnonymousAuth";
import { normalizeSessionCode } from "./utils/sessionCode";
import { useEffect, useState } from "react";

type Route =
  | { kind: "teacher"; sessionId?: string }
  | { kind: "join"; sessionId?: string };

function readRoute(): Route {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [section, id] = hash.split("/");

  if (section === "join") {
    return { kind: "join", sessionId: id ? normalizeSessionCode(id) : undefined };
  }

  if (section === "teacher" && id) {
    return { kind: "teacher", sessionId: normalizeSessionCode(id) };
  }

  return { kind: "teacher" };
}

export function App() {
  const { user, loading, error } = useAnonymousAuth();
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#/teacher">
          <GraduationCap size={22} />
          <span>Quiz Taller</span>
        </a>
        <nav>
          <a href="#/teacher">Docente</a>
          <a href="#/join">Estudiante</a>
        </nav>
      </header>

      {loading && <div className="panel">Iniciando acceso anónimo...</div>}
      {error && <div className="panel error">{error}</div>}
      {!loading && user && route.kind === "teacher" && (
        <TeacherPage userId={user.uid} initialSessionId={route.sessionId} key={route.sessionId ?? "new"} />
      )}
      {!loading && user && route.kind === "join" && <StudentPage userId={user.uid} initialSessionId={route.sessionId} />}
    </div>
  );
}
