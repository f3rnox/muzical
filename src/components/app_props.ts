import { type Config } from "../load_config";
import { type LibrarySong } from "../types";
import { type PlayerCandidate } from "../utils/player_candidates";

export interface AppProps {
	config: Config;
	configPath: string;
	library: LibrarySong[];
	player?: PlayerCandidate | null;
}
