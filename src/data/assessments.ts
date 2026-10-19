import { AssessmentType } from '../types';

export const ASSESSMENTS: AssessmentType[] = [
  {
    id: 'job-stress',
    title: '졸업예정자 취업 스트레스 척도',
    subtitle: '취업 준비 및 미래 불확실성에 따른 심리적 압박 수준 측정',
    description: '대학 졸업을 앞두고 느끼는 진로 고민, 취업 공포, 가족 및 주변인의 기대에서 오는 심리적 긴장감을 객관적으로 점검합니다.',
    iconName: 'Activity',
    questions: [
      {
        id: 1,
        text: '취업이나 진로 생각만 하면 가슴이 답답하거나 소화가 안 되는 등 신체적 긴장을 느낀다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '거의 매일 그렇다', score: 3 },
        ],
      },
      {
        id: 2,
        text: '주변 동기나 친구들의 취업 소식을 들으면 축하하는 마음보다 불안과 초조함이 앞선다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '거의 매일 그렇다', score: 3 },
        ],
      },
      {
        id: 3,
        text: '부모님이나 친척을 마주칠 때 진로에 대한 질문을 받을까 봐 만남을 피하고 싶다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '거의 매일 그렇다', score: 3 },
        ],
      },
      {
        id: 4,
        text: '탈락 통보를 받으면 내가 사회로부터 거부당한 것 같은 깊은 수치심이나 무력감이 든다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '거의 매일 그렇다', score: 3 },
        ],
      },
      {
        id: 5,
        text: '취업 준비 외에 일상적인 취미나 휴식을 취할 때도 "이 시간에 자소서나 써야 하는데"라며 죄책감이 든다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '거의 매일 그렇다', score: 3 },
        ],
      },
      {
        id: 6,
        text: '밤에 잠들기 전 "앞으로 어떻게 살아가야 하지?"라는 불안한 생각에 쉽게 잠들지 못한다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '거의 매일 그렇다', score: 3 },
        ],
      },
      {
        id: 7,
        text: '스펙이나 학점이 다른 사람들에 비해 턱없이 부족하다고 느껴져 지원조차 망설여진다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '거의 매일 그렇다', score: 3 },
        ],
      },
      {
        id: 8,
        text: '현재 나의 심리적 상태가 학업이나 일상생활을 유지하기 힘들 정도로 지쳐 있다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '거의 매일 그렇다', score: 3 },
        ],
      },
    ],
  },
  {
    id: 'burnout',
    title: '취준생 번아웃 & 정서적 고갈 지수',
    subtitle: '장기간의 준비로 인한 에너지 소진 및 무기력 상태 평가',
    description: '시험, 자격증, 인턴십, 자소서 작성 등으로 마음의 배터리가 방전되어 아무것도 손에 잡히지 않는 탈진 상태를 체크합니다.',
    iconName: 'Flame',
    questions: [
      {
        id: 1,
        text: '아침에 일어났을 때 개운하지 않고, 하루를 시작하는 것이 극도로 버겁다.',
        options: [
          { label: '전혀 아니다', score: 0 },
          { label: '약간 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 2,
        text: '예전에는 흥미로웠던 일이나 친구들과의 대화도 모두 귀찮고 무감각하게 느껴진다.',
        options: [
          { label: '전혀 아니다', score: 0 },
          { label: '약간 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 3,
        text: '취업 준비에 집중하기 어렵고, 책상에 앉아 멍하니 시간을 보내는 일이 늘었다.',
        options: [
          { label: '전혀 아니다', score: 0 },
          { label: '약간 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 4,
        text: '"노력해도 어차피 소용없다"는 체념적인 생각이 자주 든다.',
        options: [
          { label: '전혀 아니다', score: 0 },
          { label: '약간 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 5,
        text: '작은 일에도 짜증이나 눈물이 불쑥 솟구치는 등 감정 조절이 어렵다.',
        options: [
          { label: '전혀 아니다', score: 0 },
          { label: '약간 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 6,
        text: '모든 사람과의 연락을 끊고 혼자 동굴 속으로 숨어버리고 싶다는 생각을 한다.',
        options: [
          { label: '전혀 아니다', score: 0 },
          { label: '약간 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '매우 그렇다', score: 3 },
        ],
      },
    ],
  },
  {
    id: 'imposter',
    title: '가면 증후군 & 자기효능감 척도',
    subtitle: '자신의 능력을 과소평가하고 사기꾼처럼 들통날까 두려워하는 심리',
    description: '"내가 그동안 성취한 건 그저 운이었어", "내가 진짜 사회에 나가 일할 자격이 있을까?"라는 자기 불신을 진단합니다.',
    iconName: 'ShieldAlert',
    questions: [
      {
        id: 1,
        text: '좋은 학점이나 프로젝트 성공을 거두었을 때 "내 실력 덕분이 아니라 운이 좋았을 뿐"이라고 치부한다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '항상 그렇다', score: 3 },
        ],
      },
      {
        id: 2,
        text: '회사에 합격하더라도 "내가 실제 일을 시작하면 무능함이 금방 들통날 텐데"라는 두려움이 앞선다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '항상 그렇다', score: 3 },
        ],
      },
      {
        id: 3,
        text: '타인의 칭찬이나 격려를 들으면 진심으로 받아들이기 어렵고 부담스럽게 느껴진다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '항상 그렇다', score: 3 },
        ],
      },
      {
        id: 4,
        text: '완벽하지 않으면 전부 실패한 것 같아 사소한 실수에도 극심한 자기혐오를 겪는다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '항상 그렇다', score: 3 },
        ],
      },
      {
        id: 5,
        text: '남들이 나를 과대평가하고 있으며, 언젠가 내가 부족한 실력자라는 걸 알게 될까 봐 긴장된다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '항상 그렇다', score: 3 },
        ],
      },
      {
        id: 6,
        text: '동기들에 비해 나는 기본 소양조차 갖추지 못한 미달자처럼 느껴질 때가 많다.',
        options: [
          { label: '전혀 그렇지 않다', score: 0 },
          { label: '가끔 그렇다', score: 1 },
          { label: '자주 그렇다', score: 2 },
          { label: '항상 그렇다', score: 3 },
        ],
      },
    ],
  },
];
