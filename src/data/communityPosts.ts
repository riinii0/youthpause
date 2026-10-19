import { CommunityPost } from '../types';

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    title: '오늘 최종 면접에서 탈락 문자를 받고 지하철에서 펑펑 울었습니다',
    content: `3차 최종 임원면접까지 가서 정말 간절하게 준비했는데, 오늘 불합격 통보를 받았습니다.\n대학 4년 동안 방학 한 번 제대로 안 쉬고 학점 관리하고 인턴하고 자격증 땄는데... 왜 마지막 문턱에서 항상 무너지는 걸까요.\n집에 들어가면 부모님이 기대하고 계실 텐데 어떤 표정으로 문을 열어야 할지 모르겠어서 지금 2호선을 몇 바퀴째 돌고 있어요.`,
    authorNickname: '2호선순환선',
    category: '서류/면접 고민',
    emotionTag: '속상해요',
    createdAt: Date.now() - 3600000 * 2, // 2 hours ago
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
      {
        id: 'c-3-2',
        postId: 'post-3',
        authorNickname: '문과출신 마케터',
        authorRole: '선배',
        content:
          '저도 철학과 나와서 27살에 처음 마케팅 인턴 시작했어요. 대학 전공과 직무가 다른 사람이 직장인의 70%가 넘습니다! 너무 자책 마시고 작은 대외활동이나 스타트업 인턴부터 가볍게 두드려 보세요.',
        createdAt: Date.now() - 3600000 * 8,
        likes: 19,
      },
    ],
  },
  {
    id: 'post-4',
    title: '작은 스타트업이지만 오늘 첫 출근 확정 통보를 받았습니다 (작은 응원 드려요)',
    content: `대기업만 바라보며 서류 40군데 탈락하고 멘탈이 산산조각 났던 사람입니다.\n정말 다 포기하고 싶을 때 청춘쉼표에서 호흡 운동도 하고 멘탈 붙잡으며 중소/스타트업으로 시야를 넓혔는데, 제 가치를 진심으로 알아봐 주는 멋진 팀을 만났어요.\n지금 끝이 보이지 않는 터널 속에 계신 분들, 저도 그랬기에 그 마음 너무나 잘 압니다. 여러분도 곧 반드시 여러분만의 문을 열게 되실 거예요. 모두 힘내세요!`,
    authorNickname: '작은민들레',
    category: '소소한 취뽀/응원',
    emotionTag: '극복했어요',
    createdAt: Date.now() - 3600000 * 24,
    likes: 96,
    views: 520,
    comments: [
      {
        id: 'c-4-1',
        postId: 'post-4',
        authorNickname: '취준 6개월차',
        authorRole: '동기',
        content: '와 너무 축하드려요!! 글 보니까 정말 큰 위로와 용기가 됩니다. 첫 출근 멋지게 잘하시길 응원해요!',
        createdAt: Date.now() - 3600000 * 20,
        likes: 15,
      },
    ],
  },
];
