import Phaser from 'phaser'
import { TANK_SPEED, MAX_LIVES, TANK_SIZE } from '../config'
import { EffectsManager } from '../effects/EffectsManager'

export class Tank {
  public sprite: Phaser.Physics.Arcade.Sprite
  public isAlive: boolean = true
  private scene: Phaser.Scene
  private id: string
  private name: string
  private colorIndex: number
  private isLocalPlayer: boolean
  private lives: number = MAX_LIVES
  private livesDisplay: Phaser.GameObjects.Group
  private nameText: Phaser.GameObjects.Text
  private targetX: number = 0
  private targetY: number = 0
  private targetRotation: number = 0
  private isInvulnerable: boolean = false
  private invulnerabilityTween: Phaser.Tweens.Tween | null = null
  private effects: EffectsManager | null = null

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    name: string,
    colorIndex: number,
    isLocalPlayer: boolean,
    effects?: EffectsManager
  ) {
    this.scene = scene
    this.id = id
    this.name = name
    this.colorIndex = colorIndex
    this.isLocalPlayer = isLocalPlayer
    this.targetX = x
    this.targetY = y
    this.effects = effects || null

    // Create tank sprite
    this.sprite = scene.physics.add.sprite(x, y, `tank_${colorIndex}`)
    this.sprite.setScale(1.5) // Adjusted scale for new 24x24 sprites
    this.sprite.setCollideWorldBounds(true)
    this.sprite.setSize(TANK_SIZE, TANK_SIZE)
    this.sprite.setData('tankId', id)

    // Create name text above tank
    this.nameText = scene.add.text(x, y - 35, name.toUpperCase(), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    })
    this.nameText.setOrigin(0.5)
    this.nameText.setDepth(100)

    // Create lives display (hearts)
    this.livesDisplay = scene.add.group()
    this.updateLivesDisplay()

    // Create spawn effect
    if (this.effects) {
      const color = this.getColor()
      this.effects.createSpawnEffect(x, y, color)
    }
  }

  private getColor(): string {
    const TANK_COLORS = [
      '#ffb3ba', '#bae1ff', '#baffc9', '#ffffba',
      '#e0b3ff', '#ffdfba', '#b3ffff', '#ffc9ba',
    ]
    return TANK_COLORS[this.colorIndex % TANK_COLORS.length]
  }

  updateLivesDisplay() {
    // Clear existing hearts
    this.livesDisplay.clear(true, true)

    // Create hearts based on current lives
    const startX = this.sprite.x - ((this.lives - 1) * 8)
    for (let i = 0; i < this.lives; i++) {
      const heart = this.scene.add.image(startX + i * 16, this.sprite.y - 50, 'heart')
      heart.setScale(1)
      heart.setDepth(100)
      this.livesDisplay.add(heart)
    }
  }

  move(dx: number, dy: number, rotation: number) {
    if (!this.isAlive) return

    // Normalize diagonal movement
    const magnitude = Math.sqrt(dx * dx + dy * dy)
    const normalizedDx = magnitude > 0 ? dx / magnitude : 0
    const normalizedDy = magnitude > 0 ? dy / magnitude : 0

    this.sprite.setVelocity(normalizedDx * TANK_SPEED, normalizedDy * TANK_SPEED)
    this.sprite.setRotation(rotation)
  }

  stop() {
    this.sprite.setVelocity(0, 0)
  }

  setTargetPosition(x: number, y: number, rotation: number) {
    this.targetX = x
    this.targetY = y
    this.targetRotation = rotation
  }

  setLives(lives: number) {
    if (this.lives !== lives) {
      const lostLives = this.lives > lives
      this.lives = lives
      this.updateLivesDisplay()

      // Show damage indicator if lost life
      if (lostLives && this.effects) {
        this.effects.createDamageIndicator(this.sprite.x, this.sprite.y - 20, 1)
      }
    }
  }

  setInvulnerable(invulnerable: boolean) {
    if (this.isInvulnerable === invulnerable) return

    this.isInvulnerable = invulnerable

    if (invulnerable) {
      // Start blinking effect
      this.invulnerabilityTween = this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: -1,
      })
    } else {
      // Stop blinking
      if (this.invulnerabilityTween) {
        this.invulnerabilityTween.stop()
        this.invulnerabilityTween = null
      }
      this.sprite.setAlpha(1)
    }
  }

  playHitEffect() {
    // Flash red on hit
    this.sprite.setTint(0xff0000)
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint()
    })

    // Screen shake for local player
    if (this.isLocalPlayer && this.effects) {
      this.effects.screenShake(0.015, 150)
      this.effects.screenFlash(0xff0000, 80)
    }
  }

  eliminate() {
    this.isAlive = false
    this.sprite.setVisible(false)
    this.nameText.setVisible(false)
    this.livesDisplay.setVisible(false)

    // Stop invulnerability effect
    if (this.invulnerabilityTween) {
      this.invulnerabilityTween.stop()
      this.invulnerabilityTween = null
    }
  }

  update(delta: number) {
    if (!this.isAlive) return

    // Interpolate position for non-local players
    if (!this.isLocalPlayer) {
      const lerpFactor = 0.2
      this.sprite.x = Phaser.Math.Linear(this.sprite.x, this.targetX, lerpFactor)
      this.sprite.y = Phaser.Math.Linear(this.sprite.y, this.targetY, lerpFactor)
      this.sprite.rotation = Phaser.Math.Angle.RotateTo(this.sprite.rotation, this.targetRotation, 0.2)
    }

    // Update UI elements position
    this.nameText.setPosition(this.sprite.x, this.sprite.y - 35)

    // Update hearts position
    const hearts = this.livesDisplay.getChildren() as Phaser.GameObjects.Image[]
    const startX = this.sprite.x - ((hearts.length - 1) * 8)
    hearts.forEach((heart, i) => {
      heart.setPosition(startX + i * 16, this.sprite.y - 50)
    })
  }

  destroy() {
    this.sprite.destroy()
    this.nameText.destroy()
    this.livesDisplay.destroy(true)
    if (this.invulnerabilityTween) {
      this.invulnerabilityTween.stop()
    }
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y }
  }

  getRotation(): number {
    return this.sprite.rotation
  }
}
