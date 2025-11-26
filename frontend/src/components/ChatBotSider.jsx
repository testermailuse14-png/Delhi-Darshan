import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, User } from "lucide-react";
import { marked } from "marked";

// UPDATED: Correct model URL

export const ChatbotSidebar = ({ isOpen, onClose }) => {
  const apiKey =import.meta.env.VITE_GEMINI_API_KEY; // The environment will automatically inject the key here. If running locally, paste your key here.
  const apiurl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const [messages, setMessages] = useState([
    {
      id: "1",
      content:
        "Namaste! 🙏 I'm your Delhi Darshan AI Guide. I can help you explore Delhi, suggest famous places, give travel tips, best visiting times, food recommendations, and more. How may I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = async (userMessage) => {
    const systemPrompt =
        "You are 'Delhi Darshan AI', a friendly Delhi tourism guide. ALWAYS respond in clean Markdown format using headings, bold text, bullet points, and emojis. Keep answers structured, readable, and helpful.";

    try {
      const response = await fetch(apiurl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userMessage }]
            }
          ],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          }
        })
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("API Response:", err);
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      return (
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Couldn't process your request. Try again!"
      );

    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I’m having trouble reaching Google servers right now.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const botResponse = await getBotResponse(userMessage.content);

    const botMessage = {
      id: (Date.now() + 1).toString(),
      content: botResponse,
      isBot: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-[65px] h-[calc(100vh-65px)] w-90 bg-[#10101b] border-l border-slate-800 shadow-lg z-50 animate-slide-in">
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
              {/* Fallback icon if image fails */}
              <Bot className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100">
                Delhi Darshan AI
              </h3>
              <p className="text-xs text-slate-400">Your Virtual Travel Guide</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-slate-800 flex items-center justify-center"
          >
            <X className="h-4 w-4 text-amber-400" />
          </button>
        </div>

        {/* Chat Section */}
        <div
          ref={scrollAreaRef}
          className="flex-1 p-4 space-y-4 overflow-y-auto"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${
                !message.isBot && "flex-row-reverse space-x-reverse"
              }`}
            >
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  message.isBot
                    ? "bg-amber-600 text-white"
                    : "bg-slate-700 text-slate-200"
                }`}
              >
                {message.isBot ? (
                  <Bot className="h-3 w-3 text-white" />
                ) : (
                  <User className="h-3 w-3" />
                )}
              </div>

              <div className="max-w-[80%]">
                <div
                  className={`p-3 rounded-lg ${
                    message.isBot
                      ? "bg-slate-800 text-slate-200"
                      : "bg-amber-600 text-white"
                  }`}
                >
                <div
                    className="text-sm prose prose-invert"
                    dangerouslySetInnerHTML={{ __html: marked.parse(message.content) }}
                ></div>
                </div>
                <p
                  className={`text-xs text-slate-500 mt-1 ${
                    !message.isBot && "text-right"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start space-x-2">
              <div className="h-6 w-6 rounded-full bg-amber-600 flex items-center justify-center">
                <Bot className="h-3 w-3 text-white" />
              </div>
              <div className="p-3 rounded-lg bg-slate-800">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                  <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex space-x-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about Delhi…"
              disabled={isTyping}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="px-3 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-slate-700 flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};