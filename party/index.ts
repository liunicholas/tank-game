import type * as Party from 'partykit/server'

// Tank colors
const TANK_COLORS = [
  '#ffb3ba', '#bae1ff', '#baffc9', '#ffffba',
  '#e0b3ff', '#ffdfba', '#b3ffff', '#ffc9ba',
]

// Game constants
const TILE_SIZE = 32
const TANK_SPEED = 150
const BULLET_SPEED = 300
const MAX_LIVES = 3
const RESPAWN_INVULNERABILITY_MS = 2000
const TICK_RATE = 20
const TICK_INTERVAL = 1000 / TICK_RATE
const GAME_DURATION_MS = 3 * 60 * 1000 // 3 minutes
const COUNTDOWN_DURATION = 3 // 3 seconds

// Map layout (40x25 tiles = 1280x800)
const MAP_WIDTH = 40
const MAP_HEIGHT = 25
const MAP_TILES = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,1,1,1,1,1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,0,0,1,1,1,1,1,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,1,1,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0,0,0,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,0,0,1,1,1,0,0,1,0,0,0,0,0,2,0,0,0,0,1,0,0,1,1,1,0,0,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,1,0,0,0,1,1,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,1,1,1,1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,0,0,1,1,1,1,1,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

const SPAWN_POINTS = [
  { x: 1, y: 1 },     // Top-left
  { x: 38, y: 1 },    // Top-right
  { x: 1, y: 23 },    // Bottom-left
  { x: 38, y: 23 },   // Bottom-right
  { x: 20, y: 12 },   // Center
  { x: 10, y: 12 },   // Mid-left
  { x: 30, y: 12 },   // Mid-right
  { x: 20, y: 6 },    // Mid-top
]

interface PlayerStats {
  kills: number
  deaths: number
  wins: number
}

interface Player {
  id: string
  name: string
  color: string
  x: number
  y: number
  rotation: number
  velocityX: number
  velocityY: number
  lives: number
  isAlive: boolean
  isInvulnerable: boolean
  invulnerabilityEndTime: number
  lastBulletTime: number
  isHost: boolean
  isReady: boolean
  lastProcessedSeq: number
}

interface Bullet {
  id: string
  ownerId: string
  x: number
  y: number
  velocityX: number
  velocityY: number
}

type GameStatus = 'waiting' | 'countdown' | 'playing' | 'results'

interface GameState {
  tick: number
  players: Player[]
  bullets: Bullet[]
  gameStatus: GameStatus
  winnerId?: string
  winnerName?: string
  gameStartTime?: number
  round: number
}

export default class TankGameServer implements Party.Server {
  private state: GameState = {
    tick: 0,
    players: [],
    bullets: [],
    gameStatus: 'waiting',
    round: 0,
  }
  private connections: Map<string, Party.Connection> = new Map()
  private gameLoop: ReturnType<typeof setInterval> | null = null
  private countdownTimer: ReturnType<typeof setTimeout> | null = null
  private bulletIdCounter = 0
  private playerStats: Map<string, PlayerStats> = new Map()

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`Player connected: ${conn.id}`)
    this.connections.set(conn.id, conn)

    // Send player their ID
    conn.send(JSON.stringify({ type: 'player_id', id: conn.id }))
  }

  onClose(conn: Party.Connection) {
    console.log(`Player disconnected: ${conn.id}`)
    this.connections.delete(conn.id)

    // Only remove player if game hasn't started
    // During gameplay, keep the player so they can reconnect
    if (this.state.gameStatus === 'waiting') {
      this.state.players = this.state.players.filter((p) => p.id !== conn.id)
      this.broadcastPlayersUpdate()
    }

    // Check for game over
    if (this.state.gameStatus === 'playing') {
      this.checkGameOver()
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message)

      switch (data.type) {
        case 'join':
          this.handleJoin(sender, data.name, data.isHost)
          break

        case 'input':
          this.handleInput(sender.id, data)
          break

        case 'start_game':
          this.handleStartGame(sender.id)
          break

        case 'toggle_ready':
          this.handleToggleReady(sender.id)
          break

        case 'return_to_lobby':
          this.handleReturnToLobby(sender.id)
          break
      }
    } catch (e) {
      console.error('Failed to parse message:', e)
    }
  }

  private handleJoin(conn: Party.Connection, name: string, isHost: boolean) {
    // Check if player already exists by connection ID
    if (this.state.players.some((p) => p.id === conn.id)) {
      return
    }

    // Check if this is a reconnecting player (same name exists)
    const normalizedName = name.slice(0, 12).toUpperCase()
    const existingPlayerIndex = this.state.players.findIndex(
      (p) => p.name === normalizedName
    )

    if (existingPlayerIndex !== -1) {
      // Update existing player's connection ID
      const existingPlayer = this.state.players[existingPlayerIndex]
      existingPlayer.id = conn.id
      existingPlayer.isHost = existingPlayer.isHost || isHost
      this.broadcastPlayersUpdate()
      return
    }

    // Check max players
    if (this.state.players.length >= 8) {
      conn.send(JSON.stringify({ type: 'error', message: 'Room is full' }))
      return
    }

    // Get spawn point
    const spawnIndex = this.state.players.length
    const spawn = SPAWN_POINTS[spawnIndex % SPAWN_POINTS.length]

    // Create player
    const player: Player = {
      id: conn.id,
      name: normalizedName,
      color: TANK_COLORS[spawnIndex % TANK_COLORS.length],
      x: spawn.x * TILE_SIZE + TILE_SIZE / 2,
      y: spawn.y * TILE_SIZE + TILE_SIZE / 2,
      rotation: 0,
      velocityX: 0,
      velocityY: 0,
      lives: MAX_LIVES,
      isAlive: true,
      isInvulnerable: false,
      invulnerabilityEndTime: 0,
      lastBulletTime: 0,
      isHost: isHost || this.state.players.length === 0,
      isReady: false,
      lastProcessedSeq: 0,
    }

    this.state.players.push(player)

    // Initialize stats if not exists
    if (!this.playerStats.has(conn.id)) {
      this.playerStats.set(conn.id, { kills: 0, deaths: 0, wins: 0 })
    }

    this.broadcastPlayersUpdate()
  }

  private handleInput(playerId: string, input: { seq: number; dx: number; dy: number; fire: boolean; rotation: number }) {
    const player = this.state.players.find((p) => p.id === playerId)
    if (!player || !player.isAlive || this.state.gameStatus !== 'playing') return

    // Update last processed sequence
    player.lastProcessedSeq = input.seq

    // Update velocity based on input
    const magnitude = Math.sqrt(input.dx * input.dx + input.dy * input.dy)
    if (magnitude > 0) {
      player.velocityX = (input.dx / magnitude) * TANK_SPEED
      player.velocityY = (input.dy / magnitude) * TANK_SPEED
      player.rotation = input.rotation
    } else {
      player.velocityX = 0
      player.velocityY = 0
    }

    // Handle firing
    if (input.fire) {
      const now = Date.now()
      const fireDelay = 500

      // Check if player can fire (cooldown and no existing bullet)
      if (now - player.lastBulletTime > fireDelay) {
        // Check if player already has a bullet
        const existingBullet = this.state.bullets.some((b) => b.ownerId === playerId)
        if (!existingBullet) {
          this.createBullet(player)
          player.lastBulletTime = now
        }
      }
    }
  }

  private createBullet(player: Player) {
    const bulletSpeed = BULLET_SPEED
    const angle = player.rotation - Math.PI / 2 // Adjust for sprite orientation

    const bullet: Bullet = {
      id: `bullet_${this.bulletIdCounter++}`,
      ownerId: player.id,
      x: player.x,
      y: player.y,
      velocityX: Math.cos(angle) * bulletSpeed,
      velocityY: Math.sin(angle) * bulletSpeed,
    }

    this.state.bullets.push(bullet)
  }

  private handleStartGame(playerId: string) {
    // Only host can start
    const player = this.state.players.find((p) => p.id === playerId)
    if (!player?.isHost) return

    // Need at least 1 player
    if (this.state.players.length < 1) return

    // Start countdown
    this.startCountdown()
  }

  private handleToggleReady(playerId: string) {
    const player = this.state.players.find((p) => p.id === playerId)
    if (!player) return

    player.isReady = !player.isReady

    // Broadcast ready status update
    this.broadcast({
      type: 'ready_status_update',
      playerId,
      isReady: player.isReady,
    })

    this.broadcastPlayersUpdate()

    // Check if all players are ready in results phase
    if (this.state.gameStatus === 'results') {
      this.checkAllReady()
    }
  }

  private handleReturnToLobby(playerId: string) {
    // Reset player to waiting state
    const player = this.state.players.find((p) => p.id === playerId)
    if (!player) return

    // Remove player from game
    this.state.players = this.state.players.filter((p) => p.id !== playerId)
    this.playerStats.delete(playerId)
    this.broadcastPlayersUpdate()
  }

  private checkAllReady() {
    if (this.state.players.length < 1) return

    const allReady = this.state.players.every((p) => p.isReady)
    if (allReady) {
      // Start new round countdown
      this.startCountdown()
    }
  }

  private startCountdown() {
    this.state.gameStatus = 'countdown'

    // Reset ready status
    this.state.players.forEach((p) => {
      p.isReady = false
    })

    let count = COUNTDOWN_DURATION

    // Send initial countdown
    this.broadcast({ type: 'countdown', count })

    this.countdownTimer = setInterval(() => {
      count--
      if (count > 0) {
        this.broadcast({ type: 'countdown', count })
      } else {
        // Countdown finished, start the game
        if (this.countdownTimer) {
          clearInterval(this.countdownTimer)
          this.countdownTimer = null
        }
        this.startRound()
      }
    }, 1000)
  }

  private startRound() {
    // Increment round counter
    this.state.round++

    // Reset positions
    this.state.players.forEach((p, index) => {
      const spawn = SPAWN_POINTS[index % SPAWN_POINTS.length]
      p.x = spawn.x * TILE_SIZE + TILE_SIZE / 2
      p.y = spawn.y * TILE_SIZE + TILE_SIZE / 2
      p.rotation = 0
      p.velocityX = 0
      p.velocityY = 0
      p.lives = MAX_LIVES
      p.isAlive = true
      p.isInvulnerable = true
      p.invulnerabilityEndTime = Date.now() + RESPAWN_INVULNERABILITY_MS
      p.isReady = false
    })

    this.state.bullets = []
    this.state.tick = 0
    this.state.gameStatus = 'playing'
    this.state.gameStartTime = Date.now()

    // Broadcast game start
    this.broadcast({
      type: 'game_start',
      state: this.getPublicState(),
    })

    // Start game loop
    this.startGameLoop()
  }

  private startGameLoop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop)
    }

    this.gameLoop = setInterval(() => {
      this.tick()
    }, TICK_INTERVAL)
  }

  private tick() {
    if (this.state.gameStatus !== 'playing') return

    const deltaTime = TICK_INTERVAL / 1000
    const now = Date.now()

    // Update players
    this.state.players.forEach((player) => {
      if (!player.isAlive) return

      // Update invulnerability
      if (player.isInvulnerable && now >= player.invulnerabilityEndTime) {
        player.isInvulnerable = false
      }

      // Move player
      const newX = player.x + player.velocityX * deltaTime
      const newY = player.y + player.velocityY * deltaTime

      // Check wall collision
      if (!this.collidesWithWall(newX, newY, 12)) {
        player.x = newX
        player.y = newY
      }

      // Clamp to bounds
      player.x = Math.max(TILE_SIZE + 12, Math.min(MAP_WIDTH * TILE_SIZE - TILE_SIZE - 12, player.x))
      player.y = Math.max(TILE_SIZE + 12, Math.min(MAP_HEIGHT * TILE_SIZE - TILE_SIZE - 12, player.y))
    })

    // Update bullets
    const bulletsToRemove: string[] = []

    this.state.bullets.forEach((bullet) => {
      // Move bullet
      bullet.x += bullet.velocityX * deltaTime
      bullet.y += bullet.velocityY * deltaTime

      // Check wall collision
      if (this.collidesWithWall(bullet.x, bullet.y, 3)) {
        bulletsToRemove.push(bullet.id)
        return
      }

      // Check bounds
      if (
        bullet.x < 0 || bullet.x > MAP_WIDTH * TILE_SIZE ||
        bullet.y < 0 || bullet.y > MAP_HEIGHT * TILE_SIZE
      ) {
        bulletsToRemove.push(bullet.id)
        return
      }

      // Check player collision
      this.state.players.forEach((player) => {
        if (!player.isAlive || player.isInvulnerable) return
        if (player.id === bullet.ownerId) return // Can't hit yourself

        const dx = bullet.x - player.x
        const dy = bullet.y - player.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 16) {
          // Hit!
          bulletsToRemove.push(bullet.id)
          this.handlePlayerHit(player, bullet.ownerId)
        }
      })
    })

    // Remove bullets
    this.state.bullets = this.state.bullets.filter((b) => !bulletsToRemove.includes(b.id))

    // Check game over conditions
    this.checkGameOver()

    // Check time limit
    if (this.state.gameStartTime && now - this.state.gameStartTime > GAME_DURATION_MS) {
      this.endGameByTime()
    }

    // Broadcast state with ack seq per player
    this.state.tick++
    this.broadcastStateUpdate()
  }

  private broadcastStateUpdate() {
    const baseState = this.getPublicState()

    // Send state update to each player with their ack seq
    this.state.players.forEach((player) => {
      const conn = this.connections.get(player.id)
      if (conn) {
        conn.send(JSON.stringify({
          type: 'state_update',
          state: baseState,
          ackSeq: player.lastProcessedSeq,
        }))
      }
    })
  }

  private collidesWithWall(x: number, y: number, radius: number): boolean {
    // Check tile collision
    const tileX = Math.floor(x / TILE_SIZE)
    const tileY = Math.floor(y / TILE_SIZE)

    // Check surrounding tiles
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const checkX = tileX + dx
        const checkY = tileY + dy

        if (checkX < 0 || checkX >= MAP_WIDTH || checkY < 0 || checkY >= MAP_HEIGHT) {
          continue
        }

        if (MAP_TILES[checkY][checkX] === 1) {
          // Wall tile - check circle-rect collision
          const tileLeft = checkX * TILE_SIZE
          const tileRight = (checkX + 1) * TILE_SIZE
          const tileTop = checkY * TILE_SIZE
          const tileBottom = (checkY + 1) * TILE_SIZE

          const closestX = Math.max(tileLeft, Math.min(x, tileRight))
          const closestY = Math.max(tileTop, Math.min(y, tileBottom))

          const distX = x - closestX
          const distY = y - closestY
          const distSquared = distX * distX + distY * distY

          if (distSquared < radius * radius) {
            return true
          }
        }
      }
    }

    return false
  }

  private handlePlayerHit(player: Player, attackerId: string) {
    player.lives--

    // Update attacker stats
    const attackerStats = this.playerStats.get(attackerId)
    if (attackerStats) {
      attackerStats.kills++
    }

    this.broadcast({
      type: 'player_hit',
      targetId: player.id,
      attackerId,
      livesRemaining: player.lives,
    })

    if (player.lives <= 0) {
      player.isAlive = false

      // Update victim stats
      const victimStats = this.playerStats.get(player.id)
      if (victimStats) {
        victimStats.deaths++
      }

      this.broadcast({
        type: 'player_eliminated',
        playerId: player.id,
        killerId: attackerId,
      })
    } else {
      // Respawn with invulnerability
      player.isInvulnerable = true
      player.invulnerabilityEndTime = Date.now() + RESPAWN_INVULNERABILITY_MS
    }
  }

  private checkGameOver() {
    const alivePlayers = this.state.players.filter((p) => p.isAlive)

    if (alivePlayers.length <= 1 && this.state.players.length > 1) {
      const winner = alivePlayers[0] || this.state.players[0]
      this.endGame(winner.id, winner.name)
    } else if (this.state.players.length === 1 && !this.state.players[0].isAlive) {
      // Single player died (testing mode)
      this.endGame(this.state.players[0].id, this.state.players[0].name)
    }
  }

  private endGameByTime() {
    // Find player with most lives
    const winner = this.state.players.reduce((best, current) => {
      if (current.lives > best.lives) return current
      return best
    }, this.state.players[0])

    this.endGame(winner.id, winner.name)
  }

  private endGame(winnerId: string, winnerName: string) {
    if (this.state.gameStatus === 'results') return

    this.state.gameStatus = 'results'
    this.state.winnerId = winnerId
    this.state.winnerName = winnerName

    if (this.gameLoop) {
      clearInterval(this.gameLoop)
      this.gameLoop = null
    }

    // Update winner stats
    const winnerStats = this.playerStats.get(winnerId)
    if (winnerStats) {
      winnerStats.wins++
    }

    // Reset ready status for all players
    this.state.players.forEach((p) => {
      p.isReady = false
    })

    // Build stats object for results
    const statsObj: { [playerId: string]: { kills: number; deaths: number; wins: number } } = {}
    this.state.players.forEach((p) => {
      const stats = this.playerStats.get(p.id)
      if (stats) {
        statsObj[p.id] = { ...stats }
      }
    })

    // Broadcast round results instead of game over
    this.broadcast({
      type: 'round_results',
      results: {
        winnerId,
        winnerName,
        playerStats: statsObj,
        round: this.state.round,
      },
    })

    // Also broadcast game_over for backwards compatibility
    this.broadcast({
      type: 'game_over',
      winnerId,
      winnerName,
    })

    this.broadcastPlayersUpdate()
  }

  private getPublicState() {
    const timeRemaining = this.state.gameStartTime
      ? Math.max(0, GAME_DURATION_MS - (Date.now() - this.state.gameStartTime))
      : GAME_DURATION_MS

    return {
      tick: this.state.tick,
      players: this.state.players.map((p) => ({
        id: p.id,
        name: p.name,
        x: p.x,
        y: p.y,
        rotation: p.rotation,
        color: p.color,
        lives: p.lives,
        isAlive: p.isAlive,
        isInvulnerable: p.isInvulnerable,
        isReady: p.isReady,
      })),
      bullets: this.state.bullets.map((b) => ({
        id: b.id,
        ownerId: b.ownerId,
        x: b.x,
        y: b.y,
        velocityX: b.velocityX,
        velocityY: b.velocityY,
      })),
      gameStatus: this.state.gameStatus,
      winnerId: this.state.winnerId,
      round: this.state.round,
      timeRemaining,
    }
  }

  private broadcastPlayersUpdate() {
    this.broadcast({
      type: 'players_update',
      players: this.state.players.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        isReady: p.isReady,
      })),
    })
  }

  private broadcast(message: object) {
    const data = JSON.stringify(message)
    this.connections.forEach((conn) => {
      conn.send(data)
    })
  }
}
