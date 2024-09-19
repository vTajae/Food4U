import { useState } from 'react';
import { useFormContext } from './context';

const Question4 = () => {
  const { nextStep, updateAnswer, prevStep } = useFormContext();
  const [answer, setAnswer] = useState<string>('');

  const questionData = {
    question: 'What is your name?',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnswer('q2', answer); // Save the answer in context
    nextStep(); // Go to the next question
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{questionData.question}</h2>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
      />
      <button type="submit">Next</button>
      <button type="button" onClick={prevStep}>Previous</button>

    </form>
  );
};

export default Question4;
