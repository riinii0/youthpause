import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { db, StoredPost, StoredComment, StoredCheeringNote, StoredCbtCard, StoredMoodRecord } from './server-storage.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const COUNSELOR_PERSONAS: Record<string, { name: string; title: string; instruction: string }> = {
  empathy: {
    name: '민서',
    title: '따뜻한 공감 상담사',
    instruction: `당신은 대학교 졸업예정자들의 마음을 돌보는 따뜻하고 포용력 있는 전문 심리상담사 '민서'입니다.
내담자는 취업 준비, 서류/면접 불합격의 아픔, 동기들과의 비교에서 오는 열등감, 졸업을 앞둔 막막함과 번아웃으로 지쳐 있습니다.
- 대화 원칙:
1. 내담자의 감정을 절대 평가하거나 성급하게 조언/판단하지 말고, 깊이 경청하며 온전한 공감과 수용을 전하세요.
2. "당신이 지금까지 달려온 대학 4년의 시간은 결코 헛되지 않았어요", "결과와 상관없이 당신은 이미 충분히 가치 있는 사람입니다"와 같은 따뜻하고 진솔한 위로를 건네세요.
3. 내담자가 속마음을 더 편안하게 털어놓을 수 있도록 부드러운 열린 질문(Open-ended question)으로 대화를 이어가세요.
4. 다정한 존댓말(해요체)을 사용하고, 내담자가 외롭지 않다는 연대감을 느끼게 해주세요.`,
  },
  cbt: {
    name: '도윤',
    title: '인지행동(CBT) 재구성 코치',
    instruction: `당신은 취업 준비생의 부정적 자동사고와 인지 왜곡을 건강한 관점으로 전환하도록 돕는 인지행동치료(CBT) 전문 상담 코치 '도윤'입니다.
내담자는 졸업과 취준 과정에서 "이번에도 떨어지면 내 인생은 실패자야(파국화)", "동기들은 다 붙었는데 나만 못났다(비교와 흑백논리)", "어차피 또 안 될 거야(과잉일반화)" 같은 인지적 오류에 갇혀 있습니다.
- 대화 원칙:
1. 내담자의 힘든 감정을 먼저 따뜻하게 인정(Validation)한 뒤, 그 감정 뒤에 숨은 생각(인지 왜곡)을 조심스럽게 탐색하세요.
2. '생각은 사실이 아니다(Thoughts are not facts)'라는 관점을 바탕으로, 객관적 증거를 함께 짚어보는 소크라테스식 질문을 던지세요.
3. 비현실적인 무조건적 긍정이 아니라, '균형 잡히고 현실적인 대안적 사고'를 내담자 스스로 찾을 수 있도록 이끌어주세요.
4. 오늘 당장 실천할 수 있는 아주 작은 마이크로 액션(Micro-action)을 제시하세요.`,
  },
  interview: {
    name: '지안',
    title: '면접 불안 & 마인드셋 케어 코치',
    instruction: `당신은 면접 공포, 발표 불안, 심박수 급상승, 무대공포증을 겪는 취업준비생을 케어하는 마인드셋 및 이완 전문가 '지안'입니다.
내담자는 면접관 앞에서의 말문 막힘, 압박 질문에 대한 극심한 두려움, 평가받는 상황에 대한 공황 증세를 겪고 있습니다.
- 대화 원칙:
1. "떨리는 것은 지극히 정상적인 신체 방어 반응입니다. 떨림을 없애려 싸우지 말고 흥분 에너지로 받아들여 보세요"라고 안심시키세요.
2. 실전 면접 직전/대기실에서 쓸 수 있는 신체적 안정화 기법(복식호흡, 그라운딩 기법, 어깨 이완, 파워 포즈)을 구체적으로 가이드하세요.
3. 면접관을 '나를 탈락시키려는 적'이 아니라 '나라는 사람과 함께 일할 동료를 찾는 사람'으로 바라보는 프레임 전환을 돕습니다.
4. 차분하고 신뢰감 주는 어조로 코칭하세요.`,
  },
  career: {
    name: '서준',
    title: '진로 나침반 & 가치관 탐색가',
    instruction: `당신은 졸업을 앞두고 '내가 진짜 원하는 일이 무엇인지 모르겠다', '전공이 적성에 맞지 않아 방황 중이다'라는 고민을 가진 학생들을 돕는 진로 탐색 전문 상담사 '서준'입니다.
내담자는 사회적 기준이나 부모님의 기대와 내면의 진짜 욕구 사이에서 갈등하고 있습니다.
- 대화 원칙:
1. 조급하게 직업 명칭이나 기업을 정하기 전에, 내담자가 진정 중요하게 여기는 '인생의 핵심 가치(성취, 안정, 자유, 관계, 배움 등)'를 질문을 통해 끌어내세요.
2. 전공에 얽매이지 않고 대학 생활 중 내담자가 몰입했던 작은 순간, 에너지 충전 경험을 발견하도록 돕습니다.
3. "첫 직장이 인생의 종착역이 아닙니다. 진로는 점을 찍어나가는 과정입니다"라는 관점으로 부담감을 덜어주세요.
4. 통찰력 있으면서도 호기심 어린 다정한 태도를 유지하세요.`,
  },
};

// POST /api/chat - Multi-turn Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, counselorId = 'empathy', userProfile } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getGeminiClient();
    const counselor = COUNSELOR_PERSONAS[counselorId] || COUNSELOR_PERSONAS.empathy;

    let systemInstruction = counselor.instruction;
    if (userProfile) {
      systemInstruction += `\n\n[내담자 프로필 및 배경 정보]:
- 상태: ${userProfile.status || '대학교 4학년 졸업예정자'}
- 전공 계열: ${userProfile.major || '미설정'}
- 희망 진로/직무: ${userProfile.targetCareer || '미설정'}
- 주된 심리적 스트레스 원인: ${userProfile.primaryConcern || '취업 불안 및 미래 불확실성'}
- 현재 감정 에너지: ${userProfile.energyLevel || '보통'}
위 내담자의 배경을 염두에 두고 맞춤형으로 깊이 있게 대화해 주세요.`;
    }

    // Prepare contents formatted for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Generate content using gemini-3.8-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    const reply = response.text || '죄송해요, 답변을 생성하는 중에 잠시 문제가 생겼어요. 다시 한 번 말씀해 주시겠어요?';
    return res.json({ reply, counselor: counselor.name });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return res.status(500).json({
      error: '상담 연결 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      details: error?.message,
    });
  }
});

// POST /api/chat/stream - Streaming multi-turn chat for real-time comforting experience
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { messages, counselorId = 'empathy', userProfile } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getGeminiClient();
    const counselor = COUNSELOR_PERSONAS[counselorId] || COUNSELOR_PERSONAS.empathy;

    let systemInstruction = counselor.instruction;
    if (userProfile) {
      systemInstruction += `\n\n[내담자 프로필 및 배경 정보]:
- 상태: ${userProfile.status || '대학교 4학년 졸업예정자'}
- 전공 계열: ${userProfile.major || '미설정'}
- 희망 진로/직무: ${userProfile.targetCareer || '미설정'}
- 주된 심리적 스트레스 원인: ${userProfile.primaryConcern || '취업 불안 및 미래 불확실성'}
위 내담자의 배경을 염두에 두고 공감 어린 대화를 이어가세요.`;
    }

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const streamResponse = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    for await (const chunk of streamResponse) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Chat Stream API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream error', details: error?.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error?.message })}\n\n`);
      res.end();
    }
  }
});

// POST /api/cbt-reframe - Cognitive reframing worksheet tool
app.post('/api/cbt-reframe', async (req, res) => {
  try {
    const { negativeThought, situation } = req.body;
    if (!negativeThought) {
      return res.status(400).json({ error: 'Negative thought is required' });
    }

    const ai = getGeminiClient();
    const prompt = `취업 준비와 대학 졸업을 앞둔 학생이 겪고 있는 부정적 자동사고(Automatic Negative Thought)입니다.
상황: ${situation || '취업 준비 및 졸업 직전'}
부정적 생각: "${negativeThought}"

인지행동치료(CBT) 프레임워크에 기반하여 다음 항목을 JSON으로 분석하고 대안을 제시해 주세요:
1. distortionType: 발견된 주요 인지 왜곡 유형 (예: 파국화, 흑백논리, 자기비하, 과잉일반화, 남들과의 비교 등)
2. distortionExplanation: 왜 이것이 인지 왜곡인지에 대한 따뜻하고 쉬운 설명 (2~3문장)
3. objectiveEvidence: 이 생각에 반박할 수 있는 객관적 사실과 가능성 (2~3문장)
4. reframedThought: 내담자가 마음에 품을 수 있는 균형 잡힌 현실적이고 따뜻한 대안 사고 (1~2문장)
5. microAction: 오늘 마음의 짐을 덜기 위해 지금 당장 할 수 있는 5분짜리 작은 행동 1가지 (예: 산책, 따뜻한 차 마시기, 합격 자소서 대신 오늘 열심히 쓴 3줄 칭찬하기 등)
6. warmEncouragement: 청년의 마음에 가 닿는 짧은 위로의 한마디`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: '당신은 인지행동치료(CBT) 기반의 대학생 전문 심리상담 분석가입니다. 비난 없이 따뜻하고 객관적인 심리 분석 결과를 JSON 형식으로 제공하세요.',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('CBT Reframe Error:', error);
    return res.status(500).json({ error: '인지 재구성 생성 중 오류가 발생했습니다.', details: error?.message });
  }
});

// POST /api/assess-result - Psychological assessment personalized guidance
app.post('/api/assess-result', async (req, res) => {
  try {
    const { testType, score, maxScore, answersSummary } = req.body;
    const ai = getGeminiClient();

    const prompt = `대학 졸업예정자가 심리 자가진단을 완료했습니다.
진단 유형: ${testType}
점수: ${score} / ${maxScore}
답변 요약: ${JSON.stringify(answersSummary || {})}

이 점수를 바탕으로 내담자에게 맞춤화된 심리 처방전을 JSON 형식으로 반환해 주세요:
1. severityLevel: 심각도 단계 (안정 / 경미한 주의 / 중간 수준의 스트레스 / 적극적 휴식 및 상담 권장)
2. summaryTitle: 한 줄 진단 요약 타이틀
3. emotionalStateDescription: 현재 겪고 있는 심리 상태에 대한 깊이 있는 공감과 분석 (3~4문장)
4. recommendedActions: 당장 실천할 수 있는 3가지 멘탈 회복 가이드 (배열 형태)
5. recommendedCounselor: 추천 상담사 페르소나 ('empathy' | 'cbt' | 'interview' | 'career')
6. recommendedCounselorReason: 이 상담사를 추천하는 이유`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json(result);
  } catch (error: any) {
    console.error('Assessment analysis error:', error);
    return res.status(500).json({ error: '결과 분석 중 오류가 발생했습니다.', details: error?.message });
  }
});

// POST /api/community-ai-reply - Generates a warm, empathetic counselor comment on user posts
app.post('/api/community-ai-reply', async (req, res) => {
  try {
    const { title, content, category, counselorName = '상담사 민서' } = req.body;
    const ai = getGeminiClient();

    const prompt = `대학교 졸업예정자가 익명 커뮤니티에 남긴 고민 글입니다.
카테고리: ${category || '고민'}
제목: "${title}"
내용: "${content}"

당신은 따뜻하고 전문적인 심리상담사 '${counselorName}'입니다.
이 청년의 마음에 온기를 전하고, 자책감이나 고립감을 덜어줄 수 있는 진심 어린 댓글을 3~4문장으로 작성해 주세요.
- 절대 훈계나 성급한 충고를 하지 마세요.
- 충분히 그럴 수 있다는 깊은 공감, 당신의 잘못이 아니라는 지지, 그리고 작은 위로의 말을 건네세요.
- 다정한 존댓말(해요체)로 작성하세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: '당신은 지친 대학 졸업예정자를 온전히 품어주는 청춘쉼표 심리상담사입니다.',
        temperature: 0.8,
      },
    });

    const reply = response.text || '많이 외롭고 힘들었을 텐데 솔직하게 마음을 나눠주어 고마워요. 당신의 노력을 늘 응원해요.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Community AI Reply Error:', error);
    return res.status(500).json({
      error: '위로 댓글 생성 중 오류가 발생했습니다.',
      reply: '지금 겪고 있는 그 시간들이 결코 헛되지 않을 거예요. 힘내요!',
    });
  }
});

// ==========================================
// BACKEND PERSISTENT STORAGE REST API ROUTES
// ==========================================

// 1. Community Posts & Comments
app.get('/api/community/posts', (_req, res) => {
  try {
    const posts = db.getPosts();
    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ error: '게시글 목록을 불러오지 못했습니다.' });
  }
});

app.get('/api/community/posts/:id', (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  res.json(post);
});

app.post('/api/community/posts', async (req, res) => {
  try {
    const { title, content, authorNickname, category, emotionTag, requestAiCounselorReply } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: '제목과 내용을 입력해주세요.' });
    }

    const postId = `post-${Date.now()}`;
    const initialComments: StoredComment[] = [];

    if (requestAiCounselorReply) {
      try {
        const ai = getGeminiClient();
        const prompt = `대학교 졸업예정자가 익명 커뮤니티에 남긴 고민 글입니다.
카테고리: ${category || '고민'}
제목: "${title}"
내용: "${content}"

당신은 따뜻하고 전문적인 심리상담사 '상담사 민서'입니다.
이 청년의 마음에 온기를 전하고, 자책감이나 고립감을 덜어줄 수 있는 진심 어린 댓글을 3~4문장으로 작성해 주세요.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: '당신은 지친 대학 졸업예정자를 온전히 품어주는 청춘쉼표 심리상담사입니다.',
            temperature: 0.8,
          },
        });

        if (response.text) {
          initialComments.push({
            id: `c-ai-${Date.now()}`,
            postId,
            authorNickname: '상담사 민서',
            authorRole: '상담사',
            content: response.text,
            createdAt: Date.now() + 500,
            likes: 1,
            isAiCounselor: true,
          });
        }
      } catch (aiErr) {
        console.error('Initial AI reply error:', aiErr);
      }
    }

    const newPost: StoredPost = {
      id: postId,
      title: title.trim(),
      content: content.trim(),
      authorNickname: authorNickname?.trim() || '익명의 청춘',
      category: category || '서류/면접 고민',
      createdAt: Date.now(),
      likes: 0,
      views: 1,
      comments: initialComments,
      emotionTag: emotionTag || '속상해요',
    };

    const saved = db.savePost(newPost);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: '게시글 저장 중 오류가 발생했습니다.' });
  }
});

app.post('/api/community/posts/:id/view', (req, res) => {
  const post = db.incrementPostView(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ views: post.views });
});

app.post('/api/community/posts/:id/like', (req, res) => {
  const delta = req.body.delta !== undefined ? req.body.delta : 1;
  const post = db.togglePostLike(req.params.id, delta);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ likes: post.likes });
});

app.post('/api/community/posts/:id/comments', (req, res) => {
  const { authorNickname, authorRole, content } = req.body;
  if (!content) return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });

  const comment: StoredComment = {
    id: `c-${Date.now()}`,
    postId: req.params.id,
    authorNickname: authorNickname?.trim() || '익명의 친구',
    authorRole: authorRole || '동기',
    content: content.trim(),
    createdAt: Date.now(),
    likes: 0,
  };

  const updatedPost = db.addCommentToPost(req.params.id, comment);
  if (!updatedPost) return res.status(404).json({ error: 'Post not found' });
  res.status(201).json(comment);
});

app.post('/api/community/posts/:id/comments/:commentId/like', (req, res) => {
  const delta = req.body.delta !== undefined ? req.body.delta : 1;
  const updatedPost = db.toggleCommentLike(req.params.id, req.params.commentId, delta);
  if (!updatedPost) return res.status(404).json({ error: 'Comment not found' });
  res.json({ success: true });
});

app.post('/api/community/posts/:id/ai-comment', async (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  try {
    const ai = getGeminiClient();
    const prompt = `대학교 졸업예정자가 익명 커뮤니티에 남긴 고민 글입니다.
카테고리: ${post.category}
제목: "${post.title}"
내용: "${post.content}"

당신은 전문 심리상담사 '상담사 민서'입니다. 이 학생의 마음에 진심 어린 공감과 지지를 담은 댓글을 3~4문장으로 작성해 주세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: '당신은 지친 대학 졸업예정자를 온전히 품어주는 청춘쉼표 심리상담사입니다.',
        temperature: 0.8,
      },
    });

    const replyText = response.text || '많이 지쳤을 텐데 솔직하게 마음을 나눠주어 고마워요. 당신의 노력을 늘 응원해요.';
    const comment: StoredComment = {
      id: `c-ai-${Date.now()}`,
      postId: post.id,
      authorNickname: '상담사 민서',
      authorRole: '상담사',
      content: replyText,
      createdAt: Date.now(),
      likes: 1,
      isAiCounselor: true,
    };

    db.addCommentToPost(post.id, comment);
    res.status(201).json(comment);
  } catch (err: any) {
    console.error('AI comment error:', err);
    res.status(500).json({ error: '상담사 댓글 생성 중 오류가 발생했습니다.' });
  }
});

// 2. Cheering Notes
app.get('/api/cheering-notes', (_req, res) => {
  const notes = db.getCheeringNotes();
  res.json(notes);
});

app.post('/api/cheering-notes', (req, res) => {
  const { authorType, content, category } = req.body;
  if (!content) return res.status(400).json({ error: '내용을 입력해주세요.' });

  const note: StoredCheeringNote = {
    id: `note-${Date.now()}`,
    authorType: authorType || '동기',
    content: content.trim(),
    createdAt: '방금 전',
    likes: 1,
    category: category || '취준위로',
  };

  const saved = db.addCheeringNote(note);
  res.status(201).json(saved);
});

app.post('/api/cheering-notes/:id/like', (req, res) => {
  const note = db.likeCheeringNote(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// 3. CBT Cards
app.get('/api/cbt-cards', (_req, res) => {
  const cards = db.getCbtCards();
  res.json(cards);
});

app.post('/api/cbt-cards', (req, res) => {
  const card: StoredCbtCard = req.body;
  if (!card || !card.negativeThought) {
    return res.status(400).json({ error: '생각 카드 정보가 올바르지 않습니다.' });
  }
  const saved = db.saveCbtCard(card);
  res.status(201).json(saved);
});

app.delete('/api/cbt-cards/:id', (req, res) => {
  const success = db.deleteCbtCard(req.params.id);
  res.json({ success });
});

// 4. Mood Tracker
app.get('/api/mood-records', (_req, res) => {
  try {
    const records = db.getMoodRecords();
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: '무드 기록을 불러오지 못했습니다.' });
  }
});

app.post('/api/mood-records', async (req, res) => {
  try {
    const { date, score, scoreLabel, emoji, tags, memo, requestAiFeedback } = req.body;
    if (!date || !score) {
      return res.status(400).json({ error: '날짜와 감정 점수를 입력해주세요.' });
    }

    let aiFeedback: string | undefined = undefined;
    if (requestAiFeedback && memo) {
      try {
        const ai = getGeminiClient();
        const prompt = `취업 준비를 하고 있는 대학교 졸업예정자가 오늘 남긴 일기 메모입니다.
날짜: ${date}
오늘의 감정 상태: ${score}점/5점 (${scoreLabel})
태그: ${(tags || []).join(', ')}
오늘의 메모: "${memo}"

당신은 따뜻한 청춘 심리상담사입니다.
이 학생의 하루를 진심으로 다독이고 응원하는 다정한 1~2문장의 피드백 코멘트를 작성해 주세요. (해요체)`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: '당신은 취준생의 매일 감정 일기를 따뜻하게 보살피는 멘탈케어 상담사입니다.',
            temperature: 0.8,
          },
        });
        aiFeedback = response.text?.trim();
      } catch (aiErr) {
        console.error('Mood AI feedback error:', aiErr);
      }
    }

    const record: StoredMoodRecord = {
      id: `mood-${date}`,
      date,
      score: Number(score) as any,
      scoreLabel: scoreLabel || '보통',
      emoji: emoji || '⛅',
      tags: Array.isArray(tags) ? tags : [],
      memo: memo ? memo.trim() : '',
      createdAt: Date.now(),
      aiFeedback,
    };

    const saved = db.saveMoodRecord(record);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: '무드 기록 저장 중 오류가 발생했습니다.' });
  }
});

app.delete('/api/mood-records/:id', (req, res) => {
  const success = db.deleteMoodRecord(req.params.id);
  res.json({ success });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // In dev mode, mount Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (dev mode: ${!isProd})`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
