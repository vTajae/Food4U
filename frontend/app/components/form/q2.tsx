import { useState } from 'react';
import { useFormContext } from './context';

const Question2 = () => {
  const { nextStep, updateAnswer, prevStep, currentStep } = useFormContext();
  const [selectedDiet, setSelectedDiet] = useState<string>(''); // State for selected diet

  // Predefined question and diet options
  const questionData = {
    question: 'What type of diet do you follow?',
    options: ['Vegetarian', 'Vegan', 'Paleo', 'Ketogenic', 'Mediterranean', 'Gluten-Free'],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnswer(currentStep, selectedDiet); // Save the selected diet in context
    nextStep(); // Go to the next question
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">{questionData.question}</h2>
      
      {/* Render diet options as radio buttons */}
      <div className="space-y-4">
        {questionData.options.map((option) => (
          <label key={option} className="flex items-center space-x-2">
            <input
              type="radio"
              value={option}
              checked={selectedDiet === option}
              onChange={(e) => setSelectedDiet(e.target.value)}
              className="form-radio h-5 w-5 text-green-600 focus:ring-2 focus:ring-green-500"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>

      {/* Button Group */}
      <div className="flex justify-between mt-6 space-x-4">
        <button
          type="button"
          onClick={prevStep}
          className="w-1/2 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out"
        >
          Previous
        </button>

        <button
          type="submit"
          disabled={!selectedDiet}
          className={`w-1/2 py-2 px-4 text-white rounded-md ${
            selectedDiet
              ? 'bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default Question2;
