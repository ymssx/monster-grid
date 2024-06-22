class Giant extends Monster {
  name = '泰坦巨人';
  cost = 5;
  attack = 8;
  hp = 10;
  move = 2;
  grids = [
    [0, 0, { type: '07730' }],
    [1, 0, { type: '07730' }],
    [0, 1, { type: '07730' }],
    [-1, 0, { type: '07730' }],
    [0, -1, { type: '07730' }],
  ];

  constructor(name, detail) {
    super(name, '001', detail);
  }

  effects = [
    {
      desc: '选择范围3以内的一个目标凸起',
      cost: 1,
      async avtivate() {
        const grid = await this.board.selectGrid({ range: 3 });
        this.board.sideGrid(grid, 0.5);
      },
    },
  ];
}