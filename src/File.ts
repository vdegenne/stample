import fs from 'fs';
import {
	PlaceholderInfo,
	extractPlaceholdersFromContent,
} from './placeholders.js';
import {
	dirname as _dirname,
	basename as _basename,
	createDirectory,
	isAbsolute,
	stripBasedir,
} from './paths.js';

export type FileType = 'file' | 'directory';

export class File {
	#path: string;
	#loaded = false;

	#exists: boolean | undefined;
	#type: FileType | undefined;
	#contents: string | undefined;

	#destination: File | undefined;

	#base: string | undefined;

	setBase(base: string) {
		this.#base = base;
	}

	basename() {
		return _basename(this.#path);
	}
	dirname() {
		return _dirname(this.#path);
	}
	constructor(path: string, base = '.') {
		this.#path = path;
		this.setBase(base);
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

	async getPlaceholders(): Promise<PlaceholderInfo[]> {
		if (!this.#loaded) {
			await this.preload();
		}
		const content = this.#contents;
		if (!content) {
			return;
		}

		return extractPlaceholdersFromContent(content);
	}

	async createPath() {
		if (this.exists(true)) {
			throw new Error("Can't create, the file already exists.");
		} else {
			await createDirectory(this.path);
		}
	}

	/**
	 * Can only be a directory.
	 * The directory can already exists.
	 * If it doesn't exist it'll be created during copy process.
	 *
	 * @param path path to copy destination
	 */
	setDestination(path: string) {
		const file = new File(path);

		if (file.exists() && file.isFile()) {
			throw new Error(
				'destination path exists and is a file, it should be a directory where to copy the templates.',
			);
		}
		// Should create it yet, unless it's really needed
	}

	// destinationDirpathExists() {
	// 	if (!this.#destination) {
	// 		return undefined;
	// 	}
	// 	try {
	// 		const sourceDirname = _dirname(this.#path);
	// 		// const destinationDirname = _dirname(this.destination);
	// 		const resolvedDirpath = pathlib.join(this.#destination, sourceDirname);
	// 		console.log(resolvedDirpath);
	//
	// 		return fs.existsSync(resolvedDirpath);
	// 	} catch (_err) {
	// 		return undefined;
	// 	}
	// }

	// destinationExists() {
	// 	if (!this.#destination) {
	// 		return undefined;
	// 	}
	// 	try {
	// 		return fs.existsSync(this.#destination);
	// 	} catch (_err) {
	// 		return undefined;
	// 	}
	// }

	copy(filename?: string) {
		throw new Error('To implement');
	}
}
