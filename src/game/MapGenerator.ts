import { Rect } from './utils';

export type TerrainType = 'normal' | 'mud' | 'ice';

export interface Cell {
  c: number;
  r: number;
  visited: boolean;
  terrain: TerrainType;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
}

export class MapGenerator {
  static generate(cols: number, rows: number, cellSize: number, wallThickness: number): { cells: Cell[], rects: Rect[] } {
    const cells: Cell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Randomly assign terrain, mostly normal
        let terrain: TerrainType = 'normal';
        const rand = Math.random();
        if (rand < 0.1) terrain = 'mud';
        else if (rand < 0.2) terrain = 'ice';
        
        cells.push({ c, r, visited: false, terrain, walls: { top: true, right: true, bottom: true, left: true } });
      }
    }
    
    const getCell = (c: number, r: number) => {
      if (c < 0 || c >= cols || r < 0 || r >= rows) return undefined;
      return cells[r * cols + c];
    };

    const stack: Cell[] = [];
    let current = cells[0];
    current.visited = true;

    let unvisitedCount = cols * rows - 1;

    while (unvisitedCount > 0) {
      const neighbors: { cell: Cell, dir: string }[] = [];
      const top = getCell(current.c, current.r - 1);
      const right = getCell(current.c + 1, current.r);
      const bottom = getCell(current.c, current.r + 1);
      const left = getCell(current.c - 1, current.r);

      if (top && !top.visited) neighbors.push({ cell: top, dir: 'top' });
      if (right && !right.visited) neighbors.push({ cell: right, dir: 'right' });
      if (bottom && !bottom.visited) neighbors.push({ cell: bottom, dir: 'bottom' });
      if (left && !left.visited) neighbors.push({ cell: left, dir: 'left' });

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        stack.push(current);

        if (next.dir === 'top') { current.walls.top = false; next.cell.walls.bottom = false; }
        else if (next.dir === 'right') { current.walls.right = false; next.cell.walls.left = false; }
        else if (next.dir === 'bottom') { current.walls.bottom = false; next.cell.walls.top = false; }
        else if (next.dir === 'left') { current.walls.left = false; next.cell.walls.right = false; }

        current = next.cell;
        current.visited = true;
        unvisitedCount--;
      } else if (stack.length > 0) {
        current = stack.pop()!;
      }
    }

    // Loops
    const loopCount = Math.floor((cols * rows) * 0.15);
    for (let i = 0; i < loopCount; i++) {
      const cell = cells[Math.floor(Math.random() * cells.length)];
      const dirs = ['top', 'right', 'bottom', 'left'];
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      
      if (dir === 'top' && cell.r > 0) { cell.walls.top = false; getCell(cell.c, cell.r - 1)!.walls.bottom = false; }
      if (dir === 'right' && cell.c < cols - 1) { cell.walls.right = false; getCell(cell.c + 1, cell.r)!.walls.left = false; }
      if (dir === 'bottom' && cell.r < rows - 1) { cell.walls.bottom = false; getCell(cell.c, cell.r + 1)!.walls.top = false; }
      if (dir === 'left' && cell.c > 0) { cell.walls.left = false; getCell(cell.c - 1, cell.r)!.walls.right = false; }
    }

    const rects: Rect[] = [];
    rects.push({ x: 0, y: 0, w: cols * cellSize, h: wallThickness });
    rects.push({ x: 0, y: rows * cellSize - wallThickness, w: cols * cellSize, h: wallThickness });
    rects.push({ x: 0, y: 0, w: wallThickness, h: rows * cellSize });
    rects.push({ x: cols * cellSize - wallThickness, y: 0, w: wallThickness, h: rows * cellSize });

    for (const cell of cells) {
      const cx = cell.c * cellSize;
      const cy = cell.r * cellSize;
      if (cell.walls.top) rects.push({ x: cx, y: cy, w: cellSize, h: wallThickness });
      if (cell.walls.right) rects.push({ x: cx + cellSize - wallThickness, y: cy, w: wallThickness, h: cellSize });
      if (cell.walls.bottom) rects.push({ x: cx, y: cy + cellSize - wallThickness, w: cellSize, h: wallThickness });
      if (cell.walls.left) rects.push({ x: cx, y: cy, w: wallThickness, h: cellSize });
    }

    return { cells, rects };
  }
}
