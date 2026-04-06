import { useEffect, useMemo, useState } from 'react';
import chatService from '../services/chatService';

const STORAGE_KEY = 'shoe_chat_history';

const initialMessage = {
  role: 'assistant',
  content:
    'Xin chao ban. Minh la Luna. Minh co the tu van giay theo size, mau, ngan sach va nhu cau su dung nha.',
};

function LunaOrbIcon({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="luna-gradient" x1="5" y1="4" x2="27" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="0.5" stopColor="#2563EB" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="13" fill="url(#luna-gradient)" />
      <path
        d="M16 8.3L17.9 13L22.7 14.9L17.9 16.7L16 21.7L14.1 16.7L9.3 14.9L14.1 13L16 8.3Z"
        fill="white"
      />
      <circle cx="22.7" cy="9.4" r="1.1" fill="#DBEAFE" />
      <circle cx="10.1" cy="22.8" r="0.95" fill="#BFDBFE" />
    </svg>
  );
}

function ChatLaunchIcon({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="chat-launch-gradient" x1="6" y1="5" x2="30" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93C5FD" />
          <stop offset="0.5" stopColor="#2563EB" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
      </defs>
      <path
        d="M18 5.5C10.82 5.5 5 10.87 5 17.5C5 21.08 6.71 24.3 9.44 26.5L8.42 31L13.04 28.94C14.58 29.34 16.25 29.55 18 29.55C25.18 29.55 31 24.18 31 17.5C31 10.87 25.18 5.5 18 5.5Z"
        fill="url(#chat-launch-gradient)"
      />
      <path
        d="M13 18H23M13 14.5H20.5M13 21.5H18.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeadsetIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 12a7 7 0 0 1 14 0v4a2 2 0 0 1-2 2h-1v-6h1a5 5 0 0 0-10 0h1v6H7a2 2 0 0 1-2-2v-4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 18a2 2 0 0 1-2 2h-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [initialMessage];
    }

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [initialMessage];
    } catch {
      return [initialMessage];
    }
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const historyForApi = useMemo(
    () =>
      messages.map((item) => ({
        role: item.role,
        content: item.content,
      })),
    [messages]
  );

  const handleSend = async () => {
    const message = input.trim();
    if (!message || loading) {
      return;
    }

    setMessages((current) => [...current, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatService.sendMessage(message, historyForApi);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            data.reply ||
            'Minh dang gap mot chut loi khi tu van. Ban thu hoi minh them 1 lan nua nhe.',
        },
      ]);
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        'Minh dang bi loi ket noi den AI. Ban kiem tra API key va thu lai giup minh nhe.';

      setMessages((current) => [...current, { role: 'assistant', content: apiMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    const resetMessages = [initialMessage];
    setMessages(resetMessages);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(resetMessages));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Mo chatbot Luna AI"
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-slate-800/30 bg-[radial-gradient(circle_at_30%_30%,#1d4ed8,#0f172a_68%,#020617)] text-white shadow-[0_18px_46px_rgba(15,23,42,0.38)] transition duration-200 hover:scale-[1.03] hover:shadow-[0_24px_56px_rgba(15,23,42,0.46)]"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur">
          <ChatLaunchIcon className="h-9 w-9" />
        </div>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[392px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
          <div className="flex items-center justify-between bg-[linear-gradient(135deg,#081225,#14264f_50%,#2563eb)] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-inner shadow-white/10 backdrop-blur">
                <LunaOrbIcon className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-base font-semibold tracking-[0.01em]">Luna AI</div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                    Online
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-200/90">
                  <HeadsetIcon className="h-3.5 w-3.5" />
                  <span>Tro ly tu van giay the thao chuyen nghiep</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearChat}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-white/10"
              >
                Xoa chat
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Dong chatbot"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc,#f1f5f9)] px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                  message.role === 'user'
                    ? 'ml-auto bg-[linear-gradient(135deg,#2563eb,#1d4ed8,#3b82f6)] text-white shadow-blue-200/50'
                    : 'mr-auto border border-slate-200 bg-white text-slate-800'
                }`}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div className="mr-auto max-w-[85%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                Luna dang tim giay hop cho ban...
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Vi du: Minh can giay chay bo cho nam, size 42, tam 2 trieu"
              className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Ban co the hoi ve size, mau, gia va loai giay.
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={loading}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Gui
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;
