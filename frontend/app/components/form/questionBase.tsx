import React, { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import { SearchBarWithButtons } from "../search/refSearchwButton";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { useFormContext } from "./context";
import type { Suggestion } from "../../../api/schemas/refs";

interface QuestionProps {
  questionId: number;
  questionText: string;
  queryKey: string;
}

const QuestionComponent: React.FC<QuestionProps> = ({
  questionId,
  questionText,
  queryKey,
}) => {
  const { state, setAnswer } = useFormContext();
  const headingId = useId();

  // Initialize the state as an array of Suggestion[]
  const [selectedAnswers, setSelectedAnswers] = useState<Suggestion[]>([]);

  useEffect(() => {
    const existingQuestion = state.answers.find(
      (q) => q.questionId === questionId
    );
    if (existingQuestion) {
      setSelectedAnswers(existingQuestion.answers as Suggestion[]);
    } else {
      setSelectedAnswers([]);
    }
  }, [questionId, state.answers]);

  const handleSuggestionSelect = (suggestions: Suggestion[]) => {
    setSelectedAnswers(suggestions);
    setAnswer(questionId, suggestions);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Convert the string input into a Suggestion array for the price
    const priceAsSuggestion: Suggestion[] = [{ value: value }]; // No code, since it's just a price input


    // Update the form context with the price as a Suggestion array
    setAnswer(questionId, priceAsSuggestion);
  };

  return (
    <div className="flex flex-col gap-4 rounded-(--rounded-lg) bg-surface p-6 font-body text-ink">
      <h3 id={headingId} className="text-body-lg font-bold text-ink">
        {questionText}
      </h3>

      {queryKey === "price" ? (
        <Input
          type="text"
          inputMode="decimal"
          aria-labelledby={headingId}
          placeholder="Enter price"
          value={selectedAnswers[0]?.value || ""}
          onChange={handleInputChange}
        />
      ) : (
        <SearchBarWithButtons
          key={questionId}
          onSuggestionSelect={handleSuggestionSelect}
          placeholderText="Type to search"
          queryKey={queryKey}
          selectedSuggestions={selectedAnswers as Suggestion[]}
          labelledBy={headingId}
        />
      )}

      {Array.isArray(selectedAnswers) && selectedAnswers.length > 0 && (
        <ul aria-label="Your answers" className="flex flex-wrap gap-2">
          {/* Selected answers as removable constraint chips */}
          {selectedAnswers.map((item) => {
            const label = `${item.name}${item.code ? ` (${item.code})` : ""}`;
            return (
              <li key={`${item.name}-${item.code || ""}`}>
                <Badge className="pr-0">
                  {label}
                  <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    onClick={() => {
                      const updatedAnswers = selectedAnswers.filter(
                        (answer) => answer !== item
                      );
                      setSelectedAnswers(updatedAnswers);
                      setAnswer(questionId, updatedAnswers);
                    }}
                    className="-my-1 inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-focus"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default QuestionComponent;
