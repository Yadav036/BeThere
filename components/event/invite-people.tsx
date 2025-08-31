"use client"

import { useState } from "react"
import { apiFetch } from "@/lib/api"

type User = { id: string; username: string; email: string }

export default function InvitePeople({ onSelect }: { onSelect?: (u: User) => void }) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  async function search() {
    setLoading(true)
    try {
      const res = await apiFetch<{ users: User[] }>(`/api/users/search?q=${encodeURIComponent(q)}`)
      setResults(res.users)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-lg"></div>
      
      <div className="relative bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white tracking-tight mb-6">Invite People</h3>
        
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative group">
            <input
              className="w-full rounded-2xl px-4 py-4 bg-white/[0.05] text-white border border-white/10 focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.08] transition-all duration-300 placeholder-gray-500"
              placeholder="Search by username or email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none"></div>
          </div>
          
          <button
            onClick={search}
            disabled={loading}
            className="relative overflow-hidden rounded-2xl px-6 py-4 font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              {loading ? "Searching..." : "Search"}
            </div>
          </button>
        </div>
        
        <div className="space-y-3">
          {results.map((u) => (
            <button
              key={u.id}
              onClick={() => onSelect?.(u)}
              className="w-full text-left px-4 py-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">@{u.username}</span>
                  <span className="text-gray-400 text-sm ml-2">• {u.email}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </button>
          ))}
          {results.length === 0 && !loading && q && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No results found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}