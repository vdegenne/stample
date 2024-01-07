import {expect} from 'chai';
import {Arguments, processArgs} from '../args.js';
import {Placeholder} from '../placeholders.js';

const source = './source';
const destination = './destination';
const globs = ['**/*.html', '**/*.ts'];

describe('Args', () => {
	it('processes equal sign-ed placeholders', async () => {
		const placeholders = ['-name=John', '-day=Monday'];
		expect(
			processArgs([source, destination, ...globs, ...placeholders]),
		).to.deep.equal({
			source,
			destination,
			globs,
			placeholders: [
				new Placeholder('%name%', 'John'),
				new Placeholder('%day%', 'Monday'),
			],
		} as Arguments);
	});

	it('processes separate version placeholders', async () => {
		const placeholders = ['-name', 'John', '-day', 'Monday'];
		expect(
			processArgs([source, destination, ...globs, ...placeholders]),
		).to.deep.equal({
			source,
			destination,
			globs,
			placeholders: [
				new Placeholder('%name%', 'John'),
				new Placeholder('%day%', 'Monday'),
			],
		} as Arguments);
	});

	it('removes surrounding quotes (equal sign arg)', async () => {
		const placeholders = ['-title="my page"', "-content='<p>hello</p>'"];
		expect(
			processArgs([source, destination, ...globs, ...placeholders]),
		).to.deep.equal({
			source,
			destination,
			globs,
			placeholders: [
				new Placeholder('%title%', 'my page'),
				new Placeholder('%content%', '<p>hello</p>'),
			],
		} as Arguments);
	});

	it('removes surrounding quotes (broken params)', async () => {
		const placeholders = ['-title', '"my page"', '-content', "'<p>hello</p>'"];
		expect(
			processArgs([source, destination, ...globs, ...placeholders]),
		).to.deep.equal({
			source,
			destination,
			globs,
			placeholders: [
				new Placeholder('%title%', 'my page'),
				new Placeholder('%content%', '<p>hello</p>'),
			],
		} as Arguments);
	});
});
