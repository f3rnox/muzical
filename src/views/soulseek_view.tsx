import React, { useCallback, useMemo, useState } from "react";
import { Box, Text, type Key, useInput } from "ink";
import { TitledBox, titleStyles } from "@mishieck/ink-titled-box";

import { AppView } from "../types";
import {
	useSoulseek,
	type SoulseekDownload,
	type SoulseekSearchResult,
} from "../hooks/use_soulseek";
import { useScrollWindow } from "../hooks/use_scroll_window";
import { formatBytes } from "../utils/format_bytes";
import { formatDuration } from "../utils/format_duration";
import { truncate } from "../utils/truncate";

type SoulseekMode = "list" | "input";

export interface SoulseekViewProps {
	musicDir: string;
	soulseekUsername: string;
	soulseekPassword: string;
	maxRows: number;
	setAppView: (view: AppView) => void;
	exit: () => void;
}

const RESULT_LABEL_MAX = 60;
const DOWNLOAD_LABEL_MAX = 40;
const DOWNLOADS_VISIBLE = 5;

/**
 * Renders a single result row with username, filename, bitrate/duration, size and slot status.
 *
 * @param result - Soulseek search result to render.
 * @param isSelected - Whether this row should be highlighted as focused.
 */
function ResultRow(
	props: Readonly<{
		result: SoulseekSearchResult;
		isSelected: boolean;
	}>,
): React.ReactElement {
	const { result, isSelected } = props;
	const textProps: Record<string, string> = {};

	if (isSelected) {
		textProps["backgroundColor"] = "cyan";
		textProps["color"] = "black";
	}

	const prefix = isSelected ? "▸ " : "  ";
	const slotLabel = result.slotsFree ? "●" : "○";
	const bitrateLabel =
		result.bitrate !== null ? `${result.bitrate}kbps` : "----";
	const durationLabel =
		result.durationSec !== null ? formatDuration(result.durationSec) : "--:--";
	const sizeLabel = formatBytes(result.size);
	const userLabel = truncate(result.username, 14).padEnd(14, " ");
	const basename =
		result.filename.replaceAll("\\", "/").split("/").pop() ?? result.filename;
	const label = truncate(basename, RESULT_LABEL_MAX);

	return (
		<Text wrap="truncate-end" {...textProps}>
			{`${prefix}${slotLabel} ${userLabel}  ${label}  ${bitrateLabel}  ${durationLabel}  ${sizeLabel}`}
		</Text>
	);
}

/**
 * Renders a single download entry with progress percentage and status color.
 *
 * @param download - Download state snapshot from {@link useSoulseek}.
 */
function DownloadRow(
	props: Readonly<{
		download: SoulseekDownload;
	}>,
): React.ReactElement {
	const { download } = props;
	const percent = Math.round(Math.max(0, Math.min(1, download.progress)) * 100);
	const color =
		download.status === "complete"
			? "green"
			: download.status === "failed"
				? "red"
				: download.status === "downloading"
					? "cyan"
					: "yellow";
	const label = truncate(download.displayName, DOWNLOAD_LABEL_MAX);
	const detail =
		download.error !== null
			? download.error
			: `${formatBytes(download.receivedBytes)} / ${formatBytes(download.totalBytes)}`;

	return (
		<Text wrap="truncate-end">
			<Text color={color}>{`[${download.status}]`.padEnd(14, " ")}</Text>
			<Text>{` ${String(percent).padStart(3, " ")}% `}</Text>
			<Text>{label}</Text>
			<Text dimColor>{`  ${detail}`}</Text>
		</Text>
	);
}

/**
 * Soulseek browser: interactive search against the Soulseek network with on-disk downloads
 * streamed into the configured `musicDir`. Owns its own keyboard handling so the global
 * `useAppInput` hook is skipped while this view is active.
 *
 * @param props - Credentials, music directory, scroll budget, and navigation callbacks.
 */
export default function SoulseekView(props: Readonly<SoulseekViewProps>) {
	const {
		musicDir,
		soulseekUsername,
		soulseekPassword,
		maxRows,
		setAppView,
		exit,
	} = props;
	const {
		status,
		statusMessage,
		results,
		downloads,
		isSearching,
		lastQuery,
		connect,
		search,
		download,
		clearResults,
	} = useSoulseek({
		musicDir,
		username: soulseekUsername,
		password: soulseekPassword,
	});

	const [mode, setMode] = useState<SoulseekMode>("input");
	const [query, setQuery] = useState<string>("");
	const [selectedIndex, setSelectedIndex] = useState<number>(0);

	const resultRows = Math.max(3, maxRows - DOWNLOADS_VISIBLE - 4);
	const clampedSelection = useMemo((): number => {
		if (results.length === 0) {
			return 0;
		}

		return Math.max(0, Math.min(selectedIndex, results.length - 1));
	}, [results.length, selectedIndex]);

	const { start, end } = useScrollWindow(
		results.length,
		clampedSelection,
		resultRows,
	);
	const visible = useMemo(
		(): SoulseekSearchResult[] => results.slice(start, end),
		[results, start, end],
	);

	const triggerSearch = useCallback((): void => {
		const trimmed = query.trim();

		if (trimmed.length === 0) {
			return;
		}

		void search(trimmed);
		setMode("list");
		setSelectedIndex(0);
	}, [query, search]);

	const triggerDownload = useCallback((): void => {
		const selected = results[clampedSelection];

		if (selected !== undefined) {
			void download(selected);
		}
	}, [results, clampedSelection, download]);

	useInput((input: string, key: Key): void => {
		if (mode === "input") {
			if (key.escape) {
				setMode("list");

				return;
			}

			if (key.return) {
				triggerSearch();

				return;
			}

			if (key.backspace || key.delete) {
				setQuery((prev: string): string => prev.slice(0, -1));

				return;
			}

			if (input.length > 0 && !key.ctrl && !key.meta) {
				setQuery((prev: string): string => prev + input);
			}

			return;
		}

		if (input === "1") {
			setAppView(AppView.Library);

			return;
		}

		if (input === "2") {
			setAppView(AppView.Playlist);

			return;
		}

		if (input === "3") {
			setAppView(AppView.NowPlaying);

			return;
		}

		if (input === "4") {
			setAppView(AppView.Soulseek);

			return;
		}

		if (input === "5") {
			setAppView(AppView.Config);

			return;
		}

		if (input === "q") {
			exit();

			return;
		}

		if (input === "/" || input === "i") {
			setMode("input");

			return;
		}

		if (input === "c") {
			void connect();

			return;
		}

		if (input === "x") {
			clearResults();
			setSelectedIndex(0);

			return;
		}

		if (key.upArrow || input === "k") {
			setSelectedIndex((prev: number): number => Math.max(0, prev - 1));

			return;
		}

		if (key.downArrow || input === "j") {
			setSelectedIndex((prev: number): number =>
				Math.min(Math.max(0, results.length - 1), prev + 1),
			);

			return;
		}

		if (key.pageUp) {
			setSelectedIndex((prev: number): number =>
				Math.max(0, prev - resultRows),
			);

			return;
		}

		if (key.pageDown) {
			setSelectedIndex((prev: number): number =>
				Math.min(Math.max(0, results.length - 1), prev + resultRows),
			);

			return;
		}

		if (input === "g") {
			setSelectedIndex(0);

			return;
		}

		if (input === "G") {
			setSelectedIndex(Math.max(0, results.length - 1));

			return;
		}

		if (key.return || input === "d" || input === " ") {
			triggerDownload();
		}
	});

	const statusColor =
		status === "connected"
			? "green"
			: status === "error"
				? "red"
				: status === "connecting"
					? "yellow"
					: "gray";

	const resultsTitle =
		results.length > 0
			? `Results ${results.length}${isSearching ? " (searching…)" : ""}`
			: isSearching
				? "Results (searching…)"
				: "Results";

	const visibleDownloads = downloads.slice(0, DOWNLOADS_VISIBLE);

	return (
		<TitledBox
			titles={["Soulseek"]}
			titleStyles={titleStyles["hexagon"]}
			flexGrow={1}
			flexShrink={1}
			flexBasis={0}
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			paddingX={1}
		>
			<Box flexDirection="column" marginBottom={1}>
				<Box>
					<Text dimColor>status: </Text>
					<Text color={statusColor}>{status}</Text>
					<Text dimColor> · </Text>
					<Text wrap="truncate-end">{statusMessage}</Text>
				</Box>
				<Box>
					<Text color={mode === "input" ? "cyan" : "gray"}>
						{mode === "input" ? "› " : "  "}
					</Text>
					<Text dimColor>query: </Text>
					<Text>{query}</Text>
					{mode === "input" ? <Text color="cyan">█</Text> : null}
					{lastQuery.length > 0 && mode !== "input" ? (
						<Text dimColor>{`   (last: "${lastQuery}")`}</Text>
					) : null}
				</Box>
			</Box>

			<TitledBox
				titles={[resultsTitle]}
				titleStyles={titleStyles["hexagon"]}
				flexGrow={1}
				flexShrink={1}
				flexBasis={0}
				flexDirection="column"
				borderStyle="round"
				borderColor={mode === "list" ? "cyan" : "gray"}
			>
				{start > 0 ? <Text dimColor> ↑ {start} more</Text> : null}
				{visible.map(
					(result: SoulseekSearchResult, index: number): React.ReactElement => {
						const absoluteIndex = start + index;
						return (
							<ResultRow
								key={result.id}
								result={result}
								isSelected={
									absoluteIndex === clampedSelection && mode === "list"
								}
							/>
						);
					},
				)}
				{end < results.length ? (
					<Text dimColor> ↓ {results.length - end} more</Text>
				) : null}
				{results.length === 0 ? (
					<Box paddingX={1}>
						<Text dimColor>
							{isSearching
								? "searching…"
								: status !== "connected"
									? "press [c] to connect, then [/] to search"
									: "no results — press [/] to search"}
						</Text>
					</Box>
				) : null}
			</TitledBox>

			<TitledBox
				titles={[`Downloads ${downloads.length}`]}
				titleStyles={titleStyles["hexagon"]}
				flexShrink={0}
				flexDirection="column"
				borderStyle="round"
				borderColor="gray"
			>
				{visibleDownloads.length === 0 ? (
					<Box paddingX={1}>
						<Text dimColor>no downloads yet</Text>
					</Box>
				) : (
					visibleDownloads.map(
						(entry: SoulseekDownload): React.ReactElement => (
							<DownloadRow key={entry.id} download={entry} />
						),
					)
				)}
				{downloads.length > DOWNLOADS_VISIBLE ? (
					<Text dimColor> ↓ {downloads.length - DOWNLOADS_VISIBLE} more</Text>
				) : null}
			</TitledBox>

			<Box marginTop={1}>
				<Text dimColor wrap="truncate-end">
					{mode === "input"
						? "[enter] search · [esc] results · [backspace] delete"
						: "[/i] search · [c] connect · [enter/d/space] download · [↑↓/jk] nav · [x] clear · [1-5] view · [q] quit"}
				</Text>
			</Box>
		</TitledBox>
	);
}
