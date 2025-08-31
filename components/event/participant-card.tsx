"use client"

import Avatar, { genConfig } from "react-nice-avatar"

function metersToKm(m: number | null | undefined) {
  if (m == null) return "-"
  return (m / 1000).toFixed(1) + " km"
}

function secondsToMin(s: number | null | undefined) {
  if (s == null) return "-"
  return Math.round(s / 60) + " min"
}

// Helper: check travelling status
function isTravelling(
  lastLocation?: { lat: number; lng: number; ts: number },
  prevLocation?: { lat: number; lng: number; ts: number }
) {
  if (!lastLocation || !prevLocation) return false
  
  // Check if location is recent (within 2 minutes)
  const twoMinAgo = Date.now() - 2 * 60 * 1000
  if (lastLocation.ts < twoMinAgo) return false

  // Calculate distance moved using simple distance formula
  const latDiff = Math.abs(lastLocation.lat - prevLocation.lat)
  const lngDiff = Math.abs(lastLocation.lng - prevLocation.lng)
  
  // Convert to approximate meters (rough calculation)
  const latMeters = latDiff * 111000 // 1 degree lat ≈ 111km
  const lngMeters = lngDiff * 111000 * Math.cos((lastLocation.lat * Math.PI) / 180)
  const totalDistance = Math.sqrt(latMeters * latMeters + lngMeters * lngMeters)

  // Consider travelling if moved more than 50 meters
  return totalDistance > 50
}

// Avatar configurations for different users
const avatarConfigs = [
  {
    sex: "man",
    faceColor: "#F9C9B6",
    earSize: "big",
    eyeStyle: "oval",
    noseStyle: "long",
    mouthStyle: "smile",
    shirtStyle: "polo",
    glassesStyle: "none",
    hairColor: "#000",
    hairStyle: "thick",
    hatStyle: "none",
    hatColor: "#D2EFF3",
    eyeBrowStyle: "up",
    shirtColor: "#9287FF",
    bgColor: "#FFEDEF",
  },
  {
    sex: "woman",
    faceColor: "#F9C9B6",
    earSize: "small",
    eyeStyle: "smile",
    noseStyle: "short",
    mouthStyle: "smile",
    shirtStyle: "hoody",
    glassesStyle: "round",
    hairColor: "#6A4C93",
    hairStyle: "womanLong",
    hatStyle: "none",
    hatColor: "#D2EFF3",
    eyeBrowStyle: "up",
    shirtColor: "#FF6B6B",
    bgColor: "#E8F4F8",
  },
  {
    sex: "man",
    faceColor: "#D08B5B",
    earSize: "small",
    eyeStyle: "circle",
    noseStyle: "round",
    mouthStyle: "laugh",
    shirtStyle: "short",
    glassesStyle: "square",
    hairColor: "#2C1810",
    hairStyle: "mohawk",
    hatStyle: "none",
    hatColor: "#D2EFF3",
    eyeBrowStyle: "upWoman",
    shirtColor: "#4ECDC4",
    bgColor: "#F0F8FF",
  },
  {
    sex: "woman",
    faceColor: "#F3D2A7",
    earSize: "big",
    eyeStyle: "oval",
    noseStyle: "long",
    mouthStyle: "peace",
    shirtStyle: "polo",
    glassesStyle: "none",
    hairColor: "#FFB347",
    hairStyle: "pixie",
    hatStyle: "beanie",
    hatColor: "#FF69B4",
    eyeBrowStyle: "up",
    shirtColor: "#98D8C8",
    bgColor: "#FFF0F5",
  },
]

export default function ParticipantCard({
  user,
  etaSeconds,
  distanceMeters,
  eventTimeISO,
  lastLocation,
  prevLocation,
}: {
  user: { id: string; username: string; email: string }
  etaSeconds: number | null
  distanceMeters: number | null
  eventTimeISO: string
  lastLocation?: { lat: number; lng: number; ts: number }
  prevLocation?: { lat: number; lng: number; ts: number }
}) {
  const now = Date.now()
  const eventTs = new Date(eventTimeISO).getTime()
  const willBeLate = etaSeconds != null ? now + etaSeconds * 1000 > eventTs : false

  // Debug logging
  console.log("ParticipantCard Debug:", {
    userId: user.id,
    username: user.username,
    etaSeconds,
    distanceMeters,
    eventTimeISO,
    lastLocation,
    prevLocation,
    willBeLate,
    travelling: isTravelling(lastLocation, prevLocation)
  })

  // Use avatar config based on user ID hash for consistency
  const avatarIndex = user.id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarConfigs.length
  
  const avatarConfig = genConfig(avatarConfigs[avatarIndex])

  // Convert timestamp for travelling check
  const lastLocationWithTs = lastLocation ? {
    ...lastLocation,
    ts: typeof lastLocation.ts === 'string' ? new Date(lastLocation.ts).getTime() : lastLocation.ts
  } : undefined

  const prevLocationWithTs = prevLocation ? {
    ...prevLocation,
    ts: typeof prevLocation.ts === 'string' ? new Date(prevLocation.ts).getTime() : prevLocation.ts
  } : undefined

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-lg"></div>

      <div
        className={`relative bg-white/[0.08] backdrop-blur-xl border rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:bg-white/[0.12] ${
          willBeLate
            ? "border-red-400/30 bg-red-500/10"
            : "border-white/10"
        }`}
      >
        {/* Avatar */}
        <div className="absolute -top-10 left-6">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
              <Avatar
                style={{ width: "5rem", height: "5rem" }}
                {...avatarConfig}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-white tracking-tight">
              @{user.username}
            </h4>
            {willBeLate && (
              <div className="px-3 py-1 rounded-full bg-red-400/20 border border-red-400/30">
                <span className="text-red-300 text-xs font-medium">
                  Running Late
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Travelling Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Travelling</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isTravelling(lastLocationWithTs, prevLocationWithTs)
                      ? "bg-green-400 animate-pulse"
                      : "bg-gray-500"
                  }`}
                ></div>
                <span
                  className={`font-medium text-sm ${
                    isTravelling(lastLocationWithTs, prevLocationWithTs)
                      ? "text-green-300"
                      : "text-gray-400"
                  }`}
                >
                  {isTravelling(lastLocationWithTs, prevLocationWithTs) ? "Moving" : "Stationary"}
                </span>
              </div>
            </div>

            {/* ETA */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">ETA</span>
              <span className={`font-medium ${willBeLate ? "text-red-300" : "text-white"}`}>
                {secondsToMin(etaSeconds)}
              </span>
            </div>

            {/* Distance */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Distance</span>
              <span className="text-white font-medium">
                {metersToKm(distanceMeters)}
              </span>
            </div>

            {/* Last Update */}
            {lastLocation && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Last Update</span>
                <span className="text-gray-300 text-sm">
                  {getTimeAgo(lastLocationWithTs?.ts)}
                </span>
              </div>
            )}

            {/* Overall Status */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-gray-400 text-sm">Status</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    willBeLate ? "bg-red-400" : "bg-green-400"
                  }`}
                ></div>
                <span
                  className={`font-medium text-sm ${
                    willBeLate ? "text-red-300" : "text-green-300"
                  }`}
                >
                  {willBeLate ? "Running Late" : "On Time"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to show relative time
function getTimeAgo(timestamp?: number): string {
  if (!timestamp) return "-"
  
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}