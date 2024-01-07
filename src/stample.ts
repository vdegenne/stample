import {glob} from './paths.js';
import pathlib from 'path';
import fs from 'fs';
import {File} from './File.js';
import {
	Placeholder,
	askUserForPlaceHolders,
	makePlaceholdersDistinct,
	mergePlaceholders,
} from './placeholders.js';

/**
 * Mirror the files matched by the globs from source to destination
 */
export async function stampleInit(
	source: string,
	destination: string,
	globs: string | string[],
	placeholders?: Placeholder[],
) {
	const mirrors: {original: string; mirror: string}[] = [];
	const matches = await glob(globs, source);
	const dirs = new Set<string>();
	for (const original of matches) {
		const mirror = pathlib.resolve(
			destination,
			pathlib.relative(source, original),
		);
		mirrors.push({original, mirror});
		dirs.add(pathlib.dirname(mirror));
	}

	const files = mirrors.map((m) => new File(m.original, m.mirror));
	return files;
}

export async function stample(
	source: string,
	destination: string,
	globs: string[],
	placeholders: Placeholder[] = [],
	noUserInteraction = false,
) {
	const files = await stampleInit(source, destination, globs);
	const filePlaceholders = await extractAllPlaceholdersFromFilesList(files);
	for (const ph of placeholders) {
		const filePh = filePlaceholders.find((p) => p.raw == ph.raw);
		if (filePh && ph.value) {
			filePh.value = ph.value;
		}
	}
	if (
		filePlaceholders.some((p) => p.value === undefined) &&
		!noUserInteraction
	) {
		await askUserForPlaceHolders(filePlaceholders);
	}

	await transformAllFiles(files, filePlaceholders);
	await copyAllFile(files);

	return files;
}

/**
 * Takes a list of File objects and returns all placeholders found.
 */
export async function extractAllPlaceholdersFromFilesList(files: File[]) {
	let placeholders: Placeholder[] = [];
	for (const file of files) {
		placeholders = placeholders.concat(await file.extractPlaceholders());
	}
	return makePlaceholdersDistinct(placeholders);
}

export async function transformAllFiles(
	files: File[],
	placeholders: Placeholder[],
) {
	if (files.length == 0) {
		return;
	}
	const missingResolutionValue = placeholders.filter((p) => !p.value);
	if (missingResolutionValue.length > 0) {
		throw new Error(
			`Some placeholders are missing a resolution value, transformation aborted. (Missing values: ${missingResolutionValue
				.map((p) => p.name)
				.join(', ')})`,
		);
	}
	const filePlaceholders = await extractAllPlaceholdersFromFilesList(files);
	// Throws if some placeholders in the files were not provided
	const missingFilePlaceholders = filePlaceholders.filter(
		(p) => !placeholders.some((q) => q.raw == p.raw),
	);
	if (missingFilePlaceholders.length > 0) {
		throw new Error(
			`Some file placeholders were not provided in the placeholders passed argument. (Missing values: ${missingFilePlaceholders
				.map((p) => p.name)
				.join(', ')})`,
		);
	}

	// Finally transform
	await Promise.all(
		files.map((file) => file.transformContentWithPlaceholders(placeholders)),
	);
}

export async function copyAllFile(files: File[]) {
	try {
		await Promise.all(files.map((file) => file.copy()));
	} catch (error) {
		if (error.message.startsWith("transformed wasn't set")) {
			throw new Error('Some files are not transformed, copying canceled.');
		}
	}
}

export function getFileForFilename(files: File[], filename: string) {
	return files.find((f) => pathlib.basename(f.path) == filename);
}
