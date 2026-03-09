export interface Rect { x: number; y: number; w: number; h: number; }
export interface Circle { x: number; y: number; r: number; }
export interface Point { x: number; y: number; }

export function circleRectCollide(c: Circle, r: Rect): boolean {
  let testX = c.x;
  let testY = c.y;

  if (c.x < r.x) testX = r.x;
  else if (c.x > r.x + r.w) testX = r.x + r.w;

  if (c.y < r.y) testY = r.y;
  else if (c.y > r.y + r.h) testY = r.y + r.h;

  let distX = c.x - testX;
  let distY = c.y - testY;
  let distance = Math.sqrt((distX*distX) + (distY*distY));

  return distance <= c.r;
}

export function lineRectCollide(x1: number, y1: number, x2: number, y2: number, r: Rect): boolean {
  const left = lineLineCollide(x1, y1, x2, y2, r.x, r.y, r.x, r.y + r.h);
  const right = lineLineCollide(x1, y1, x2, y2, r.x + r.w, r.y, r.x + r.w, r.y + r.h);
  const top = lineLineCollide(x1, y1, x2, y2, r.x, r.y, r.x + r.w, r.y);
  const bottom = lineLineCollide(x1, y1, x2, y2, r.x, r.y + r.h, r.x + r.w, r.y + r.h);
  
  const inside1 = x1 >= r.x && x1 <= r.x + r.w && y1 >= r.y && y1 <= r.y + r.h;
  const inside2 = x2 >= r.x && x2 <= r.x + r.w && y2 >= r.y && y2 <= r.y + r.h;
  
  return left || right || top || bottom || inside1 || inside2;
}

function lineLineCollide(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): boolean {
  const den = ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  if (den === 0) return false;
  const uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / den;
  const uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / den;
  return (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1);
}

export function circleCircleCollide(c1: Circle, c2: Circle): boolean {
  const dx = c1.x - c2.x;
  const dy = c1.y - c2.y;
  return Math.sqrt(dx*dx + dy*dy) <= c1.r + c2.r;
}
