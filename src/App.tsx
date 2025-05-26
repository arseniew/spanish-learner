// src/App.tsx
import { useState, useEffect, useMemo } from 'react';
import { ConfigScreen } from './components/ConfigScreen';
import { LearningScreen } from './components/LearningScreen';
import { Screen } from './types';

// Use standard ES Module import. This relies on src/data.ts existing
// when Vite builds/serves this file, which is ensured by the build:data script.
import {
    availableVerbs,
    availableTenses,
    tenseGroups,
    getSelectedSentences
} from './data'; // <-- STANDARD IMPORT

import './styles.css';

// Define keys for localStorage - Export them for testing purposes
export const APP_SETTINGS_KEY = 'APP_SETTINGS_KEY';
export const APP_SCREEN_KEY = 'APP_SCREEN_KEY';

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

  // Effect to load settings and screen state from localStorage on mount
  useEffect(() => {
    // Load settings
    try {
      const savedSettings = localStorage.getItem(APP_SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings && Array.isArray(parsedSettings.verbs) && Array.isArray(parsedSettings.tenses)) {
          const lowercasedVerbs = parsedSettings.verbs.map((v: string) => v.toLowerCase());
          const lowercasedTenses = parsedSettings.tenses.map((t: string) => t.toLowerCase());
          setCurrentSelection({
            verbs: new Set(lowercasedVerbs),
            tenses: new Set(lowercasedTenses),
          });
        } else {
          console.warn("Invalid settings format in localStorage", parsedSettings);
        }
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }

    // Load screen state
    try {
      const savedScreen = localStorage.getItem(APP_SCREEN_KEY);
      if (savedScreen && (savedScreen === 'config' || savedScreen === 'learning')) {
        setCurrentScreen(savedScreen as Screen);
      } else if (savedScreen) {
        console.warn("Invalid screen value in localStorage:", savedScreen, "Defaulting to 'config'.");
        // setCurrentScreen('config'); // Already default, but explicit if needed
      }
    } catch (error) {
      // This catch block might be less critical for screen state unless storage itself fails
      console.error("Failed to load screen state from localStorage", error);
    }
  }, []); // Empty dependency array ensures this runs only on mount

  // Effect to save screen state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(APP_SCREEN_KEY, currentScreen);
    } catch (error) {
      console.error("Failed to save screen state to localStorage", error);
    }
  }, [currentScreen]);

  const startLearning = (verbs: Set<string>, tenses: Set<string>) => {
    setCurrentSelection({ verbs, tenses });
    setCurrentScreen('learning');
    // Save to localStorage when starting learning
    try {
      const settingsToSave = JSON.stringify({
        verbs: Array.from(verbs).map(v => v.toLowerCase()), // Convert Set to Array and lowercase for JSON
        tenses: Array.from(tenses).map(t => t.toLowerCase()), // Convert Set to Array and lowercase for JSON
      });
      localStorage.setItem(APP_SETTINGS_KEY, settingsToSave);
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  };

  const goToConfig = () => {
    setCurrentScreen('config');
    // setCurrentSelection(null); // Keep settings even when going back to config
    // Optionally, clear localStorage when going to config explicitly
    // localStorage.removeItem(APP_SETTINGS_KEY); 
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