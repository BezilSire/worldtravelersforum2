const API_BASE = 'https://api.travelpayouts.com/v1'

export default async function handler(req, res) {
  const url = new URL(req.url, API_BASE)
  const path = url.pathname.replace(/^\/api\/travelpayouts\/v1/, '/v1')
  const target = new URL(path, API_BASE)

  target.searchParams.set('token', process.env.TRAVELPAYOUTS_TOKEN)
  target.searchParams.set('currency', url.searchParams.get('currency') || 'USD')

  for (const [k, v] of url.searchParams) {
    if (k !== 'currency') target.searchParams.set(k, v)
  }

  try {
    const response = await fetch(target.toString())
    const data = await response.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.status(response.ok ? 200 : response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
