import {init} from '../Manager.js';
import {createTestDir, removeTestDir} from './utils.js';

describe('Manager', () => {
	before(async () => {
		await createTestDir();
	});
	after(async () => {
		await removeTestDir();
	});

	describe('init', () => {
		it('test', async () => {});
	});
	it('test', async () => {
		await init('./fixtures', './test-temp-dir', [
			'source/a/path/test.html',
			'test.js',
		]);
	});
});
