export class Monster {
  constructor(name, id, { i, j, board }) {
    this.name = name;
    this.id = id;
    const node = new cc.Node("Sprite");
    this.node = node;
    this.i = i;
    this.j = j;
    this.board = board;

    this.loadResource('stand').then((frames) => {
      const sp = node.addComponent(cc.Sprite);
      sp.spriteFrame = frames[0];
      const animation = node.addComponent(cc.Animation);
      const clip = cc.AnimationClip.createWithSpriteFrames(frames, 5);
      clip.name = 'anim_boom';
      clip.wrapMode = cc.WrapMode.Loop;
      animation.addClip(clip);
      animation.play('anim_boom');
      this.sprite = sp;
    });
  }

  loadResource(type) {
    return new Promise(resolve => {
      cc.resources.loadDir(`monsters/${this.id}/${type}`, cc.SpriteFrame, function (err, assets) {
        resolve(assets);
      });
    })
  }
}