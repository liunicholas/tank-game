import Phaser from 'phaser'
import { RoundResults, PlayerStats } from '../types/game'
import { GameClient } from '../network/GameClient'

interface ResultsData {
  results: RoundResults
  playerId: string
  players: { id: string; name: string; color: string; isReady: boolean }[]
}

export class ResultsScene extends Phaser.Scene {
  private client!: GameClient
  private playerId!: string
  private results!: RoundResults
  private players!: { id: string; name: string; color: string; isReady: boolean }[]
  private readyButton!: Phaser.GameObjects.Container
  private isReady: boolean = false
  private playerReadyIndicators: Map<string, Phaser.GameObjects.Image> = new Map()
  private leaveButton!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'ResultsScene' })
  }

  create(data: ResultsData) {
    this.results = data.results
    this.playerId = data.playerId
    this.players = data.players
    this.isReady = false

    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Background overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.95)

    // Title
    const isWinner = this.results.winnerId === this.playerId
    const titleText = isWinner ? 'VICTORY!' : 'ROUND OVER'
    const titleColor = isWinner ? '#baffc9' : '#ffb3ba'

    this.add.text(width / 2, 60, titleText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: titleColor,
    }).setOrigin(0.5)

    // Round number
    this.add.text(width / 2, 100, `ROUND ${this.results.round}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#666666',
    }).setOrigin(0.5)

    // Winner announcement
    this.add.text(width / 2, 140, `WINNER: ${this.results.winnerName}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffba',
    }).setOrigin(0.5)

    // Scoreboard
    this.createScoreboard(width, height)

    // Ready button
    this.createReadyButton(width, height)

    // Leave button
    this.createLeaveButton(width, height)

    // Connect to server for ready updates
    this.setupNetworkConnection()
  }

  private createScoreboard(width: number, height: number) {
    const startY = 200
    const rowHeight = 50

    // Header
    this.add.text(width / 2 - 250, startY, 'PLAYER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#666666',
    })
    this.add.text(width / 2 - 50, startY, 'KILLS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#666666',
    })
    this.add.text(width / 2 + 50, startY, 'DEATHS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#666666',
    })
    this.add.text(width / 2 + 150, startY, 'WINS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#666666',
    })
    this.add.text(width / 2 + 230, startY, 'READY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#666666',
    })

    // Sort players by wins, then kills
    const sortedPlayers = [...this.players].sort((a, b) => {
      const statsA = this.results.playerStats[a.id] || { kills: 0, deaths: 0, wins: 0 }
      const statsB = this.results.playerStats[b.id] || { kills: 0, deaths: 0, wins: 0 }
      if (statsB.wins !== statsA.wins) return statsB.wins - statsA.wins
      return statsB.kills - statsA.kills
    })

    // Player rows
    sortedPlayers.forEach((player, index) => {
      const y = startY + 40 + index * rowHeight
      const stats = this.results.playerStats[player.id] || { kills: 0, deaths: 0, wins: 0 }
      const isCurrentPlayer = player.id === this.playerId
      const isWinner = player.id === this.results.winnerId

      // Background highlight for winner
      if (isWinner) {
        this.add.rectangle(width / 2, y + 10, 550, rowHeight - 5, 0xbaffc9, 0.15)
      }

      // Player color indicator
      const colorBox = this.add.rectangle(width / 2 - 280, y + 10, 20, 20, parseInt(player.color.replace('#', ''), 16))
      colorBox.setStrokeStyle(2, 0xffffff)

      // Player name
      const nameColor = isCurrentPlayer ? '#bae1ff' : '#ffffff'
      this.add.text(width / 2 - 250, y, player.name + (isWinner ? ' *' : ''), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: nameColor,
      })

      // Stats
      this.add.text(width / 2 - 40, y, String(stats.kills), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#baffc9',
      })
      this.add.text(width / 2 + 60, y, String(stats.deaths), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#ffb3ba',
      })
      this.add.text(width / 2 + 160, y, String(stats.wins), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#ffffba',
      })

      // Ready indicator
      const readyIndicator = this.add.image(width / 2 + 240, y + 10, 'heart')
      readyIndicator.setVisible(player.isReady)
      readyIndicator.setTint(0x00ff00)
      this.playerReadyIndicators.set(player.id, readyIndicator)
    })
  }

  private createReadyButton(width: number, height: number) {
    const buttonY = height - 120

    // Button background
    const buttonBg = this.add.rectangle(0, 0, 200, 50, 0x333333)
    buttonBg.setStrokeStyle(3, 0xffffff)

    // Button text
    const buttonText = this.add.text(0, 0, 'READY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5)

    // Create container
    this.readyButton = this.add.container(width / 2, buttonY, [buttonBg, buttonText])
    this.readyButton.setSize(200, 50)
    this.readyButton.setInteractive({ useHandCursor: true })

    this.readyButton.on('pointerover', () => {
      buttonBg.setFillStyle(0x444444)
    })

    this.readyButton.on('pointerout', () => {
      buttonBg.setFillStyle(this.isReady ? 0x2d5a2d : 0x333333)
    })

    this.readyButton.on('pointerdown', () => {
      this.toggleReady()
    })
  }

  private createLeaveButton(width: number, height: number) {
    const buttonY = height - 60

    // Button background
    const buttonBg = this.add.rectangle(0, 0, 200, 40, 0x5a2d2d)
    buttonBg.setStrokeStyle(2, 0xff6666)

    // Button text
    const buttonText = this.add.text(0, 0, 'LEAVE GAME', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ff6666',
    }).setOrigin(0.5)

    // Create container
    this.leaveButton = this.add.container(width / 2, buttonY, [buttonBg, buttonText])
    this.leaveButton.setSize(200, 40)
    this.leaveButton.setInteractive({ useHandCursor: true })

    this.leaveButton.on('pointerover', () => {
      buttonBg.setFillStyle(0x6a3d3d)
    })

    this.leaveButton.on('pointerout', () => {
      buttonBg.setFillStyle(0x5a2d2d)
    })

    this.leaveButton.on('pointerdown', () => {
      this.leaveGame()
    })
  }

  private setupNetworkConnection() {
    const roomId = this.registry.get('roomId') as string
    this.client = new GameClient(roomId)

    this.client.onConnect(() => {
      const playerName = this.registry.get('playerName') as string
      this.client.sendJoin(playerName, false)
    })

    this.client.onReadyStatusUpdate((playerId: string, isReady: boolean) => {
      const indicator = this.playerReadyIndicators.get(playerId)
      if (indicator) {
        indicator.setVisible(isReady)
      }

      // Update local player state
      if (playerId === this.playerId) {
        this.isReady = isReady
        this.updateReadyButton()
      }
    })

    this.client.onCountdown((count: number) => {
      // Transition to countdown scene
      this.client.disconnect()
      this.scene.start('CountdownScene', { count })
    })

    this.client.onGameStart(() => {
      // Transition directly to game if countdown was missed
      this.client.disconnect()
      this.scene.start('GameScene')
    })

    this.client.connect()
  }

  private toggleReady() {
    this.client.sendToggleReady()
    this.isReady = !this.isReady
    this.updateReadyButton()

    // Update own indicator
    const indicator = this.playerReadyIndicators.get(this.playerId)
    if (indicator) {
      indicator.setVisible(this.isReady)
    }
  }

  private updateReadyButton() {
    const buttonBg = this.readyButton.getAt(0) as Phaser.GameObjects.Rectangle
    const buttonText = this.readyButton.getAt(1) as Phaser.GameObjects.Text

    if (this.isReady) {
      buttonBg.setFillStyle(0x2d5a2d)
      buttonBg.setStrokeStyle(3, 0x00ff00)
      buttonText.setText('READY!')
      buttonText.setColor('#00ff00')
    } else {
      buttonBg.setFillStyle(0x333333)
      buttonBg.setStrokeStyle(3, 0xffffff)
      buttonText.setText('READY')
      buttonText.setColor('#ffffff')
    }
  }

  private leaveGame() {
    this.client.sendReturnToLobby()
    this.client.disconnect()
    window.location.href = '/'
  }

  shutdown() {
    if (this.client) {
      this.client.disconnect()
    }
  }
}
