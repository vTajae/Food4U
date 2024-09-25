import React, { useEffect, useState } from "react";
import { SearchBarWithButtons } from "../search/refSearchwButton";
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

  // Initialize the state as an array of Suggestion[], which can hold price or medical suggestions
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

    setSelectedAnswers(priceAsSuggestion);

    // Update the form context with the price as a Suggestion array
    setAnswer(questionId, priceAsSuggestion);
  };

  return (
    <div>
      <h3>{questionText}</h3>
      {queryKey === "price" ? (
        // Handle input for the price, convert it to a Suggestion array
        <input
          type="text"
          placeholder="Enter price"
          value={selectedAnswers[0]?.value || ""} // Display the price value if available
          onChange={handleInputChange}
        />
      ) : (
        <SearchBarWithButtons
          key={questionId}
          onSuggestionSelect={handleSuggestionSelect}
          placeholderText="Type to search"
          queryKey={queryKey}
          selectedSuggestions={selectedAnswers as Suggestion[]}
        />
      )}
      {Array.isArray(selectedAnswers) && selectedAnswers.length > 0 && (
        <ul>
          {selectedAnswers.map((item) => (
            <li key={`${item.name}-${item.code || ""}`}>
              {item.name} {item.code ? `(${item.code})` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionComponent;
