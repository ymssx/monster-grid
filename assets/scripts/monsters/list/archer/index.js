class Giant extends Monster {
  name = '弓箭手';
  cost = 5;
  attack = 5;
  attackRange = 5;
  hp = 3;
  move = 2;
  grids = [
    [0, 0],
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];

  constructor(name, detail) {
    super(name, '001', detail);
  }

  effects = [
    {
      desc: '攻击在经过特殊地形时会附加攻击特效',
      onAttack() {
      },
    },
  ];
}