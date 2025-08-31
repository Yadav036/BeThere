"use client"

import type React from "react"
import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"

type Mode = "signup" | "login"

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === "signup") {
        const res = await apiFetch<{ token: string; user: any }>("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email, password, username }),
        })
        localStorage.setItem("token", res.token)
      } else {
        const res = await apiFetch<{ token: string; user: any }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        })
        localStorage.setItem("token", res.token)
      }
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.2),transparent_50%)]"></div>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-lg"></div>
        
        <div className="relative bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-xl">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm"></div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">BeThere</h1>
            <p className="text-gray-400 text-sm">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Username</label>
                <div className="relative group">
                  <input
                    className="w-full rounded-2xl px-4 py-4 bg-white/[0.05] text-white border border-white/10 focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.08] transition-all duration-300 placeholder-gray-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none"></div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <div className="relative group">
                <input
                  type="email"
                  className="w-full rounded-2xl px-4 py-4 bg-white/[0.05] text-white border border-white/10 focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.08] transition-all duration-300 placeholder-gray-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative group">
                <input
                  type="password"
                  className="w-full rounded-2xl px-4 py-4 bg-white/[0.05] text-white border border-white/10 focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.08] transition-all duration-300 placeholder-gray-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none"></div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden rounded-2xl py-4 font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                {loading ? "Processing..." : mode === "signup" ? "Create Account" : "Sign In"}
              </div>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm mb-3">
              {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
            </p>
            <a
              href={mode === "signup" ? "/login" : "/signup"}
              className="text-blue-400 font-medium hover:text-blue-300 transition-colors duration-300 relative group inline-block"
            >
              {mode === "signup" ? "Sign in instead" : "Create account"}
              <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}