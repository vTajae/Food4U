import { useState } from "react";
import { useFormContext } from "./context";
import { SearchBar } from "../search/bar";
import { useFetcher } from "@remix-run/react";

export interface MedicalCode {
  code: string;
  description: string;
}

const Question4 = () => {
  const { nextStep, updateAnswer, prevStep, currentStep, answers } = useFormContext();
  const [yesNo, setYesNo] = useState<string>("no");
  const [selectedConditions, setSelectedConditions] = useState<MedicalCode[]>([]);
  const fetcher = useFetcher<{
    message?: string;
    errors?: Record<string, string[]>;
  }>();

  const questionData = answers.questions[currentStep];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (yesNo === "yes" && selectedConditions.length > 0) {
      updateAnswer(currentStep, selectedConditions);
    }
    
    nextStep();
  };

  const handleSuggestionSelect = (suggestion: MedicalCode) => {
    setSelectedConditions((prevConditions) =>
      prevConditions.some((condition) => condition.code === suggestion.code)
        ? prevConditions
        : [...prevConditions, suggestion]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{questionData.question}</h2>

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
              setSelectedConditions([]);
            }}
          />
          No
        </label>
      </div>

      {yesNo === "yes" && (
        <div>
          <h2>Please provide more details:</h2>

          <SearchBar
            fetcher={fetcher}
            onSuggestionSelect={handleSuggestionSelect}
            queryKey="icd10cm" // Custom query key for conditions
          />

          {selectedConditions.length > 0 && (
            <div className="selected-conditions mt-4">
              <p><strong>Selected Conditions:</strong></p>
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

      <div className="button-group mt-6">
        <button type="submit" className="btn btn-primary">Next</button>
        <button type="button" className="btn btn-secondary" onClick={prevStep}>Previous</button>
      </div>
    </form>
  );
};

export default Question4;
