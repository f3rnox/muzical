import PI from 'p-iteration'
import { parseFile } from 'music-metadata'
import { type LibrarySong } from './types'

const loadMetadata = async (files: string[]) => (
	PI.map(files, async (filePath: string): Promise<LibrarySong> => ({
		filePath,
		metadata: await parseFile(filePath)
	}))
)

export default loadMetadata
