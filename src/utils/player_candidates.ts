export type PlayerName = "mpg123" | "mpv" | "ffplay" | "vlc";

export interface PlayerCandidate {
	name: PlayerName;
	bin: string;
	args: readonly string[];
	suffixArgs?: readonly string[];
}

export const PLAYER_CANDIDATES: readonly PlayerCandidate[] = [
	{
		name: "mpg123",
		bin: "mpg123",
		args: ["-q"],
	},
	{
		name: "mpv",
		bin: "mpv",
		args: ["--no-video", "--really-quiet", "--no-terminal"],
	},
	{
		name: "ffplay",
		bin: "ffplay",
		args: ["-nodisp", "-autoexit", "-loglevel", "quiet"],
	},
	{
		name: "vlc",
		bin: "vlc",
		args: ["-I", "dummy", "--quiet", "--play-and-exit"],
		suffixArgs: ["vlc://quit"],
	},
];
