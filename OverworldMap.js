class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach((key) => {
      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);
    });
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i = 0; i < events.length; i++) {

      let event = events[i];

      //Adicionado a possibilidade de um evento ser mapeado através de uma função
      if(typeof event === 'function'){

        event = event();
      }

      const eventHandler = new OverworldEvent({
        event,
        map: this,
      });
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    //Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach((object) =>
      object.doBehaviorEvent(this)
    );
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find((object) => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      const relevantScenario = match.talking.find((scenario) => {

        //Adição para permitir o uso de função no required, no talking geral do objeto, caso retorne true, cria os eventos subsequentes do mapeamento.
        if(typeof scenario.required === 'function') return scenario.required();

        return (scenario.required || []).every((sf) => {
          return playerState.storyFlags[sf];
        });
      });

      //Adição de suporte de criação de eventos via retorno de função
      relevantScenario && this.startCutscene(typeof relevantScenario.events === 'function' ? relevantScenario.events() : relevantScenario.events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events);
    }
  }

  addWall(x, y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x, y) {
    delete this.walls[`${x},${y}`];
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const { x, y } = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }
}

window.OverworldMaps = {
  DemoRoom: {
    lowerSrc: "/images/maps/DemoLower.png",
    upperSrc: "/images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "up", time: 800 },
          { type: "stand", direction: "right", time: 1200 },
          { type: "stand", direction: "up", time: 300 },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I'm busy...", faceHero: "npcA" },
              { type: "textMessage", text: "Go away!" },
              { who: "hero", type: "walk", direction: "up" },
            ],
          },
        ],
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/npc2.png",
        // behaviorLoop: [
        //   { type: "walk",  direction: "left" },
        //   { type: "stand",  direction: "up", time: 800 },
        //   { type: "walk",  direction: "up" },
        //   { type: "walk",  direction: "right" },
        //   { type: "walk",  direction: "down" },
        // ]
      }),
    },
    walls: {
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 4)]: [
        {
          events: [
            { who: "npcB", type: "walk", direction: "left" },
            { who: "npcB", type: "stand", direction: "up", time: 500 },
            { type: "textMessage", text: "You can't be in there!" },
            { who: "npcB", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "left" },
          ],
        },
      ],
      [utils.asGridCoord(5, 10)]: [
        {
          events: [{ type: "changeMap", map: "Kitchen" }],
        },
      ],
    },
  },
  Kitchen: {
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      npcB: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc4.png",
        talking: [
          {
            //Adicionei a possibilidade de um required ser executado como função, para permitir negações
            required: () => playerState.storyFlags['USED_PIZZA_STONE'] === false,
            events: [

              {
                //Todo evento vai mapear para OverworldEvent.XXX, nesse caso OverworldEvent.textMessage()
                type: "textMessage",
                text: "Ops, você já tem uma massa, utilize-a primeiro e depois volte aqui.",
                faceHero: "npcB"
              },
              {
                type: "walk",
                who: "hero",
                direction: "left"
              }
            ]
          },
          {
            events:  [

              {
                type: "textMessage",
                text: "Ei! Parece que voce precisa de mais massa de pizza, tome.",
                faceHero: "npcB"
              },
              //Criei um setStoryFlag, permitindo passar um value
              {
                type: "setStoryFlag",
                flag: 'USED_PIZZA_STONE',
                value: false
              },
            ]
          }
        ],
      }),
      pizzaStone: new PizzaStone({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        storyFlag: "USED_PIZZA_STONE",
        pizzas: Pizzas,
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 4)]: [
        {
          events: [
            { who: "npcB", type: "walk", direction: "left" },
            { who: "npcB", type: "stand", direction: "up", time: 500 },
            { type: "textMessage", text: "You can't be in there!" },
            { who: "npcB", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "left" },
          ],
        },
      ],
      [utils.asGridCoord(5, 10)]: [
        {
          events: [{ type: "changeMap", map: "DinningRoom" }],
        },
      ],
    },
  },
  DinningRoom: {
    lowerSrc: "/images/maps/DiningRoomLower.png",
    upperSrc: "/images/maps/DiningRoomUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(7),
        y: utils.withGrid(4),
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(10),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [{ type: "stand", direction: "right" }],
        talking: [

          {
            events(){

              const events = [];

              const npc = OverworldMaps.DinningRoom.gameObjects.npcA;
              let pizza;

              if(npc.currentRequestedPizza){

                pizza = npc.currentRequestedPizza;

                events.push({

                  type: "textMessage",
                  text: `O meu pedido da pizza de ${pizza.name} já ficou pronto?`,
                  faceHero: "npcA",
                });

              } else {

                const keys = Object.keys(PizzaTypes);
                const pizzaType = keys[utils.getRandomIntBetween(0, keys.length - 1)];
                npc.currentRequestedPizza = pizza = Pizzas[pizzaType];

                events.push({

                  type: "textMessage",
                  text: `Eu gostaria de uma pizza de ${pizza.name}.`,
                  faceHero: "npcA",
                });
              }

              if(playerState.hasPizzaOfType(pizza.type)){

                playerState.removePizzaByType(pizza.type);

                events.push({

                  type: "textMessage",
                  text: "Um dos melhores sabores da casa, tome aqui.",
                  faceHero: "hero",
                });

              } else {

                events.push({

                  type: "textMessage",
                  text: `Bom pedido! Vou preparar a sua pizza de ${pizza.name} agora mesmo.`,
                  faceHero: "hero",
                });

                events.push({

                  type: "walk",
                  who: "hero",
                  direction: "up"
                });
              }

              return events;
            }
          },
        ],
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/npc2.png",
        // behaviorLoop: [
        //   { type: "walk",  direction: "left" },
        //   { type: "stand",  direction: "up", time: 800 },
        //   { type: "walk",  direction: "up" },
        //   { type: "walk",  direction: "right" },
        //   { type: "walk",  direction: "down" },
        // ]
      }),
    },
    walls: {
      [utils.asGridCoord(6, 4)]: true,
      [utils.asGridCoord(5, 3)]: true,
      [utils.asGridCoord(6, 3)]: true,
      [utils.asGridCoord(6, 5)]: true,
      [utils.asGridCoord(4, 5)]: true,
      [utils.asGridCoord(3, 5)]: true,
      [utils.asGridCoord(3, 7)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(8, 10)]: true,
      [utils.asGridCoord(8, 7)]: true,
      [utils.asGridCoord(11, 5)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 4)]: [
        {
          events: [
            { who: "npcB", type: "walk", direction: "left" },
            { who: "npcB", type: "stand", direction: "up", time: 500 },
            { type: "textMessage", text: "You can't be in there!" },
            { who: "npcB", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "left" },
          ],
        },
      ],
      [utils.asGridCoord(7, 4)]: [
        {
          events: [{ type: "changeMap", map: "Kitchen" }],
        },
      ],
    },
  },
};
