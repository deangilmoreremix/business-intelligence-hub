import React, { useEffect } from 'react';
import { useWalkthrough } from '../../contexts/WalkthroughContext';
import { WalkthroughOverlay } from './WalkthroughOverlay';
import { WalkthroughStep } from './WalkthroughStep';

export const WalkthroughEngine: React.FC = () => {
  const {
    activeWalkthrough,
    currentStep,
    isPlaying,
    nextStep,
    prevStep,
    skipWalkthrough,
    stopWalkthrough
  } = useWalkthrough();

  useEffect(() => {
    if (isPlaying && activeWalkthrough) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isPlaying, activeWalkthrough]);

  if (!isPlaying || !activeWalkthrough) {
    return null;
  }

  const step = activeWalkthrough.steps[currentStep];

  return (
    <WalkthroughOverlay
      targetElement={step.targetElement}
      highlightPadding={step.highlightPadding}
      isActive={isPlaying}
    >
      <WalkthroughStep
        step={step}
        currentStepIndex={currentStep}
        totalSteps={activeWalkthrough.steps.length}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipWalkthrough}
        onClose={stopWalkthrough}
      />
    </WalkthroughOverlay>
  );
};
