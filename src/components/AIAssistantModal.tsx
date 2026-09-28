import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../utils/helpers';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionButtons?: { label: string; code: string }[];
}

export const AIAssistantModal: React.FC = () => {
  const {
    aiModalOpen,
    setAiModalOpen,
    promoCodes,
    storeInfo,
    visibleProducts,
    setCartDrawerOpen,
    setNotificationModalOpen,
    applyPromoCode,
    setQuickViewProduct
  } = useStore();

  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      sender: 'assistant',
      text: 'Hello! 👋 I can help you find products, promo codes, and store info. Try asking "show promo codes", "who is the owner", or "show headphones".'
    }
  ]);

  if (!aiModalOpen) return null;

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Generate response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply: ChatMessage;

      if (lower.includes('promo') || lower.includes('coupon') || lower.includes('discount')) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Here are our active store promo codes! Click to apply directly:',
          actionButtons: promoCodes.map((p) => ({
            label: `${p.code} (${Math.round(p.discount * 100)}% OFF)`,
            code: p.code
          }))
        };
      } else if (lower.includes('owner') || lower.includes('founder') || lower.includes('about')) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `👤 Founder & Owner: ${storeInfo.owner}\n📍 City: ${storeInfo.city}\n📞 Phone: ${storeInfo.phone}\n✉️ Email: ${storeInfo.email}`
        };
      } else if (lower.includes('cart')) {
        setCartDrawerOpen(true);
        setAiModalOpen(false);
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Opening your cart right now! 🛒'
        };
      } else if (lower.includes('notification')) {
        setNotificationModalOpen(true);
        setAiModalOpen(false);
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Opening your store notifications! 🔔'
        };
      } else if (
        lower.includes('headphone') ||
        lower.includes('watch') ||
        lower.includes('shoe') ||
        lower.includes('glasses') ||
        lower.includes('product')
      ) {
        const found = visibleProducts
          .filter((p) => {
            const words = lower.split(/\s+/).filter((w) => w.length > 3);
            return words.some((w) => p.name.toLowerCase().includes(w) || p.category.toLowerCase().includes(w));
          })
          .slice(0, 3);

        if (found.length > 0) {
          reply = {
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: `I found these matching products for you:\n\n${found
              .map((p) => `• ${p.name} — ${formatPKR(p.price)}`)
              .join('\n')}`
          };
        } else {
          reply = {
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: 'I could not find exact items for that keyword, but you can explore our categories on the home page!'
          };
        }
      } else {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'I can help with products, promo codes, cart, and store info. Try asking "show promo codes" or "who is the owner".'
        };
      }

      setMessages((prev) => [...prev, reply]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#13131a] rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/70 max-w-lg w-full border border-purple-900/40 relative flex flex-col max-h-[82vh] animate-[slideUpFade_0.3s_cubic-bezier(0.22,1,0.36,1)]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/40 flex items-center justify-between bg-gradient-to-r from-purple-950/70 via-purple-900/30 to-[#13131a] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-900/40">
              <i className="fa-solid fa-wand-magic-sparkles text-sm" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">AI Assistant</h3>
              <p className="text-[11px] text-purple-400">Ask me anything about ApexStore</p>
            </div>
          </div>
          <button
            onClick={() => setAiModalOpen(false)}
            className="text-purple-400 hover:text-purple-300 p-2 cursor-pointer rounded-xl"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* Chat History */}
        <div className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-purple-950 text-purple-300 flex items-center justify-center text-xs shrink-0 border border-purple-800/40">
                  <i className="fa-solid fa-robot" />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl text-xs max-w-[85%] whitespace-pre-line leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white'
                    : 'bg-[#1a1a24] text-purple-100 border border-purple-900/30'
                }`}
              >
                {m.text}

                {/* Promo Code Action Buttons */}
                {m.actionButtons && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-purple-900/40">
                    {m.actionButtons.map((btn) => (
                      <button
                        key={btn.code}
                        type="button"
                        onClick={() => {
                          applyPromoCode(btn.code);
                          setCartDrawerOpen(true);
                          setAiModalOpen(false);
                        }}
                        className="bg-purple-900 hover:bg-purple-800 text-purple-200 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-purple-600/40 transition cursor-pointer"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-purple-900/40 bg-[#13131a] flex gap-2 shrink-0">
          <input
            type="text"
            placeholder="Ask about products, promos, founder..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-purple-900/60 outline-none focus:border-purple-400 bg-[#0a0a0f] text-white"
          />
          <button
            type="button"
            onClick={handleSend}
            className="bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
  );
};
