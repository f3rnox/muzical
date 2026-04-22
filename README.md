# Muzical

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/node/v-lts/muzical?label=node&logo=node.js)](https://github.com/f3rnox/muzical/blob/main/package.json)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-CB3837?logo=pnpm)](https://pnpm.io/)

**Muzical** is a terminal music browser and launcher: a three-column TUI
(artist → album → track) built with [Ink](https://github.com/vadimdemedes/ink)
and React. It indexes audio files under a configurable folder, reads tags with
[music-metadata](https://github.com/Borewit/music-metadata), and hands playback
off to whichever common CLI media player it finds first on your `PATH`.

**Summary.** Three panes (artist, album, track), per-column search, tag-based
metadata, and playback through whichever supported CLI player is found first.

---

## Table of contents

- [Features](#features)
- [Requirements](#requirements)
- [Install](#install)
- [Configuration](#configuration)
- [Usage](#usage)
- [Keyboard reference](#keyboard-reference)
- [Playback backends](#playback-backends)
- [How it works](#how-it-works)
- [Development](#development)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Links](#links)

---

## Features

- **Three-pane library UI** — browse artists, albums, and songs with vim-style
  (`hjkl`) and arrow-key navigation.
- **Per-column search** — filter the focused column with `/`; queries are
  independent per pane.
- **Metadata-aware** — albums and tracks come from embedded tags (via
  `music-metadata`).
- **Sensible sorting** — artists and albums alphabetically; tracks ordered for
  listening.
- **External playback** — no embedded decoder; uses `mpg123`, `mpv`, `ffplay`, or
  `vlc` if available.
- **Playback status** — status bar plus playback bar showing what is playing and
  elapsed time where supported.
- **Resize-aware** — list viewport adapts to terminal height.

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

If the config directory does not exist, it is created on startup. **If
`config.json` is missing, the program exits** with a message showing the expected
path.

### `config.json` shape

```json
{
  "musicDir": "/absolute/path/to/your/music",
  "songExtensions": [".mp3", ".flac"]
}
```

Fields:

- **`musicDir`** (required) — Root directory scanned recursively for audio files.
- **`songExtensions`** (optional) — Allowed suffixes; defaults to
  `[".mp3", ".flac"]`.

---

## Usage

```bash
muzical
```

On launch, Muzical clears the screen, loads the library (this can take a moment
on large collections), renders the TUI, and clears again on exit.

- Use **left/right** (or `h` / `l`) to move focus between **Artists**, **Albums**,
  and **Songs**.
- Use **up/down** (or `j` / `k`), **Page Up/Down**, or **g** / **G** to move through
  the focused list.
- Press **Enter** or **p** on a selected track to start or toggle playback.
- Press **s** to stop playback.
- Press **`/`** to search within the focused column; **Enter** accepts, **Esc**
  cancels and clears that column’s query.
- Press **c** in normal mode to clear the filter for the focused column only.
- Press **q** or **Esc** to quit.

---

## Keyboard reference

| Mode    | Key(s)              | Action                                      |
| ------- | ------------------- | ------------------------------------------- |
| Normal  | `↑` `↓` / `j` `k`   | Move selection in focused column            |
| Normal  | `←` `→` / `h` `l`   | Focus previous/next column                  |
| Normal  | `PgUp` / `PgDn`     | Page by visible list height                 |
| Normal  | `g` / `G`           | Jump to first / last item in focused column |
| Normal  | `Enter` / `p`       | Toggle playback for selected song           |
| Normal  | `s`                 | Stop playback                               |
| Normal  | `/`                 | Start search in focused column              |
| Normal  | `c`                 | Clear search for focused column             |
| Normal  | `q` / `Esc`         | Quit                                        |
| Search  | type                | Append to query                             |
| Search  | `Backspace`/`Delete`| Delete last character                       |
| Search  | `↑` `↓`             | Move selection while searching              |
| Search  | `Enter`             | Leave search mode (keep query)              |
| Search  | `Esc`               | Cancel search and clear query               |

---

## Playback backends

The first available binary from this list wins (in order):

1. `mpg123`
2. `mpv`
3. `ffplay`
4. `vlc`

Install any one of them and ensure it is on your `PATH`. Arguments are chosen for
quiet, non-interactive playback suitable for a TUI (e.g. `mpv` with `--no-video`).

---

## How it works

1. **Config** — `load_config` resolves `config.json` and reads `musicDir` /
   `songExtensions`.
2. **Discovery** — `load_music_dir` walks `musicDir` for matching extensions.
3. **Library** — `load_library` parses each file’s metadata into in-memory
   `LibrarySong` entries.
4. **UI** — `App` (`src/app.tsx`) composes `StatusBar`, three lists, `PlaybackBar`,
   and `HelpBar`; input is centralized in `use_app_input`.
5. **Player** — `detect_player` picks a backend; `use_player` spawns it for the
   selected file path.

---

## Development

```bash
pnpm install
pnpm dev          # run from TypeScript source
pnpm build        # TypeScript + bundled CLI + TypeDoc
pnpm test         # Vitest
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
  types).
- Run **`pnpm lint`** and **`pnpm test`** before opening a PR when you touch code
  or this README.

---

## License

This project is licensed under the **MIT License** — see [LICENSE.md](LICENSE.md).

---

## Links

- **Repository:** <https://github.com/f3rnox/muzical>
- **Issues:** <https://github.com/f3rnox/muzical/issues>
- **Homepage:** <https://github.com/f3rnox/muzical> (see `package.json` `homepage`)
