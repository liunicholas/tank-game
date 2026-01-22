import Phaser from 'phaser'
import { TILE_SIZE, TANK_SPEED, BULLET_SPEED, TANK_SIZE, MAX_LIVES, RESPAWN_INVULNERABILITY_MS } from '../config'
import { GameState, PlayerState, BulletState, TileType, GameMap } from '../types/game'
import { GameClient } from '../network/GameClient'
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
    { x: 1, y: 1 },     // Top-left
    { x: 38, y: 1 },    // Top-right
    { x: 1, y: 23 },    // Bottom-left
    { x: 38, y: 23 },   // Bottom-right
    { x: 20, y: 12 },   // Center
    { x: 10, y: 12 },   // Mid-left
    { x: 30, y: 12 },   // Mid-right
    { x: 20, y: 6 },    // Mid-top
  ],
}

export class GameScene extends Phaser.Scene {
  private client!: GameClient
  private tanks: Map<string, Tank> = new Map()
  private bullets: Map<string, Bullet> = new Map()
  private walls!: Phaser.Physics.Arcade.StaticGroup
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key }
  private spaceKey!: Phaser.Input.Keyboard.Key
  private playerId!: string
  private playerName!: string
  private inputSeq: number = 0
  private lastFireTime: number = 0
  private fireDelay: number = 500 // ms between shots
  private gameState: GameState | null = null
  private map: GameMap = DEFAULT_MAP

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    // Get game data from registry
    const roomId = this.registry.get('roomId') as string
    this.playerId = this.registry.get('playerId') as string
    const players = this.registry.get('players') as { id: string; name: string; color: string }[]

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
      this.client.sendJoin(this.playerName, false) // Re-join with same name
    })

    // Handle player ID updates (for reconnection)
    this.client.onPlayerIdAssigned((newId: string) => {
      this.playerId = newId
    })

    this.client.connect()

    // Create initial tanks for all players (keyed by name for stable lookup across reconnections)
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
        playerNameKey === this.playerName
      )
      this.tanks.set(playerNameKey, tank)

      // Add collision with walls
      this.physics.add.collider(tank.sprite, this.walls)
    })

    // Add UI text
    this.add.text(10, 10, 'WASD: MOVE | SPACE: FIRE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#666666',
    })
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
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  setupNetworkHandlers() {
    this.client.onStateUpdate((state: GameState) => {
      this.gameState = state
      this.updateFromServer(state)
    })

    this.client.onPlayerHit((targetId: string, livesRemaining: number) => {
      // Find player name from game state (tanks are keyed by name)
      const playerState = this.gameState?.players.find((p) => p.id === targetId)
      if (playerState) {
        const tank = this.tanks.get(playerState.name.toUpperCase())
        if (tank) {
          tank.setLives(livesRemaining)
          tank.playHitEffect()
        }
      }
    })

    this.client.onPlayerEliminated((playerId: string) => {
      // Find player name from game state (tanks are keyed by name)
      const playerState = this.gameState?.players.find((p) => p.id === playerId)
      if (playerState) {
        const tank = this.tanks.get(playerState.name.toUpperCase())
        if (tank) {
          tank.eliminate()
        }
      }
    })

    this.client.onGameOver((winnerId: string, winnerName: string) => {
      this.scene.start('GameOverScene', { winnerId, winnerName, isWinner: winnerId === this.playerId })
    })
  }

  updateFromServer(state: GameState) {
    // Update tank positions from server state (keyed by name for stable lookup)
    state.players.forEach((playerState) => {
      const playerNameKey = playerState.name.toUpperCase()
      const tank = this.tanks.get(playerNameKey)
      if (tank) {
        if (playerNameKey === this.playerName) {
          // Sync local player position directly from server (authoritative)
          tank.sprite.setPosition(playerState.x, playerState.y)
          tank.sprite.setRotation(playerState.rotation)
        } else {
          // Interpolate other players' positions
          tank.setTargetPosition(playerState.x, playerState.y, playerState.rotation)
        }
        tank.setLives(playerState.lives)
        tank.setInvulnerable(playerState.isInvulnerable)
      }
    })

    // Update bullets
    this.updateBullets(state.bullets)
  }

  updateBullets(serverBullets: BulletState[]) {
    // Create set of current bullet IDs
    const currentIds = new Set(serverBullets.map((b) => b.id))

    // Remove bullets that no longer exist
    this.bullets.forEach((bullet, id) => {
      if (!currentIds.has(id)) {
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
          // Bullet destroyed on wall hit - server will handle removal
        })
      } else {
        bullet.setPosition(bulletState.x, bulletState.y)
      }
    })
  }

  update(time: number, delta: number) {
    // Handle local player input
    this.handleInput(time)

    // Update all tanks
    this.tanks.forEach((tank) => tank.update(delta))

    // Update all bullets
    this.bullets.forEach((bullet) => bullet.update(delta))
  }

  handleInput(time: number) {
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
      rotation = Math.atan2(dy, dx) + Math.PI / 2 // Offset because tank sprite points up
    }

    // Check for fire input
    const fire = Phaser.Input.Keyboard.JustDown(this.spaceKey) && time - this.lastFireTime > this.fireDelay

    if (fire) {
      this.lastFireTime = time
    }

    // Apply local movement prediction
    if (dx !== 0 || dy !== 0) {
      myTank.move(dx, dy, rotation)
    } else {
      myTank.stop()
    }

    // Send input to server
    if (dx !== 0 || dy !== 0 || fire) {
      this.inputSeq++
      this.client.sendInput({
        type: 'input',
        seq: this.inputSeq,
        dx,
        dy,
        fire,
        rotation,
      })
    }
  }
}
