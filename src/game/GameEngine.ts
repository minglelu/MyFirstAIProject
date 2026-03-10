import { MapGenerator, Cell } from './MapGenerator';
import { Tank, Bullet, Item, Mine, SkillType } from './Entities';
import { Rect, circleCircleCollide } from './utils';

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  
  mode: string;
  difficulty: string;
  p1Skill: SkillType;
  p2Skill: SkillType;
  onGameOver: (winner: string) => void;
  
  tanks: Tank[] = [];
  bullets: Bullet[] = [];
  items: Item[] = [];
  mines: Mine[] = [];
  walls: Rect[] = [];
  cells: Cell[] = [];
  
  cols = 10;
  rows = 8;
  cellSize = 80;
  wallThickness = 10;
  
  lastTime = 0;
  reqId = 0;
  
  keys: Record<string, boolean> = {};
  
  itemSpawnTimer = 5;
  
  constructor(canvas: HTMLCanvasElement, mode: string, difficulty: string, p1Skill: SkillType, p2Skill: SkillType, onGameOver: (winner: string) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.mode = mode;
    this.difficulty = difficulty;
    this.p1Skill = p1Skill;
    this.p2Skill = p2Skill;
    this.onGameOver = onGameOver;
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.loop = this.loop.bind(this);
  }
  
  start() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    const { cells, rects } = MapGenerator.generate(this.cols, this.rows, this.cellSize, this.wallThickness);
    this.cells = cells;
    this.walls = rects;
    
    const p1Cell = this.cells[0];
    const p2Cell = this.cells[this.cells.length - 1];
    
    const p1 = new Tank('Player 1', p1Cell.c * this.cellSize + this.cellSize/2, p1Cell.r * this.cellSize + this.cellSize/2, 0, '#3b82f6', this.p1Skill);
    const p2 = new Tank('Player 2', p2Cell.c * this.cellSize + this.cellSize/2, p2Cell.r * this.cellSize + this.cellSize/2, Math.PI, '#ef4444', this.p2Skill);
    
    this.tanks.push(p1, p2);
    
    this.lastTime = performance.now();
    this.reqId = requestAnimationFrame(this.loop);
  }
  
  stop() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    cancelAnimationFrame(this.reqId);
  }
  
  handleKeyDown(e: KeyboardEvent) { 
    this.keys[e.code] = true; 
    if (e.key) this.keys[e.key.toLowerCase()] = true;
    
    // Prevent default browser actions for game keys (scrolling, IME composition, etc.)
    const gameKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd', 'q', 'e', 'm', 'shift'];
    if (e.key && gameKeys.includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  }
  handleKeyUp(e: KeyboardEvent) { 
    this.keys[e.code] = false; 
    if (e.key) this.keys[e.key.toLowerCase()] = false;
    
    const gameKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd', 'q', 'e', 'm', 'shift'];
    if (e.key && gameKeys.includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  }
  
  fireBullet = (tank: Tank) => {
    let type = tank.powerup || 'normal';
    if (tank.homingTimer > 0) type = 'homing';
    
    const spawnDist = tank.r + 12;
    const bx = tank.x + Math.cos(tank.angle) * spawnDist;
    const by = tank.y + Math.sin(tank.angle) * spawnDist;
    
    if (type === 'shotgun') {
      this.bullets.push(new Bullet(bx, by, tank.angle - 0.2, tank.id, 'shotgun'));
      this.bullets.push(new Bullet(bx, by, tank.angle, tank.id, 'shotgun'));
      this.bullets.push(new Bullet(bx, by, tank.angle + 0.2, tank.id, 'shotgun'));
    } else {
      this.bullets.push(new Bullet(bx, by, tank.angle, tank.id, type));
    }
  }
  
  activateSkill = (tank: Tank) => {
    if (tank.skill === 'mine') {
      this.mines.push(new Mine(tank.x, tank.y, tank.id));
    } else if (tank.skill === 'emp') {
      for (const t of this.tanks) {
        if (t.id !== tank.id) {
          t.empTimer = 2; // Stun for 2 seconds
        }
      }
    }
  }
  
  loop(time: number) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;
    
    this.update(dt);
    this.draw();
    
    const activeTanks = this.tanks.filter(t => t.active);
    if (activeTanks.length <= 1) {
      setTimeout(() => {
        this.onGameOver(activeTanks.length === 1 ? activeTanks[0].id : 'Draw');
      }, 1000);
      return;
    }
    
    this.reqId = requestAnimationFrame(this.loop);
  }
  
  update(dt: number) {
    this.itemSpawnTimer -= dt;
    if (this.itemSpawnTimer <= 0 && this.items.length < 3) {
      this.itemSpawnTimer = 5 + Math.random() * 5;
      const cell = this.cells[Math.floor(Math.random() * this.cells.length)];
      const types = ['shotgun', 'laser', 'bouncy', 'speed', 'shield', 'machinegun'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.items.push(new Item(cell.c * this.cellSize + this.cellSize/2, cell.r * this.cellSize + this.cellSize/2, type));
    }
    
    const p1Input = {
      forward: this.keys['KeyW'] || this.keys['w'], 
      backward: this.keys['KeyS'] || this.keys['s'],
      left: this.keys['KeyA'] || this.keys['a'], 
      right: this.keys['KeyD'] || this.keys['d'],
      shoot: this.keys['KeyQ'] || this.keys['q'] || this.keys['Space'] || this.keys[' '],
      useSkill: this.keys['KeyE'] || this.keys['e']
    };
    
    let p2Input = {
      forward: this.keys['ArrowUp'], backward: this.keys['ArrowDown'],
      left: this.keys['ArrowLeft'], right: this.keys['ArrowRight'],
      shoot: this.keys['KeyM'] || this.keys['m'] || this.keys['Enter'],
      useSkill: this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['shift']
    };
    
    for (const tank of this.tanks) {
      if (!tank.active) continue;
      const cellC = Math.floor(tank.x / this.cellSize);
      const cellR = Math.floor(tank.y / this.cellSize);
      const cell = this.cells.find(c => c.c === cellC && c.r === cellR);
      const terrainType = cell ? cell.terrain : 'normal';
      
      const input = tank.id === 'Player 1' ? p1Input : p2Input;
      tank.update(dt, this.walls, terrainType, input, this.fireBullet, this.activateSkill);
    }
    
    for (const bullet of this.bullets) {
      const target = this.tanks.find(t => t.id !== bullet.ownerId);
      bullet.update(dt, this.walls, target);
      
      if (bullet.active) {
        for (const tank of this.tanks) {
          if (tank.active && circleCircleCollide(bullet, tank)) {
            if (tank.shieldTimer > 0) {
              bullet.active = false;
            } else {
              tank.active = false;
              bullet.active = false;
            }
          }
        }
      }
    }
    
    for (const mine of this.mines) {
      mine.update(dt);
      if (mine.active && mine.timer >= 1) { // Armed
        for (const tank of this.tanks) {
          if (tank.active && circleCircleCollide(mine, tank)) {
            mine.active = false;
            if (tank.shieldTimer <= 0) {
              tank.active = false;
            }
          }
        }
      }
    }
    
    for (const item of this.items) {
      if (!item.active) continue;
      for (const tank of this.tanks) {
        if (tank.active && circleCircleCollide(item, tank)) {
          item.active = false;
          if (item.type === 'shield') tank.shieldTimer = 5;
          else {
            tank.powerup = item.type;
            tank.powerupTimer = 10;
          }
        }
      }
    }
    
    this.bullets = this.bullets.filter(b => b.active);
    this.items = this.items.filter(i => i.active);
    this.mines = this.mines.filter(m => m.active);
  }
  
  draw() {
    this.ctx.fillStyle = '#18181b';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw terrain
    for (const cell of this.cells) {
      if (cell.terrain === 'mud') {
        this.ctx.fillStyle = '#451a03'; // Dark brown
        this.ctx.fillRect(cell.c * this.cellSize, cell.r * this.cellSize, this.cellSize, this.cellSize);
      } else if (cell.terrain === 'ice') {
        this.ctx.fillStyle = '#082f49'; // Dark blue
        this.ctx.fillRect(cell.c * this.cellSize, cell.r * this.cellSize, this.cellSize, this.cellSize);
      }
    }
    
    this.ctx.fillStyle = '#3f3f46';
    for (const wall of this.walls) {
      this.ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    }
    
    for (const item of this.items) item.draw(this.ctx);
    for (const mine of this.mines) mine.draw(this.ctx);
    for (const tank of this.tanks) tank.draw(this.ctx);
    for (const bullet of this.bullets) bullet.draw(this.ctx);
  }
}
