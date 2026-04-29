import { useCallback, useEffect, useRef, useState } from "react";
import fs from "node:fs";
import { SlskClient, type Download, type RequestedDownload } from "soulseek-ts";

import { buildDownloadPath } from "../utils/build_download_path";

type FileAttributeKey = number;

export interface SoulseekSearchResult {
	id: string;
	username: string;
	filename: string;
	size: bigint;
	bitrate: number | null;
	durationSec: number | null;
	slotsFree: boolean;
	avgSpeed: number;
	queueLength: number;
}

export type SoulseekConnectionStatus =
	| "disconnected"
	| "connecting"
	| "connected"
	| "error";

export type SoulseekDownloadStatus = Download["status"] | "saving" | "failed";

export interface SoulseekDownload {
	id: string;
	username: string;
	filename: string;
	displayName: string;
	destinationPath: string;
	status: SoulseekDownloadStatus;
	totalBytes: bigint;
	receivedBytes: bigint;
	progress: number;
	error: string | null;
	startedAt: number;
}

export interface UseSoulseekOptions {
	musicDir: string;
	username: string;
	password: string;
}

export interface UseSoulseekApi {
	status: SoulseekConnectionStatus;
	statusMessage: string;
	results: SoulseekSearchResult[];
	downloads: SoulseekDownload[];
	isSearching: boolean;
	lastQuery: string;
	connect: () => Promise<void>;
	disconnect: () => void;
	search: (query: string) => Promise<void>;
	download: (result: SoulseekSearchResult) => Promise<void>;
	clearResults: () => void;
}

/** Pulls the bitrate from a soulseek-ts file-attribute map, if present. */
function pickBitrate(attrs: Map<FileAttributeKey, number>): number | null {
	const bitrate = attrs.get(0);
	return typeof bitrate === "number" ? bitrate : null;
}

/** Pulls the duration (in seconds) from a soulseek-ts file-attribute map, if present. */
function pickDuration(attrs: Map<FileAttributeKey, number>): number | null {
	const duration = attrs.get(1);
	return typeof duration === "number" ? duration : null;
}

/** Pulls the last path segment out of a remote soulseek filename (which uses `\`). */
function extractBasename(remoteFilename: string): string {
	const normalized = remoteFilename.replaceAll("\\", "/");
	const idx = normalized.lastIndexOf("/");
	return idx === -1 ? normalized : normalized.slice(idx + 1);
}

/**
 * Connects to Soulseek on demand, exposes streaming search results and tracks
 * active downloads as they're piped into `musicDir`. All state is local to the
 * view that mounts the hook; destroy happens on unmount.
 *
 * @param options - Music directory destination plus credentials for the Soulseek server.
 * @returns Connection status, search/download data, and imperative actions.
 */
export function useSoulseek(
	options: Readonly<UseSoulseekOptions>,
): UseSoulseekApi {
	const { musicDir, username, password } = options;
	const clientRef = useRef<SlskClient | null>(null);
	const [status, setStatus] =
		useState<SoulseekConnectionStatus>("disconnected");
	const [statusMessage, setStatusMessage] = useState<string>("not connected");
	const [results, setResults] = useState<SoulseekSearchResult[]>([]);
	const [downloads, setDownloads] = useState<SoulseekDownload[]>([]);
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const [lastQuery, setLastQuery] = useState<string>("");

	/** Patches a single download entry (by id) while preserving order. */
	const patchDownload = useCallback(
		(id: string, patch: Partial<SoulseekDownload>): void => {
			setDownloads((prev: SoulseekDownload[]): SoulseekDownload[] =>
				prev.map(
					(entry: SoulseekDownload): SoulseekDownload =>
						entry.id === id ? { ...entry, ...patch } : entry,
				),
			);
		},
		[],
	);

	const connect = useCallback(async (): Promise<void> => {
		if (clientRef.current !== null) {
			return;
		}

		if (username.length === 0 || password.length === 0) {
			setStatus("error");
			setStatusMessage("missing credentials — set them in Config (view 5)");

			return;
		}

		setStatus("connecting");
		setStatusMessage("connecting to Soulseek…");

		const client = new SlskClient();
		clientRef.current = client;

		client.on("server-error", (error: Error): void => {
			setStatus("error");
			setStatusMessage(`server error: ${error.message}`);
		});
		client.on("listen-error", (error: Error): void => {
			setStatusMessage(`listen error: ${error.message}`);
		});
		client.on("peer-error", (): void => {
			// peer-level errors are expected and noisy; ignore for the UI
		});
		client.on("client-error", (error: unknown): void => {
			const message = error instanceof Error ? error.message : String(error);
			setStatus("error");
			setStatusMessage(`client error: ${message}`);
		});

		try {
			await client.login(username, password);
			setStatus("connected");
			setStatusMessage(`logged in as ${username}`);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			setStatus("error");
			setStatusMessage(`login failed: ${message}`);
			client.destroy();
			clientRef.current = null;
		}
	}, [username, password]);

	const disconnect = useCallback((): void => {
		const client = clientRef.current;

		if (client !== null) {
			client.destroy();
			clientRef.current = null;
		}

		setStatus("disconnected");
		setStatusMessage("not connected");
	}, []);

	const clearResults = useCallback((): void => {
		setResults([]);
		setLastQuery("");
	}, []);

	const search = useCallback(
		async (query: string): Promise<void> => {
			const client = clientRef.current;
			const trimmed = query.trim();

			if (client === null || status !== "connected") {
				setStatusMessage("connect before searching — press [c] to connect");

				return;
			}

			if (trimmed.length === 0) {
				return;
			}

			setIsSearching(true);
			setLastQuery(trimmed);
			setResults([]);
			setStatusMessage(`searching for "${trimmed}"…`);

			try {
				await client.search(trimmed, {
					onResult: (response): void => {
						const additions: SoulseekSearchResult[] = response.files.map(
							(file, fileIndex: number): SoulseekSearchResult => ({
								id: `${response.username}::${response.token}::${fileIndex}::${file.filename}`,
								username: response.username,
								filename: file.filename,
								size: file.size,
								bitrate: pickBitrate(file.attrs),
								durationSec: pickDuration(file.attrs),
								slotsFree: response.slotsFree,
								avgSpeed: response.avgSpeed,
								queueLength: response.queueLength,
							}),
						);

						if (additions.length === 0) {
							return;
						}

						setResults(
							(prev: SoulseekSearchResult[]): SoulseekSearchResult[] => [
								...prev,
								...additions,
							],
						);
					},
				});
				setStatusMessage(`search done — "${trimmed}"`);
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);
				setStatusMessage(`search failed: ${message}`);
			} finally {
				setIsSearching(false);
			}
		},
		[status],
	);

	const download = useCallback(
		async (result: SoulseekSearchResult): Promise<void> => {
			const client = clientRef.current;

			if (client === null || status !== "connected") {
				setStatusMessage("connect before downloading — press [c] to connect");

				return;
			}

			const destinationPath = buildDownloadPath(
				musicDir,
				result.username,
				result.filename,
			);
			const displayName = extractBasename(result.filename);
			const downloadId = `dl-${result.username}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

			setDownloads((prev: SoulseekDownload[]): SoulseekDownload[] => [
				{
					id: downloadId,
					username: result.username,
					filename: result.filename,
					displayName,
					destinationPath,
					status: "requested",
					totalBytes: result.size,
					receivedBytes: 0n,
					progress: 0,
					error: null,
					startedAt: Date.now(),
				},
				...prev,
			]);

			let requested: RequestedDownload;

			try {
				requested = await client.download(result.username, result.filename);
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);
				patchDownload(downloadId, { status: "failed", error: message });

				return;
			}

			requested.events.on("status", (nextStatus: Download["status"]): void => {
				patchDownload(downloadId, { status: nextStatus });
			});

			requested.events.on(
				"progress",
				(metadata: {
					totalBytes: bigint;
					receivedBytes: bigint;
					progress: number;
				}): void => {
					patchDownload(downloadId, {
						totalBytes: metadata.totalBytes,
						receivedBytes: metadata.receivedBytes,
						progress: metadata.progress,
					});
				},
			);

			try {
				await fs.promises.mkdir(musicDir, { recursive: true });
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);
				patchDownload(downloadId, { status: "failed", error: message });

				return;
			}

			const writeStream = fs.createWriteStream(destinationPath);
			requested.stream.pipe(writeStream);

			requested.stream.on("end", (): void => {
				patchDownload(downloadId, { status: "saving" });
			});
			writeStream.on("finish", (): void => {
				patchDownload(downloadId, { status: "complete", progress: 1 });
			});
			writeStream.on("error", (error: Error): void => {
				patchDownload(downloadId, { status: "failed", error: error.message });
			});
			requested.stream.on("error", (error: Error): void => {
				patchDownload(downloadId, { status: "failed", error: error.message });
			});
		},
		[musicDir, status, patchDownload],
	);

	useEffect(
		(): (() => void) => (): void => {
			const client = clientRef.current;

			if (client !== null) {
				client.destroy();
				clientRef.current = null;
			}
		},
		[],
	);

	return {
		status,
		statusMessage,
		results,
		downloads,
		isSearching,
		lastQuery,
		connect,
		disconnect,
		search,
		download,
		clearResults,
	};
}
