import {input} from '@inquirer/prompts';
import type {File} from './File.js';

export const PLACEHOLDER_REGEX =
	/%([^%\n\r\x00-\x08\x0B\x0C\x0E-\x1F\u0080-\uFFFF]{1,20})%/g;

export class Placeholder {
	/**
	 * Raw placeholder value, e.g. '%TITLE%'
	 */
	raw: string;

	/**
	 * Name of the placeholder, e.g. `TITLE`
	 * It is usually the `placeholder` value without the surrounding %'s
	 */
	get name() {
		return this.raw.replaceAll('%', '').trim();
	}
	/**
	 * Used to determine what to replace placeholder with in transform functions.
	 */
	value?: string;

	constructor(raw: string, value?: string) {
		this.raw = raw;
		this.value = value;
	}
}

export function extractPlaceholdersFromContent(content: string): Placeholder[] {
	const placeholders: Placeholder[] = [];
	const matches = content.matchAll(PLACEHOLDER_REGEX);
	for (const match of matches) {
		const value = match[0];
		placeholders.push(new Placeholder(value));
	}
	return makePlaceholdersDistinct(placeholders);
}

export function mergePlaceholders(set1: Placeholder[], set2: Placeholder[]) {
	const newSet: Placeholder[] = set1.concat(set2);
	return makePlaceholdersDistinct(newSet);
}

export function makePlaceholdersDistinct(placeholders: Placeholder[]) {
	const distinct: Placeholder[] = [];
	for (const p of placeholders) {
		let alreadyExist = distinct.find((q) => q.raw == p.raw);
		if (alreadyExist) {
			if (!alreadyExist.value && p.value) {
				alreadyExist.value = p.value;
			}
			continue;
		} else {
			distinct.push(p);
		}
	}
	return distinct;
}

/**
 * Take a PlaceholderInfo array and ask user for all placeholder values.
 * User value will be written in `value` field of info objects.
 *
 * @param placeholders List of placeholders to resolve
 */
export async function askUserForPlaceHolders(placeholders: Placeholder[]) {
	for (const ph of placeholders) {
		if (ph.value == undefined) {
			const answer = await input({
				message: ph.name,
			});
			ph.value = answer;
		}
	}
}

export function transformContentWithPlaceholders(
	content: string,
	placeholders: Placeholder[],
) {
	for (const placeholder of placeholders) {
		if (!placeholder.value) {
			return;
		}
		content = content.replaceAll(placeholder.raw, placeholder.value);
	}
	return content;
}
