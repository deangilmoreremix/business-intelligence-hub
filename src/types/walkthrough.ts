export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
  highlightPadding?: number;
  showSkip?: boolean;
  nextLabel?: string;
  prevLabel?: string;
}

export interface Walkthrough {
  id: string;
  title: string;
  description: string;
  category: 'onboarding' | 'feature' | 'app' | 'advanced';
  steps: WalkthroughStep[];
  autoStart?: boolean;
  showOnce?: boolean;
  requiredTours?: string[];
}

export interface WalkthroughProgress {
  walkthroughId: string;
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
  lastSeenAt: Date;
}

export interface WalkthroughContextValue {
  activeWalkthrough: Walkthrough | null;
  currentStep: number;
  isPlaying: boolean;
  startWalkthrough: (walkthroughId: string) => void;
  stopWalkthrough: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipWalkthrough: () => void;
  completeWalkthrough: () => void;
  getProgress: (walkthroughId: string) => WalkthroughProgress | null;
  resetProgress: (walkthroughId?: string) => Promise<void>;
}
