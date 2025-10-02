import React, { createContext, useContext } from 'react';

interface NavigationContextType {
  navigateToFeature: (featureId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigateToFeature = (featureId: string) => {
    console.log(`Navigating to feature: ${featureId}`);
    // In a real app, this would use react-router-dom or similar
    // For now, we'll just log and potentially update App.tsx state
  };

  return (
    <NavigationContext.Provider value={{ navigateToFeature }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};