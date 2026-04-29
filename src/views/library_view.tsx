import React from "react";

import ArtistList from "../components/artist_list";
import AlbumList from "../components/album_list";
import SongList from "../components/song_list";
import {
	type LibraryAlbum,
	type LibrarySong,
	type InputTarget,
} from "../types";

export interface LibraryViewProps {
	inputTarget: InputTarget;
	maxRows: number;
	visibleArtists: string[];
	selectedArtist: string;
	totalArtistCount: number;
	visibleAlbums: LibraryAlbum[];
	selectedAlbum: LibraryAlbum | null;
	totalAlbumCount: number;
	visibleSongs: LibrarySong[];
	selectedSong: LibrarySong | null;
	totalSongCount: number;
}

/**
 * Three-column library browser: artists, albums for the selected artist, and songs for the selected album.
 *
 * @param props - Filtered lists, selections, focus target, and scroll budget pulled from app state.
 */
export default function LibraryView(props: Readonly<LibraryViewProps>) {
	const {
		inputTarget,
		maxRows,
		visibleArtists,
		selectedArtist,
		totalArtistCount,
		visibleAlbums,
		selectedAlbum,
		totalAlbumCount,
		visibleSongs,
		selectedSong,
		totalSongCount,
	} = props;

	return (
		<>
			<ArtistList
				artistNames={visibleArtists}
				selectedArtist={selectedArtist}
				inputTarget={inputTarget}
				maxRows={maxRows}
				totalCount={totalArtistCount}
			/>
			<AlbumList
				albumsForSelectedArtist={visibleAlbums}
				selectedAlbum={selectedAlbum}
				inputTarget={inputTarget}
				maxRows={maxRows}
				totalCount={totalAlbumCount}
			/>
			<SongList
				songs={visibleSongs}
				selectedSong={selectedSong}
				inputTarget={inputTarget}
				maxRows={maxRows}
				totalCount={totalSongCount}
			/>
		</>
	);
}
