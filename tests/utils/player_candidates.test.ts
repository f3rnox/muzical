import { describe, it } from "mocha";
import { expect } from "chai";

import {
	PLAYER_CANDIDATES,
	type PlayerCandidate,
} from "../../src/utils/player_candidates";

describe("PLAYER_CANDIDATES", (): void => {
	it("exposes the expected players in order", (): void => {
		const names = PLAYER_CANDIDATES.map((c: PlayerCandidate): string => c.name);
		expect(names).to.deep.equal(["mpg123", "mpv", "ffplay", "vlc"]);
	});

	it("pairs each player name with a matching bin", (): void => {
		for (const candidate of PLAYER_CANDIDATES) {
			expect(candidate.bin).to.be.a("string").and.have.length.greaterThan(0);
			expect(candidate.args).to.be.an("array");
		}
	});

	it("only vlc declares suffixArgs with a quit URI", (): void => {
		for (const candidate of PLAYER_CANDIDATES) {
			if (candidate.name === "vlc") {
				expect(candidate.suffixArgs).to.deep.equal(["vlc://quit"]);
			} else {
				expect(candidate.suffixArgs).to.equal(undefined);
			}
		}
	});
});
