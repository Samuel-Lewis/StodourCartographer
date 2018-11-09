class Viewer {
  constructor(options, world) {
    this.options = options;
    this.world = world;
    this.svg = document.getElementById('svg-base');
  }

  Render() {
    this.svg.setAttribute('width', this.options.width);
    this.svg.setAttribute('height', this.options.height);
    // Clear the current svg
    this.svg.innerHTML = '';

    // Generate the new parts
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (let i = 0; i < this.world.tiles.length; i += 1) {
      const part = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const tile = this.world.tiles[i];
      part.setAttribute('d', tile.svgPath);
      part.setAttribute('class', 'region');
      part.setAttribute('fill', tile.colour);
      part.setAttribute('stroke', tile.colour);
      part.setAttribute('stroke-width', '1');
      part.addEventListener('mouseover', () => { this.Change(part, 'stroke', 'red'); });
      part.addEventListener('mouseover', () => { this.Change(part, 'stroke-width', '3'); });
      part.addEventListener('mouseout', () => { this.Change(part, 'stroke', tile.colour); });
      part.addEventListener('mouseout', () => { this.Change(part, 'stroke-width', '1'); });
      part.addEventListener('mouseout', () => { this.Debug(tile); });
      group.appendChild(part);
    }

    if (this.options.filter) {
      group.setAttribute('filter', 'url(#noise)');
    }
    this.svg.appendChild(this.CreateNoiseFilter());
    this.svg.appendChild(group);
  }

  CreateNoiseFilter() {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'noise');
    if (!this.options.filter) {
      return filter;
    }

    const turb = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
    turb.setAttribute('type', 'fractalNoise');
    turb.setAttribute('baseFrequency', '30');
    turb.setAttribute('result', 'noisy');

    const matrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    matrix.setAttribute('type', 'saturate');
    matrix.setAttribute('values', '0');

    const blend = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
    blend.setAttribute('in', 'SourceGraphic');
    blend.setAttribute('in2', 'noisy');
    blend.setAttribute('mode', 'multiply');

    filter.appendChild(turb);
    filter.appendChild(matrix);
    filter.appendChild(blend);
    return filter;
  }

  Change(part, attribute, value) {
    part.setAttribute(attribute, value);
  }

  Debug(tile) {
    const d = document.getElementById('debug');
    d.innerHTML = `(x,y): (${tile.center[0]},${tile.center[1]}) <br>`;
    d.innerHTML += `lowest point: ${tile.lowestPoint}<br>`;
    d.innerHTML += `highest point: ${tile.highestPoint}<br>`;
    d.innerHTML += '<br>';

    for (const prop in tile.el) {
      d.innerHTML += `${prop}: ${tile.el[prop]}<br>`;
    }
  }
}

module.exports = Viewer;
