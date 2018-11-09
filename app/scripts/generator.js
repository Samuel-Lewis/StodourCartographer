const SimplexNoise = require('simplex-noise');
const Delaunay = require('d3-delaunay').Delaunay;
const Random = require('random');
const SeedRandom = require('seedrandom');

const Utility = require('./utility.js');

let NoiseGenerator;

class Tile {
  constructor(options, polygon, svgPath) {
    this.options = options;
    this.polygon = polygon;
    this.svgPath = svgPath;
    this.FindCenter();
    this.elevation = [];
    this.averageElevation = 0;
    this.lowestPoint = 1;
    this.highestPoint = -1;
    this.colour = 'red';
    this.water = false;
  }

  FindCenter() {
    this.center = [0, 0];
    for (let i = 0; i < this.polygon.length - 1; i += 1) {
      this.center[0] += this.polygon[i][0];
      this.center[1] += this.polygon[i][1];
    }
    this.center[0] /= this.polygon.length - 1;
    this.center[1] /= this.polygon.length - 1;
    return this.center;
  }

  Finalise() {
    for (let i = 0; i < this.polygon.length; i += 1) {
      this.el = this.FindElevation(this.polygon[i][0], this.polygon[i][1]);
      const e = this.el.elevation;
      this.elevation.push(e);
      this.lowestPoint = Math.min(e, this.lowestPoint);
      this.highestPoint = Math.max(e, this.highestPoint);
    }

    this.averageElevation = (this.lowestPoint + this.highestPoint) / 2;
    if (this.averageElevation < this.options.water) {
      this.water = true;
      this.colour = this.PickHex('#185470', '#0b3e5f', this.averageElevation + 1);
    } else {
      this.water = false;
      this.colour = this.PickHex('#196b2f', '#48893e', this.averageElevation);
    }
  }

  FindElevation(x, y) {
    let elevation = 0;

    // Find simplex noise elevation
    for (let i = 0; i < this.options.octaves; i += 1) {
      const freq = (this.options.lacunarity ** i) / this.options.scale;
      const amp = this.options.persistance ** i;
      elevation += NoiseGenerator.noise3D((x * freq), (y * freq), i * 100) * amp;
    }

    const falloff = this.GetFalloff(x, y);
    elevation -= falloff;

    return { elevation, falloff };
  }

  GetFalloff(sx, sy) {
    let x = sx / this.options.width * 2 - 1;
    let y = sy / this.options.height * 2 - 1;

    x **= this.options.falloff;
    y **= this.options.falloff;

    return Math.max(Math.abs(x), Math.abs(y));
  }

  PickHex(startColour, endColour, percentage) {
    const sc = Utility.HexToRgb(startColour);
    const ec = Utility.HexToRgb(endColour);
    const w1 = percentage;
    const w2 = 1 - percentage;
    const r = Utility.RgbToHex([
      Math.round(sc[0] * w1 + ec[0] * w2),
      Math.round(sc[1] * w1 + ec[1] * w2),
      Math.round(sc[2] * w1 + ec[2] * w2),
    ]);
    return r;
  }
}

class World {
  constructor(options) {
    if (options.seed !== '') {
      Random.use(SeedRandom(options.seed));
    }
    NoiseGenerator = new SimplexNoise(options.seed);

    this.options = options;
    this.tiles = this.GenerateTiles();
    this.tiles.map(tile => tile.Finalise());
  }

  GenerateTiles() {
    let points = Array.from({ length: this.options.points },
      (v, i) => [Random.float(0, this.options.width), Random.float(0, this.options.height)]);

    let tiles = this.GenerateVoronoi(points);

    // Smooth positions based on tile cebters
    for (let i = 0; i < this.options.smoothing; i += 1) {
      points = tiles.map(tile => [tile.center[0], tile.center[1]]);
      tiles = this.GenerateVoronoi(points);
    }
    return tiles;
  }

  GenerateVoronoi(points) {
    const voronoi = Delaunay.from(points).voronoi([0, 0, this.options.width, this.options.height]);
    const tiles = [];
    for (let i = 0; i < this.options.points; i += 1) {
      tiles.push(new Tile(this.options, voronoi.cellPolygon(i), voronoi.renderCell(i)));
    }
    return tiles;
  }
}

module.exports = World;
