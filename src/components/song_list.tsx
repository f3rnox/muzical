import React from "react";
import { Box, Text } from "ink";
import { TitledBox, titleStyles } from "@mishieck/ink-titled-box";

import { type LibrarySong } from "../types";
import { InputTarget } from "../types";
import { LIST_LABEL_MAX } from "./list_label_max";
import { truncate } from "../utils/truncate";
import { useScrollWindow } from "../hooks/use_scroll_window";
import { formatDuration } from "../utils/format_duration";

export interface SongListProps {
	songs: LibrarySong[];
	selectedSong: LibrarySong | null;
	inputTarget: InputTarget;
	maxRows: number;
	totalCount: number;
}

export default function SongList(props: Readonly<SongListProps>) {
	const { songs, selectedSong, inputTarget, maxRows, totalCount } = props;
	const isFocused = inputTarget === InputTarget.Song;
	const selectedIndex = songs.findIndex(
		(song: LibrarySong): boolean => song.filePath === selectedSong?.filePath,
	);
	const { start, end } = useScrollWindow(songs.length, selectedIndex, maxRows);
	const visible = songs.slice(start, end);
	const title =
		totalCount === songs.length
			? `Songs ${songs.length}`
			: `Songs ${songs.length}/${totalCount}`;

	return (
		<TitledBox
			titles={[title]}
			titleStyles={titleStyles["hexagon"]}
			flexGrow={2}
			flexShrink={1}
			flexBasis={0}
			flexDirection="column"
			borderStyle="round"
			borderColor={isFocused ? "cyan" : "gray"}
		>
			{start > 0 && <Text dimColor> ↑ {start} more</Text>}
			{visible.map((song: LibrarySong): React.ReactElement => {
				const { metadata, filePath } = song;
				const { common, format } = metadata;
				const { title: songTitle, track } = common;
				const isSelected = filePath === selectedSong?.filePath;
				const textProps: Record<string, string> = {};

				if (isSelected) {
					textProps["backgroundColor"] = isFocused ? "cyan" : "gray";
					textProps["color"] = isFocused ? "black" : "white";
				}

				const trackNo =
					track?.no !== undefined && track?.no !== null
						? String(track.no).padStart(2, "0")
						: "--";
				const duration = formatDuration(format.duration);
				const label = truncate(songTitle ?? "(untitled)", LIST_LABEL_MAX);
				const prefix = isSelected ? "▸ " : "  ";

				return (
					<Text key={filePath} wrap="truncate-end" {...textProps}>
						{`${prefix}${trackNo}  ${label}  ${duration}`}
					</Text>
				);
			})}
			{end < songs.length && <Text dimColor> ↓ {songs.length - end} more</Text>}
			{songs.length === 0 && (
				<Box paddingX={1}>
					<Text dimColor>no matches</Text>
				</Box>
			)}
		</TitledBox>
	);
}
