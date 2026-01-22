import Phaser from 'phaser'

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 800,
  backgroundColor: '#1a1a2e',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

// Game constants
export const TILE_SIZE = 32
export const MAP_WIDTH = 40
export const MAP_HEIGHT = 25
export const TANK_SPEED = 150
export const BULLET_SPEED = 300
export const TANK_SIZE = 24
export const BULLET_SIZE = 6
export const MAX_LIVES = 3
export const RESPAWN_INVULNERABILITY_MS = 2000
export const TICK_RATE = 20 // ticks per second
export const TICK_INTERVAL = 1000 / TICK_RATE
