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
    const verbArray = Array.from(verbs as Set<string>);
    const tenseArray = Array.from(tenses as Set<string>);
    if (verbArray.length === 0 || tenseArray.length === 0) return [];
    return [{
      verb: verbArray[0],
      tense: tenseArray[0],
      template: `Mock sentence for ${verbArray[0]} ______ (${tenseArray[0]}).`,
      answer: "mockAnswer",
      fullSentence: `Mock sentence for ${verbArray[0]} mockAnswer (${tenseArray[0]}).`
    }];
  }),
}));

describe('App Component localStorage Interaction', () => {
  let setItemSpy: ReturnType<typeof vi.spyOn>;
  let getItemSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    setItemSpy = vi.spyOn(window.localStorage, 'setItem');
    getItemSpy = vi.spyOn(window.localStorage, 'getItem'); 
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should save currentSelection to localStorage when startLearning is called', async () => {
    render(<App />);
    const user = userEvent.setup();
    // Using findByLabelText for initial interaction is more robust if element is not immediately available
    const verbCheckbox = await screen.findByLabelText('verb1');
    const tenseCheckbox = await screen.findByLabelText('tense1');
    await user.click(verbCheckbox);
    await user.click(tenseCheckbox);
    const startButton = screen.getByRole('button', { name: /start learning/i });
    await user.click(startButton);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      APP_SETTINGS_KEY, 
      JSON.stringify({ verbs: ['verb1'], tenses: ['tense1'] })
    );
  });

  it('should load currentSelection from localStorage on mount', async () => {
    const mockSelection = { verbs: ['verb2'], tenses: ['tense2'] };
    getItemSpy.mockReturnValueOnce(JSON.stringify(mockSelection)); 
    getItemSpy.mockReturnValueOnce(null); // For screen key

    render(<App />);

    const verbCheckbox = await screen.findByLabelText('verb2', {}, { timeout: 3000 }) as HTMLInputElement;
    expect(verbCheckbox).toBeInTheDocument();
    expect(verbCheckbox.checked).toBe(true);

    const tenseCheckbox = await screen.findByLabelText('tense2', {}, { timeout: 3000 }) as HTMLInputElement;
    expect(tenseCheckbox).toBeInTheDocument();
    expect(tenseCheckbox.checked).toBe(true);
  });

  it('should save currentScreen to localStorage when it changes', async () => {
    render(<App />);
    const user = userEvent.setup();
    expect(localStorage.setItem).toHaveBeenCalledWith(APP_SCREEN_KEY, 'config'); 

    const verbCheckbox = await screen.findByLabelText('verb1');
    const tenseCheckbox = await screen.findByLabelText('tense1');
    await user.click(verbCheckbox);
    await user.click(tenseCheckbox);
    
    const startButton = screen.getByRole('button', { name: /start learning/i });
    await user.click(startButton);

    expect(await screen.findByText(/Mock sentence for verb1/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /your answer/i })).toBeInTheDocument();
    expect(screen.getByText(/\(tense1\)\./i)).toBeInTheDocument();
    expect(setItemSpy).toHaveBeenCalledWith(APP_SCREEN_KEY, 'learning'); 
  });

   it('should load currentScreen from localStorage on mount and render LearningScreen', async () => {
    const mockScreen = 'learning' as Screen;
    const mockSelection = { verbs: ['verb1'], tenses: ['tense1'] };
    getItemSpy.mockReturnValueOnce(JSON.stringify(mockSelection)); 
    getItemSpy.mockReturnValueOnce(mockScreen); 

    render(<App />);

    expect(await screen.findByText(/Mock sentence for verb1/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /your answer/i })).toBeInTheDocument();
    expect(screen.getByText(/\(tense1\)\./i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start learning/i })).not.toBeInTheDocument(); 
  });
  
  it('should load currentScreen as "config" from localStorage on mount and render ConfigScreen', async () => { 
    const mockScreen = 'config' as Screen;
    const mockSelection = { verbs: ['verb1'], tenses: ['tense1'] };
    getItemSpy.mockReturnValueOnce(JSON.stringify(mockSelection)); 
    getItemSpy.mockReturnValueOnce(mockScreen); 

    render(<App />);
    
    const verbCheckbox = await screen.findByLabelText('verb1', {}, { timeout: 3000 }) as HTMLInputElement;
    // The button check can remain separate or be part of a broader setup verification if needed
    expect(screen.getByRole('button', { name: /start learning/i })).toBeInTheDocument(); 
    expect(verbCheckbox).toBeInTheDocument();
    expect(verbCheckbox.checked).toBe(true);
  });
});
