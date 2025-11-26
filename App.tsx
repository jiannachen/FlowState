import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { BrainDump } from './components/BrainDump';
import { TaskDashboard } from './components/TaskDashboard';
import { DocManager } from './components/DocManager';
import { PromptManager } from './components/PromptManager';
import { Layout } from './components/Layout';
import { AppView, DayPlan, UserProfile, DocumentAsset, PromptItem } from './types';
import { generatePlanFromGoal } from './geminiService';
import * as Storage from './services/storage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('ONBOARDING');
  const [isLoading, setIsLoading] = useState(true);
  
  // App State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  
  // New persisted states
  const [docs, setDocs] = useState<DocumentAsset[]>([]);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBrainDump, setShowBrainDump] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [profile, loadedPlans, loadedDocs, loadedPrompts] = await Promise.all([
          Storage.getUserProfile(),
          Storage.getPlans(),
          Storage.getDocs(),
          Storage.getPrompts()
        ]);

        if (profile) {
          setUserProfile(profile);
          setCurrentView('DASHBOARD');
        }
        
        setPlans(loadedPlans);
        setDocs(loadedDocs);
        setPrompts(loadedPrompts);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- PERSISTENCE HANDLERS ---
  
  // Plan Updates
  const updatePlansState = (newPlans: DayPlan[]) => {
    setPlans(newPlans);
    Storage.savePlans(newPlans);
  };

  // Doc Updates
  const updateDocsState = (newDocs: DocumentAsset[]) => {
    setDocs(newDocs);
    Storage.saveDocs(newDocs);
  };

  // Prompt Updates
  const updatePromptsState = (newPrompts: PromptItem[]) => {
    setPrompts(newPrompts);
    Storage.savePrompts(newPrompts);
  };


  // --- APP LOGIC ---

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    Storage.saveUserProfile(profile);
    setCurrentView('DASHBOARD');
    setShowBrainDump(true); 
  };

  const handleAnalyzeGoal = async (goalText: string) => {
    if (!userProfile) return;
    setIsGenerating(true);
    try {
      const plan = await generatePlanFromGoal(goalText, userProfile);
      const newPlans = [plan, ...plans];
      updatePlansState(newPlans);
      setActivePlanId(plan.id);
      setShowBrainDump(false); 
    } catch (error) {
      console.error("Failed to generate plan", error);
      alert("AI is taking a nap. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateWithFeedback = async (planToRegen: DayPlan, feedback: string) => {
    if (!userProfile) return;
    setIsGenerating(true);
    try {
      const newPlan = await generatePlanFromGoal(planToRegen.goal, userProfile, feedback, planToRegen);
      const newPlans = plans.map(p => p.id === planToRegen.id ? newPlan : p);
      updatePlansState(newPlans);
    } catch (error) {
       alert("Failed to regenerate.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdatePlan = (updatedPlan: DayPlan) => {
    const newPlans = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    updatePlansState(newPlans);
  };

  const handleDeletePlan = (id: string) => {
    if(confirm("Are you sure you want to delete this goal?")) {
      const newPlans = plans.filter(p => p.id !== id);
      updatePlansState(newPlans);
      if (activePlanId === id) setActivePlanId(null);
    }
  }

  // --- RENDER ---
  
  if (isLoading) {
    return <div className="min-h-screen bg-morandi-bg flex items-center justify-center text-stone-400">Loading FlowState...</div>;
  }

  const renderContent = () => {
    if (showBrainDump) {
      return (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-full max-w-3xl relative">
              <button 
                onClick={() => setShowBrainDump(false)} 
                className="absolute -top-12 right-0 text-stone-400 hover:text-stone-600 uppercase text-xs font-bold tracking-widest"
              >
                Close X
              </button>
              <BrainDump 
                userName={userProfile?.name || 'User'} 
                onAnalyze={handleAnalyzeGoal} 
                isLoading={isGenerating} 
              />
            </div>
        </div>
      );
    }

    switch (currentView) {
      case 'ONBOARDING':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      
      case 'DASHBOARD':
        return (
          <TaskDashboard 
            plans={plans}
            currentPlanId={activePlanId}
            onSelectPlan={setActivePlanId}
            onUpdatePlan={handleUpdatePlan}
            onRegenerate={handleRegenerateWithFeedback}
            onCreateNewGoal={() => setShowBrainDump(true)}
            isGenerating={isGenerating}
            onDeletePlan={handleDeletePlan}
          />
        );
      
      case 'DOCS':
        return (
          <DocManager 
            docs={docs}
            onUpdateDocs={updateDocsState}
          />
        );
      
      case 'PROMPTS':
        return (
          <PromptManager 
            prompts={prompts}
            onUpdatePrompts={updatePromptsState}
          />
        );
        
      default:
        return null;
    }
  };

  if (currentView === 'ONBOARDING') {
    return (
      <div className="min-h-screen bg-morandi-bg">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={handleNavigate} 
      userProfile={userProfile}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
