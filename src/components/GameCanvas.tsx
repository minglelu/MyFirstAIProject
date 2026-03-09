import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { SkillType } from '../game/Entities';

interface GameCanvasProps {
  mode: string;
  difficulty: string;
  p1Skill: SkillType;
  p2Skill: SkillType;
  onGameOver: (winner: string) => void;
}

export default function GameCanvas({ mode, difficulty, p1Skill, p2Skill, onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const engine = new GameEngine(canvasRef.current, mode, difficulty, p1Skill, p2Skill, onGameOver);
    engine.start();
    
    return () => {
      engine.stop();
    };
  }, [mode, difficulty, p1Skill, p2Skill, onGameOver]);
  
  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-8 text-sm text-zinc-400">
        <div><span className="text-blue-500 font-bold">Player 1:</span> WASD to move, Q to shoot, E to use skill</div>
        {mode === 'pvp' && <div><span className="text-red-500 font-bold">Player 2:</span> Arrows to move, M to shoot, Shift to use skill</div>}
      </div>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={640} 
        className="bg-zinc-900 shadow-2xl rounded-lg border-4 border-zinc-800"
      />
    </div>
  );
}
