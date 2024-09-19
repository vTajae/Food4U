import { useState } from 'react';
import { useFormContext } from './context';

const Question1 = () => {
  const { nextStep, updateAnswer } = useFormContext();
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    updateAnswer('q1', answer); // Save answer to context
      nextStep(); // Go to next question


  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>What is your dietary preference?</h2>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
      />
      <button type="submit">Next</button>
    </form>
  );
};

export default Question1;
