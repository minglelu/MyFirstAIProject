import { Tank } from './Entities';
import { Cell } from './MapGenerator';
import { Rect, lineRectCollide } from './utils';

export class AIController {
  tank: Tank;
  target: Tank;
  difficulty: string;
  cells: Cell[];
  cols: number;
  cellSize: number;
  walls: Rect[];
  
  path: Cell[] = [];
  repathTimer: number = 0;
  
  constructor(tank: Tank, target: Tank, difficulty: string, cells: Cell[], cols: number, cellSize: number, walls: Rect[]) {
    this.tank = tank;
    this.target = target;
    this.difficulty = difficulty;
    this.cells = cells;
    this.cols = cols;
    this.cellSize = cellSize;
    this.walls = walls;
  }
  
  update(dt: number) {
    if (!this.tank.active || !this.target.active) return { forward: false, backward: false, left: false, right: false, shoot: false, useSkill: false };
    
    let input = { forward: false, backward: false, left: false, right: false, shoot: false, useSkill: false };
    
    this.repathTimer -= dt;
    if (this.repathTimer <= 0) {
      this.repathTimer = this.difficulty === 'hard' ? 0.3 : (this.difficulty === 'medium' ? 0.8 : 1.5);
      this.findPath();
    }
    
    // Movement
    if (this.path.length > 0) {
      const nextCell = this.path[0];
      const targetX = nextCell.c * this.cellSize + this.cellSize / 2;
      const targetY = nextCell.r * this.cellSize + this.cellSize / 2;
      
      const dx = targetX - this.tank.x;
      const dy = targetY - this.tank.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < 10) {
        this.path.shift();
      } else {
        const targetAngle = Math.atan2(dy, dx);
        let angleDiff = targetAngle - this.tank.angle;
        
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        if (Math.abs(angleDiff) > 0.1) {
          if (angleDiff > 0) input.right = true;
          else input.left = true;
        } else {
          input.forward = true;
        }
      }
    } else if (this.difficulty === 'easy') {
      if (Math.random() < 0.05) input.left = true;
      else if (Math.random() < 0.05) input.right = true;
      input.forward = true;
    }
    
    // Shooting & Skills
    let hasLOS = true;
    for (const wall of this.walls) {
      if (lineRectCollide(this.tank.x, this.tank.y, this.target.x, this.target.y, wall)) {
        hasLOS = false;
        break;
      }
    }
    
    const distToTarget = Math.sqrt(Math.pow(this.target.x - this.tank.x, 2) + Math.pow(this.target.y - this.tank.y, 2));
    
    if (hasLOS) {
      const dx = this.target.x - this.tank.x;
      const dy = this.target.y - this.tank.y;
      const targetAngle = Math.atan2(dy, dx);
      let angleDiff = targetAngle - this.tank.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      
      if (Math.abs(angleDiff) > 0.1) {
        if (angleDiff > 0) input.right = true;
        else input.left = true;
      } else {
        input.shoot = true;
      }
      
      if (this.difficulty === 'hard' || this.difficulty === 'medium') {
        if (this.tank.skill === 'emp' || this.tank.skill === 'homing') {
          input.useSkill = true;
        }
        if (this.tank.skill === 'dash' && distToTarget > 150) {
          input.useSkill = true;
        }
      }
    }
    
    if (this.difficulty === 'hard') {
      if (this.tank.skill === 'mine' && distToTarget < 100 && !hasLOS) {
        input.useSkill = true;
      }
      if (this.tank.skill === 'ghost' && !hasLOS && distToTarget < 150) {
        input.useSkill = true;
      }
    } else if (this.difficulty === 'easy') {
      if (Math.random() < 0.01) input.useSkill = true;
    }
    
    return input;
  }
  
  findPath() {
    const startC = Math.floor(this.tank.x / this.cellSize);
    const startR = Math.floor(this.tank.y / this.cellSize);
    const targetC = Math.floor(this.target.x / this.cellSize);
    const targetR = Math.floor(this.target.y / this.cellSize);
    
    const startCell = this.cells.find(c => c.c === startC && c.r === startR);
    const targetCell = this.cells.find(c => c.c === targetC && c.r === targetR);
    
    if (!startCell || !targetCell) return;
    
    const queue: { cell: Cell, path: Cell[] }[] = [{ cell: startCell, path: [] }];
    const visited = new Set<Cell>();
    visited.add(startCell);
    
    while (queue.length > 0) {
      const { cell, path } = queue.shift()!;
      
      if (cell === targetCell) {
        this.path = path;
        return;
      }
      
      const neighbors = [];
      if (!cell.walls.top) neighbors.push(this.cells.find(c => c.c === cell.c && c.r === cell.r - 1));
      if (!cell.walls.right) neighbors.push(this.cells.find(c => c.c === cell.c + 1 && c.r === cell.r));
      if (!cell.walls.bottom) neighbors.push(this.cells.find(c => c.c === cell.c && c.r === cell.r + 1));
      if (!cell.walls.left) neighbors.push(this.cells.find(c => c.c === cell.c - 1 && c.r === cell.r));
      
      for (const n of neighbors) {
        if (n && !visited.has(n)) {
          visited.add(n);
          queue.push({ cell: n, path: [...path, n] });
        }
      }
    }
  }
}
