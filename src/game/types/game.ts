// Player stats for tracking performance
export interface PlayerStats {
  kills: number
  deaths: number
  wins: number
}

// Player state synchronized across network
export interface PlayerState {
  id: string
  name: string
  x: number
  y: number
  rotation: number
  color: string
  lives: number
  isAlive: boolean
  isInvulnerable: boolean
  isReady: boolean
}

// Bullet state synchronized across network
export interface BulletState {
  id: string
  ownerId: string
  x: number
  y: number
  velocityX: number
  velocityY: number
}

// Game statuses
export type GameStatus = 'waiting' | 'countdown' | 'playing' | 'results'

// Complete game state from server
export interface GameState {
  tick: number
  players: PlayerState[]
  bullets: BulletState[]
  gameStatus: GameStatus
  winnerId?: string
  round: number
  timeRemaining?: number
}

// Round results data
export interface RoundResults {
  winnerId: string
  winnerName: string
  playerStats: { [playerId: string]: PlayerStats }
  round: number
}

// Input from client to server
export interface PlayerInput {
  type: 'input'
  seq: number
  dx: number  // -1, 0, or 1
  dy: number  // -1, 0, or 1
  fire: boolean
  rotation: number
}

// Messages from client to server
export type ClientMessage =
  | { type: 'join'; name: string; isHost: boolean }
  | { type: 'input'; seq: number; dx: number; dy: number; fire: boolean; rotation: number }
  | { type: 'start_game' }
  | { type: 'toggle_ready' }
  | { type: 'return_to_lobby' }

// Messages from server to client
export type ServerMessage =
  | { type: 'player_id'; id: string }
  | { type: 'players_update'; players: { id: string; name: string; color: string; isReady: boolean }[] }
  | { type: 'game_start'; state: GameState }
  | { type: 'state_update'; state: GameState; ackSeq?: number }
  | { type: 'player_hit'; targetId: string; attackerId: string; livesRemaining: number }
  | { type: 'player_eliminated'; playerId: string; killerId: string }
  | { type: 'game_over'; winnerId: string; winnerName: string }
  | { type: 'countdown'; count: number }
  | { type: 'round_results'; results: RoundResults }
  | { type: 'ready_status_update'; playerId: string; isReady: boolean }
  | { type: 'error'; message: string }

// Tank color definitions
export const TANK_COLORS = [
  '#ffb3ba', // Pink
  '#bae1ff', // Blue
  '#baffc9', // Green
  '#ffffba', // Yellow
  '#e0b3ff', // Purple
  '#ffdfba', // Orange
  '#b3ffff', // Cyan
  '#ffc9ba', // Coral
] as const

// Map tile types
export enum TileType {
  EMPTY = 0,
  WALL = 1,
  SPAWN = 2,
}

// Map definition
export interface GameMap {
  width: number
  height: number
  tileSize: number
  tiles: TileType[][]
  spawnPoints: { x: number; y: number }[]
}
