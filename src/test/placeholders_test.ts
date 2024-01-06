import {assert} from 'chai';
import {
	extractPlaceholdersFromContent,
	transformContentWithPlaceholders,
} from '../placeholders.js';

describe('placeholders.ts', () => {
	describe('extractPlaceholdersFromContent', () => {
		it('finds simple placeholder in content', () => {
			const content = '%TEST%';
			const placeholders = extractPlaceholdersFromContent(content);
			assert.deepEqual(
				placeholders.map((p) => p.name),
				['TEST']
			);
		});

		it('finds multiple placeholders in content', () => {
			const content = '%TEST% %TEST2%';
			const placeholders = extractPlaceholdersFromContent(content);
			assert.deepEqual(
				placeholders.map((p) => p.name),
				['TEST', 'TEST2']
			);
		});

		it('finds placeholders in multilines', () => {
			const content = `
          %TEST%
          %TEST2%
          `;
			const placeholders = extractPlaceholdersFromContent(content);
			assert.deepEqual(
				placeholders.map((p) => p.name),
				['TEST', 'TEST2']
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
				['TEST']
			);
		});
	});

	describe('transformContentWithPlaceholder function', () => {
		it('should replace simple placeholder in content', () => {
			const content = 'Hello %NAME%';
			const transformed = transformContentWithPlaceholders(content, [
				{
					placeholder: '%NAME%',
					name: 'NAME',
					resolveTo: 'World',
				},
			]);
			assert.equal(transformed, 'Hello World');
		});

		it('should replace multiple placeholder in content', () => {
			const content = 'Hello %NAME%, today is %DAY%';
			const transformed = transformContentWithPlaceholders(content, [
				{
					placeholder: '%NAME%',
					name: 'NAME',
					resolveTo: 'World',
				},
				{
					placeholder: '%DAY%',
					name: 'DAY',
					resolveTo: 'Tuesday',
				},
			]);
			assert.equal(transformed, 'Hello World, today is Tuesday');
		});

		it('replaces repeated placeholders', () => {
			const content = 'Hello %NAME%, %NAME% is a nice name!';
			const transformed = transformContentWithPlaceholders(content, [
				{
					placeholder: '%NAME%',
					name: 'NAME',
					resolveTo: 'James',
				},
			]);
			assert.equal(transformed, 'Hello James, James is a nice name!');
		});
	});
});
