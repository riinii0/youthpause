import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, X, Check, Sparkles } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">내 상황 & 고민 프로필</h3>
            <p className="text-xs text-slate-500">
              상담사가 당신의 상황을 깊이 이해하고 맞춤형 대화를 이어갑니다.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              현재 학적 및 취준 단계
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="4학년 2학기 졸업예정자">4학년 2학기 졸업예정자 (첫 공채 도전)</option>
              <option value="4학년 1학기 재학생">4학년 1학기 재학생 (진로 탐색 중)</option>
              <option value="졸업유예생">졸업유예생 (스펙 보완 및 인턴 준비 중)</option>
              <option value="학부 졸업 후 취업준비생 (취준 1년차)">학부 졸업 후 취업준비생 (취준 1년차)</option>
              <option value="학부 졸업 후 장기 취업준비생">학부 졸업 후 장기 취업준비생</option>
              <option value="취업 후 이직/진로 재고민 중">취업 후 이직 / 진로 재고민 중</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">전공 계열</label>
              <select
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="인문 / 어문 / 사회과학">인문 / 어문 / 사회과학</option>
                <option value="공학 / IT / 컴퓨터">공학 / IT / 컴퓨터</option>
                <option value="상경 / 경영 / 경제">상경 / 경영 / 경제</option>
                <option value="자연과학 / 바이오 / 이학">자연과학 / 바이오 / 이학</option>
                <option value="예체능 / 디자인">예체능 / 디자인</option>
                <option value="사범 / 교육">사범 / 교육</option>
                <option value="보건 / 의약학">보건 / 의약학</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">희망 분야/직무</label>
              <input
                type="text"
                placeholder="예: IT 개발, 마케팅, 공기업 등"
                value={formData.targetCareer}
                onChange={(e) => setFormData({ ...formData, targetCareer: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              지금 나를 가장 힘들게 하는 고민
            </label>
            <select
              value={formData.primaryConcern}
              onChange={(e) => setFormData({ ...formData, primaryConcern: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="반복되는 서류/인적성 불합격으로 인한 자존감 하락">
                반복되는 서류/인적성 불합격으로 인한 자존감 하락
              </option>
              <option value="먼저 취업한 동기들과의 비교 스트레스 & 소외감">
                먼저 취업한 동기들과의 비교 스트레스 & 소외감
              </option>
              <option value="면접만 생각하면 심장이 뛰고 머리가 하얘지는 불안">
                면접만 생각하면 심장이 뛰고 머리가 하얘지는 불안
              </option>
              <option value="내가 진짜 무엇을 하고 싶은지 모르는 진로 혼란">
                내가 진짜 무엇을 하고 싶은지 모르는 진로 혼란
              </option>
              <option value="부모님의 기대와 경제적 부담감으로 인한 죄책감">
                부모님의 기대와 경제적 부담감으로 인한 죄책감
              </option>
              <option value="지속된 취준으로 인한 번아웃과 무기력증">
                지속된 취준으로 인한 번아웃과 무기력증
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              현재 마음 에너지 상태
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                ['지침 (20%)', '불안 (40%)', '보통 (60%)', '회복 중 (80%)'] as const
              ).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setFormData({ ...formData, energyLevel: lvl })}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                    formData.energyLevel === lvl
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              설정 저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
