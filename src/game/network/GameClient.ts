import PartySocket from 'partysocket'
import { ClientMessage, ServerMessage, GameState, PlayerInput, RoundResults } from '../types/game'

type ConnectCallback = () => void
type ErrorCallback = (error: Error) => void
type PlayersUpdateCallback = (players: { id: string; name: string; color: string; isReady: boolean }[]) => void
type PlayerIdCallback = (id: string) => void
type GameStartCallback = () => void
type StateUpdateCallback = (state: GameState, ackSeq?: number) => void
type PlayerHitCallback = (targetId: string, attackerId: string, livesRemaining: number) => void
type PlayerEliminatedCallback = (playerId: string, killerId: string) => void
type GameOverCallback = (winnerId: string, winnerName: string) => void
type CountdownCallback = (count: number) => void
type RoundResultsCallback = (results: RoundResults) => void
type ReadyStatusUpdateCallback = (playerId: string, isReady: boolean) => void

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
  private onCountdownCallback: CountdownCallback | null = null
  private onRoundResultsCallback: RoundResultsCallback | null = null
  private onReadyStatusUpdateCallback: ReadyStatusUpdateCallback | null = null

  constructor(roomId: string) {
    this.roomId = roomId
  }

  connect() {
    // Connect to PartyKit server
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
        this.onStateUpdateCallback?.(message.state, message.ackSeq)
        break

      case 'player_hit':
        this.onPlayerHitCallback?.(message.targetId, message.attackerId, message.livesRemaining)
        break

      case 'player_eliminated':
        this.onPlayerEliminatedCallback?.(message.playerId, message.killerId)
        break

      case 'game_over':
        this.onGameOverCallback?.(message.winnerId, message.winnerName)
        break

      case 'countdown':
        this.onCountdownCallback?.(message.count)
        break

      case 'round_results':
        this.onRoundResultsCallback?.(message.results)
        break

      case 'ready_status_update':
        this.onReadyStatusUpdateCallback?.(message.playerId, message.isReady)
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

  sendToggleReady() {
    this.send({ type: 'toggle_ready' })
  }

  sendReturnToLobby() {
    this.send({ type: 'return_to_lobby' })
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

  onCountdown(callback: CountdownCallback) {
    this.onCountdownCallback = callback
  }

  onRoundResults(callback: RoundResultsCallback) {
    this.onRoundResultsCallback = callback
  }

  onReadyStatusUpdate(callback: ReadyStatusUpdateCallback) {
    this.onReadyStatusUpdateCallback = callback
  }
}
