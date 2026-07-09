import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase/config";
import type { Answer, Participant, Question, QuizSession } from "../types";
import { createSessionCode } from "../utils/sessionCode";

export function useSession(sessionId?: string) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, "sessions", sessionId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setSession(null);
          setError("No se encontró la sesión.");
          setLoading(false);
          return;
        }

        setSession({ id: snapshot.id, ...snapshot.data() } as QuizSession);
        setError(null);
        setLoading(false);
      },
      (caught) => {
        setError(caught.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [sessionId]);

  return { session, loading, error };
}

export function useParticipants(sessionId?: string) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!sessionId) {
      setParticipants([]);
      return;
    }

    return onSnapshot(collection(db, "sessions", sessionId, "participants"), (snapshot) => {
      setParticipants(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Participant));
    });
  }, [sessionId]);

  return participants;
}

export function useAnswers(sessionId?: string, questionIndex?: number) {
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (!sessionId || questionIndex === undefined || questionIndex < 0) {
      setAnswers([]);
      return;
    }

    const answersQuery = query(collection(db, "sessions", sessionId, "answers"), where("questionIndex", "==", questionIndex));

    return onSnapshot(answersQuery, (snapshot) => {
      setAnswers(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Answer));
    });
  }, [questionIndex, sessionId]);

  return answers;
}

export function useAllAnswers(sessionId?: string) {
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (!sessionId) {
      setAnswers([]);
      return;
    }

    return onSnapshot(collection(db, "sessions", sessionId, "answers"), (snapshot) => {
      setAnswers(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Answer));
    });
  }, [sessionId]);

  return answers;
}

export function useAnswerStats(answers: Answer[], questions: Question[], questionIndex: number) {
  return useMemo(() => {
    const currentQuestion = questions[questionIndex];
    if (!currentQuestion) {
      return [];
    }

    return currentQuestion.options.map((option) => ({
      ...option,
      count: answers.filter((answer) => answer.selectedOption === option.key).length
    }));
  }, [answers, questionIndex, questions]);
}

export async function createSession(ownerId: string, questions: Question[]) {
  for (let attempts = 0; attempts < 5; attempts += 1) {
    const sessionId = createSessionCode();
    const reference = doc(db, "sessions", sessionId);
    const existing = await getDoc(reference);

    if (!existing.exists()) {
      await setDoc(reference, {
        ownerId,
        createdAt: serverTimestamp(),
        currentQuestionIndex: -1,
        currentQuestionKey: "-1",
        questionDurationSeconds: 30,
        questionEndsAt: null,
        showResults: false,
        showCorrectAnswer: false,
        status: "draft",
        questions
      });

      return sessionId;
    }
  }

  throw new Error("No se pudo crear un código de sesión único. Probá nuevamente.");
}

export async function joinSession(sessionId: string, participantId: string, name: string) {
  await setDoc(
    doc(db, "sessions", sessionId, "participants", participantId),
    {
      name,
      joinedAt: serverTimestamp(),
      lastSeen: serverTimestamp()
    },
    { merge: true }
  );
}

export async function touchParticipant(sessionId: string, participantId: string) {
  await setDoc(
    doc(db, "sessions", sessionId, "participants", participantId),
    { lastSeen: serverTimestamp() },
    { merge: true }
  );
}

export async function submitAnswer(
  session: QuizSession,
  participantId: string,
  questionIndex: number,
  selectedOption: string
) {
  if (session.questionEndsAt && Date.now() > session.questionEndsAt.toMillis()) {
    throw new Error("El tiempo para responder terminó.");
  }

  const currentQuestion = session.questions[questionIndex];
  await setDoc(doc(db, "sessions", session.id, "answers", `${questionIndex}_${participantId}`), {
    participantId,
    questionIndex,
    questionKey: String(questionIndex),
    selectedOption,
    submittedAt: serverTimestamp(),
    isCorrect: currentQuestion?.answer === selectedOption
  });
}

export async function updateSession(sessionId: string, patch: Partial<QuizSession>) {
  await updateDoc(doc(db, "sessions", sessionId), patch);
}

export async function moveToQuestion(session: QuizSession, questionIndex: number, durationSeconds: number) {
  const safeDuration = Math.min(Math.max(Math.round(durationSeconds), 5), 600);

  await updateDoc(doc(db, "sessions", session.id), {
    currentQuestionIndex: questionIndex,
    currentQuestionKey: String(questionIndex),
    questionDurationSeconds: safeDuration,
    questionEndsAt: Timestamp.fromMillis(Date.now() + safeDuration * 1000),
    showCorrectAnswer: false,
    status: "live"
  });
}

export async function deleteCurrentAnswers(sessionId: string, answers: Answer[]) {
  const batch = writeBatch(db);
  answers.forEach((answer) => {
    batch.delete(doc(db, "sessions", sessionId, "answers", answer.id));
  });
  await batch.commit();
}

export async function closeSession(sessionId: string) {
  await updateDoc(doc(db, "sessions", sessionId), {
    status: "closed",
    questionEndsAt: null,
    showResults: false,
    showCorrectAnswer: false
  });
}
