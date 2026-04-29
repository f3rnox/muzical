import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, useApp } from "ink";

import { type AppProps } from "./components/app_props";
import StatusBar from "./components/status_bar";
import PlaybackBar from "./components/playback_bar";
import HelpBar from "./components/help_bar";
import LibraryView from "./views/library_view";
import PlaylistView from "./views/playlist_view";
import NowPlayingView from "./views/now_playing_view";
import SoulseekView from "./views/soulseek_view";
import ConfigView from "./views/config_view";
import VisualizerView from "./views/visualizer_view";
import { type Config } from "./load_config";
import {
	type LibraryAlbum,
	type LibrarySong,
	AppView,
	InputTarget,
} from "./types";
import { clampIndex } from "./utils/clamp_index";
import { matchesQuery } from "./utils/matches_query";
import { sortAlphabetical } from "./sort/sort_alphabetical";
import { sortSongs } from "./sort/sort_songs";
import { type JumpPosition, useAppInput } from "./hooks/use_app_input";
import { useArtistNames } from "./hooks/use_artist_names";
import { useLibraryAlbums } from "./hooks/use_library_albums";
import { useSearchQueries } from "./hooks/use_search_queries";
import { useTerminalSize } from "./hooks/use_terminal_size";
import { detectPlayer } from "./utils/detect_player";
import { usePlayer } from "./hooks/use_player";

const LIST_ROW_OVERHEAD = 11;

/**
 * Returns the first or last item in a list based on jump position.
 *
 * @param items - Items to inspect.
 * @param position - Whether to jump to list start or end.
 */
function getEdgeItem<T>(
	items: readonly T[],
	position: JumpPosition,
): T | undefined {
	return position === "start" ? items[0] : items.at(-1);
}

/**
 * Root Ink layout: artist / album / song columns, playback bar, and keyboard-driven search and navigation.
 *
 * @param props - Resolved config, full library, and optional injected player (otherwise auto-detected).
 */
export default function App(props: Readonly<AppProps>) {
	const { exit } = useApp();
	const { library, player: injectedPlayer, configPath } = props;
	const [config, setConfig] = useState<Config>(props.config);
	const { columns, rows } = useTerminalSize();
	const listMaxRows = Math.max(3, rows - LIST_ROW_OVERHEAD);

	const allAlbums = useLibraryAlbums(library);
	const allArtistNames = useArtistNames(library);

	const player = useMemo(
		() => injectedPlayer ?? detectPlayer(),
		[injectedPlayer],
	);
	const {
		playingSong,
		playerName,
		playStartedAt,
		volume,
		play,
		toggle,
		stop,
		adjustVolume,
	} = usePlayer({ player });

	const [appView, setAppView] = useState<AppView>(AppView.Library);
	const [inputTarget, setInputTarget] = useState<InputTarget>(
		InputTarget.Artist,
	);
	const [selectedArtist, setSelectedArtist] = useState<string>("");
	const [selectedAlbum, setSelectedAlbum] = useState<LibraryAlbum | null>(null);
	const [selectedSong, setSelectedSong] = useState<LibrarySong | null>(null);
	const [playlistSongs, setPlaylistSongs] = useState<LibrarySong[]>([]);
	const [selectedPlaylistSong, setSelectedPlaylistSong] =
		useState<LibrarySong | null>(null);
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const { queries, setQueryFor, clearQueryFor } = useSearchQueries();

	const effectiveInputTarget =
		appView === AppView.Playlist ? InputTarget.Playlist : inputTarget;
	const activeQuery = queries[effectiveInputTarget];

	const visibleArtists = useMemo(
		(): string[] =>
			allArtistNames.filter((name: string): boolean =>
				matchesQuery(name, queries[InputTarget.Artist]),
			),
		[allArtistNames, queries],
	);

	const albumsForSelectedArtist = useMemo(
		(): LibraryAlbum[] =>
			allAlbums
				.filter(({ artists }): boolean => artists.includes(selectedArtist))
				.sort((a: LibraryAlbum, b: LibraryAlbum): number =>
					sortAlphabetical(a.name, b.name),
				),
		[allAlbums, selectedArtist],
	);

	const visibleAlbums = useMemo(
		(): LibraryAlbum[] =>
			albumsForSelectedArtist.filter((album: LibraryAlbum): boolean =>
				matchesQuery(album.name, queries[InputTarget.Album]),
			),
		[albumsForSelectedArtist, queries],
	);

	const songsForSelectedAlbum = useMemo(
		(): LibrarySong[] => [...(selectedAlbum?.songs ?? [])].sort(sortSongs),
		[selectedAlbum],
	);

	const visibleSongs = useMemo(
		(): LibrarySong[] =>
			songsForSelectedAlbum.filter((song: LibrarySong): boolean =>
				matchesQuery(
					song.metadata.common.title ?? "",
					queries[InputTarget.Song],
				),
			),
		[songsForSelectedAlbum, queries],
	);

	const visiblePlaylistSongs = useMemo(
		(): LibrarySong[] =>
			playlistSongs.filter((song: LibrarySong): boolean => {
				const { title, artist } = song.metadata.common;
				const haystack = `${artist ?? ""} ${title ?? ""}`.trim();
				return matchesQuery(haystack, queries[InputTarget.Playlist]);
			}),
		[playlistSongs, queries],
	);

	const moveArtist = useCallback(
		(delta: number): void => {
			const current = visibleArtists.indexOf(selectedArtist);
			const next = clampIndex(visibleArtists.length, current, delta);
			const name = next === -1 ? undefined : visibleArtists[next];

			if (name !== undefined) {
				setSelectedArtist(name);
			}
		},
		[visibleArtists, selectedArtist],
	);

	const moveAlbum = useCallback(
		(delta: number): void => {
			const current = visibleAlbums.findIndex(
				({ name }): boolean => name === selectedAlbum?.name,
			);
			const next = clampIndex(visibleAlbums.length, current, delta);
			const album = next === -1 ? undefined : visibleAlbums[next];

			if (album !== undefined) {
				setSelectedAlbum(album);
			}
		},
		[visibleAlbums, selectedAlbum],
	);

	const moveSong = useCallback(
		(delta: number): void => {
			const current = visibleSongs.findIndex(
				(song: LibrarySong): boolean =>
					song.filePath === selectedSong?.filePath,
			);
			const next = clampIndex(visibleSongs.length, current, delta);
			const song = next === -1 ? undefined : visibleSongs[next];

			if (song !== undefined) {
				setSelectedSong(song);
			}
		},
		[visibleSongs, selectedSong],
	);

	const movePlaylistSong = useCallback(
		(delta: number): void => {
			const current = visiblePlaylistSongs.findIndex(
				(song: LibrarySong): boolean =>
					song.filePath === selectedPlaylistSong?.filePath,
			);
			const next = clampIndex(visiblePlaylistSongs.length, current, delta);
			const song = next === -1 ? undefined : visiblePlaylistSongs[next];

			if (song !== undefined) {
				setSelectedPlaylistSong(song);
			}
		},
		[visiblePlaylistSongs, selectedPlaylistSong],
	);

	const moveBy = useCallback(
		(delta: number): void => {
			if (appView === AppView.Playlist) {
				movePlaylistSong(delta);

				return;
			}

			if (inputTarget === InputTarget.Artist) {
				moveArtist(delta);
			} else if (inputTarget === InputTarget.Album) {
				moveAlbum(delta);
			} else {
				moveSong(delta);
			}
		},
		[appView, inputTarget, moveArtist, moveAlbum, moveSong, movePlaylistSong],
	);

	/**
	 * Plays the next or previous track in the global playlist, updating the playlist selection to match.
	 *
	 * @param delta - -1 for previous, +1 for next.
	 */
	const playPlaylistRelative = useCallback(
		(delta: number): void => {
			if (playlistSongs.length === 0) {
				return;
			}

			const indexForPath = (filePath: string | undefined): number =>
				filePath === undefined
					? -1
					: playlistSongs.findIndex(
							(song: LibrarySong): boolean => song.filePath === filePath,
						);

			let i = indexForPath(playingSong?.filePath);

			if (i === -1) {
				i = indexForPath(selectedPlaylistSong?.filePath);
			}

			const nextIndex: number = ((): number => {
				if (i === -1) {
					return delta > 0 ? 0 : playlistSongs.length - 1;
				}

				return clampIndex(playlistSongs.length, i, delta);
			})();

			const target = playlistSongs[nextIndex];

			if (target === undefined) {
				return;
			}

			setSelectedPlaylistSong(target);
			play(target);
		},
		[playlistSongs, playingSong, selectedPlaylistSong, play],
	);

	const jumpPlaylistSong = useCallback(
		(position: JumpPosition): void => {
			const song = getEdgeItem(visiblePlaylistSongs, position);

			if (song !== undefined) {
				setSelectedPlaylistSong(song);
			}
		},
		[visiblePlaylistSongs],
	);

	const jumpArtist = useCallback(
		(position: JumpPosition): void => {
			const name = getEdgeItem(visibleArtists, position);

			if (name !== undefined) {
				setSelectedArtist(name);
			}
		},
		[visibleArtists],
	);

	const jumpAlbum = useCallback(
		(position: JumpPosition): void => {
			const album = getEdgeItem(visibleAlbums, position);

			if (album !== undefined) {
				setSelectedAlbum(album);
			}
		},
		[visibleAlbums],
	);

	const jumpSong = useCallback(
		(position: JumpPosition): void => {
			const song = getEdgeItem(visibleSongs, position);

			if (song !== undefined) {
				setSelectedSong(song);
			}
		},
		[visibleSongs],
	);

	const jumpTo = useCallback(
		(position: JumpPosition): void => {
			if (appView === AppView.Playlist) {
				jumpPlaylistSong(position);

				return;
			}

			if (inputTarget === InputTarget.Artist) {
				jumpArtist(position);
			} else if (inputTarget === InputTarget.Album) {
				jumpAlbum(position);
			} else {
				jumpSong(position);
			}
		},
		[appView, inputTarget, jumpPlaylistSong, jumpArtist, jumpAlbum, jumpSong],
	);

	const focusPrevColumn = useCallback((): void => {
		if (inputTarget === InputTarget.Album) {
			setInputTarget(InputTarget.Artist);
		} else if (inputTarget === InputTarget.Song) {
			setInputTarget(InputTarget.Album);
		}
	}, [inputTarget]);

	const focusNextColumn = useCallback((): void => {
		if (inputTarget === InputTarget.Artist) {
			setInputTarget(InputTarget.Album);
		} else if (inputTarget === InputTarget.Album) {
			setInputTarget(InputTarget.Song);
		}
	}, [inputTarget]);

	const togglePlayback = useCallback((): void => {
		const target =
			appView === AppView.Playlist ? selectedPlaylistSong : selectedSong;
		toggle(target);
	}, [appView, toggle, selectedSong, selectedPlaylistSong]);

	const appendToPlaylist = useCallback((candidates: LibrarySong[]): void => {
		if (candidates.length === 0) {
			return;
		}

		setPlaylistSongs((prev: LibrarySong[]): LibrarySong[] => {
			const existing = new Set<string>(
				prev.map((song: LibrarySong): string => song.filePath),
			);
			const additions = candidates.filter(
				(song: LibrarySong): boolean => !existing.has(song.filePath),
			);

			if (additions.length === 0) {
				return prev;
			}

			return [...prev, ...additions];
		});
	}, []);

	const addFocusedToPlaylist = useCallback((): void => {
		if (inputTarget === InputTarget.Artist) {
			const songs = allAlbums
				.filter(({ artists }): boolean => artists.includes(selectedArtist))
				.flatMap(({ songs: albumSongs }): LibrarySong[] => albumSongs)
				.sort(sortSongs);
			appendToPlaylist(songs);

			return;
		}

		if (inputTarget === InputTarget.Album) {
			const songs = [...(selectedAlbum?.songs ?? [])].sort(sortSongs);
			appendToPlaylist(songs);

			return;
		}

		if (selectedSong !== null) {
			appendToPlaylist([selectedSong]);
		}
	}, [
		inputTarget,
		allAlbums,
		selectedArtist,
		selectedAlbum,
		selectedSong,
		appendToPlaylist,
	]);

	const removeSelectedFromPlaylist = useCallback((): void => {
		if (selectedPlaylistSong === null) {
			return;
		}

		const removedPath = selectedPlaylistSong.filePath;
		setPlaylistSongs((prev: LibrarySong[]): LibrarySong[] =>
			prev.filter(
				(song: LibrarySong): boolean => song.filePath !== removedPath,
			),
		);
	}, [selectedPlaylistSong]);

	/** Empties the playlist and clears the playlist selection. */
	const clearPlaylist = useCallback((): void => {
		setPlaylistSongs([]);
		setSelectedPlaylistSong(null);
	}, []);

	useAppInput({
		appView,
		inputTarget: effectiveInputTarget,
		isSearching,
		listMaxRows,
		exit,
		setIsSearching,
		setAppView,
		setQueryFor,
		clearQueryFor,
		moveBy,
		playPlaylistRelative,
		jumpTo,
		focusPrevColumn,
		focusNextColumn,
		togglePlayback,
		stopPlayback: stop,
		adjustVolume,
		addFocusedToPlaylist,
		removeSelectedFromPlaylist,
		clearPlaylist,
	});

	useEffect((): void => {
		if (visibleArtists.length === 0) {
			setSelectedArtist("");

			return;
		}

		if (!visibleArtists.includes(selectedArtist)) {
			setSelectedArtist(visibleArtists[0] ?? "");
		}
	}, [visibleArtists, selectedArtist]);

	useEffect((): void => {
		if (visibleAlbums.length === 0) {
			setSelectedAlbum(null);

			return;
		}

		const stillPresent = visibleAlbums.some(
			({ name }): boolean => name === selectedAlbum?.name,
		);

		if (!stillPresent) {
			setSelectedAlbum(visibleAlbums[0] ?? null);
		}
	}, [visibleAlbums, selectedAlbum]);

	useEffect((): void => {
		if (visibleSongs.length === 0) {
			setSelectedSong(null);

			return;
		}

		const stillPresent = visibleSongs.some(
			(song: LibrarySong): boolean => song.filePath === selectedSong?.filePath,
		);

		if (!stillPresent) {
			setSelectedSong(visibleSongs[0] ?? null);
		}
	}, [visibleSongs, selectedSong]);

	useEffect((): void => {
		if (visiblePlaylistSongs.length === 0) {
			setSelectedPlaylistSong(null);

			return;
		}

		const stillPresent = visiblePlaylistSongs.some(
			(song: LibrarySong): boolean =>
				song.filePath === selectedPlaylistSong?.filePath,
		);

		if (!stillPresent) {
			setSelectedPlaylistSong(visiblePlaylistSongs[0] ?? null);
		}
	}, [visiblePlaylistSongs, selectedPlaylistSong]);

	return (
		<Box flexDirection="column">
			<StatusBar
				width={columns}
				volume={volume}
				totalSongs={library.length}
				totalArtists={allArtistNames.length}
				totalAlbums={allAlbums.length}
				selectedArtist={selectedArtist}
				selectedAlbum={selectedAlbum}
				selectedSong={selectedSong}
			/>
			<Box flexGrow={1}>
				{appView === AppView.Library && (
					<LibraryView
						inputTarget={inputTarget}
						maxRows={listMaxRows}
						visibleArtists={visibleArtists}
						selectedArtist={selectedArtist}
						totalArtistCount={allArtistNames.length}
						visibleAlbums={visibleAlbums}
						selectedAlbum={selectedAlbum}
						totalAlbumCount={albumsForSelectedArtist.length}
						visibleSongs={visibleSongs}
						selectedSong={selectedSong}
						totalSongCount={songsForSelectedAlbum.length}
					/>
				)}
				{appView === AppView.Playlist && (
					<PlaylistView
						maxRows={listMaxRows}
						visibleSongs={visiblePlaylistSongs}
						selectedSong={selectedPlaylistSong}
						totalCount={playlistSongs.length}
					/>
				)}
				{appView === AppView.NowPlaying && (
					<NowPlayingView
						width={columns}
						playingSong={playingSong}
						playerName={playerName}
						playStartedAt={playStartedAt}
						volume={volume}
					/>
				)}
				{appView === AppView.Soulseek && (
					<SoulseekView
						musicDir={config.musicDir}
						soulseekUsername={config.soulseekUsername}
						soulseekPassword={config.soulseekPassword}
						maxRows={listMaxRows}
						setAppView={setAppView}
						exit={exit}
					/>
				)}
				{appView === AppView.Config && (
					<ConfigView
						config={config}
						configPath={configPath}
						setAppView={setAppView}
						exit={exit}
						onConfigChange={setConfig}
					/>
				)}
				{appView === AppView.Visualizer && (
					<VisualizerView
						width={columns}
						height={rows}
						playingSong={playingSong}
						playerName={playerName}
					/>
				)}
			</Box>
			{appView !== AppView.NowPlaying && (
				<PlaybackBar
					width={columns}
					playingSong={playingSong}
					playerName={playerName}
					playStartedAt={playStartedAt}
				/>
			)}
			{appView !== AppView.Config && appView !== AppView.Soulseek && (
				<HelpBar
					isSearching={isSearching}
					searchQuery={activeQuery}
					appView={appView}
				/>
			)}
		</Box>
	);
}
