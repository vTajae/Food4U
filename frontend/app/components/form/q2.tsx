import { useState } from 'react';
import { useFormContext } from './context';

const Question2 = () => {
  const { nextStep, updateAnswer } = useFormContext();
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();


    updateAnswer('q2', answer); // Save answer to context
    nextStep(); // Go to next question


  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>What is your __________________ ?</h2>
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

export default Question2;
