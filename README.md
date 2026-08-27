# Fortcy Beta

Fortcy is a Windows Fortnite performance companion for benchmarking, region latency testing, match monitoring, and settings management.

## Features

- Benchmark page with live match information
- Ping tests for Fortnite regions
- Server recommendations after multiple games
- Fortnite graphics settings backup and restore
- Reversible competitive performance preset
- Results comparison and Discord community access
- Signed in-app update support when available

## Download

Download the latest Windows installer from the [Releases page](https://github.com/prosponky/fortcy/releases). Fortcy is currently in beta, so the first install may show a Windows SmartScreen warning while publisher reputation is established.

## Fortnite settings backups

Fortcy saves backups in:

```text
%USERPROFILE%\Downloads\Fortcy-Fortnite-Settings
```

Backups include `GameUserSettings.ini`, `Game.ini`, `Input.ini`, and `Scalability.ini`. Close Fortnite before restoring a backup or applying the performance preset.

## Development

```powershell
npm install
npm run tauri dev
```

To create a production build, run `npm run build`.

Live player statistics require an approved provider API key configured through the local stats proxy. Never commit API keys to this repository.
