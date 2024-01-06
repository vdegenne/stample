import {assert} from 'chai';
import {basename, dirname} from '../paths.js';

describe('Paths module', () => {
	describe('basename', () => {
		it('returns the basename of a path', () => {
			const path = '/this/is/a/file/somewhere.js';
			assert.equal(basename(path), 'somewhere.js');
		});
	});

	describe('dirname', () => {
		it('returns the dirname of a path', () => {
			const path = '/this/is/a/file/somewhere.js';
			assert.equal(dirname(path), '/this/is/a/file');
		});
	});

	describe('dirname');
});
