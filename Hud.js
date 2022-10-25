class Hud {
  constructor() {
    this.scoreboards = [];
  }
  update() {
    this.scoreboards.forEach((s) => {
      s.update(window.playerState.pizzas[s.id]);
    });
  }
  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("Hud");

    const { playerState } = window;

    //Baseado nas pizzas em preparo, cria o hud sempre que houver mudança no estado, disparado pelo evento LineupChanged
    playerState.lineup.forEach((key) => {
      const pizza = playerState.pizzas[key];
      const scoreboard = new Combatant(
        {
          id: key,
          ...Pizzas[pizza.pizzaTypeId],
          ...pizza,
        },
        null
      );
      scoreboard.createElement();
      this.scoreboards.push(scoreboard);
      this.element.appendChild(scoreboard.hudElement);
    });
    this.update();
  }
  init(container) {

    this.createElement();
    container.appendChild(this.element);

    document.addEventListener("PlayerStateUpdated", () => {
      this.update();
    });

    document.addEventListener("LineupChanged", () => {
      this.createElement();
      container.appendChild(this.element);
    });

    document.addEventListener("LineupRemoved", ({detail: {id}}) => {

      const hudElementToRemove = this.scoreboards.find((scoreboard) => scoreboard.id === id);

      if(hudElementToRemove){

        this.element.removeChild(hudElementToRemove.hudElement);
      }
    });
  }
}
