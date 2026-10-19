import {
  CommunityPost,
  CommunityComment,
  CheeringNote,
  CbtCard,
  MoodRecord,
} from '../types';

export const api = {
  // === Community Posts ===
  async getCommunityPosts(): Promise<CommunityPost[]> {
    try {
      const res = await fetch('/api/community/posts');
      if (!res.ok) throw new Error('Failed to fetch posts');
      return await res.json();
    } catch (err) {
      console.warn('API getCommunityPosts error, using localStorage fallback:', err);
      const saved = localStorage.getItem('anonymous_community_posts');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async createCommunityPost(data: {
    title: string;
    content: string;
    authorNickname: string;
    category: string;
    emotionTag: string;
    requestAiCounselorReply: boolean;
  }): Promise<CommunityPost> {
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error('게시글 등록에 실패했습니다.');
    }
    return await res.json();
  },

  async togglePostLike(postId: string, delta: number): Promise<{ likes: number }> {
    const res = await fetch(`/api/community/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
    if (!res.ok) throw new Error('좋아요 처리에 실패했습니다.');
    return await res.json();
  },

  async recordPostView(postId: string): Promise<void> {
    fetch(`/api/community/posts/${postId}/view`, {
      method: 'POST',
    }).catch(() => {});
  },

  async addCommunityComment(
    postId: string,
    commentData: {
      authorNickname: string;
      authorRole: string;
      content: string;
    }
  ): Promise<CommunityComment> {
    const res = await fetch(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!res.ok) throw new Error('댓글 등록에 실패했습니다.');
    return await res.json();
  },

  async toggleCommentLike(postId: string, commentId: string, delta: number): Promise<void> {
    await fetch(`/api/community/posts/${postId}/comments/${commentId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
  },

  async requestAiCounselorComment(postId: string): Promise<CommunityComment> {
    const res = await fetch(`/api/community/posts/${postId}/ai-comment`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('상담사 위로 댓글을 생성하지 못했습니다.');
    return await res.json();
  },

  // === Cheering Notes ===
  async getCheeringNotes(): Promise<CheeringNote[]> {
    try {
      const res = await fetch('/api/cheering-notes');
      if (!res.ok) throw new Error('Failed to fetch cheering notes');
      return await res.json();
    } catch (err) {
      console.warn('API getCheeringNotes fallback:', err);
      const saved = localStorage.getItem('cheering_notes_wall');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async createCheeringNote(data: {
    authorType: string;
    content: string;
    category: string;
  }): Promise<CheeringNote> {
    const res = await fetch('/api/cheering-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('응원 메시지 등록에 실패했습니다.');
    return await res.json();
  },

  async likeCheeringNote(id: string): Promise<CheeringNote> {
    const res = await fetch(`/api/cheering-notes/${id}/like`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('좋아요 처리에 실패했습니다.');
    return await res.json();
  },

  // === CBT Cards ===
  async getCbtCards(): Promise<CbtCard[]> {
    try {
      const res = await fetch('/api/cbt-cards');
      if (!res.ok) throw new Error('Failed to fetch CBT cards');
      return await res.json();
    } catch (err) {
      console.warn('API getCbtCards fallback:', err);
      const saved = localStorage.getItem('cbt_reframed_cards');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async saveCbtCard(card: CbtCard): Promise<CbtCard> {
    const res = await fetch('/api/cbt-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
    if (!res.ok) throw new Error('카드 저장에 실패했습니다.');
    return await res.json();
  },

  async deleteCbtCard(id: string): Promise<void> {
    const res = await fetch(`/api/cbt-cards/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('카드 삭제에 실패했습니다.');
  },

  // === Mood Tracker ===
  async getMoodRecords(): Promise<MoodRecord[]> {
    try {
      const res = await fetch('/api/mood-records');
      if (!res.ok) throw new Error('Failed to fetch mood records');
      return await res.json();
    } catch (err) {
      console.warn('API getMoodRecords fallback:', err);
      const saved = localStorage.getItem('user_mood_records');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async saveMoodRecord(data: {
    date: string;
    score: number;
    scoreLabel: string;
    emoji: string;
    tags: string[];
    memo: string;
    requestAiFeedback?: boolean;
  }): Promise<MoodRecord> {
    const res = await fetch('/api/mood-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('감정 기록 저장에 실패했습니다.');
    return await res.json();
  },

  async deleteMoodRecord(id: string): Promise<void> {
    const res = await fetch(`/api/mood-records/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('기록 삭제에 실패했습니다.');
  },
};
