# Digit Tools (Deriv Digit Analysis & Manual Trading Helper)

Mobile-first web app for analyzing last digits from Deriv ticks and assisting with manual digit trading decisions. Deployable to Netlify.

## Quick start

```bash
npm install
cp .env.example .env # optional: set VITE_DERIV_APP_ID
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

## Deploy to Netlify

- Connect your repo to Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Add env var `VITE_DERIV_APP_ID` if you have your own Deriv app id (optional)

## Notes

- This tool uses public Deriv WebSocket for ticks and does not execute trades.
- Educational purposes only, not financial advice.
