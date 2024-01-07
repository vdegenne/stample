import {assert} from 'chai';
import {
	basename,
	createDirectory,
	dirname,
	glob,
	pathlib,
	stripBasedir,
} from '../paths.js';
import fs from 'fs';
import {createTestDir, removeTestDir} from './utils.js';

describe('Paths module', () => {
	before(async () => {
		await createTestDir();
	});
	after(async () => {
		await removeTestDir();
	});

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

	describe('createDirectory', () => {
		it('can create root directory', async () => {
			const basename = 'will-be-created-directory';
			const path = `./test-temp-dir/${basename}`;
			assert.isFalse(fs.existsSync(path));
			await createDirectory(path);
			assert.isTrue(fs.existsSync(path));
		});

		it('trailing slash does not alter the creation', async () => {
			const basename = 'directory-with-trailing-slash/';
			const path = `./test-temp-dir/${basename}`;
			assert.isFalse(fs.existsSync(path));
			await createDirectory(path);
			assert.isTrue(fs.existsSync(path));
		});

		it('fails silently if the directory already exists', async () => {
			const basename = 'directory-with-trailing-slash/';
			const path = `./test-temp-dir/${basename}`;
			assert.isTrue(fs.existsSync(path));
			await createDirectory(path);
		});

		it('can create directory path recursively', async () => {
			const path = './test-temp-dir/this/is/a/long/dirpath';
			assert.isFalse(fs.existsSync(path));
			await createDirectory(path);
			assert.isTrue(fs.existsSync(path));
		});
	});

	describe('stripBasedir', () => {
		it('strips relative paths', () => {
			const filepath = './fixtures/existing/path';
			const basedir = 'fixtures';
			const result = stripBasedir(filepath, basedir);
			assert.equal(result, 'existing/path');
		});

		it('strips relative paths', () => {
			const filepath = './fixtures/existing/path';
			const basedir = './fixtures';
			const result = stripBasedir(filepath, basedir);
			assert.equal(result, 'existing/path');
		});

		it('strips relative paths', () => {
			const filepath = '../shared/templates/README.md';
			const basedir = '../shared/templates';
			const result = stripBasedir(filepath, basedir);
			assert.equal(result, 'README.md');
		});

		it('works for directories', () => {
			const filepath = '../shared/templates';
			const basedir = '../shared/templates/';
			const result = stripBasedir(filepath, basedir);
			assert.equal(result, '');
		});

		it('does not account for trailing slashes', () => {
			const filepath = '../shared/templates/README.md';
			const basedir = '../shared/templates/';
			const result = stripBasedir(filepath, basedir);
			assert.equal(result, 'README.md');
		});
	});

	describe('glob', () => {
		it('returns all files', async () => {
			const result = await glob('./fixtures/**/*');
			assert.isTrue(
				result.some((i) => i.endsWith('fixtures/source/a/path/test.html')),
			);
		});

		it('returns absolute paths', async () => {
			const result = await glob('./fixtures/**/*');
			assert.isTrue(result.every((i) => i.startsWith('/')));
		});
	});
});
