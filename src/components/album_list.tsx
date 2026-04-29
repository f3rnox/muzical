import React from "react";
import { Box, Text } from "ink";
import { TitledBox, titleStyles } from "@mishieck/ink-titled-box";

import { type LibraryAlbum, InputTarget } from "../types";
import { LIST_LABEL_MAX } from "./list_label_max";
import { truncate } from "../utils/truncate";
import { useScrollWindow } from "../hooks/use_scroll_window";

export interface AlbumListProps {
	albumsForSelectedArtist: LibraryAlbum[];
	selectedAlbum: LibraryAlbum | null;
	inputTarget: InputTarget;
	maxRows: number;
	totalCount: number;
}

export default function AlbumList(props: Readonly<AlbumListProps>) {
	const {
		albumsForSelectedArtist,
		selectedAlbum,
		inputTarget,
		maxRows,
		totalCount,
	} = props;
	const isFocused = inputTarget === InputTarget.Album;
	const selectedIndex = albumsForSelectedArtist.findIndex(
		({ name }): boolean => name === selectedAlbum?.name,
	);
	const { start, end } = useScrollWindow(
		albumsForSelectedArtist.length,
		selectedIndex,
		maxRows,
	);
	const visible = albumsForSelectedArtist.slice(start, end);
	const title =
		totalCount === albumsForSelectedArtist.length
			? `Albums ${albumsForSelectedArtist.length}`
			: `Albums ${albumsForSelectedArtist.length}/${totalCount}`;

	return (
		<TitledBox
			titles={[title]}
			titleStyles={titleStyles["hexagon"]}
			flexGrow={1}
			flexShrink={1}
			flexBasis={0}
			flexDirection="column"
			borderStyle="round"
			borderColor={isFocused ? "cyan" : "gray"}
		>
			{start > 0 && <Text dimColor> ↑ {start} more</Text>}
			{visible.map((album: LibraryAlbum): React.ReactElement => {
				const { name, songs } = album;
				const isSelected = name === selectedAlbum?.name;
				const textProps: Record<string, string> = {};

				if (isSelected) {
					textProps["backgroundColor"] = isFocused ? "cyan" : "gray";
					textProps["color"] = isFocused ? "black" : "white";
				}

				const year = songs[0]?.metadata.common.year;
				const label = year ? `${name} (${year})` : name;

				return (
					<Text
						key={`${name}-${year ?? ""}`}
						wrap="truncate-end"
						{...textProps}
					>
						{isSelected ? "▸ " : "  "}
						{truncate(label || "(unknown)", LIST_LABEL_MAX)}
					</Text>
				);
			})}
			{end < albumsForSelectedArtist.length && (
				<Text dimColor> ↓ {albumsForSelectedArtist.length - end} more</Text>
			)}
			{albumsForSelectedArtist.length === 0 && (
				<Box paddingX={1}>
					<Text dimColor>no matches</Text>
				</Box>
			)}
		</TitledBox>
	);
}
