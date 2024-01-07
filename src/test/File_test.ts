import {File} from '../File.js';
import {assert, expect, should} from 'chai';
import {createTestDir, removeTestDir} from './utils.js';
import {Placeholder} from '../placeholders.js';

should();

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
		const file = new File('./fixtures/test.js');
		assert.equal(file.path, './fixtures/test.js');
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
		const file = new File('./fixtures/test.js');
		assert.isTrue(!file.isPreloaded());
		await file.preload();
		assert.isTrue(file.isPreloaded());
	});

	describe('mirrors', () => {
		it('can be passed in the constructor', async () => {
			const file = new File('./fixtures/test.js', './somewhere/else/test.js');
			assert.equal(file.mirror, './somewhere/else/test.js');
		});

		it('existence can be checked', async () => {
			let file = new File('./test.js', './non-existing/path/test.js');
			assert.isFalse(file.destinationDirpathExists());
			// existing
			file = new File('./index.html', './fixtures/source/a/path/index.html');
			assert.isTrue(file.destinationDirpathExists());
		});

		it("mirror dirpath can be created if it doesn't exist (recursively)", async () => {
			const file = new File(
				'./test.js',
				'./test-temp-dir/destination/path/test.js',
			);
			assert.isFalse(file.destinationDirpathExists());
			await file.allRoadsLeadToRome();
			assert.isTrue(file.destinationDirpathExists());
		});
	});

	describe('Placeholders', () => {
		it('returns placeholders in the file', async () => {
			const file = new File('./fixtures/test.html');
			const placeholders = await file.extractPlaceholders();

			assert.deepEqual(
				placeholders.map((p) => p.name),
				['TITLE', 'CONTENT'],
			);
		});

		it('preloads the file for the search', async () => {
			const file = new File('./fixtures/test.html');
			assert.isFalse(file.isPreloaded());
			await file.extractPlaceholders();
			assert.isTrue(file.isPreloaded());
		});

		it('transforms file content', async () => {
			const file = new File('./fixtures/small-content.txt');
			const placeholders = [
				new Placeholder('%name%', 'John'),
				new Placeholder('%day%', 'Monday'),
			];
			const transformed =
				await file.transformContentWithPlaceholders(placeholders);
			assert.equal(transformed, 'Hello John, today is Monday.\n');
			// But original content is preserved
			assert.equal(file.contents, 'Hello %name%, today is %day%.\n');
		});
	});

	describe('Copying', () => {
		it('fails if the file has no mirror', async () => {
			const file = new File('./fixtures/test.js');
			let err: Error;
			try {
				await file.copy();
			} catch (error) {
				err = error;
			}

			expect(err).to.be.an('error');
			expect(err.message).to.contain("mirror wasn't set");
		});

		it("fails if the file wasn't transformed", async () => {
			const file = new File('./fixtures/test.js', './test-temp-dir/test.js');
			let err: Error;
			try {
				await file.copy();
			} catch (error) {
				err = error;
			}

			expect(err).to.be.an('error');
			expect(err.message).to.contain("transformed wasn't set");
		});

		it('copies transformed content to destination', async () => {
			const file = new File(
				'./fixtures/small-content.txt',
				'./test-temp-dir/a/new/location/small-content.txt',
			);
			const placeholders = [
				new Placeholder('%name%', 'John'),
				new Placeholder('%day%', 'Sunday'),
			];
			await file.transformContentWithPlaceholders(placeholders);
			let err: Error;
			try {
				await file.copy();
			} catch (error) {
				err = error;
			}

			expect(err).to.be.undefined;
			expect(file.destinationExists()).to.be.true;
			const destinationFile = new File(file.mirror);
			expect(await destinationFile.getContents()).to.be.equal(
				'Hello John, today is Sunday.\n',
			);
		});
	});
});
