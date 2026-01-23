import { PlayerInput } from '../types/game'

export interface PendingInput {
  seq: number
  input: PlayerInput
  predictedPosition: { x: number; y: number; rotation: number }
  timestamp: number
}

export class InputBuffer {
  private pendingInputs: PendingInput[] = []
  private lastAcknowledgedSeq: number = 0

  addInput(input: PlayerInput, predictedPosition: { x: number; y: number; rotation: number }) {
    this.pendingInputs.push({
      seq: input.seq,
      input,
      predictedPosition,
      timestamp: Date.now(),
    })

    // Limit buffer size to prevent memory issues
    if (this.pendingInputs.length > 60) {
      this.pendingInputs.shift()
    }
  }

  acknowledgeInput(ackSeq: number) {
    if (ackSeq <= this.lastAcknowledgedSeq) return

    this.lastAcknowledgedSeq = ackSeq

    // Remove all inputs up to and including the acknowledged sequence
    this.pendingInputs = this.pendingInputs.filter((input) => input.seq > ackSeq)
  }

  getPendingInputs(): PendingInput[] {
    return this.pendingInputs
  }

  getUnacknowledgedInputs(): PendingInput[] {
    return this.pendingInputs.filter((input) => input.seq > this.lastAcknowledgedSeq)
  }

  getInputBySeq(seq: number): PendingInput | undefined {
    return this.pendingInputs.find((input) => input.seq === seq)
  }

  getLastPredictedPosition(): { x: number; y: number; rotation: number } | null {
    if (this.pendingInputs.length === 0) return null
    return this.pendingInputs[this.pendingInputs.length - 1].predictedPosition
  }

  clear() {
    this.pendingInputs = []
    this.lastAcknowledgedSeq = 0
  }

  getLastAcknowledgedSeq(): number {
    return this.lastAcknowledgedSeq
  }

  hasPendingInputs(): boolean {
    return this.pendingInputs.length > 0
  }
}
