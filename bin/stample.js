#!/usr/bin/env node

import {cli} from '../lib/cli.js';

cli().then((e) => {
	console.log('Files copied successfully!');
	process.exit(0);
});
