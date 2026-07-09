import { GraduationCap } from "lucide-react";
import { TeacherPage } from "./pages/TeacherPage";
import { StudentPage } from "./pages/StudentPage";
import { TeacherLogin } from "./components/TeacherLogin";
import { useAuth } from "./hooks/useAuth";
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
  const { user, loading, error, isTeacher, signInTeacher, ensureAnonymousStudent, logOut } = useAuth();
  const [route, setRoute] = useState<Route>(readRoute);
  const [studentAuthLoading, setStudentAuthLoading] = useState(false);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (loading || route.kind !== "join" || user) {
      return;
    }

    setStudentAuthLoading(true);
    void ensureAnonymousStudent().finally(() => setStudentAuthLoading(false));
  }, [ensureAnonymousStudent, loading, route.kind, user]);

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
          {isTeacher && (
            <button className="nav-button" type="button" onClick={() => void logOut()}>
              Salir
            </button>
          )}
        </nav>
      </header>

      {loading && <div className="panel">Cargando acceso...</div>}
      {error && <div className="panel error">{error}</div>}
      {!loading && route.kind === "teacher" && !isTeacher && <TeacherLogin error={error} onLogin={signInTeacher} />}
      {!loading && isTeacher && user && route.kind === "teacher" && (
        <TeacherPage userId={user.uid} initialSessionId={route.sessionId} key={route.sessionId ?? "new"} />
      )}
      {!loading && studentAuthLoading && route.kind === "join" && <div className="panel">Preparando ingreso...</div>}
      {!loading && user && route.kind === "join" && <StudentPage userId={user.uid} initialSessionId={route.sessionId} />}
    </div>
  );
}
