import React, { useState, useEffect } from 'react';
import { CbtCard } from '../types';
import { api } from '../services/api';
import {
  Brain,
  Sparkles,
  Bookmark,
  Trash2,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Flame,
} from 'lucide-react';

export const CbtWorksheetTab: React.FC = () => {
  const [situation, setSituation] = useState('');
  const [negativeThought, setNegativeThought] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<CbtCard | null>(null);
  const [savedCards, setSavedCards] = useState<CbtCard[]>([]);

  useEffect(() => {
    api.getCbtCards().then((cards) => {
      if (cards && cards.length > 0) {
        setSavedCards(cards);
      }
    });
  }, []);

  const examplePrompts = [
    {
      sit: '친구의 대기업 최종 합격 인스타그램 게시물을 보았을 때',
      thought: '동기들은 다 앞서가는데 나만 도태되었어. 내 대학 생활은 전부 헛수고였어.',
    },
    {
      sit: '면접관이 꼬리 질문을 던졌을 때 말문이 잠시 막혔던 순간',
      thought: '면접관이 나를 엄청 한심하게 생각했을 거야. 이번 면접도 100% 탈락이야.',
    },
    {
      sit: '부모님이 조심스럽게 "요즘 지원은 잘 돼가니?" 물어보셨을 때',
      thought: '부모님께 짐만 되는 불효자식 같아서 얼굴을 들 수가 없어.',
    },
  ];

  const handleAnalyze = async () => {
    if (!negativeThought.trim() || isLoading) return;

    setIsLoading(true);
    setCurrentResult(null);

    try {
      const response = await fetch('/api/cbt-reframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: situation.trim() || '취업 준비 및 졸업 직전 고민',
          negativeThought: negativeThought.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('인지 재구성 분석 중 문제가 발생했습니다.');
      }

      const data = await response.json();
      const newCard: CbtCard = {
        id: `cbt-${Date.now()}`,
        createdAt: Date.now(),
        situation: situation.trim() || '취업 준비 중 힘든 순간',
        negativeThought: negativeThought.trim(),
        distortionType: data.distortionType || '비교 및 파국화 사고',
        distortionExplanation: data.distortionExplanation || '',
        objectiveEvidence: data.objectiveEvidence || '',
        reframedThought: data.reframedThought || '',
        microAction: data.microAction || '잠시 눈을 감고 깊은 복식호흡 3번 하기',
        warmEncouragement: data.warmEncouragement || '당신은 생각보다 훨씬 더 단단한 사람입니다.',
      };

      setCurrentResult(newCard);
    } catch (err: any) {
      console.error(err);
      alert('분석을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDeck = async () => {
    if (!currentResult) return;
    if (savedCards.some((c) => c.id === currentResult.id)) {
      alert('이미 보관함에 저장된 카드입니다.');
      return;
    }
    try {
      const saved = await api.saveCbtCard(currentResult);
      setSavedCards([saved, ...savedCards]);
    } catch (err) {
      console.error(err);
      setSavedCards([currentResult, ...savedCards]);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (window.confirm('이 생각 정리 카드를 삭제하시겠습니까?')) {
      setSavedCards(savedCards.filter((c) => c.id !== id));
      try {
        await api.deleteCbtCard(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Introduction Card */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 p-6 border border-amber-200/80 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-md">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              CBT 마음 생각 정리소 (Cognitive Reframing)
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              "생각은 사실이 아닙니다." 취업 준비 과정에서 떠오르는 파국화, 자책, 남들과의 비교 등
              부정적 자동사고를 심리학 인지행동치료(CBT) 프레임워크로 객관화하고 건강한 대안 사고로 재구성합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200 space-y-5">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <span>1단계: 나를 짓누르는 생각 꺼내놓기</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              어떤 상황이었나요? (선택 사항)
            </label>
            <input
              type="text"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="예: 공채 3차 서류 탈락 문자를 지하철에서 확인했을 때"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              그때 머릿속에 불쑥 떠오른 부정적인 생각은 무엇인가요? (필수)
            </label>
            <textarea
              value={negativeThought}
              onChange={(e) => setNegativeThought(e.target.value)}
              placeholder="예: '나는 아무런 쓸모가 없나 봐. 동기들은 다 취업하는데 나만 낙오자야. 내 인생은 끝났어.'"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 p-3.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Quick Example Pills */}
        <div className="pt-1">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            자주 겪는 생각 예시 클릭해보기:
          </span>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSituation(ex.sit);
                  setNegativeThought(ex.thought);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 transition text-left"
              >
                "{ex.thought.slice(0, 32)}..."
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!negativeThought.trim() || isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-md transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>인지 왜곡 분석 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>건강한 생각으로 재구성하기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Section */}
      {currentResult && (
        <div className="rounded-2xl bg-white p-6 shadow-xl border-2 border-amber-300 animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                발견된 인지 왜곡: {currentResult.distortionType}
              </span>
            </div>
            <button
              onClick={handleSaveToDeck}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
            >
              <Bookmark className="h-3.5 w-3.5" />
              보관함에 저장하기
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
              <span className="text-xs font-bold text-rose-800 block mb-1">나를 괴롭혔던 생각</span>
              <p className="text-sm text-slate-800 italic">"{currentResult.negativeThought}"</p>
              <p className="text-xs text-rose-700 mt-2.5 pt-2 border-t border-rose-200/60 leading-relaxed">
                <strong>왜곡 설명:</strong> {currentResult.distortionExplanation}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 block mb-1">
                객관적 반박 사실 (Fact Check)
              </span>
              <p className="text-sm text-slate-800 leading-relaxed">{currentResult.objectiveEvidence}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <span className="text-xs font-bold text-amber-800 block mb-1.5">
              🌱 마음에 품어야 할 건강한 대안적 사고
            </span>
            <p className="text-base font-bold text-slate-900 leading-relaxed">
              "{currentResult.reframedThought}"
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-600 block mb-1">
                오늘의 5분 마이크로 힐링 액션
              </span>
              <p className="text-xs text-slate-700 font-medium">{currentResult.microAction}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-600 block mb-1">
                상담사의 따뜻한 한마디
              </span>
              <p className="text-xs text-slate-700 font-medium italic">
                {currentResult.warmEncouragement}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Saved Cards Vault */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              나의 생각 방패 보관함 ({savedCards.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">불안할 때 꺼내어 읽어보세요</span>
        </div>

        {savedCards.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 text-slate-400 text-sm">
            아직 보관된 생각 정리 카드가 없습니다. 위에서 생각을 재구성하고 보관해 보세요.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {savedCards.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                    {card.distortionType}
                  </span>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="카드 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-500 line-through truncate">
                  "{card.negativeThought}"
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-sm font-semibold text-slate-900 leading-relaxed">
                  "{card.reframedThought}"
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>실천: {card.microAction.slice(0, 24)}...</span>
                  <span>{new Date(card.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
