import { useFormContext } from './context';
import Question1 from './q1';
import Question2 from './q2';
import Question3 from './q3';
import Question4 from './q4';
import Question5 from './q5';
import Final from './final';

const Form = () => {
  const { currentStep, completed, enableEdit } = useFormContext();

  if (completed) {
    return (
      <div>
        <h1>Thank you! You&apos;ve completed the form.</h1>
        <button onClick={enableEdit}>Edit Your Answers</button>
      </div>
    );
  }

  const renderQuestion = () => {
    switch (currentStep) {
      case 0:
        return <Question1 />;
      case 1:
        return <Question2 />;
      case 2:
        return <Question3 />;
      case 3:
        return <Question4 />;
      case 4:
        return <Question5 />;
      case 5:
        return <Final />;
      default:
        return null;
    }
  };

  return <div>{renderQuestion()}</div>;
};

export default Form;
