import { describe, it } from "mocha";
import { expect } from "chai";
import path from "node:path";
import os from "node:os";

import { setMpvIpcVolume } from "../../src/utils/set_mpv_ipc_volume";

describe("setMpvIpcVolume", (): void => {
	it("does not throw synchronously when the socket path is unreachable", (): void => {
		const bogus = path.join(os.tmpdir(), "muzical-not-a-real-mpv-sock");
		expect((): void => setMpvIpcVolume(bogus, 50)).to.not.throw();
	});

	it("does not throw synchronously when given out-of-range volumes", (): void => {
		const bogus = path.join(os.tmpdir(), "muzical-not-a-real-mpv-sock");
		expect((): void => setMpvIpcVolume(bogus, -100)).to.not.throw();
		expect((): void => setMpvIpcVolume(bogus, 999)).to.not.throw();
		expect((): void => setMpvIpcVolume(bogus, 42.7)).to.not.throw();
	});
});
