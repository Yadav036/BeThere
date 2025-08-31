"use client"

import Avatar, { genConfig } from "react-nice-avatar"

function metersToKm(m: number | null | undefined) {
  if (m == null) return "-"   // covers null and undefined
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
  const oneMinAgo = Date.now() - 60 * 1000
  if (lastLocation.ts < oneMinAgo) return false

  const moved =
    lastLocation.lat !== prevLocation.lat ||
    lastLocation.lng !== prevLocation.lng

  return moved
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
  const willBeLate =
    etaSeconds != null ? now + etaSeconds * 1000 > eventTs : false

  // Use avatar config based on user ID hash for consistency
  const avatarIndex =
    user.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    avatarConfigs.length
  const avatarConfig = genConfig(avatarConfigs[avatarIndex])

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
            {/* Travelling */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Travelling</span>
              <span
                className={`font-medium ${
                  isTravelling(lastLocation, prevLocation)
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                {isTravelling(lastLocation, prevLocation) ? "Yes" : "No"}
              </span>
            </div>

            {/* ETA */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Need to Travel for</span>
              <span className="text-white font-medium">
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

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Status</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    willBeLate ? "bg-red-400" : "bg-green-400"
                  }`}
                ></div>
                <span
                  className={`font-medium ${
                    willBeLate
                      ? "text-red-300 line-through"
                      : "text-green-300"
                  }`}
                >
                  {willBeLate ? "Late" : "On time"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
