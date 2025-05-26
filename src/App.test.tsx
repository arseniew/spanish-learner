// src/App.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App, { APP_SETTINGS_KEY, APP_SCREEN_KEY } from './App'; // Import App and exported keys
import { Screen } from './types';

// Mock the data module
vi.mock('./data', () => ({
  availableVerbs: ['verb1', 'verb2', 'verb3'],
  availableTenses: ['tense1', 'tense2', 'tense3'],
  tenseGroups: { group1: ['tense1'] },
  getSelectedSentences: vi.fn((verbs, tenses) => {
    // Return a mock structure based on input
    const verbArray = Array.from(verbs);
    const tenseArray = Array.from(tenses);
    if (verbArray.length === 0 || tenseArray.length === 0) return [];
    return [`Sentence for ${verbArray[0]} in ${tenseArray[0]}`];
  }),
}));

describe('App Component localStorage Interaction', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset mocks for spies if any were used directly on localStorage
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    // Clear up spies
    vi.restoreAllMocks();
  });

  it('should save currentSelection to localStorage when startLearning is called', async () => {
    render(<App />);
    const user = userEvent.setup();

    // Select a verb and a tense in ConfigScreen
    // Assuming CheckboxGroup renders checkboxes with role 'checkbox' and name attribute
    const verbCheckbox = await screen.findByRole('checkbox', { name: /verb1/i });
    const tenseCheckbox = await screen.findByRole('checkbox', { name: /tense1/i });
    
    await user.click(verbCheckbox);
    await user.click(tenseCheckbox);

    // Find and click the "Start Learning" button
    const startButton = screen.getByRole('button', { name: /start learning/i });
    await user.click(startButton);

    // Verify localStorage.setItem was called correctly for settings
    expect(localStorage.setItem).toHaveBeenCalledWith(
      APP_SETTINGS_KEY, // Use imported key
      JSON.stringify({ verbs: ['verb1'], tenses: ['tense1'] })
    );
  });

  it('should load currentSelection from localStorage on mount', () => {
    const mockSelection = { verbs: ['verb2'], tenses: ['tense2'] };
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(mockSelection)); // Use imported key

    render(<App />);

    // Check if ConfigScreen receives the correct initial props (indirect check)
    // Or, if App exposes currentSelection or passes it down in a testable way
    // For ConfigScreen, it means 'verb2' and 'tense2' should be checked.
    // This relies on ConfigScreen correctly using its initialSelectedVerbs/Tenses props.
    const verbCheckbox = screen.getByRole('checkbox', { name: /verb2/i }) as HTMLInputElement;
    const tenseCheckbox = screen.getByRole('checkbox', { name: /tense2/i }) as HTMLInputElement;

    expect(verbCheckbox.checked).toBe(true);
    expect(tenseCheckbox.checked).toBe(true);
  });

  it('should save currentScreen to localStorage when it changes', async () => {
    render(<App />);
    const user = userEvent.setup();
     // Initial screen is 'config', it should be saved on mount due to useEffect [currentScreen]
    expect(localStorage.setItem).toHaveBeenCalledWith(APP_SCREEN_KEY, 'config'); // Use imported key

    // Select a verb and a tense
    const verbCheckbox = await screen.findByRole('checkbox', { name: /verb1/i });
    const tenseCheckbox = await screen.findByRole('checkbox', { name: /tense1/i });
    await user.click(verbCheckbox);
    await user.click(tenseCheckbox);
    
    // Click "Start Learning" to change screen to 'learning'
    const startButton = screen.getByRole('button', { name: /start learning/i });
    await user.click(startButton);

    // Verify screen changed to 'learning' and was saved
    await screen.findByText(/sentence for verb1 in tense1/i); // Wait for learning screen
    expect(localStorage.setItem).toHaveBeenCalledWith(APP_SCREEN_KEY, 'learning'); // Use imported key
  });

   it('should load currentScreen from localStorage on mount and render LearningScreen', async () => {
    localStorage.setItem(APP_SCREEN_KEY, 'learning' as Screen); // Use imported key
    // For LearningScreen to show something, currentSelection also needs to be in localStorage
    const mockSelection = { verbs: ['verb1'], tenses: ['tense1'] };
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(mockSelection)); // Use imported key

    render(<App />);

    // Check if LearningScreen is rendered
    // This assumes LearningScreen has some distinct text or element
    expect(await screen.findByText(/sentence for verb1 in tense1/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start learning/i })).not.toBeInTheDocument(); // ConfigScreen's button
  });
  
  it('should load currentScreen as "config" from localStorage on mount and render ConfigScreen', async () => {
    localStorage.setItem(APP_SCREEN_KEY, 'config' as Screen); // Use imported key
    // Optionally, set some settings too
    const mockSelection = { verbs: ['verb1'], tenses: ['tense1'] };
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(mockSelection)); // Use imported key

    render(<App />);

    // Check if ConfigScreen is rendered
    expect(screen.getByRole('button', { name: /start learning/i })).toBeInTheDocument();
    // And that a verb from the loaded selection is checked
    const verbCheckbox = screen.getByRole('checkbox', { name: /verb1/i }) as HTMLInputElement;
    expect(verbCheckbox.checked).toBe(true);
  });
});
