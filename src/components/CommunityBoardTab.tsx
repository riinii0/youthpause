import React, { useState, useEffect } from 'react';
import {
  CommunityPost,
  CommunityComment,
  CommunityCategory,
} from '../types';
import { api } from '../services/api';
import { INITIAL_COMMUNITY_POSTS } from '../data/communityPosts';
import {
  MessageSquare,
  Heart,
  Eye,
  PenSquare,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  Send,
  User,
  ShieldCheck,
  Tag,
  AlertCircle,
  Loader2,
  RefreshCw,
  Flame,
  Clock,
  ThumbsUp,
  Bot,
} from 'lucide-react';

const CATEGORIES: CommunityCategory[] = [
  '전체',
  '서류/면접 고민',
  '동기 비교/자존감',
  '진로/적성 방황',
  '번아웃/무기력',
  '가족/현실적 부담',
  '소소한 취뽀/응원',
];

const EMOTION_TAGS = [
  '속상해요',
  '불안해요',
  '답답해요',
  '응원 필요해요',
  '외로워요',
  '극복했어요',
];

const RANDOM_NICKNAMES = [
  '새벽 도서관',
  '지친 취준러',
  '따뜻한 바람',
  '숨고르는 펭귄',
  '내일의 햇살',
  '2호선 순환선',
  '작은 민들레',
  '밤하늘의 별',
  '차분한 라떼',
  '용기내는 판다',
];

export const CommunityBoardTab: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);

  // Fetch from backend server on mount
  useEffect(() => {
    api.getCommunityPosts().then((serverPosts) => {
      if (serverPosts && serverPosts.length > 0) {
        setPosts(serverPosts);
      }
    });
  }, []);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory>('전체');
  const [sortBy, setSortBy] = useState<'latest' | 'likes' | 'comments'>('latest');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Forms
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiReplying, setIsAiReplying] = useState(false);

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<Exclude<CommunityCategory, '전체'>>('서류/면접 고민');
  const [newNickname, setNewNickname] = useState(() => {
    return RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
  });
  const [newEmotionTag, setNewEmotionTag] = useState(EMOTION_TAGS[0]);
  const [requestAiCounselorReply, setRequestAiCounselorReply] = useState(true);

  // New Comment Form State
  const [commentText, setCommentText] = useState('');
  const [commentNickname, setCommentNickname] = useState(() => {
    return RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
  });
  const [commentRole, setCommentRole] = useState<'동기' | '선배' | '작성자'>('동기');

  // Liked tracking (saved locally to know which user liked which post/comment)
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('community_liked_posts');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {}
    }
    return new Set();
  });

  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('community_liked_comments');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {}
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('community_liked_posts', JSON.stringify(Array.from(likedPostIds)));
  }, [likedPostIds]);

  useEffect(() => {
    localStorage.setItem('community_liked_comments', JSON.stringify(Array.from(likedCommentIds)));
  }, [likedCommentIds]);

  // Selected Post helper
  const currentPost = posts.find((p) => p.id === selectedPostId);

  const handleSelectPost = (postId: string) => {
    // Increment view count on backend
    api.recordPostView(postId);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, views: p.views + 1 } : p))
    );
    setSelectedPostId(postId);
  };

  const handleTogglePostLike = async (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isLiked = likedPostIds.has(postId);
    const delta = isLiked ? -1 : 1;
    const updated = new Set(likedPostIds);
    if (isLiked) {
      updated.delete(postId);
    } else {
      updated.add(postId);
    }
    setLikedPostIds(updated);

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: Math.max(0, p.likes + delta) } : p))
    );

    // Backend sync
    try {
      const res = await api.togglePostLike(postId, delta);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: res.likes } : p))
      );
    } catch (err) {
      console.error('Failed to sync post like with backend:', err);
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    if (!selectedPostId) return;
    const isLiked = likedCommentIds.has(commentId);
    const delta = isLiked ? -1 : 1;
    const updated = new Set(likedCommentIds);

    if (isLiked) {
      updated.delete(commentId);
    } else {
      updated.add(commentId);
    }
    setLikedCommentIds(updated);

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedPostId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === commentId ? { ...c, likes: Math.max(0, c.likes + delta) } : c
              ),
            }
          : p
      )
    );

    // Backend sync
    api.toggleCommentLike(selectedPostId, commentId, delta).catch((err) => {
      console.error('Failed to sync comment like with backend:', err);
    });
  };

  // Submit New Post to Backend
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const savedPost = await api.createCommunityPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        authorNickname: newNickname.trim() || '익명의 청춘',
        category: newCategory,
        emotionTag: newEmotionTag,
        requestAiCounselorReply,
      });

      setPosts([savedPost, ...posts]);
      setShowWriteModal(false);
      setNewTitle('');
      setNewContent('');
      setSelectedPostId(savedPost.id);
    } catch (err) {
      console.error('Error creating post on backend:', err);
      alert('게시글을 백엔드 서버에 저장하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit New Comment to Backend
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedPostId) return;

    try {
      const newComment = await api.addCommunityComment(selectedPostId, {
        authorNickname: commentNickname.trim() || '익명의 친구',
        authorRole: commentRole,
        content: commentText.trim(),
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPostId
            ? { ...p, comments: [...p.comments, newComment] }
            : p
        )
      );

      setCommentText('');
    } catch (err) {
      console.error('Error adding comment to backend:', err);
      alert('댓글을 저장하지 못했습니다.');
    }
  };

  // Request Counselor AI Reply on Current Post (Saved to Backend)
  const handleRequestAiComment = async () => {
    if (!currentPost || isAiReplying) return;

    setIsAiReplying(true);
    try {
      const aiComment = await api.requestAiCounselorComment(currentPost.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === currentPost.id
            ? { ...p, comments: [...p.comments, aiComment] }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      alert('상담사 위로 댓글을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsAiReplying(false);
    }
  };

  const regenerateNickname = () => {
    const picked = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    setNewNickname(picked);
  };

  // Filtering & Sorting
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === '전체' || post.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorNickname.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'likes') return b.likes - a.likes;
    if (sortBy === 'comments') return b.comments.length - a.comments.length;
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Community Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-rose-500/10 p-6 border border-indigo-200/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">익명 청춘 고민 광장</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
                100% 완전 익명 보장
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              말 못 할 취업 불안, 동기 비교의 고통, 불합격의 슬픔을 편안하게 털어놓고 서로의 온기를 나누는 공간입니다.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowWriteModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-md transition shrink-0"
        >
          <PenSquare className="h-4 w-4" />
          <span>익명 고민 글쓰기</span>
        </button>
      </div>

      {/* Detail Post View OR List View */}
      {selectedPostId && currentPost ? (
        /* Post Detail View */
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6 animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedPostId(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>목록으로 돌아가기</span>
          </button>

          {/* Post Header */}
          <div className="border-b border-slate-100 pb-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentPost.category}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                #{currentPost.emotionTag}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {currentPost.title}
            </h3>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-indigo-500" />
                  {currentPost.authorNickname}
                </span>
                <span>•</span>
                <span>{new Date(currentPost.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {currentPost.views}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> {currentPost.comments.length}
                </span>
              </div>
            </div>
          </div>

          {/* Post Body Content */}
          <div className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap py-2">
            {currentPost.content}
          </div>

          {/* Like Action & AI Counsel Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleTogglePostLike(currentPost.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                likedPostIds.has(currentPost.id)
                  ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${
                  likedPostIds.has(currentPost.id) ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span>공감 응원해요 ({currentPost.likes})</span>
            </button>

            <button
              onClick={handleRequestAiComment}
              disabled={isAiReplying}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition disabled:opacity-50"
            >
              {isAiReplying ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />
                  <span>상담사가 글을 읽고 따뜻한 답글을 적고 있어요...</span>
                </>
              ) : (
                <>
                  <Bot className="h-3.5 w-3.5 text-emerald-600" />
                  <span>상담사 민서의 위로 답글 받기</span>
                </>
              )}
            </button>
          </div>

          {/* Comments Section */}
          <div className="space-y-5 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>댓글 및 응원의 말</span>
                <span className="text-indigo-600 font-bold">{currentPost.comments.length}</span>
              </h4>
              <span className="text-xs text-slate-400">상처 주는 말 대신 온기를 건네주세요</span>
            </div>

            {/* Comment List */}
            <div className="space-y-3">
              {currentPost.comments.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400">
                  아직 달린 댓글이 없습니다. 첫 번째 따뜻한 응원을 남겨보세요!
                </div>
              ) : (
                currentPost.comments.map((comment) => {
                  const isCommentLiked = likedCommentIds.has(comment.id);
                  return (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-xl border transition ${
                        comment.isAiCounselor
                          ? 'bg-emerald-50/60 border-emerald-200 shadow-sm'
                          : comment.authorRole === '작성자'
                          ? 'bg-indigo-50/40 border-indigo-200'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            {comment.isAiCounselor && <Bot className="h-3.5 w-3.5 text-emerald-600" />}
                            {comment.authorNickname}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              comment.isAiCounselor
                                ? 'bg-emerald-200 text-emerald-900'
                                : comment.authorRole === '작성자'
                                ? 'bg-indigo-200 text-indigo-900'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {comment.authorRole}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comment.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleCommentLike(comment.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                            isCommentLiked
                              ? 'bg-rose-100 text-rose-600'
                              : 'text-slate-400 hover:text-rose-500 hover:bg-slate-200/50'
                          }`}
                        >
                          <Heart
                            className={`h-3 w-3 ${
                              isCommentLiked ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                          <span>{comment.likes}</span>
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Write Comment Box */}
            <form
              onSubmit={handleAddComment}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">내 닉네임:</span>
                  <input
                    type="text"
                    value={commentNickname}
                    onChange={(e) => setCommentNickname(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white w-32"
                  />
                  <select
                    value={commentRole}
                    onChange={(e) => setCommentRole(e.target.value as any)}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                  >
                    <option value="동기">동기</option>
                    <option value="선배">선배</option>
                    <option value="작성자">작성자</option>
                  </select>
                </div>
              </div>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="지친 동기에게 건네는 따뜻한 한마디가 오늘 누군가의 하루를 살릴 수 있습니다..."
                rows={2}
                className="w-full resize-none rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>댓글 남기기</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Posts List View */
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort & Search */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="고민 키워드 검색..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
              >
                <option value="latest">최신순</option>
                <option value="likes">공감 많은 순</option>
                <option value="comments">댓글 많은 순</option>
              </select>
            </div>
          </div>

          {/* Post Cards Grid */}
          <div className="space-y-3">
            {sortedPosts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-sm">
                해당 조건의 고민 글이 없습니다. 가장 먼저 고민을 털어놓아 보세요.
              </div>
            ) : (
              sortedPosts.map((post) => {
                const isLiked = likedPostIds.has(post.id);
                return (
                  <div
                    key={post.id}
                    onClick={() => handleSelectPost(post.id)}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {post.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          #{post.emotionTag}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium text-slate-600">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{post.authorNickname}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> {post.views}
                        </span>

                        <button
                          onClick={(e) => handleTogglePostLike(post.id, e)}
                          className={`flex items-center gap-1 transition ${
                            isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-500'
                          }`}
                        >
                          <Heart
                            className={`h-3.5 w-3.5 ${
                              isLiked ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                          <span>{post.likes}</span>
                        </button>

                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                          <span>{post.comments.length}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Write Post Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">익명으로 고민 털어놓기</h3>
                <p className="text-xs text-slate-500">당신의 신원은 누구에게도 공개되지 않습니다.</p>
              </div>
              <button
                onClick={() => setShowWriteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Nickname & Category */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">익명 닉네임</label>
                    <button
                      type="button"
                      onClick={regenerateNickname}
                      className="text-[11px] text-indigo-600 flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="h-3 w-3" /> 다른 닉네임
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">카테고리</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800"
                  >
                    {CATEGORIES.filter((c) => c !== '전체').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Emotion Tag Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  현재 내 마음의 감정 태그
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewEmotionTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        newEmotionTag === tag
                          ? 'bg-rose-500 text-white font-bold shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 오늘 또 불합격 통보를 받아서 너무 무기력해요..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">고민 내용</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="누구에게도 털어놓지 못했던 솔직한 마음을 편안하게 적어주세요..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-slate-200 p-3.5 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 leading-relaxed"
                />
              </div>

              {/* AI Counselor Reply Option */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="aiReplyCheckbox"
                  checked={requestAiCounselorReply}
                  onChange={(e) => setRequestAiCounselorReply(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="aiReplyCheckbox" className="text-xs text-emerald-950 font-medium cursor-pointer">
                  <strong>상담사 민서의 위로 답글 함께 받기</strong>
                  <span className="block text-[11px] text-emerald-700 mt-0.5">
                    게시글 등록 시 Gemini 심리상담사가 정성을 담은 첫 번째 공감 답글을 달아드립니다.
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newContent.trim() || isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 shadow-md transition"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>등록 및 온기 답글 생성 중...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>익명으로 게시하기</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
