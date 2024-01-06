import fs from 'fs';
import path from 'path';

export function basename(filepath: string) {
	return path.basename(filepath);
}

export function dirname(filepath: string) {
	return path.dirname(filepath);
}

export async function createDirectory(dirpath: string): Promise<void> {
	try {
		await fs.promises.mkdir(dirpath, {recursive: true});
	} catch (err) {
		console.error('Error creating directory:', err);
	}
}

export {path as pathlib};
