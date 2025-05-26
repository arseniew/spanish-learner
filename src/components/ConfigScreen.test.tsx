// src/components/ConfigScreen.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfigScreen } from './ConfigScreen'; // Adjust path as necessary

describe('ConfigScreen Component Initialization', () => {
  const mockAvailableVerbs = ['verbA', 'verbB', 'verbC', 'verbD'];
  const mockAvailableTenses = ['tenseX', 'tenseY', 'tenseZ'];
  const mockTenseGroups = { group1: ['tenseX'] };
  const mockOnStartLearning = vi.fn();

  it('should initialize with no verbs or tenses selected if props are empty sets', () => {
    render(
      <ConfigScreen
        availableVerbs={mockAvailableVerbs}
        availableTenses={mockAvailableTenses}
        tenseGroups={mockTenseGroups}
        onStartLearning={mockOnStartLearning}
        initialSelectedVerbs={new Set()}
        initialSelectedTenses={new Set()}
      />
    );

    mockAvailableVerbs.forEach(verb => {
      const verbCheckbox = screen.getByRole('checkbox', { name: verb }) as HTMLInputElement;
      expect(verbCheckbox.checked).toBe(false);
    });

    mockAvailableTenses.forEach(tense => {
      const tenseCheckbox = screen.getByRole('checkbox', { name: tense }) as HTMLInputElement;
      expect(tenseCheckbox.checked).toBe(false);
    });
  });

  it('should initialize with no verbs or tenses selected if props are undefined', () => {
    render(
      <ConfigScreen
        availableVerbs={mockAvailableVerbs}
        availableTenses={mockAvailableTenses}
        tenseGroups={mockTenseGroups}
        onStartLearning={mockOnStartLearning}
        // initialSelectedVerbs and initialSelectedTenses are omitted (undefined)
      />
    );

    mockAvailableVerbs.forEach(verb => {
      const verbCheckbox = screen.getByRole('checkbox', { name: verb }) as HTMLInputElement;
      expect(verbCheckbox.checked).toBe(false);
    });

    mockAvailableTenses.forEach(tense => {
      const tenseCheckbox = screen.getByRole('checkbox', { name: tense }) as HTMLInputElement;
      expect(tenseCheckbox.checked).toBe(false);
    });
  });

  it('should correctly initialize checkboxes based on initialSelectedVerbs and initialSelectedTenses props', () => {
    const initialVerbs = new Set(['verbA', 'verbC']);
    const initialTenses = new Set(['tenseY']);

    render(
      <ConfigScreen
        availableVerbs={mockAvailableVerbs}
        availableTenses={mockAvailableTenses}
        tenseGroups={mockTenseGroups}
        onStartLearning={mockOnStartLearning}
        initialSelectedVerbs={initialVerbs}
        initialSelectedTenses={initialTenses}
      />
    );

    // Check verbs
    mockAvailableVerbs.forEach(verb => {
      const verbCheckbox = screen.getByRole('checkbox', { name: verb }) as HTMLInputElement;
      if (initialVerbs.has(verb)) {
        expect(verbCheckbox.checked).toBe(true);
      } else {
        expect(verbCheckbox.checked).toBe(false);
      }
    });

    // Check tenses
    mockAvailableTenses.forEach(tense => {
      const tenseCheckbox = screen.getByRole('checkbox', { name: tense }) as HTMLInputElement;
      if (initialTenses.has(tense)) {
        expect(tenseCheckbox.checked).toBe(true);
      } else {
        expect(tenseCheckbox.checked).toBe(false);
      }
    });
  });

  it('should show warning if availableVerbs or availableTenses are empty', () => {
    render(
      <ConfigScreen
        availableVerbs={[]}
        availableTenses={[]}
        tenseGroups={{}}
        onStartLearning={mockOnStartLearning}
      />
    );
    expect(screen.getByText(/Warning: No verbs or tenses found/i)).toBeInTheDocument();
  });
});
