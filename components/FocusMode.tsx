import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Button } from './Button';
import { CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';

interface Props {
  tasks: Task[];
  onExit: () => void;
}

export const FocusMode: React.FC<Props> = ({ tasks, onExit }) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(tasks[0]?.durationMinutes * 60 || 0);
  const [isActive, setIsActive] = useState(false);

  const currentTask = tasks[currentTaskIndex];

  useEffect(() => {
    // Reset timer when task changes
    setTimeLeft(currentTask.durationMinutes * 60);
    setIsActive(true);
  }, [currentTaskIndex, currentTask.durationMinutes]);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleComplete = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      onExit(); // All done
    }
  };

  const progress = ((tasks.length - (tasks.length - currentTaskIndex)) / tasks.length) * 100;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col relative overflow-hidden">
      
      {/* Progress Bar */}
      <div className="h-1 bg-stone-200 w-full">
        <div 
          className="h-full bg-morandi-green transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* Top Controls */}
      <div className="p-6 flex justify-between items-center z-10">
        <button onClick={onExit} className="text-stone-400 hover:text-stone-600 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> Exit Focus
        </button>
        <div className="font-mono text-stone-400">Task {currentTaskIndex + 1} / {tasks.length}</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-6 justify-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Timer */}
        <div className="text-center mb-12">
           <div className="text-6xl md:text-8xl font-light text-morandi-text font-mono tracking-tighter tabular-nums select-none">
             {formatTime(timeLeft)}
           </div>
           <div className="text-stone-400 mt-2 font-medium uppercase tracking-widest text-xs">Time Remaining</div>
        </div>

        {/* The Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-stone-200 border border-stone-100 relative">
          
          <div className="absolute -top-5 left-8 bg-morandi-sage text-stone-800 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
            Now
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold text-morandi-text mb-4 leading-tight">
            {currentTask.title}
          </h1>

          {/* SOP / Guidance Section - The "Support" */}
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-100 mb-8">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
              How to do this (SOP)
            </h3>
            <p className="text-stone-600 text-lg leading-relaxed">
              {currentTask.sop}
            </p>
          </div>

          <Button 
            onClick={handleComplete} 
            size="lg" 
            className="w-full bg-morandi-text hover:bg-black text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
             {currentTaskIndex === tasks.length - 1 ? "Finish Day" : "Complete & Next"} <ChevronRight className="w-5 h-5 ml-1" />
          </Button>

        </div>

        <p className="text-center text-stone-400 text-sm mt-8 italic">
          "{currentTask.rationale}"
        </p>
      </div>
    </div>
  );
};