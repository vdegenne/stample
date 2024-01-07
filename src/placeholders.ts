import {input} from '@inquirer/prompts';
import type {File} from './File.js';

export const PLACEHOLDER_REGEX = /\%([^%]+)\%/g;

export class Placeholder {
	/**
	 * Raw placeholder value, e.g. '%TITLE%'
	 */
	value: string;

	/**
	 * Name of the placeholder, e.g. `TITLE`
	 * It is usually the `placeholder` value without the surrounding %'s
	 */
	get name() {
		return this.value.replaceAll('%', '').trim();
	}
	/**
	 * Used to determine what to replace placeholder with in transform functions.
	 */
	resolveTo?: string;

	constructor(value: string, resolveTo?: string) {
		this.value = value;
		this.resolveTo = resolveTo;
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
		let alreadyExist = distinct.find((q) => q.value == p.value);
		if (alreadyExist) {
			if (!alreadyExist.resolveTo && p.resolveTo) {
				alreadyExist.resolveTo = p.resolveTo;
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
 * User value will be written in `resolveTo` field of info objects.
 *
 * @param placeholders List of placeholders to resolve
 */
export async function askUserForPlaceHolders(placeholders: Placeholder[]) {
	const map: Placeholder[] = [];
	for (const placeholder of placeholders) {
		const answer = await input({
			message: placeholder.name,
		});
		placeholder.resolveTo = answer;
	}
}

export function transformContentWithPlaceholders(
	content: string,
	placeholders: Placeholder[],
) {
	for (const placeholder of placeholders) {
		if (!placeholder.resolveTo) {
			return;
		}
		content = content.replaceAll(placeholder.value, placeholder.resolveTo);
	}
	return content;
}
