import { useState } from "react";
import { useFormContext } from "./context";
import { SearchBar } from "../search/bar";
import { useFetcher } from "@remix-run/react";

export interface MedicalCode {
  code: string;
  description: string;
}

const Question3 = () => {
  const { nextStep, updateAnswer, prevStep } = useFormContext();
  const [yesNo, setYesNo] = useState<string>("no"); // Default to 'no'
  const [selectedCondition, setSelectedCondition] = useState<
    MedicalCode | undefined
  >(undefined); // Selected condition from SearchBar
  const fetcher = useFetcher<{
    message?: string;
    errors?: Record<string, string[]>;
  }>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If "Yes" is selected, store the selected condition, otherwise set to undefined
    const answer =
      yesNo === "yes" && selectedCondition
        ? {
            code: selectedCondition.code,
            description: selectedCondition.description,
          }
        : undefined; // If "No" is selected, answer remains undefined


        if(answer){

            updateAnswer("q3", answer); // Store the answer even if it's undefined for "No"
            nextStep(); // Move to the next step in both cases
        }
  };

  const handleSuggestionSelect = (suggestion: MedicalCode) => {
    setSelectedCondition(suggestion); // Update the selected condition
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Do you have a medical condition?</h2>

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
              setSelectedCondition(undefined); // Clear condition when "No" is selected
            }}
          />
          No
        </label>
      </div>

      {/* If 'yes', show follow-up question */}
      {yesNo === "yes" && (
        <div>
          <h2>Please provide more details:</h2>

          {/* Search Bar to select condition */}
          <SearchBar
            fetcher={fetcher}
            onSuggestionSelect={handleSuggestionSelect}
          />

          {/* Display selected condition in a cleaner format */}
          {selectedCondition && (
            <div className="selected-condition mt-4">
              <p>
                <strong>Selected Condition:</strong>
              </p>
              <p>{selectedCondition.description}</p>
              <p>
                <strong>Code:</strong> {selectedCondition.code}
              </p>
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
