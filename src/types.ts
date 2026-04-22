import { type IAudioMetadata } from 'music-metadata'

export interface LibrarySong {
	filePath: string
	metadata: IAudioMetadata
}

export enum InputTarget {
	Artist,
	Album,
	Song,
}

export interface LibraryAlbum {
	name: string
	artists: string[]
	songs: LibrarySong[]
}
