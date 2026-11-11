// Ambient declarations needed by vendored Twenty sources (mirrors twenty-front/src/types/global.d.ts).
import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';

declare global {
  interface Window {
    componentComponentStateContextMap: Map<string, ComponentInstanceStateContext<any>>;
  }
}
declare module 'addressparser';
