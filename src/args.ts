import {Placeholder} from './placeholders.js';

export interface Arguments {
	source: string;
	destination: string;
	globs: string[];
	placeholders?: Placeholder[];
}

export function processArgs(args: string[]) {
	const source = args.shift();
	const destination = args.shift();
	let globs = [];
	let placeholders = [];
	while (args.length > 0) {
		if (!args[0].startsWith('-')) {
			globs.push(args.shift());
			continue;
		}
		if (args[0].startsWith('-')) {
			const ph = args.shift().slice(1);
			let placeholder: Placeholder;
			const containsEqualSign = ph.includes('=');
			if (containsEqualSign) {
				const [name, value] = ph.split('=');
				placeholder = new Placeholder(
					`%${name}%`,
					removeSurroundingQuotes(value),
				);
			} else {
				if (args[0] && !args[0].startsWith('-')) {
					placeholder = new Placeholder(
						`%${ph}%`,
						removeSurroundingQuotes(args.shift()),
					);
				} else {
					throw new Error('Problem processing the arguments');
				}
			}
			placeholders.push(placeholder);
		}
	}

	const argsObj: Arguments = {
		source,
		destination,
		globs,
	};

	if (placeholders.length) {
		argsObj.placeholders = placeholders;
	}

	return argsObj;
}

export function removeSurroundingQuotes(input: string): string {
	return input.replace(/^['"]|['"]$/g, '');
}
