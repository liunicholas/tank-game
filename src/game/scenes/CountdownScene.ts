import Phaser from 'phaser'
import { GameClient } from '../network/GameClient'
import { TILE_SIZE } from '../config'

interface CountdownData {
  count: number
}

// Default map for preview
const MAP_WIDTH = 40
const MAP_HEIGHT = 25
const SPAWN_POINTS = [
  { x: 1, y: 1 },
  { x: 38, y: 1 },
  { x: 1, y: 23 },
  { x: 38, y: 23 },
  { x: 20, y: 12 },
  { x: 10, y: 12 },
  { x: 30, y: 12 },
  { x: 20, y: 6 },
]

export class CountdownScene extends Phaser.Scene {
  private client!: GameClient
  private countdownText!: Phaser.GameObjects.Text
  private currentCount: number = 3

  constructor() {
    super({ key: 'CountdownScene' })
  }

  create(data: CountdownData) {
    this.currentCount = data.count || 3

    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Semi-transparent background showing the map preview
    this.createMapPreview()

    // Dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)

    // "GET READY" text
    this.add.text(width / 2, height / 2 - 100, 'GET READY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ffffba',
    }).setOrigin(0.5)

    // Countdown number
    this.countdownText = this.add.text(width / 2, height / 2 + 20, String(this.currentCount), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '96px',
      color: '#ffffff',
    }).setOrigin(0.5)

    // Add pulsing animation to countdown
    this.tweens.add({
      targets: this.countdownText,
      scale: { from: 1.2, to: 1 },
      duration: 200,
      ease: 'Power2',
    })

    // Connect to server for countdown updates
    this.setupNetworkConnection()
  }

  private createMapPreview() {
    // Draw floor tiles
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'floor')
      }
    }

    // Draw spawn point indicators
    const players = this.registry.get('players') as { id: string; name: string; color: string }[]
    if (players) {
      players.forEach((player, index) => {
        const spawn = SPAWN_POINTS[index % SPAWN_POINTS.length]
        const x = spawn.x * TILE_SIZE + TILE_SIZE / 2
        const y = spawn.y * TILE_SIZE + TILE_SIZE / 2

        // Spawn highlight circle
        const circle = this.add.circle(x, y, 24, parseInt(player.color.replace('#', ''), 16), 0.5)

        // Pulsing animation
        this.tweens.add({
          targets: circle,
          scale: { from: 0.8, to: 1.2 },
          alpha: { from: 0.7, to: 0.3 },
          duration: 800,
          yoyo: true,
          repeat: -1,
        })

        // Player name
        this.add.text(x, y + 35, player.name, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: player.color,
        }).setOrigin(0.5)
      })
    }
  }

  private setupNetworkConnection() {
    const roomId = this.registry.get('roomId') as string
    this.client = new GameClient(roomId)

    this.client.onConnect(() => {
      const playerName = this.registry.get('playerName') as string
      this.client.sendJoin(playerName, false)
    })

    this.client.onCountdown((count: number) => {
      this.updateCountdown(count)
    })

    this.client.onGameStart(() => {
      // Transition to game scene
      this.client.disconnect()
      this.scene.start('GameScene')
    })

    this.client.connect()
  }

  private updateCountdown(count: number) {
    this.currentCount = count

    if (count > 0) {
      this.countdownText.setText(String(count))

      // Pulse animation
      this.tweens.add({
        targets: this.countdownText,
        scale: { from: 1.5, to: 1 },
        duration: 300,
        ease: 'Power2',
      })

      // Color change as countdown progresses
      if (count === 3) {
        this.countdownText.setColor('#ff6666')
      } else if (count === 2) {
        this.countdownText.setColor('#ffff66')
      } else if (count === 1) {
        this.countdownText.setColor('#66ff66')
      }
    } else {
      // GO!
      this.countdownText.setText('GO!')
      this.countdownText.setColor('#00ff00')
      this.countdownText.setFontSize(64)

      this.tweens.add({
        targets: this.countdownText,
        scale: { from: 0.5, to: 2 },
        alpha: { from: 1, to: 0 },
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          this.client.disconnect()
          this.scene.start('GameScene')
        },
      })
    }
  }

  shutdown() {
    if (this.client) {
      this.client.disconnect()
    }
  }
}
