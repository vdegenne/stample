import {glob} from './paths.js';
import pathlib from 'path';
import fs from 'fs';
import {File} from './File.js';
import {Placeholder, makePlaceholdersDistinct} from './placeholders.js';

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
	const filePlaceholders = await extractAllPlaceholdersFromFilesList(files);
	// const mergedPlaceholders = mergePlaceholders(
	// 	filePlaceholders,
	// 	placeholders ?? [],
	// );
	// const unresolvedPlaceholders = mergedPlaceholders.filter(
	// 	(p) => p.resolveTo == undefined,
	// );
	return;

	await Promise.all(
		[...dirs].map((dir) => fs.promises.mkdir(dir, {recursive: true})),
	);

	await Promise.all(
		mirrors.map(async ({original, mirror}) => {
			// Overwrites by default.
			await fs.promises.copyFile(original, mirror);
		}),
	);
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
	if (files.length === 0) {
		return;
	}
	const missingResolutionValue = placeholders.filter((p) => !p.resolveTo);
	if (missingResolutionValue.length > 0) {
		throw new Error(
			`Some placeholders are missing a resolution value, transformation aborted. (Missing values: ${missingResolutionValue.join(
				', ',
			)})`,
		);
	}
	const filePlaceholders = await extractAllPlaceholdersFromFilesList(files);
	// Throws if some placeholders in the files were not provided
	const missingFilePlaceholders = filePlaceholders.filter(
		(p) => !placeholders.some((q) => q.value == p.value),
	);
	if (missingFilePlaceholders.length > 0) {
		throw new Error(
			`Some file placeholders were not provided in the placeholders passed argument. (Missing values: ${missingFilePlaceholders.join(
				', ',
			)})`,
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
