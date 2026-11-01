"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { FormState, Suggestion } from "~/api/schemas/refs";
import { browserDraftStorage, clearDraft, emptyDraft, readDraft, writeDraft } from "~/lib/onboarding-draft";

interface FormContextProps {
  state: FormState;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setAnswer: (questionId: number, answers: Suggestion[]) => void;
  clearCurrentDraft: () => void;
}

const FormContext = createContext<FormContextProps | undefined>(undefined);

export function useFormContext(): FormContextProps {
  const context = useContext(FormContext);
  if (!context) throw new Error("useFormContext must be used within a FormProvider");
  return context;
}

export function FormProvider({ identity, children }: { identity?: string; children: ReactNode }) {
  const [draft, setDraft] = useState(() => ({ identity, state: emptyDraft(), hydrated: false }));
  // Never render or persist the previous identity's state during a client switch.
  const state = draft.identity === identity ? draft.state : emptyDraft();

  useEffect(() => {
    setDraft({ identity, state: readDraft(browserDraftStorage(), identity), hydrated: true });
  }, [identity]);

  useEffect(() => {
    if (draft.hydrated && draft.identity === identity) {
      writeDraft(browserDraftStorage(), identity, draft.state);
    }
  }, [draft, identity]);

  function update(change: (previous: FormState) => FormState) {
    setDraft(previous => ({
      identity, hydrated: previous.identity === identity && previous.hydrated,
      state: change(previous.identity === identity ? previous.state : emptyDraft()),
    }));
  }

  return (
    <FormContext.Provider key={identity ?? "anonymous"} value={{
      state,
      goToNextStep: () => update(previous => ({ ...previous, currentStep: Math.min(5, previous.currentStep + 1) })),
      goToPreviousStep: () => update(previous => ({ ...previous, currentStep: Math.max(0, previous.currentStep - 1) })),
      setAnswer: (questionId, answers) => update(previous => ({
        ...previous,
        answers: previous.answers.some(q => q.questionId === questionId)
          ? previous.answers.map(q => q.questionId === questionId ? { ...q, answers } : q)
          : [...previous.answers, { questionId, answers }],
      })),
      clearCurrentDraft: () => clearDraft(browserDraftStorage(), identity),
    }}>
      {children}
    </FormContext.Provider>
  );
}
