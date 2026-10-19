import React from 'react';
import { UserProfile } from '../types';
import {
  MessageSquareHeart,
  Brain,
  FileCheck2,
  Wind,
  HeartHandshake,
  ShieldAlert,
  User,
  Sparkles,
  MessageSquare,
  Sun,
} from 'lucide-react';

export type ActiveTab = 'chat' | 'mood' | 'board' | 'cbt' | 'assess' | 'calm' | 'cheer';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenCrisis: () => void;
  onOpenProfile: () => void;
  userProfile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenCrisis,
  onOpenProfile,
  userProfile,
}) => {
  const tabs = [
    { id: 'chat' as ActiveTab, label: '1:1 심리상담', icon: MessageSquareHeart },
    { id: 'mood' as ActiveTab, label: '무드트래커', icon: Sun },
    { id: 'board' as ActiveTab, label: '익명 고민광장', icon: MessageSquare },
    { id: 'cbt' as ActiveTab, label: 'CBT 생각정리', icon: Brain },
    { id: 'assess' as ActiveTab, label: '멘탈 자가진단', icon: FileCheck2 },
    { id: 'calm' as ActiveTab, label: '호흡 & 마음쉼터', icon: Wind },
    { id: 'cheer' as ActiveTab, label: '공감 우체통', icon: HeartHandshake },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onTabChange('chat')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">청춘쉼표</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hidden sm:inline">
                  졸업예정자 멘탈케어
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5 hidden sm:block">
                취업과 진로 앞, 잠시 숨을 고르는 1:1 심리상담 센터
              </p>
            </div>
          </div>

          {/* Quick Utility Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCrisis}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
              title="24시간 위기상담 안내"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
              <span className="hidden sm:inline">긴급위기전화 (109)</span>
              <span className="sm:hidden">109</span>
            </button>

            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition border border-slate-200"
              title="내 프로필 및 고민 설정"
            >
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden md:inline font-medium text-slate-600">
                {userProfile.status.split(' ')[0]}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white text-slate-700 font-bold border border-slate-200">
                {userProfile.energyLevel.split(' ')[0]}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-rose-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
