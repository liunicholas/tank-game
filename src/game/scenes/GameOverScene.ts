import Phaser from 'phaser'

interface GameOverData {
  winnerId: string
  winnerName: string
  isWinner: boolean
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' })
  }

  create(data: GameOverData) {
    const { winnerName, isWinner } = data
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Background overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)

    // Victory/Defeat text
    const titleText = isWinner ? 'VICTORY!' : 'GAME OVER'
    const titleColor = isWinner ? '#baffc9' : '#ffb3ba'

    this.add.text(width / 2, height / 2 - 60, titleText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: titleColor,
    }).setOrigin(0.5)

    // Winner name
    this.add.text(width / 2, height / 2, `WINNER: ${winnerName}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5)

    // Play again instruction
    this.add.text(width / 2, height / 2 + 80, 'PRESS SPACE TO RETURN TO LOBBY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#666666',
    }).setOrigin(0.5)

    // Blinking effect for instruction
    this.tweens.add({
      targets: this.children.list[this.children.list.length - 1],
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    })

    // Listen for space key
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-SPACE', () => {
        // Navigate back to home page
        window.location.href = '/'
      })
    }
  }
}
