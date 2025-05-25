import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sentence, Feedback } from '../types';
import toast, { Toaster } from 'react-hot-toast';
import { SpecialCharacterKeyboard } from './SpecialCharacterKeyboard'; // Import keyboard

interface LearningScreenProps {
  sentences: Sentence[];
  onGoToConfig: () => void;
}

export const LearningScreen: React.FC<LearningScreenProps> = ({ sentences, onGoToConfig }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  // Keep showCorrectAnswer as it's used in the render logic provided
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  const [streak, setStreak] = useState(0);
  const [goodAnswers, setGoodAnswers] = useState(0);
  const [badAnswers, setBadAnswers] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null); // Ref for the Next button

  const focusInput = useCallback(() => {
      if (inputRef.current) {
          inputRef.current.focus();
      }
  }, []);

  // Focus logic: Focus input or Next button based on feedback state
  useEffect(() => {
    if (feedback === 'incorrect') {
        // When showing correction, try to focus the 'Next' button
        // If the button isn't rendered yet (rare), it won't focus, which is ok
        nextButtonRef.current?.focus();
    } else if (inputRef.current) {
       // Otherwise, focus the input
       inputRef.current.focus();
    }
  }, [feedback, currentIndex]); // Re-run when feedback changes or question changes

   // Reset state if sentences prop changes (e.g., new selection)
   useEffect(() => {
       setCurrentIndex(0);
       setUserAnswer('');
       setFeedback(null);
       setShowCorrectAnswer(false);
       setStreak(0);
       setGoodAnswers(0);
       setBadAnswers(0);
       // Ensure focus happens after state update on sentence change
       // Focus will be handled by the other useEffect on mount/reset
       requestAnimationFrame(focusInput);
   }, [sentences, focusInput]);

  if (sentences.length === 0) {
      return (
          <div className="learning-screen">
              <p className="warning-message">No sentences available for the selected verbs and tenses, or none were loaded.</p>
              <button onClick={onGoToConfig} className="config-button">Back to Setup</button>
          </div>
      );
  }


  const currentSentence = sentences[currentIndex];

  const moveToNext = useCallback(() => {
      // Use modulo for infinite looping through sentences
      const nextIndex = (currentIndex + 1) % sentences.length;
      setCurrentIndex(nextIndex);
      setUserAnswer('');
      setFeedback(null);
      setShowCorrectAnswer(false);
       // Focus will be handled by useEffect
  }, [currentIndex, sentences.length]); // Add dependencies

  // *** MODIFIED handleSubmit for DUAL Enter Key Behavior ***
  const handleSubmit = useCallback((event?: React.FormEvent) => {
    event?.preventDefault(); // Prevent default form submission

    // --- Behavior 1: If correction is currently shown, Enter acts as "Next" ---
    if (feedback === 'incorrect') {
        moveToNext(); // Call the function to move to the next sentence
        return;       // Stop further execution in this submit handler
    }

    // --- Behavior 2: If NOT showing correction, perform answer check ---

    // Check for empty answer ONLY during initial submission
    if (!userAnswer.trim()) {
        toast.error("Please enter an answer.", { duration: 1000, id: 'empty-toast' });
        inputRef.current?.focus(); // Keep focus on input
        return;
    }

    // Check if the answer is correct
    const isCorrect = userAnswer.trim().toLowerCase() === currentSentence.answer.toLowerCase();

    if (isCorrect) {
      // Correct Answer Logic
      setFeedback('correct'); // Set feedback (briefly)
      setShowCorrectAnswer(false); // Ensure correction isn't shown
      const newGoodAnswers = goodAnswers + 1;
      const newStreak = streak + 1;
      setGoodAnswers(newGoodAnswers);
      setStreak(newStreak);
      toast.success(`Correct! Streak: ${newStreak}`, { duration: 1500, id: 'feedback-toast' });
      // Auto-advance after a short delay
      const timer = setTimeout(() => {
         moveToNext();
      }, 500);
      return () => clearTimeout(timer); // Cleanup timer
    } else {
      // Incorrect Answer Logic
      setFeedback('incorrect'); // Set feedback to indicate incorrect state
      setShowCorrectAnswer(true); // Set state to *enable* rendering the correction
      setBadAnswers(prev => prev + 1);
      setStreak(0);
      toast.error('Incorrect. Press Enter or click Next.', { duration: 2500, id: 'feedback-toast' });
      // DO NOT call moveToNext here - wait for user action (Enter or Click)
      // Focus will shift to the "Next" button via useEffect
    }
  // Update dependencies to cover all variables/functions used inside
  }, [feedback, userAnswer, currentSentence.answer, goodAnswers, streak, moveToNext, setBadAnswers, setStreak, setGoodAnswers, setFeedback, setShowCorrectAnswer]);


  const handleSpecialCharClick = (char: string) => {
      // Only allow insertion if the input is not disabled (i.e., not showing correction)
      if (inputRef.current && feedback !== 'incorrect') {
          const start = inputRef.current.selectionStart ?? userAnswer.length;
          const end = inputRef.current.selectionEnd ?? userAnswer.length;
          const newValue = userAnswer.substring(0, start) + char + userAnswer.substring(end);
          setUserAnswer(newValue);

          const newCursorPos = start + char.length;
          requestAnimationFrame(() => {
              if (inputRef.current) {
                  inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                  inputRef.current.focus(); // Re-focus after insertion
              }
          });
      }
  };

  const renderSentenceContent = () => {
      const placeholder = "______";
      const placeholderIndex = currentSentence.template.indexOf(placeholder);

      if (placeholderIndex === -1) {
           // Fallback for template error
           return (
               <>
                   {currentSentence.template}
                   <span className="warning-message">(Template error)</span>
                   <input ref={inputRef} type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} disabled={feedback === 'incorrect'} className="answer-input" aria-label="Your answer" autoCapitalize="none" autoCorrect="off" spellCheck="false" />
               </>
            );
      }

      const before = currentSentence.template.substring(0, placeholderIndex);
      const after = currentSentence.template.substring(placeholderIndex + placeholder.length);

      // Render correction view if feedback is incorrect and showCorrectAnswer is true
      if (feedback === 'incorrect' && showCorrectAnswer) {
          return (
              <>
                  {before}
                  <span className="incorrect-answer">{userAnswer || "(empty)"}</span>
                  {' '}
                  <span className="correct-answer">({currentSentence.answer})</span>
                  {after}
              </>
          );
      }

      // Otherwise, render the input view
      return (
           <>
               {before}
               <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={feedback === 'incorrect'} // Disable input when showing correction
                  className="answer-input"
                  aria-label="Your answer"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
               />
               {after}
           </>
       );
  }

  return (
    <div className="learning-screen">
       <Toaster position="top-center" reverseOrder={false} />
      <div className="stats">
        <span>Streak: {streak}</span>
        <span>Correct: {goodAnswers}</span>
        <span>Incorrect: {badAnswers}</span>
        <span>Progress: {currentIndex + 1} / {sentences.length}</span>
      </div>

      {/* Form's onSubmit triggers handleSubmit, handles Enter key */}
      <form onSubmit={handleSubmit} className="learning-form">
        <p className="sentence">
            {renderSentenceContent()}
        </p>

         {/* Keyboard shown only when input is active */}
         {feedback !== 'incorrect' && (
             <SpecialCharacterKeyboard onCharClick={handleSpecialCharClick} />
         )}

        <div className="action-buttons">
            {/* Show Submit button ONLY when feedback is NOT incorrect */}
            {feedback !== 'incorrect' && (
              <button type="submit" disabled={!userAnswer.trim()} className="submit-button">
                Submit
              </button>
            )}

            {/* Show Next button ONLY when feedback IS incorrect */}
            {feedback === 'incorrect' && (
              <button
                ref={nextButtonRef} // Assign ref for focusing
                type="button" // Prevent form submission on click
                onClick={moveToNext} // Explicitly call moveToNext on click
                className="next-button"
              >
                Next →
              </button>
            )}
        </div>
      </form>

       <button onClick={onGoToConfig} className="config-button">
            ← Back to Setup
        </button>
    </div>
  );
};