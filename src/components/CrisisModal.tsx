import React from 'react';
import { Phone, HeartHandshake, X, ExternalLink, ShieldAlert } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const hotlines = [
    {
      name: '24시간 자살예방 상담전화',
      number: '109',
      desc: '24시간 연중무휴 전문 위기상담 (통화료 무료)',
      highlight: true,
    },
    {
      name: '정신건강 위기상담전화',
      number: '1577-0199',
      desc: '보건복지부 주관 24시간 정신건강 전문요원 1:1 상담',
      highlight: false,
    },
    {
      name: '한국생명의전화',
      number: '1588-9191',
      desc: '언제나 곁에서 경청하는 24시간 위기 전화상담',
      highlight: false,
    },
    {
      name: '청년마음건강지원사업 (바우처)',
      number: '복지로 (온라인 신청)',
      desc: '만 19~34세 청년 대상 1:1 전문 심리상담 3개월 전액/지원 지원',
      highlight: false,
    },
    {
      name: '대학 학생생활상담센터',
      number: '소속 대학교 포털 검색',
      desc: '재학생 및 졸업예정자를 위한 교내 무료 심리검사 & 1:1 상담',
      highlight: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 text-rose-600 mb-3">
          <div className="rounded-full bg-rose-100 p-2.5">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">긴급 위기상담 안내</h3>
            <p className="text-xs text-rose-600 font-medium">혼자 짊어지지 마세요. 지금 도움을 요청할 수 있습니다.</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          취업 압박, 극심한 우울, 번아웃으로 당장 마음이 감당하기 힘들다면 언제든지 아래 무료 전문기관에 연락하세요. 
          따뜻한 전문가가 24시간 당신의 이야기를 기다리고 있습니다.
        </p>

        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {hotlines.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3.5 border transition ${
                item.highlight
                  ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900 text-sm">{item.name}</span>
                <span
                  className={`inline-flex items-center gap-1 font-bold text-sm px-2.5 py-1 rounded-lg ${
                    item.highlight ? 'bg-rose-600 text-white' : 'bg-white text-slate-800 border border-slate-300'
                  }`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  {item.number}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">모든 상담은 비밀이 보장됩니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
