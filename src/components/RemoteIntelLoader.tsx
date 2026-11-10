import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const RemoteIntelLoader: React.FC = () => {
  useTheme();
  const [useFallback, setUseFallback] = useState(false);
  const [IntelApp, setIntelApp] = useState<React.ComponentType | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadModuleFederation = async () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://product-research-mod-uay0.bolt.host/remoteEntry.js';
        script.type = 'text/javascript';
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        const container = (window as unknown as { IntelApp?: { init: (s: unknown) => Promise<void>; get: (m: string) => Promise<() => { default?: React.ComponentType } & React.ComponentType> } }).IntelApp;
        if (container) {
          await container.init((globalThis as unknown as { __webpack_share_scopes__: { default: unknown } }).__webpack_share_scopes__.default);
          const factory = await container.get('./IntelApp');
          const Module = factory();
          setIntelApp(() => (Module.default || Module) as React.ComponentType);
        } else {
          setUseFallback(true);
        }
      } catch {
        console.log('Module Federation failed, using iframe fallback');
        setUseFallback(true);
      }
    };

    loadModuleFederation();
  }, []);

  // Iframe fallback
  if (useFallback || !IntelApp) {
    return (
      <div className="w-full h-full" style={{ paddingTop: '80px' }}>
        <iframe
          ref={iframeRef}
          src="https://product-research-mod-uay0.bolt.host/"
          className="w-full border-0"
          style={{ 
            height: 'calc(100vh - 80px)',
            minHeight: 'calc(100vh - 80px)'
          }}
          title="Intel Dashboard"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Module Federation component
  return (
    <div className="w-full h-full" style={{ paddingTop: '80px' }}>
      <IntelApp />
    </div>
  );
};

export default RemoteIntelLoader;
