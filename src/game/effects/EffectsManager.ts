import Phaser from 'phaser'

export class EffectsManager {
  private scene: Phaser.Scene
  private screenShakeIntensity: number = 0

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  createExplosion(x: number, y: number, scale: number = 1) {
    // Create multiple particle bursts for explosion
    const particleCount = 15 * scale
    const colors = [0xff6600, 0xffcc00, 0xff3300, 0xffffff]

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5
      const speed = 80 + Math.random() * 120
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = 4 + Math.random() * 8

      const particle = this.scene.add.circle(x, y, size, color)
      particle.setAlpha(1)

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed * scale,
        y: y + Math.sin(angle) * speed * scale,
        alpha: 0,
        scale: { from: 1, to: 0.2 },
        duration: 300 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      })
    }

    // Add smoke effect
    for (let i = 0; i < 8; i++) {
      const smokeX = x + (Math.random() - 0.5) * 30
      const smokeY = y + (Math.random() - 0.5) * 30
      const smoke = this.scene.add.circle(smokeX, smokeY, 8 + Math.random() * 8, 0x444444)
      smoke.setAlpha(0.6)

      this.scene.tweens.add({
        targets: smoke,
        y: smokeY - 40,
        alpha: 0,
        scale: 2,
        duration: 500 + Math.random() * 300,
        ease: 'Power1',
        onComplete: () => smoke.destroy(),
      })
    }

    // Add flash
    this.screenFlash(0xffffff, 50)
  }

  createMuzzleFlash(x: number, y: number, rotation: number) {
    // Create muzzle flash at barrel tip
    const angle = rotation - Math.PI / 2
    const offsetX = Math.cos(angle) * 16
    const offsetY = Math.sin(angle) * 16

    const flash = this.scene.add.image(x + offsetX, y + offsetY, 'muzzle_flash')
    flash.setScale(0.8)
    flash.setRotation(rotation)
    flash.setAlpha(0.9)
    flash.setBlendMode(Phaser.BlendModes.ADD)

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.2,
      duration: 80,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    })

    // Add small sparks
    for (let i = 0; i < 4; i++) {
      const sparkAngle = angle + (Math.random() - 0.5) * 0.8
      const sparkSpeed = 40 + Math.random() * 60
      const spark = this.scene.add.rectangle(
        x + offsetX,
        y + offsetY,
        2,
        4,
        0xffff00
      )
      spark.setRotation(sparkAngle + Math.PI / 2)

      this.scene.tweens.add({
        targets: spark,
        x: spark.x + Math.cos(sparkAngle) * sparkSpeed,
        y: spark.y + Math.sin(sparkAngle) * sparkSpeed,
        alpha: 0,
        duration: 100 + Math.random() * 100,
        onComplete: () => spark.destroy(),
      })
    }
  }

  createBulletTrail(x: number, y: number) {
    // Create small smoke puff behind bullet
    const trail = this.scene.add.circle(x, y, 2, 0x888888)
    trail.setAlpha(0.4)

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 1.5,
      duration: 150,
      onComplete: () => trail.destroy(),
    })
  }

  createHitSparks(x: number, y: number) {
    // Create sparks on bullet impact
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 30 + Math.random() * 50
      const spark = this.scene.add.rectangle(x, y, 2, 2, 0xffffff)

      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        duration: 150 + Math.random() * 100,
        ease: 'Power2',
        onComplete: () => spark.destroy(),
      })
    }
  }

  createWallHitEffect(x: number, y: number) {
    // Debris particles
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 20 + Math.random() * 40
      const debris = this.scene.add.rectangle(x, y, 3, 3, 0xaaaaaa)

      this.scene.tweens.add({
        targets: debris,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed + 20,
        alpha: 0,
        rotation: Math.random() * 4,
        duration: 300 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => debris.destroy(),
      })
    }

    // Small dust cloud
    const dust = this.scene.add.circle(x, y, 6, 0x888888)
    dust.setAlpha(0.5)

    this.scene.tweens.add({
      targets: dust,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => dust.destroy(),
    })
  }

  screenShake(intensity: number = 0.01, duration: number = 100) {
    this.scene.cameras.main.shake(duration, intensity)
  }

  screenFlash(color: number = 0xffffff, duration: number = 100) {
    this.scene.cameras.main.flash(duration,
      (color >> 16) & 0xff,
      (color >> 8) & 0xff,
      color & 0xff,
      false
    )
  }

  createDamageIndicator(x: number, y: number, damage: number = 1) {
    const text = this.scene.add.text(x, y, `-${damage}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ff4444',
    })
    text.setOrigin(0.5)

    this.scene.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    })
  }

  createDeathEffect(x: number, y: number, color: string) {
    // Large explosion for death
    this.createExplosion(x, y, 1.5)

    // Add color-tinted ring
    const hexColor = parseInt(color.replace('#', ''), 16)
    const ring = this.scene.add.circle(x, y, 10, hexColor)
    ring.setStrokeStyle(3, hexColor)
    ring.setFillStyle(hexColor, 0.3)

    this.scene.tweens.add({
      targets: ring,
      scale: 4,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => ring.destroy(),
    })

    // Screen shake for death
    this.screenShake(0.02, 200)
  }

  createSpawnEffect(x: number, y: number, color: string) {
    const hexColor = parseInt(color.replace('#', ''), 16)

    // Spawn ring effect
    for (let i = 0; i < 3; i++) {
      const ring = this.scene.add.circle(x, y, 5 + i * 10, hexColor)
      ring.setStrokeStyle(2, hexColor)
      ring.setFillStyle(hexColor, 0)
      ring.setAlpha(0.8 - i * 0.2)

      this.scene.tweens.add({
        targets: ring,
        scale: 3 - i * 0.5,
        alpha: 0,
        delay: i * 100,
        duration: 500,
        ease: 'Power2',
        onComplete: () => ring.destroy(),
      })
    }
  }

  update(delta: number) {
    // Update ongoing effects if needed
  }
}
