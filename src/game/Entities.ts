import { Rect, circleRectCollide } from './utils';

export class Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number = 4;
  bounces: number = 5;
  maxBounces: number = 5;
  ownerId: string;
  active: boolean = true;
  speed: number = 300;
  isHoming: boolean = false;
  lifeTime: number = 10;
  
  constructor(x: number, y: number, angle: number, ownerId: string, type: string) {
    this.x = x;
    this.y = y;
    this.ownerId = ownerId;
    
    if (type === 'laser') {
      this.speed = 600;
      this.maxBounces = 1;
    } else if (type === 'bouncy') {
      this.maxBounces = 12;
    } else if (type === 'shotgun') {
      this.speed = 250;
      this.maxBounces = 2;
    } else if (type === 'homing') {
      this.speed = 200;
      this.maxBounces = 2;
      this.isHoming = true;
    }
    this.bounces = this.maxBounces;
    
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }
  
  update(dt: number, walls: Rect[], target?: Tank) {
    if (!this.active) return;
    
    this.lifeTime -= dt;
    if (this.lifeTime <= 0) {
      this.active = false;
      return;
    }
    
    if (this.isHoming && target && target.active) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const targetAngle = Math.atan2(dy, dx);
      const currentAngle = Math.atan2(this.vy, this.vx);
      
      let angleDiff = targetAngle - currentAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      
      const turnSpeed = Math.PI * 2; // radians per second
      const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnSpeed * dt);
      
      this.vx = Math.cos(newAngle) * this.speed;
      this.vy = Math.sin(newAngle) * this.speed;
    }
    
    const nextX = this.x + this.vx * dt;
    const nextY = this.y + this.vy * dt;
    
    let hitWall = false;
    let hitVertical = false;
    let hitHorizontal = false;
    
    for (const wall of walls) {
      if (circleRectCollide({ x: nextX, y: nextY, r: this.r }, wall)) {
        hitWall = true;
        if (this.x + this.r <= wall.x || this.x - this.r >= wall.x + wall.w) {
          hitVertical = true;
        }
        if (this.y + this.r <= wall.y || this.y - this.r >= wall.y + wall.h) {
          hitHorizontal = true;
        }
      }
    }
    
    if (hitWall) {
      if (this.bounces > 0) {
        this.bounces--;
        if (hitVertical) this.vx *= -1;
        else if (hitHorizontal) this.vy *= -1;
        else { this.vx *= -1; this.vy *= -1; }
        
        this.x += this.vx * dt;
        this.y += this.vy * dt;
      } else {
        this.active = false;
      }
    } else {
      this.x = nextX;
      this.y = nextY;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.isHoming ? '#f0f' : '#fff';
    ctx.fill();
    ctx.closePath();
  }
}

export class Mine {
  x: number;
  y: number;
  r: number = 8;
  ownerId: string;
  active: boolean = true;
  timer: number = 0;
  
  constructor(x: number, y: number, ownerId: string) {
    this.x = x;
    this.y = y;
    this.ownerId = ownerId;
  }
  
  update(dt: number) {
    this.timer += dt;
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.timer < 1 ? '#555' : '#e11d48';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
    
    if (this.timer >= 1 && Math.floor(this.timer * 4) % 2 === 0) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      ctx.closePath();
    }
  }
}

export type SkillType = 'dash' | 'ghost' | 'mine' | 'emp' | 'homing';

export class Tank {
  id: string;
  x: number;
  y: number;
  r: number = 14;
  angle: number;
  color: string;
  speed: number = 150;
  rotSpeed: number = Math.PI;
  
  isAI: boolean = false;
  
  powerup: string | null = null;
  powerupTimer: number = 0;
  shieldTimer: number = 0;
  
  skill: SkillType;
  skillCooldown: number = 0;
  skillMaxCooldown: number = 8;
  
  ghostTimer: number = 0;
  empTimer: number = 0;
  homingTimer: number = 0;
  dashTimer: number = 0;
  
  cooldown: number = 0;
  active: boolean = true;
  
  constructor(id: string, x: number, y: number, angle: number, color: string, skill: SkillType, isAI: boolean = false) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.color = color;
    this.skill = skill;
    this.isAI = isAI;
  }
  
  update(dt: number, walls: Rect[], terrainType: string, input: { forward: boolean, backward: boolean, left: boolean, right: boolean, shoot: boolean, useSkill: boolean }, fireCallback: (t: Tank) => void, skillCallback: (t: Tank) => void) {
    if (!this.active) return;
    
    if (this.powerupTimer > 0) {
      this.powerupTimer -= dt;
      if (this.powerupTimer <= 0) this.powerup = null;
    }
    if (this.shieldTimer > 0) this.shieldTimer -= dt;
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.skillCooldown > 0) this.skillCooldown -= dt;
    
    if (this.ghostTimer > 0) this.ghostTimer -= dt;
    if (this.empTimer > 0) this.empTimer -= dt;
    if (this.homingTimer > 0) this.homingTimer -= dt;
    if (this.dashTimer > 0) this.dashTimer -= dt;
    
    if (this.empTimer > 0) return; // Stunned
    
    if (input.useSkill && this.skillCooldown <= 0) {
      this.skillCooldown = this.skillMaxCooldown;
      skillCallback(this);
      
      switch (this.skill) {
        case 'dash': this.dashTimer = 0.2; break;
        case 'ghost': this.ghostTimer = 3; break;
        case 'homing': this.homingTimer = 4; break;
        // mine and emp handled in GameEngine via callback
      }
    }
    
    let currentSpeed = this.speed;
    if (this.powerup === 'speed') currentSpeed *= 1.5;
    if (this.dashTimer > 0) currentSpeed *= 4;
    
    if (terrainType === 'mud') currentSpeed *= 0.5;
    
    let currentRotSpeed = this.rotSpeed;
    if (terrainType === 'ice') currentRotSpeed *= 0.7; // harder to turn on ice
    
    if (input.left) this.angle -= currentRotSpeed * dt;
    if (input.right) this.angle += currentRotSpeed * dt;
    
    let moveDir = 0;
    if (input.forward) moveDir = 1;
    if (input.backward) moveDir = -1;
    
    if (moveDir !== 0 || this.dashTimer > 0) {
      const actualMoveDir = this.dashTimer > 0 ? 1 : moveDir;
      const nextX = this.x + Math.cos(this.angle) * currentSpeed * dt * actualMoveDir;
      const nextY = this.y + Math.sin(this.angle) * currentSpeed * dt * actualMoveDir;
      
      let canMoveX = true;
      let canMoveY = true;
      
      if (this.ghostTimer <= 0) {
        for (const wall of walls) {
          if (circleRectCollide({ x: nextX, y: this.y, r: this.r }, wall)) canMoveX = false;
          if (circleRectCollide({ x: this.x, y: nextY, r: this.r }, wall)) canMoveY = false;
        }
      }
      
      if (canMoveX) this.x = nextX;
      if (canMoveY) this.y = nextY;
    }
    
    if (input.shoot && this.cooldown <= 0) {
      fireCallback(this);
      this.cooldown = this.powerup === 'machinegun' ? 0.1 : 0.25;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    
    if (this.ghostTimer > 0) ctx.globalAlpha = 0.4;
    
    if (this.shieldTimer > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, this.r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    if (this.empTimer > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, this.r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#eab308';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.r, -this.r + 2, this.r * 2, this.r * 2 - 4);
    
    ctx.fillStyle = '#aaa';
    ctx.fillRect(0, -3, this.r + 8, 6);
    
    ctx.restore();
    
    // Draw skill cooldown bar
    if (this.skillCooldown > 0) {
      const ratio = 1 - (this.skillCooldown / this.skillMaxCooldown);
      ctx.fillStyle = '#333';
      ctx.fillRect(this.x - 15, this.y + 20, 30, 4);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(this.x - 15, this.y + 20, 30 * ratio, 4);
    }
  }
}

export class Item {
  x: number;
  y: number;
  r: number = 10;
  type: string;
  active: boolean = true;
  
  constructor(x: number, y: number, type: string) {
    this.x = x;
    this.y = y;
    this.type = type;
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    
    switch (this.type) {
      case 'shotgun': ctx.fillStyle = '#ef4444'; break;
      case 'laser': ctx.fillStyle = '#22c55e'; break;
      case 'bouncy': ctx.fillStyle = '#eab308'; break;
      case 'speed': ctx.fillStyle = '#3b82f6'; break;
      case 'shield': ctx.fillStyle = '#06b6d4'; break;
      case 'machinegun': ctx.fillStyle = '#d946ef'; break;
      default: ctx.fillStyle = '#fff';
    }
    
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 10px Arial';
    ctx.fillText(this.type[0].toUpperCase(), this.x, this.y);
  }
}
