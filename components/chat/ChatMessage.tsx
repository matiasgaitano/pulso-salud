import type { Message } from "@/types";

interface Props {
  message: Message;
}

export function ChatMessage({ message }: Props) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-pulso-100 flex items-center justify-center">
          <svg
            className="h-4 w-4 text-pulso-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
      )}

      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isAssistant
            ? "bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm"
            : "bg-pulso-600 text-white rounded-tr-sm"
        }`}
      >
        {message.content}
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
          Vos
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-pulso-100 flex items-center justify-center">
        <svg
          className="h-4 w-4 text-pulso-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-4">
          <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
          <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
          <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
