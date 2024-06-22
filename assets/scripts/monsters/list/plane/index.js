
class Plane extends Monster {
  name = '战斗机';
  z = 0.5;
  cost = 5;
  attack = 3;
  hp = 5;
  move = 4;

  constructor(name, detail) {
    super(name, '002', detail);
  }

  effects = [
  ];
}