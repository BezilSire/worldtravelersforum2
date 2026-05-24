const POINTS = {
  STAY: 20,
  FLIGHT: 15,
  POST: 5,
  TRIP_REPORT: 25,
  VOUCH: 30,
  MISSION: 100,
  LEGACY_PER_COUNTRY: 10
}

const RANKS = [
  { min: 0, max: 99, title: 'Wanderer' },
  { min: 100, max: 299, title: 'Explorer' },
  { min: 300, max: 699, title: 'Pathfinder' },
  { min: 700, max: Infinity, title: 'Trailblazer' }
]

function getRank(totalScore) {
  for (const r of RANKS) {
    if (totalScore >= r.min && totalScore <= r.max) return r.title
  }
  return 'Wanderer'
}

export function calcReputation({ countriesCount, staysCount, postsCount, flightsCount, tripReportsCount, vouchesCount, missionsCount }) {
  const legacyScore = (countriesCount || 0) * POINTS.LEGACY_PER_COUNTRY

  const breakdown = {
    stays: { count: staysCount || 0, points: POINTS.STAY, subtotal: (staysCount || 0) * POINTS.STAY },
    flights: { count: flightsCount || 0, points: POINTS.FLIGHT, subtotal: (flightsCount || 0) * POINTS.FLIGHT },
    posts: { count: postsCount || 0, points: POINTS.POST, subtotal: (postsCount || 0) * POINTS.POST },
    tripReports: { count: tripReportsCount || 0, points: POINTS.TRIP_REPORT, subtotal: (tripReportsCount || 0) * POINTS.TRIP_REPORT },
    vouches: { count: vouchesCount || 0, points: POINTS.VOUCH, subtotal: (vouchesCount || 0) * POINTS.VOUCH },
    missions: { count: missionsCount || 0, points: POINTS.MISSION, subtotal: (missionsCount || 0) * POINTS.MISSION }
  }

  const earnedScore = Object.values(breakdown).reduce((sum, b) => sum + b.subtotal, 0)
  const totalScore = legacyScore + earnedScore
  const rank = getRank(totalScore)

  return { legacyScore, earnedScore, totalScore, rank, breakdown }
}
