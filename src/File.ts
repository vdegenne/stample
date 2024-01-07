import fs from 'fs';
import {
	Placeholder,
	askUserForPlaceHolders,
	extractPlaceholdersFromContent,
	transformContentWithPlaceholders,
} from './placeholders.js';
import {
	dirname as _dirname,
	basename as _basename,
	createDirectory,
	isAbsolute,
	pathlib,
} from './paths.js';

export type FileType = 'file' | 'directory';

export class File {
	#path: string;
	#loaded = false;

	#exists: boolean | undefined;
	#type: FileType | undefined;
	#contents: string | undefined;
	#transformed: string | undefined;

	#mirror: string | undefined;

	basename() {
		return _basename(this.#path);
	}
	dirname() {
		return _dirname(this.#path);
	}
	constructor(path: string, destination?: string) {
		this.#path = path;
		this.#mirror = destination;
	}

	set path(newPath: string) {
		const old = this.#path;
		this.#path = newPath;
		if (old !== newPath) {
			this.reload();
		}
	}
	get path() {
		return this.#path;
	}

	get type() {
		return this.#type;
	}

	get isAbsolute() {
		return isAbsolute(this.#path);
	}

	/**
	 * Returns preloaded contents if any,
	 * use `getContents` to request contents if not preloaded.
	 */
	get contents() {
		return this.#contents;
	}
	get transformed() {
		return this.#transformed;
	}

	exists(force = false): boolean {
		if (this.#loaded && !force) {
			return this.#exists;
		}
		try {
			return fs.existsSync(this.#path);
		} catch {
			return false;
		}
	}

	isFile(force = false): boolean | undefined {
		if (this.#loaded && !force) {
			if (!this.#exists) {
				return undefined;
			}
			return this.#type === 'file';
		}
		if (!this.exists(force)) {
			return undefined;
		}
		try {
			const stats = fs.statSync(this.#path);
			return stats.isFile();
		} catch (error) {
			console.error("can't determine if it's a file");
			return undefined;
		}
	}

	isDirectory(force = false): boolean | undefined {
		if (this.#loaded && !force) {
			if (!this.#exists) {
				return undefined;
			}
			return this.#type === 'directory';
		}
		if (!this.exists(force)) {
			return undefined;
		}
		try {
			const stats = fs.statSync(this.#path);
			return stats.isDirectory();
		} catch (error) {
			console.error("can't determine if it's a directory");
			return undefined;
		}
	}

	async getContents(force = false): Promise<string | undefined> {
		if (!this.isFile(force)) {
			return null;
		}

		if (this.#loaded && !force) {
			if (!this.exists(force)) {
				return undefined;
			}

			return this.#contents;
		}

		if (!this.exists(force)) {
			return undefined;
		}
		try {
			const data = await fs.promises.readFile(this.#path, 'utf-8');
			return data;
		} catch (error) {
			console.error('Error reading file:', error);
			return undefined;
		}
	}

	flush() {
		this.#exists = undefined;
		this.#type = undefined;
		this.#contents = undefined;
		this.#loaded = false;
	}

	async reload() {
		this.flush();
		await this.preload();
	}

	async preload(force = false) {
		if (this.#loaded && !force) {
			return;
		}
		this.#exists = this.exists(force);
		if (!this.#exists) {
			this.flush();
			return;
		}
		this.#type = this.isFile(force)
			? 'file'
			: this.isDirectory()
				? 'directory'
				: undefined;
		this.#contents = await this.getContents(force);
		this.#loaded = true;
	}

	isPreloaded() {
		return this.#loaded;
	}

	async extractPlaceholders(): Promise<Placeholder[]> {
		if (!this.#loaded) {
			await this.preload();
		}
		const content = this.#contents;
		if (!content) {
			return;
		}

		return extractPlaceholdersFromContent(content);
	}

	set mirror(value: string) {
		this.#mirror = value;
	}
	get mirror() {
		return this.#mirror;
	}

	destinationDirpathExists() {
		if (!this.#mirror) {
			return undefined;
		}
		const dirpath = pathlib.dirname(this.#mirror);
		return fs.existsSync(dirpath);
	}

	destinationExists() {
		if (!this.#mirror) {
			return undefined;
		}
		return fs.existsSync(this.#mirror);
	}

	async allRoadsLeadToRome() {
		if (this.#mirror) {
			const dirpath = pathlib.dirname(this.#mirror);
			if (!fs.existsSync(dirpath)) {
				await createDirectory(dirpath);
			}
		}
	}

	async transformContentWithPlaceholders(placeholders: Placeholder[]) {
		if (!this.exists()) {
			return;
		}
		if (!this.#contents) {
			await this.preload();
		}
		const content = this.#contents;
		if (!content) {
			return;
		}
		this.#transformed = content;
		this.#transformed = transformContentWithPlaceholders(
			this.#transformed,
			placeholders,
		);
		return this.#transformed;
	}

	/**
	 * Copy the transformed file to the destination,
	 * This function requires properties `#mirror` and `#transformed` to be set,
	 * `#transformed` can be defined from `transformContentWithPlaceholders()`.
	 */
	async copy() {
		if (!this.#mirror) {
			throw new Error("mirror wasn't set, can't guess the destination.");
		}
		if (!this.#transformed) {
			throw new Error(
				"transformed wasn't set, please call `transformContentWithPlaceholders` first.",
			);
		}

		await this.allRoadsLeadToRome();

		await fs.promises.writeFile(this.#mirror, this.#transformed);
	}
}
