import Phaser from 'phaser'

interface KillEntry {
  container: Phaser.GameObjects.Container
  timestamp: number
}

export class KillFeed {
  private scene: Phaser.Scene
  private entries: KillEntry[] = []
  private maxEntries: number = 5
  private entryDuration: number = 4000
  private x: number
  private y: number

  constructor(scene: Phaser.Scene, x: number = 20, y: number = 70) {
    this.scene = scene
    this.x = x
    this.y = y
  }

  addKill(killerName: string, killerColor: string, victimName: string, victimColor: string) {
    // Create kill entry container
    const container = this.scene.add.container(this.x - 200, this.y + this.entries.length * 30)
    container.setDepth(1000)
    container.setAlpha(0)

    // Background
    const bg = this.scene.add.rectangle(0, 0, 220, 24, 0x000000, 0.7)
    bg.setOrigin(0, 0.5)
    container.add(bg)

    // Killer name
    const killerText = this.scene.add.text(8, 0, killerName, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: killerColor,
    })
    killerText.setOrigin(0, 0.5)
    container.add(killerText)

    // Skull icon (text-based for simplicity)
    const skullText = this.scene.add.text(killerText.x + killerText.width + 8, 0, '>', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ff4444',
    })
    skullText.setOrigin(0, 0.5)
    container.add(skullText)

    // Victim name
    const victimText = this.scene.add.text(skullText.x + skullText.width + 8, 0, victimName, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: victimColor,
    })
    victimText.setOrigin(0, 0.5)
    container.add(victimText)

    // Slide in animation
    this.scene.tweens.add({
      targets: container,
      x: this.x,
      alpha: 1,
      duration: 200,
      ease: 'Power2',
    })

    // Add to entries
    this.entries.push({
      container,
      timestamp: Date.now(),
    })

    // Remove oldest if over limit
    if (this.entries.length > this.maxEntries) {
      const oldest = this.entries.shift()
      if (oldest) {
        this.fadeOut(oldest.container)
      }
    }

    // Reposition existing entries
    this.repositionEntries()
  }

  addElimination(killerName: string, killerColor: string, victimName: string, victimColor: string) {
    // Create elimination entry (more prominent)
    const container = this.scene.add.container(this.x - 250, this.y + this.entries.length * 30)
    container.setDepth(1000)
    container.setAlpha(0)

    // Background (red tinted for elimination)
    const bg = this.scene.add.rectangle(0, 0, 260, 28, 0x440000, 0.85)
    bg.setOrigin(0, 0.5)
    bg.setStrokeStyle(1, 0xff4444)
    container.add(bg)

    // Killer name
    const killerText = this.scene.add.text(8, 0, killerName, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: killerColor,
    })
    killerText.setOrigin(0, 0.5)
    container.add(killerText)

    // Eliminated text
    const eliminatedText = this.scene.add.text(killerText.x + killerText.width + 8, 0, 'ELIMINATED', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#ff6666',
    })
    eliminatedText.setOrigin(0, 0.5)
    container.add(eliminatedText)

    // Victim name
    const victimText = this.scene.add.text(eliminatedText.x + eliminatedText.width + 8, 0, victimName, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: victimColor,
    })
    victimText.setOrigin(0, 0.5)
    container.add(victimText)

    // Slide in animation
    this.scene.tweens.add({
      targets: container,
      x: this.x,
      alpha: 1,
      duration: 200,
      ease: 'Power2',
    })

    // Add to entries
    this.entries.push({
      container,
      timestamp: Date.now(),
    })

    // Remove oldest if over limit
    if (this.entries.length > this.maxEntries) {
      const oldest = this.entries.shift()
      if (oldest) {
        this.fadeOut(oldest.container)
      }
    }

    // Reposition existing entries
    this.repositionEntries()
  }

  private repositionEntries() {
    this.entries.forEach((entry, index) => {
      this.scene.tweens.add({
        targets: entry.container,
        y: this.y + index * 30,
        duration: 150,
        ease: 'Power2',
      })
    })
  }

  private fadeOut(container: Phaser.GameObjects.Container) {
    this.scene.tweens.add({
      targets: container,
      x: this.x - 200,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => container.destroy(),
    })
  }

  update() {
    const now = Date.now()
    const expiredEntries: KillEntry[] = []

    this.entries.forEach((entry) => {
      if (now - entry.timestamp > this.entryDuration) {
        expiredEntries.push(entry)
      }
    })

    expiredEntries.forEach((entry) => {
      const index = this.entries.indexOf(entry)
      if (index !== -1) {
        this.entries.splice(index, 1)
        this.fadeOut(entry.container)
      }
    })

    if (expiredEntries.length > 0) {
      this.repositionEntries()
    }
  }

  destroy() {
    this.entries.forEach((entry) => entry.container.destroy())
    this.entries = []
  }
}
