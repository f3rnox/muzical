import { describe, it } from "mocha";
import { expect } from "chai";

import { clampIndex } from "../../src/utils/clamp_index";

describe("clampIndex", (): void => {
	it("returns -1 when the list is empty", (): void => {
		expect(clampIndex(0, -1, 0)).to.equal(-1);
		expect(clampIndex(0, 5, 3)).to.equal(-1);
	});

	it("treats currentIndex of -1 as 0 for movement", (): void => {
		expect(clampIndex(10, -1, 0)).to.equal(0);
		expect(clampIndex(10, -1, 3)).to.equal(3);
	});

	it("applies a positive delta and clamps to length - 1", (): void => {
		expect(clampIndex(5, 0, 2)).to.equal(2);
		expect(clampIndex(5, 2, 2)).to.equal(4);
		expect(clampIndex(5, 4, 100)).to.equal(4);
	});

	it("applies a negative delta and clamps to 0", (): void => {
		expect(clampIndex(5, 3, -1)).to.equal(2);
		expect(clampIndex(5, 3, -100)).to.equal(0);
	});

	it("returns the same index when delta is zero", (): void => {
		expect(clampIndex(5, 3, 0)).to.equal(3);
	});

	it("handles length of 1", (): void => {
		expect(clampIndex(1, 0, 5)).to.equal(0);
		expect(clampIndex(1, 0, -5)).to.equal(0);
		expect(clampIndex(1, -1, 0)).to.equal(0);
	});
});
