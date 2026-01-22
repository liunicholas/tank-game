import Phaser from 'phaser'
import { TANK_COLORS } from '../types/game'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Create loading text
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    const loadingText = this.add.text(width / 2, height / 2, 'LOADING...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    })
    loadingText.setOrigin(0.5)

    // Generate pixel art sprites programmatically
    this.generateSprites()
  }

  generateSprites() {
    // Generate tank sprites for each color
    TANK_COLORS.forEach((color, index) => {
      this.generateTankSprite(`tank_${index}`, color)
    })

    // Generate bullet sprite
    this.generateBulletSprite()

    // Generate wall tile
    this.generateWallTile()

    // Generate floor tile
    this.generateFloorTile()

    // Generate heart sprite
    this.generateHeartSprite()
  }

  generateTankSprite(key: string, color: string) {
    const size = 16
    const graphics = this.make.graphics({ x: 0, y: 0 })

    // Parse hex color
    const hexColor = parseInt(color.replace('#', ''), 16)

    // Tank body (main rectangle)
    graphics.fillStyle(hexColor, 1)
    graphics.fillRect(2, 4, 12, 10)

    // Tank turret/cannon
    graphics.fillRect(6, 0, 4, 6)

    // Tank tracks (darker shade)
    const darkerColor = this.darkenColor(hexColor, 0.3)
    graphics.fillStyle(darkerColor, 1)
    graphics.fillRect(0, 4, 2, 10)
    graphics.fillRect(14, 4, 2, 10)

    // Outline in black
    graphics.lineStyle(1, 0x000000, 1)
    graphics.strokeRect(2, 4, 12, 10)
    graphics.strokeRect(6, 0, 4, 6)
    graphics.strokeRect(0, 4, 2, 10)
    graphics.strokeRect(14, 4, 2, 10)

    // Generate texture from graphics
    graphics.generateTexture(key, size, size)
    graphics.destroy()
  }

  generateBulletSprite() {
    const size = 8
    const graphics = this.make.graphics({ x: 0, y: 0 })

    // White bullet with black outline
    graphics.fillStyle(0xffffff, 1)
    graphics.fillCircle(4, 4, 3)
    graphics.lineStyle(1, 0x000000, 1)
    graphics.strokeCircle(4, 4, 3)

    graphics.generateTexture('bullet', size, size)
    graphics.destroy()
  }

  generateWallTile() {
    const size = 32
    const graphics = this.make.graphics({ x: 0, y: 0 })

    // White wall with subtle pattern
    graphics.fillStyle(0xffffff, 1)
    graphics.fillRect(0, 0, size, size)

    // Add some 8-bit style brick pattern
    graphics.lineStyle(2, 0xcccccc, 1)
    graphics.strokeRect(1, 1, size - 2, size - 2)

    // Inner brick lines
    graphics.lineStyle(1, 0xdddddd, 1)
    graphics.lineBetween(0, 16, 32, 16)
    graphics.lineBetween(16, 0, 16, 16)
    graphics.lineBetween(8, 16, 8, 32)
    graphics.lineBetween(24, 16, 24, 32)

    graphics.generateTexture('wall', size, size)
    graphics.destroy()
  }

  generateFloorTile() {
    const size = 32
    const graphics = this.make.graphics({ x: 0, y: 0 })

    // Dark floor
    graphics.fillStyle(0x1a1a2e, 1)
    graphics.fillRect(0, 0, size, size)

    // Subtle grid pattern
    graphics.lineStyle(1, 0x252540, 1)
    graphics.strokeRect(0, 0, size, size)

    graphics.generateTexture('floor', size, size)
    graphics.destroy()
  }

  generateHeartSprite() {
    const size = 12
    const graphics = this.make.graphics({ x: 0, y: 0 })

    // Red heart shape (8-bit style)
    graphics.fillStyle(0xff0000, 1)

    // Top bumps
    graphics.fillRect(2, 2, 3, 3)
    graphics.fillRect(7, 2, 3, 3)

    // Middle
    graphics.fillRect(1, 4, 10, 3)

    // Bottom point
    graphics.fillRect(2, 7, 8, 2)
    graphics.fillRect(3, 9, 6, 1)
    graphics.fillRect(4, 10, 4, 1)
    graphics.fillRect(5, 11, 2, 1)

    graphics.generateTexture('heart', size, size)
    graphics.destroy()
  }

  darkenColor(color: number, amount: number): number {
    const r = Math.max(0, ((color >> 16) & 0xff) * (1 - amount))
    const g = Math.max(0, ((color >> 8) & 0xff) * (1 - amount))
    const b = Math.max(0, (color & 0xff) * (1 - amount))
    return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b)
  }

  create() {
    // Transition to game scene
    this.scene.start('GameScene')
  }
}
