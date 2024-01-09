import {assert, expect} from 'chai';
import {
	Placeholder,
	extractPlaceholdersFromContent,
	mergePlaceholders,
	transformContentWithPlaceholders,
} from '../placeholders.js';
import {File} from '../File.js';

describe('placeholders.ts', () => {
	describe('extractPlaceholdersFromContent', () => {
		it('finds simple placeholder in content', () => {
			const content = '%TEST%';
			const placeholders = extractPlaceholdersFromContent(content);
			assert.deepEqual(
				placeholders.map((p) => p.name),
				['TEST'],
			);
		});

		it("doesn't match if placeholder has line breaks", async () => {
			let content = '%test\nasf%';
			const placeholders = extractPlaceholdersFromContent(content);
			expect(placeholders).to.be.empty;
		});

		it("doesn't match if placeholder is longer than 20 characters", async () => {
			let content = '%0123456789abcdefghijk%';
			const placeholders = extractPlaceholdersFromContent(content);
			expect(placeholders).to.be.empty;
		});

		it("doesn't match if placeholder contains unicode characters", async () => {
			let content = '%\x055\x008%';
			const placeholders = extractPlaceholdersFromContent(content);
			expect(placeholders).to.be.empty;
		});

		it('finds multiple placeholders in content', () => {
			const content = '%TEST% %TEST2%';
			const placeholders = extractPlaceholdersFromContent(content);
			assert.deepEqual(
				placeholders.map((p) => p.name),
				['TEST', 'TEST2'],
			);
		});

		it('finds placeholders in multilines', () => {
			const content = `
          %TEST%
          %TEST2%
          `;
			const placeholders = extractPlaceholdersFromContent(content);
			assert.equal(placeholders.length, 2);
			assert.deepEqual(
				placeholders.map((p) => p.name),
				['TEST', 'TEST2'],
			);
		});

		it('returns empty array if no placeholders found', () => {
			const content = 'no placeholders';
			const placeholders = extractPlaceholdersFromContent(content);
			assert.deepEqual(placeholders, []);
		});

		it('returns a distinct list', () => {
			const content = '%TEST% %TEST% %TEST%';
			const placeholders = extractPlaceholdersFromContent(content);
			assert.deepEqual(
				placeholders.map((p) => p.name),
				['TEST'],
			);
		});
	});

	describe('transformContentWithPlaceholder function', () => {
		it('should replace simple placeholder in content', () => {
			const content = 'Hello %name%';
			const transformed = transformContentWithPlaceholders(content, [
				new Placeholder('%name%', 'World'),
			]);
			assert.equal(transformed, 'Hello World');
		});

		it('should replace multiple placeholder in content', () => {
			const content = 'Hello %name%, today is %day%';
			const transformed = transformContentWithPlaceholders(content, [
				new Placeholder('%name%', 'World'),
				new Placeholder('%day%', 'Tuesday'),
			]);
			assert.equal(transformed, 'Hello World, today is Tuesday');
		});

		it('replaces repeated placeholders', () => {
			const content = 'Hello %name%, %name% is a nice name!';
			const transformed = transformContentWithPlaceholders(content, [
				new Placeholder('%name%', 'James'),
			]);
			assert.equal(transformed, 'Hello James, James is a nice name!');
		});
	});

	describe('Merging', () => {
		it('performs basic merging', async () => {
			const set1: Placeholder[] = [
				new Placeholder('%foo%'),
				new Placeholder('%bar%'),
			];
			const set2: Placeholder[] = [
				new Placeholder('%foo%'),
				new Placeholder('%baz%'),
			];

			const newSet = mergePlaceholders(set1, set2);
			assert.equal(newSet.length, 3);
			assert.deepEqual(
				newSet.map((p) => p.name),
				['foo', 'bar', 'baz'],
			);
		});

		it('makes result distinct', async () => {
			const set1: Placeholder[] = [
				new Placeholder('%foo%'),
				new Placeholder('%foo%'),
			];
			const set2: Placeholder[] = [
				new Placeholder('%bar%'),
				new Placeholder('%bar%'),
			];

			const newSet = mergePlaceholders(set1, set2);
			assert.equal(newSet.length, 2);
			assert.deepEqual(
				newSet.map((p) => p.name),
				['foo', 'bar'],
			);
		});

		it('favors resolved placeholders', () => {
			const set1: Placeholder[] = [new Placeholder('%foo%')];
			const set2: Placeholder[] = [
				new Placeholder('%foo%', 'Hello'),
				new Placeholder('%bar%'),
			];

			const newSet = mergePlaceholders(set1, set2);

			assert.equal(newSet.length, 2);
			assert.deepEqual(
				newSet.map((p) => p.name),
				['foo', 'bar'],
			);
			assert.equal(newSet[0].value, 'Hello');
		});
	});
});
