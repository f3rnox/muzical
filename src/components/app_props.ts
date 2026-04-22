import { type Config } from '../load_config'
import { type LibrarySong } from '../types'

export interface AppProps {
	config: Config
	library: LibrarySong[]
}
