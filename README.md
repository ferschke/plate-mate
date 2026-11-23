# Plate Mate

**Plate Mate** is a mobile-first reactive web application for playing the classic 50-state US license plate game during car rides.

🌐 **Live App:** [https://ferschke.github.io/plate-mate/](https://ferschke.github.io/plate-mate/)

## Features

- **Trip Management**: Start new trips, continue previous trips, rename or delete trips, and track all-time road trip statistics.
- **All 50 US State License Plates**: High-fidelity vector renderings of the most recent, recognizable standard license plate design for every US state, with search, filter (`All`, `Unseen`, `Seen`), and sort (`A–Z`, `Unseen First`, `Recently Spotted`).
- **One-Tap Toggle & Counter**: Tap any plate to mark it spotted and increment the `X / 50` counter; tap a second time to unmark it (plus quick Undo toast).
- **Interactive 50-State US Map**: Powered by `d3-geo` (`geoAlbersUsa`) and `us-atlas` (including Alaska & Hawaii insets), color-coded by seen/unseen status, with East Coast quick-tap chips, state plate inspector, and regional progress breakdown.
- **LocalStorage Persistence**: All trips, spottings, and statistics are saved automatically in `localStorage` so the app works offline during highway dead zones.
- **Multiplayer Co-op Trips**: Share any trip via a 6-character code, invite link, or scannable QR code. Multiple phones in the same car sync live over MQTT/WSS using a conflict-free per-state Last-Write-Wins (LWW) CRDT, complete with a spotter leaderboard and live crew presence.
- **Daylight & Night Drive Modes**: Sunlit high-contrast atlas theme for daytime driving and a low-glare dark mode for night drives.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```
