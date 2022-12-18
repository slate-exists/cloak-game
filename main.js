window.addEventListener("load", function () {
  let resources = new Resources();

  for (let node of cache.images) {
    let image = images[node.name];
    let spriteIndex = 0;

    for (let spriteName of node.sprites) {
      let sprite = new Resources.Sprite();
  
      sprite.image = image;
      sprite.name = spriteName;
      sprite.sx = spriteIndex * node.width % image.width;
      sprite.sy = Math.floor(spriteIndex * node.width / image.width) * node.height;
      sprite.sw = node.width;
      sprite.sh = node.height;
  
      resources.addSprite(sprite);
      ++spriteIndex;
    }
  }

  let gameData = new GameData();

  for (let node of cache.creatures) {
    let creature = new GameData.Creature();
  
    creature.id = node.id;
    creature.name = node.name;
    creature.description = node.description;
    creature.sprites = [resources.sprites[node.sprite]]; // TODO: allow for multiple creature sprites
    creature.canFly = node.canFly;
    creature.width = node.width;
    creature.height = node.height;
    creature.healthMin = node.healthMin;
    creature.healthMax = node.healthMax;
    creature.damageMin = node.damageMin;
    creature.damageMax = node.damageMax;
  
    gameData.addCreature(creature);
  }

  for (let node of cache.tiles) {
    let tile = new GameData.Tile();

    tile.id = node.id;
    tile.name = node.name;
    tile.description = ""; // TODO: implement tile description
    tile.sprites = [resources.sprites[node.sprite]]; // TODO: allow for multiple tile sprites
    tile.isSolid = node.solid;
    tile.isOpaque = node.opaque;

    gameData.addTile(tile);
  }

  for (let node of cache.worlds) {
    let world = new GameData.World();

    world.id = node.id;
    world.name = node.name;
    world.cellWidth = node.width;
    world.cellHeight = node.height;
    
    for (let subNode of node.cells) {
      let cell = new GameData.Cell();

      cell.x = subNode.x;
      cell.y = subNode.y;
      cell.data = subNode.data.map(i => gameData.tiles[i]);

      gameData.addCell(world, cell);
    }

    for (let subNode of node.spawns) {
      let spawn = new GameData.Spawn();

      spawn.x = subNode.x;
      spawn.y = subNode.y;
      spawn.creature = gameData.creatures[subNode.creatureId];
      spawn.chanceDay = subNode.chanceDay;
      spawn.chanceNight = subNode.chanceNight;
      
      gameData.addSpawn(world, spawn);
    }

    gameData.addWorld(world);
  }

  let game = new Game(resources, gameData);
  let player = new Game.Creature();
  let world = new Game.World();

  player.data = gameData.creatures["crabbeach"];
  world.data = gameData.worlds["overworld"];
  player.x = 5;
  player.y = 10;

  game.player = player;
  game.world = world;

  game.addCreature(world, player);

  for (let spawn of world.data.spawns) {
    let creature = new Game.Creature();

    creature.data = spawn.creature;
    creature.x = spawn.x;
    creature.y = spawn.y;

    game.addCreature(world, creature);
  }

  /* START DEBUG CODE */
  console.log("#resources=", resources);
  console.log("#gameData=", gameData);
  console.log("#game=", game);
  
  window.game = game;

  window.addEventListener("keydown", function (e) {
    if (e.code == "ArrowUp"   ) game.moveOrInteract(player, player.x, player.y - 1);
    if (e.code == "ArrowDown" ) game.moveOrInteract(player, player.x, player.y + 1);
    if (e.code == "ArrowLeft" ) game.moveOrInteract(player, player.x - 1, player.y);
    if (e.code == "ArrowRight") game.moveOrInteract(player, player.x + 1, player.y);
    if (e.code == "KeyF") player.data.canFly = !player.data.canFly;
  });
  /* END DEBUG CODE */

  draw = draw.bind(undefined, game);

  draw();
});


function draw(game) {
  game.draw(context);

  requestAnimationFrame(draw);
}