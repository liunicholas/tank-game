import Phaser from 'phaser'

interface HUDConfig {
  playerId: string
  playerName: string
  round: number
  totalTime: number
}

export class GameHUD {
  private scene: Phaser.Scene
  private container!: Phaser.GameObjects.Container
  private timerText!: Phaser.GameObjects.Text
  private roundText!: Phaser.GameObjects.Text
  private playerScores: Map<string, { text: Phaser.GameObjects.Text; kills: number }> = new Map()
  private config: HUDConfig

  constructor(scene: Phaser.Scene, config: HUDConfig) {
    this.scene = scene
    this.config = config
    this.create()
  }

  private create() {
    const width = this.scene.cameras.main.width
    const height = this.scene.cameras.main.height

    // Create HUD container
    this.container = this.scene.add.container(0, 0)
    this.container.setDepth(1000) // Always on top

    // Top bar background (semi-transparent)
    const topBar = this.scene.add.rectangle(width / 2, 25, width, 50, 0x000000, 0.6)
    this.container.add(topBar)

    // Round display
    this.roundText = this.scene.add.text(20, 15, `ROUND ${this.config.round}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffba',
    })
    this.container.add(this.roundText)

    // Timer display (center)
    this.timerText = this.scene.add.text(width / 2, 15, '3:00', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    })
    this.timerText.setOrigin(0.5, 0)
    this.container.add(this.timerText)

    // Controls hint (right side)
    const controlsText = this.scene.add.text(width - 20, 15, 'WASD MOVE | SPACE FIRE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#666666',
    })
    controlsText.setOrigin(1, 0)
    this.container.add(controlsText)
  }

  updateTimer(timeRemaining: number) {
    const minutes = Math.floor(timeRemaining / 60000)
    const seconds = Math.floor((timeRemaining % 60000) / 1000)
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
    this.timerText.setText(timeStr)

    // Change color based on time remaining
    if (timeRemaining < 30000) {
      this.timerText.setColor('#ff4444')
      // Pulse effect for low time
      if (!this.timerText.getData('pulsing')) {
        this.timerText.setData('pulsing', true)
        this.scene.tweens.add({
          targets: this.timerText,
          scale: { from: 1, to: 1.2 },
          duration: 500,
          yoyo: true,
          repeat: -1,
        })
      }
    } else if (timeRemaining < 60000) {
      this.timerText.setColor('#ffaa44')
    } else {
      this.timerText.setColor('#ffffff')
    }
  }

  updateRound(round: number) {
    this.config.round = round
    this.roundText.setText(`ROUND ${round}`)
  }

  updatePlayerScore(playerId: string, playerName: string, kills: number, color: string) {
    let scoreEntry = this.playerScores.get(playerId)

    if (!scoreEntry) {
      const width = this.scene.cameras.main.width
      const index = this.playerScores.size
      const y = 60 + index * 25

      const text = this.scene.add.text(width - 20, y, `${playerName}: ${kills}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: color,
      })
      text.setOrigin(1, 0)
      this.container.add(text)

      scoreEntry = { text, kills }
      this.playerScores.set(playerId, scoreEntry)
    }

    if (scoreEntry.kills !== kills) {
      scoreEntry.kills = kills
      scoreEntry.text.setText(`${playerName}: ${kills}`)

      // Animate score update
      this.scene.tweens.add({
        targets: scoreEntry.text,
        scale: { from: 1.3, to: 1 },
        duration: 200,
        ease: 'Power2',
      })
    }
  }

  showMessage(message: string, duration: number = 2000) {
    const width = this.scene.cameras.main.width
    const height = this.scene.cameras.main.height

    const text = this.scene.add.text(width / 2, height / 2 - 100, message, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    })
    text.setOrigin(0.5)
    text.setDepth(1001)

    this.scene.tweens.add({
      targets: text,
      alpha: { from: 1, to: 0 },
      y: text.y - 30,
      delay: duration - 500,
      duration: 500,
      onComplete: () => text.destroy(),
    })
  }

  destroy() {
    this.container.destroy()
  }
}
