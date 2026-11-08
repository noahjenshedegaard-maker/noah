# OnTrack

A Mac app that helps you stay honest, keep up with school events, and finish your extras.

- **Honesty**: a nightly "Was I honest today?" check-in with a streak, a 4-question "Before I say it" check, and a list for fixing slips.
- **School events**: opens your school inbox already searched for tests, due dates, trips and permission slips. Paste an email in and OnTrack finds the dates (like "Nov 14", "11/12", "Friday", "tomorrow") and turns them into events with countdowns.
- **Extras**: a to-do list for sports, music, clubs, volunteering, and anything else, with due dates.

Your data stays on your Mac. Use **Back up my data** in the sidebar now and then.

## Install on your Mac

1. Download `dist/OnTrack-mac.zip` from this branch on GitHub and double-click it to unzip.
2. Drag **OnTrack.app** into your **Applications** folder.
3. Open **Terminal** and run this once, so macOS lets the app open:

```bash
xattr -cr /Applications/OnTrack.app
```

Then open OnTrack from Launchpad or Spotlight. If you have Chrome, it opens in its own window. If not, it opens in Safari.

## Rebuild after changing `index.html`

```bash
./ontrack/mac/build.sh
```
