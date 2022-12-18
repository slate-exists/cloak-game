class GameData {
  static Creature = class {
    id = "";
    name = "";
    description = "";
    sprites = [];
    width = 1;
    height = 1;
    canFly = false;
    healthMin = 0;
    healthMax = 0;
    damageMin = 0;
    damageMax = 0;
  }

  static Tile = class {
    id = "";
    name = "";
    description = "";
    sprites = [];
    isSolid = false;
    isOpaque = false;
  }

  static World = class {
    id = "";
    name = "";
    cellWidth = 0;
    cellHeight = 0;
    cells = [];
    spawns = [];
  }

  static Cell = class {
    x = 0;
    y = 0;
    data = null;
  }

  static Spawn = class {
    chanceDay = 0;
    chanceNight = 0;
    creature = null;
    x = 0;
    y = 0;
  }

  creatures = [];
  tiles = [];
  worlds = [];

  addCreature(creature) {
    this.creatures.push(creature);
    this.creatures[creature.id] = creature;
  }

  addTile(tile) {
    this.tiles.push(tile);
    this.tiles[tile.id] = tile;
  }

  addWorld(world) {
    this.worlds.push(world);
    this.worlds[world.id] = world;
  }

  addCell(world, cell) {
    world.cells.push(cell);
  }

  addSpawn(world, spawn) {
    world.spawns.push(spawn);
  }
}