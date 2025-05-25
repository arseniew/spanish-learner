// src/types/index.ts

export interface Sentence {
  template: string; // e.g., "Yo ______ (comer) paella."
  answer: string;   // e.g., "como"
  verb?: string;    // Optional: added by getSelectedSentences
  tense?: string;   // Optional: added by getSelectedSentences
}

export interface TenseData {
  [tenseName: string]: Sentence[];
}

export interface LanguageData {
  [verbName: string]: TenseData;
}

export type Screen = 'config' | 'learning';

export type Feedback = 'correct' | 'incorrect' | null;
