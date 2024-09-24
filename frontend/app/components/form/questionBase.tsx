// QuestionComponent.tsx
import React, { useEffect } from 'react';
import { SearchBarWithButtons } from '../search/refSearchwButton';
import lodash from "lodash";
import { useFormContext } from './context';
import { Suggestion } from '../../../api/interfaces/refs';


interface QuestionProps {
  questionId: number;
  questionText: string;
  queryKey: string;
}

const QuestionComponent: React.FC<QuestionProps> = ({ questionId, questionText, queryKey }) => {
  const { state, setAnswer } = useFormContext();
  const [selectedAnswers, setSelectedAnswers] = React.useState<Suggestion[]>([]);
  const { isEqual } = lodash;

  useEffect(() => {
    const existingQuestion = state.answers.find((q) => q.questionId === questionId);
    if (existingQuestion) {
      if (!isEqual(existingQuestion.answers, selectedAnswers)) {
        setSelectedAnswers(existingQuestion.answers);
      }
    } else {
      if (selectedAnswers.length > 0) {
        setSelectedAnswers([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.answers, questionId]);

  const handleSuggestionSelect = (suggestions: Suggestion[]) => {
    setSelectedAnswers(suggestions);
    setAnswer(questionId, suggestions);
  };

  return (
    <div>
      <h3>{questionText}</h3>
      <SearchBarWithButtons
        key={questionId}
        onSuggestionSelect={handleSuggestionSelect}
        placeholderText="Type to search"
        queryKey={queryKey}
        selectedSuggestions={selectedAnswers}
      />
      {selectedAnswers.length > 0 && (
        <ul>
          {selectedAnswers.map((item) => (
            <li key={`${item.name}-${item.code || ''}`}>
              {item.name} {item.code ? `(${item.code})` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionComponent;
