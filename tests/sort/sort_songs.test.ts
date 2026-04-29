import { describe, it } from "mocha";
import { expect } from "chai";
import { type IAudioMetadata } from "music-metadata";

import { sortSongs } from "../../src/sort/sort_songs";
import { type LibrarySong } from "../../src/types";

interface SongShape {
	filePath: string;
	title?: string;
	disk?: number;
	track?: number;
}

/**
 * Builds a minimal LibrarySong fixture with just enough common metadata fields for sort tests.
 */
function makeSong(shape: SongShape): LibrarySong {
	const metadata: Partial<IAudioMetadata> = {
		common: {
			title: shape.title,
			disk: shape.disk === undefined ? undefined : { no: shape.disk, of: null },
			track:
				shape.track === undefined ? undefined : { no: shape.track, of: null },
		} as IAudioMetadata["common"],
	};
	return {
		filePath: shape.filePath,
		metadata: metadata as IAudioMetadata,
	};
}

describe("sortSongs", (): void => {
	it("primarily sorts by disk number", (): void => {
		const a = makeSong({ filePath: "a", disk: 2, track: 1 });
		const b = makeSong({ filePath: "b", disk: 1, track: 5 });
		expect(sortSongs(a, b)).to.be.greaterThan(0);
		expect(sortSongs(b, a)).to.be.lessThan(0);
	});

	it("secondarily sorts by track number when disks match", (): void => {
		const a = makeSong({ filePath: "a", disk: 1, track: 5 });
		const b = makeSong({ filePath: "b", disk: 1, track: 2 });
		expect(sortSongs(a, b)).to.be.greaterThan(0);
		expect(sortSongs(b, a)).to.be.lessThan(0);
	});

	it("finally sorts by title when disks and tracks match", (): void => {
		const a = makeSong({ filePath: "a", disk: 1, track: 1, title: "Banana" });
		const b = makeSong({ filePath: "b", disk: 1, track: 1, title: "apple" });
		expect(sortSongs(a, b)).to.be.greaterThan(0);
		expect(sortSongs(b, a)).to.be.lessThan(0);
	});

	it("treats missing disk/track as 0", (): void => {
		const a = makeSong({ filePath: "a", title: "Song" });
		const b = makeSong({ filePath: "b", disk: 0, track: 0, title: "Song" });
		expect(sortSongs(a, b)).to.equal(0);
	});

	it("produces the expected overall ordering for a mixed list", (): void => {
		const songs = [
			makeSong({ filePath: "d2-t1", disk: 2, track: 1, title: "Z" }),
			makeSong({ filePath: "d1-t2-b", disk: 1, track: 2, title: "B" }),
			makeSong({ filePath: "d1-t2-a", disk: 1, track: 2, title: "A" }),
			makeSong({ filePath: "d1-t1", disk: 1, track: 1, title: "C" }),
		];
		songs.sort(sortSongs);
		expect(songs.map((s: LibrarySong): string => s.filePath)).to.deep.equal([
			"d1-t1",
			"d1-t2-a",
			"d1-t2-b",
			"d2-t1",
		]);
	});
});
