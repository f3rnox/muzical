import React, { useMemo } from "react";
import { Box, Text } from "ink";
import { TitledBox, titleStyles } from "@mishieck/ink-titled-box";

import { type LibrarySong } from "../types";
import { useSpectrum } from "../hooks/use_spectrum";
import { spectrumCellChar } from "../utils/spectrum_cell_char";
import {
	spectrumRowColor,
	type SpectrumRowColor,
} from "../utils/spectrum_row_color";

const BAR_COLUMN_WIDTH = 2;
const MIN_BARS = 8;
const MAX_BARS = 96;
const MIN_ROWS = 4;
const HORIZONTAL_OVERHEAD = 8;
const VERTICAL_OVERHEAD = 18;

export interface VisualizerViewProps {
	width: number;
	height: number;
	playingSong: LibrarySong | null;
	playerName: string | null;
}

/**
 * Full-pane spectrum visualizer with animated bass-weighted bars reacting to playback state.
 *
 * @param props - Terminal width/height, currently playing song, and active player name.
 */
export default function VisualizerView(props: Readonly<VisualizerViewProps>) {
	const { width, height, playingSong, playerName } = props;
	const isPlaying = playingSong !== null;

	const barCount: number = Math.min(
		MAX_BARS,
		Math.max(
			MIN_BARS,
			Math.floor(Math.max(0, width - HORIZONTAL_OVERHEAD) / BAR_COLUMN_WIDTH),
		),
	);
	const totalRows: number = Math.max(MIN_ROWS, height - VERTICAL_OVERHEAD);

	const heights: number[] = useSpectrum({ bars: barCount, isPlaying });

	const rowChars: string[] = useMemo((): string[] => {
		const heightEighths: number[] = heights.map((h: number): number =>
			Math.round(Math.max(0, Math.min(1, h)) * totalRows * 8),
		);

		return Array.from(
			{ length: totalRows },
			(_: unknown, r: number): string => {
				const rowFromBottom = totalRows - 1 - r;
				return heightEighths
					.map(
						(he: number): string => `${spectrumCellChar(rowFromBottom, he)} `,
					)
					.join("");
			},
		);
	}, [heights, totalRows]);

	const title: string =
		playingSong?.metadata.common.title ??
		(playerName === null ? "No player detected" : "Idle");
	const artist: string = playingSong?.metadata.common.artist ?? "";
	const stateLabel: string =
		playingSong === null
			? playerName === null
				? "⚠ no player detected"
				: `■ idle · ${playerName}`
			: `▶ playing · ${playerName ?? "unknown"}`;
	const stateColor: "green" | "gray" | "red" =
		playingSong === null ? (playerName === null ? "red" : "gray") : "green";

	return (
		<TitledBox
			titles={["Visualizer"]}
			titleStyles={titleStyles["hexagon"]}
			flexGrow={1}
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			paddingX={2}
			paddingY={1}
		>
			<Box flexDirection="column" marginBottom={1}>
				<Text bold color="green" wrap="truncate-end">
					{title}
				</Text>
				<Text wrap="truncate-end">
					{artist === "" ? (
						<Text> </Text>
					) : (
						<>
							<Text dimColor>by </Text>
							<Text color="magenta">{artist}</Text>
						</>
					)}
				</Text>
			</Box>
			<Box flexDirection="column">
				{rowChars.map((line: string, rowIndex: number): React.ReactElement => {
					const rowFromBottom: number = totalRows - 1 - rowIndex;
					const color: SpectrumRowColor = spectrumRowColor(
						rowFromBottom,
						totalRows,
					);
					return (
						<Text key={`row-${rowFromBottom}`} color={color}>
							{line}
						</Text>
					);
				})}
			</Box>
			<Box marginTop={1}>
				<Text color={stateColor}>{stateLabel}</Text>
			</Box>
		</TitledBox>
	);
}
