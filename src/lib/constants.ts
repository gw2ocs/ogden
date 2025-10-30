import { getRootData } from '@sapphire/pieces';
import { join } from 'path';

export const mainFolder = getRootData().root;
export const rootFolder = join(mainFolder, '..');
export const srcDir = join(rootFolder, 'src');

export const RandomLoadingMessage = ['Computing...', 'Thinking...', 'Cooking some food', 'Give me a moment', 'Loading...'];
