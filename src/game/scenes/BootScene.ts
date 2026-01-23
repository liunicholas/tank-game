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

    // Generate particle textures for effects
    this.generateParticleTextures()
  }

  generateTankSprite(key: string, color: string) {
    const size = 24 // Increased from 16 for more detail
    const graphics = this.make.graphics({ x: 0, y: 0 })

    // Parse hex color
    const hexColor = parseInt(color.replace('#', ''), 16)
    const darkerColor = this.darkenColor(hexColor, 0.3)
    const lighterColor = this.lightenColor(hexColor, 0.2)

    // Tank body (main rectangle with rounded feel)
    graphics.fillStyle(hexColor, 1)
    graphics.fillRect(4, 6, 16, 14)

    // Body highlight (top edge)
    graphics.fillStyle(lighterColor, 1)
    graphics.fillRect(4, 6, 16, 2)

    // Body shadow (bottom edge)
    graphics.fillStyle(darkerColor, 1)
    graphics.fillRect(4, 18, 16, 2)

    // Tank turret/cannon
    graphics.fillStyle(hexColor, 1)
    graphics.fillRect(9, 0, 6, 10)

    // Turret highlight
    graphics.fillStyle(lighterColor, 1)
    graphics.fillRect(9, 0, 6, 2)

    // Tank tracks (darker shade with tread pattern)
    graphics.fillStyle(darkerColor, 1)
    graphics.fillRect(0, 6, 4, 14)
    graphics.fillRect(20, 6, 4, 14)

    // Track tread lines
    graphics.fillStyle(this.darkenColor(hexColor, 0.5), 1)
    for (let i = 0; i < 4; i++) {
      graphics.fillRect(0, 7 + i * 4, 4, 1)
      graphics.fillRect(20, 7 + i * 4, 4, 1)
    }

    // Outline in black
    graphics.lineStyle(1, 0x000000, 1)
    graphics.strokeRect(4, 6, 16, 14)
    graphics.strokeRect(9, 0, 6, 10)
    graphics.strokeRect(0, 6, 4, 14)
    graphics.strokeRect(20, 6, 4, 14)

    // Generate texture from graphics
    graphics.generateTexture(key, size, size)
    graphics.destroy()
  }

  generateBulletSprite() {
    const size = 8
    const graphics = this.make.graphics({ x: 0, y: 0 })

    // White bullet with gradient effect
    graphics.fillStyle(0xffffff, 1)
    graphics.fillCircle(4, 4, 3)

    // Inner glow
    graphics.fillStyle(0xffffcc, 1)
    graphics.fillCircle(4, 4, 2)

    graphics.lineStyle(1, 0x000000, 1)
    graphics.strokeCircle(4, 4, 3)

    graphics.generateTexture('bullet', size, size)
    graphics.destroy()
  }

  generateWallTile() {
    const size = 32
    const graphics = this.make.graphics({ x: 0, y: 0 })

    // Base wall color (light gray)
    graphics.fillStyle(0xe8e8e8, 1)
    graphics.fillRect(0, 0, size, size)

    // Brick pattern
    const brickColor = 0xd0d0d0
    const mortarColor = 0xc0c0c0
    const highlightColor = 0xf0f0f0
    const shadowColor = 0xa0a0a0

    // Draw mortar lines
    graphics.fillStyle(mortarColor, 1)
    graphics.fillRect(0, 0, size, 2)
    graphics.fillRect(0, 15, size, 2)

    // Draw bricks with 3D effect
    // Top row
    this.drawBrick(graphics, 0, 2, 15, 13, brickColor, highlightColor, shadowColor)
    this.drawBrick(graphics, 16, 2, 16, 13, brickColor, highlightColor, shadowColor)

    // Bottom row (offset)
    this.drawBrick(graphics, -8, 17, 15, 15, brickColor, highlightColor, shadowColor)
    this.drawBrick(graphics, 8, 17, 15, 15, brickColor, highlightColor, shadowColor)
    this.drawBrick(graphics, 24, 17, 15, 15, brickColor, highlightColor, shadowColor)

    // Border
    graphics.lineStyle(1, 0x888888, 1)
    graphics.strokeRect(0, 0, size, size)

    graphics.generateTexture('wall', size, size)
    graphics.destroy()
  }

  private drawBrick(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    baseColor: number,
    highlightColor: number,
    shadowColor: number
  ) {
    // Main brick
    graphics.fillStyle(baseColor, 1)
    graphics.fillRect(x, y, width, height)

    // Highlight (top and left)
    graphics.fillStyle(highlightColor, 1)
    graphics.fillRect(x, y, width, 1)
    graphics.fillRect(x, y, 1, height)

    // Shadow (bottom and right)
    graphics.fillStyle(shadowColor, 1)
    graphics.fillRect(x, y + height - 1, width, 1)
    graphics.fillRect(x + width - 1, y, 1, height)
  }

  generateFloorTile() {
    const size = 32
    const graphics = this.make.graphics({ x: 0, y: 0 })

    // Dark floor base
    graphics.fillStyle(0x1a1a2e, 1)
    graphics.fillRect(0, 0, size, size)

    // Subtle tile pattern
    graphics.fillStyle(0x1f1f35, 1)
    graphics.fillRect(0, 0, 16, 16)
    graphics.fillRect(16, 16, 16, 16)

    // Very subtle grid lines
    graphics.lineStyle(1, 0x252540, 0.5)
    graphics.strokeRect(0, 0, size, size)
    graphics.lineBetween(16, 0, 16, size)
    graphics.lineBetween(0, 16, size, 16)

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

    // Highlight
    graphics.fillStyle(0xff6666, 1)
    graphics.fillRect(3, 3, 1, 1)

    graphics.generateTexture('heart', size, size)
    graphics.destroy()
  }

  generateParticleTextures() {
    // Explosion particle (orange/yellow)
    const explosionSize = 8
    const explosionGraphics = this.make.graphics({ x: 0, y: 0 })
    explosionGraphics.fillStyle(0xff6600, 1)
    explosionGraphics.fillCircle(4, 4, 4)
    explosionGraphics.fillStyle(0xffcc00, 1)
    explosionGraphics.fillCircle(4, 4, 2)
    explosionGraphics.generateTexture('particle_explosion', explosionSize, explosionSize)
    explosionGraphics.destroy()

    // Smoke particle (gray)
    const smokeSize = 6
    const smokeGraphics = this.make.graphics({ x: 0, y: 0 })
    smokeGraphics.fillStyle(0x666666, 0.8)
    smokeGraphics.fillCircle(3, 3, 3)
    smokeGraphics.generateTexture('particle_smoke', smokeSize, smokeSize)
    smokeGraphics.destroy()

    // Spark particle (white/yellow)
    const sparkSize = 4
    const sparkGraphics = this.make.graphics({ x: 0, y: 0 })
    sparkGraphics.fillStyle(0xffffcc, 1)
    sparkGraphics.fillRect(1, 0, 2, 4)
    sparkGraphics.fillRect(0, 1, 4, 2)
    sparkGraphics.generateTexture('particle_spark', sparkSize, sparkSize)
    sparkGraphics.destroy()

    // Debris particle (brown)
    const debrisSize = 4
    const debrisGraphics = this.make.graphics({ x: 0, y: 0 })
    debrisGraphics.fillStyle(0x8b4513, 1)
    debrisGraphics.fillRect(0, 0, 4, 4)
    debrisGraphics.generateTexture('particle_debris', debrisSize, debrisSize)
    debrisGraphics.destroy()

    // Muzzle flash
    const flashSize = 16
    const flashGraphics = this.make.graphics({ x: 0, y: 0 })
    flashGraphics.fillStyle(0xffff00, 1)
    flashGraphics.fillCircle(8, 8, 8)
    flashGraphics.fillStyle(0xffffff, 1)
    flashGraphics.fillCircle(8, 8, 4)
    flashGraphics.generateTexture('muzzle_flash', flashSize, flashSize)
    flashGraphics.destroy()
  }

  darkenColor(color: number, amount: number): number {
    const r = Math.max(0, ((color >> 16) & 0xff) * (1 - amount))
    const g = Math.max(0, ((color >> 8) & 0xff) * (1 - amount))
    const b = Math.max(0, (color & 0xff) * (1 - amount))
    return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b)
  }

  lightenColor(color: number, amount: number): number {
    const r = Math.min(255, ((color >> 16) & 0xff) * (1 + amount))
    const g = Math.min(255, ((color >> 8) & 0xff) * (1 + amount))
    const b = Math.min(255, (color & 0xff) * (1 + amount))
    return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b)
  }

  create() {
    // Check if we should go to a specific scene
    const initialScene = this.registry.get('initialScene') as string
    const initialData = this.registry.get('initialData') as object

    if (initialScene && initialScene !== 'BootScene') {
      this.scene.start(initialScene, initialData)
    } else {
      // Default: transition to game scene
      this.scene.start('GameScene')
    }
  }
}
