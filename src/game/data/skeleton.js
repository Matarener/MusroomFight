/**
 * Скелет гриба-бойца: шесть костей, пять слотов и все анимации.
 * Один скелет на всех: внешний вид задают скины (game/art/mushrooms.js).
 */
export const MUSHROOM_SKELETON = {
  "name": "gribnik",
  "mix": 0.12,
  "bones": [
    {
      "name": "root"
    },
    {
      "name": "body",
      "parent": "root"
    },
    {
      "name": "face",
      "parent": "body",
      "y": -46
    },
    {
      "name": "cap",
      "parent": "body",
      "y": -74
    },
    {
      "name": "armL",
      "parent": "body",
      "x": -26,
      "y": -40,
      "rotation": 25
    },
    {
      "name": "armR",
      "parent": "body",
      "x": 26,
      "y": -40,
      "rotation": -25
    }
  ],
  "slots": [
    {
      "name": "armBack",
      "bone": "armL",
      "attachment": "arm"
    },
    {
      "name": "body",
      "bone": "body",
      "attachment": "stem"
    },
    {
      "name": "face",
      "bone": "face",
      "attachment": "eyes_open"
    },
    {
      "name": "cap",
      "bone": "cap",
      "attachment": "cap"
    },
    {
      "name": "armFront",
      "bone": "armR",
      "attachment": "arm"
    }
  ],
  "attachments": {
    "stem": {
      "origin": [0.5, 0.977]
    },
    "cap": {
      "origin": [0.5, 0.846]
    },
    "arm": {
      "origin": [0.5, 0.12]
    },
    "eyes_open": {
      "origin": [0.5, 0.5]
    },
    "eyes_closed": {
      "origin": [0.5, 0.5]
    },
    "eyes_happy": {
      "origin": [0.5, 0.5]
    },
    "eyes_hurt": {
      "origin": [0.5, 0.5]
    },
    "eyes_ko": {
      "origin": [0.5, 0.5]
    }
  },
  "animations": {
    "idle": {
      "duration": 1.6,
      "loop": true,
      "bones": {
        "body": {
          "scaleX": [
            [0, 1],
            [0.8, 1.04, "inOut"],
            [1.6, 1, "inOut"]
          ],
          "scaleY": [
            [0, 1],
            [0.8, 0.95, "inOut"],
            [1.6, 1, "inOut"]
          ]
        },
        "cap": {
          "rotation": [
            [0, 0],
            [0.8, -3, "inOut"],
            [1.6, 0, "inOut"]
          ],
          "y": [
            [0, 0],
            [0.8, 2, "inOut"],
            [1.6, 0, "inOut"]
          ]
        },
        "armL": {
          "rotation": [
            [0, 0],
            [0.8, 8, "inOut"],
            [1.6, 0, "inOut"]
          ]
        },
        "armR": {
          "rotation": [
            [0, 0],
            [0.8, -8, "inOut"],
            [1.6, 0, "inOut"]
          ]
        }
      },
      "slots": {
        "face": [
          [0, "eyes_open"],
          [1.25, "eyes_closed"],
          [1.37, "eyes_open"]
        ]
      }
    },
    "attack": {
      "duration": 0.9,
      "bones": {
        "root": {
          "x": [
            [0, 0],
            [0.18, -18, "out"],
            [0.32, 200, "in"],
            [0.5, 185, "out"],
            [0.9, 0, "inOut"]
          ],
          "y": [
            [0, 0],
            [0.18, 0],
            [0.26, -30, "out"],
            [0.32, 0, "in"],
            [0.9, 0]
          ]
        },
        "body": {
          "rotation": [
            [0, 0],
            [0.18, -10, "out"],
            [0.32, 14, "in"],
            [0.55, 6],
            [0.9, 0, "inOut"]
          ],
          "scaleX": [
            [0, 1],
            [0.18, 1.1, "out"],
            [0.3, 0.94],
            [0.4, 1.06],
            [0.6, 1, "inOut"]
          ],
          "scaleY": [
            [0, 1],
            [0.18, 0.86, "out"],
            [0.3, 1.1, "out"],
            [0.4, 0.92],
            [0.6, 1, "inOut"]
          ]
        },
        "cap": {
          "rotation": [
            [0, 0],
            [0.18, -8],
            [0.32, 18, "in"],
            [0.5, 6],
            [0.9, 0, "inOut"]
          ]
        },
        "armL": {
          "rotation": [
            [0, 0],
            [0.18, 30],
            [0.32, -20],
            [0.9, 0, "inOut"]
          ]
        },
        "armR": {
          "rotation": [
            [0, 0],
            [0.18, 60, "out"],
            [0.32, -110, "in"],
            [0.6, -40],
            [0.9, 0, "inOut"]
          ]
        }
      },
      "slots": {
        "face": [
          [0, "eyes_open"],
          [0.12, "eyes_closed"],
          [0.3, "eyes_open"]
        ]
      },
      "events": [
        [0.32, "hit"]
      ]
    },
    "hurt": {
      "duration": 0.55,
      "bones": {
        "root": {
          "x": [
            [0, 0],
            [0.08, -30, "out"],
            [0.55, 0, "inOut"]
          ]
        },
        "body": {
          "rotation": [
            [0, 0],
            [0.08, -14, "out"],
            [0.3, 4, "inOut"],
            [0.55, 0, "inOut"]
          ],
          "scaleX": [
            [0, 1],
            [0.08, 0.9, "out"],
            [0.25, 1.06],
            [0.55, 1, "inOut"]
          ],
          "scaleY": [
            [0, 1],
            [0.08, 1.08, "out"],
            [0.25, 0.95],
            [0.55, 1, "inOut"]
          ]
        },
        "cap": {
          "rotation": [
            [0, 0],
            [0.1, -16, "out"],
            [0.35, 6, "inOut"],
            [0.55, 0, "inOut"]
          ]
        },
        "armL": {
          "rotation": [
            [0, 0],
            [0.1, 40],
            [0.55, 0, "inOut"]
          ]
        },
        "armR": {
          "rotation": [
            [0, 0],
            [0.1, -40],
            [0.55, 0, "inOut"]
          ]
        }
      },
      "slots": {
        "face": [
          [0, "eyes_hurt"],
          [0.45, "eyes_open"]
        ]
      }
    },
    "victory": {
      "duration": 1.0,
      "loop": true,
      "bones": {
        "root": {
          "y": [
            [0, 0],
            [0.15, 0],
            [0.45, -55, "out"],
            [0.75, 0, "in"],
            [1, 0]
          ]
        },
        "body": {
          "scaleX": [
            [0, 1],
            [0.15, 1.12, "out"],
            [0.3, 0.92, "out"],
            [0.6, 1, "inOut"],
            [0.75, 1.12, "in"],
            [0.9, 1, "out"],
            [1, 1]
          ],
          "scaleY": [
            [0, 1],
            [0.15, 0.85, "out"],
            [0.3, 1.12, "out"],
            [0.6, 1, "inOut"],
            [0.75, 0.88, "in"],
            [0.9, 1, "out"],
            [1, 1]
          ]
        },
        "cap": {
          "rotation": [
            [0, 0],
            [0.45, -6, "out"],
            [0.75, 4, "in"],
            [1, 0, "inOut"]
          ]
        },
        "armL": {
          "rotation": [
            [0, 0],
            [0.3, 140, "out"],
            [0.75, 140],
            [1, 0, "inOut"]
          ]
        },
        "armR": {
          "rotation": [
            [0, 0],
            [0.3, -140, "out"],
            [0.75, -140],
            [1, 0, "inOut"]
          ]
        }
      },
      "slots": {
        "face": [
          [0, "eyes_happy"]
        ]
      }
    },
    "defeat": {
      "duration": 1.1,
      "bones": {
        "root": {
          "y": [
            [0, 0],
            [0.7, 0],
            [0.78, -6, "out"],
            [0.9, 0, "in"]
          ]
        },
        "body": {
          "rotation": [
            [0, 0],
            [0.15, 10, "out"],
            [0.7, -88, "in"],
            [0.85, -82, "out"],
            [1.1, -86, "inOut"]
          ],
          "scaleY": [
            [0, 1],
            [0.7, 1],
            [0.78, 0.9, "out"],
            [0.95, 1, "out"]
          ]
        },
        "cap": {
          "rotation": [
            [0, 0],
            [0.7, -10],
            [0.85, -30, "out"],
            [1.1, -24, "inOut"]
          ]
        },
        "armL": {
          "rotation": [
            [0, 0],
            [0.7, -40],
            [1.1, -30, "inOut"]
          ]
        },
        "armR": {
          "rotation": [
            [0, 0],
            [0.7, 60],
            [1.1, 50, "inOut"]
          ]
        }
      },
      "slots": {
        "face": [
          [0, "eyes_hurt"],
          [0.7, "eyes_ko"]
        ]
      }
    }
  }
};

MUSHROOM_SKELETON.animations.sleep = {
  duration: 2.4,
  loop: true,
  bones: {
    body: {
      scaleX: [[0, 1], [1.2, 1.04, 'inOut'], [2.4, 1, 'inOut']],
      scaleY: [[0, 1], [1.2, 0.95, 'inOut'], [2.4, 1, 'inOut']],
    },
    cap: { rotation: [[0, 0], [1.2, 4, 'inOut'], [2.4, 0, 'inOut']] },
    armL: { rotation: [[0, -8], [1.2, -4, 'inOut'], [2.4, -8, 'inOut']] },
    armR: { rotation: [[0, 8], [1.2, 4, 'inOut'], [2.4, 8, 'inOut']] },
  },
  slots: { face: [[0, 'eyes_closed']] },
};

MUSHROOM_SKELETON.animations.strike = {
  duration: 0.62,
  bones: {
    root: {
      x: [[0, 0], [0.18, 0], [0.26, 46, 'in'], [0.4, 32, 'out'], [0.62, 0, 'inOut']],
      y: [[0, 0], [0.1, -10, 'out'], [0.2, 0, 'in'], [0.62, 0]],
    },
    body: {
      rotation: [[0, 0], [0.16, 9, 'out'], [0.26, 15, 'in'], [0.45, 4, 'out'], [0.62, 0, 'inOut']],
      scaleX: [[0, 1], [0.16, 1.05, 'out'], [0.26, 0.95, 'in'], [0.4, 1.03, 'out'], [0.62, 1, 'inOut']],
      scaleY: [[0, 1], [0.16, 0.95, 'out'], [0.26, 1.07, 'in'], [0.4, 0.97, 'out'], [0.62, 1, 'inOut']],
    },
    cap: { rotation: [[0, 0], [0.16, 5, 'out'], [0.26, 15, 'in'], [0.45, 4, 'out'], [0.62, 0, 'inOut']] },
    armR: { rotation: [[0, 0], [0.14, 45, 'out'], [0.26, -110, 'in'], [0.48, -40, 'out'], [0.62, 0, 'inOut']] },
    armL: { rotation: [[0, 0], [0.14, -18, 'out'], [0.26, -28], [0.62, 0, 'inOut']] },
  },
  slots: { face: [[0, 'eyes_open'], [0.2, 'eyes_closed'], [0.32, 'eyes_open']] },
  events: [[0.26, 'hit']],
};

/** Обычные грибы, у которых есть вид мутанта-Светляка (скин 'm_' + имя). */
export const MUTANT_BASES = ['borovik', 'podberez', 'ryzhik', 'mukhomor', 'poganka', 'panther', 'woodear', 'openok', 'veshenka'];

/**
 * Скин гриба: шляпка, ножка и руки. Текстуры обычных грибов рисуются в game/art/mushrooms.js,
 * персонажей сюжета и Светляков — в game/art/storyArt.js.
 */
export const SKIN_NAMES = [
  'borovik', 'podberez', 'ryzhik', 'mukhomor', 'poganka', 'panther', 'woodear', 'openok', 'veshenka', 'witch',
  'tosha', 'gruzd', 'smorchok',
  ...MUTANT_BASES.map((k) => 'm_' + k),
];
MUSHROOM_SKELETON.skins = Object.fromEntries(
  SKIN_NAMES.map((k) => [k, { cap: 'cap_' + k, stem: 'stem_' + k, arm: 'arm_' + k }]),
);

/** Как выглядит гриб на стороне врага: обычные грибы у Светляков — мутанты. */
export const enemyLook = (skin) => (MUTANT_BASES.includes(skin) ? 'm_' + skin : skin);
