import { type IAudioMetadata } from "music-metadata";

export interface LibrarySong {
	filePath: string;
	metadata: IAudioMetadata;
}

export enum InputTarget {
	Artist,
	Album,
	Song,
	Playlist,
}

export enum AppView {
	Library,
	Playlist,
	NowPlaying,
	Soulseek,
	Config,
	Visualizer,
}

export interface LibraryAlbum {
	name: string;
	artists: string[];
	songs: LibrarySong[];
}
