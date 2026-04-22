import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, useApp } from 'ink'

import { type AppProps } from './components/app_props'
import ArtistList from './components/artist_list'
import AlbumList from './components/album_list'
import SongList from './components/song_list'
import StatusBar from './components/status_bar'
import PlaybackBar from './components/playback_bar'
import HelpBar from './components/help_bar'
import { type LibraryAlbum, InputTarget } from './types'
import { type LibrarySong } from './types'
import { clampIndex } from './utils/clamp_index'
import { matchesQuery } from './utils/matches_query'
import { sortAlphabetical } from './sort/sort_alphabetical'
import { sortSongs } from './sort/sort_songs'
import { type JumpPosition, useAppInput } from './hooks/use_app_input'
import { useArtistNames } from './hooks/use_artist_names'
import { useLibraryAlbums } from './hooks/use_library_albums'
import { useSearchQueries } from './hooks/use_search_queries'
import { useTerminalSize } from './hooks/use_terminal_size'
import { detectPlayer } from './utils/detect_player'
import { usePlayer } from './hooks/use_player'

const LIST_ROW_OVERHEAD = 11

/**
 * Root Ink layout: artist / album / song columns, playback bar, and keyboard-driven search and navigation.
 *
 * @param props - Resolved config, full library, and optional injected player (otherwise auto-detected).
 */
export default function App(props: Readonly<AppProps>) {
	const { exit } = useApp()
	const { library, player: injectedPlayer } = props
	const { columns, rows } = useTerminalSize()
	const listMaxRows = Math.max(3, rows - LIST_ROW_OVERHEAD)

	const allAlbums = useLibraryAlbums(library)
	const allArtistNames = useArtistNames(library)

	const player = useMemo(
		() => injectedPlayer ?? detectPlayer(),
		[injectedPlayer]
	)
	const { playingSong, playerName, playStartedAt, toggle, stop } = usePlayer({ player })

	const [inputTarget, setInputTarget] = useState<InputTarget>(InputTarget.Artist)
	const [selectedArtist, setSelectedArtist] = useState<string>('')
	const [selectedAlbum, setSelectedAlbum] = useState<LibraryAlbum | null>(null)
	const [selectedSong, setSelectedSong] = useState<LibrarySong | null>(null)
	const [isSearching, setIsSearching] = useState<boolean>(false)
	const { queries, setQueryFor, clearQueryFor } = useSearchQueries()

	const activeQuery = queries[inputTarget]

	const visibleArtists = useMemo((): string[] => (
		allArtistNames.filter((name: string): boolean => (
			matchesQuery(name, queries[InputTarget.Artist])
		))
	), [allArtistNames, queries])

	const albumsForSelectedArtist = useMemo((): LibraryAlbum[] => (
		allAlbums
			.filter(({ artists }): boolean => artists.includes(selectedArtist))
			.sort((a: LibraryAlbum, b: LibraryAlbum): number => (
				sortAlphabetical(a.name, b.name)
			))
	), [allAlbums, selectedArtist])

	const visibleAlbums = useMemo((): LibraryAlbum[] => (
		albumsForSelectedArtist.filter((album: LibraryAlbum): boolean => (
			matchesQuery(album.name, queries[InputTarget.Album])
		))
	), [albumsForSelectedArtist, queries])

	const songsForSelectedAlbum = useMemo((): LibrarySong[] => (
		[...(selectedAlbum?.songs ?? [])].sort(sortSongs)
	), [selectedAlbum])

	const visibleSongs = useMemo((): LibrarySong[] => (
		songsForSelectedAlbum.filter((song: LibrarySong): boolean => (
			matchesQuery(song.metadata.common.title ?? '', queries[InputTarget.Song])
		))
	), [songsForSelectedAlbum, queries])

	/** Moves the artist selection by `delta` rows within the filtered artist list. */
	const moveArtist = useCallback((delta: number): void => {
		const current = visibleArtists.indexOf(selectedArtist)
		const next = clampIndex(visibleArtists.length, current, delta)
		const name = next === -1 ? undefined : visibleArtists[next]

		if (name !== undefined) {
			setSelectedArtist(name)
		}
	}, [visibleArtists, selectedArtist])

	/** Moves the album selection by `delta` rows within the visible albums for the current artist. */
	const moveAlbum = useCallback((delta: number): void => {
		const current = visibleAlbums.findIndex(({ name }): boolean => (
			name === selectedAlbum?.name
		))
		const next = clampIndex(visibleAlbums.length, current, delta)
		const album = next === -1 ? undefined : visibleAlbums[next]

		if (album !== undefined) {
			setSelectedAlbum(album)
		}
	}, [visibleAlbums, selectedAlbum])

	/** Moves the song selection by `delta` rows within the visible track list for the current album. */
	const moveSong = useCallback((delta: number): void => {
		const current = visibleSongs.findIndex((song: LibrarySong): boolean => (
			song.filePath === selectedSong?.filePath
		))
		const next = clampIndex(visibleSongs.length, current, delta)
		const song = next === -1 ? undefined : visibleSongs[next]

		if (song !== undefined) {
			setSelectedSong(song)
		}
	}, [visibleSongs, selectedSong])

	/** Dispatches vertical navigation to the list column that currently owns keyboard focus. */
	const moveBy = useCallback((delta: number): void => {
		if (inputTarget === InputTarget.Artist) {
			moveArtist(delta)
		} else if (inputTarget === InputTarget.Album) {
			moveAlbum(delta)
		} else {
			moveSong(delta)
		}
	}, [inputTarget, moveArtist, moveAlbum, moveSong])

	/** Jumps the focused list to its first or last visible row (`g` / `G` bindings). */
	const jumpTo = useCallback((position: JumpPosition): void => {
		if (inputTarget === InputTarget.Artist) {
			const name = position === 'start' ? visibleArtists[0] : visibleArtists.at(-1)

			if (name !== undefined) {
				setSelectedArtist(name)
			}
		} else if (inputTarget === InputTarget.Album) {
			const album = position === 'start' ? visibleAlbums[0] : visibleAlbums.at(-1)

			if (album !== undefined) {
				setSelectedAlbum(album)
			}
		} else {
			const song = position === 'start' ? visibleSongs[0] : visibleSongs.at(-1)

			if (song !== undefined) {
				setSelectedSong(song)
			}
		}
	}, [inputTarget, visibleArtists, visibleAlbums, visibleSongs])

	/** Moves keyboard focus from album/song column toward the artist column when possible. */
	const focusPrevColumn = useCallback((): void => {
		if (inputTarget === InputTarget.Album) {
			setInputTarget(InputTarget.Artist)
		} else if (inputTarget === InputTarget.Song) {
			setInputTarget(InputTarget.Album)
		}
	}, [inputTarget])

	/** Moves keyboard focus from artist/album column toward the song column when possible. */
	const focusNextColumn = useCallback((): void => {
		if (inputTarget === InputTarget.Artist) {
			setInputTarget(InputTarget.Album)
		} else if (inputTarget === InputTarget.Album) {
			setInputTarget(InputTarget.Song)
		}
	}, [inputTarget])

	/** Starts or stops the external player for the currently selected song. */
	const togglePlayback = useCallback((): void => {
		toggle(selectedSong)
	}, [toggle, selectedSong])

	useAppInput({
		inputTarget,
		isSearching,
		listMaxRows,
		exit,
		setIsSearching,
		setQueryFor,
		clearQueryFor,
		moveBy,
		jumpTo,
		focusPrevColumn,
		focusNextColumn,
		togglePlayback,
		stopPlayback: stop
	})

	useEffect((): void => {
		if (visibleArtists.length === 0) {
			setSelectedArtist('')

			return
		}

		if (!visibleArtists.includes(selectedArtist)) {
			setSelectedArtist(visibleArtists[0] ?? '')
		}
	}, [visibleArtists, selectedArtist])

	useEffect((): void => {
		if (visibleAlbums.length === 0) {
			setSelectedAlbum(null)

			return
		}

		const stillPresent = visibleAlbums.some(({ name }): boolean => (
			name === selectedAlbum?.name
		))

		if (!stillPresent) {
			setSelectedAlbum(visibleAlbums[0] ?? null)
		}
	}, [visibleAlbums, selectedAlbum])

	useEffect((): void => {
		if (visibleSongs.length === 0) {
			setSelectedSong(null)

			return
		}

		const stillPresent = visibleSongs.some((song: LibrarySong): boolean => (
			song.filePath === selectedSong?.filePath
		))

		if (!stillPresent) {
			setSelectedSong(visibleSongs[0] ?? null)
		}
	}, [visibleSongs, selectedSong])

	return (
		<Box flexDirection="column">
			<StatusBar
				width={columns}
				totalSongs={library.length}
				totalArtists={allArtistNames.length}
				totalAlbums={allAlbums.length}
				selectedArtist={selectedArtist}
				selectedAlbum={selectedAlbum}
				selectedSong={selectedSong}
			/>
			<Box flexGrow={1}>
				<ArtistList
					artistNames={visibleArtists}
					selectedArtist={selectedArtist}
					inputTarget={inputTarget}
					maxRows={listMaxRows}
					totalCount={allArtistNames.length}
				/>
				<AlbumList
					albumsForSelectedArtist={visibleAlbums}
					selectedAlbum={selectedAlbum}
					inputTarget={inputTarget}
					maxRows={listMaxRows}
					totalCount={albumsForSelectedArtist.length}
				/>
				<SongList
					songs={visibleSongs}
					selectedSong={selectedSong}
					inputTarget={inputTarget}
					maxRows={listMaxRows}
					totalCount={songsForSelectedAlbum.length}
				/>
			</Box>
			<PlaybackBar
				width={columns}
				playingSong={playingSong}
				playerName={playerName}
				playStartedAt={playStartedAt}
			/>
			<HelpBar isSearching={isSearching} searchQuery={activeQuery} />
		</Box>
	)
}
