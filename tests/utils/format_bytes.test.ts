import { describe, it } from "mocha";
import { expect } from "chai";

import { formatBytes } from "../../src/utils/format_bytes";

describe("formatBytes", (): void => {
	it('returns "0B" for zero or negative inputs', (): void => {
		expect(formatBytes(0)).to.equal("0B");
		expect(formatBytes(-1)).to.equal("0B");
		expect(formatBytes(-1024)).to.equal("0B");
	});

	it('returns "0B" for non-finite numbers', (): void => {
		expect(formatBytes(Number.NaN)).to.equal("0B");
		expect(formatBytes(Number.POSITIVE_INFINITY)).to.equal("0B");
		expect(formatBytes(Number.NEGATIVE_INFINITY)).to.equal("0B");
	});

	it("formats small sub-kilobyte values as bytes with no decimal", (): void => {
		expect(formatBytes(1)).to.equal("1B");
		expect(formatBytes(512)).to.equal("512B");
		expect(formatBytes(1023)).to.equal("1023B");
	});

	it("formats kilobyte values with one decimal place below 100", (): void => {
		expect(formatBytes(1024)).to.equal("1.0KB");
		expect(formatBytes(1024 * 4.3)).to.equal("4.3KB");
	});

	it("drops decimals when value >= 100 within a unit", (): void => {
		expect(formatBytes(1024 * 100)).to.equal("100KB");
		expect(formatBytes(1024 * 500)).to.equal("500KB");
	});

	it("climbs through MB, GB, TB units", (): void => {
		expect(formatBytes(1024 * 1024)).to.equal("1.0MB");
		expect(formatBytes(1024 * 1024 * 1024)).to.equal("1.0GB");
		expect(formatBytes(1024 * 1024 * 1024 * 1024)).to.equal("1.0TB");
	});

	it("caps at the TB unit for very large values", (): void => {
		const huge = 1024 * 1024 * 1024 * 1024 * 5000;
		expect(formatBytes(huge)).to.equal("5000TB");
	});

	it("accepts bigint input", (): void => {
		expect(formatBytes(0n)).to.equal("0B");
		expect(formatBytes(1024n)).to.equal("1.0KB");
		expect(formatBytes(BigInt(1024 * 1024))).to.equal("1.0MB");
	});
});
