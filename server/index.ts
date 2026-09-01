import dotenv from 'dotenv'
dotenv.config({ path: 'server/.env' })

import express from 'express'

// ── Credentials — never sent to the browser ───────────────────────────────────
const ESPN_S2   = process.env.ESPN_S2   ?? ''
const ESPN_SWID = process.env.ESPN_SWID ?? ''
const LEAGUE_ID = Number(process.env.LEAGUE_ID ?? '0')
const SEASON    = Number(process.env.SEASON    ?? '0')

if (!ESPN_S2 || !ESPN_SWID || !LEAGUE_ID || !SEASON) {
  console.error('ERROR: ESPN_S2, ESPN_SWID, LEAGUE_ID, and SEASON must all be set in server/.env')
  process.exit(1)
}

const app  = express()
const PORT = 3001

// ── GET /api/config ───────────────────────────────────────────────────────────
// Returns only the values the frontend strictly needs to identify the
// authenticated user's team and route API calls.
// ESPN_S2 is never included in this response.
app.get('/api/config', (_req, res) => {
  res.json({ swid: ESPN_SWID, leagueId: LEAGUE_ID, season: SEASON })
})

// ── /api/espn/* ───────────────────────────────────────────────────────────────
// Proxies requests to ESPN's fantasy API, injecting credentials server-side.
// The Cookie header is set here and is never visible to the browser.
// Raw ESPN error bodies are never forwarded — only a sanitized status code.
app.use('/api/espn', async (req, res) => {
  const espnUrl = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl${req.url}`

  try {
    const espnRes = await fetch(espnUrl, {
      headers: {
        Cookie: `espn_s2=${ESPN_S2}; SWID=${ESPN_SWID}`,
        Accept: 'application/json',
      },
    })

    if (!espnRes.ok) {
      res.status(espnRes.status).json({ error: 'ESPN API error', status: espnRes.status })
      return
    }

    const data: unknown = await espnRes.json()
    res.json(data)
  } catch {
    res.status(502).json({ error: 'Unable to reach ESPN API' })
  }
})

app.listen(PORT, () => {
  console.log(`Fantasy Copilot backend listening on port ${PORT}`)
})
