import React, { useState, useEffect } from 'react';
// import { SpecialCharacterKeyboard } from './SpecialCharacterKeyboard'; // REMOVE THIS IMPORT
import { CheckboxGroup } from './CheckboxGroup';

interface ConfigScreenProps {
  availableVerbs: string[];
  availableTenses: string[];
  tenseGroups: { [key: string]: string[] };
  onStartLearning: (verbs: Set<string>, tenses: Set<string>) => void;
  initialSelectedVerbs?: Set<string>;
  initialSelectedTenses?: Set<string>;
}

export const ConfigScreen: React.FC<ConfigScreenProps> = ({
  availableVerbs,
  availableTenses,
  tenseGroups,
  onStartLearning,
  initialSelectedVerbs,
  initialSelectedTenses,
}) => {
  const [selectedVerbs, setSelectedVerbs] = useState<Set<string>>(initialSelectedVerbs || new Set());
  const [selectedTenses, setSelectedTenses] = useState<Set<string>>(initialSelectedTenses || new Set());
  const [error, setError] = useState<string | null>(null);

  // Effect to update internal state if initial props change after mount
  // This is important if App loads settings async and passes them down
  useEffect(() => {
    if (initialSelectedVerbs) {
      setSelectedVerbs(initialSelectedVerbs);
    }
  }, [initialSelectedVerbs]);

  useEffect(() => {
    if (initialSelectedTenses) {
      setSelectedTenses(initialSelectedTenses);
    }
  }, [initialSelectedTenses]);

  const handleVerbToggle = (verb: string) => {
    setSelectedVerbs(prev => {
      const next = new Set(prev);
      if (next.has(verb)) {
        next.delete(verb);
      } else {
        next.add(verb);
      }
      return next;
    });
    setError(null);
  };

  const handleTenseToggle = (tense: string) => {
    setSelectedTenses(prev => {
      const next = new Set(prev);
      if (next.has(tense)) {
        next.delete(tense);
      } else {
        next.add(tense);
      }
      return next;
    });
     setError(null);
  };

  const handleVerbToggleAll = (select: boolean) => {
    setSelectedVerbs(select ? new Set(availableVerbs) : new Set());
    setError(null);
  };

   const handleTenseToggleAll = (select: boolean) => {
    setSelectedTenses(select ? new Set(availableTenses) : new Set());
    setError(null);
  };

   const handleTenseGroupToggle = (groupTenses: string[], select: boolean) => {
       setSelectedTenses(prev => {
           const next = new Set(prev);
           groupTenses.forEach(tense => {
               if (availableTenses.includes(tense)) {
                   if (select) {
                       next.add(tense);
                   } else {
                       next.delete(tense);
                   }
               }
           });
           return next;
       });
       setError(null);
   };


  const handleStartClick = () => {
    if (selectedVerbs.size === 0 || selectedTenses.size === 0) {
      setError('Please select at least one verb and one tense.');
      return;
    }
    setError(null);
    onStartLearning(selectedVerbs, selectedTenses);
  };

  // REMOVE THIS FUNCTION
  // const handleCharInsert = (char: string) => {
  //   console.log("Special char clicked (not inserted here):", char);
  // };

  const tenseGroupItems = Object.entries(tenseGroups)
    .filter(([_, items]) => items.some(item => availableTenses.includes(item)))
    .map(([name, items]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        items: items,
    }));


  return (
    <div className="config-screen">
      <h1>Spanish Verb Practice Setup</h1>

       {(availableVerbs.length === 0 || availableTenses.length === 0) && (
           <p className="warning-message">
               Warning: No verbs or tenses found. Please check the <code>lang_data</code> directory and run the build process if needed.
           </p>
       )}

      <div className="selection-area">
         <CheckboxGroup
            title="Verbs"
            items={availableVerbs}
            selectedItems={selectedVerbs}
            onToggle={handleVerbToggle}
            onToggleAll={handleVerbToggleAll}
          />

          <CheckboxGroup
            title="Tenses"
            items={availableTenses}
            selectedItems={selectedTenses}
            onToggle={handleTenseToggle}
            onToggleAll={handleTenseToggleAll}
            itemGroups={tenseGroupItems}
            onToggleGroup={handleTenseGroupToggle}
         />
      </div>

      {/* REMOVE THE KEYBOARD ELEMENT */}
      {/* <SpecialCharacterKeyboard onCharClick={handleCharInsert} /> */}

      {error && <p className="error-message">{error}</p>}

      <button
        className="start-button"
        onClick={handleStartClick}
        disabled={selectedVerbs.size === 0 || selectedTenses.size === 0 || availableVerbs.length === 0 || availableTenses.length === 0}
      >
        Start Learning
      </button>
    </div>
  );
};