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
    <div className="p-6 bg-white rounded-lg">
      {/* Updated background to white and adjusted padding */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {/* Changed text color for better readability */}
        {questionText}
      </h3>

      {queryKey === "price" ? (
        <input
          type="text"
          placeholder="Enter price"
          value={selectedAnswers[0]?.value || ""}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
          /* Improved input field styling */
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
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Display selected answers as removable badges */}
          {selectedAnswers.map((item) => (
            <span
              key={`${item.name}-${item.code || ""}`}
              className="bg-blue-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {item.name} {item.code ? `(${item.code})` : ""}
              {/* Remove button */}
              <button
                onClick={() => {
                  const updatedAnswers = selectedAnswers.filter(
                    (answer) => answer !== item
                  );
                  setSelectedAnswers(updatedAnswers);
                  setAnswer(questionId, updatedAnswers);
                }}
                className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionComponent;
