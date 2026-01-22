'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function Home() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [mode, setMode] = useState<'menu' | 'join'>('menu')

  const handleCreateGame = () => {
    if (!playerName.trim()) return
    const code = generateRoomCode()
    const params = new URLSearchParams({
      name: playerName.trim(),
      host: 'true'
    })
    router.push(`/game/${code}?${params.toString()}`)
  }

  const handleJoinGame = () => {
    if (!playerName.trim() || !roomCode.trim()) return
    const params = new URLSearchParams({
      name: playerName.trim()
    })
    router.push(`/game/${roomCode.toUpperCase().trim()}?${params.toString()}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-pixel text-white mb-4 tracking-wider">
          TANK BATTLE
        </h1>
        <p className="text-sm font-pixel text-gray-400">
          8-BIT MULTIPLAYER
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Player Name Input */}
        <div>
          <label className="block text-xs font-pixel text-gray-400 mb-2">
            YOUR NAME
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 12))}
            placeholder="ENTER NAME"
            className="input-8bit w-full"
            maxLength={12}
          />
        </div>

        {mode === 'menu' ? (
          <div className="space-y-4 pt-4">
            <button
              onClick={handleCreateGame}
              disabled={!playerName.trim()}
              className="btn-8bit w-full"
            >
              CREATE GAME
            </button>
            <button
              onClick={() => setMode('join')}
              disabled={!playerName.trim()}
              className="btn-8bit w-full"
            >
              JOIN GAME
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-pixel text-gray-400 mb-2">
                ROOM CODE
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ENTER CODE"
                className="input-8bit w-full text-center tracking-widest"
                maxLength={6}
              />
            </div>
            <button
              onClick={handleJoinGame}
              disabled={!playerName.trim() || roomCode.length < 4}
              className="btn-8bit w-full"
            >
              JOIN
            </button>
            <button
              onClick={() => setMode('menu')}
              className="btn-8bit w-full opacity-70"
            >
              BACK
            </button>
          </div>
        )}
      </div>

      <div className="mt-16 text-xs font-pixel text-gray-600">
        <p>WASD TO MOVE / SPACE TO SHOOT</p>
      </div>
    </main>
  )
}
