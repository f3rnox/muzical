import PI from 'p-iteration'
import { type IAudioMetadata, parseFile } from 'music-metadata'

interface LibrarySong {
	filePath: string
	metadata: IAudioMetadata
}

const loadMetadata = async (files: string[]) => (
	PI.map(files, async (filePath: string): Promise<LibrarySong> => ({
		filePath,
		metadata: await parseFile(filePath)
	}))
)

export default loadMetadata
export { LibrarySong }
