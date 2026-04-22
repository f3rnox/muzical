import { type LibrarySong } from '../load_library'

export interface LibraryAlbum {
	name: string
	artists: string[]
	songs: LibrarySong[]
}
