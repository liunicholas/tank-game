import Phaser from 'phaser'
import { BULLET_SIZE } from '../config'

export class Bullet {
  public sprite: Phaser.Physics.Arcade.Sprite
  private scene: Phaser.Scene
  private id: string
  private ownerId: string
  private lastTrailTime: number = 0
  private trailInterval: number = 30 // ms between trail particles

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    ownerId: string
  ) {
    this.scene = scene
    this.id = id
    this.ownerId = ownerId

    // Create bullet sprite
    this.sprite = scene.physics.add.sprite(x, y, 'bullet')
    this.sprite.setScale(1.2)
    this.sprite.setSize(BULLET_SIZE, BULLET_SIZE)
    this.sprite.setData('bulletId', id)
    this.sprite.setData('ownerId', ownerId)

    // Add slight glow effect
    this.sprite.setBlendMode(Phaser.BlendModes.ADD)
  }

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y)
  }

  update(delta: number) {
    // Create trail effect at intervals
    const now = Date.now()
    if (now - this.lastTrailTime > this.trailInterval) {
      this.createTrail()
      this.lastTrailTime = now
    }
  }

  private createTrail() {
    // Create small smoke puff behind bullet
    const trail = this.scene.add.circle(this.sprite.x, this.sprite.y, 2, 0x888888)
    trail.setAlpha(0.4)

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 1.5,
      duration: 150,
      onComplete: () => trail.destroy(),
    })
  }

  destroy() {
    // Play destruction effect
    const x = this.sprite.x
    const y = this.sprite.y

    // Small burst of particles
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 15 + Math.random() * 25
      const particle = this.scene.add.circle(x, y, 2, 0xffffff)
      particle.setAlpha(0.8)

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.5,
        duration: 100 + Math.random() * 50,
        onComplete: () => particle.destroy(),
      })
    }

    this.sprite.destroy()
  }

  getId(): string {
    return this.id
  }

  getOwnerId(): string {
    return this.ownerId
  }
}
