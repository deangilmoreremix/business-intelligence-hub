import React from 'react';
import { useParams } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { PageWrapper } from './layout/PageWrapper';
import { aiApps } from '../data/aiApps';

export const ComingSoonPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  
  const app = aiApps.find(a => a.id === appId);
  
  if (!app) {
    return (
      <PageWrapper
        title="App Not Found"
        description="The requested application could not be found"
        appTheme="red"
      >
        <div className="text-center py-20">
          <div className="p-6 bg-red-100 dark:bg-red-900/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Construction className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">App Not Found</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">The requested application could not be found.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={app.title}
      description={app.description}
      appTheme="blue"
    >
      <div className="text-center py-20">
        <div className="p-6 bg-blue-100 dark:bg-blue-900/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <app.icon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">{app.title}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{app.description}</p>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto mb-8">
          <Construction className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
          <p className="text-yellow-800 dark:text-yellow-200">
            🚧 This AI app is being built with advanced features! Full functionality coming soon.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
};