import { useState } from 'react';
import { useFormContext } from './context';

const Question1 = () => {
  const { nextStep, updateAnswer, currentStep } = useFormContext();
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  // Predefined question and cuisine options
  const questionData = {
    question: 'Favorite Cuisine?',
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
  
    console.log('Selected Cuisines:', selectedCuisines); // Debug selected cuisines
    console.log('Current Step:', currentStep); // Debug current step
    updateAnswer(currentStep, selectedCuisines); // Ensure this works as expected
    nextStep(); // Ensure this moves to the next step
  };
  

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{questionData.question}</h2>
      
      {questionData.options && (
        <div className="space-y-3">
          {questionData.options.map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={option}
                checked={selectedCuisines.includes(option)}
                onChange={() => handleCuisineChange(option)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      <button
        type="submit"
        className={`mt-6 w-full py-2 px-4 rounded-md text-white ${
          selectedCuisines.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 transition duration-200 ease-in-out'
        }`}
        disabled={selectedCuisines.length === 0}
      >
        Next
      </button>
    </form>
  );
};

export default Question1;
