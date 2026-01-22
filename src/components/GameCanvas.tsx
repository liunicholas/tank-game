'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { GameConfig } from '@/game/config'
import { BootScene } from '@/game/scenes/BootScene'
import { GameScene } from '@/game/scenes/GameScene'
import { GameOverScene } from '@/game/scenes/GameOverScene'

interface Player {
  id: string
  name: string
  color: string
}

interface GameCanvasProps {
  roomId: string
  playerId: string
  playerName: string
  players: Player[]
}

export default function GameCanvas({ roomId, playerId, playerName, players }: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      ...GameConfig,
      parent: containerRef.current,
      scene: [BootScene, GameScene, GameOverScene],
      callbacks: {
        preBoot: (game) => {
          // Pass game data to scenes via registry
          game.registry.set('roomId', roomId)
          game.registry.set('playerId', playerId)
          game.registry.set('playerName', playerName)
          game.registry.set('players', players)
        },
      },
    }

    gameRef.current = new Phaser.Game(config)

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [roomId, playerId, playerName, players])

  return (
    <div
      ref={containerRef}
      className="border-4 border-white"
      style={{ width: GameConfig.width, height: GameConfig.height }}
    />
  )
}
