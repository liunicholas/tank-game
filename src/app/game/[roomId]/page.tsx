'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Lobby from '@/components/Lobby'
import { GameClient } from '@/game/network/GameClient'
import { RoundResults } from '@/game/types/game'

// Dynamically import GameCanvas with no SSR (Phaser needs browser APIs)
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[800px] w-[1280px] bg-game-bg border-4 border-white">
      <p className="font-pixel text-white text-sm animate-pulse">LOADING...</p>
    </div>
  ),
})

type GamePhase = 'lobby' | 'countdown' | 'playing' | 'results'

export default function GameRoom() {
  const params = useParams()
  const searchParams = useSearchParams()

  const roomId = params.roomId as string
  const playerName = searchParams.get('name') || 'PLAYER'
  const isHost = searchParams.get('host') === 'true'

  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby')
  const [players, setPlayers] = useState<{ id: string; name: string; color: string; isReady: boolean }[]>([])
  const [playerId, setPlayerId] = useState<string>('')
  const [countdownValue, setCountdownValue] = useState<number>(3)
  const [roundResults, setRoundResults] = useState<RoundResults | null>(null)
  const lobbyClientRef = useRef<GameClient | null>(null)

  const handleGameStart = useCallback(() => {
    // Don't immediately switch to playing - wait for countdown
  }, [])

  const handlePlayersUpdate = useCallback((newPlayers: { id: string; name: string; color: string; isReady: boolean }[]) => {
    setPlayers(newPlayers)
  }, [])

  const handlePlayerIdAssigned = useCallback((id: string) => {
    setPlayerId(id)
  }, [])

  const handleCountdown = useCallback((count: number) => {
    setCountdownValue(count)
    if (gamePhase === 'lobby') {
      setGamePhase('countdown')
    }
  }, [gamePhase])

  const handleRoundResults = useCallback((results: RoundResults) => {
    setRoundResults(results)
    setGamePhase('results')
  }, [])

  // Setup lobby client for receiving countdown/results messages
  useEffect(() => {
    if (gamePhase === 'lobby' && !lobbyClientRef.current) {
      // The Lobby component handles its own connection
      return
    }
  }, [gamePhase])

  // Handle phase-specific initial data for GameCanvas
  const getInitialSceneData = () => {
    switch (gamePhase) {
      case 'countdown':
        return { initialScene: 'CountdownScene', initialData: { count: countdownValue } }
      case 'playing':
        return { initialScene: 'BootScene', initialData: {} }
      case 'results':
        return {
          initialScene: 'ResultsScene',
          initialData: {
            results: roundResults,
            playerId,
            players
          }
        }
      default:
        return { initialScene: 'BootScene', initialData: {} }
    }
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

      {gamePhase === 'lobby' ? (
        <Lobby
          roomId={roomId}
          playerName={playerName}
          isHost={isHost}
          players={players}
          onPlayersUpdate={handlePlayersUpdate}
          onGameStart={handleGameStart}
          onPlayerIdAssigned={handlePlayerIdAssigned}
          onCountdown={handleCountdown}
        />
      ) : (
        <GameCanvas
          key={`${gamePhase}-${roundResults?.round || 0}`}
          roomId={roomId}
          playerId={playerId}
          playerName={playerName}
          players={players}
          {...getInitialSceneData()}
        />
      )}

      <div className="mt-6 text-xs font-pixel text-gray-600 text-center">
        <p>WASD TO MOVE / SPACE TO SHOOT</p>
      </div>
    </main>
  )
}
