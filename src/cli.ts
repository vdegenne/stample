import {stample} from './stample.js';
import {processArgs} from './args.js';

export async function cli() {
	const [, , _source, _destination, ...rest] = process.argv;

	if (!_source || !_destination || rest.length === 0) {
		console.error(`
USAGE
    stample SOURCE DEST GLOB1 [GLOB2, ...] [-<placeholder-name>=<placeholder-value>, ...]

EXAMPLES
    To recursively copy all template source files from
    "templates/webdev" directory to "src" directory:

        stample templates/webdev src '**/*.html' '**/*.ts'

    If there are placeholders (e.g. %title%) in any file
    stample will prompt for them and replace them before 
    the copy unless they are provided in the command in 
    which case only unspecified placeholders will be prompted.
    No user interaction will be required if all placeholders
    are supplied.
`);

		process.exit(1);
	}

	let {source, destination, globs, placeholders} = processArgs([
		_source,
		_destination,
		...rest,
	]);

	await stample(source, destination, globs, placeholders);
}
