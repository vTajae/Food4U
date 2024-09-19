import { useFormContext } from './context';

const FinalQuestion = () => {
  const {
    prevStep,
    openModal,
    isEditable,
    enableEdit,
    lockInValues,
    answers,  // Get all answers from the context
  } = useFormContext();

  // Helper function to filter out options
  const filterAnswers = () => {
    return Object.keys(answers).reduce((acc, key) => {
      const questionKey = key as keyof typeof answers;
      const { options, ...rest } = answers[questionKey];  // Remove `options` from each question
      acc[questionKey] = rest;  // Only add question and answer to the final object
      return acc;
    }, {} as Partial<typeof answers>);
  };

  const filteredAnswers = filterAnswers();  // Get filtered answers without `options`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditable) {
      // Submit only the filtered answers (without `options`)
      try {
        const response = await fetch('/user/populate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filteredAnswers),  // Send the filtered answer data model
        });

        if (response.ok) {
          openModal();  // Show confirmation modal after submission
          lockInValues();  // Lock the answers after successful submission
        } else {
          console.error('Error:', response.statusText);
          console.log(filteredAnswers);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Final Question: Please review your answers before submission.</h2>
      
      {/* Display the filtered answers to the user for confirmation */}
      <pre>{JSON.stringify(filteredAnswers, null, 2)}</pre>

      <button type="submit" disabled={!isEditable}>
        Submit All
      </button>
      <button type="button" onClick={prevStep}>
        Previous
      </button>
      {!isEditable && (
        <button type="button" onClick={enableEdit}>
          Edit
        </button>
      )}
    </form>
  );
};

export default FinalQuestion;
