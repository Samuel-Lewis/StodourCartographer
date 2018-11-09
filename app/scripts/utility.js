export function Distance(a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

export function HexToRgb(hex) {
  return [`0x${hex[1]}${hex[2]}` | 0, `0x${hex[3]}${hex[4]}` | 0, `0x${hex[5]}${hex[6]}` | 0];
}

export function RgbToHex(col) {
  return `#${((1 << 24) + (col[0] << 16) + (col[1] << 8) + col[2]).toString(16).slice(1)}`;
}
