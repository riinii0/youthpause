import React, { useState, useEffect } from 'react';
import { ambientSound } from '../utils/audioGenerator';
import {
  Wind,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CloudRain,
  Waves,
  Flame,
  Music,
  HeartPulse,
} from 'lucide-react';

export const BreathingCalmTab: React.FC = () => {
  // Breathing state: 4s inhale, 7s hold, 8s exhale
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  // Sound state
  const [currentSound, setCurrentSound] = useState<'rain' | 'waves' | 'campfire' | 'zen' | null>(null);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === 'inhale') {
              setPhase('hold');
              return 7;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return 8;
            } else {
              setPhase('inhale');
              setCycleCount((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, phase]);

  const toggleSound = (type: 'rain' | 'waves' | 'campfire' | 'zen') => {
    if (currentSound === type) {
      ambientSound.stop();
      setCurrentSound(null);
    } else {
      ambientSound.play(type, volume);
      setCurrentSound(type);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientSound.setVolume(newVol);
  };

  const resetBreathing = () => {
    setIsBreathingActive(false);
    setPhase('inhale');
    setTimeLeft(4);
    setCycleCount(0);
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return {
          title: '코로 천천히 들이마시기',
          sub: '맑은 공기가 온몸을 가득 채우도록 4초간 들이쉽니다',
          circleScale: 'scale-125',
          bgGlow: 'from-teal-400 to-emerald-500',
        };
      case 'hold':
        return {
          title: '숨을 가만히 멈추기',
          sub: '몸의 산소가 편안히 퍼지도록 7초간 머뭅니다',
          circleScale: 'scale-125',
          bgGlow: 'from-indigo-400 to-blue-500',
        };
      case 'exhale':
        return {
          title: '입으로 천천히 내쉬기',
          sub: '어깨의 긴장과 불안을 모두 뱉어내듯 8초간 길게 내쉽니다',
          circleScale: 'scale-75',
          bgGlow: 'from-amber-400 to-rose-400',
        };
    }
  };

  const info = getPhaseInstruction();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 4-7-8 Breathing Guide Card */}
      <div className="rounded-2xl bg-white p-6 sm:p-10 shadow-md border border-slate-200 text-center space-y-6">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 inline-block mb-2">
            자율신경계 안정화 기법
          </span>
          <h2 className="text-2xl font-bold text-slate-900">4-7-8 긴장 완화 호흡</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            면접 직전, 탈락 메일을 확인한 직후, 잠들기 전 불안으로 심박수가 높아졌을 때 뇌와 부교감신경을 안정시키는 의학적 호흡법입니다.
          </p>
        </div>

        {/* Breathing Animation Circle */}
        <div className="relative h-64 flex items-center justify-center my-6">
          {/* Outer Pulse Rings */}
          <div
            className={`absolute w-56 h-56 rounded-full bg-slate-100 transition-all duration-1000 ${
              isBreathingActive ? info.circleScale : 'scale-100'
            }`}
          />
          <div
            className={`absolute w-44 h-44 rounded-full bg-gradient-to-tr ${
              isBreathingActive ? info.bgGlow : 'from-slate-200 to-slate-300'
            } opacity-20 blur-xl transition-all duration-1000 ${
              isBreathingActive ? info.circleScale : 'scale-100'
            }`}
          />

          {/* Central Counter Orb */}
          <div
            className={`relative z-10 w-40 h-40 rounded-full bg-gradient-to-tr ${
              isBreathingActive ? info.bgGlow : 'from-slate-700 to-slate-900'
            } text-white flex flex-col items-center justify-center shadow-xl transition-all duration-1000 ${
              isBreathingActive ? info.circleScale : 'scale-100'
            }`}
          >
            <span className="text-4xl font-extrabold tracking-tight">
              {isBreathingActive ? timeLeft : '준비'}
            </span>
            <span className="text-[11px] font-semibold opacity-90 mt-1 uppercase tracking-wider">
              {isBreathingActive
                ? phase === 'inhale'
                  ? '들이마시기'
                  : phase === 'hold'
                  ? '멈춤'
                  : '내쉬기'
                : '시작 대기'}
            </span>
          </div>
        </div>

        {/* Instruction Guidance */}
        <div className="min-h-[50px]">
          <h3 className="font-bold text-slate-900 text-base">{isBreathingActive ? info.title : '버튼을 눌러 호흡을 시작하세요'}</h3>
          <p className="text-xs text-slate-500 mt-1">{isBreathingActive ? info.sub : '마음의 스위치를 끄고 편안한 자세로 앉아주세요'}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsBreathingActive(!isBreathingActive)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition ${
              isBreathingActive
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isBreathingActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isBreathingActive ? '잠시 멈춤' : '호흡 가이드 시작'}</span>
          </button>

          <button
            onClick={resetBreathing}
            className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            title="초기화"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <div className="text-xs text-slate-500 ml-2 font-medium">
            완료한 호흡 사이클: <strong className="text-teal-600 font-bold">{cycleCount}회</strong>
          </div>
        </div>
      </div>

      {/* Ambient Sound Box */}
      <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-indigo-600" />
              <span>마음 안정 앰비언스 사운드 (ASMR)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              별도의 스트리밍 끊김 없이 웹 브라우저 자체 오디오로 생성되는 평온한 백색소음입니다.
            </p>
          </div>

          {currentSound && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Volume2 className="h-4 w-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-24 accent-indigo-600"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { id: 'rain', label: '차분한 빗소리', desc: '창가를 두드리는 빗소리', icon: CloudRain },
            { id: 'waves', label: '잔잔한 파도', desc: '해변에 밀려오는 물결', icon: Waves },
            { id: 'campfire', label: '따뜻한 모닥불', desc: '타닥타닥 장작 타는 소리', icon: Flame },
            { id: 'zen', label: '평온한 힐링 톤', desc: '216Hz 마음 이완 공명', icon: Music },
          ].map((item) => {
            const Icon = item.icon;
            const isPlaying = currentSound === item.id;
            return (
              <button
                key={item.id}
                onClick={() => toggleSound(item.id as any)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isPlaying
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-sm ring-1 ring-indigo-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${isPlaying ? 'text-indigo-600' : 'text-slate-500'}`} />
                  {isPlaying ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  ) : null}
                </div>
                <div className="font-bold text-xs">{item.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
