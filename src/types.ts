export type CounselorId = 'empathy' | 'cbt' | 'interview' | 'career';

export interface Counselor {
  id: CounselorId;
  name: string;
  role: string;
  subtitle: string;
  description: string;
  avatarBg: string;
  avatarEmoji: string;
  badgeColor: string;
  introMessage: string;
  suggestedPrompts: string[];
  specialtyTags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  counselorId?: CounselorId;
}

export interface ChatSession {
  id: string;
  title: string;
  counselorId: CounselorId;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface UserProfile {
  name: string;
  status: string; // e.g., '4학년 2학기 졸업예정', '졸업유예생', '취업준비 1년차'
  major: string; // e.g., '인문/사회', '공학/IT', '자연/이학', '경영/경제', '예체능'
  targetCareer: string; // e.g., 'IT 개발/기획', '마케팅/영업', '공기업/금융', '디자인', '아직 탐색 중'
  primaryConcern: string; // e.g., '반복되는 서류 탈락', '면접 공포증', '동기들과의 비교', '진로 미정'
  energyLevel: '지침 (20%)' | '불안 (40%)' | '보통 (60%)' | '회복 중 (80%)';
}

export interface CbtCard {
  id: string;
  createdAt: number;
  situation: string;
  negativeThought: string;
  distortionType: string;
  distortionExplanation: string;
  objectiveEvidence: string;
  reframedThought: string;
  microAction: string;
  warmEncouragement: string;
}

export interface AssessmentQuestion {
  id: number;
  text: string;
  options: { label: string; score: number }[];
}

export interface AssessmentType {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentReport {
  testType: string;
  score: number;
  maxScore: number;
  severityLevel: string;
  summaryTitle: string;
  emotionalStateDescription: string;
  recommendedActions: string[];
  recommendedCounselor: CounselorId;
  recommendedCounselorReason: string;
  date: string;
}

export interface CheeringNote {
  id: string;
  authorType: '동기' | '1년차 선배' | '3년차 선배' | '익명의 친구' | '상담사';
  content: string;
  createdAt: string;
  likes: number;
  category: '취준위로' | '자존감' | '면접응원' | '진로나침반';
}

export type CommunityCategory =
  | '전체'
  | '서류/면접 고민'
  | '동기 비교/자존감'
  | '진로/적성 방황'
  | '번아웃/무기력'
  | '가족/현실적 부담'
  | '소소한 취뽀/응원';

export interface CommunityComment {
  id: string;
  postId: string;
  authorNickname: string;
  authorRole: '작성자' | '동기' | '선배' | '상담사';
  content: string;
  createdAt: number;
  likes: number;
  isAiCounselor?: boolean;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorNickname: string;
  category: Exclude<CommunityCategory, '전체'>;
  createdAt: number;
  likes: number;
  views: number;
  comments: CommunityComment[];
  emotionTag: string; // e.g., '속상해요', '불안해요', '답답해요', '응원 필요해요', '극복했어요'
}

export type MoodScore = 1 | 2 | 3 | 4 | 5;

export interface MoodRecord {
  id: string;
  date: string; // format: 'YYYY-MM-DD'
  score: MoodScore; // 1~5
  scoreLabel: string;
  emoji: string;
  tags: string[];
  memo: string;
  createdAt: number;
  aiFeedback?: string;
}


