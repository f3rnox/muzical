import { type Config } from '../load_config'
import { type LibrarySong } from '../load_library'

export interface AppProps {
	config: Config
	library: LibrarySong[]
}
