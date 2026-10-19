import React, { useState, useEffect, useRef } from 'react';
import { Counselor, CounselorId, ChatMessage, UserProfile } from '../types';
import { COUNSELORS } from '../data/counselors';
import {
  Send,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Heart,
  Bot,
  User,
  MessageCircle,
  Lightbulb,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ChatTabProps {
  currentCounselorId: CounselorId;
  onSelectCounselor: (id: CounselorId) => void;
  userProfile: UserProfile;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  currentCounselorId,
  onSelectCounselor,
  userProfile,
}) => {
  const currentCounselor =
    COUNSELORS.find((c) => c.id === currentCounselorId) || COUNSELORS[0];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(`chat_history_${currentCounselorId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        content: currentCounselor.introMessage,
        timestamp: Date.now(),
        counselorId: currentCounselor.id,
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    keyInsight: string;
    healingPrescription: string;
    warmMessage: string;
  } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // When counselor changes, load corresponding history
  useEffect(() => {
    const saved = localStorage.getItem(`chat_history_${currentCounselorId}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
        return;
      } catch (e) {
        // fallback
      }
    }
    setMessages([
      {
        id: `welcome-${currentCounselorId}`,
        role: 'model',
        content: currentCounselor.introMessage,
        timestamp: Date.now(),
        counselorId: currentCounselor.id,
      },
    ]);
  }, [currentCounselorId]);

  // Save messages to local storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_history_${currentCounselorId}`, JSON.stringify(messages));
    }
  }, [messages, currentCounselorId]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.95; // comfortable, gentle pace
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputValue.trim();
    if (!textToSend || isLoading) return;

    setErrorMsg(null);
    if (!customPrompt) {
      setInputValue('');
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
      counselorId: currentCounselor.id,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Send chat request to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          counselorId: currentCounselor.id,
          userProfile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '상담 응답을 불러오지 못했습니다.');
      }

      const data = await response.json();
      const botReply = data.reply || '마음을 편안히 가지세요. 언제든 당신의 곁에 있을게요.';

      const botMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        content: botReply,
        timestamp: Date.now(),
        counselorId: currentCounselor.id,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (ttsEnabled) {
        speakText(botReply);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMsg(err.message || '상담 서버와 연결 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (window.confirm('현재 상담 대화 내역을 비우고 새로운 마음으로 다시 시작할까요?')) {
      const resetMessages: ChatMessage[] = [
        {
          id: `welcome-${Date.now()}`,
          role: 'model',
          content: currentCounselor.introMessage,
          timestamp: Date.now(),
          counselorId: currentCounselor.id,
        },
      ];
      setMessages(resetMessages);
      localStorage.setItem(`chat_history_${currentCounselorId}`, JSON.stringify(resetMessages));
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateSummary = async () => {
    if (messages.length < 3) {
      alert('상담 대화가 2회 이상 진행된 후 마음 요약 카드를 발급받으실 수 있어요.');
      return;
    }

    setIsSummarizing(true);
    setShowSummaryModal(true);

    try {
      const conversationText = messages
        .map((m) => `${m.role === 'user' ? '내담자' : '상담사'}: ${m.content}`)
        .join('\n');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `다음은 대학 졸업예정자와 심리상담사 간의 상담 대화입니다:\n${conversationText}\n\n이 대화를 바탕으로 내담자를 위한 [오늘의 마음 처방전 요약 카드]를 작성해 주세요. 
반드시 아래 형식에 맞춰 작성해 주세요:
1. keyInsight: 오늘 발견한 핵심 마음의 원인 및 통찰 (2~3문장)
2. healingPrescription: 오늘 당장 실천할 작은 힐링 행동 (1~2문장)
3. warmMessage: 상담사 ${currentCounselor.name}가 전하는 따뜻한 마지막 위로의 편지 (2~3문장)`,
            },
          ],
          counselorId: currentCounselor.id,
          userProfile,
        }),
      });

      const data = await response.json();
      const rawText = data.reply || '';

      // Simple parsing or direct display
      setSummaryData({
        keyInsight: rawText,
        healingPrescription: '오늘 밤은 자소서 생각을 멈추고 따뜻한 샤워 후 좋아하는 노래 1곡을 들으며 온전히 쉬어주기',
        warmMessage: `당신이 달려온 대학 4년의 노력은 결코 사라지지 않아요. 오늘 하루도 정말 수고 많았어요. - 상담사 ${currentCounselor.name}`,
      });
    } catch (e) {
      console.error(e);
      setSummaryData({
        keyInsight: '취업에 대한 높은 불안감 속에서도 자신의 감정을 용기 내어 마주하고 털어놓았습니다.',
        healingPrescription: '자책 대신 "오늘도 애쓴 나"를 토닥여주는 따뜻한 휴식을 취해보세요.',
        warmMessage: `충분히 잘하고 있어요. 한 걸음씩 당신의 호흡대로 나아가세요. - 상담사 ${currentCounselor.name}`,
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[580px] max-w-5xl mx-auto rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
      {/* Counselor Selection Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {COUNSELORS.map((c) => {
            const isSelected = c.id === currentCounselorId;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCounselor(c.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <span>{c.avatarEmoji}</span>
                <span>{c.name}</span>
                <span className={`text-[10px] hidden md:inline opacity-80 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {c.role}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (ttsEnabled && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              setTtsEnabled(!ttsEnabled);
            }}
            title={ttsEnabled ? '음성 읽기 끄기' : '상담사 목소리로 듣기'}
            className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition ${
              ttsEnabled
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{ttsEnabled ? '음성 켜짐' : '음성 듣기'}</span>
          </button>

          <button
            onClick={handleGenerateSummary}
            className="p-2 sm:px-3 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition"
            title="오늘 상담 요약 및 처방 카드 발급"
          >
            <FileText className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">마음 처방전 요약</span>
          </button>

          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition"
            title="대화 초기화"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Current Counselor Banner */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${currentCounselor.avatarBg} text-white flex items-center justify-center text-lg shadow-sm`}
          >
            {currentCounselor.avatarEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{currentCounselor.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentCounselor.badgeColor}`}>
                {currentCounselor.role}
              </span>
            </div>
            <p className="text-slate-500 text-xs hidden sm:block">{currentCounselor.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-medium text-emerald-700 hidden sm:inline">실시간 1:1 상담 중</span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-200`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : `bg-gradient-to-tr ${currentCounselor.avatarBg} text-white`
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : currentCounselor.avatarEmoji}
              </div>

              <div className={`max-w-[85%] sm:max-w-[78%] group`}>
                <div
                  className={`relative p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  {msg.content}

                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 opacity-90 group-hover:opacity-100 transition">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-rose-400" />
                        <span>청춘쉼표 공감 케어</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(msg.content)}
                          className="hover:text-slate-700 flex items-center gap-1"
                          title="다시 듣기"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-slate-700 flex items-center gap-1"
                          title="복사하기"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`text-[10px] text-slate-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 animate-in fade-in duration-200">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 bg-gradient-to-tr ${currentCounselor.avatarBg} text-white shadow-sm`}
            >
              {currentCounselor.avatarEmoji}
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
                <span>{currentCounselor.name} 상담사가 마음을 담아 답변을 적고 있어요...</span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-white border-t border-slate-100 p-2.5 sm:px-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          <span className="font-semibold text-slate-600 text-[11px]">이런 마음을 털어놓아 보세요:</span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto pb-1">
          {currentCounselor.suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs transition border border-slate-200/60 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-end gap-2.5"
      >
        <div className="relative flex-1">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`${currentCounselor.name} 상담사에게 솔직한 마음을 들려주세요 (Shift+Enter로 줄바꿈)`}
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 p-3 pr-10 text-sm placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 bg-slate-50/50 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="h-11 px-5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="hidden sm:inline">전송</span>
        </button>
      </form>

      {/* Summary Prescription Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">오늘의 마음 처방전 & 요약 카드</h3>
                  <p className="text-xs text-slate-500">상담사 {currentCounselor.name}가 당신에게 전하는 소중한 기록</p>
                </div>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                닫기
              </button>
            </div>

            {isSummarizing ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
                <p className="text-sm font-medium text-slate-700">오늘의 대화를 되돌아보며 처방전을 정성껏 작성 중입니다...</p>
              </div>
            ) : summaryData ? (
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">상담 핵심 통찰</span>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{summaryData.keyInsight}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">오늘의 마이크로 힐링 처방</span>
                  <p className="text-emerald-950 font-medium leading-relaxed">{summaryData.healingPrescription}</p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
                  <span className="text-xs font-bold text-rose-800 uppercase block mb-1">상담사의 온기 편지</span>
                  <p className="text-rose-950 leading-relaxed italic">{summaryData.warmMessage}</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowSummaryModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    마음에 간직하기
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
