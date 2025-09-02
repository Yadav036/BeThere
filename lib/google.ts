const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
if (!GOOGLE_MAPS_API_KEY) {
  console.warn("[ETA] Missing GOOGLE_MAPS_API_KEY env variable. Set it in Project Settings.")
}

export async function placesAutocomplete(query: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json")
  url.searchParams.set("location", "12.9716,77.5946")
  url.searchParams.set("radius", "90000") // 50km radius
  url.searchParams.set("input", query)
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY || "")
  url.searchParams.set("types", "geocode")
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error("Autocomplete failed")
  return res.json()
}

export async function placeDetails(placeId: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json")
  url.searchParams.set("place_id", placeId)
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY || "")
  url.searchParams.set("fields", "geometry/location,name")
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error("Place details failed")
  return res.json()
}

export async function distanceMatrix(
  origins: { lat: number; lng: number }[],
  destination: { lat: number; lng: number },
) {
  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json")
  url.searchParams.set("origins", origins.map((o) => `${o.lat},${o.lng}`).join("|"))
  url.searchParams.set("destinations", `${destination.lat},${destination.lng}`)
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY || "")
  url.searchParams.set("mode", "driving")
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error("Distance Matrix failed")
  return res.json()
}
