class PizzaStone extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: "/images/characters/pizza-stone.png",
      animations: {
        "used-down": [[0, 0]],
        "unused-down": [[1, 0]],
      },
      currentAnimation: "used-down",
    });

    console.log('??', config, playerState.storyFlags, config.storyFlag);

    //Caso queira iniciar com a stone/massa já usada, passar true manualmente pro player nessa flag
    playerState.storyFlags[config.storyFlag] = false;

    //Guarda qual é o valor/tipo de story flag a ser checado posteriormente no estado do player, para determinar se pode usar a stone ou não
    this.storyFlag = config.storyFlag;
    this.pizzas = config.pizzas;

    //Mapeamento que o código original usa, ele itera sobre essa estrutura de dados para determinar as iterações com a pizza stone
    this.talking = [
      {
        required: [this.storyFlag], //Se o player tiver a storyFlag USED_PIZZA_STONE = true, não dispara o prox evento de preparar pizza, pois a massa já foi usada, necessário resetar a flag com o outro npc.
        events: [
          {
            type: "textMessage",
            text: "Você precisa de uma massa para criar a pizza."
          },
        ],
      },
      {
        events: [
          { type: "textMessage", text: "Prepare a pizza! " },
          { type: "craftingMenu", pizzas: this.pizzas },
          {
            type: "setStoryFlag",
            flag: this.storyFlag,
            value: true
          },
        ],
      },
    ];
  }

  canUseStone(){

    return playerState.storyFlags[this.storyFlag] === true;
  }

  update() {
    //Atualizado para ver baseado no método que checa o estado do player, se tem a flag que permite o uso ou não
    this.sprite.currentAnimation = this.canUseStone()
      ? "used-down"
      : "unused-down";
  }
}
