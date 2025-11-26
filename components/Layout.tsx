import React from 'react';
import { Sidebar } from './Sidebar';
import { AppView, UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userProfile: UserProfile | null;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onNavigate,
  userProfile
}) => {
  if (!userProfile) {
    return <div className="min-h-screen bg-morandi-bg">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-morandi-bg text-morandi-text overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onNavigate={onNavigate} 
        userName={userProfile.name}
      />

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="max-w-7xl mx-auto p-6 md:p-12 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
