import fs from 'fs';
import path from 'path';
import {glob as _glob} from 'glob';

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

export function stripBasedir(filepath: string, basedir: string): string {
	if (isAbsolute(filepath)) {
		return filepath;
	}
	const resolvedFilePath = path.resolve(filepath);
	const resolvedBaseDir = path.resolve(basedir);

	const relativePath = path.relative(resolvedBaseDir, resolvedFilePath);
	return relativePath;
}

export function isAbsolute(filepath: string) {
	return path.isAbsolute(filepath);
}

export function glob(pattern: string | string[]) {
	return _glob.sync(pattern);
}

export {path as pathlib};
