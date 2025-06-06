// scripts/build-data.mjs
import fs from 'fs/promises';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'lang_data');
const outputFilePath = path.resolve(process.cwd(), 'src/data.ts');

// Basic tense groupings (customize as needed)
const tenseGroups = {
    present: ['presente', 'subjuntivo_presente'],
    past: ['imperfecto', 'preterito_indefinido', 'preterito_perfecto_compuesto', 'pluscuamperfecto', 'subjuntivo_imperfecto_ra'],
    future: ['futuro'],
    conditional: ['condicional'],
    imperative: ['imperativo_afirmativo']
};

async function parseSentenceFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && line.includes(';'))
            .map(line => {
                const parts = line.split(';');
                if (parts.length >= 2) {
                    return {
                        template: parts[0].trim(),
                        answer: parts[1].trim(),
                    };
                }
                console.warn(`Skipping invalid line in ${path.basename(filePath)}: ${line}`);
                return null;
            })
            .filter(Boolean); // Remove null entries from invalid lines
    } catch (error) {
        if (error.code === 'ENOENT') {
             console.warn(`Warning: File not found ${filePath}. Skipping.`);
        } else {
             console.warn(`Warning: Could not read or parse ${filePath}:`, error.message);
        }
        return [];
    }
}

async function buildData() {
    const verbs = {};
    const allTensesSet = new Set();
    let availableVerbs = [];

    try {
        const dirents = await fs.readdir(dataDir, { withFileTypes: true });

        availableVerbs = dirents
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const verbDir of dirents) {
            if (!verbDir.isDirectory()) continue;

            const verbName = verbDir.name;
            verbs[verbName] = {};
            const verbPath = path.join(dataDir, verbName);
            let tenseFiles = [];
             try {
                tenseFiles = await fs.readdir(verbPath);
            } catch(readDirErr) {
                console.warn(`Warning: Could not read directory ${verbPath}:`, readDirErr.message);
                continue; // Skip this verb directory if unreadable
            }


            for (const tenseFile of tenseFiles) {
                if (tenseFile.endsWith('.txt')) {
                    const tenseName = tenseFile.replace('.txt', '');
                    allTensesSet.add(tenseName);
                    const filePath = path.join(verbPath, tenseFile);
                    verbs[verbName][tenseName] = await parseSentenceFile(filePath);
                }
            }
            // Clean up verbs that ended up with no tenses/sentences
            if (Object.keys(verbs[verbName]).length === 0) {
                delete verbs[verbName];
                 // Also remove from availableVerbs list
                availableVerbs = availableVerbs.filter(v => v !== verbName);
                console.warn(`Warning: Verb '${verbName}' had no valid tense files. Excluding it.`);
            }
        }
    } catch (error) {
         if (error.code === 'ENOENT') {
             console.warn(`Warning: Language data directory '${dataDir}' not found. No data will be generated.`);
         } else {
             console.error("Error reading language data directory:", error);
         }
        // If dir doesn't exist or error reading, create empty data
    }

    const allTenses = Array.from(allTensesSet).sort();

    // Create classified tense groups based on available tenses
    const classifiedTenseGroups = {};
    for (const group in tenseGroups) {
        classifiedTenseGroups[group] = tenseGroups[group].filter(tense => allTensesSet.has(tense));
        // Remove group if it has no available tenses after filtering
        if (classifiedTenseGroups[group].length === 0) {
             delete classifiedTenseGroups[group];
        }
    }

    const outputContent = `// This file is generated automatically by scripts/build-data.mjs
// Do not edit this file manually!

import { LanguageData, Sentence } from './types';

export const languageData: LanguageData = ${JSON.stringify(verbs, null, 2)};

export const availableVerbs: string[] = ${JSON.stringify(availableVerbs.sort(), null, 2)};

export const availableTenses: string[] = ${JSON.stringify(allTenses, null, 2)};

// Groupings based on actual available tenses
export const tenseGroups: { [key: string]: string[] } = ${JSON.stringify(classifiedTenseGroups, null, 2)};

// Helper function to get sentences for selection
export function getSelectedSentences(selectedVerbs: Set<string>, selectedTenses: Set<string>): Sentence[] {
  const sentences: Sentence[] = [];
  selectedVerbs.forEach(verb => {
    if (languageData[verb]) {
      selectedTenses.forEach(tense => {
        if (languageData[verb][tense]) {
          // Add verb/tense info to each sentence for potential future use
          const sentencesWithMeta = languageData[verb][tense].map(s => ({
              ...s,
              verb,
              tense
          }));
          sentences.push(...sentencesWithMeta);
        }
      });
    }
  });
  // Simple shuffle
  return sentences.sort(() => Math.random() - 0.5);
}
`;

    try {
        await fs.writeFile(outputFilePath, outputContent, 'utf-8');
        console.log(`Successfully generated \${outputFilePath}`);
        if (availableVerbs.length === 0 || allTenses.length === 0) {
             console.warn("Warning: Generated data is empty. Check the 'lang_data' directory and file contents.");
        }
    } catch (error) {
        console.error(`Error writing ${outputFilePath}:`, error);
    }
}

buildData();
