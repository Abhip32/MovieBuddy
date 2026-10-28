import React, { useState, useEffect, useRef } from "react";
import {
  IoSend,
  IoCopy,
  IoCheckmark,
  IoClose,
  IoPeople,
} from "react-icons/io5";
import { FaCrown } from "react-icons/fa";
import {
  WatchPartySession,
  PartyChatMessage,
  PartyParticipant,
  PartyReaction,
  PartySyncState,
} from "../../services/watchPartyService";

interface WatchPartyDockProps {
  session: WatchPartySession;
  currentContentTitle: string;
  onLeave: () => void;
  onSyncWithHost?: (sync: PartySyncState) => void;
}

const QUICK_EMOJIS = ["🍿", "🔥", "❤️", "😂", "😱", "👏"];

export const WatchPartyDock: React.FC<WatchPartyDockProps> = ({
  session,
  onLeave,
  onSyncWithHost,
}) => {
  const [messages, setMessages] = useState<PartyChatMessage[]>([]);
  const [participants, setParticipants] = useState<PartyParticipant[]>([session.user]);
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<PartyReaction[]>([]);
  const [showMembersList, setShowMembersList] = useState(false);
  const [hostSyncNotice, setHostSyncNotice] = useState<PartySyncState | null>(null);

  // Rename states
  const [currentName, setCurrentName] = useState(session.user.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(session.user.name);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: "sys_init",
        senderId: "system",
        senderName: "System",
        avatarColor: "#888",
        text: `Welcome to Watch Party! Room: ${session.roomId}. Share the code to invite friends. 🍿`,
        timestamp: Date.now(),
        isSystem: true,
      },
    ]);

    // Hook listeners
    session.onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    session.onReaction = (rx) => {
      setFloatingReactions((prev) => [...prev, rx]);
      // Remove reaction after 3.5s animation
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== rx.id));
      }, 3500);
    };

    session.onParticipantsChange = (list) => {
      setParticipants(list);
    };

    session.onStreamSync = (sync) => {
      if (!session.isHost) {
        setHostSyncNotice(sync);
      }
    };
  }, [session]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    session.sendMessage(inputText);
    setInputText("");
  };

  const handleSendReaction = (emoji: string) => {
    session.sendReaction(emoji);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed) {
      session.setUserName(trimmed);
      setCurrentName(trimmed);
      setIsEditingName(false);
    }
  };

  return (
    <>
      {/* Floating Reaction Bursts (Rendered across video/screen) */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {floatingReactions.map((rx) => (
          <div
            key={rx.id}
            style={{ left: `${rx.xOffset}%` }}
            className="absolute bottom-16 sm:bottom-24 animate-floatUp flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-dark-purple/40 shadow-2xl text-white"
          >
            <span className="text-2xl animate-bounce">{rx.emoji}</span>
            <span className="text-[11px] font-semibold text-purple-300">
              {rx.senderName}
            </span>
          </div>
        ))}
      </div>

      {/* Watch Party Side Dock Panel */}
      <div className="flex flex-col h-full bg-black-2 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Dock Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#180a29] to-black-2 border-b border-white/10 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Watch Party</span>
                {session.isHost && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                    <FaCrown size={9} /> Host
                  </span>
                )}
              </h3>
            </div>

            {/* Room Code & Editable Nickname */}
            <div className="flex items-center gap-2 text-[11px] text-light-gray mt-1 flex-wrap">
              <span>
                Room: <strong className="text-purple-300 font-mono font-semibold">{session.roomId}</strong>
              </span>
              <span>•</span>
              {isEditingName ? (
                <form onSubmit={handleSaveRename} className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-24 px-1.5 py-0.5 bg-black border border-dark-purple rounded text-[11px] text-white focus:outline-none"
                    autoFocus
                  />
                  <button type="submit" title="Save Name" className="text-green-400 hover:text-green-300 cursor-pointer">
                    <IoCheckmark size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(currentName);
                      setIsEditingName(false);
                    }}
                    title="Cancel"
                    className="text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <IoClose size={14} />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  title="Click to edit your display name"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer group"
                >
                  <span>
                    You: <strong className="text-white group-hover:text-purple-300 transition-colors">{currentName}</strong>
                  </span>
                  <span className="text-[10px] text-dark-purple group-hover:underline">edit</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Copy Invite Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy Party Link"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-light-gray hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs border border-white/10"
            >
              {copied ? <IoCheckmark className="text-green-400" /> : <IoCopy />}
              <span className="hidden xs:inline">{copied ? "Copied" : "Invite"}</span>
            </button>

            {/* Members Toggle */}
            <button
              type="button"
              onClick={() => setShowMembersList((prev) => !prev)}
              title="Party Members"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-light-gray hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs border border-white/10"
            >
              <IoPeople />
              <span>{participants.length}</span>
            </button>

            {/* Leave Party */}
            <button
              type="button"
              onClick={onLeave}
              title="Leave Watch Party"
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer text-xs"
            >
              <IoClose size={16} />
            </button>
          </div>
        </div>

        {/* Members Drawer */}
        {showMembersList && (
          <div className="p-3 bg-black/90 border-b border-white/10 animate-fadeIn text-xs">
            <h4 className="text-[11px] font-semibold uppercase text-light-gray tracking-wider mb-2">
              In This Party ({participants.length}):
            </h4>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: p.avatarColor }}
                      className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white"
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium text-white">{p.name}</span>
                    {p.id === session.user.id && (
                      <span className="text-[9px] text-light-gray">(You)</span>
                    )}
                  </div>
                  {p.isHost && (
                    <span className="text-amber-400 text-[10px] flex items-center gap-1">
                      <FaCrown size={10} /> Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Host Sync Banner (when guest stream differs) */}
        {hostSyncNotice && (
          <div className="p-2.5 bg-dark-purple/20 border-b border-dark-purple/40 flex items-center justify-between gap-2 text-xs">
            <span className="text-purple-200">
              👑 Host updated the stream.
            </span>
            <button
              type="button"
              onClick={() => {
                if (onSyncWithHost && hostSyncNotice) {
                  onSyncWithHost(hostSyncNotice);
                }
                setHostSyncNotice(null);
              }}
              className="px-2.5 py-1 rounded bg-dark-purple hover:bg-deep-purple font-semibold text-white transition-colors cursor-pointer flex-shrink-0"
            >
              Sync Player
            </button>
          </div>
        )}

        {/* Chat Messages Stream */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 scrollbar-thin">
          {messages.map((m) => {
            if (m.isSystem) {
              return (
                <div
                  key={m.id}
                  className="text-center py-1 px-2.5 my-1 rounded-full bg-white/5 text-[11px] text-purple-300/80 italic max-w-xs mx-auto"
                >
                  {m.text}
                </div>
              );
            }

            const isSelf = m.senderId === session.user.id;

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    style={{ backgroundColor: m.avatarColor }}
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  >
                    {m.senderName.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-[11px] font-semibold text-light-gray">
                    {m.senderName}
                  </span>
                </div>
                <div
                  className={`py-2 px-3 rounded-2xl text-xs max-w-[85%] break-words leading-relaxed ${
                    isSelf
                      ? "bg-dark-purple text-white rounded-br-none"
                      : "bg-white/10 text-white rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reaction Emoji Row */}
        <div className="p-2 bg-black/60 border-t border-white/5 flex items-center justify-around">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSendReaction(emoji)}
              title={`React ${emoji}`}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-transform active:scale-125 text-lg cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-2.5 sm:p-3 bg-black-2 border-t border-white/10 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Chat with party..."
            className="flex-1 px-3 py-2 rounded-xl bg-black border border-white/15 text-xs sm:text-sm text-white placeholder-light-gray/60 focus:outline-none focus:border-dark-purple transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-dark-purple hover:bg-deep-purple font-medium text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <IoSend size={14} />
          </button>
        </form>
      </div>
    </>
  );
};
