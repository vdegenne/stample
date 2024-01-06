import {File} from '../File.js';
import {assert} from 'chai';
import {createTestDir, removeTestDir} from './utils.js';

const paths = {
	testFile: './fixtures/test.html',
	nonExistingFile: './fixtures/fake-file.txt',
	nonExistingDirectory: './fixtures/does-not-exist',
	existingDirectory: './fixtures/source/a/path',
	existingFileInPath: './fixtures/source/a/path/test.html',
};

describe('File', () => {
	before(async () => {
		await createTestDir();
	});
	after(async () => {
		await removeTestDir();
	});

	it('defines a path', () => {
		const filepath = paths.testFile;
		const file = new File(filepath);
		assert.equal(file.path, filepath);
	});

	describe('directories', () => {
		it("doesn't require a trailing slash", () => {
			const dir = new File('./fixtures/source/a/path');
			assert.isTrue(dir.exists());
			assert.isTrue(dir.isDirectory());
		});

		it('can have a trailing slash', () => {
			const dir = new File('./fixtures/source/a/path/');
			assert.isTrue(dir.exists());
			assert.isTrue(dir.isDirectory());
		});

		it('non existing file (directory) can be created on the filesystem', (done) => {
			const nonExistingFile = new File('./test-temp-dir/i-will-be-created.txt');
			assert.isFalse(nonExistingFile.exists());
			nonExistingFile.createPath().then(() => {
				assert.isTrue(nonExistingFile.exists());
				done();
			});
		});
	});

	it('can be preloaded', async () => {
		const filepath = paths.testFile;
		const file = new File(filepath);
		assert.isFalse(file.isPreloaded());
		assert.isUndefined(file.contents);
		await file.preload();
		assert.isTrue(file.isPreloaded());
		assert.include(file.contents, '<!DOCTYPE html>\n');
	});

	it('types are preloaded', async () => {
		const dirpath = paths.existingDirectory;
		const filepath = paths.testFile;
		const dir = new File(dirpath);
		const file = new File(filepath);
		assert.isUndefined(dir.type);
		assert.isUndefined(file.type);
		await dir.preload();
		await file.preload();
		assert.equal(dir.type, 'directory');
		assert.equal(file.type, 'file');
	});

	it("can't be preloaded if it doesn't exist", async () => {
		const filepath = paths.nonExistingFile;
		const file = new File(filepath);
		assert.isTrue(!file.exists());
		await file.preload();
		assert.isFalse(file.isPreloaded());
	});

	describe('searchForPlaceholders', () => {
		it('returns placeholders in the file', async () => {
			const filepath = paths.testFile;
			const file = new File(filepath);
			const placeholders = await file.getPlaceholders();
			assert.deepEqual(
				placeholders.map((p) => p.name),
				['TITLE', 'CONTENT']
			);
		});

		it('preloads the file for the search', async () => {
			const filepath = paths.testFile;
			const file = new File(filepath);
			assert.isFalse(file.isPreloaded());
			await file.getPlaceholders();
			assert.isTrue(file.isPreloaded());
		});
	});

	describe('basename', () => {
		it('returns the basename of a file', async () => {
			let file = new File('./fixtures/path/to/something');
			assert.equal(file.basename(), 'something');
			file = new File('./fixtures/path/to/something/');
			assert.equal(file.basename(), 'something');
			file = new File('./fixtures/path/to/a/file.js');
			assert.equal(file.basename(), 'file.js');
			file = new File('/this/is/absolute/path');
			assert.equal(file.basename(), 'path');
		});
	});

	describe('resolvePath', () => {
		it('returns clean paths', async () => {
			let file: File;
			file = new File('./fixtures/a/path');
			assert.equal(file.resolvePath(), 'fixtures/a/path');
			file = new File('./fixtures/a/path/');
			assert.equal(file.resolvePath(), 'fixtures/a/path');
			file = new File('./fixtures/path/to/file.js');
			assert.equal(file.resolvePath(), 'fixtures/path/to/file.js');
			file = new File('../file.js');
			assert.equal(file.resolvePath(), '../file.js');
		});

		it('resolves based on path', async () => {
			let file: File;
			file = new File('./fixtures/a/path', './fixtures');
			assert.equal(file.resolvePath(), 'a/path');
			file = new File('./fixtures/a/path', '.');
			assert.equal(file.resolvePath(), 'fixtures/a/path');
			file = new File('./fixtures/a/path', './');
			assert.equal(file.resolvePath(), 'fixtures/a/path');
			file = new File('./fixtures/a/path', 'fixtures');
			assert.equal(file.resolvePath(), 'a/path');
			file = new File('./fixtures/a/path', 'fixtures/a');
			assert.equal(file.resolvePath(), 'path');
			// file = new File('/absolute/path/to/file.js', '.');
			// assert.equal(file.resolvePath(), 'path');
			file = new File('../shared/templates/README.md', './fixtures');
			assert.equal(file.resolvePath(), 'path');
		});
	});

	describe('dirname', () => {
		it('returns the dirname of a file', async () => {
			let file: File;
			file = new File('./fixtures/path/to/something');
			assert.equal(file.dirname(), './fixtures/path/to');
			file = new File('./fixtures/path/to/something/');
			assert.equal(file.dirname(), './fixtures/path/to');
			file = new File('./fixtures/path/to/a/file.js');
			assert.equal(file.dirname(), './fixtures/path/to/a');
			file = new File('/this/is/absolute/path');
			assert.equal(file.dirname(), '/this/is/absolute');
		});
	});

	describe('Base', () => {
		it('', async () => {
			// const file = new File('../shared/templates/README.md');
			// assert.equal(file.path, expected);
		});
	});

	describe('Destination', () => {
		it("can't be an existing file", () => {
			const filepath = new File(paths.testFile);
			const fn = () => filepath.setDestination(paths.existingFileInPath);
			assert.throws(fn);
		});

		it('can be an existing directory', () => {
			const filepath = new File(paths.testFile);
			const fn = () => filepath.setDestination(paths.existingDirectory);
			assert.doesNotThrow(fn);
		});

		it('can be a non-existing directory', () => {
			const filepath = new File(paths.testFile);
			const fn = () => filepath.setDestination('non-existing/path');
			assert.doesNotThrow(fn);
		});

		it.skip('checks the existence of the dirname', () => {
			const file = new File('../shared/templates/README.md');
			file.setDestination(paths.existingDirectory);
			// file.destination = paths.existingPath;
			// assert.isTrue(file.destinationDirpathExists());
			// file.destination = 'non-existing/path/test.html';
			// assert.isFalse(file.destinationDirpathExists());
		});

		it('checks the existence of the file', () => {
			// const file = new File(paths.testFile);
			// assert.isUndefined(file.destinationExists());
			// file.destination = 'non-existing/path';
			// assert.isFalse(file.destinationExists());
			// file.destination = paths.;
			// assert.isFalse(file.destinationExists());
		});
	});
});
