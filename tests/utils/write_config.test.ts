import { describe, it, afterEach } from "mocha";
import { expect } from "chai";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

import { writeConfig } from "../../src/utils/write_config";
import { type Config } from "../../src/load_config";

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
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "muzical-write-config-"));
	tempDirs.push(dir);
	return dir;
}

describe("writeConfig", (): void => {
	it("writes the config as pretty JSON with a trailing newline", async (): Promise<void> => {
		const dir = await makeTempDir();
		const configPath = path.join(dir, "config.json");
		const config: Config = {
			musicDir: "/music",
			songExtensions: [".mp3"],
			soulseekUsername: "alice",
			soulseekPassword: "hunter2",
		};

		await writeConfig(configPath, config);

		const raw = await fs.readFile(configPath, "utf-8");
		expect(raw.endsWith("\n")).to.equal(true);

		const parsed: unknown = JSON.parse(raw);
		expect(parsed).to.deep.equal(config);
	});

	it("creates any missing parent directories", async (): Promise<void> => {
		const dir = await makeTempDir();
		const configPath = path.join(dir, "nested", "deep", "config.json");
		const config: Config = {
			musicDir: "/music",
			songExtensions: [],
			soulseekUsername: "",
			soulseekPassword: "",
		};

		await writeConfig(configPath, config);

		const stat = await fs.stat(configPath);
		expect(stat.isFile()).to.equal(true);
	});

	it("persists only the known Config fields", async (): Promise<void> => {
		const dir = await makeTempDir();
		const configPath = path.join(dir, "config.json");
		const config = {
			musicDir: "/m",
			songExtensions: [".flac"],
			soulseekUsername: "u",
			soulseekPassword: "p",
			extra: "should-not-persist",
		} as unknown as Config;

		await writeConfig(configPath, config);

		const parsed: Record<string, unknown> = JSON.parse(
			await fs.readFile(configPath, "utf-8"),
		);
		expect(Object.keys(parsed).sort()).to.deep.equal([
			"musicDir",
			"songExtensions",
			"soulseekPassword",
			"soulseekUsername",
		]);
	});
});
