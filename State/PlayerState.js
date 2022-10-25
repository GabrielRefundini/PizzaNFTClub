class PlayerState {
  constructor() {

    this.prevPizzaId = 0;

    //Player pizzas
    this.pizzas = {};

    //Preparing pizzas
    this.lineup = [];

    //Story flags
    this.storyFlags = {};

    // this.items = [
    //   { actionId: "item_recoverHp", instanceId: "item1" },
    //   { actionId: "item_recoverHp", instanceId: "item2" },
    //   { actionId: "item_recoverHp", instanceId: "item3" },
    // ];

    this.addPizza(PizzaTypes.brocolis);
  }

  getNewPizzaId(){

    return `pizza-${++this.prevPizzaId}`;
    // return `p${Date.now()}` + Math.floor(Math.random() * 99999);
  }

  removePizzaByType(type){

    for(let id in this.pizzas){

      const pizza = this.pizzas[id];

      if(pizza.type === type){

        delete this.pizzas[id];
        delete this.lineup[this.lineup.indexOf(pizza.id)];
        utils.emitEvent("LineupRemoved", {id: pizza.id});
        break;
      }
    }
  }

  addPizza(pizzaTypeId) {

    console.log('add pizza', pizzaTypeId);

    const newId = this.getNewPizzaId();

    this.pizzas[newId] = {
      ... Pizzas[pizzaTypeId],
      pizzaTypeId,
      id: newId,
      hp: 50,
      maxHp: 50,
      xp: 0,
      maxXp: 100,
      level: 1,
      status: null,
    };

    this.lineup.push(newId);
    utils.emitEvent("LineupChanged");
  }

  hasPizzaOfType(type){

    return Object.values(this.pizzas).some(pizza => pizza.type === type);
  }

  hasAnyPizza(){

    return Object.keys(this.pizzas).length > 0;
  }

  swapLineup(oldId, incomingId) {
    const oldIndex = this.lineup.indexOf(oldId);
    this.lineup[oldIndex] = incomingId;
    utils.emitEvent("LineupChanged");
  }

  moveToFront(futureFrontId) {
    this.lineup = this.lineup.filter((id) => id !== futureFrontId);
    this.lineup.unshift(futureFrontId);
    utils.emitEvent("LineupChanged");
  }
}
window.playerState = new PlayerState();
