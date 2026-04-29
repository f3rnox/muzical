import { describe, it } from "mocha";
import { expect } from "chai";

import { isPlayerName, PLAYER_NAMES } from "../../src/utils/resolve_player";

describe("isPlayerName", (): void => {
	it("accepts every known player id", (): void => {
		for (const name of PLAYER_NAMES) {
			expect(isPlayerName(name)).to.equal(true);
		}
	});

	it("rejects unknown strings", (): void => {
		expect(isPlayerName("mpg321")).to.equal(false);
		expect(isPlayerName("")).to.equal(false);
		expect(isPlayerName("VLC")).to.equal(false);
	});
});

describe("PLAYER_NAMES", (): void => {
	it("has the same length and order as PLAYER_CANDIDATES", (): void => {
		expect(PLAYER_NAMES).to.deep.equal(["mpg123", "mpv", "ffplay", "vlc"]);
	});
});
