class CraftingMenu {
  constructor({ pizzas, onComplete }) {
    this.pizzas = pizzas;
    this.onComplete = onComplete;
  }

  getOptions() {

    const opts = [];

    for(let type in this.pizzas){

      const pizza = this.pizzas[type];

      opts.push({

        label: pizza.name,
        description: pizza.description,
        handler: () => {

          playerState.addPizza(type);
          this.close();
        },
      });
    }

    return opts;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("CraftingMenu");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = `<h2>Escolha o sabor da Pizza!</h2>`;
  }
  close() {
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }

  init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container,
    });
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions());
    container.appendChild(this.element);
  }
}
