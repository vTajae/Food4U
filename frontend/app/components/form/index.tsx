// Form.tsx
import React, { useEffect } from "react";
import { useFormContext } from "./context";
import QuestionComponent from "./questionBase";
import { useFetcher, useNavigate } from "@remix-run/react";
import { Suggestion } from "../../../api/schemas/refs"; // Adjust the path as necessary

interface ActionData {
  success: boolean;
  message: string;
}

interface Question {
  questionId: number;
  questionText: string;
  queryKey: string;
}

const Form: React.FC = () => {
  const { state, goToNextStep, goToPreviousStep } = useFormContext();
  const fetcher = useFetcher<ActionData>();
  const navigate = useNavigate();

  const questions: Question[] = [
    {
      questionId: 1,
      questionText: "Favorite Cuisine?",
      queryKey: "cuisines",
    },
    {
      questionId: 2,
      questionText: "What type of diet do you follow?",
      queryKey: "cuisines",
    },
    {
      questionId: 3,
      questionText: "Do you have a medical condition?",
      queryKey: "icd10cm",
    },
    {
      questionId: 4,
      questionText: "Do you have any allergies or dietary restrictions?",
      queryKey: "conditions",
    },
    {
      questionId: 5,
      questionText: "Average Cost Per Meal",
      queryKey: "price",
    },
  ];

  const isFinalStep = state.currentStep >= questions.length;

  // Prepare the form data to be sent
  const preparedFormData = {
    answers: state.answers.map((question) => ({
      questionId: question.questionId,
      queryKey: questions.find((q) => q.questionId === question.questionId)
        ?.queryKey,
      answers: question.answers,
    })),
  };

  // Determine if the form is submitting
  const isSubmitting = fetcher.state === "submitting";

  // Handle navigation upon successful submission
  useEffect(() => {
    if (fetcher.data?.success) {
      // Clear the form state
      localStorage.removeItem("formState");
      // Navigate to /dashboard
      navigate("/dashboard");
    }
  }, [fetcher.data, navigate]);

  // Display success or error message
  const renderMessage = () => {
    if (fetcher.data && !fetcher.data.success) {
      return <p style={{ color: "red" }}>{fetcher.data.message}</p>;
    }
    return null;
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("submission", JSON.stringify(preparedFormData));

    // Submit the form data using fetcher
    fetcher.submit(formData, { method: "post", action: "/welcome" });
  };

  return (
    <div>
      {isFinalStep ? (
        <div>
          <h2>Review Your Answers</h2>
          {state.answers.map((question) => {
            const questionInfo = questions.find(
              (q) => q.questionId === question.questionId
            );
            return (
              <div key={question.questionId}>
                <h3>{questionInfo?.questionText}</h3>
                {Array.isArray(question.answers) ? (
                  <p>
                    {(question.answers as Suggestion[])
                      .map((a) => {
                        // Check for both 'name' and 'value' and render them if they exist
                        const name = a.name ? a.name : "";
                        const value = a.value ? ` ${a.value}` : ""; // Append value if it exists
                        return name + value; // Concatenate name and value
                      })
                      .join(", ")}
                  </p>
                ) : (
                  <p>{question.answers}</p>
                )}
              </div>
            );
          })}

          {renderMessage()}
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={isSubmitting}
          >
            Back
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      ) : (
        <div>
          <QuestionComponent {...questions[state.currentStep]} />
          <div>
            <button
              type="button"
              disabled={state.currentStep === 0}
              onClick={goToPreviousStep}
            >
              Previous
            </button>
            <button type="button" onClick={goToNextStep}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
