import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Point, Direction, GameStatus, GRID_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, INITIAL_SPEED } from '../types';
import { Trophy, Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { animate, motion, AnimatePresence } from 'motion/react';

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 遊戲狀態
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('UP');
  const [nextDirection, setNextDirection] = useState<Direction>('UP');
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // 計算等級與速度
  const level = Math.floor(score / 50) + 1;
  const currentSpeed = Math.max(50, INITIAL_SPEED - (level - 1) * 5);

  // Refs 用於防止閉包舊值問題
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const directionRef = useRef(direction);
  const statusRef = useRef(status);

  useEffect(() => {
    snakeRef.current = snake;
    foodRef.current = food;
    directionRef.current = direction;
    statusRef.current = status;
  }, [snake, food, direction, status]);

  const generateFood = useCallback(() => {
    const x = Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE));
    const y = Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE));
    // 簡單檢查不與蛇身重疊
    return { x, y };
  }, []);

  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    setFood(generateFood());
    setDirection('UP');
    setNextDirection('UP');
    setScore(0);
    setStatus('PLAYING');
  };

  // 鍵盤控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (directionRef.current !== 'DOWN') setNextDirection('UP'); break;
        case 'ArrowDown': if (directionRef.current !== 'UP') setNextDirection('DOWN'); break;
        case 'ArrowLeft': if (directionRef.current !== 'RIGHT') setNextDirection('LEFT'); break;
        case 'ArrowRight': if (directionRef.current !== 'LEFT') setNextDirection('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 遊戲迴圈
  useEffect(() => {
    if (status !== 'PLAYING') return;

    const moveSnake = () => {
      const head = { ...snakeRef.current[0] };
      setDirection(nextDirection);

      switch (nextDirection) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      if (head.x < 0 || head.x >= CANVAS_WIDTH / GRID_SIZE || head.y < 0 || head.y >= CANVAS_HEIGHT / GRID_SIZE) {
        setStatus('GAME_OVER');
        return;
      }

      if (snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y)) {
        setStatus('GAME_OVER');
        return;
      }

      const newSnake = [head, ...snakeRef.current];
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore(prev => {
          const newVal = prev + 10;
          if (newVal > highScore) setHighScore(newVal);
          return newVal;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }
      setSnake(newSnake);
    };

    const interval = setInterval(moveSnake, currentSpeed);
    return () => clearInterval(interval);
  }, [status, nextDirection, generateFood, highScore, currentSpeed]);

  // 繪製邏輯
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a'; // slate-900 
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 繪製背景網格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }

    // 繪製食物
    ctx.fillStyle = '#f43f5e'; // rose-500
    ctx.shadowBlur = 15; ctx.shadowColor = '#f43f5e';
    ctx.beginPath();
    ctx.roundRect(food.x * GRID_SIZE + 3, food.y * GRID_SIZE + 3, GRID_SIZE - 6, GRID_SIZE - 6, 12);
    ctx.fill(); ctx.shadowBlur = 0;

    // 繪製蛇
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#34d399' : '#059669'; 
      if (index === 0) {
        ctx.shadowBlur = 15; ctx.shadowColor = '#34d399';
      }
      ctx.beginPath();
      ctx.roundRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2, index === 0 ? 6 : 4);
      ctx.fill(); ctx.shadowBlur = 0;
    });
  }, [snake, food]);

  return (
    <div className="w-full max-w-[1200px] h-screen mx-auto flex flex-col p-4 md:p-8 relative overflow-hidden font-sans">
      {/* 背景裝飾 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      {/* 標題欄 */}
      <header className="relative z-10 flex justify-between items-center mb-4 md:mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center neon-shadow-emerald hidden sm:flex">
            <div className="w-6 h-2 bg-slate-900 rounded-full"></div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">霓虹<span className="text-emerald-400">貪食蛇</span></h1>
            <p className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">ARCADE EXPERIENCE</p>
          </div>
        </div>
        <div className="flex gap-2 md:gap-4 ml-4">
          <div className="glass-card px-4 md:px-6 py-1 md:py-2 rounded-xl md:rounded-2xl flex flex-col items-center min-w-[100px] md:min-w-[120px]">
            <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-0.5 md:mb-1">目前得分</span>
            <span className="text-xl md:text-2xl font-mono text-emerald-400 font-bold tracking-tighter">{score.toString().padStart(5, '0')}</span>
          </div>
          <div className="glass-card px-4 md:px-6 py-1 md:py-2 rounded-xl md:rounded-2xl flex flex-col items-center min-w-[100px] md:min-w-[120px]">
            <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-0.5 md:mb-1">最高紀錄</span>
            <span className="text-xl md:text-2xl font-mono text-indigo-300 font-bold tracking-tighter">{highScore.toString().padStart(5, '0')}</span>
          </div>
        </div>
      </header>

      {/* 遊戲主體 */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row gap-4 md:gap-8 min-h-0">
        {/* 左側遊戲區域 */}
        <div className="flex-1 bg-slate-950/40 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-3xl p-1 relative overflow-hidden flex items-center justify-center group">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="rounded-xl md:rounded-2xl border border-white/5 max-w-full max-h-full object-contain"
          />

          {/* 浮層顯示 */}
          <AnimatePresence>
            {status === 'IDLE' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-[2px] rounded-2xl md:rounded-3xl z-20"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all uppercase tracking-widest text-sm flex items-center gap-3"
                >
                  <Play className="fill-current w-5 h-5" /> 開始遊戲
                </motion.button>
              </motion.div>
            )}

            {status === 'GAME_OVER' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-2xl md:rounded-3xl z-20"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-rose-500 mb-2 tracking-tighter">遊戲結束</h2>
                <p className="text-slate-400 font-mono mb-8 opacity-80">任務最終得分: {score}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="flex items-center gap-2 px-8 py-3 bg-white text-slate-900 font-bold rounded-2xl transition-all hover:bg-slate-200 shadow-xl"
                >
                  <RotateCcw className="w-4 h-4" /> 重新啟動
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 右側資訊欄 */}
        <div className="w-full md:w-[280px] flex flex-row md:flex-col gap-4 md:gap-6 shrink-0">
          <section className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 flex-1 md:flex-none">
            <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-3 md:mb-4">遊戲狀態</h3>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs md:text-sm text-slate-300 font-medium">難度等級</span>
                <span className="text-xl md:text-2xl font-bold text-white leading-none">{level.toString().padStart(2, '0')}</span>
              </div>
              <div className="w-full bg-slate-800/50 h-1 md:h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-500" 
                  style={{ width: `${(score % 50) * 2}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-xs md:text-sm text-slate-300 font-medium">目前長度</span>
                <span className="text-xs md:text-sm font-mono text-emerald-400 font-bold">{snake.length}</span>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 flex-[2] md:flex-1 flex flex-col">
            <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4 md:mb-6">操作說明</h3>
            <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-6">
              <div className="flex flex-col items-center gap-1 md:gap-2 scale-75 md:scale-90">
                <div className="w-10 md:w-12 h-10 md:h-12 glass-card rounded-xl flex items-center justify-center text-lg md:text-xl text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)] border-white/20 font-bold">↑</div>
                <div className="flex gap-1 md:gap-2">
                  <div className="w-10 md:w-12 h-10 md:h-12 glass-card rounded-xl flex items-center justify-center text-lg md:text-xl text-white/30">←</div>
                  <div className="w-10 md:w-12 h-10 md:h-12 glass-card rounded-xl flex items-center justify-center text-lg md:text-xl text-white/30">↓</div>
                  <div className="w-10 md:w-12 h-10 md:h-12 glass-card rounded-xl flex items-center justify-center text-lg md:text-xl text-white/30">→</div>
                </div>
              </div>
              <p className="text-[10px] md:text-[11px] text-slate-400 text-center leading-relaxed font-medium hidden sm:block">
                使用方向鍵控制蛇的移動。<br/>請勿撞牆或咬到自己的身體。
              </p>
            </div>
            <div className="pt-4 md:pt-6 border-t border-white/5 mt-auto">
              <button 
                onClick={resetGame}
                className="w-full py-2 md:py-3 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white text-[9px] md:text-[10px] font-bold rounded-xl uppercase tracking-widest border border-white/10"
              >
                重置連線
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* 頁尾 */}
      <footer className="relative z-10 mt-4 md:mt-6 flex justify-between items-center text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest font-bold shrink-0">
        <div className="flex gap-4 md:gap-8 overflow-hidden">
          <span className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-1 h-1 rounded-full bg-slate-600"></div> REACT 19</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-1 h-1 rounded-full bg-slate-600"></div> TYPESCRIPT</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap hidden sm:flex"><div className="w-1 h-1 rounded-full bg-slate-600"></div> VITE</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-500/80 ml-4">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
          <span className="whitespace-nowrap">系統狀態正常</span>
        </div>
      </footer>
    </div>
  );
};

export default SnakeGame;
