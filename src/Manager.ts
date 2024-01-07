import {glob} from './paths.js';
import pathlib from 'path';
import fs from 'fs';
import {File} from './File.js';
import {
	Placeholder,
	extractAllPlaceholdersFromFilesList,
} from './placeholders.js';

/**
 * Mirror the files matched by the globs from source to destination
 */
export async function init(
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
