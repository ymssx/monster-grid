class Giant extends Monster {
  name = '熔岩蜗牛';
  cost = 5;
  attack = 2;
  hp = 10;
  move = 2;
  grids = [
    [0, 0, { type: '07652' }],
  ];

  constructor(name, detail) {
    super(name, '001', detail);
  }

  effects = [
    {
      desc: '熔岩蜗牛移动经过的格子将会留下持续2回合的火焰地形',
      onTurn(grid) {
        this.board.setGridGround(grid, '07652');
      },
    },
  ];
}