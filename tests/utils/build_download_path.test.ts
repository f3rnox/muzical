import { describe, it } from "mocha";
import { expect } from "chai";
import path from "node:path";

import { buildDownloadPath } from "../../src/utils/build_download_path";

const MUSIC_DIR = "/music";

/**
 * Extracts the filename from an absolute path built by `buildDownloadPath`.
 */
function basename(p: string): string {
	return path.basename(p);
}

describe("buildDownloadPath", (): void => {
	it("places the result inside the given music directory", (): void => {
		const result = buildDownloadPath(MUSIC_DIR, "alice", "song.mp3");
		expect(path.dirname(result)).to.equal(MUSIC_DIR);
	});

	it('prefixes the filename with "slsk-" and the username', (): void => {
		const result = buildDownloadPath(MUSIC_DIR, "alice", "song.mp3");
		const name = basename(result);
		expect(name.startsWith("slsk-alice-")).to.equal(true);
	});

	it("preserves the original extension", (): void => {
		const mp3 = buildDownloadPath(MUSIC_DIR, "u", "track.mp3");
		const flac = buildDownloadPath(MUSIC_DIR, "u", "music.flac");
		const none = buildDownloadPath(MUSIC_DIR, "u", "plain");
		expect(path.extname(mp3)).to.equal(".mp3");
		expect(path.extname(flac)).to.equal(".flac");
		expect(path.extname(none)).to.equal("");
	});

	it("handles Windows-style backslash separators in remote filenames", (): void => {
		const result = buildDownloadPath(
			MUSIC_DIR,
			"alice",
			"folder\\sub\\song.mp3",
		);
		const name = basename(result);
		expect(name).to.include("song");
		expect(name.endsWith(".mp3")).to.equal(true);
		expect(name).to.not.include("folder");
		expect(name).to.not.include("sub");
	});

	it("strips unsafe characters from the username", (): void => {
		const result = buildDownloadPath(MUSIC_DIR, "some/bad\\user?", "song.mp3");
		const name = basename(result);
		expect(name.startsWith("slsk-some_bad_user_-")).to.equal(true);
	});

	it("strips unsafe characters from the base filename", (): void => {
		const result = buildDownloadPath(
			MUSIC_DIR,
			"alice",
			"weird*name?<title>.mp3",
		);
		const name = basename(result);
		expect(name).to.not.include("*");
		expect(name).to.not.include("?");
		expect(name).to.not.include("<");
		expect(name).to.not.include(">");
	});

	it("replaces unsafe base-name characters with underscores", (): void => {
		const result = buildDownloadPath(MUSIC_DIR, "alice", "???.mp3");
		const name = basename(result);
		expect(name).to.include("___");
		expect(name.endsWith(".mp3")).to.equal(true);
	});

	it("includes a numeric timestamp before the extension", (): void => {
		const result = buildDownloadPath(MUSIC_DIR, "alice", "song.mp3");
		const name = basename(result);
		const match = name.match(/-(\d+)\.mp3$/);
		expect(match).to.not.equal(null);
	});
});
