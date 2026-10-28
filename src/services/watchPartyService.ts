import Peer, { DataConnection } from "peerjs";

export interface PartyParticipant {
  id: string;
  name: string;
  avatarColor: string;
  isHost: boolean;
  joinedAt: number;
}

export interface PartyChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatarColor: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface PartyReaction {
  id: string;
  emoji: string;
  senderName: string;
  xOffset: number; // percentage for floating position
}

export interface PartySyncState {
  mediaType: "movie" | "tv";
  contentId: string;
  contentTitle?: string;
  season?: string;
  episode?: string;
  hostName: string;
  updatedAt: number;
}

export type PartyMessageType =
  | { type: "JOIN"; user: PartyParticipant }
  | { type: "SYNC_STATE"; sync: PartySyncState; participants: PartyParticipant[] }
  | { type: "CHAT"; message: PartyChatMessage }
  | { type: "REACTION"; reaction: PartyReaction }
  | { type: "STREAM_CHANGE"; sync: PartySyncState }
  | { type: "PING" };

const AVATAR_COLORS = [
  "#B300FF", // MovieBuddy Purple
  "#FF007F", // Neon Pink
  "#00E5FF", // Cyan
  "#FFD600", // Yellow
  "#00E676", // Green
  "#FF6D00", // Orange
  "#7C4DFF", // Indigo
];

export const getRandomAvatarColor = (): string => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

export const generateRoomCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export class WatchPartySession {
  roomId: string;
  isHost: boolean;
  user: PartyParticipant;
  participants: Map<string, PartyParticipant> = new Map();
  peer: Peer | null = null;
  connections: DataConnection[] = [];
  broadcastChannel: BroadcastChannel | null = null;

  onMessage: (msg: PartyChatMessage) => void = () => {};
  onReaction: (reaction: PartyReaction) => void = () => {};
  onParticipantsChange: (participants: PartyParticipant[]) => void = () => {};
  onStreamSync: (sync: PartySyncState) => void = () => {};

  constructor(roomId: string, userName: string, isHost: boolean) {
    this.roomId = roomId.toUpperCase().trim();
    this.isHost = isHost;

    const userId = "user_" + Math.random().toString(36).substring(2, 9);
    this.user = {
      id: userId,
      name: userName || (isHost ? "Host" : "MovieFan"),
      avatarColor: getRandomAvatarColor(),
      isHost,
      joinedAt: Date.now(),
    };

    this.participants.set(this.user.id, this.user);
    this.initBroadcastChannel();
    this.initPeer();
  }

  // Cross-tab local channel sync (instant multi-tab support on same machine)
  private initBroadcastChannel() {
    try {
      this.broadcastChannel = new BroadcastChannel(`moviebuddy_party_${this.roomId}`);
      this.broadcastChannel.onmessage = (event) => {
        this.handleIncomingPayload(event.data);
      };
      // Announce self
      this.broadcastChannel.postMessage({
        type: "JOIN",
        user: this.user,
      });
    } catch (e) {
      console.warn("BroadcastChannel not available:", e);
    }
  }

  // WebRTC P2P connection via PeerJS cloud broker (free, serverless on Vercel)
  private initPeer() {
    try {
      const peerId = this.isHost
        ? `mbparty_${this.roomId.toLowerCase()}`
        : `mbpeer_${this.roomId.toLowerCase()}_${this.user.id}`;

      this.peer = new Peer(peerId, {
        debug: 1,
      });

      this.peer.on("open", () => {
        if (!this.isHost) {
          // Connect to the host peer
          const hostPeerId = `mbparty_${this.roomId.toLowerCase()}`;
          const conn = this.peer!.connect(hostPeerId, {
            reliable: true,
          });
          this.setupConnection(conn);
        }
      });

      this.peer.on("connection", (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on("error", (err: any) => {
        console.warn("PeerJS connection note:", err?.type || err);
        // If host peer ID is taken or fails, fall back to unique peer and broadcast
        if (err?.type === "unavailable-id" && this.isHost) {
          this.peer = new Peer(`mbparty_${this.roomId.toLowerCase()}_${Date.now()}`);
        }
      });
    } catch (e) {
      console.warn("PeerJS initialization error:", e);
    }
  }

  private setupConnection(conn: DataConnection) {
    this.connections.push(conn);

    conn.on("open", () => {
      // Send self join event
      conn.send({
        type: "JOIN",
        user: this.user,
      });
    });

    conn.on("data", (data: any) => {
      this.handleIncomingPayload(data);
    });

    conn.on("close", () => {
      this.connections = this.connections.filter((c) => c !== conn);
    });
  }

  private handleIncomingPayload(payload: PartyMessageType) {
    if (!payload || !payload.type) return;

    switch (payload.type) {
      case "JOIN": {
        if (payload.user && payload.user.id !== this.user.id) {
          this.participants.set(payload.user.id, payload.user);
          this.onParticipantsChange(Array.from(this.participants.values()));

          // System message
          this.onMessage({
            id: "sys_" + Date.now(),
            senderId: "system",
            senderName: "System",
            avatarColor: "#666",
            text: `${payload.user.name} joined the party! 🍿`,
            timestamp: Date.now(),
            isSystem: true,
          });

          // If we are host, reply with current participant list
          if (this.isHost) {
            this.broadcast({
              type: "SYNC_STATE",
              sync: {
                mediaType: "movie",
                contentId: "",
                hostName: this.user.name,
                updatedAt: Date.now(),
              },
              participants: Array.from(this.participants.values()),
            });
          }
        }
        break;
      }

      case "SYNC_STATE": {
        if (Array.isArray(payload.participants)) {
          payload.participants.forEach((p) => {
            this.participants.set(p.id, p);
          });
          this.onParticipantsChange(Array.from(this.participants.values()));
        }
        if (payload.sync && payload.sync.contentId) {
          this.onStreamSync(payload.sync);
        }
        break;
      }

      case "CHAT": {
        if (payload.message) {
          this.onMessage(payload.message);
        }
        break;
      }

      case "REACTION": {
        if (payload.reaction) {
          this.onReaction(payload.reaction);
        }
        break;
      }

      case "STREAM_CHANGE": {
        if (payload.sync) {
          this.onStreamSync(payload.sync);
          this.onMessage({
            id: "sys_" + Date.now(),
            senderId: "system",
            senderName: "System",
            avatarColor: "#666",
            text: `Host changed stream to ${payload.sync.contentTitle || "selected title"}${payload.sync.season ? ` (S${payload.sync.season} E${payload.sync.episode})` : ""}`,
            timestamp: Date.now(),
            isSystem: true,
          });
        }
        break;
      }
    }
  }

  // Send message to all connected peers and broadcast channel
  public broadcast(payload: PartyMessageType) {
    // 1. Send via BroadcastChannel
    try {
      this.broadcastChannel?.postMessage(payload);
    } catch {}

    // 2. Send via WebRTC P2P DataConnections
    this.connections.forEach((conn) => {
      try {
        if (conn.open) {
          conn.send(payload);
        }
      } catch {}
    });
  }

  public sendMessage(text: string) {
    if (!text.trim()) return;

    const msg: PartyChatMessage = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      senderId: this.user.id,
      senderName: this.user.name,
      avatarColor: this.user.avatarColor,
      text: text.trim(),
      timestamp: Date.now(),
    };

    // Emit locally
    this.onMessage(msg);

    // Broadcast to peers
    this.broadcast({
      type: "CHAT",
      message: msg,
    });
  }

  public sendReaction(emoji: string) {
    const reaction: PartyReaction = {
      id: "rx_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      emoji,
      senderName: this.user.name,
      xOffset: Math.floor(Math.random() * 80) + 10, // between 10% and 90%
    };

    // Emit locally
    this.onReaction(reaction);

    // Broadcast to peers
    this.broadcast({
      type: "REACTION",
      reaction,
    });
  }

  public syncStream(sync: PartySyncState) {
    if (!this.isHost) return;

    this.broadcast({
      type: "STREAM_CHANGE",
      sync,
    });
  }

  public leave() {
    try {
      this.broadcastChannel?.close();
      this.connections.forEach((c) => c.close());
      this.peer?.destroy();
    } catch {}
  }

  public destroy() {
    this.leave();
  }
}
