'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Lobby from '@/components/Lobby'

// Dynamically import GameCanvas with no SSR (Phaser needs browser APIs)
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[480px] w-[640px] bg-game-bg border-4 border-white">
      <p className="font-pixel text-white text-sm animate-pulse">LOADING...</p>
    </div>
  ),
})

export default function GameRoom() {
  const params = useParams()
  const searchParams = useSearchParams()

  const roomId = params.roomId as string
  const playerName = searchParams.get('name') || 'PLAYER'
  const isHost = searchParams.get('host') === 'true'

  const [gameStarted, setGameStarted] = useState(false)
  const [players, setPlayers] = useState<{ id: string; name: string; color: string }[]>([])
  const [playerId, setPlayerId] = useState<string>('')

  const handleGameStart = () => {
    setGameStarted(true)
  }

  const handlePlayersUpdate = (newPlayers: { id: string; name: string; color: string }[]) => {
    setPlayers(newPlayers)
  }

  const handlePlayerIdAssigned = (id: string) => {
    setPlayerId(id)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-pixel text-white mb-2">TANK BATTLE</h1>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-pixel text-gray-400">ROOM:</span>
          <span className="text-lg font-pixel text-tank-yellow tracking-widest">{roomId}</span>
        </div>
      </div>

      {!gameStarted ? (
        <Lobby
          roomId={roomId}
          playerName={playerName}
          isHost={isHost}
          players={players}
          onPlayersUpdate={handlePlayersUpdate}
          onGameStart={handleGameStart}
          onPlayerIdAssigned={handlePlayerIdAssigned}
        />
      ) : (
        <GameCanvas
          roomId={roomId}
          playerId={playerId}
          playerName={playerName}
          players={players}
        />
      )}

      <div className="mt-6 text-xs font-pixel text-gray-600 text-center">
        <p>WASD TO MOVE / SPACE TO SHOOT</p>
      </div>
    </main>
  )
}
