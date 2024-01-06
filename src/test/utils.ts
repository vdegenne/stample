import fs from 'fs';
import path from 'path';

const TEST_TEMP_DIR = 'test-temp-dir';

export async function createTestDir() {
	try {
		await fs.promises.mkdir(TEST_TEMP_DIR);
	} catch {
		console.log('Something went wrong trying to create test dir.');
	}
}

export async function removeTestDir() {
	try {
		await fs.promises.rm(TEST_TEMP_DIR, {
			recursive: true,
			force: true,
		});
	} catch {
		console.error('Something went wrong trying to delete the directory');
	}
}

export async function emptyTestDir(): Promise<void> {
	try {
		const contents = await fs.promises.readdir(TEST_TEMP_DIR);
		for (const item of contents) {
			const itemPath = path.join(TEST_TEMP_DIR, item);
			const stats = await fs.promises.lstat(itemPath);
			if (stats.isDirectory()) {
				await emptyTestDir(); // Recursive call for subdirectories
				await fs.promises.rmdir(itemPath); // Remove the empty directory
			} else {
				await fs.promises.unlink(itemPath); // Remove the file
			}
		}
	} catch (err) {
		console.error('Error removing contents:', err);
	}
}
