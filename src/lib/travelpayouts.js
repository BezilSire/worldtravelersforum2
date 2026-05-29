const BASE = '/api/travelpayouts/v1'

async function api(path, params = {}) {
  const q = new URLSearchParams({ currency: 'USD', ...params })
  const res = await fetch(`${BASE}${path}?${q}`)
  if (!res.ok) throw new Error(`Travelpayouts error: ${res.status}`)
  return res.json()
}

export async function searchCheapTickets({ origin, destination, departDate, returnDate }) {
  const p = { origin, destination: destination || '-' }
  if (departDate) p.depart_date = departDate
  if (returnDate) p.return_date = returnDate
  const data = await api('/prices/cheap', p)
  const flights = []
  if (data?.data) {
    for (const [dest, offers] of Object.entries(data.data)) {
      for (const o of Object.values(offers)) {
        flights.push({
          origin: o.origin,
          destination: o.destination,
          airline: o.airline,
          departureAt: o.departure_at,
          returnAt: o.return_at,
          price: o.price,
          transfers: o.number_of_changes,
          duration: o.duration,
          flightNumber: o.flight_number,
          link: o.link,
          gate: o.gate,
        })
      }
    }
  }
  return flights
}

export async function getPriceCalendar({ origin, destination, departDate, returnDate }) {
  const p = { origin, destination: destination || '-' }
  if (departDate) p.depart_date = departDate
  if (returnDate) p.return_date = returnDate
  return api('/prices/calendar', p)
}

export async function getPopularRoutes({ origin }) {
  const data = await api('/city-directions', { origin, limit: 30 })
  const routes = []
  if (data?.data) {
    for (const [dest, info] of Object.entries(data.data)) {
      routes.push({
        destination: dest,
        price: info.price,
        airline: info.airline,
        departureAt: info.departure_at,
        returnAt: info.return_at,
        transfers: info.number_of_changes,
        link: info.link,
      })
    }
  }
  return routes.sort((a, b) => a.price - b.price)
}

export async function getCheapestTickets({ origin }) {
  return api('/prices/latest', { origin, limit: 30 })
}
