import { useState } from "react";
import { useFormContext } from "./context";
import { SearchBar } from "../search/bar";
import { useFetcher } from "@remix-run/react";

export interface MedicalCode {
  code: string;
  description: string;
}

const Question3 = () => {
  const { nextStep, updateAnswer, prevStep, currentStep, answers } = useFormContext();
  const [yesNo, setYesNo] = useState<string>("no"); // Default to 'no'
  const [selectedConditions, setSelectedConditions] = useState<MedicalCode[]>([]); // Store multiple conditions
  const fetcher = useFetcher<{
    message?: string;
    errors?: Record<string, string[]>;
  }>();

  const questionData = answers.questions[currentStep]; // Get the current answer from context


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If "Yes" is selected and conditions are provided, store them; otherwise set to empty
    if (yesNo === "yes" && selectedConditions.length > 0) {
      updateAnswer(currentStep, selectedConditions); // Use currentStep to update answer for multiple conditions
    }
    
    nextStep(); // Move to the next step, even if no condition selected
  };

  // Handle adding selected conditions (append to existing ones)
  const handleSuggestionSelect = (suggestion: MedicalCode) => {
    setSelectedConditions((prevConditions) =>
      prevConditions.some((condition) => condition.code === suggestion.code)
        ? prevConditions // If the condition already exists, don't add it again
        : [...prevConditions, suggestion] // Append new condition if it's not already selected
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{questionData.question}</h2>

      {/* Yes/No toggle */}
      <div className="toggle-group mb-4">
        <label>
          <input
            type="radio"
            value="yes"
            checked={yesNo === "yes"}
            onChange={(e) => setYesNo(e.target.value)}
          />
          Yes
        </label>
        <label className="ml-4">
          <input
            type="radio"
            value="no"
            checked={yesNo === "no"}
            onChange={(e) => {
              setYesNo(e.target.value);
              setSelectedConditions([]); // Clear selected conditions when "No" is selected
            }}
          />
          No
        </label>
      </div>

      {/* If 'yes', show follow-up question */}
      {yesNo === "yes" && (
        <div>
          <h2>Please provide more details:</h2>

          {/* Search Bar to select conditions */}
          <SearchBar fetcher={fetcher} onSuggestionSelect={handleSuggestionSelect} />

          {/* Display selected conditions in a cleaner format */}
          {selectedConditions.length > 0 && (
            <div className="selected-conditions mt-4">
              <p>
                <strong>Selected Conditions:</strong>
              </p>
              <ul>
                {selectedConditions.map((condition) => (
                  <li key={condition.code}>
                    {condition.description} (Code: {condition.code})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Form navigation buttons */}
      <div className="button-group mt-6">
        <button type="submit" className="btn btn-primary">
          Next
        </button>
        <button type="button" className="btn btn-secondary" onClick={prevStep}>
          Previous
        </button>
      </div>
    </form>
  );
};

export default Question3;
