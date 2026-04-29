import { describe, it, afterEach } from "mocha";
import { expect } from "chai";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

import readMusicDir from "../src/load_music_dir";

const tempDirs: string[] = [];

afterEach(async (): Promise<void> => {
	for (const dir of tempDirs.splice(0)) {
		await fs.rm(dir, { recursive: true, force: true });
	}
});

/**
 * Creates an isolated temporary directory registered for cleanup after the test.
 */
async function makeTempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "muzical-load-music-"));
	tempDirs.push(dir);
	return dir;
}

describe("readMusicDir", (): void => {
	it("returns an empty array when directory contains nothing matching", async (): Promise<void> => {
		const dir = await makeTempDir();
		await fs.writeFile(path.join(dir, "notes.txt"), "hi");

		const files = await readMusicDir(dir, [".mp3", ".flac"]);
		expect(files).to.deep.equal([]);
	});

	it("returns absolute paths for matching files", async (): Promise<void> => {
		const dir = await makeTempDir();
		const mp3 = path.join(dir, "a.mp3");
		const flac = path.join(dir, "b.flac");
		await fs.writeFile(mp3, "");
		await fs.writeFile(flac, "");

		const files = await readMusicDir(dir, [".mp3", ".flac"]);
		expect(files.sort()).to.deep.equal([mp3, flac].sort());
	});

	it("filters out files with extensions not in the allowed list", async (): Promise<void> => {
		const dir = await makeTempDir();
		await fs.writeFile(path.join(dir, "a.mp3"), "");
		await fs.writeFile(path.join(dir, "b.wav"), "");
		await fs.writeFile(path.join(dir, "c.flac"), "");

		const files = await readMusicDir(dir, [".mp3"]);
		expect(files).to.have.length(1);
		expect(files[0]?.endsWith("a.mp3")).to.equal(true);
	});

	it("recurses into nested subdirectories", async (): Promise<void> => {
		const dir = await makeTempDir();
		const nested = path.join(dir, "artist", "album");
		await fs.mkdir(nested, { recursive: true });
		await fs.writeFile(path.join(dir, "root.mp3"), "");
		await fs.writeFile(path.join(nested, "deep.mp3"), "");

		const files = await readMusicDir(dir, [".mp3"]);
		expect(files.sort()).to.deep.equal(
			[path.join(nested, "deep.mp3"), path.join(dir, "root.mp3")].sort(),
		);
	});

	it("rejects when given a non-existent path", async (): Promise<void> => {
		const bogus = path.join(os.tmpdir(), "muzical-does-not-exist-xyz-123");
		try {
			await readMusicDir(bogus, [".mp3"]);
			expect.fail("expected readMusicDir to reject");
		} catch (error: unknown) {
			expect(error).to.be.instanceOf(Error);
		}
	});
});
