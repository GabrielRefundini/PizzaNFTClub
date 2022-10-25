// window.PizzaTypes = {
//   normal: "normal",
//   spicy: "spicy",
//   veggie: "veggie",
//   fungi: "fungi",
//   chill: "chill",
// };

//Tipos de pizza
window.PizzaTypes = {

  brocolis: "brocolis",
  peperoni: "peperoni",
  calabresa: "calabresa",
  champignon: "champignon"
}

//Cada chave representa um pizzaTypeId, que é o tipo dessa pizza, onde, podem existir varias pizzas com esse id de tipo, ex: s001
window.Pizzas = {
  [PizzaTypes.calabresa]: {
    name: "Calabreza Picante",
    description:
      "Pizza artesanal com uma massa leve, molho suculento de tomates, calabreza e muita pimenta",
    src: "/images/characters/pizzas/s001.png",
    icon: "/images/icons/spicy.png",
    actions: ["saucyStatus", "clumsyStatus", "damage1"],
    flag: "PIZZA_CALABREZA",
  },
  [PizzaTypes.peperoni]: {
    name: "Peperoni Sueco",
    description: "Peperoni, pimentão,tomate cereja e bacon. ",
    src: "/images/characters/pizzas/s002.png",
    icon: "/images/icons/spicy.png",
    actions: ["damage1", "saucyStatus", "clumsyStatus"],
    // flag: "PIZZA_PEPERONI",
  },
  [PizzaTypes.brocolis]: {
    name: "Brócolis",
    description: "Pizza desc here",
    src: "/images/characters/pizzas/v001.png",
    icon: "/images/icons/veggie.png",
    actions: ["damage1"]
  },
  [PizzaTypes.champignon]: {
    name: "Champignon da casa",
    description: "Pizza desc here",
    src: "/images/characters/pizzas/f001.png",
    icon: "/images/icons/fungi.png",
    actions: ["damage1"],
  },
};

for(let type in Pizzas){

  Pizzas[type].type = type;
}
