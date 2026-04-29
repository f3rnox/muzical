import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Text, type Key, useInput } from "ink";
import { TitledBox, titleStyles } from "@mishieck/ink-titled-box";

import { type Config } from "../load_config";
import { AppView } from "../types";
import { writeConfig } from "../utils/write_config";

type FieldId =
	| "musicDir"
	| "songExtensions"
	| "soulseekUsername"
	| "soulseekPassword";

interface FieldMeta {
	id: FieldId;
	label: string;
	help: string;
	secret?: boolean;
}

const FIELDS: FieldMeta[] = [
	{
		id: "musicDir",
		label: "Music Directory",
		help: "absolute path to your music library root",
	},
	{
		id: "songExtensions",
		label: "Song Extensions",
		help: "comma-separated list (e.g. .mp3, .flac)",
	},
	{
		id: "soulseekUsername",
		label: "Soulseek Username",
		help: "account for the Soulseek browser view",
	},
	{
		id: "soulseekPassword",
		label: "Soulseek Password",
		help: "stored in plaintext in your config file",
		secret: true,
	},
];

export interface ConfigViewProps {
	config: Config;
	configPath: string;
	setAppView: (view: AppView) => void;
	exit: () => void;
	onConfigChange: (config: Config) => void;
}

/**
 * Parses the comma-separated extensions input into a normalized list.
 *
 * @param raw - Raw user input for the extensions field.
 * @returns Trimmed, dot-prefixed extensions with empty entries removed.
 */
function parseExtensions(raw: string): string[] {
	return raw
		.split(",")
		.map((entry: string): string => entry.trim())
		.filter((entry: string): boolean => entry.length > 0)
		.map((entry: string): string =>
			entry.startsWith(".") ? entry : `.${entry}`,
		);
}

/**
 * Reads the current value of a given config field as a display string.
 *
 * @param config - Current (in-memory) configuration.
 * @param id - Field identifier to read.
 * @returns Human-readable string representation.
 */
function readField(config: Readonly<Config>, id: FieldId): string {
	if (id === "musicDir") {
		return config.musicDir;
	}

	if (id === "songExtensions") {
		return config.songExtensions.join(", ");
	}

	if (id === "soulseekUsername") {
		return config.soulseekUsername;
	}

	return config.soulseekPassword;
}

/**
 * Produces a new {@link Config} with `id` set to the parsed form of `draft`.
 *
 * @param config - Baseline configuration to clone.
 * @param id - Field identifier to update.
 * @param draft - Raw string entered by the user.
 * @returns New config object with the updated field.
 */
function applyField(
	config: Readonly<Config>,
	id: FieldId,
	draft: string,
): Config {
	if (id === "musicDir") {
		return { ...config, musicDir: draft.trim() };
	}

	if (id === "songExtensions") {
		return { ...config, songExtensions: parseExtensions(draft) };
	}

	if (id === "soulseekUsername") {
		return { ...config, soulseekUsername: draft.trim() };
	}

	return { ...config, soulseekPassword: draft };
}

/**
 * Editable configuration pane: move between fields with `jk`, `enter`/`i` to edit, saves on commit.
 *
 * @param props - Current config, file location, and callbacks for view navigation and propagation.
 */
export default function ConfigView(props: Readonly<ConfigViewProps>) {
	const { config, configPath, setAppView, exit, onConfigChange } = props;
	const [focusIndex, setFocusIndex] = useState<number>(0);
	const [editingId, setEditingId] = useState<FieldId | null>(null);
	const [draft, setDraft] = useState<string>("");
	const [status, setStatus] = useState<string>("");
	const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const showStatus = useCallback((message: string): void => {
		setStatus(message);

		if (statusTimeoutRef.current !== null) {
			clearTimeout(statusTimeoutRef.current);
		}

		statusTimeoutRef.current = setTimeout((): void => {
			setStatus("");
			statusTimeoutRef.current = null;
		}, 2500);
	}, []);

	useEffect(
		(): (() => void) => (): void => {
			if (statusTimeoutRef.current !== null) {
				clearTimeout(statusTimeoutRef.current);
			}
		},
		[],
	);

	/** Commits the current draft into the config and persists to disk. */
	const commit = useCallback(async (): Promise<void> => {
		if (editingId === null) {
			return;
		}

		const next = applyField(config, editingId, draft);
		onConfigChange(next);
		setEditingId(null);

		try {
			await writeConfig(configPath, next);
			showStatus(`saved to ${configPath}`);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			showStatus(`save failed: ${message}`);
		}
	}, [editingId, draft, config, configPath, onConfigChange, showStatus]);

	/** Abandons the current draft without touching the config or disk. */
	const cancel = useCallback((): void => {
		setEditingId(null);
		setDraft("");
	}, []);

	/** Enters edit mode for the currently focused field. */
	const beginEdit = useCallback((): void => {
		const field = FIELDS[focusIndex];

		if (field === undefined) {
			return;
		}

		setDraft(readField(config, field.id));
		setEditingId(field.id);
	}, [focusIndex, config]);

	useInput((input: string, key: Key): void => {
		if (editingId !== null) {
			if (key.escape) {
				cancel();

				return;
			}

			if (key.return) {
				void commit();

				return;
			}

			if (key.backspace || key.delete) {
				setDraft((prev: string): string => prev.slice(0, -1));

				return;
			}

			if (input.length > 0 && !key.ctrl && !key.meta) {
				setDraft((prev: string): string => prev + input);
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

		if (input === "q" || key.escape) {
			exit();

			return;
		}

		if (key.upArrow || input === "k") {
			setFocusIndex((prev: number): number => Math.max(0, prev - 1));

			return;
		}

		if (key.downArrow || input === "j") {
			setFocusIndex((prev: number): number =>
				Math.min(FIELDS.length - 1, prev + 1),
			);

			return;
		}

		if (key.return || input === "i") {
			beginEdit();
		}
	});

	return (
		<TitledBox
			titles={["Config"]}
			titleStyles={titleStyles["hexagon"]}
			flexGrow={1}
			flexShrink={1}
			flexBasis={0}
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			paddingX={2}
			paddingY={1}
		>
			<Box marginBottom={1}>
				<Text dimColor>Editing: </Text>
				<Text>{configPath}</Text>
			</Box>
			{FIELDS.map((field: FieldMeta, index: number): React.ReactElement => {
				const isFocused = index === focusIndex;
				const isEditing = editingId === field.id;
				const rawValue = isEditing ? draft : readField(config, field.id);
				const value =
					field.secret === true && !isEditing && rawValue.length > 0
						? "•".repeat(Math.min(rawValue.length, 12))
						: rawValue;
				const labelColor = isFocused ? "cyan" : "gray";

				return (
					<Box key={field.id} flexDirection="column" marginBottom={1}>
						<Text>
							<Text color={labelColor}>{isFocused ? "▸ " : "  "}</Text>
							<Text color={labelColor} bold={isFocused}>
								{field.label}
							</Text>
							<Text dimColor> — {field.help}</Text>
						</Text>
						<Box paddingLeft={2}>
							<Text color={isEditing ? "green" : "white"}>
								{isEditing ? "› " : "  "}
								{value}
								{isEditing ? <Text color="cyan">█</Text> : null}
							</Text>
						</Box>
					</Box>
				);
			})}
			<Box marginTop={1} flexDirection="column">
				<Text dimColor wrap="truncate-end">
					{editingId !== null
						? "[enter] save · [esc] cancel · [backspace] delete"
						: "[↑↓/jk] nav · [enter/i] edit · [1/2/3/4/5] view · [q] quit"}
				</Text>
				{status.length > 0 ? <Text color="green">{status}</Text> : null}
				<Text dimColor>
					changes apply to the config file instantly; library re-scan requires
					restart
				</Text>
			</Box>
		</TitledBox>
	);
}
