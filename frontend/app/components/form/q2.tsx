import { useState } from 'react';
import { useFormContext } from './context';

const Question2 = () => {
  const { nextStep, updateAnswer, prevStep } = useFormContext();
  const [selectedDiet, setSelectedDiet] = useState<string>(''); // State for selected diet

  // Predefined question and diet options
  const questionData = {
    question: 'What type of diet do you follow?',
    options: ['Vegetarian', 'Vegan', 'Paleo', 'Ketogenic', 'Mediterranean', 'Gluten-Free'],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnswer('q2', selectedDiet); // Save the selected diet in context
    nextStep(); // Go to the next question
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{questionData.question}</h2>
      
      {/* Render diet options as radio buttons */}
      {questionData.options.map((option) => (
        <label key={option} className="block mt-2">
          <input
            type="radio"
            value={option}
            checked={selectedDiet === option}
            onChange={(e) => setSelectedDiet(e.target.value)}
          />
          {option}
        </label>
      ))}

      <div className="button-group mt-4">
        <button type="submit" disabled={!selectedDiet}>
          Next
        </button>
        <button type="button" onClick={prevStep}>
          Previous
        </button>
      </div>
    </form>
  );
};

export default Question2;
