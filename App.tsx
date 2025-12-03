import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { BrainDump } from './components/BrainDump';
import { TaskDashboard } from './components/TaskDashboard';
import { DocManager } from './components/DocManager';
import { PromptManager } from './components/PromptManager';
import { Layout } from './components/Layout';
import { AppView, DayPlan, UserProfile, DocumentAsset, PromptItem, StrengthsConfig } from './types';
import { generatePlanFromGoal } from './geminiService';
import * as Storage from './services/storage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('ONBOARDING');
  const [isLoading, setIsLoading] = useState(true);

  // App State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [strengthsConfig, setStrengthsConfig] = useState<StrengthsConfig | null>(null);
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  // New persisted states
  const [docs, setDocs] = useState<DocumentAsset[]>([]);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBrainDump, setShowBrainDump] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [profile, config, loadedPlans, loadedDocs, loadedPrompts] = await Promise.all([
          Storage.getUserProfile(),
          Storage.getStrengthsConfig(),
          Storage.getPlans(),
          Storage.getDocs(),
          Storage.getPrompts()
        ]);

        // Load user data if exists
        if (profile) setUserProfile(profile);
        if (config) setStrengthsConfig(config);

        // Always start at DASHBOARD (instead of ONBOARDING)
        setCurrentView('DASHBOARD');

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

  // Strengths Config Updates
  const updateStrengthsConfigState = (newConfig: StrengthsConfig) => {
    setStrengthsConfig(newConfig);
    Storage.saveStrengthsConfig(newConfig);
  };


  // --- APP LOGIC ---

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    Storage.saveUserProfile(profile);

    // Save strengths config from profile data
    const config: StrengthsConfig = {
      id: `config-${Date.now()}`,
      strengthsRawText: profile.strengthsRawText,
      topStrengths: profile.topStrengths,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setStrengthsConfig(config);
    Storage.saveStrengthsConfig(config);

    // Close onboarding modal and open BrainDump
    setShowOnboarding(false);
    setShowBrainDump(true);
  };

  const handleAnalyzeGoal = async (goalText: string) => {
    // 首次创建任务时，检查是否已配置优势
    if (!strengthsConfig) {
      alert('请先上传你的34项优势特质。');
      setShowBrainDump(false);
      setShowOnboarding(true);
      return;
    }

    setIsGenerating(true);
    try {
      // Create a temporary UserProfile from strengthsConfig for backward compatibility
      const tempProfile: UserProfile = {
        name: userProfile?.name || 'User',
        strengthsRawText: strengthsConfig.strengthsRawText,
        topStrengths: strengthsConfig.topStrengths
      };

      const plan = await generatePlanFromGoal(goalText, tempProfile);
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
    if (!strengthsConfig) {
      alert('请先配置你的34项优势特质');
      return;
    }

    setIsGenerating(true);
    try {
      const tempProfile: UserProfile = {
        name: userProfile?.name || 'User',
        strengthsRawText: strengthsConfig.strengthsRawText,
        topStrengths: strengthsConfig.topStrengths
      };

      const newPlan = await generatePlanFromGoal(planToRegen.goal, tempProfile, feedback, planToRegen);
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
    // Onboarding Modal (show when user needs to configure strengths)
    if (showOnboarding) {
      return (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-full max-w-3xl relative">
              <button
                onClick={() => setShowOnboarding(false)}
                className="absolute -top-12 right-0 text-stone-400 hover:text-stone-600 uppercase text-xs font-bold tracking-widest"
              >
                Close X
              </button>
              <Onboarding onComplete={handleOnboardingComplete} />
            </div>
        </div>
      );
    }

    // BrainDump Modal (show when creating a new task)
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

  // All views now use Layout (ONBOARDING is shown as a modal)
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
