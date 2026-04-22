import { promises as fs } from 'fs'
import path from 'path'

const SONG_EXTENSIONS = ['.mp3', '.flac']

const readMusicDir = async (dirPath: string): Promise<string[]> => {
	const dir = await fs.readdir(dirPath, { withFileTypes: true })
	let files: string[] = []

	for (const node of dir) {
		const nodePath = path.join(dirPath, node.name)

		if (node.isDirectory()) {
			const directoryFiles = await readMusicDir(nodePath)

			files = [...files, ...directoryFiles]
		} else if (node.isFile()) {
			files = [...files, nodePath]
		} else {
			throw new Error(`Got invalid Dirent type: ${nodePath}`)
		}
	}

	return files.filter((filePath: string): boolean => (
		SONG_EXTENSIONS.includes(path.extname(filePath))
	))
}

export default readMusicDir
