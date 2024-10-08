// Form.tsx
import React, { useEffect } from "react";
import { useFormContext } from "./context";
import QuestionComponent from "./questionBase";
import { useFetcher, useNavigate } from "@remix-run/react";
import { Suggestion } from "../../../api/schemas/refs"; // Adjust the path as necessary

interface ActionData {
  status: boolean;
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
      questionId: 5,
      questionText: "Favorite Cuisine?",
      queryKey: "cuisines",
    },
    {
      questionId: 5555,
      questionText: "What type of diet do you follow?",
      queryKey: "diets",
    },
    {
      questionId: 1,
      questionText: "Do you have a medical condition?",
      queryKey: "icd10cm",
    },
    {
      questionId: 11,
      questionText: "Do you have any allergies or dietary restrictions?",
      queryKey: "conditions",
    },
    {
      questionId: 555,
      questionText: "Average Cost Per Meal",
      queryKey: "price",
    },
  ];

  const isFinalStep = state.currentStep >= questions.length;

  // Prepare the form data to be sent
  const preparedFormData = {
    submission: state.answers.map((question) => ({
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
    //console.log("Fetcher state:", fetcher.state);
    //console.log("Fetcher data:", fetcher.data);

    if (fetcher.data?.status) {
      //console.log("Submission successful");
      // Clear the form state
      localStorage.removeItem("formState");
      // Navigate to /dashboard
      navigate("/dashboard");
    }
  }, [fetcher.data, fetcher.state, navigate]);

  //console.log(fetcher.data);

  // Display success or error message
  const renderMessage = () => {
    if (fetcher.data && !fetcher.data.status) {
      return <p style={{ color: "red" }}>{fetcher.data.message}</p>;
    }
    return null;
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("submission", JSON.stringify(preparedFormData));
    //console.log("FormData:", formData);

    // Submit the form data using fetcher
    fetcher.submit(formData, { method: "post", action: "/welcome" });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-white rounded-lg shadow-lg">
    {isFinalStep ? (
      <div className="col-span-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Review Your Answers
        </h2>
        {state.answers.map((question) => {
          const questionInfo = questions.find(
            (q) => q.questionId === question.questionId
          );
          return (
            <div key={question.questionId} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {questionInfo?.questionText}
              </h3>
              {Array.isArray(question.answers) ? (
                <p className="text-gray-600">
                  {(question.answers as Suggestion[])
                    .map((a) => {
                      const name = a.name ? a.name : "";
                      const value = a.value ? ` ${a.value}` : "";
                      return name + value;
                    })
                    .join(", ")}
                </p>
              ) : (
                <p className="text-gray-600">{question.answers}</p>
              )}
            </div>
          );
        })}
  
        {renderMessage()}
  
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg font-medium ${
              isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 transition"
            }`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg font-medium ${
              isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600 transition"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    ) : (
      <div className="col-span-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4 flex flex-col bg-gray-50 rounded-lg p-6">
        {/* Question component fills the remaining space */}
        <div className="flex-1 p-4 overflow-auto">
          <QuestionComponent {...questions[state.currentStep]} />
        </div>
  
        {/* Button container fixed at the bottom */}
        <div className="p-4">
          <div className="flex justify-between">
            <button
              type="button"
              disabled={state.currentStep === 0}
              onClick={goToPreviousStep}
              className={`px-4 py-2 rounded-lg font-medium ${
                state.currentStep === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 transition"
              }`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={goToNextStep}
              className="px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  
  );
};

export default Form;
