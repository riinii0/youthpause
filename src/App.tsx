/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CounselorId, UserProfile } from './types';
import { Navbar, ActiveTab } from './components/Navbar';
import { ChatTab } from './components/ChatTab';
import { CbtWorksheetTab } from './components/CbtWorksheetTab';
import { AssessmentTab } from './components/AssessmentTab';
import { BreathingCalmTab } from './components/BreathingCalmTab';
import { CommunityCheerTab } from './components/CommunityCheerTab';
import { CommunityBoardTab } from './components/CommunityBoardTab';
import { MoodTrackerTab } from './components/MoodTrackerTab';
import { CrisisModal } from './components/CrisisModal';
import { ProfileModal } from './components/ProfileModal';
import { ShieldAlert, Heart, ExternalLink } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  name: '취준 청춘',
  status: '4학년 2학기 졸업예정자',
  major: '상경 / 경영 / 경제',
  targetCareer: '마케팅 & 사업기획',
  primaryConcern: '반복되는 서류/인적성 불합격으로 인한 자존감 하락',
  energyLevel: '불안 (40%)',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [currentCounselorId, setCurrentCounselorId] = useState<CounselorId>('empathy');
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_graduation_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_PROFILE;
  });

  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('user_graduation_profile', JSON.stringify(newProfile));
  };

  const handleStartCounselingWith = (counselorId: CounselorId) => {
    setCurrentCounselorId(counselorId);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCrisis={() => setIsCrisisModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        userProfile={userProfile}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'chat' && (
          <ChatTab
            currentCounselorId={currentCounselorId}
            onSelectCounselor={setCurrentCounselorId}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'mood' && (
          <MoodTrackerTab
            onNavigateToChat={handleStartCounselingWith}
            onNavigateToBreathing={() => setActiveTab('calm')}
          />
        )}

        {activeTab === 'board' && <CommunityBoardTab />}

        {activeTab === 'cbt' && <CbtWorksheetTab />}

        {activeTab === 'assess' && (
          <AssessmentTab onStartCounselingWith={handleStartCounselingWith} />
        )}

        {activeTab === 'calm' && <BreathingCalmTab />}

        {activeTab === 'cheer' && <CommunityCheerTab />}
      </main>

      {/* Comforting Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            <span className="font-medium text-slate-700">
              청춘쉼표는 대학 학부 졸업예정자들의 건강한 마음과 내일을 응원합니다.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCrisisModalOpen(true)}
              className="text-rose-600 hover:underline font-semibold flex items-center gap-1"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>위기상담 핫라인 (109 / 1577-0199)</span>
            </button>
            <span className="text-slate-300">|</span>
            <span>데이터는 브라우저 로컬에 안전하게 보관됩니다.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
