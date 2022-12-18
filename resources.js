class Resources {
  static Sprite = class {
    name = "";
    image = null;
    sx = 0;
    sy = 0;
    sw = 0;
    sh = 0;
  }

  sprites = [];

  addSprite(sprite) {
    this.sprites.push(sprite);
    this.sprites[sprite.name] = sprite;
  }

  drawSprite(context, sprite, x, y, w, h) {
    if (sprite) {
      context.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.sw, sprite.sh, x, y, w, h);
    } else {
      context.fillStyle = "red";
      context.fillRect(x, y, w, h);
    }
  }
}