// Service for syncing live user chat with Admin Panel Support Inbox

export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin' | 'ai';
  senderName?: string;
  text: string;
  timestamp: string;
  readByAdmin?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  userAddress: string;
  userName: string;
  chain: string;
  startedAt: string;
  status: 'active' | 'waiting_admin' | 'resolved';
  messages: ChatMessage[];
  unreadCount: number;
}

const STORAGE_KEY = 'tradex_pulse_live_chats_v1';

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 'chat_session_live_1',
    userId: 'trader_0x67c7',
    userAddress: '0x67c7f23e89a42cb1a903ef881',
    userName: 'Active Sovereign Trader',
    chain: 'Bitcoin SV (BSV)',
    startedAt: 'Today 10:24 AM',
    status: 'active',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        sender: 'ai',
        senderName: 'Ora AI Assistant',
        text: 'Welcome to Tradex & Pulse DEX. I am Ora AI. How can I assist your non-custodial trading session today?',
        timestamp: '10:24 AM',
        readByAdmin: true
      },
      {
        id: 'm2',
        sender: 'user',
        senderName: 'Trader 0x67c7',
        text: 'Hello! I deposited BSV to the non-custodial smart escrow contract. Where can I verify the transaction hash on WhatsOnChain?',
        timestamp: '10:26 AM',
        readByAdmin: false
      }
    ]
  },
  {
    id: 'chat_session_live_2',
    userId: 'trader_solana_9f2a',
    userAddress: '7q2k...98fB (Solana)',
    userName: 'Solana Arbitrageur',
    chain: 'Solana (Phantom)',
    startedAt: 'Today 09:15 AM',
    status: 'resolved',
    unreadCount: 0,
    messages: [
      {
        id: 'm3',
        sender: 'user',
        senderName: 'Solana Arbitrageur',
        text: 'Are cross-chain atomic swaps to Base USDT enabled with 0% slippage?',
        timestamp: '09:15 AM',
        readByAdmin: true
      },
      {
        id: 'm4',
        sender: 'admin',
        senderName: 'Tradex & Pulse Lead Admin',
        text: 'Yes! Instant Swaps route directly through our deep automated market maker liquidity pools across Solana and Base with guaranteed zero-slippage execution.',
        timestamp: '09:17 AM',
        readByAdmin: true
      }
    ]
  }
];

type ChatListener = (sessions: ChatSession[]) => void;

class LiveChatService {
  private sessions: ChatSession[] = [];
  private listeners: Set<ChatListener> = new Set();
  private activeSessionId: string = 'chat_session_live_1';

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.sessions = JSON.parse(stored);
      } else {
        this.sessions = INITIAL_SESSIONS;
        this.save();
      }
    } catch (e) {
      this.sessions = INITIAL_SESSIONS;
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
    } catch (e) {
      // ignore
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(l => l([...this.sessions]));
  }

  public subscribe(listener: ChatListener): () => void {
    this.listeners.add(listener);
    listener([...this.sessions]);
    return () => this.listeners.delete(listener);
  }

  public getSessions(): ChatSession[] {
    return [...this.sessions];
  }

  public getSession(id: string): ChatSession | undefined {
    return this.sessions.find(s => s.id === id);
  }

  public getActiveSession(): ChatSession {
    const found = this.sessions.find(s => s.id === this.activeSessionId);
    if (found) return found;
    return this.sessions[0];
  }

  public setActiveSessionId(id: string) {
    this.activeSessionId = id;
    this.markAsRead(id);
  }

  public markAsRead(sessionId: string) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.unreadCount = 0;
      session.messages.forEach(m => { m.readByAdmin = true; });
      this.save();
    }
  }

  public sendUserMessage(text: string, userAddress?: string): ChatMessage {
    let session = this.sessions.find(s => s.id === this.activeSessionId);
    if (!session) {
      session = this.sessions[0];
    }

    if (userAddress && (!session.userAddress || session.userAddress.includes('0x67c7'))) {
      session.userAddress = userAddress;
    }

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sender: 'user',
      senderName: userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Trader',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readByAdmin: false
    };

    session.messages.push(newMsg);
    session.unreadCount = (session.unreadCount || 0) + 1;
    session.status = 'waiting_admin';
    this.save();

    return newMsg;
  }

  public sendAdminMessage(sessionId: string, text: string): ChatMessage {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sender: 'admin',
      senderName: 'Tradex & Pulse Support Admin',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readByAdmin: true
    };

    session.messages.push(newMsg);
    session.status = 'active';
    session.unreadCount = 0;
    this.save();

    return newMsg;
  }

  public sendAIMessage(sessionId: string, text: string): ChatMessage {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sender: 'ai',
      senderName: 'Ora AI Node',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readByAdmin: true
    };

    session.messages.push(newMsg);
    this.save();

    return newMsg;
  }

  public resolveSession(sessionId: string) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'resolved';
      this.save();
    }
  }

  public reopenSession(sessionId: string) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'active';
      this.save();
    }
  }
}

export const liveChatService = new LiveChatService();
