// Level definitions: five original scenes, each with its own set of
// deliberate differences. A difference is a small region of the picture —
// a colour, a count, a missing object, a moved hand — with a hit circle
// (x, y, r) in panel coordinates (580 x 540). The label is shown when the
// difference is found, so the player learns what they spotted.
export const LEVELS = [
  {
    id: 'market',
    scene: 'market',
    seed: 101,
    name: 'Lantern Market',
    subtitle: 'A night stall under paper lanterns',
    timeLimit: 120,
    differences: [
      { id: 'lanternColor', label: 'A lantern turned teal', x: 288, y: 128, r: 34 },
      { id: 'moonStar', label: 'A new star by the moon', x: 424, y: 52, r: 26 },
      { id: 'catMissing', label: 'The stall cat vanished', x: 96, y: 400, r: 36 },
      { id: 'jarMissing', label: 'A jar of sweets is gone', x: 296, y: 395, r: 32 },
      { id: 'awningStripe', label: 'An awning stripe turned teal', x: 155, y: 37, r: 30 },
    ],
  },
  {
    id: 'harbour',
    scene: 'harbour',
    seed: 202,
    name: 'Harbour at Dawn',
    subtitle: 'Sunrise over the pier',
    timeLimit: 110,
    differences: [
      { id: 'sunRays', label: 'The sun lost three rays', x: 432, y: 128, r: 46 },
      { id: 'lighthouseBeam', label: 'The lighthouse beam switched on', x: 455, y: 187, r: 40 },
      { id: 'gullMissing', label: 'A gull flew away', x: 250, y: 102, r: 26 },
      { id: 'buoyColor', label: 'The buoy turned green', x: 180, y: 378, r: 30 },
      { id: 'crateExtra', label: 'A third crate appeared', x: 100, y: 402, r: 30 },
      { id: 'flagColor', label: 'The boat flag turned blue', x: 343, y: 307, r: 26 },
    ],
  },
  {
    id: 'study',
    scene: 'study',
    seed: 303,
    name: "The Clockmaker's Study",
    subtitle: 'Gears, books and a sleeping cat',
    timeLimit: 100,
    differences: [
      { id: 'clockHands', label: 'The clock hands moved', x: 290, y: 150, r: 70 },
      { id: 'gearColor', label: 'A gear turned green', x: 152, y: 196, r: 30 },
      { id: 'bookColor', label: 'The top book turned gold', x: 440, y: 335, r: 32 },
      { id: 'lampFlame', label: 'The lamp went out', x: 120, y: 306, r: 28 },
      { id: 'catTail', label: 'The cat lowered its tail', x: 528, y: 345, r: 30 },
      { id: 'windowMoon', label: 'The moon became a star', x: 492, y: 104, r: 30 },
      { id: 'mugMissing', label: 'The red mug is gone', x: 240, y: 361, r: 28 },
    ],
  },
  {
    id: 'garden',
    scene: 'garden',
    seed: 404,
    name: 'Moonlit Garden',
    subtitle: 'Fireflies over the pond',
    timeLimit: 95,
    differences: [
      { id: 'frogMissing', label: 'The frog hopped away', x: 400, y: 428, r: 30 },
      { id: 'flowerColor', label: 'A tulip turned orange', x: 260, y: 494, r: 28 },
      { id: 'fireflyCount', label: 'Two fireflies went dark', x: 480, y: 240, r: 28 },
      { id: 'plankMissing', label: 'A bridge plank is gone', x: 324, y: 424, r: 26 },
      { id: 'lanternLit', label: 'The stone lantern went dark', x: 122, y: 372, r: 30 },
      { id: 'branchMissing', label: 'A tree branch is gone', x: 150, y: 240, r: 30 },
      { id: 'mushroomExtra', label: 'A mushroom sprouted', x: 88, y: 500, r: 26 },
      { id: 'rippleMissing', label: 'The pond ripples faded', x: 452, y: 462, r: 28 },
    ],
  },
  {
    id: 'railway',
    scene: 'railway',
    seed: 505,
    name: 'Starlight Railway',
    subtitle: 'The last train from Lumen',
    timeLimit: 90,
    differences: [
      { id: 'signalColor', label: 'The signal turned red', x: 206, y: 368, r: 28 },
      { id: 'windowCount', label: 'A train window is gone', x: 492, y: 344, r: 30 },
      { id: 'suitcaseMissing', label: 'The suitcases vanished', x: 339, y: 461, r: 30 },
      { id: 'towerHands', label: 'The tower clock moved', x: 111, y: 170, r: 40 },
      { id: 'starShape', label: 'A sparkle star went round', x: 478, y: 78, r: 26 },
      { id: 'hatColor', label: 'The conductor hat turned red', x: 289, y: 405, r: 26 },
      { id: 'smokeCount', label: 'A puff of smoke is gone', x: 530, y: 194, r: 26 },
      { id: 'sleeperMissing', label: 'A track sleeper is gone', x: 396, y: 445, r: 26 },
      { id: 'signMoon', label: 'The crescent left the sign', x: 132, y: 242, r: 22 },
    ],
  },
];

/** Total differences across all five levels. */
export const TOTAL_DIFFERENCES = LEVELS.reduce((sum, level) => sum + level.differences.length, 0);
