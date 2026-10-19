import React, { useState } from 'react';
import { ASSESSMENTS } from '../data/assessments';
import { AssessmentType, AssessmentReport, CounselorId } from '../types';
import {
  Activity,
  Flame,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  Loader2,
  FileBarChart,
} from 'lucide-react';

interface AssessmentTabProps {
  onStartCounselingWith: (counselorId: CounselorId) => void;
}

export const AssessmentTab: React.FC<AssessmentTabProps> = ({ onStartCounselingWith }) => {
  const [selectedTestId, setSelectedTestId] = useState<string>(ASSESSMENTS[0].id);
  const activeTest = ASSESSMENTS.find((t) => t.id === selectedTestId) || ASSESSMENTS[0];

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState<AssessmentReport | null>(null);

  const handleSelectOption = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const totalQuestions = activeTest.questions.length;
  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === totalQuestions;

  const currentScore = Object.values(answers).reduce((acc, curr) => acc + curr, 0);
  const maxPossibleScore = totalQuestions * 3;

  const handleRunAssessment = async () => {
    if (!isComplete || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/assess-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: activeTest.title,
          score: currentScore,
          maxScore: maxPossibleScore,
          answersSummary: answers,
        }),
      });

      if (!response.ok) {
        throw new Error('진단 결과를 생성하지 못했습니다.');
      }

      const data = await response.json();
      setReport({
        testType: activeTest.title,
        score: currentScore,
        maxScore: maxPossibleScore,
        severityLevel: data.severityLevel || '중간 수준의 스트레스',
        summaryTitle: data.summaryTitle || '취업 불확실성에 따른 정서적 피로 상태',
        emotionalStateDescription:
          data.emotionalStateDescription ||
          '현재 졸업과 취업 준비 과정에서 높은 심리적 부담을 느끼고 있으며, 충분한 자기 회복의 시간이 필요합니다.',
        recommendedActions:
          data.recommendedActions || [
            '매일 1시간은 취업 생각에서 벗어나 온전히 나를 위한 시간 갖기',
            '타인과의 비교 대신 어제보다 한 걸음 나아간 내 모습을 칭찬하기',
            '전문 상담사와 마음의 짐을 함께 털어놓고 재정비하기',
          ],
        recommendedCounselor: data.recommendedCounselor || 'empathy',
        recommendedCounselorReason:
          data.recommendedCounselorReason || '현재 지친 마음의 온전한 수용과 자존감 회복이 가장 우선시됩니다.',
        date: new Date().toLocaleDateString(),
      });
    } catch (err) {
      console.error(err);
      // Fallback
      setReport({
        testType: activeTest.title,
        score: currentScore,
        maxScore: maxPossibleScore,
        severityLevel: currentScore > maxPossibleScore * 0.6 ? '적극적 휴식 및 상담 권장' : '경미한 주의 수준',
        summaryTitle: '마음 에너지 재충전이 필요한 시점',
        emotionalStateDescription:
          '취업 압박감으로 인해 심리적 피로가 누적되어 있습니다. 혼자 모든 것을 감당하려 하지 마세요.',
        recommendedActions: [
          '주변 사람들과의 비교를 줄이고 SNS 사용 시간 조절하기',
          '작은 성취 목록(Small Wins)을 매일 3개씩 기록하기',
          '전문 상담사와의 대화로 인지 왜곡 덜어내기',
        ],
        recommendedCounselor: 'empathy',
        recommendedCounselorReason: '따뜻한 공감과 지지가 지금 가장 큰 힘이 됩니다.',
        date: new Date().toLocaleDateString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setReport(null);
  };

  const getSeverityBadgeClass = (level: string) => {
    if (level.includes('안정')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (level.includes('주의')) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Test Selector Tabs */}
      <div className="grid sm:grid-cols-3 gap-3">
        {ASSESSMENTS.map((test) => {
          const isSelected = test.id === selectedTestId;
          return (
            <button
              key={test.id}
              onClick={() => {
                setSelectedTestId(test.id);
                handleReset();
              }}
              className={`p-4 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md border-slate-900 ring-2 ring-slate-900/10'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {test.id === 'job-stress' && <Activity className={`h-4 w-4 ${isSelected ? 'text-rose-400' : 'text-rose-500'}`} />}
                {test.id === 'burnout' && <Flame className={`h-4 w-4 ${isSelected ? 'text-amber-400' : 'text-amber-500'}`} />}
                {test.id === 'imposter' && <ShieldAlert className={`h-4 w-4 ${isSelected ? 'text-indigo-400' : 'text-indigo-500'}`} />}
                <h4 className="font-bold text-sm">{test.title}</h4>
              </div>
              <p className={`text-xs line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {test.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Test Container */}
      {!report ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{activeTest.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{activeTest.description}</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600">
                진행률: {answeredCount} / {totalQuestions}
              </span>
              <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {activeTest.questions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{q.text}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pl-9">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt.score;
                    return (
                      <button
                        key={opt.score}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.score)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
            >
              다시 작성하기
            </button>

            <button
              onClick={handleRunAssessment}
              disabled={!isComplete || isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 shadow-md transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI 분석 처방전 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>맞춤 심리 결과 및 처방전 보기</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Report Result View */
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityBadgeClass(report.severityLevel)}`}>
                {report.severityLevel}
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{report.summaryTitle}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{report.testType} • 검사일: {report.date}</p>
            </div>

            <div className="text-right bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 block">종합 측정 점수</span>
              <div className="text-2xl font-black text-indigo-600">
                {report.score} <span className="text-sm font-medium text-slate-400">/ {report.maxScore}점</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-sm text-slate-800 mb-2">🔍 현재 심리 상태 분석</h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {report.emotionalStateDescription}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200">
            <h4 className="font-bold text-sm text-indigo-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-indigo-600" />
              <span>추천 멘탈 케어 실천 지침 3가지</span>
            </h4>
            <div className="space-y-2">
              {report.recommendedActions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                  <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">
                추천 1:1 심리상담사 연계
              </span>
              <h5 className="font-bold text-slate-900 text-sm">
                당신의 상태에는 '{report.recommendedCounselor === 'cbt' ? '도윤 (CBT 코치)' : report.recommendedCounselor === 'interview' ? '지안 (면접 케어)' : report.recommendedCounselor === 'career' ? '서준 (진로 탐색)' : '민서 (따뜻한 공감)'}' 상담사가 가장 적합합니다.
              </h5>
              <p className="text-xs text-slate-600 mt-1">{report.recommendedCounselorReason}</p>
            </div>

            <button
              onClick={() => onStartCounselingWith(report.recommendedCounselor)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-md flex items-center gap-2 shrink-0 transition"
            >
              <MessageSquare className="h-4 w-4" />
              <span>추천 상담사와 대화하기</span>
            </button>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
            <span>본 자가진단은 간이 선별 도구이며 전문의의 의학적 진단을 대신하지 않습니다.</span>
            <button onClick={handleReset} className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>다른 검사하기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
