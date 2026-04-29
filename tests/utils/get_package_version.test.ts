import { describe, it } from "mocha";
import { expect } from "chai";

import { getPackageVersion } from "../../src/utils/get_package_version";

describe("getPackageVersion", (): void => {
	it("returns a semver-shaped string", (): void => {
		const version = getPackageVersion();
		expect(version).to.match(/^\d+\.\d+\.\d+/);
	});
});
