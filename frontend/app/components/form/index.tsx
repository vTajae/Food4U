import { useFormContext } from './context';
import Question1 from './q1'
;
import Question2 from './q2';


const Form = () => {
  const { currentStep, completed } = useFormContext();

  if (completed) {
    return <h1>Thank you! You&apos;ve completed the form.</h1>;
  }

  // Render the current question based on the step
  const renderQuestion = () => {
    switch (currentStep) {
      case 0:
        return <Question1 />;
      case 1:
        return <Question2 />;
      // case 2:
      //   return <Question3 />;
      // case 3:
      //   return <Question4 />;
      // case 4:
      //   return <Question5 />;
      default:
        return null;
    }
  };

  return <div>{renderQuestion()}</div>;
};

export default Form;
