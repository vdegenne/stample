import {input} from '@inquirer/prompts';

export const PLACEHOLDER_REGEX = /\%([^%]+)\%/g;

export interface PlaceholderInfo {
	/**
	 * Raw placeholder value, e.g. '%TITLE%'
	 */
	placeholder: string;
	/**
	 * Name of the placeholder, e.g. `TITLE`
	 * It is usually the `placeholder` value without the surrounding %'s
	 */
	name: string;
	/**
	 * Used to determine what to replace placeholder with in transform functions.
	 */
	resolveTo?: string;
}

export function extractPlaceholdersFromContent(
	content: string
): PlaceholderInfo[] {
	const placeholders: PlaceholderInfo[] = [];
	const matches = content.matchAll(PLACEHOLDER_REGEX);
	for (const match of matches) {
		const name = match[1];
		if (placeholders.findIndex((p) => p.name === name) >= 0) {
			continue;
		}
		placeholders.push({
			placeholder: `%${name}%`,
			name,
		});
	}
	return placeholders;
}

/**
 * Take a PlaceholderInfo array and ask user for all placeholder values.
 * User value will be written in `resolveTo` field of info objects.
 *
 * @param placeholders List of placeholders to resolve
 */
export async function askUserForPlaceHolders(placeholders: PlaceholderInfo[]) {
	const map: PlaceholderInfo[] = [];
	for (const placeholder of placeholders) {
		const answer = await input({
			message: placeholder.name,
		});
		placeholder.resolveTo = answer;
	}
}

export function transformContentWithPlaceholders(
	content: string,
	placeholders: PlaceholderInfo[]
) {
	for (const placeholder of placeholders) {
		if (!placeholder.resolveTo) {
			return;
		}
		content = content.replaceAll(
			placeholder.placeholder,
			placeholder.resolveTo
		);
	}
	return content;
}
