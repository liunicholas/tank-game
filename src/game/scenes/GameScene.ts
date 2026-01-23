import Phaser from 'phaser'
import { TILE_SIZE, TANK_SPEED, TANK_SIZE } from '../config'
import { GameState, PlayerState, BulletState, TileType, GameMap, RoundResults } from '../types/game'
import { GameClient } from '../network/GameClient'
import { InputBuffer } from '../network/InputBuffer'
import { PredictionSystem, Position } from '../network/PredictionSystem'
import { EffectsManager } from '../effects/EffectsManager'
import { GameHUD } from '../ui/GameHUD'
import { KillFeed } from '../ui/KillFeed'
import { Tank } from '../entities/Tank'
import { Bullet } from '../entities/Bullet'

// Default map layout (40x25 tiles = 1280x800)
const DEFAULT_MAP: GameMap = {
  width: 40,
  height: 25,
  tileSize: TILE_SIZE,
  tiles: [
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
  ],
  spawnPoints: [
    { x: 1, y: 1 },
    { x: 38, y: 1 },
    { x: 1, y: 23 },
    { x: 38, y: 23 },
    { x: 20, y: 12 },
    { x: 10, y: 12 },
    { x: 30, y: 12 },
    { x: 20, y: 6 },
  ],
}

export class GameScene extends Phaser.Scene {
  private client!: GameClient
  private tanks: Map<string, Tank> = new Map()
  private bullets: Map<string, Bullet> = new Map()
  private walls!: Phaser.Physics.Arcade.StaticGroup
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key }
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private spaceKey!: Phaser.Input.Keyboard.Key
  private playerId!: string
  private playerName!: string
  private inputSeq: number = 0
  private lastFireTime: number = 0
  private fireDelay: number = 500
  private gameState: GameState | null = null
  private map: GameMap = DEFAULT_MAP

  // New systems
  private inputBuffer!: InputBuffer
  private predictionSystem!: PredictionSystem
  private effects!: EffectsManager
  private hud!: GameHUD
  private killFeed!: KillFeed

  // Player tracking for kill feed
  private playerColors: Map<string, string> = new Map()
  private playerNames: Map<string, string> = new Map()
  private currentRound: number = 1
  private roundResults: RoundResults | null = null

  // Track if player was moving last frame (for sending stop inputs)
  private wasMoving: boolean = false

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    // Get game data from registry
    const roomId = this.registry.get('roomId') as string
    this.playerId = this.registry.get('playerId') as string
    const players = this.registry.get('players') as { id: string; name: string; color: string }[]

    // Store player info for kill feed
    players.forEach((p) => {
      this.playerColors.set(p.id, p.color)
      this.playerNames.set(p.id, p.name)
    })

    // Initialize prediction systems
    this.inputBuffer = new InputBuffer()
    this.predictionSystem = new PredictionSystem(this.inputBuffer)

    // Initialize effects
    this.effects = new EffectsManager(this)

    // Create tilemap
    this.createMap()

    // Set up input
    this.setupInput()

    // Create walls collision group
    this.walls = this.physics.add.staticGroup()
    this.createWalls()

    // Connect to game server
    this.client = new GameClient(roomId)
    this.setupNetworkHandlers()

    // Get player info from registry
    this.playerName = (this.registry.get('playerName') as string).toUpperCase()

    // Set up connection handler to join after connecting
    this.client.onConnect(() => {
      this.client.sendJoin(this.playerName, false)
    })

    // Handle player ID updates (for reconnection)
    this.client.onPlayerIdAssigned((newId: string) => {
      this.playerId = newId
    })

    this.client.connect()

    // Create initial tanks for all players
    players.forEach((player, index) => {
      const spawn = this.map.spawnPoints[index % this.map.spawnPoints.length]
      const playerNameKey = player.name.toUpperCase()
      const tank = new Tank(
        this,
        spawn.x * TILE_SIZE + TILE_SIZE / 2,
        spawn.y * TILE_SIZE + TILE_SIZE / 2,
        player.id,
        player.name,
        index,
        playerNameKey === this.playerName,
        this.effects
      )
      this.tanks.set(playerNameKey, tank)

      // Add collision with walls
      this.physics.add.collider(tank.sprite, this.walls)
    })

    // Initialize HUD
    this.hud = new GameHUD(this, {
      playerId: this.playerId,
      playerName: this.playerName,
      round: this.currentRound,
      totalTime: 180000,
    })

    // Initialize Kill Feed
    this.killFeed = new KillFeed(this, 20, 70)
  }

  createMap() {
    // Draw floor tiles
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'floor')
      }
    }
  }

  createWalls() {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (this.map.tiles[y][x] === TileType.WALL) {
          const wall = this.walls.create(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            'wall'
          )
          wall.setImmovable(true)
        }
      }
    }
  }

  setupInput() {
    if (!this.input.keyboard) return

    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
    this.cursors = this.input.keyboard.createCursorKeys()
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  }

  setupNetworkHandlers() {
    this.client.onStateUpdate((state: GameState, ackSeq?: number) => {
      this.gameState = state
      this.updateFromServer(state, ackSeq)

      // Update HUD timer
      if (state.timeRemaining !== undefined) {
        this.hud.updateTimer(state.timeRemaining)
      }

      // Update round
      if (state.round !== this.currentRound) {
        this.currentRound = state.round
        this.hud.updateRound(state.round)
      }
    })

    this.client.onPlayerHit((targetId: string, attackerId: string, livesRemaining: number) => {
      const targetState = this.gameState?.players.find((p) => p.id === targetId)
      if (targetState) {
        const tank = this.tanks.get(targetState.name.toUpperCase())
        if (tank) {
          tank.setLives(livesRemaining)
          tank.playHitEffect()
        }

        // Add to kill feed if attacker and target are different
        if (attackerId !== targetId) {
          const attackerName = this.playerNames.get(attackerId) || 'Unknown'
          const attackerColor = this.playerColors.get(attackerId) || '#ffffff'
          const targetName = this.playerNames.get(targetId) || 'Unknown'
          const targetColor = this.playerColors.get(targetId) || '#ffffff'
          this.killFeed.addKill(attackerName, attackerColor, targetName, targetColor)
        }
      }
    })

    this.client.onPlayerEliminated((playerId: string, killerId: string) => {
      const playerState = this.gameState?.players.find((p) => p.id === playerId)
      if (playerState) {
        const tank = this.tanks.get(playerState.name.toUpperCase())
        if (tank) {
          // Create death effect before eliminating
          this.effects.createDeathEffect(tank.sprite.x, tank.sprite.y, playerState.color)
          tank.eliminate()
        }

        // Add elimination to kill feed
        const killerName = this.playerNames.get(killerId) || 'Unknown'
        const killerColor = this.playerColors.get(killerId) || '#ffffff'
        const victimName = this.playerNames.get(playerId) || 'Unknown'
        const victimColor = this.playerColors.get(playerId) || '#ffffff'
        this.killFeed.addElimination(killerName, killerColor, victimName, victimColor)
      }
    })

    this.client.onRoundResults((results: RoundResults) => {
      this.roundResults = results

      // Get current players from registry
      const players = this.registry.get('players') as { id: string; name: string; color: string; isReady: boolean }[]

      // Transition to results scene
      this.client.disconnect()
      this.scene.start('ResultsScene', {
        results,
        playerId: this.playerId,
        players,
      })
    })

    this.client.onGameOver((winnerId: string, winnerName: string) => {
      // This is handled by onRoundResults now, but keep as fallback
      if (!this.roundResults) {
        this.scene.start('GameOverScene', { winnerId, winnerName, isWinner: winnerId === this.playerId })
      }
    })
  }

  updateFromServer(state: GameState, ackSeq?: number) {
    // Update tank positions from server state
    state.players.forEach((playerState) => {
      const playerNameKey = playerState.name.toUpperCase()
      const tank = this.tanks.get(playerNameKey)
      if (tank) {
        if (playerNameKey === this.playerName) {
          // Client-side prediction reconciliation
          if (ackSeq !== undefined) {
            const serverPosition: Position = {
              x: playerState.x,
              y: playerState.y,
              rotation: playerState.rotation,
            }

            // Reconcile with server position
            const reconciledPosition = this.predictionSystem.reconcile(serverPosition, ackSeq)

            // Check if we need to correct
            const currentPosition: Position = {
              x: tank.sprite.x,
              y: tank.sprite.y,
              rotation: tank.sprite.rotation,
            }

            if (this.predictionSystem.shouldCorrect(currentPosition, reconciledPosition, 3)) {
              // Smooth correction
              const corrected = this.predictionSystem.smoothCorrection(currentPosition, reconciledPosition, 0.3)
              tank.sprite.setPosition(corrected.x, corrected.y)
              tank.sprite.setRotation(corrected.rotation)
            }
          } else {
            // No prediction, use server position directly
            tank.sprite.setPosition(playerState.x, playerState.y)
            tank.sprite.setRotation(playerState.rotation)
          }
        } else {
          // Interpolate other players' positions
          tank.setTargetPosition(playerState.x, playerState.y, playerState.rotation)
        }
        tank.setLives(playerState.lives)
        tank.setInvulnerable(playerState.isInvulnerable)

        // Store updated player info
        this.playerColors.set(playerState.id, playerState.color)
        this.playerNames.set(playerState.id, playerState.name)
      }
    })

    // Update bullets
    this.updateBullets(state.bullets)
  }

  updateBullets(serverBullets: BulletState[]) {
    const currentIds = new Set(serverBullets.map((b) => b.id))

    // Remove bullets that no longer exist (with hit effect)
    this.bullets.forEach((bullet, id) => {
      if (!currentIds.has(id)) {
        // Create hit effect at bullet position
        this.effects.createHitSparks(bullet.sprite.x, bullet.sprite.y)
        bullet.destroy()
        this.bullets.delete(id)
      }
    })

    // Add or update bullets
    serverBullets.forEach((bulletState) => {
      let bullet = this.bullets.get(bulletState.id)
      if (!bullet) {
        bullet = new Bullet(this, bulletState.x, bulletState.y, bulletState.id, bulletState.ownerId)
        this.bullets.set(bulletState.id, bullet)

        // Add collision with walls
        this.physics.add.collider(bullet.sprite, this.walls, () => {
          this.effects.createWallHitEffect(bullet!.sprite.x, bullet!.sprite.y)
        })
      } else {
        bullet.setPosition(bulletState.x, bulletState.y)
      }
    })
  }

  update(time: number, delta: number) {
    // Handle local player input
    this.handleInput(time, delta)

    // Update all tanks
    this.tanks.forEach((tank) => tank.update(delta))

    // Update all bullets
    this.bullets.forEach((bullet) => bullet.update(delta))

    // Update effects
    this.effects.update(delta)

    // Update kill feed
    this.killFeed.update()
  }

  handleInput(time: number, delta: number) {
    const myTank = this.tanks.get(this.playerName)
    if (!myTank || !myTank.isAlive) return

    // Calculate movement direction
    let dx = 0
    let dy = 0

    if (this.wasd.A.isDown || this.cursors.left.isDown) dx = -1
    else if (this.wasd.D.isDown || this.cursors.right.isDown) dx = 1

    if (this.wasd.W.isDown || this.cursors.up.isDown) dy = -1
    else if (this.wasd.S.isDown || this.cursors.down.isDown) dy = 1

    // Calculate rotation based on movement
    let rotation = myTank.sprite.rotation
    if (dx !== 0 || dy !== 0) {
      rotation = Math.atan2(dy, dx) + Math.PI / 2
    }

    // Check for fire input
    const fire = Phaser.Input.Keyboard.JustDown(this.spaceKey) && time - this.lastFireTime > this.fireDelay

    if (fire) {
      this.lastFireTime = time

      // Create muzzle flash effect
      this.effects.createMuzzleFlash(myTank.sprite.x, myTank.sprite.y, rotation)
    }

    const isMoving = dx !== 0 || dy !== 0

    // Apply local movement prediction
    if (isMoving) {
      // Predict position locally
      const currentPosition: Position = {
        x: myTank.sprite.x,
        y: myTank.sprite.y,
        rotation: myTank.sprite.rotation,
      }

      const deltaTime = delta / 1000
      const predictedPosition = this.predictionSystem.predictPosition(
        currentPosition,
        { dx, dy, rotation },
        deltaTime
      )

      // Apply predicted position
      myTank.sprite.setPosition(predictedPosition.x, predictedPosition.y)
      myTank.sprite.setRotation(predictedPosition.rotation)

      // Store input in buffer
      this.inputSeq++
      const input = {
        type: 'input' as const,
        seq: this.inputSeq,
        dx,
        dy,
        fire,
        rotation,
      }

      this.inputBuffer.addInput(input, predictedPosition)

      // Send input to server
      this.client.sendInput(input)

      this.wasMoving = true
    } else if (this.wasMoving || fire) {
      // Send stop input when player was moving but now stopped
      // OR when firing without movement
      this.inputSeq++
      this.client.sendInput({
        type: 'input',
        seq: this.inputSeq,
        dx: 0,
        dy: 0,
        fire,
        rotation,
      })

      this.wasMoving = false
    }
  }

  shutdown() {
    if (this.client) {
      this.client.disconnect()
    }
    if (this.hud) {
      this.hud.destroy()
    }
    if (this.killFeed) {
      this.killFeed.destroy()
    }
  }
}
