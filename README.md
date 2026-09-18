# HTV Vereinspokal Tracker

Web app to track the **HTV-Pokal** (Hessischer Tennis-Verband) — all league groups, standings, fixtures, and the **Vereins-Challenge** club ranking.

Data is pulled from [nuLiga](https://htv.liga.nu/) (no public API). Results are cached locally for **one hour** so the site does not hammer nuLiga on every page view.

## Features

- Dashboard with Vereins-Challenge leaderboard
- Browse all 18 competition classes (Champions / Pros / Talents)
- Group tables and match schedules per league
- Rules page with links to official HTV documents
- Manual refresh button + automatic cache expiry

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:43123](http://localhost:43123).

## How caching works

- Season data is stored in `.cache/season-{year}.json`
- Default TTL: **1 hour**
- Pages read from cache when fresh; stale cache triggers a background re-sync
- Use **Jetzt aktualisieren** or `POST /api/refresh` to force a refresh

## API

| Endpoint | Description |
| --- | --- |
| `GET /api/seasons` | Available seasons |
| `GET /api/season/[year]` | Full cached season payload |
| `GET /api/season/[year]?refresh=1` | Force refresh |
| `POST /api/refresh` | Body: `{ "year": 2026 }` |

## Vereins-Challenge scoring

| Event | Points |
| --- | ---: |
| Registered team | +1 |
| Group phase win | +2 |
| Knockout win | +4 |
| 3:0 team win bonus | +1 |
| Walkover malus | −1 |

## Sources

- [HTV-Pokal on nuLiga](https://htv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/leaguePage?championship=HTV-Pokal+2026)
- [Official rules (PDF)](https://www.tennis.de/content/dam/tennis/lv/htv/wettbewerbe/team-tennis/htv-pokal/HTV-Pokal_Durchfuehrungsbestimmungen_2026.pdf.coredownload.inline.pdf)
- [HTV-Pokal info page](https://www.tennis.de/htv/wettbewerbe/team-tennis/htv-pokal.html)
