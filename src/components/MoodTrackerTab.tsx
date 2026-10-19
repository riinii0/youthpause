import React, { useState, useEffect, useMemo } from 'react';
import { MoodRecord, MoodScore, CounselorId } from '../types';
import { api } from '../services/api';
import {
  Calendar,
  Smile,
  Frown,
  Meh,
  Sun,
  CloudRain,
  Cloud,
  CloudSun,
  Sparkles,
  TrendingUp,
  BarChart2,
  Trash2,
  Plus,
  Heart,
  MessageSquare,
  Wind,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Tag,
} from 'lucide-react';

interface MoodTrackerTabProps {
  onNavigateToChat?: (counselorId: CounselorId) => void;
  onNavigateToBreathing?: () => void;
}

const MOOD_LEVELS: {
  score: MoodScore;
  label: string;
  emoji: string;
  desc: string;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    score: 1,
    label: '매우 힘듦 / 지침',
    emoji: '🌧️',
    desc: '무기력, 탈락 충격, 극심한 스트레스',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  {
    score: 2,
    label: '불안 / 초조함',
    emoji: '☁️',
    desc: '동기 비교, 막막함, 자책감',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    score: 3,
    label: '보통 / 무난함',
    emoji: '⛅',
    desc: '그저 그런 날, 차분한 하루',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
  {
    score: 4,
    label: '안정 / 회복 중',
    emoji: '🌤️',
    desc: '작은 성취, 편안한 휴식, 희망',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  {
    score: 5,
    label: '상쾌 / 뿌듯함',
    emoji: '☀️',
    desc: '충만함, 서류 합격, 자신감 상승',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
];

const QUICK_TAGS = [
  '서류탈락',
  '서류합격',
  '면접준비',
  '면접완료',
  '자소서작성',
  '스터디',
  '동기비교',
  '부모님기대',
  '산책휴식',
  '운동',
  '도서관',
  '번아웃',
  '작은성취',
  '친구대화',
];

export const MoodTrackerTab: React.FC<MoodTrackerTabProps> = ({
  onNavigateToChat,
  onNavigateToBreathing,
}) => {
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [recordDate, setRecordDate] = useState(todayStr);
  const [selectedScore, setSelectedScore] = useState<MoodScore>(3);
  const [selectedTags, setSelectedTags] = useState<string[]>(['자소서작성']);
  const [memo, setMemo] = useState('');
  const [requestAiFeedback, setRequestAiFeedback] = useState(true);
  const [customTagInput, setCustomTagInput] = useState('');

  // Selected date detail in month view
  const [activeDateModalRecord, setActiveDateModalRecord] = useState<MoodRecord | null>(null);

  // Fetch records from backend
  useEffect(() => {
    setIsLoading(true);
    api
      .getMoodRecords()
      .then((data) => {
        if (data && data.length > 0) {
          setRecords(data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Check if today already has a record
  const existingTodayRecord = useMemo(() => {
    return records.find((r) => r.date === recordDate);
  }, [records, recordDate]);

  // If existing record found when changing date, fill form
  useEffect(() => {
    if (existingTodayRecord) {
      setSelectedScore(existingTodayRecord.score);
      setSelectedTags(existingTodayRecord.tags);
      setMemo(existingTodayRecord.memo);
    }
  }, [recordDate, existingTodayRecord]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const trimmed = customTagInput.trim().replace(/^#/, '');
      if (!selectedTags.includes(trimmed)) {
        setSelectedTags([...selectedTags, trimmed]);
      }
      setCustomTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const moodMeta = MOOD_LEVELS.find((m) => m.score === selectedScore) || MOOD_LEVELS[2];

    try {
      const saved = await api.saveMoodRecord({
        date: recordDate,
        score: selectedScore,
        scoreLabel: moodMeta.label,
        emoji: moodMeta.emoji,
        tags: selectedTags,
        memo,
        requestAiFeedback,
      });

      // Update state
      setRecords((prev) => {
        const filtered = prev.filter((r) => r.date !== recordDate);
        return [saved, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
      });

      alert(
        existingTodayRecord
          ? `${recordDate}의 감정 기록이 수정되었습니다.`
          : `${recordDate}의 감정 기록이 성공적으로 저장되었습니다!`
      );
    } catch (err) {
      console.error(err);
      alert('기록 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('이 날의 감정 기록을 삭제하시겠습니까?')) return;

    try {
      await api.deleteMoodRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (activeDateModalRecord?.id === id) {
        setActiveDateModalRecord(null);
      }
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // Weekly Trend calculation (last 7 days)
  const weeklyDays = useMemo(() => {
    const days: { dateStr: string; dayLabel: string; record?: MoodRecord }[] = [];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = `${d.getMonth() + 1}/${d.getDate()} (${dayNames[d.getDay()]})`;
      const record = records.find((r) => r.date === dateStr);
      days.push({ dateStr, dayLabel, record });
    }
    return days;
  }, [records]);

  const weeklyAverage = useMemo(() => {
    const scored = weeklyDays.filter((d) => d.record);
    if (scored.length === 0) return 0;
    const sum = scored.reduce((acc, curr) => acc + (curr.record?.score || 0), 0);
    return (sum / scored.length).toFixed(1);
  }, [weeklyDays]);

  // Monthly Heatmap (last 28~31 days)
  const monthlyDays = useMemo(() => {
    const days: { dateStr: string; dayNum: number; record?: MoodRecord }[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const record = records.find((r) => r.date === dateStr);
      days.push({ dateStr, dayNum: d.getDate(), record });
    }
    return days;
  }, [records]);

  const monthlyAverage = useMemo(() => {
    const scored = monthlyDays.filter((d) => d.record);
    if (scored.length === 0) return 0;
    const sum = scored.reduce((acc, curr) => acc + (curr.record?.score || 0), 0);
    return (sum / scored.length).toFixed(1);
  }, [monthlyDays]);

  // Most frequent tags in recent records
  const topTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    records.slice(0, 14).forEach((r) => {
      r.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [records]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-indigo-500/10 p-6 border border-teal-200/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-teal-600 text-white shadow-md">
            <Sun className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">취준 감정 무드트래커</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                마음 날씨 다이어리
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              매일의 감정과 취준 이벤트를 1~5점 척도로 기록하고, 한 주와 한 달간의 마음 기상도를 확인하세요.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'week'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            주간 추이 (7일)
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'month'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            월간 뷰 (28일)
          </button>
        </div>
      </div>

      {/* Low Mood Emergency Care Alert */}
      {selectedScore <= 2 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CloudRain className="h-5 w-5 text-rose-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">오늘 많이 힘들고 지치셨군요.</span>
              <span className="text-rose-700 ml-1">
                혼자 끙끙 앓지 마시고 전문 상담사와 이야기를 나누거나 가볍게 숨을 고르고 쉬어가세요.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToChat && (
              <button
                onClick={() => onNavigateToChat('empathy')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition flex items-center gap-1"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>공감 상담사 민서와 대화</span>
              </button>
            )}
            {onNavigateToBreathing && (
              <button
                onClick={onNavigateToBreathing}
                className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition flex items-center gap-1"
              >
                <Wind className="h-3.5 w-3.5" />
                <span>4-7-8 호흡하기</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Left (Daily Input Form) / Right (Visual Trend Graph) */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Mood Log Input Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-600" />
              <span>오늘의 마음 기록하기</span>
            </h3>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 font-semibold"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1~5 Mood Scale Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                1단계: 오늘의 감정 점수를 골라주세요 (1~5점)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {MOOD_LEVELS.map((lvl) => {
                  const isSelected = selectedScore === lvl.score;
                  return (
                    <button
                      type="button"
                      key={lvl.score}
                      onClick={() => setSelectedScore(lvl.score)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? `${lvl.bgColor} ${lvl.borderColor} ring-2 ring-teal-500 shadow-md scale-105`
                          : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">{lvl.emoji}</div>
                      <div className="text-xs font-bold text-slate-800">{lvl.score}점</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {lvl.label.split('/')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Mood Description */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  <strong>선택된 상태:</strong>{' '}
                  {MOOD_LEVELS.find((m) => m.score === selectedScore)?.label}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {MOOD_LEVELS.find((m) => m.score === selectedScore)?.desc}
                </span>
              </div>
            </div>

            {/* Tags Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                2단계: 오늘 마주한 주요 상황/키워드 (선택)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {QUICK_TAGS.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs transition ${
                        isChecked
                          ? 'bg-teal-600 text-white font-semibold shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/50'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>

              {/* Custom Tag Input */}
              <div className="mt-2 flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="태그 직접 입력 후 Enter (예: 첫출근, 포트폴리오)"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Memo Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                3단계: 오늘 하루를 돌아보는 짧은 일기 메모
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="오늘 어떤 일이 있었고 어떤 생각이 스쳐갔나요? 나를 위한 솔직한 한 줄을 남겨주세요."
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 p-3 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 leading-relaxed"
              />
            </div>

            {/* AI Counselor Feedback Option */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-xs">
              <input
                type="checkbox"
                id="aiFeedbackCheckbox"
                checked={requestAiFeedback}
                onChange={(e) => setRequestAiFeedback(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <label
                htmlFor="aiFeedbackCheckbox"
                className="text-teal-950 font-medium cursor-pointer"
              >
                <strong>상담사의 따뜻한 하루 피드백 받기</strong>
                <span className="block text-[11px] text-teal-700">
                  기록 저장 시 Gemini AI가 내 마음을 토닥여주는 코멘트를 달아줍니다.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 shadow-md transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>기록 저장 및 상담 코멘트 생성 중...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-teal-300" />
                  <span>
                    {existingTodayRecord ? '오늘의 감정 기록 수정하기' : '오늘의 감정 저장하기'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Visual Mood Trend & Analytics (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Metrics Header */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                {viewMode === 'week' ? '최근 7일 평균 점수' : '최근 28일 평균 점수'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-teal-600">
                  {viewMode === 'week' ? weeklyAverage : monthlyAverage}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 5.0점</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                누적 기록 일수
              </span>
              <div className="text-2xl font-black text-slate-900">
                {records.length} <span className="text-xs text-slate-400 font-medium">일차</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                가장 잦은 고민 키워드
              </span>
              <div className="text-xs font-bold text-indigo-700 truncate">
                {topTags.length > 0 ? `#${topTags[0][0]}` : '기록 없음'}
              </div>
            </div>
          </div>

          {/* WEEKLY TREND VIEW */}
          {viewMode === 'week' && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-teal-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    한 주간의 감정 흐름 (최근 7일)
                  </h4>
                </div>
                <span className="text-xs text-slate-400">1점(지침) ~ 5점(상쾌)</span>
              </div>

              {/* Weekly Vertical Bar Chart */}
              <div className="grid grid-cols-7 gap-2 pt-6 pb-2 items-end min-h-[190px]">
                {weeklyDays.map((item, idx) => {
                  const score = item.record?.score || 0;
                  const heightPercent = score > 0 ? (score / 5) * 100 : 8;
                  const moodMeta = MOOD_LEVELS.find((m) => m.score === score);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (item.record) setActiveDateModalRecord(item.record);
                      }}
                      className={`flex flex-col items-center justify-end group cursor-pointer ${
                        item.record ? '' : 'opacity-40'
                      }`}
                    >
                      {/* Emoji & Score Popover */}
                      <div className="text-sm mb-1.5 transition-transform group-hover:scale-125">
                        {item.record ? item.record.emoji : '⚪'}
                      </div>

                      {/* Bar Fill */}
                      <div className="w-full max-w-[28px] bg-slate-100 rounded-t-xl overflow-hidden h-32 flex items-end">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-500 ${
                            score === 5
                              ? 'bg-gradient-to-t from-indigo-500 to-sky-400'
                              : score === 4
                              ? 'bg-gradient-to-t from-teal-500 to-emerald-400'
                              : score === 3
                              ? 'bg-gradient-to-t from-slate-400 to-slate-300'
                              : score === 2
                              ? 'bg-gradient-to-t from-amber-500 to-orange-400'
                              : score === 1
                              ? 'bg-gradient-to-t from-rose-600 to-pink-500'
                              : 'bg-slate-200'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* Day Label */}
                      <div className="text-[11px] font-bold text-slate-700 mt-2 text-center whitespace-nowrap">
                        {item.dayLabel.split(' ')[1] || item.dayLabel}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.dayLabel.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Weekly Mood Insight Callout */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>주간 멘탈 코칭:</strong>{' '}
                  {Number(weeklyAverage) >= 3.5
                    ? '이번 주는 전반적으로 안정적인 회복 흐름을 보이고 있어요! 긍정적인 에너지를 유지하되 무리하지 마세요.'
                    : Number(weeklyAverage) >= 2.5
                    ? '취준의 긴장감 속에서도 중심을 잘 지켜내고 계십니다. 일과 후 작은 성취를 스스로 칭찬해 주세요.'
                    : '최근 며칠간 심리적 탈진과 불안이 집중되었습니다. 이번 주말에는 자소서를 잠시 덮고 온전한 쉼을 가져보세요.'}
                </div>
              </div>
            </div>
          )}

          {/* MONTHLY CALENDAR VIEW */}
          {viewMode === 'month' && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    한 달간의 마음 달력 (최근 28일)
                  </h4>
                </div>
                <span className="text-xs text-slate-400">날짜를 클릭하면 상세 메모 확인</span>
              </div>

              {/* 4x7 Days Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 pt-2">
                {monthlyDays.map((item, idx) => {
                  const record = item.record;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (record) setActiveDateModalRecord(record);
                        else {
                          setRecordDate(item.dateStr);
                        }
                      }}
                      className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center min-h-[64px] ${
                        record
                          ? record.score >= 4
                            ? 'bg-teal-50/70 border-teal-200 hover:bg-teal-100'
                            : record.score === 3
                            ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            : 'bg-rose-50/70 border-rose-200 hover:bg-rose-100'
                          : 'bg-slate-50/40 border-slate-100 hover:bg-slate-100/60 opacity-60'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold mb-0.5">
                        {item.dayNum}일
                      </span>
                      {record ? (
                        <div className="text-lg leading-none">{record.emoji}</div>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                      {record && (
                        <span className="text-[9px] font-bold text-slate-600 mt-1">
                          {record.score}점
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend Bar */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> 1~2점 (힘듦/불안)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> 3점 (보통)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> 4~5점 (안정/상쾌)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Mood Diary Timeline List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>나의 감정 다이어리 기록 ({records.length})</span>
          </h3>
          <span className="text-xs text-slate-500">날짜별 감정과 상담사 코멘트</span>
        </div>

        {records.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-slate-300 text-slate-400 text-sm">
            아직 저장된 감정 기록이 없습니다. 오늘 하루의 기분을 처음으로 남겨보세요!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {records.map((rec) => {
              const moodMeta = MOOD_LEVELS.find((m) => m.score === rec.score) || MOOD_LEVELS[2];
              return (
                <div
                  key={rec.id}
                  className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="text-2xl">{rec.emoji}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{rec.date}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${moodMeta.bgColor} ${moodMeta.color} border ${moodMeta.borderColor}`}
                          >
                            {rec.score}점 • {rec.scoreLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteRecord(rec.id, e)}
                      className="text-slate-300 hover:text-rose-600 p-1"
                      title="기록 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Tags */}
                  {rec.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rec.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Memo */}
                  {rec.memo && (
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                      "{rec.memo}"
                    </p>
                  )}

                  {/* Counselor AI Feedback */}
                  {rec.aiFeedback && (
                    <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950 space-y-1">
                      <div className="font-bold text-[11px] text-teal-800 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-teal-600" />
                        <span>상담사의 따뜻한 한마디</span>
                      </div>
                      <p className="leading-relaxed italic">{rec.aiFeedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Date Popover Modal */}
      {activeDateModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeDateModalRecord.emoji}</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {activeDateModalRecord.date}
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">
                    {activeDateModalRecord.score}점 • {activeDateModalRecord.scoreLabel}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveDateModalRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                닫기
              </button>
            </div>

            {activeDateModalRecord.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeDateModalRecord.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {activeDateModalRecord.memo || '작성된 일기 메모가 없습니다.'}
            </div>

            {activeDateModalRecord.aiFeedback && (
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-1">
                <span className="font-bold text-teal-800 block">🌱 상담사 코멘트</span>
                <p className="italic leading-relaxed">{activeDateModalRecord.aiFeedback}</p>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={(e) => handleDeleteRecord(activeDateModalRecord.id, e)}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                기록 삭제하기
              </button>
              <button
                onClick={() => setActiveDateModalRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
