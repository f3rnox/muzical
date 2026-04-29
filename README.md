# Muzical

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/node/v-lts/muzical?label=node&logo=node.js)](https://github.com/f3rnox/muzical/blob/main/package.json)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-CB3837?logo=pnpm)](https://pnpm.io/)

**Muzical** is a terminal music browser and launcher built with
[Ink](https://github.com/vadimdemedes/ink) and React. It indexes audio files
under a configurable folder, reads tags with
[music-metadata](https://github.com/Borewit/music-metadata), and hands playback
off to whichever common CLI media player it finds first on your `PATH`.

**Summary.** Five views — a three-column library browser, a playlist queue, a
"now playing" pane, a Soulseek search/download view, and a live config editor —
all driven by vim-style keybindings.

---

## Table of contents

- [Features](#features)
- [Requirements](#requirements)
- [Install](#install)
- [Configuration](#configuration)
- [Usage](#usage)
- [Views](#views)
- [Keyboard reference](#keyboard-reference)
- [CLI commands](#cli-commands)
- [Playback backends](#playback-backends)
- [How it works](#how-it-works)
- [Development](#development)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Links](#links)

---

## Features

- **Five dedicated views** — library browser, playlist queue, now playing,
  Soulseek client, and an in-app config editor, switchable with `1`–`5`.
- **Three-pane library UI** — browse artists, albums, and songs with vim-style
  (`hjkl`) and arrow-key navigation.
- **Per-column search** — filter the focused column with `/`; queries are
  independent per pane (artist, album, song, playlist).
- **Playlist queue** — build an ad-hoc queue with `space`; remove entries or
  clear the whole list from the playlist view.
- **Now playing pane** — full-pane track readout with a live progress bar,
  elapsed / total time, track number, and player state.
- **Soulseek search & download** — connect with stored credentials, search the
  network, and stream downloads directly into `musicDir`.
- **In-app config editor** — edit `musicDir`, extensions, and Soulseek
  credentials without leaving the TUI; changes persist to disk immediately.
- **Metadata-aware** — albums and tracks come from embedded tags (via
  `music-metadata`).
- **Sensible sorting** — artists and albums alphabetically; tracks ordered for
  listening.
- **Live volume control** — `+` / `-` adjusts master volume; mpv volume is
  updated over the IPC socket while a track is playing.
- **External playback** — no embedded decoder; uses `mpg123`, `mpv`, `ffplay`,
  or `vlc` if available.
- **Resize-aware** — list viewport adapts to terminal height.
- **Rich CLI surface** — subcommands to scan, list, and print resolved
  config/player without opening the TUI.

---

## Requirements

- **Node.js** `>= 16` (see `engines` in `package.json`).
- **pnpm** (recommended) or another package manager compatible with this repo.
- At least one **playback binary** on your `PATH` (see
  [Playback backends](#playback-backends)).
- A **config file** pointing at your music directory (see
  [Configuration](#configuration)).

---

## Install

### From the repository

```bash
git clone https://github.com/f3rnox/muzical.git
cd muzical
pnpm install
pnpm build
```

Run locally without installing globally:

```bash
pnpm start
# or, during development:
pnpm dev
```

Link the CLI globally (optional):

```bash
pnpm link --global
muzical
```

### Published package

When published to npm, install with:

```bash
pnpm add -g muzical
# or: npm install -g muzical
```

---

## Configuration

Muzical reads `config.json` from the OS config directory for the `muzical`
application name (via [env-paths](https://github.com/sindresorhus/env-paths)):

- **Linux:** `~/.config/muzical/config.json`
- **macOS:** `~/Library/Preferences/muzical/config.json`
- **Windows:** `%APPDATA%\muzical\config.json`

Pass `--config <path>` to use a file at an arbitrary location. If the default
config directory does not exist it is created on startup. **If `config.json` is
missing and `--music-dir` is not supplied, the program exits** with a message
showing the expected path.

### `config.json` shape

```json
{
  "musicDir": "/absolute/path/to/your/music",
  "songExtensions": [".mp3", ".flac"],
  "soulseekUsername": "",
  "soulseekPassword": ""
}
```

Fields:

- **`musicDir`** (required) — Root directory scanned recursively for audio
  files.
- **`songExtensions`** (optional) — Allowed suffixes; defaults to
  `[".mp3", ".flac"]`.
- **`soulseekUsername`** (optional) — Used by the Soulseek view to connect.
  Empty by default.
- **`soulseekPassword`** (optional) — Stored in plaintext alongside the
  username. Empty by default.

The Soulseek fields can also be edited live from the in-app **Config** view
(press `5`).

---

## Usage

```bash
muzical
```

On launch, Muzical clears the screen, loads the library (this can take a moment
on large collections), renders the TUI, and clears again on exit. Use
`--no-clear-screen` to keep terminal scrollback.

### Quick navigation

- Press **`1`** – **`5`** to switch between Library, Playlist, Now Playing,
  Soulseek, and Config views.
- Use **left/right** (or `h` / `l`) to move focus between **Artists**,
  **Albums**, and **Songs** (library view only).
- Use **up/down** (or `j` / `k`), **Page Up/Down**, or **g** / **G** to move
  through the focused list.
- Press **Enter** or **p** on a selected track to toggle playback. **Space**
  also toggles playback in the Now Playing view.
- Press **s** to stop playback; **+** / **-** adjust volume by 5%.
- Press **`/`** to search within the focused column; **Enter** accepts, **Esc**
  cancels and clears that column's query.
- In the library view, **space** appends the focused artist/album/song to the
  playlist. In the playlist view, **space** removes the focused entry.
- Press **c** to clear the focused column's filter (or clear the entire
  playlist in the playlist view).
- Press **q** or **Esc** to quit.

---

## Views

Muzical is organized as five top-level views. Switching views never
interrupts playback.

- **`1` Library** — three-column artist → album → song browser with per-pane
  search.
- **`2` Playlist** — ad-hoc play queue built with `space` from the library
  view.
- **`3` Now Playing** — full-pane readout with track metadata and a live
  progress bar.
- **`4` Soulseek** — connect, search, and download tracks into `musicDir`.
- **`5` Config** — live editor for `config.json` fields (music dir,
  extensions, Soulseek credentials).

The **Soulseek** and **Config** views own their own keyboard handling; global
bindings (other than `1`–`5` view switches and `q` to quit) are suspended while
either is active. The **Now Playing** view hides the bottom playback bar since
its own progress bar is already present.

---

## Keyboard reference

### Global (Library, Playlist, Now Playing)

| Mode   | Key(s)                 | Action                            |
| ------ | ---------------------- | --------------------------------- |
| Normal | `1`–`5`                | Switch view                       |
| Normal | `↑` `↓` / `j` `k`      | Move selection in focused list    |
| Normal | `PgUp` / `PgDn`        | Page by visible list height       |
| Normal | `g` / `G`              | Jump to first / last item         |
| Normal | `Enter` / `p`          | Toggle playback for selected song |
| Normal | `s`                    | Stop playback                     |
| Normal | `+` / `=` / `-`        | Raise / lower volume (5% steps)   |
| Normal | `/`                    | Start search in focused column    |
| Normal | `q` / `Esc`            | Quit                              |
| Search | type                   | Append to query                   |
| Search | `Backspace` / `Delete` | Delete last character             |
| Search | `↑` `↓`                | Move selection while searching    |
| Search | `Enter`                | Leave search mode (keep query)    |
| Search | `Esc`                  | Cancel search and clear the query |

### Library view

| Key               | Action                                    |
| ----------------- | ----------------------------------------- |
| `←` `→` / `h` `l` | Focus previous / next column              |
| `space`           | Append focused artist/album/song to queue |
| `c`               | Clear the focused column's search query   |

### Playlist view

| Key     | Action                                   |
| ------- | ---------------------------------------- |
| `space` | Remove the selected entry from the queue |
| `c`     | Clear the entire playlist                |

### Now Playing view

| Key                     | Action          |
| ----------------------- | --------------- |
| `Enter` / `p` / `space` | Toggle playback |
| `s`                     | Stop playback   |
| `+` / `-`               | Adjust volume   |

### Soulseek view (view-local bindings)

| Mode  | Key(s)                  | Action                       |
| ----- | ----------------------- | ---------------------------- |
| Input | type                    | Append to query              |
| Input | `Backspace`             | Delete last character        |
| Input | `Enter`                 | Run search                   |
| Input | `Esc`                   | Return to results list       |
| List  | `/` / `i`               | Open search input            |
| List  | `c`                     | Connect (or reconnect)       |
| List  | `↑` `↓` / `j` `k`       | Move selection               |
| List  | `PgUp` / `PgDn`         | Page through results         |
| List  | `g` / `G`               | Jump to first / last result  |
| List  | `Enter` / `d` / `space` | Download the selected result |
| List  | `x`                     | Clear results                |
| List  | `1`–`5`                 | Switch view                  |
| List  | `q`                     | Quit                         |

### Config view (view-local bindings)

| Mode | Key(s)                 | Action                             |
| ---- | ---------------------- | ---------------------------------- |
| Nav  | `↑` `↓` / `j` `k`      | Move between fields                |
| Nav  | `Enter` / `i`          | Begin editing the focused field    |
| Nav  | `1`–`5`                | Switch view                        |
| Nav  | `q` / `Esc`            | Quit                               |
| Edit | type                   | Append to draft                    |
| Edit | `Backspace` / `Delete` | Delete last character              |
| Edit | `Enter`                | Save the draft and persist to disk |
| Edit | `Esc`                  | Cancel edit, keep existing value   |

---

## CLI commands

The binary accepts global options that apply to every mode and a handful of
subcommands for non-interactive use. Run `muzical --help` (or `muzical
<subcommand> --help`) for the authoritative list.

### Global options

| Flag                     | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `-d, --music-dir <path>` | Override `musicDir` from config               |
| `-e, --extension <ext>`  | Add / override a song extension (repeatable)  |
| `-p, --player <name>`    | Force a backend (mpg123 / mpv / ffplay / vlc) |
| `-c, --config <path>`    | Use a custom `config.json` location           |
| `--no-clear-screen`      | Do not clear terminal on start/exit           |
| `-v, --version`          | Print version and exit                        |

### Subcommands

- **`muzical`** — launch the TUI (default).
- **`muzical config`** — print the resolved configuration as JSON and exit.
- **`muzical player [--player <name>] [--all]`** — print the detected playback
  backend (or check a specific one / list all candidates).
- **`muzical scan [--json]`** — scan the music library and print a summary
  without launching the UI.
- **`muzical list <artists|albums|songs> [--artist ...] [--album ...] [--json]`**
  — list library contents with optional filters.

### Examples

```bash
muzical
muzical --music-dir ~/Music --player mpv
muzical scan --json
muzical list artists
muzical list songs --artist 'Radiohead' --album 'OK Computer'
muzical player --all
```

---

## Playback backends

The first available binary from this list wins (in order):

1. `mpg123`
2. `mpv`
3. `ffplay`
4. `vlc`

Install any one of them and ensure it is on your `PATH`, or use
`--player <name>` to force a specific backend. Arguments are chosen for quiet,
non-interactive playback suitable for a TUI (e.g. `mpv` with `--no-video`).

Per-backend volume handling:

- **`mpv`** — initial `--volume=<n>`; while playing, volume changes are sent
  over `--input-ipc-server` for instant updates without a restart.
- **`mpg123`** — `-f <scale>` where `scale` is `volume / 100 * 256`.
- **`ffplay`** — `-af volume=<ratio>`.
- **`vlc`** — backend-level volume flags are not used; `+` / `-` still track
  master volume state for display.

---

## How it works

1. **Config** — `load_config` resolves `config.json` (or `--config <path>`),
   merges in CLI overrides, and validates `musicDir` / `songExtensions` plus
   optional Soulseek credentials.
2. **Discovery** — `load_music_dir` walks `musicDir` for matching extensions.
3. **Library** — `load_library` parses each file's metadata into in-memory
   `LibrarySong` entries.
4. **UI shell** — `App` (`src/app.tsx`) composes `StatusBar`, one of the five
   view components, `PlaybackBar`, and `HelpBar`; keyboard input for the
   Library / Playlist / Now Playing views is centralized in `use_app_input`.
5. **Views** (`src/views/`)
   - `library_view.tsx` — three-column artist/album/song browser.
   - `playlist_view.tsx` — single-column play queue.
   - `now_playing_view.tsx` — full-pane readout with progress bar.
   - `soulseek_view.tsx` — search/download UI backed by `useSoulseek`.
   - `config_view.tsx` — live `config.json` editor, writes via `writeConfig`.
6. **Player** — `resolvePlayer` / `detectPlayer` picks a backend from
   `PLAYER_CANDIDATES`; `usePlayer` spawns it for the selected file path and
   forwards volume changes (including mpv IPC updates).

---

## Development

```bash
pnpm install
pnpm dev          # run from TypeScript source
pnpm build        # TypeScript + bundled CLI + TypeDoc
pnpm test         # Mocha
pnpm test:vitest  # Vitest
pnpm lint         # markdownlint (README) + ESLint
pnpm lint:eslint  # ESLint only (src + package.json)
pnpm format       # Prettier
```

Release and docs scripts are defined in `package.json` (`prepare-release`,
`serve:docs`, etc.) for maintainers.

---

## Documentation

TypeDoc output is produced under `docs/` when you run `pnpm build` (or
`pnpm build:docs`). Serve locally:

```bash
pnpm serve:docs
```

---

## Contributing

Issues and pull requests are welcome at
<https://github.com/f3rnox/muzical/issues>.

- Match existing **TypeScript** style (no semicolons, single quotes, explicit
  types, one function per file).
- Run **`pnpm lint`** and **`pnpm test`** before opening a PR when you touch
  code or this README.

---

## License

This project is licensed under the **MIT License** — see [LICENSE.md](LICENSE.md).

---

## Links

- **Repository:** <https://github.com/f3rnox/muzical>
- **Issues:** <https://github.com/f3rnox/muzical/issues>
- **Homepage:** <https://github.com/f3rnox/muzical> (see `package.json` `homepage`)
