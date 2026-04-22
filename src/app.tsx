import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { Key, Box, useApp, useInput } from 'ink'
import lodash from 'lodash'

import { type AppProps } from './components/app_props'
import ArtistList from './components/artist_list'
import AlbumList from './components/album_list'
import SongList from './components/song_list'
import { InputTarget } from './components/input_target'
import { type LibraryAlbum } from './components/library_album'
import { type LibrarySong } from './load_library'

export default function App(props: Readonly<AppProps>) {
	const { exit } = useApp()
	const { library } = props
	const albumNames = useMemo((): string[] => (
		lodash.uniq(library.map(({ metadata }): string => (
			metadata.common.album ?? ''
		)))
	), [library])

	const artistNames = useMemo((): string[] => (
		lodash.uniq(library.map(({ metadata }): string => (
			metadata.common.artist ?? ''
		)))
	), [library])

	const [inputTarget, setInputTarget] = useState(InputTarget.Artist)
	const [selectedArtist, setSelectedArtist] = useState('')
	const [selectedAlbum, setSelectedAlbum] = useState<LibraryAlbum | null>(null)
	const [selectedSong, setSelectedSong] = useState<LibrarySong | null>(null)

	const albums = useMemo((): LibraryAlbum[] => (
		albumNames.map((album: string): LibraryAlbum => {
			const songs = library.filter(({ metadata }): boolean => metadata.common.album === album)

			return {
				name: album,
				artists: lodash.uniq(songs.map(({ metadata }) => metadata.common.artist ?? '')),
				songs,
			}
		})
	), [library, albumNames])

	const albumsForSelectedArtist = useMemo((): LibraryAlbum[] => (
		albums.filter(({ artists }) => artists.includes(selectedArtist))
	), [selectedArtist, albums])

	const onArtistInput = useCallback((_: string, key: Key): void => {
		if (key.downArrow) {
			const artistI = artistNames.indexOf(selectedArtist)
			const artistName = artistNames[artistI + 1]

			if (artistName !== undefined) {
				setSelectedArtist(artistName)
			}
		} else if (key.upArrow) {
			const artistI = artistNames.indexOf(selectedArtist)
			const artistName = artistNames[artistI - 1]

			if (artistName !== undefined) {
				setSelectedArtist(artistName)
			}
		}
	}, [artistNames, selectedArtist])

	const onAlbumInput = useCallback((_: string, key: Key): void => {
		if (key.downArrow) {
			const albumI = albumsForSelectedArtist.findIndex(({ name }): boolean => name === selectedAlbum?.name)
			const album = albumsForSelectedArtist[albumI + 1]

			if (album !== undefined) {
				setSelectedAlbum(album)
			}
		} else if (key.upArrow) {
			const albumI = albumsForSelectedArtist.findIndex(({ name }): boolean => name === selectedAlbum?.name)
			const album = albumsForSelectedArtist[albumI - 1]

			if (album !== undefined) {
				setSelectedAlbum(album)
			}
		}
	}, [albumsForSelectedArtist, selectedAlbum])

	const onSongInput = useCallback((_: string, key: Key): void => {
		if (key.downArrow) {
			const songI = selectedAlbum?.songs.findIndex(({ metadata }): boolean => metadata.common.title === selectedSong?.metadata.common.title) ?? 0
			const song = (selectedAlbum?.songs ?? [])[songI + 1]

			if (song !== undefined) {
				setSelectedSong(song)
			}
		} else if (key.upArrow) {
			const songI = selectedAlbum?.songs.findIndex(({ metadata }): boolean => metadata.common.title === selectedSong?.metadata.common.title) ?? 0
			const song = (selectedAlbum?.songs ?? [])[songI - 1]

			if (song !== undefined) {
				setSelectedSong(song)
			}
		}
	}, [selectedAlbum, selectedSong])

	useInput((input, key): void => {
		if (input === 'q') {
			exit()
		}

		if (key.leftArrow) {
			if (inputTarget === InputTarget.Album) {
				setInputTarget(InputTarget.Artist)
			} else if (inputTarget === InputTarget.Song) {
				setInputTarget(InputTarget.Album)
			}
		} else if (key.rightArrow) {
			if (inputTarget === InputTarget.Artist) {
				setInputTarget(InputTarget.Album)
			} else if (inputTarget === InputTarget.Album) {
				setInputTarget(InputTarget.Song)
			}
		} else if (inputTarget === InputTarget.Artist) {
			onArtistInput(input, key)
		} else if (inputTarget === InputTarget.Album) {
			onAlbumInput(input, key)
		} else if (inputTarget === InputTarget.Song) {
			onSongInput(input, key)
		}
	})

	useEffect(() => {
		setSelectedArtist(artistNames[0] ?? '')
	}, [artistNames])

	useEffect(() => {
		setSelectedAlbum(albumsForSelectedArtist[0] ?? null)
	}, [albumsForSelectedArtist])

	useEffect(() => {
		setSelectedSong(selectedAlbum?.songs[0] ?? null)
	}, [selectedAlbum])

	return (
		<Box gap={1}>
			<ArtistList artistNames={artistNames} selectedArtist={selectedArtist} inputTarget={inputTarget} />
			<AlbumList albumsForSelectedArtist={albumsForSelectedArtist} selectedAlbum={selectedAlbum} inputTarget={inputTarget} />
			<SongList songs={selectedAlbum?.songs ?? []} selectedSong={selectedSong} inputTarget={inputTarget} />
		</Box>
	)
}
