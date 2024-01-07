import {expect} from 'chai';
import {
	copyAllFile,
	extractAllPlaceholdersFromFilesList,
	getFileForFilename,
	stample,
	stampleInit,
	transformAllFiles,
} from '../stample.js';
import {createTestDir, removeTestDir} from './utils.js';
import {File} from '../File.js';
import {Placeholder} from '../placeholders.js';
import fs from 'fs';

describe('Manager', () => {
	before(async () => {
		await createTestDir();
	});
	after(async () => {
		await removeTestDir();
	});

	describe('init', () => {
		it('loads files accordingly to glob patterns', async () => {
			const files = await stampleInit('./fixtures', 'test-temp-dir', '**/*');
			expect(files.length).to.equal(4);
		});

		it('sets the mirror value on files', async () => {
			const files = await stampleInit('./fixtures', 'test-temp-dir', '**/*');
			const file = getFileForFilename(files, 'small-content.txt');
			expect(file.mirror.endsWith('test-temp-dir/small-content.txt')).to.be
				.true;
		});
	});

	describe('Placeholders', () => {
		it("returns files' distinct placeholders", async () => {
			const files = await stampleInit('./fixtures', 'test-temp-dir', '**/*');
			const placeholders = await extractAllPlaceholdersFromFilesList(files);
			expect(placeholders.map((p) => p.name)).to.deep.equal([
				'name',
				'day',
				'TITLE',
				'CONTENT',
				'var_name',
				'comment',
			]);
		});
	});

	describe('Transformation', () => {
		it('throws if some resolution values are missing', async () => {
			const files = [new File('./fixtures/test.js')];
			const placeholders = [new Placeholder('%test%', undefined)];
			let err: Error | undefined;
			try {
				await transformAllFiles(files, placeholders);
			} catch (error) {
				err = error;
			}

			expect(err).to.be.an('error');
			expect(err.message).to.contain(
				'Some placeholders are missing a resolution value',
			);
		});

		it("throws if some placeholders in files weren't supplied", async () => {
			const files = await stampleInit('./fixtures', 'test-temp-dir', '**/*');
			const placeholders = await extractAllPlaceholdersFromFilesList(files);
			placeholders.forEach((p) => (p.value = 'test'));
			// Intentionally delete a value for the test
			delete placeholders[0];

			let err: Error | undefined;
			try {
				await transformAllFiles(files, placeholders);
			} catch (error) {
				err = error;
			}

			expect(err).to.be.an('error');
			expect(err.message).to.contain(
				'Some file placeholders were not provided',
			);
		});

		it('transforms file if conditions are met', async () => {
			const files = await stampleInit('./fixtures', 'test-temp-dir', '**/*');
			const placeholders = await extractAllPlaceholdersFromFilesList(files);
			placeholders.forEach((p) => (p.value = `(${p.name})`));

			let err: Error | undefined;
			try {
				await transformAllFiles(files, placeholders);
			} catch (error) {
				err = error;
			}

			expect(err).to.be.undefined;

			const file = getFileForFilename(files, 'small-content.txt');
			expect(file.transformed).to.equal('Hello (name), today is (day).\n');
		});
	});

	describe('Copying', () => {
		it('throws when trying to copy untransformed set', async () => {
			const files = await stampleInit('./fixtures', 'test-temp-dir', '**/*');

			let err: Error | undefined;
			try {
				await copyAllFile(files);
			} catch (error) {
				err = error;
			}

			expect(err).to.be.an('error');
			expect(err.message).to.contain('Some files are not transformed');
		});

		it('copies otherwise', async () => {
			const files = await stampleInit('./fixtures', 'test-temp-dir', '**/*');
			const placeholders = await extractAllPlaceholdersFromFilesList(files);
			placeholders.forEach((p) => (p.value = `(${p.name})`));

			let err: Error | undefined;
			try {
				// 1. Mirrors are set in the stampleInit call
				// 2. Transform content
				await transformAllFiles(files, placeholders);
				// 3. Copy files to destination
				await copyAllFile(files);
			} catch (error) {
				err = error;
			}

			expect(err).to.be.undefined;
			const oneFilePath = files.find((f) =>
				f.path.endsWith('a/path/test.html'),
			);
			// This shouldn't throw since the file exists
			const content = (
				await fs.promises.readFile(oneFilePath.mirror)
			).toString();
			expect(content).to.contain(`<title>(TITLE)</title>`);
		});
	});

	describe('Stample', () => {
		it('fails if some placeholders in file could not be resolved', async () => {
			const source = './fixtures';
			const destination = './test-temp-dir';
			const globs = ['**/*.txt', '**/*.html'];
			const placeholders = [];

			let err: Error | undefined;
			try {
				await stample(source, destination, globs, placeholders, true);
			} catch (error) {
				err = error;
			}

			expect(err).to.be.an('error');
			expect(err.message).to.contain('Some placeholders are missing');
		});

		it('works', async () => {
			const source = './fixtures';
			const destination = './test-temp-dir';
			const globs = ['**/*.txt', '**/*.html'];
			const placeholders = [
				new Placeholder('%name%', 'John'),
				new Placeholder('%day%', 'Tuesday'),
				new Placeholder('%TITLE%', 'My Page'),
				new Placeholder('%CONTENT%', 'Nice'),
			];

			let err: Error | undefined;
			let files!: File[];
			try {
				files = await stample(source, destination, globs, placeholders, true);
			} catch (error) {
				err = error;
			}

			expect(err).to.be.undefined;
			expect(files).to.be.an('array');
			const file = files.find((f) => f.mirror.endsWith('a/path/test.html'))!;
			const content = (await fs.promises.readFile(file.mirror)).toString();
			expect(content).to.equal(`<!doctype html>
<html>
	<head>
		<title>My Page</title>
	</head>
	<body>
		Nice
	</body>
</html>\n`);
		});
	});
});
