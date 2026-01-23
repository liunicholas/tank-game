import { TANK_SPEED, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from '../config'
import { PlayerInput } from '../types/game'
import { InputBuffer, PendingInput } from './InputBuffer'

// Map collision data (same as server)
const MAP_TILES = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,1,1,1,1,1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,0,0,1,1,1,1,1,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,1,1,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0,0,0,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,0,0,1,1,1,0,0,1,0,0,0,0,0,2,0,0,0,0,1,0,0,1,1,1,0,0,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,1,0,0,0,1,1,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,1,1,1,1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,0,0,1,1,1,1,1,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

export interface Position {
  x: number
  y: number
  rotation: number
}

export class PredictionSystem {
  private inputBuffer: InputBuffer

  constructor(inputBuffer: InputBuffer) {
    this.inputBuffer = inputBuffer
  }

  predictPosition(
    currentPosition: Position,
    input: { dx: number; dy: number; rotation: number },
    deltaTime: number
  ): Position {
    // Normalize movement
    const magnitude = Math.sqrt(input.dx * input.dx + input.dy * input.dy)
    let velocityX = 0
    let velocityY = 0

    if (magnitude > 0) {
      velocityX = (input.dx / magnitude) * TANK_SPEED
      velocityY = (input.dy / magnitude) * TANK_SPEED
    }

    // Calculate new position
    let newX = currentPosition.x + velocityX * deltaTime
    let newY = currentPosition.y + velocityY * deltaTime

    // Check wall collision
    if (!this.collidesWithWall(newX, newY, 12)) {
      // Apply position
    } else {
      // Blocked by wall, keep old position
      newX = currentPosition.x
      newY = currentPosition.y
    }

    // Clamp to bounds
    newX = Math.max(TILE_SIZE + 12, Math.min(MAP_WIDTH * TILE_SIZE - TILE_SIZE - 12, newX))
    newY = Math.max(TILE_SIZE + 12, Math.min(MAP_HEIGHT * TILE_SIZE - TILE_SIZE - 12, newY))

    return {
      x: newX,
      y: newY,
      rotation: magnitude > 0 ? input.rotation : currentPosition.rotation,
    }
  }

  reconcile(
    serverPosition: Position,
    serverAckSeq: number
  ): Position {
    // Acknowledge server-confirmed inputs
    this.inputBuffer.acknowledgeInput(serverAckSeq)

    // Get unacknowledged inputs (those the server hasn't processed yet)
    const unacknowledgedInputs = this.inputBuffer.getUnacknowledgedInputs()

    if (unacknowledgedInputs.length === 0) {
      // No pending inputs, use server position directly
      return serverPosition
    }

    // Re-apply unacknowledged inputs starting from server position
    return this.replayInputs(serverPosition, unacknowledgedInputs)
  }

  replayInputs(startPosition: Position, inputs: PendingInput[]): Position {
    let position = { ...startPosition }
    const tickInterval = 1000 / 20 // Match server tick rate
    const deltaTime = tickInterval / 1000

    for (const pendingInput of inputs) {
      const input = pendingInput.input
      position = this.predictPosition(
        position,
        { dx: input.dx, dy: input.dy, rotation: input.rotation },
        deltaTime
      )
    }

    return position
  }

  shouldCorrect(
    predictedPosition: Position,
    serverPosition: Position,
    threshold: number = 5
  ): boolean {
    const dx = predictedPosition.x - serverPosition.x
    const dy = predictedPosition.y - serverPosition.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance > threshold
  }

  smoothCorrection(
    currentPosition: Position,
    targetPosition: Position,
    lerpFactor: number = 0.3
  ): Position {
    return {
      x: currentPosition.x + (targetPosition.x - currentPosition.x) * lerpFactor,
      y: currentPosition.y + (targetPosition.y - currentPosition.y) * lerpFactor,
      rotation: this.lerpAngle(currentPosition.rotation, targetPosition.rotation, lerpFactor),
    }
  }

  private lerpAngle(start: number, end: number, factor: number): number {
    // Handle angle wrapping
    let diff = end - start
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    return start + diff * factor
  }

  private collidesWithWall(x: number, y: number, radius: number): boolean {
    const tileX = Math.floor(x / TILE_SIZE)
    const tileY = Math.floor(y / TILE_SIZE)

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const checkX = tileX + dx
        const checkY = tileY + dy

        if (checkX < 0 || checkX >= MAP_WIDTH || checkY < 0 || checkY >= MAP_HEIGHT) {
          continue
        }

        if (MAP_TILES[checkY][checkX] === 1) {
          const tileLeft = checkX * TILE_SIZE
          const tileRight = (checkX + 1) * TILE_SIZE
          const tileTop = checkY * TILE_SIZE
          const tileBottom = (checkY + 1) * TILE_SIZE

          const closestX = Math.max(tileLeft, Math.min(x, tileRight))
          const closestY = Math.max(tileTop, Math.min(y, tileBottom))

          const distX = x - closestX
          const distY = y - closestY
          const distSquared = distX * distX + distY * distY

          if (distSquared < radius * radius) {
            return true
          }
        }
      }
    }

    return false
  }
}
