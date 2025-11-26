import React from 'react';
import { DayPlan, Task, TaskEnergy } from '../types';
import { Button } from './Button';
import { Clock, Battery, MessageCircle, PlayCircle, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  plan: DayPlan;
  onCommit: () => void;
  onRetry: () => void;
}

export const PlanProposal: React.FC<Props> = ({ plan, onCommit, onRetry }) => {
  
  const getEnergyIcon = (type: TaskEnergy) => {
    switch (type) {
      case TaskEnergy.DEEP_FOCUS: return <Battery className="w-4 h-4 text-purple-400" />;
      case TaskEnergy.LIGHT_ADMIN: return <Clock className="w-4 h-4 text-blue-400" />;
      case TaskEnergy.SOCIAL: return <MessageCircle className="w-4 h-4 text-green-400" />;
      default: return <Battery className="w-4 h-4 text-stone-400" />;
    }
  };

  const getEnergyColor = (type: TaskEnergy) => {
     switch (type) {
      case TaskEnergy.DEEP_FOCUS: return 'bg-purple-50 border-purple-100';
      case TaskEnergy.LIGHT_ADMIN: return 'bg-blue-50 border-blue-100';
      case TaskEnergy.SOCIAL: return 'bg-green-50 border-green-100';
      default: return 'bg-stone-50 border-stone-100';
    }
  };

  const CHART_COLORS = ['#A78BFA', '#94A3B8', '#86EFAC', '#E5E5E5'];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header */}
      <div className="mb-8 text-center md:text-left flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <h2 className="text-xl text-stone-500 font-light">Proposed Flow</h2>
          <h1 className="text-2xl md:text-3xl font-medium text-morandi-text mt-1">{plan.goal}</h1>
          <p className="text-sm text-morandi-accent mt-2">We've broken this down to match your energy.</p>
        </div>
        
        {/* Energy Chart */}
        <div className="h-24 w-24 md:h-32 md:w-32 flex-shrink-0 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={plan.energyDistribution}
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {plan.energyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                 <BarChart3 className="w-4 h-4 text-stone-300" />
              </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative border-l-2 border-stone-200 ml-4 md:ml-6 space-y-8 mb-12">
        {plan.tasks.map((task, index) => (
          <div key={task.id} className="relative pl-8 md:pl-12 group">
            {/* Timeline Dot */}
            <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-white border-4 border-morandi-sage z-10 transition-transform group-hover:scale-125" />
            
            {/* Task Card */}
            <div className={`p-5 rounded-2xl border ${getEnergyColor(task.energyType)} hover:shadow-md transition-shadow`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-stone-400 font-mono bg-white/50 px-2 py-1 rounded">{task.startTime}</span>
                    <span className="text-xs font-medium uppercase tracking-wider text-stone-400 flex items-center gap-1">
                      {getEnergyIcon(task.energyType)} {task.energyType}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-morandi-text">{task.title}</h3>
                  <p className="text-stone-600 text-sm mt-1 leading-relaxed">{task.description}</p>
                  
                  {/* AI Rationale Badge */}
                  <div className="mt-3 inline-flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg text-xs text-stone-500 italic">
                    <span>✨ {task.rationale}</span>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0 text-stone-400 text-sm font-mono">
                  {task.durationMinutes} min
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions (Handshake) */}
      <div className="sticky bottom-6 flex flex-col md:flex-row gap-4 bg-white/80 backdrop-blur-lg p-4 rounded-2xl border border-stone-100 shadow-xl items-center justify-between">
        <p className="text-sm text-stone-500 hidden md:block pl-2">
          Does this flow feel doable?
        </p>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="ghost" onClick={onRetry} className="flex-1 md:flex-none">
            Too intense, change it
          </Button>
          <Button onClick={onCommit} className="flex-1 md:flex-none w-full md:w-48">
             <PlayCircle className="w-5 h-5" /> Confirm & Start
          </Button>
        </div>
      </div>

    </div>
  );
};
