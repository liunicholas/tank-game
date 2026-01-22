import Phaser from 'phaser'
import { TILE_SIZE, TANK_SPEED, BULLET_SPEED, TANK_SIZE, MAX_LIVES, RESPAWN_INVULNERABILITY_MS } from '../config'
import { GameState, PlayerState, BulletState, TileType, GameMap } from '../types/game'
import { GameClient } from '../network/GameClient'
import { Tank } from '../entities/Tank'
import { Bullet } from '../entities/Bullet'

// Default map layout (20x15 tiles = 640x480)
const DEFAULT_MAP: GameMap = {
  width: 20,
  height: 15,
  tileSize: TILE_SIZE,
  tiles: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,1],
    [1,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,1],
    [1,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  spawnPoints: [
    { x: 1, y: 1 },
    { x: 18, y: 1 },
    { x: 1, y: 13 },
    { x: 18, y: 13 },
    { x: 9, y: 7 },
    { x: 10, y: 7 },
    { x: 5, y: 5 },
    { x: 14, y: 9 },
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
    this.client.connect()

    // Create initial tanks for all players
    players.forEach((player, index) => {
      const spawn = this.map.spawnPoints[index % this.map.spawnPoints.length]
      const tank = new Tank(
        this,
        spawn.x * TILE_SIZE + TILE_SIZE / 2,
        spawn.y * TILE_SIZE + TILE_SIZE / 2,
        player.id,
        player.name,
        index,
        player.id === this.playerId
      )
      this.tanks.set(player.id, tank)

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
      const tank = this.tanks.get(targetId)
      if (tank) {
        tank.setLives(livesRemaining)
        tank.playHitEffect()
      }
    })

    this.client.onPlayerEliminated((playerId: string) => {
      const tank = this.tanks.get(playerId)
      if (tank) {
        tank.eliminate()
      }
    })

    this.client.onGameOver((winnerId: string, winnerName: string) => {
      this.scene.start('GameOverScene', { winnerId, winnerName, isWinner: winnerId === this.playerId })
    })
  }

  updateFromServer(state: GameState) {
    // Update tank positions from server state
    state.players.forEach((playerState) => {
      const tank = this.tanks.get(playerState.id)
      if (tank && playerState.id !== this.playerId) {
        // Interpolate other players' positions
        tank.setTargetPosition(playerState.x, playerState.y, playerState.rotation)
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
    const myTank = this.tanks.get(this.playerId)
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
