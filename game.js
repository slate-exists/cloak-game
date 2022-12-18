class Game {
  static World = class {
    data = null;
    creatures = [];
  }

  static Creature = class {
    data = null;
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    health = 0;
    healthMax = 0;
  }

  resources = null;
  gameData = null;
  player = null;
  world = null;
  renderer = new GameRenderer();

  constructor(resources, gameData) {
    this.resources = resources;
    this.gameData = gameData;
  }

  addCreature(world, creature) {
    world.creatures.push(creature);
  }

  moveOrInteract(creature, x, y) {
    if (this.move(creature, x, y)) {
      return true;
    } else if (this.interact(creature, x, y)) {
      return true;
    } else {
      return false;
    }
  }

  move(creature, x, y) {
    if (!creature.data.canFly) {
      for (let j = y; j < y + creature.data.height; ++j) {
        for (let i = x; i < x + creature.data.width; ++i) {
          let cellX = Math.floor(x / this.world.data.cellWidth) * this.world.data.cellWidth;
          let cellY = Math.floor(y / this.world.data.cellHeight) * this.world.data.cellHeight;
          let cell = this.world.data.cells.find(cell => cell.x == cellX && cell.y == cellY);

          if (!cell) return false;

          let localX = i - cellX;
          let localY = j - cellY;
          let localI = localX + localY * this.world.data.cellWidth;
          let tile = cell.data[localI];

          if (tile.isSolid) {
            return false;
          }
        }
      }
    }
    
    let creatures = [];

    for (let other of this.world.creatures) {
      if (other != creature && !(other.x >= x + creature.data.width ||
          x >= other.x + other.data.width ||
          other.y >= y + creature.data.height ||
          y >= other.y + other.data.height)) {
        creatures.push(other);
      }
    }

    if (creatures.length != 0) {
      return false;
    }

    creature.x = x;
    creature.y = y;

    return true;
  }

  interact(creature, x, y) {
    let creatures = [];

    for (let other of this.world.creatures) {
      if (other != creature && !(other.x >= x + creature.data.width ||
          x >= other.x + other.data.width ||
          other.y >= y + creature.data.height ||
          y >= other.y + other.data.height)) {
        creatures.push(other);
      }
    }

    if (creatures.length != 0) {
      for (let other of creatures) {
        other.x = 1000;
      }

      return true;
    }

    return false;
  }

  draw(context) {
    let player = this.player;
    let world = this.world;

    if (!player) {
      return;
    }

    let scale = 10;

    this.renderer.draw(context, this);

    for (let creature of world.creatures) {
      this.resources.drawSprite(context, creature.data.sprites[0], creature.x, creature.y, creature.data.width, creature.data.height);
    }
  }
}


class GameRenderer {
  static Buffer = class {
    world = null;
    cell = null;
    canvas = document.createElement("canvas");
    context = this.canvas.getContext("2d");
  }

  buffers = [];
  unusedBuffers = [];

  // Initialised with an invalid rect so point assertions fail
  psx = 1;
  psy = 1;
  pex = -1;
  pey = -1;

  getUnusedBuffer() {
    let buffer = this.unusedBuffers.shift();

    return buffer || new GameRenderer.Buffer();
  }

  draw(context, game) {
    let player = game.player;
    let world = game.world;
    let cellWidth = world.data.cellWidth;
    let cellHeight = world.data.cellHeight;
    let scale = 10;

    // Calculate the view bounds:
    // v = View
    // w = Width
    // h = Height
    // s = Start
    // m = Mid
    // e = End
    let vw = context.canvas.width / scale;
    let vh = context.canvas.height / scale;
    let vmx = player.x;
    let vmy = player.y;
    let vsx = vmx - vw / 2;
    let vsy = vmy - vh / 2;
    let vex = vmx + vw / 2;
    let vey = vmy + vh / 2;

    // Calculate the cell bounds:
    // c = Current Cell
    // p = Previous Cell
    let csx = Math.floor(vsx / cellWidth) * cellWidth;
    let csy = Math.floor(vsy / cellHeight) * cellHeight;
    let cex = Math.floor(vex / cellWidth) * cellWidth;
    let cey = Math.floor(vey / cellHeight) * cellHeight;

    let psx = this.psx;
    let psy = this.psy;
    let pex = this.pex;
    let pey = this.pey;

    this.psx = csx;
    this.psy = csy;
    this.pex = cex;
    this.pey = cey;

    // remove buffers outside of the view:
    for (let py = psy; py <= pey; py += cellHeight) {
      for (let px = psx; px <= pex; px += cellWidth) {
        // if the buffer is outside the view...
        if (px < csx || px > cex || py < csy || py > cey) {
          let bufferIndex = this.buffers.findIndex(buffer => buffer.cell.x == px && buffer.cell.y == py);

          if (bufferIndex != -1) {
            // ...then, remove it
            let buffer = this.buffers[bufferIndex];
  
            this.buffers.splice(bufferIndex, 1);
            this.unusedBuffers.push(buffer);
            
            // console.log("deleted buffer:", px, py);
          }
        }
      }
    }

    let tileWidth = 10;
    let tileHeight = 10;

    // add buffers inside the view:
    for (let cy = csy; cy <= cey; cy += cellHeight) {
      for (let cx = csx; cx <= cex; cx += cellWidth) {
        // if the buffer is not inside the previous view...
        if (cx < psx || cx > pex || cy < psy || cy > pey) {
          let cell = world.data.cells.find(cell => cell.x == cx && cell.y == cy);

          if (cell) {
            // ...then create a new buffer to represent it
            let buffer = this.getUnusedBuffer();
  
            buffer.cell = cell;
            buffer.world = world;
  
            buffer.canvas.width = tileWidth * cellWidth;
            buffer.canvas.height = tileHeight * cellHeight;
  
            this.buffers.push(buffer);

            // render the cell:
            console.log("RENDER");
            for (let y = 0, i = 0; y < world.data.cellHeight; ++y) {
              for (let x = 0; x < world.data.cellWidth; ++x, ++i) {
                let tile = cell.data[i];
      
                if (tile && tile.sprites.length) {
                  game.resources.drawSprite(buffer.context, tile.sprites[0], x * tileWidth, y * tileHeight, tileWidth, tileHeight);
                }
              }
            }
            
            // console.log("added buffer:", cx, cy);
          }
        }
      }
    }

    // console.log("buffer count:", this.buffers.length);
    // console.log("unused buffer count:", this.unusedBuffers.length);

    context.reset();
    context.translate(context.canvas.width / 2, context.canvas.height / 2);
    context.scale(scale, scale);
    context.translate(-vmx, -vmy);

    for (let buffer of this.buffers) {
      if (buffer.cell) {
        context.drawImage(buffer.canvas, buffer.cell.x, buffer.cell.y, buffer.world.data.cellWidth, buffer.world.data.cellHeight);
      }
    }
  }
}