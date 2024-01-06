import {File} from '../File.js';
import {assert} from 'chai';

const paths = {
	testFile: './fixtures/test.html',
	nonExistingFile: './fixtures/fake-file.txt',
	emptyDirectory: './fixtures/empty-folder',
	nonExistingDirectory: './fixtures/does-not-exist',
	existingPath: './fixtures/existing/path',
	existingFileInPath: './fixtures/existing/path/test.html',
};

describe('File', () => {
	it('defines a path', () => {
		const filepath = paths.testFile;
		const file = new File(filepath);
		assert.equal(file.path, filepath);
	});

	describe('directories', () => {
		it("doesn't require a trailing slash", () => {
			const dir = new File('./fixtures/existing/path');
			assert.isTrue(dir.exists());
			assert.isTrue(dir.isDirectory());
		});
		it('can have a trailing slash', () => {
			const dir = new File('./fixtures/existing/path/');
			assert.isTrue(dir.exists());
			assert.isTrue(dir.isDirectory());
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
		const dirpath = paths.emptyDirectory;
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

	it('non existing files can be created on the filesystem', async () => {
		const nonExistingFile = new File('./test-temp-dir/i-will-be-created.txt');
		assert.isFalse(nonExistingFile.exists());
		await nonExistingFile.createPath();
		assert.isTrue(nonExistingFile.exists());
	});

	describe('searchForPlaceholders', () => {
		it('returns placeholders in the file', async () => {
			const filepath = paths.testFile;
			const file = new File(filepath);
			const placeholders = await file.getPlaceholders();
			assert.deepEqual(
				placeholders.map((p) => p.name),
				['TITLE', 'CONTENT'],
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

	describe('Destination', () => {
		it.skip('checks the existence of the dirname', () => {
			// const file = new File('../shared/templates/README.md');
			// file.setDestination(paths.existingPath);
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
