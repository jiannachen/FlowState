import React, { useState } from 'react';
import { AppView } from '../types';
import {
  LayoutDashboard,
  FileText,
  Settings,
  UserCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, userName }) => {
  const [showSettings, setShowSettings] = useState(false);

  const navItems = [
    { id: 'DASHBOARD' as AppView, label: 'Goals & Journal', icon: LayoutDashboard },
    { id: 'DOCS' as AppView, label: 'Assets & Docs', icon: FileText },
    { id: 'PROMPTS' as AppView, label: 'Prompt Kit', icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-white border-r border-stone-200 hidden md:flex flex-col flex-shrink-0 z-20">
      {/* Brand */}
      <div className="p-6 border-b border-stone-100">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight text-morandi-text">
          <div className="w-3 h-3 bg-morandi-green rounded-full shadow-sm shadow-stone-300"></div>
          FlowState
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                ${isActive 
                  ? 'bg-morandi-surface text-stone-800 shadow-sm' 
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-morandi-primary' : 'text-stone-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-stone-100">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors"
          onClick={() => setShowSettings(!showSettings)}
        >
          <UserCircle className="w-8 h-8 text-stone-300" />
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium text-morandi-text truncate">{userName}</p>
            <p className="text-xs text-stone-400 truncate">Pro Account</p>
          </div>
          {showSettings ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </div>

        {/* Settings Menu */}
        {showSettings && (
          <div className="mt-2 space-y-1">
            <button
              onClick={() => setShowSettings(false)}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors text-sm text-stone-600"
            >
              <Settings className="w-4 h-4 text-stone-400" />
              系统设置
            </button>
            <button
              onClick={() => {
                if (confirm('确定要重置所有数据吗？这将清除用户信息、优势配置、所有任务和文档。')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600"
            >
              <RotateCcw className="w-4 h-4 text-red-400" />
              重置应用
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};