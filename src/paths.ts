import fs from 'fs';
import path from 'path';
import FastGlob from 'fast-glob';

export function basename(filepath: string) {
	return path.basename(filepath);
}

export function dirname(filepath: string) {
	return path.dirname(filepath);
}

export function isAbsolute(filepath: string) {
	return path.isAbsolute(filepath);
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

export async function glob(source: string | string[], cwd = '.') {
	return await FastGlob(source, {cwd, absolute: true});
}

export {path as pathlib};
