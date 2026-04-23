import path from 'node:path'

/**
 * Builds a unique, collision-resistant destination path inside the music directory
 * for a Soulseek file. Normalizes the remote filename (which uses `\` separators),
 * strips the directory component, and prepends the uploader username plus a timestamp.
 *
 * @param musicDir - Absolute path to the music library root.
 * @param username - Remote Soulseek username offering the file.
 * @param remoteFilename - Raw filename reported by the remote peer (may contain `\`).
 * @returns Absolute destination path suitable for a `createWriteStream` target.
 */
export function buildDownloadPath(
	musicDir: string,
	username: string,
	remoteFilename: string
): string {
	const normalized = remoteFilename.replaceAll('\\', '/')
	const parsed = path.parse(normalized)
	const safeUsername = username.replaceAll(/[^\w.-]/g, '_')
	const safeBase = parsed.name.replaceAll(/[^\w.\- ]/g, '_').trim() || 'file'
	const extension = parsed.ext.length > 0 ? parsed.ext : ''
	const filename = `slsk-${safeUsername}-${safeBase}-${Date.now()}${extension}`

	return path.join(musicDir, filename)
}
