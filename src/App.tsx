// src/App.tsx
import { useState, useEffect, useMemo } from 'react';
import { ConfigScreen } from './components/ConfigScreen';
import { LearningScreen } from './components/LearningScreen';
import { Screen, Sentence } from './types';

// Use standard ES Module import. This relies on src/data.ts existing
// when Vite builds/serves this file, which is ensured by the build:data script.
import {
    availableVerbs,
    availableTenses,
    tenseGroups,
    getSelectedSentences
} from './data'; // <-- STANDARD IMPORT

import './styles.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('config');
  const [currentSelection, setCurrentSelection] = useState<{verbs: Set<string>, tenses: Set<string>} | null>(null);

  // Memoize sentences to prevent re-shuffling on every render
  const sentencesForLearning = useMemo(() => {
      if (currentSelection) {
          // Check if the imported function is actually a function before calling
          if (typeof getSelectedSentences === 'function') {
             return getSelectedSentences(currentSelection.verbs, currentSelection.tenses);
          } else {
              // This case might happen if data.ts was generated empty/corrupted
              console.error("getSelectedSentences is not a function. Check src/data.ts generation.");
              return [];
          }
      }
      return [];
  // Add getSelectedSentences as a dependency if its identity could change (unlikely here)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSelection]);

  const startLearning = (verbs: Set<string>, tenses: Set<string>) => {
    setCurrentSelection({ verbs, tenses });
    setCurrentScreen('learning');
  };

  const goToConfig = () => {
    setCurrentScreen('config');
    setCurrentSelection(null);
  };

   // Effect to check if the imported data looks valid after mount
    useEffect(() => {
        // Check if the imported arrays are actually arrays and have content
        if (!Array.isArray(availableVerbs) || !Array.isArray(availableTenses)) {
             console.error("App loaded, but 'availableVerbs' or 'availableTenses' from data.ts are not arrays. Check data generation script and resulting src/data.ts.");
        } else if (availableVerbs.length === 0 || availableTenses.length === 0) {
             console.warn("App loaded but verb/tense data is empty. Ensure 'lang_data' has content and 'npm run build:data' ran successfully.");
        }
        if (typeof getSelectedSentences !== 'function') {
            console.error("App loaded, but 'getSelectedSentences' from data.ts is not a function. Check data generation script.");
        }
    }, []); // Run once on mount


  return (
    <div className="app-container">
      {currentScreen === 'config' && (
        <ConfigScreen
          // Pass the imported data directly
          availableVerbs={availableVerbs || []} // Add fallback for extra safety
          availableTenses={availableTenses || []}
          tenseGroups={tenseGroups || {}}
          onStartLearning={startLearning}
        />
      )}
      {currentScreen === 'learning' && (
        <LearningScreen
          sentences={sentencesForLearning}
          onGoToConfig={goToConfig}
        />
      )}
    </div>
  );
}

export default App;