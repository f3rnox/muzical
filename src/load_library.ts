import PI from 'p-iteration'
import { parseFile } from 'music-metadata'
import { type LibrarySong } from './types'

/**
 * Reads audio metadata for each file path and returns parallel {@link LibrarySong} entries.
 *
 * @param files - Absolute paths to audio files on disk.
 * @returns Songs paired with parsed audio metadata from `music-metadata`.
 */
const loadMetadata = async (files: string[]) => (
	PI.map(files, async (filePath: string): Promise<LibrarySong> => ({
		filePath,
		metadata: await parseFile(filePath)
	}))
)

export default loadMetadata
