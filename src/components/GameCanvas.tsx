import React, { useEffect, useRef, useState } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [imeWarning, setImeWarning] = useState(false);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Focus the hidden password input to disable IME
    if (inputRef.current) {
      inputRef.current.focus();
    } else {
      canvasRef.current.focus();
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Process' || e.keyCode === 229) {
        setImeWarning(true);
      } else if (e.key && e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
        // If they type a normal letter, they might have turned it off, but let's just clear it if they press a clean key
        setImeWarning(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    const engine = new GameEngine(canvasRef.current, mode, difficulty, p1Skill, p2Skill, onGameOver);
    engine.start();
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      engine.stop();
    };
  }, [mode, difficulty, p1Skill, p2Skill, onGameOver]);
  
  const handleInteract = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <div className="flex flex-col items-center relative" onClick={handleInteract} onMouseEnter={handleInteract}>
      <div className="mb-4 flex gap-8 text-sm text-zinc-400">
        <div><span className="text-blue-500 font-bold">玩家 1:</span> WASD 移动，Q 射击，E 技能</div>
        <div><span className="text-red-500 font-bold">玩家 2:</span> 方向键 移动，M 射击，Shift 技能</div>
      </div>
      
      {/* Hidden password input to force disable IME */}
      <input 
        type="password" 
        ref={inputRef}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        autoComplete="off"
        tabIndex={-1}
      />
      
      {imeWarning && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-2xl z-50 animate-bounce flex items-center gap-2">
          <span>⚠️</span>
          检测到中文输入法！请点击游戏画面或切换到英文输入法！
        </div>
      )}
      
      <canvas 
        ref={canvasRef} 
        tabIndex={0}
        width={800} 
        height={640} 
        className="bg-zinc-900 shadow-2xl rounded-lg border-4 border-zinc-800 outline-none focus:border-blue-500/50 transition-colors"
      />
    </div>
  );
}
