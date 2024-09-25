import { useState } from "react";
import { useFormContext } from "./context";
import { SearchBarWithButtons } from "../search/refSearchwButton";
import { useFetcher } from "@remix-run/react";
import { Allergy } from "../../../api/schemas/welcome";


type refbarFetchType = {
  autocomplete: Record<string, string[]>;
  message?: string;
  errors?: Record<string, string[]>;
}

const Question2 = () => {
  const { nextStep, updateAnswer, prevStep, currentStep, answers  } = useFormContext();
  const [yesNo, setYesNo] = useState<string>("no");
  const [selectedConditions, setSelectedConditions] = useState<Allergy[]>([]);
  const fetcher = useFetcher<refbarFetchType>();

  const questionData = answers.questions[currentStep];

    


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (yesNo === "yes" && selectedConditions.length > 0) {
      updateAnswer(currentStep, selectedConditions.map(condition => ({
        name: condition.name,
      })));
    }
    
    nextStep();
  };

  const handleSuggestionSelect = (selectedSuggestions: { name: string }[]) => {
    setSelectedConditions((prevConditions) => {
      const newConditions = selectedSuggestions.filter(
        (suggestion) => !prevConditions.some((condition) => condition.name === suggestion.name)
      );
      return [...prevConditions, ...newConditions];
    });
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

          <SearchBarWithButtons<{ name: string }>
            fetcher={fetcher}
            onSuggestionSelect={handleSuggestionSelect}
            queryKey="allergy" // Custom query key for conditions
            submitURL="/user/prefs"
            cachedData={selectedConditions}
          />

          {selectedConditions.length > 0 && (
            <div className="selected-conditions mt-4">
              <p><strong>Selected Conditions:</strong></p>
              <ul>
                {selectedConditions.map((condition) => (
                  <li key={condition.name}>
                    {condition.name}
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

export default Question2;
