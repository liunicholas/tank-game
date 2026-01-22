import PartySocket from 'partysocket'
import { ClientMessage, ServerMessage, GameState, PlayerInput } from '../types/game'

type ConnectCallback = () => void
type ErrorCallback = (error: Error) => void
type PlayersUpdateCallback = (players: { id: string; name: string; color: string }[]) => void
type PlayerIdCallback = (id: string) => void
type GameStartCallback = () => void
type StateUpdateCallback = (state: GameState) => void
type PlayerHitCallback = (targetId: string, livesRemaining: number) => void
type PlayerEliminatedCallback = (playerId: string) => void
type GameOverCallback = (winnerId: string, winnerName: string) => void

export class GameClient {
  private socket: PartySocket | null = null
  private roomId: string

  private onConnectCallback: ConnectCallback | null = null
  private onErrorCallback: ErrorCallback | null = null
  private onPlayersUpdateCallback: PlayersUpdateCallback | null = null
  private onPlayerIdCallback: PlayerIdCallback | null = null
  private onGameStartCallback: GameStartCallback | null = null
  private onStateUpdateCallback: StateUpdateCallback | null = null
  private onPlayerHitCallback: PlayerHitCallback | null = null
  private onPlayerEliminatedCallback: PlayerEliminatedCallback | null = null
  private onGameOverCallback: GameOverCallback | null = null

  constructor(roomId: string) {
    this.roomId = roomId
  }

  connect() {
    // Connect to PartyKit server
    // In development, this will be localhost:1999
    // In production, this will be your PartyKit deployment URL
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999'

    this.socket = new PartySocket({
      host,
      room: this.roomId,
    })

    this.socket.addEventListener('open', () => {
      this.onConnectCallback?.()
    })

    this.socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage
        this.handleMessage(message)
      } catch (e) {
        console.error('Failed to parse message:', e)
      }
    })

    this.socket.addEventListener('error', (event) => {
      this.onErrorCallback?.(new Error('WebSocket error'))
    })

    this.socket.addEventListener('close', () => {
      console.log('Connection closed')
    })
  }

  private handleMessage(message: ServerMessage) {
    switch (message.type) {
      case 'player_id':
        this.onPlayerIdCallback?.(message.id)
        break

      case 'players_update':
        this.onPlayersUpdateCallback?.(message.players)
        break

      case 'game_start':
        this.onGameStartCallback?.()
        if (message.state) {
          this.onStateUpdateCallback?.(message.state)
        }
        break

      case 'state_update':
        this.onStateUpdateCallback?.(message.state)
        break

      case 'player_hit':
        this.onPlayerHitCallback?.(message.targetId, message.livesRemaining)
        break

      case 'player_eliminated':
        this.onPlayerEliminatedCallback?.(message.playerId)
        break

      case 'game_over':
        this.onGameOverCallback?.(message.winnerId, message.winnerName)
        break

      case 'error':
        this.onErrorCallback?.(new Error(message.message))
        break
    }
  }

  private send(message: ClientMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    }
  }

  // Public methods for sending messages
  sendJoin(name: string, isHost: boolean) {
    this.send({ type: 'join', name, isHost })
  }

  sendInput(input: PlayerInput) {
    this.send(input)
  }

  sendStartGame() {
    this.send({ type: 'start_game' })
  }

  disconnect() {
    this.socket?.close()
    this.socket = null
  }

  // Event listener setters
  onConnect(callback: ConnectCallback) {
    this.onConnectCallback = callback
  }

  onError(callback: ErrorCallback) {
    this.onErrorCallback = callback
  }

  onPlayersUpdate(callback: PlayersUpdateCallback) {
    this.onPlayersUpdateCallback = callback
  }

  onPlayerIdAssigned(callback: PlayerIdCallback) {
    this.onPlayerIdCallback = callback
  }

  onGameStart(callback: GameStartCallback) {
    this.onGameStartCallback = callback
  }

  onStateUpdate(callback: StateUpdateCallback) {
    this.onStateUpdateCallback = callback
  }

  onPlayerHit(callback: PlayerHitCallback) {
    this.onPlayerHitCallback = callback
  }

  onPlayerEliminated(callback: PlayerEliminatedCallback) {
    this.onPlayerEliminatedCallback = callback
  }

  onGameOver(callback: GameOverCallback) {
    this.onGameOverCallback = callback
  }
}
