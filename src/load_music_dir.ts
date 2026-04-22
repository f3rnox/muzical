import { promises as fs } from 'node:fs'
import path from 'node:path'

const readMusicDir = async (
	dirPath: string,
	songExtensions: string[]
): Promise<string[]> => {
	const dir = await fs.readdir(dirPath, { withFileTypes: true })
	let files: string[] = []

	for (const node of dir) {
		const nodePath = path.join(dirPath, node.name)

		if (node.isDirectory()) {
			const directoryFiles = await readMusicDir(nodePath, songExtensions)

			files = [...files, ...directoryFiles]
		} else if (node.isFile()) {
			files = [...files, nodePath]
		} else {
			throw new Error(`Got invalid Dirent type: ${nodePath}`)
		}
	}

	return files.filter((filePath: string): boolean => (
		songExtensions.includes(path.extname(filePath))
	))
}

export default readMusicDir
