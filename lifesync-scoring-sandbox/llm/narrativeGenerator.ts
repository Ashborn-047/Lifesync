import fs from 'fs';
import path from 'path';

const PROMPT_PATH = path.join(__dirname, 'personaNarrativePrompt.txt');

export function generateNarrative(persona: string, ocean: any) {
    const template = fs.readFileSync(PROMPT_PATH, 'utf-8');
    let prompt = template.replace('{{persona}}', persona);
    prompt = prompt.replace('{{O}}', ocean.O);
    prompt = prompt.replace('{{C}}', ocean.C);
    prompt = prompt.replace('{{E}}', ocean.E);
    prompt = prompt.replace('{{A}}', ocean.A);
    prompt = prompt.replace('{{N}}', ocean.N);

    console.log("Generated Prompt:\n", prompt);
    // Call LLM API here
}
