import { useState } from 'react';
import { useFormContext } from './context';

const Question5 = () => {
  const { nextStep, updateAnswer, prevStep ,currentStep} = useFormContext();
  const [answer, setAnswer] = useState<string>('');

  const questionData = {
    question: 'Average Cost Per Meal'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnswer(currentStep, answer); // Save the answer in context
    nextStep(); // Go to the next question
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{questionData.question}</h2>

      {/* Input Field */}
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your name"
      />

      {/* Button Group */}
      <div className="flex justify-between mt-4 space-x-4">
        <button
          type="button"
          onClick={prevStep}
          className="w-1/2 py-2 px-4 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200 ease-in-out"
        >
          Previous
        </button>

        <button
          type="submit"
          disabled={!answer}
          className={`w-1/2 py-2 px-4 text-white rounded-md ${
            answer
              ? 'bg-blue-600 hover:bg-blue-700 transition duration-200 ease-in-out'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default Question5;
