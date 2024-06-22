import { Monster } from './monsters/common';

const s = 1.3;
const w = 56 * s;
const h = 42 * s;

class Grid {
  z = 0;

  constructor(name, resource) {
    this.name = name;
    this.resource = resource;
    
    const node = new cc.Node("Sprite");
    const grid = node.addComponent(cc.Sprite);
    grid.spriteFrame = resource;
    
    this.node = node;
    this.sprite = grid;
  }

  setResource(resource) {
    this.sprite.spriteFrame = resource;
  }
}

class Robot extends Monster {
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
}

class Plane extends Monster {
  z = 1;

  constructor(name, detail) {
    super(name, '002', detail);
  }

  hello() {
    cc.log('hello!');
  }
}


cc.Class({
  extends: cc.Component,

  properties: {
    n_x: 10,
    n_y: 10,

    grids: [],
    monsters: [],
    resources: [],
  },

  onLoad() {
    this.createTable()
      .then(() => {
        const plane = new Plane('myplane', {
          board: this,
          i: 6,
          j: 4,
        })
        this.addMonster(plane);

        setTimeout(() => {
          this.slideGrid(1, 1, 0.5);
          this.slideGrid(4, 4, 0.5);
          this.slideGrid(3, 4, -0.5);
          this.slideGrid(7, 7, 0.5);

          this.setGridGround(3, 3, '07730');
          this.setGridGround(2, 2, '07782');
          this.setGridGround(1, 6, '07925');
          this.setGridGround(4, 6, '07275');
        }, 1000);

        setTimeout(() => {
          const robot = new Robot('myrobot', {
            board: this,
            i: 1,
            j: 4,
          })
          this.addMonster(robot);
        }, 2000);
      });
  },

  originPosition() {
    return [0, (h / 4 + 2) * this.n_y];
  },

  loadResource(list) {
    const that = this;
    const promise_list = list.map((url) => {
      return new Promise((resolve, reject) => {
        if (this.resources[url]) {
          resolve();
        }
        cc.resources.load(url, cc.SpriteFrame, function (err, spriteFrame) {
          if (err) {
            reject(err);
          }
          that.resources[url] = spriteFrame;
          resolve();
        });
      });
    });

    return Promise.all(promise_list);
  },

  addGrid(position, resource) {
    const grid = new Grid('default', resource);
    this.node.addChild(grid.node);
    grid.node.setPosition(position);
    return grid;
  },

  slideGrid(i, j, z, { temp = false } = {}) {
    const grid = this.grids[i][j];
    grid.isSliding = true;
    const zDiff = z - (grid.realZ || 0);
    if (!temp) {
      grid.z = z;
    }
    grid.realZ = z;
    const height = zDiff * grid.node.height;
    const grid_moove = cc.tween().by(1, { y: height }, { easing: "sineOut" });
    const animations = [];
    const gridPromise = new Promise(resolve => {
      cc
        .tween(grid.node)
        .then(grid_moove)
        .call(() => resolve())
        .start();
    })
    animations.push(gridPromise);
    
    if (this.monsters[i][j]) {
      const monster = this.monsters[i][j];
      const monster_move = cc.tween().by(1, { y: height }, { easing: "sineOut" });
      const monsterPromise = new Promise(resolve => {
        cc
          .tween(monster.node)
          .then(monster_move)
          .call(() => resolve())
          .start();
      });
      animations.push(monsterPromise);
    }
    const animationPromise = Promise.all(animations)
      .finally(() => {
        grid.isSliding = false;
        grid.animationPromise = null;
      });
    grid.animationPromise = animationPromise;
    return animationPromise;
  },

  getGridPosition(i, j, foot = 1 / 3) {
    const grid = this.grids[i][j];
    const x = grid.node.x;
    const y = grid.node.y;
    const g_h = grid.node.height;
    return cc.v2(x, y + g_h * s - (1 - foot) * h);
  },

  addMonster(monster) {
    const i = monster.i;
    const j = monster.j;

    const grid = this.grids[i][j];
    grid.z = monster.z || 0;

    const monsterGrids = monster.grids || [[0, 0]];
    const animations = [];
    for (const grid of monsterGrids) {
      const x = i + grid[0];
      const y = j + grid[1];
      animations.push(this.setGridGround(x, y, grid[2]?.type, { oneStep: false }));
    }
    return Promise.all(animations)
      .then((sideUpAnimations) => {
        this.node.addChild(monster.node);
        const position = this.getGridPosition(i, j);
        monster.node.setPosition(position);
        monster.node.zIndex = 3 * (this.n_x * i + j) + 1;
        monster.node.anchorY = 0;
        monster.node.setScale(s);
        this.monsters[i][j] = monster;

        if (monster.onSummon instanceof Function) {
          monster.onSummon(i, j);
        }
        return Promise.all(sideUpAnimations.map(item => item()));
      });
  },

  createTable() {
    return this.loadResource([
      'grids/resource 07782',
      'grids/resource 08393',
      'grids/resource 07730'
    ]).then(() => {
      const [a_x, a_y] = this.originPosition();

      const grids = [];
      let z = 0;
      for (let i = 0; i < this.n_x; i += 1) {
        let x = a_x + (i * w) / 2;
        let y = a_y - (i * h) / 2;
  
        const row = [];
  
        for (let j = 0; j < this.n_y; j += 1) {
          const position = cc.v2(x, y);
          const grid = this.addGrid(position, this.resources['grids/resource 08393'])
          grid.node.zIndex = z;
          grid.node.setScale(s);
          grid.node.anchorY = 0;
          row[j] = grid;
  
          x -= w / 2;
          y -= h / 2;
          z += 3;
        }
  
        grids.push(row);
      }
  
      const monsters = new Array(this.n_x);
      for (let i = 0; i < this.n_y; i += 1) {
        monsters[i] = new Array(this.n_y);
      }
  
      this.grids = grids;
      this.monsters = monsters;
    })
  },

  setGridGround(i, j, id, { oneStep = true } = {}) {
    const grid = this.grids[i][j];
    const oldZ = grid.z || 0;
    return Promise.all([
      this.slideGrid(i, j, -1, { temp: true }),
      id ? this.loadResource([`/grids/resource ${id}`]) : Promise.resolve(),
    ])
      .then(() => {
        const slideUp = () => {
          const grid = this.grids[i][j];
          id && grid.setResource(this.resources[`/grids/resource ${id}`]);
          if (grid.animationPromise) {
            return grid.animationPromise.then(() => this.slideGrid(i, j, oldZ))
          }
          return this.slideGrid(i, j, oldZ);
        }
        if (oneStep) {
          return slideUp();
        } else {
          return slideUp;
        }
      });
  }
});
