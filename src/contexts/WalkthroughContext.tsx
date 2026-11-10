import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Walkthrough, WalkthroughProgress, WalkthroughContextValue } from '../types/walkthrough';
import { walkthroughService } from '../services/walkthroughService';
import { getWalkthrough } from '../data/walkthroughs';

const WalkthroughContext = createContext<WalkthroughContextValue | undefined>(undefined);

export const WalkthroughProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWalkthrough, setActiveWalkthrough] = useState<Walkthrough | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressCache, setProgressCache] = useState<Map<string, WalkthroughProgress>>(new Map());

  useEffect(() => {
    loadAllProgress();
  }, []);

  const loadAllProgress = async () => {
    const allProgress = await walkthroughService.getAllProgress();
    const cache = new Map<string, WalkthroughProgress>();
    allProgress.forEach(progress => {
      cache.set(progress.walkthroughId, progress);
    });
    setProgressCache(cache);
  };

  const startWalkthrough = useCallback(async (walkthroughId: string) => {
    const walkthrough = getWalkthrough(walkthroughId);
    if (!walkthrough) {
      console.error(`Walkthrough ${walkthroughId} not found`);
      return;
    }

    const progress = await walkthroughService.getProgress(walkthroughId);

    if (walkthrough.showOnce && progress?.completed) {
      console.log(`Walkthrough ${walkthroughId} already completed and set to show once`);
      return;
    }

    if (walkthrough.requiredTours) {
      for (const requiredId of walkthrough.requiredTours) {
        const requiredProgress = await walkthroughService.getProgress(requiredId);
        if (!requiredProgress?.completed) {
          console.log(`Required tour ${requiredId} not completed yet`);
          return;
        }
      }
    }

    setActiveWalkthrough(walkthrough);
    setCurrentStep(progress?.currentStep || 0);
    setIsPlaying(true);

    await walkthroughService.saveProgress(
      walkthroughId,
      progress?.currentStep || 0,
      walkthrough.steps.length,
      false
    );
  }, []);

  const stopWalkthrough = useCallback(() => {
    setIsPlaying(false);
    setActiveWalkthrough(null);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(async () => {
    if (!activeWalkthrough) return;

    const nextStepIndex = currentStep + 1;

    if (nextStepIndex >= activeWalkthrough.steps.length) {
      await completeWalkthrough();
      return;
    }

    setCurrentStep(nextStepIndex);

    await walkthroughService.saveProgress(
      activeWalkthrough.id,
      nextStepIndex,
      activeWalkthrough.steps.length,
      false
    );

    const step = activeWalkthrough.steps[nextStepIndex];
    if (step.action) {
      step.action();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- completeWalkthrough is declared below and stable
  }, [activeWalkthrough, currentStep]);

  const prevStep = useCallback(async () => {
    if (!activeWalkthrough || currentStep === 0) return;

    const prevStepIndex = currentStep - 1;
    setCurrentStep(prevStepIndex);

    await walkthroughService.saveProgress(
      activeWalkthrough.id,
      prevStepIndex,
      activeWalkthrough.steps.length,
      false
    );
  }, [activeWalkthrough, currentStep]);

  const skipWalkthrough = useCallback(() => {
    stopWalkthrough();
  }, [stopWalkthrough]);

  const completeWalkthrough = useCallback(async () => {
    if (!activeWalkthrough) return;

    await walkthroughService.markCompleted(activeWalkthrough.id);

    const updatedProgress: WalkthroughProgress = {
      walkthroughId: activeWalkthrough.id,
      currentStep: activeWalkthrough.steps.length,
      totalSteps: activeWalkthrough.steps.length,
      completed: true,
      startedAt: new Date(),
      completedAt: new Date(),
      lastSeenAt: new Date()
    };

    setProgressCache(prev => new Map(prev).set(activeWalkthrough.id, updatedProgress));
    stopWalkthrough();
  }, [activeWalkthrough, stopWalkthrough]);

  const getProgress = useCallback((walkthroughId: string): WalkthroughProgress | null => {
    return progressCache.get(walkthroughId) || null;
  }, [progressCache]);

  const resetProgress = useCallback(async (walkthroughId?: string) => {
    await walkthroughService.resetProgress(walkthroughId);
    await loadAllProgress();
  }, []);

  const value: WalkthroughContextValue = {
    activeWalkthrough,
    currentStep,
    isPlaying,
    startWalkthrough,
    stopWalkthrough,
    nextStep,
    prevStep,
    skipWalkthrough,
    completeWalkthrough,
    getProgress,
    resetProgress
  };

  return (
    <WalkthroughContext.Provider value={value}>
      {children}
    </WalkthroughContext.Provider>
  );
};

export const useWalkthrough = () => {
  const context = useContext(WalkthroughContext);
  if (context === undefined) {
    throw new Error('useWalkthrough must be used within a WalkthroughProvider');
  }
  return context;
};
