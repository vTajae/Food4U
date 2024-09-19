import { useState } from 'react';
import { useFormContext } from './context';

const Question1 = () => {
  const { nextStep, updateAnswer } = useFormContext();
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  // Predefined question and cuisine options
  const questionData = {
    question: 'Favoraite Cusine?',
    options: ['Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Thai'],
  };

  // Handle checkbox change for multiple selections
  const handleCuisineChange = (cuisine: string) => {
    setSelectedCuisines((prevSelected) =>
      prevSelected.includes(cuisine)
        ? prevSelected.filter((item) => item !== cuisine) // Remove if already selected
        : [...prevSelected, cuisine] // Add if not selected
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnswer('q1', selectedCuisines); // Update answer with selected cuisines
    nextStep(); // Go to the next question
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{questionData.question}</h2>
      {questionData.options && (
        <div>
          {questionData.options.map((option) => (
            <label key={option} className="block mt-2">
              <input
                type="checkbox"
                value={option}
                checked={selectedCuisines.includes(option)}
                onChange={() => handleCuisineChange(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
      <button type="submit" disabled={selectedCuisines.length === 0}>
        Next
      </button>
    </form>
  );
};

export default Question1;
