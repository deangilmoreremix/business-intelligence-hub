type MessageType =
  | 'SET_THEME'
  | 'INITIAL_DATA_SYNC'
  | 'CRM_READY'
  | 'UPDATE_DASHBOARD_DATA'
  | 'ANALYTICS_READY'
  | 'DASHBOARD_INTERACTION'
  | 'ANALYTICS_DATA_UPDATE'
  | 'HOST_READY'
  | 'SYNC_THEME'
  | 'NAVIGATION_REQUEST'
  | 'DATA_REQUEST'
  | 'ERROR_REPORT';

interface MessagePayload {
  type: MessageType;
  data?: any;
  source?: string;
  theme?: string;
  mode?: string;
  timestamp?: string;
}

type MessageHandler = (type: MessageType, data: any) => void;

export class RemoteCommunicator {
  private hostOrigin: string;
  private messageHandlers: Map<MessageType, MessageHandler[]> = new Map();
  private isInitialized = false;
  private isEmbedded: boolean;

  constructor(hostOrigin: string = '*') {
    this.hostOrigin = hostOrigin;
    this.isEmbedded = window.self !== window.top;
    this.initializeListener();
  }

  private initializeListener(): void {
    if (this.isInitialized) return;

    window.addEventListener('message', this.handleIncomingMessage.bind(this));
    this.isInitialized = true;

    console.log('📡 RemoteCommunicator initialized, listening for messages from:', this.hostOrigin);
  }

  private handleIncomingMessage(event: MessageEvent): void {
    if (this.hostOrigin !== '*' && event.origin !== this.hostOrigin) {
      return;
    }

    const message = event.data as MessagePayload;
    if (!message || !message.type) return;

    console.log('📨 Received message from host:', message.type, message);

    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.type, message.data || message);
        } catch (error) {
          console.error(`Error handling message ${message.type}:`, error);
        }
      });
    }
  }

  public on(type: MessageType, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  public off(type: MessageType, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public sendToHost(type: MessageType, data?: any): void {
    const message: MessagePayload = {
      type,
      data,
      source: 'AnalyticsApp',
    };

    console.log('📤 Sending message to host:', message);

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, this.hostOrigin === '*' ? '*' : this.hostOrigin);
    }

    if (window.opener) {
      window.opener.postMessage(message, this.hostOrigin === '*' ? '*' : this.hostOrigin);
    }
  }

  public notifyReady(): void {
    if (!this.isEmbedded) {
      console.log('📍 Running in standalone mode, skipping host notification');
      return;
    }

    this.sendToHost('ANALYTICS_READY', {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      capabilities: ['dashboard', 'analytics', 'reports', 'chatbot'],
      embedded: true,
    });
  }

  public notifyDashboardInteraction(action: string, data?: any): void {
    this.sendToHost('DASHBOARD_INTERACTION', {
      action,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  public notifyDataUpdate(data: any): void {
    this.sendToHost('ANALYTICS_DATA_UPDATE', {
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  public requestData(dataType: string): void {
    this.sendToHost('DATA_REQUEST', {
      dataType,
      timestamp: new Date().toISOString(),
    });
  }

  public reportError(error: Error, context?: any): void {
    this.sendToHost('ERROR_REPORT', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context,
      timestamp: new Date().toISOString(),
    });
  }

  public isRunningEmbedded(): boolean {
    return this.isEmbedded;
  }

  public setHostOrigin(origin: string): void {
    this.hostOrigin = origin;
    console.log('🔒 Host origin set to:', origin);
  }

  public destroy(): void {
    window.removeEventListener('message', this.handleIncomingMessage.bind(this));
    this.messageHandlers.clear();
    this.isInitialized = false;
    console.log('🔌 RemoteCommunicator destroyed');
  }
}

export const remoteCommunicator = new RemoteCommunicator();
