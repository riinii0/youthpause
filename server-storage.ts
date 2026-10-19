import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface StoredComment {
  id: string;
  postId: string;
  authorNickname: string;
  authorRole: '작성자' | '동기' | '선배' | '상담사';
  content: string;
  createdAt: number;
  likes: number;
  isAiCounselor?: boolean;
}

export interface StoredPost {
  id: string;
  title: string;
  content: string;
  authorNickname: string;
  category: string;
  createdAt: number;
  likes: number;
  views: number;
  comments: StoredComment[];
  emotionTag: string;
}

export interface StoredCheeringNote {
  id: string;
  authorType: '동기' | '1년차 선배' | '3년차 선배' | '익명의 친구' | '상담사';
  content: string;
  createdAt: string;
  likes: number;
  category: '취준위로' | '자존감' | '면접응원' | '진로나침반';
}

export interface StoredCbtCard {
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

export interface StoredMoodRecord {
  id: string;
  date: string; // 'YYYY-MM-DD'
  score: 1 | 2 | 3 | 4 | 5;
  scoreLabel: string;
  emoji: string;
  tags: string[];
  memo: string;
  createdAt: number;
  aiFeedback?: string;
}

const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const CHEERING_FILE = path.join(DATA_DIR, 'cheering-notes.json');
const CBT_FILE = path.join(DATA_DIR, 'cbt-cards.json');
const MOOD_FILE = path.join(DATA_DIR, 'mood-records.json');

// Initial seed data
const SEED_POSTS: StoredPost[] = [
  {
    id: 'post-1',
    title: '오늘 최종 면접에서 탈락 문자를 받고 지하철에서 펑펑 울었습니다',
    content: `3차 최종 임원면접까지 가서 정말 간절하게 준비했는데, 오늘 불합격 통보를 받았습니다.\n대학 4년 동안 방학 한 번 제대로 안 쉬고 학점 관리하고 인턴하고 자격증 땄는데... 왜 마지막 문턱에서 항상 무너지는 걸까요.\n집에 들어가면 부모님이 기대하고 계실 텐데 어떤 표정으로 문을 열어야 할지 모르겠어서 지금 2호선을 몇 바퀴째 돌고 있어요.`,
    authorNickname: '2호선순환선',
    category: '서류/면접 고민',
    emotionTag: '속상해요',
    createdAt: Date.now() - 3600000 * 2,
    likes: 38,
    views: 184,
    comments: [
      {
        id: 'c-1-1',
        postId: 'post-1',
        authorNickname: '취업 2년차 선배',
        authorRole: '선배',
        content:
          '저도 최종에서 3번 연속 떨어지고 세상이 무너진 줄 알았어요. 근데 최종까지 가셨다는 건 실력과 역량은 이미 100% 검증되었다는 뜻이에요! 마지막엔 그냥 그 해 부서 티오나 운의 영역이 커요. 오늘은 집 근처 맛있는 거 하나 사서 스스로를 꼭 안아주세요. 절대로 자책하지 마세요.',
        createdAt: Date.now() - 3600000 * 1.5,
        likes: 24,
      },
      {
        id: 'c-1-2',
        postId: 'post-1',
        authorNickname: '상담사 민서',
        authorRole: '상담사',
        content:
          '최종 면접까지 올라가기 위해 견뎌온 수많은 밤들과 긴장감, 얼마나 애쓰셨을지 마음이 너무 아파요. 지하철에서 흘린 눈물은 실패의 흔적이 아니라 당신이 삶에 그만큼 진심이었다는 증거입니다. 오늘만큼은 자책의 짐을 내려놓고 고생한 자신에게 따뜻한 쉼을 선물해 주세요.',
        createdAt: Date.now() - 3600000 * 1,
        likes: 31,
        isAiCounselor: true,
      },
      {
        id: 'c-1-3',
        postId: 'post-1',
        authorNickname: '같은 4학년 동기',
        authorRole: '동기',
        content:
          '글 읽고 저도 눈물이 핑 도네요... 우리 진짜 열심히 살았잖아요. 당신 잘못 하나도 없어요. 조금만 울고 털어내길 응원해요!',
        createdAt: Date.now() - 1800000,
        likes: 12,
      },
    ],
  },
  {
    id: 'post-2',
    title: '인스타 켜면 동기들 사원증 사진만 보여서 계정 비활성화했어요',
    content: `친한 동기 3명이 같은 주에 대기업 합격했다고 단톡방에 올렸어요.\n진심으로 축하해 주고 싶은데, 한편으론 속에서 시커먼 질투와 비참함이 올라오는 제 자신이 너무 쓰레기 같아서 괴롭습니다.\n나만 정체되어 있는 것 같고, 내년에 나 혼자 학교 도서관에 남아있을 생각 하니 숨이 턱 막혀요. 다들 동기들 취업 소식 어떻게 견디시나요?`,
    authorNickname: '밤하늘의별',
    category: '동기 비교/자존감',
    emotionTag: '불안해요',
    createdAt: Date.now() - 3600000 * 5,
    likes: 54,
    views: 310,
    comments: [
      {
        id: 'c-2-1',
        postId: 'post-2',
        authorNickname: '졸업유예 1년차',
        authorRole: '동기',
        content:
          '절대 쓰레기 아니에요! 당연히 질투 나고 속상한 게 정상적인 사람의 감정입니다. 계정 비활성화하신 건 정말 현명한 셀프 케어예요. 저도 인스타 지우고 나서 마음이 10배는 편해졌어요. 우리만의 속도로 걸어가요.',
        createdAt: Date.now() - 3600000 * 4,
        likes: 29,
      },
      {
        id: 'c-2-2',
        postId: 'post-2',
        authorNickname: '3년차 직장인',
        authorRole: '선배',
        content:
          '직장 생활 3년 해보니 먼저 들어갔다고 인생 끝까지 잘 풀리는 것도 아니고, 1~2년 늦게 들어왔다고 뒤처지는 것도 전혀 아니더라고요. 첫 직장은 마라톤의 1km 지점일 뿐이에요. 내 페이스만 지키면 됩니다.',
        createdAt: Date.now() - 3600000 * 3,
        likes: 38,
      },
    ],
  },
  {
    id: 'post-3',
    title: '4년 동안 전공 공부했는데, 정작 내가 뭘 하고 싶은지 모르겠어요',
    content: `인문대 졸업예정자입니다. 취업 원서를 쓰려고 채용 공고를 보는데, 어떤 직무도 가슴이 뛰지 않고 "내가 대체 뭘 잘하고 뭘 좋아하는지" 백지가 되어버려요.\n남들은 일찌감치 직무 정해서 자격증 따고 포폴 만들던데, 저는 그저 학점 채우기에 급급했던 것 같아 후회가 큽니다.\n진로 방향을 지금 다시 잡기엔 너무 늦은 걸까요?`,
    authorNickname: '길잃은나그네',
    category: '진로/적성 방황',
    emotionTag: '답답해요',
    createdAt: Date.now() - 3600000 * 12,
    likes: 42,
    views: 240,
    comments: [
      {
        id: 'c-3-1',
        postId: 'post-3',
        authorNickname: '상담사 도윤',
        authorRole: '상담사',
        content:
          '"늦었다"는 생각은 우리 뇌가 만들어낸 인지적 왜곡 중 하나예요. 20대 초중반에 평생 할 일을 완벽히 정하는 사람은 극소수입니다. 지금의 혼란은 방황이 아니라 비로소 나 자신에게 "너는 무엇을 원하니?"라고 진지하게 묻기 시작한 귀한 전환점입니다. 작은 관심사부터 하나씩 경험해 보세요.',
        createdAt: Date.now() - 3600000 * 10,
        likes: 33,
        isAiCounselor: true,
      },
    ],
  },
];

const SEED_CHEERING: StoredCheeringNote[] = [
  {
    id: 'note-1',
    authorType: '3년차 선배',
    content: '취준할 때 40군데 탈락하고 매일 울면서 자소서를 썼어요. 그때는 내가 세상에서 제일 쓸모없는 줄 알았는데, 지금 돌아보니 그냥 나와 맞는 회사가 40번째 뒤에 있었을 뿐이더라고요. 여러분의 가치와 취업 통보는 아무 상관없어요. 숨 한번 크게 쉬고 걸어가세요.',
    createdAt: '2시간 전',
    likes: 142,
    category: '취준위로',
  },
  {
    id: 'note-2',
    authorType: '동기',
    content: '같은 4학년 2학기 졸업예정자예요! 다들 앞서가는 것 같아 혼자 방에서 불 끄고 운 적 많은데, 우리 모두 각자의 계절이 있는 거겠죠? 오늘 하루도 도서관이나 방에서 버텨낸 여러분, 진짜 대단해요.',
    createdAt: '3시간 전',
    likes: 89,
    category: '자존감',
  },
  {
    id: 'note-3',
    authorType: '1년차 선배',
    content: '면접 직전에 청심환 먹어도 손 덜덜 떨리던 사람 나야 나... 면접관도 그냥 월급 받고 일하는 똑같은 직장인이고 사람이에요! 나를 평가하는 재판관이 아니라, "나랑 같이 일할 후배인가?" 보러 온 삼촌, 이모라 생각하고 편하게 내 이야기하고 오세요.',
    createdAt: '어제',
    likes: 215,
    category: '면접응원',
  },
  {
    id: 'note-4',
    authorType: '상담사',
    content: '꽃은 저마다 피어나는 계절이 다릅니다. 봄에 피는 벚꽃도 아름답지만, 가을에 피는 국화도, 겨울에 피는 동백도 저마다의 고유한 향기가 있습니다. 조금 늦는다고 해서 당신의 꽃이 피지 않는 것은 아닙니다.',
    createdAt: '2일 전',
    likes: 304,
    category: '진로나침반',
  },
];

const SEED_CBT: StoredCbtCard[] = [
  {
    id: 'sample-1',
    createdAt: Date.now() - 86400000,
    situation: '상반기 공채 서류 5곳 연속 불합격 통보',
    negativeThought: '나는 아무런 경쟁력도 없는 무능한 사람이고, 평생 취업 못 할 거야.',
    distortionType: '파국화(Catastrophizing) & 낙인찍기(Labeling)',
    distortionExplanation:
      '연속된 탈락은 지원한 직무나 회사와의 핏(Fit), 채용 인원수 등 다양한 외부 변수가 작용한 결과입니다. 이를 단숨에 "평생 취업 불가"와 "무능한 사람"으로 비약하고 있습니다.',
    objectiveEvidence:
      '공채 경쟁률은 수십~수백 대 1에 달하며, 수많은 합격자도 평균 수십 번의 서류 탈락을 거칩니다. 대학 4년 동안 과제, 발표, 프로젝트를 완수한 객관적 경험들이 여전히 내 안에 존재합니다.',
    reframedThought:
      '지금의 탈락은 내가 쓸모없다는 증거가 아니라, 그 회사와 타이밍이 맞지 않았을 뿐이야. 피드백을 통해 보완하면 나를 필요로 하는 자리를 반드시 만날 수 있어.',
    microAction: '컴퓨터를 끄고 동네 산책 15분 하며 내가 좋아하는 따뜻한 음료 한 잔 마시기',
    warmEncouragement: '탈락 문자는 결코 당신의 인격이나 미래를 평가할 권리가 없습니다.',
  },
];

const getIsoDateString = (offsetDays: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

const SEED_MOODS: StoredMoodRecord[] = [
  {
    id: 'mood-seed-1',
    date: getIsoDateString(6),
    score: 2,
    scoreLabel: '불안/우울',
    emoji: '☁️',
    tags: ['서류탈락', '동기비교'],
    memo: '친구 취업 턱 소식 듣고 밤에 잠을 잘 못 잤다. 자존감이 많이 깎인 하루.',
    createdAt: Date.now() - 86400000 * 6,
    aiFeedback: '동기의 소식에 마음이 흔들리는 건 너무나 자연스러운 인간적인 감정이에요. 내 속도를 믿어주세요.',
  },
  {
    id: 'mood-seed-2',
    date: getIsoDateString(5),
    score: 3,
    scoreLabel: '보통/무난함',
    emoji: '⛅',
    tags: ['스터디', '도서관'],
    memo: '오전 스터디 진행하고 자소서 1편 수정함. 조금 차분해졌다.',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'mood-seed-3',
    date: getIsoDateString(4),
    score: 1,
    scoreLabel: '매우 힘듦/지침',
    emoji: '🌧️',
    tags: ['서류탈락', '번아웃'],
    memo: '또 서류 탈락 문자 받음. 온몸에 힘이 빠지고 침대에서 일어나기 힘들었다.',
    createdAt: Date.now() - 86400000 * 4,
    aiFeedback: '탈락은 지원자와 기업의 타이밍일 뿐, 당신의 능력이 부족해서가 아닙니다. 푹 쉬어주세요.',
  },
  {
    id: 'mood-seed-4',
    date: getIsoDateString(3),
    score: 3,
    scoreLabel: '보통/무난함',
    emoji: '⛅',
    tags: ['휴식/산책', '음악감상'],
    memo: '청춘쉼표에서 4-7-8 호흡하고 한강 산책 30분 다녀옴. 기분이 조금 환기됨.',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'mood-seed-5',
    date: getIsoDateString(2),
    score: 4,
    scoreLabel: '안정/회복 중',
    emoji: '🌤️',
    tags: ['면접준비', '동기부여'],
    memo: '서류 1곳 합격 연락 옴! 면접 준비 스크립트 작성 시작. 할 수 있다는 자신감이 조금 생겼다.',
    createdAt: Date.now() - 86400000 * 2,
    aiFeedback: '서류 합격 축하드려요! 당신의 노력이 닿았습니다. 면접장에서도 진솔한 나를 보여주세요.',
  },
  {
    id: 'mood-seed-6',
    date: getIsoDateString(1),
    score: 4,
    scoreLabel: '안정/회복 중',
    emoji: '🌤️',
    tags: ['면접준비', '운동'],
    memo: '모의 면접 연습 2회 완료. 긴장되지만 지안 코치 호흡법 떠올리며 마인드 컨트롤 중.',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'mood-seed-7',
    date: getIsoDateString(0),
    score: 4,
    scoreLabel: '안정/회복 중',
    emoji: '🌤️',
    tags: ['마음챙김', '희망'],
    memo: '오늘도 하루를 잘 버텨냈다. 내일 면접 침착하게 다녀오자.',
    createdAt: Date.now(),
  },
];

// Helper to safely read JSON
function readJsonFile<T>(filePath: string, defaultData: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
}

// Helper to safely write JSON
function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initialize seed data if not present
readJsonFile(POSTS_FILE, SEED_POSTS);
readJsonFile(CHEERING_FILE, SEED_CHEERING);
readJsonFile(CBT_FILE, SEED_CBT);
readJsonFile(MOOD_FILE, SEED_MOODS);

export const db = {
  // Posts
  getPosts(): StoredPost[] {
    return readJsonFile<StoredPost[]>(POSTS_FILE, SEED_POSTS);
  },

  getPostById(id: string): StoredPost | undefined {
    const posts = this.getPosts();
    return posts.find((p) => p.id === id);
  },

  savePost(post: StoredPost): StoredPost {
    const posts = this.getPosts();
    const existingIndex = posts.findIndex((p) => p.id === post.id);
    if (existingIndex >= 0) {
      posts[existingIndex] = post;
    } else {
      posts.unshift(post);
    }
    writeJsonFile(POSTS_FILE, posts);
    return post;
  },

  incrementPostView(id: string): StoredPost | undefined {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === id);
    if (post) {
      post.views += 1;
      writeJsonFile(POSTS_FILE, posts);
    }
    return post;
  },

  togglePostLike(id: string, delta: number): StoredPost | undefined {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === id);
    if (post) {
      post.likes = Math.max(0, post.likes + delta);
      writeJsonFile(POSTS_FILE, posts);
    }
    return post;
  },

  addCommentToPost(postId: string, comment: StoredComment): StoredPost | undefined {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.comments.push(comment);
      writeJsonFile(POSTS_FILE, posts);
    }
    return post;
  },

  toggleCommentLike(postId: string, commentId: string, delta: number): StoredPost | undefined {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
      const comment = post.comments.find((c) => c.id === commentId);
      if (comment) {
        comment.likes = Math.max(0, comment.likes + delta);
        writeJsonFile(POSTS_FILE, posts);
      }
    }
    return post;
  },

  // Cheering Notes
  getCheeringNotes(): StoredCheeringNote[] {
    return readJsonFile<StoredCheeringNote[]>(CHEERING_FILE, SEED_CHEERING);
  },

  addCheeringNote(note: StoredCheeringNote): StoredCheeringNote {
    const notes = this.getCheeringNotes();
    notes.unshift(note);
    writeJsonFile(CHEERING_FILE, notes);
    return note;
  },

  likeCheeringNote(id: string): StoredCheeringNote | undefined {
    const notes = this.getCheeringNotes();
    const note = notes.find((n) => n.id === id);
    if (note) {
      note.likes += 1;
      writeJsonFile(CHEERING_FILE, notes);
    }
    return note;
  },

  // CBT Cards
  getCbtCards(): StoredCbtCard[] {
    return readJsonFile<StoredCbtCard[]>(CBT_FILE, SEED_CBT);
  },

  saveCbtCard(card: StoredCbtCard): StoredCbtCard {
    const cards = this.getCbtCards();
    const existingIndex = cards.findIndex((c) => c.id === card.id);
    if (existingIndex >= 0) {
      cards[existingIndex] = card;
    } else {
      cards.unshift(card);
    }
    writeJsonFile(CBT_FILE, cards);
    return card;
  },

  deleteCbtCard(id: string): boolean {
    const cards = this.getCbtCards();
    const filtered = cards.filter((c) => c.id !== id);
    if (filtered.length !== cards.length) {
      writeJsonFile(CBT_FILE, filtered);
      return true;
    }
    return false;
  },

  // Mood Records
  getMoodRecords(): StoredMoodRecord[] {
    return readJsonFile<StoredMoodRecord[]>(MOOD_FILE, SEED_MOODS);
  },

  saveMoodRecord(record: StoredMoodRecord): StoredMoodRecord {
    const records = this.getMoodRecords();
    const existingIndex = records.findIndex((r) => r.id === record.id || r.date === record.date);
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }
    // Sort descending by date
    records.sort((a, b) => b.date.localeCompare(a.date));
    writeJsonFile(MOOD_FILE, records);
    return record;
  },

  deleteMoodRecord(id: string): boolean {
    const records = this.getMoodRecords();
    const filtered = records.filter((r) => r.id !== id);
    if (filtered.length !== records.length) {
      writeJsonFile(MOOD_FILE, filtered);
      return true;
    }
    return false;
  },
};
