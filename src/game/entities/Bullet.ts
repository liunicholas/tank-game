import Phaser from 'phaser'
import { BULLET_SIZE } from '../config'

export class Bullet {
  public sprite: Phaser.Physics.Arcade.Sprite
  private scene: Phaser.Scene
  private id: string
  private ownerId: string

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
    this.sprite.setScale(1)
    this.sprite.setSize(BULLET_SIZE, BULLET_SIZE)
    this.sprite.setData('bulletId', id)
    this.sprite.setData('ownerId', ownerId)
  }

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y)
  }

  update(delta: number) {
    // Bullets are server-controlled, no local update needed
  }

  destroy() {
    // Play destruction effect
    const particles = this.scene.add.circle(this.sprite.x, this.sprite.y, 4, 0xffffff)
    this.scene.tweens.add({
      targets: particles,
      alpha: 0,
      scale: 2,
      duration: 150,
      onComplete: () => particles.destroy(),
    })

    this.sprite.destroy()
  }

  getId(): string {
    return this.id
  }

  getOwnerId(): string {
    return this.ownerId
  }
}
