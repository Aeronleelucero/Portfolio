/**
 * HERD-VISION overlay annotations for /images/herd-vision-cow.png.
 *
 * ONLY fill this in with real output from the HERD-VISION model run on that
 * exact image — never hand-placed or estimated values. While it is `null`,
 * the portfolio shows the original image cleanly with no overlay.
 *
 * Coordinates are normalized to the image (0..1, origin top-left).
 * Keypoint order follows backend/models/pose_schema.py in the herd-vision repo.
 *
 * Shape:
 * {
 *   model: 'NAFAMCO_Cow_Detector_V1',     // model that produced the result
 *   label: 'COW',
 *   confidence: 0.94,                      // detector score for the box
 *   box: [x, y, width, height],            // normalized
 *   keypoints: [[x, y, conf], ...] | null  // 13 points, or null if no pose model
 * }
 *
 * Note: as of this writing the herd-vision repo ships the detector only;
 * pose weights (cow_pose.pt) are not available, so `keypoints` must stay null.
 */
export const herdVisionInference = null

/** Keypoint names and skeleton — mirrors herd-vision backend/models/pose_schema.py. */
export const COW_KEYPOINT_NAMES = [
  'head',
  'neck',
  'withers',
  'mid_back',
  'tail_base',
  'front_left_knee',
  'front_left_hoof',
  'front_right_knee',
  'front_right_hoof',
  'hind_left_hock',
  'hind_left_hoof',
  'hind_right_hock',
  'hind_right_hoof',
]

export const COW_SKELETON = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [2, 5], [5, 6],
  [2, 7], [7, 8],
  [4, 9], [9, 10],
  [4, 11], [11, 12],
]
