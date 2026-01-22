'use client'

import { useEffect, useRef, useState } from 'react'
import { GameClient } from '@/game/network/GameClient'

const TANK_COLORS = [
  { name: 'PINK', hex: '#ffb3ba' },
  { name: 'BLUE', hex: '#bae1ff' },
  { name: 'GREEN', hex: '#baffc9' },
  { name: 'YELLOW', hex: '#ffffba' },
  { name: 'PURPLE', hex: '#e0b3ff' },
  { name: 'ORANGE', hex: '#ffdfba' },
  { name: 'CYAN', hex: '#b3ffff' },
  { name: 'CORAL', hex: '#ffc9ba' },
]

interface Player {
  id: string
  name: string
  color: string
}

interface LobbyProps {
  roomId: string
  playerName: string
  isHost: boolean
  players: Player[]
  onPlayersUpdate: (players: Player[]) => void
  onGameStart: () => void
  onPlayerIdAssigned: (id: string) => void
}

export default function Lobby({
  roomId,
  playerName,
  isHost,
  players,
  onPlayersUpdate,
  onGameStart,
  onPlayerIdAssigned,
}: LobbyProps) {
  const clientRef = useRef<GameClient | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const client = new GameClient(roomId)
    clientRef.current = client

    client.onConnect(() => {
      setConnected(true)
      client.sendJoin(playerName, isHost)
    })

    client.onError((err) => {
      setError(err.message)
    })

    client.onPlayersUpdate((updatedPlayers) => {
      onPlayersUpdate(updatedPlayers)
    })

    client.onPlayerIdAssigned((id) => {
      onPlayerIdAssigned(id)
    })

    client.onGameStart(() => {
      onGameStart()
    })

    client.connect()

    return () => {
      client.disconnect()
    }
  }, [roomId, playerName, isHost, onPlayersUpdate, onGameStart, onPlayerIdAssigned])

  const handleStartGame = () => {
    if (clientRef.current && isHost && players.length >= 1) {
      clientRef.current.sendStartGame()
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId)
  }

  if (error) {
    return (
      <div className="bg-game-bg border-4 border-red-500 p-8 text-center">
        <p className="font-pixel text-red-500 text-sm mb-4">CONNECTION ERROR</p>
        <p className="font-pixel text-gray-400 text-xs">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-game-bg border-4 border-white p-8 min-w-[400px]">
      {/* Room Code Display */}
      <div className="text-center mb-8">
        <p className="font-pixel text-gray-400 text-xs mb-2">SHARE THIS CODE</p>
        <button
          onClick={copyRoomCode}
          className="font-pixel text-3xl text-tank-yellow tracking-widest hover:text-white transition-colors"
          title="Click to copy"
        >
          {roomId}
        </button>
        <p className="font-pixel text-gray-600 text-xs mt-2">CLICK TO COPY</p>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`w-3 h-3 ${connected ? 'bg-tank-green' : 'bg-gray-600'}`} />
        <span className="font-pixel text-xs text-gray-400">
          {connected ? 'CONNECTED' : 'CONNECTING...'}
        </span>
      </div>

      {/* Players List */}
      <div className="mb-8">
        <p className="font-pixel text-xs text-gray-400 mb-4 text-center">
          PLAYERS ({players.length}/8)
        </p>
        <div className="space-y-2">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-2 border-2 border-gray-700"
            >
              <div
                className="w-6 h-6 border-2 border-white"
                style={{ backgroundColor: TANK_COLORS[index % TANK_COLORS.length].hex }}
              />
              <span className="font-pixel text-sm text-white flex-1">
                {player.name}
              </span>
              {index === 0 && (
                <span className="font-pixel text-xs text-tank-yellow">HOST</span>
              )}
            </div>
          ))}
          {players.length === 0 && (
            <p className="font-pixel text-xs text-gray-600 text-center py-4">
              WAITING FOR PLAYERS...
            </p>
          )}
        </div>
      </div>

      {/* Start Button (Host Only) */}
      {isHost && (
        <button
          onClick={handleStartGame}
          disabled={players.length < 1}
          className="btn-8bit w-full"
        >
          {players.length < 1 ? 'NEED 1+ PLAYERS' : 'START GAME'}
        </button>
      )}

      {!isHost && (
        <p className="font-pixel text-xs text-gray-400 text-center">
          WAITING FOR HOST TO START...
        </p>
      )}
    </div>
  )
}
