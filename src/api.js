const API_BASE = 'https://api-v3.mbta.com';

const MBTA_API_KEY = import.meta.env.VITE_MBTA_API_KEY;

function buildUrl(path, params = {}) {
  const url = new URL(path, API_BASE);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  if (MBTA_API_KEY) {
    url.searchParams.set('api_key', MBTA_API_KEY);
  }

  return url.toString();
}

export async function fetchSouthStationDepartures() {
  const url = buildUrl('/predictions', {
    'filter[stop]': 'place-sstat',
    'filter[route_type]': '2',
    include: 'trip,route',
    sort: 'departure_time',
    'page[limit]': '50'
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`MBTA API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const trips = new Map();
  const routes = new Map();

  if (Array.isArray(data.included)) {
    for (const item of data.included) {
      if (item.type === 'trip') {
        trips.set(item.id, item);
      } else if (item.type === 'route') {
        routes.set(item.id, item);
      }
    }
  }

  const now = new Date();

  const departures = data.data
    .map((prediction) => {
      const attrs = prediction.attributes || {};
      const departureTime = attrs.departure_time ? new Date(attrs.departure_time) : null;

      if (!departureTime || departureTime < now) {
        return null;
      }

      const tripRel = prediction.relationships?.trip?.data;
      const routeRel = prediction.relationships?.route?.data;

      const trip = tripRel ? trips.get(tripRel.id) : null;
      const route = routeRel ? routes.get(routeRel.id) : null;

      const destination =
        trip?.attributes?.headsign ||
        route?.attributes?.long_name ||
        route?.attributes?.short_name ||
        '—';

      return {
        id: prediction.id,
        departureTime,
        destination,
        track: attrs.platform_code || 'TBD',
        status: attrs.status || 'On time'
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.departureTime - b.departureTime);

  return departures;
}

