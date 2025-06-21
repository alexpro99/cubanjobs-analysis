import * as fs from 'fs';



export function getPrompt(promptName: string): string {

    try {
        const promptFilePath = `./src/prompts/${promptName}.md`;
        const promptContent = fs.readFileSync(promptFilePath, 'utf8');
        return promptContent;
    } catch (error) {
        console.error('Error reading extraction prompt file:', error);
        throw error;
    }
}