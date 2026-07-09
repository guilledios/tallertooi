import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import type { Question, QuestionSet } from "../types";

export function useQuestionSets(ownerId?: string) {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerId) {
      setQuestionSets([]);
      return;
    }

    const questionSetsQuery = query(collection(db, "questionSets"), where("ownerId", "==", ownerId));

    return onSnapshot(
      questionSetsQuery,
      (snapshot) => {
        setQuestionSets(
          snapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }) as QuestionSet)
            .sort((first, second) => (second.updatedAt?.toMillis() ?? 0) - (first.updatedAt?.toMillis() ?? 0))
        );
        setError(null);
      },
      (caught) => setError(caught.message)
    );
  }, [ownerId]);

  return { questionSets, error };
}

export async function saveQuestionSet(ownerId: string, title: string, questions: Question[]) {
  await addDoc(collection(db, "questionSets"), {
    ownerId,
    title,
    questions,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function deleteQuestionSet(questionSetId: string) {
  await deleteDoc(doc(db, "questionSets", questionSetId));
}
