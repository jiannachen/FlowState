import React, { useState } from 'react';
import { DayPlan, Task, TaskEnergy } from '../types';
import { Button } from './Button';
import { FocusMode } from './FocusMode';
import { 
  Play, 
  CheckSquare, 
  Square, 
  Clock, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Sparkles,
  Plus,
  BookOpen,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

interface Props {
  plans: DayPlan[];
  currentPlanId: string | null;
  onSelectPlan: (id: string) => void;
  onUpdatePlan: (plan: DayPlan) => void;
  onRegenerate: (plan: DayPlan, feedback: string) => void;
  onCreateNewGoal: () => void;
  isGenerating: boolean;
  onDeletePlan: (id: string) => void;
}

export const TaskDashboard: React.FC<Props> = ({ 
  plans, 
  currentPlanId, 
  onSelectPlan, 
  onUpdatePlan, 
  onRegenerate,
  onCreateNewGoal,
  isGenerating,
  onDeletePlan
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showRegenFeedback, setShowRegenFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const currentPlan = plans.find(p => p.id === currentPlanId);

  // Focus Mode Overlay
  if (isFocusMode && currentPlan) {
    return <FocusMode tasks={currentPlan.tasks.filter(t => !t.isCompleted)} onExit={() => setIsFocusMode(false)} />;
  }

  // --- Handlers ---
  const toggleTask = (taskId: string) => {
    if (!currentPlan) return;
    const newTasks = currentPlan.tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    onUpdatePlan({ ...currentPlan, tasks: newTasks });
  };

  const updateTaskTitle = (taskId: string, newTitle: string) => {
    if (!currentPlan) return;
    const newTasks = currentPlan.tasks.map(t => 
      t.id === taskId ? { ...t, title: newTitle } : t
    );
    onUpdatePlan({ ...currentPlan, tasks: newTasks });
  };

  const updateJournal = (text: string) => {
    if (!currentPlan) return;
    onUpdatePlan({ ...currentPlan, journalNotes: text });
  };

  const deleteTask = (taskId: string) => {
    if (!currentPlan) return;
    const newTasks = currentPlan.tasks.filter(t => t.id !== taskId);
    onUpdatePlan({ ...currentPlan, tasks: newTasks });
  };

  const handleRegenerateSubmit = () => {
    if (currentPlan) {
      onRegenerate(currentPlan, feedbackText);
      setShowRegenFeedback(false);
      setFeedbackText('');
    }
  };

  return (
    <div className="flex h-[85vh] gap-6 animate-in fade-in duration-500">
      
      {/* LEFT COLUMN: Goals / Plan List */}
      <div className="w-1/3 min-w-[280px] flex flex-col bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <h2 className="font-semibold text-stone-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-morandi-primary" /> My Goals & Logs
          </h2>
          <button onClick={onCreateNewGoal} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <Plus className="w-4 h-4 text-stone-600" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {plans.map(plan => {
            const isActive = plan.id === currentPlanId;
            const completed = plan.tasks.filter(t => t.isCompleted).length;
            const total = plan.tasks.length;
            const percent = total > 0 ? Math.round((completed/total)*100) : 0;

            return (
              <div 
                key={plan.id}
                onClick={() => onSelectPlan(plan.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border relative group ${
                  isActive 
                    ? 'bg-morandi-surface/50 border-morandi-sage shadow-sm' 
                    : 'bg-white border-transparent hover:bg-stone-50 hover:border-stone-100'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-medium truncate pr-6 ${isActive ? 'text-stone-800' : 'text-stone-500'}`}>
                    {plan.goal}
                  </h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeletePlan(plan.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-stone-300 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span className="font-mono">{new Date(plan.createdAt).toLocaleDateString()}</span>
                  <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                  <span>{percent}% done</span>
                </div>
                {/* Mini Progress Bar */}
                <div className="mt-3 h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-morandi-green" style={{ width: `${percent}%` }}></div>
                </div>
              </div>
            );
          })}
          
          {plans.length === 0 && (
            <div className="text-center p-8 text-stone-400 text-sm">
              No goals yet.<br/>Click + to start untangling.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Task Details & Journal */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden relative">
        {currentPlan ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex justify-between items-start bg-stone-50/30">
              <div>
                <h1 className="text-2xl font-medium text-morandi-text">{currentPlan.goal}</h1>
                <p className="text-stone-400 text-sm mt-1">Design tailored to your strengths.</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Button variant="outline" size="sm" onClick={() => setShowRegenFeedback(!showRegenFeedback)} disabled={isGenerating}>
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Thinking...' : 'Regenerate'}
                  </Button>
                  
                  {/* Feedback Popover */}
                  {showRegenFeedback && (
                    <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-stone-100 p-4 z-20 animate-in zoom-in-95">
                      <p className="text-xs font-bold text-stone-400 uppercase mb-2">How should I change this?</p>
                      <textarea 
                        className="w-full bg-stone-50 p-2 rounded-lg text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-morandi-primary"
                        rows={3}
                        placeholder="e.g. Too many breaks, remove the research part..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                      />
                      <Button size="sm" className="w-full" onClick={handleRegenerateSubmit}>
                        <Sparkles className="w-3 h-3" /> Apply Feedback
                      </Button>
                    </div>
                  )}
                </div>

                <Button onClick={() => setIsFocusMode(true)} className="bg-morandi-text text-white">
                  <Play className="w-4 h-4 fill-current" /> Focus Mode
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Task List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Execution Flow</h3>
                {currentPlan.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`group bg-white p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:border-morandi-accent/30
                      ${task.isCompleted ? 'border-stone-100 opacity-60 bg-stone-50' : 'border-stone-200'}
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className={`mt-1 flex-shrink-0 transition-colors ${task.isCompleted ? 'text-morandi-green' : 'text-stone-300 hover:text-morandi-primary'}`}
                      >
                        {task.isCompleted ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          {editingTaskId === task.id ? (
                            <input 
                              autoFocus
                              className="text-lg font-medium text-stone-800 bg-transparent border-b border-morandi-primary outline-none w-full"
                              value={task.title}
                              onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                              onBlur={() => setEditingTaskId(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingTaskId(null)}
                            />
                          ) : (
                            <h3 
                              className={`text-lg font-medium truncate pr-4 cursor-text ${task.isCompleted ? 'text-stone-400 line-through' : 'text-stone-700'}`}
                              onDoubleClick={() => setEditingTaskId(task.id)}
                            >
                              {task.title}
                            </h3>
                          )}
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                             <span className={`text-xs px-2 py-1 rounded font-medium ${
                              task.energyType === TaskEnergy.DEEP_FOCUS ? 'bg-purple-50 text-purple-600' :
                              task.energyType === TaskEnergy.SOCIAL ? 'bg-green-50 text-green-600' :
                              'bg-stone-100 text-stone-500'
                            }`}>
                              {task.energyType}
                            </span>
                            <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-red-50 hover:text-red-400 rounded text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {!task.isCompleted && (
                          <div className="mt-2 text-sm text-stone-500">
                             <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 flex gap-3">
                                <div className="min-w-[4px] bg-morandi-sage rounded-full"></div>
                                <div>
                                  <span className="font-semibold text-stone-600 text-xs uppercase block mb-1">How-to (SOP)</span>
                                  {task.sop}
                                </div>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Integrated Journal */}
              <div className="border-t border-stone-100 pt-8">
                 <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                   <MessageSquare className="w-4 h-4" /> Journal & Reflections
                 </h3>
                 <textarea 
                   value={currentPlan.journalNotes || ''}
                   onChange={(e) => updateJournal(e.target.value)}
                   className="w-full h-40 p-4 bg-stone-50/50 rounded-xl border border-stone-200 focus:bg-white focus:ring-2 focus:ring-morandi-sage/30 focus:outline-none resize-none text-stone-700 leading-relaxed"
                   placeholder="How did this flow feel? What blocked you? (Auto-saved)"
                 />
              </div>

            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-4">
            <Sparkles className="w-12 h-12 text-stone-200" />
            <p>Select a goal from the left or create a new one.</p>
            <Button onClick={onCreateNewGoal}>
              <Plus className="w-4 h-4" /> New Goal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};