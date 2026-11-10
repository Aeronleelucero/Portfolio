import { Vector3 } from 'three'

/**
 * Per-frame runtime values computed by the CameraController and consumed by
 * other scene components (e.g. lights that follow the camera's focus point).
 */
export const runtime = {
  focus: new Vector3(), // point the camera is looking at
  motion: 1, // 0 when reduced motion is requested, 1 otherwise
}
