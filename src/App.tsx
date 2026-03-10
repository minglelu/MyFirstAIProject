/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import { Swords, Trophy, Zap, Ghost, Bomb, Radio, Target, Info, X } from 'lucide-react';
import { SkillType } from './game/Entities';

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [winner, setWinner] = useState<string>('');
  const [showGuide, setShowGuide] = useState(false);
  
  const [p1Skill, setP1Skill] = useState<SkillType>('dash');
  const [p2Skill, setP2Skill] = useState<SkillType>('mine');

  const startGame = () => {
    setGameState('playing');
  };

  const handleGameOver = (win: string) => {
    setWinner(win);
    setGameState('gameover');
  };

  const skills: { id: SkillType, name: string, icon: React.ReactNode, desc: string }[] = [
    { id: 'dash', name: '冲刺', icon: <Zap size={16} />, desc: '瞬间高速移动' },
    { id: 'ghost', name: '幽灵', icon: <Ghost size={16} />, desc: '穿透墙壁' },
    { id: 'mine', name: '地雷', icon: <Bomb size={16} />, desc: '放置爆炸物' },
    { id: 'emp', name: '电磁脉冲', icon: <Radio size={16} />, desc: '瘫痪敌人' },
    { id: 'homing', name: '追踪', icon: <Target size={16} />, desc: '子弹自动追踪' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-sans">
      
      {gameState === 'menu' && (
        <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-zinc-800 relative">
          <button 
            onClick={() => setShowGuide(true)}
            className="absolute top-6 right-6 text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-2 text-sm font-bold bg-zinc-800 px-3 py-1.5 rounded-full"
          >
            <Info size={16} /> 新手指南
          </button>

          <h1 className="text-4xl font-black text-center mb-8 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-500">
            坦克动荡
          </h1>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block">玩家1技能</label>
                <div className="space-y-2">
                  {skills.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setP1Skill(s.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${p1Skill === s.id ? 'bg-blue-900/30 border-blue-500 border text-blue-100' : 'bg-zinc-800/50 border-transparent border text-zinc-400 hover:bg-zinc-800'}`}
                    >
                      <div className={p1Skill === s.id ? 'text-blue-400' : 'text-zinc-500'}>{s.icon}</div>
                      <div>
                        <div className="font-bold text-sm">{s.name}</div>
                        <div className="text-xs opacity-70">{s.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 block">玩家2技能</label>
                <div className="space-y-2">
                  {skills.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setP2Skill(s.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${p2Skill === s.id ? 'bg-red-900/30 border-red-500 border text-red-100' : 'bg-zinc-800/50 border-transparent border text-zinc-400 hover:bg-zinc-800'}`}
                    >
                      <div className={p2Skill === s.id ? 'text-red-400' : 'text-zinc-500'}>{s.icon}</div>
                      <div>
                        <div className="font-bold text-sm">{s.name}</div>
                        <div className="text-xs opacity-70">{s.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={startGame}
              className="w-full py-4 mt-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-lg rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              <Swords size={24} /> 开始双人对战
            </button>
          </div>
        </div>
      )}

      {showGuide && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 p-8 rounded-2xl max-w-2xl w-full border border-zinc-700 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800 p-2 rounded-full"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-black mb-6 text-blue-400">📖 坦克动荡 - 新手指南</h2>
            
            <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
              <section>
                <h3 className="text-lg font-bold text-white mb-2 border-b border-zinc-700 pb-1">🎮 基础操作</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-blue-400">玩家 1 (蓝车)</strong>：使用 <kbd className="bg-zinc-800 px-1 rounded">W</kbd> <kbd className="bg-zinc-800 px-1 rounded">A</kbd> <kbd className="bg-zinc-800 px-1 rounded">S</kbd> <kbd className="bg-zinc-800 px-1 rounded">D</kbd> 移动和转向，<kbd className="bg-zinc-800 px-1 rounded">Q</kbd> 或 <kbd className="bg-zinc-800 px-1 rounded">空格</kbd> 发射子弹，<kbd className="bg-zinc-800 px-1 rounded">E</kbd> 释放主动技能。</li>
                  <li><strong className="text-red-400">玩家 2 (红车)</strong>：使用 <kbd className="bg-zinc-800 px-1 rounded">↑</kbd> <kbd className="bg-zinc-800 px-1 rounded">↓</kbd> <kbd className="bg-zinc-800 px-1 rounded">←</kbd> <kbd className="bg-zinc-800 px-1 rounded">→</kbd> 移动和转向，<kbd className="bg-zinc-800 px-1 rounded">M</kbd> 或 <kbd className="bg-zinc-800 px-1 rounded">回车</kbd> 发射子弹，<kbd className="bg-zinc-800 px-1 rounded">Shift</kbd> 释放主动技能。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-white mb-2 border-b border-zinc-700 pb-1">⚠️ 核心机制 (必看!)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>子弹反弹：</strong> 射出的子弹会在墙壁上反弹（默认弹跳5次）。<span className="text-red-400 font-bold">小心！你自己的子弹也会炸死你自己！</span></li>
                  <li><strong>子弹冷却：</strong> 连续发射5发子弹后，坦克将进入2秒的装填冷却时间（血条下方红条显示）。</li>
                  <li><strong>地形影响：</strong> 黑色是普通地面；深棕色是泥地（减速50%）；深蓝色是冰面（转向变得困难）。</li>
                  <li><strong>随机地图：</strong> 每次开局都会生成一个全新的迷宫。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-white mb-2 border-b border-zinc-700 pb-1">🎁 战场道具 (吃掉它们获得强化)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="inline-block w-4 h-4 rounded-full bg-red-500 align-middle mr-2"></span><strong>S (霰弹)</strong>: 一次发射三发子弹。</div>
                  <div><span className="inline-block w-4 h-4 rounded-full bg-green-500 align-middle mr-2"></span><strong>L (激光)</strong>: 极速子弹，不反弹。</div>
                  <div><span className="inline-block w-4 h-4 rounded-full bg-yellow-500 align-middle mr-2"></span><strong>B (弹跳弹)</strong>: 可在墙上反弹12次！</div>
                  <div><span className="inline-block w-4 h-4 rounded-full bg-fuchsia-500 align-middle mr-2"></span><strong>M (机枪)</strong>: 极大幅度缩短射击冷却，且不消耗弹药。</div>
                  <div><span className="inline-block w-4 h-4 rounded-full bg-blue-500 align-middle mr-2"></span><strong>S (加速)</strong>: 提升坦克移动速度。</div>
                  <div><span className="inline-block w-4 h-4 rounded-full bg-cyan-500 align-middle mr-2"></span><strong>护盾</strong>: 获得5秒无敌状态。</div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-white mb-2 border-b border-zinc-700 pb-1">⚡ 主动技能 (开局前选择)</h3>
                <p className="mb-2 text-zinc-400">技能有8秒冷却时间（坦克下方的绿条显示冷却进度）。</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>冲刺</strong>: 瞬间向前高速冲刺一段距离。</li>
                  <li><strong>幽灵</strong>: 3秒内变成半透明，可以直接穿透墙壁！</li>
                  <li><strong>地雷</strong>: 在原地放下一颗地雷，1秒后启动，踩中即死。</li>
                  <li><strong>电磁脉冲</strong>: 瞬间瘫痪全图敌人，使其2秒内无法移动和射击。</li>
                  <li><strong>追踪</strong>: 接下来4秒内，你发射的子弹会自动拐弯追踪敌人。</li>
                </ul>
              </section>
            </div>
            
            <button 
              onClick={() => setShowGuide(false)}
              className="w-full py-3 mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
            >
              我了解了，开始游戏！
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-4">
            <h2 className="text-xl font-black tracking-tight">坦克动荡</h2>
            <button 
              onClick={() => setGameState('menu')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
            >
              退出
            </button>
          </div>
          <GameCanvas mode="pvp" difficulty="medium" p1Skill={p1Skill} p2Skill={p2Skill} onGameOver={handleGameOver} />
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-zinc-800 text-center">
          <Trophy size={48} className={`mx-auto mb-4 ${winner === 'Player 1' ? 'text-blue-500' : winner === 'Player 2' ? 'text-red-500' : 'text-zinc-400'}`} />
          <h2 className="text-3xl font-black mb-2">
            {winner === 'Draw' ? '平局!' : `${winner === 'Player 1' ? '玩家1' : '玩家2'} 获胜!`}
          </h2>
          <p className="text-zinc-400 mb-8">精彩的战斗。</p>
          
          <div className="space-y-3">
            <button 
              onClick={startGame}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all"
            >
              再来一局
            </button>
            <button 
              onClick={() => setGameState('menu')}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all"
            >
              返回主菜单
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
