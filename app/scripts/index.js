const World = require('./generator');
const Viewer = require('./viewer');

const OPTIONS = {
  points: 1000,
  width: 800,
  height: 800,
  seed: '',
  smoothing: 3,
  water: 0,
  coast: 0.025,
  octaves: 3,
  lacunarity: 2,
  persistance: 0.5,
  falloff: 4,
  filter: true,
};

class App {
  constructor() {
    const btnGenerate = document.getElementById('generate');
    btnGenerate.addEventListener('click', this.StartGenerate);

    this.CreateOption('points');
    this.CreateOption('water');
    this.CreateOption('scale');
    this.CreateOption('octaves');
    this.CreateOption('lacunarity');
    this.CreateOption('persistance');
    this.CreateOption('falloff');
  }

  StartGenerate() {
    const options = OPTIONS;
    const opts = document.getElementsByClassName('option');
    for (let i = 0; i < opts.length; i += 1) {
      options[opts[i].getAttribute('name')] = parseFloat(opts[i].value);
    }

    const world = new World(options);
    const viewer = new Viewer(options, world);
    viewer.Render();
  }

  CreateOption(key) {
    this.a += 10;
    const range = document.getElementById(`range-${key}`);
    const span = document.getElementById(`span-${key}`);
    range.oninput = function () {
      span.innerHTML = range.value;
    };
  }
}
const app = new App();
