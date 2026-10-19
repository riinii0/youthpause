import React, { useState, useEffect } from 'react';
import { CheeringNote } from '../types';
import { api } from '../services/api';
import { INITIAL_CHEERING_NOTES } from '../data/cheeringNotes';
import { Heart, Send, MessageCircleHeart, Plus, Filter, Sparkles, UserCheck } from 'lucide-react';

export const CommunityCheerTab: React.FC = () => {
  const [notes, setNotes] = useState<CheeringNote[]>(INITIAL_CHEERING_NOTES);

  useEffect(() => {
    api.getCheeringNotes().then((serverNotes) => {
      if (serverNotes && serverNotes.length > 0) {
        setNotes(serverNotes);
      }
    });
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [newContent, setNewContent] = useState('');
  const [newAuthorType, setNewAuthorType] = useState<CheeringNote['authorType']>('동기');
  const [newCategory, setNewCategory] = useState<CheeringNote['category']>('취준위로');
  const [showAddForm, setShowAddForm] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const handleLike = async (id: string) => {
    if (likedIds.has(id)) return;
    setLikedIds((prev) => new Set(prev).add(id));
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, likes: n.likes + 1 } : n))
    );
    try {
      await api.likeCheeringNote(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const created = await api.createCheeringNote({
        authorType: newAuthorType,
        content: newContent.trim(),
        category: newCategory,
      });

      setNotes([created, ...notes]);
      setNewContent('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert('응원 메시지를 저장하지 못했습니다.');
    }
  };

  const filteredNotes =
    activeCategory === '전체'
      ? notes
      : notes.filter((n) => n.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-indigo-500/10 p-6 border border-rose-200/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-md">
            <MessageCircleHeart className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">청춘 공감 우체통</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              취준의 긴 터널을 먼저 지나간 선배들과, 같은 길을 걷는 동기들이 남긴 진심 어린 응원입니다.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>나도 응원 한마디 남기기</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddNote}
          className="rounded-2xl bg-white p-5 border border-slate-200 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <h4 className="font-bold text-sm text-slate-800">지쳐 있는 동기와 후배에게 따뜻한 한마디를 적어주세요</h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">작성자 구분</label>
              <select
                value={newAuthorType}
                onChange={(e) => setNewAuthorType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-slate-50 focus:bg-white"
              >
                <option value="동기">같은 졸업예정 동기</option>
                <option value="1년차 선배">사회초년생 (1년차 선배)</option>
                <option value="3년차 선배">취업을 먼저 겪은 3년차 선배</option>
                <option value="익명의 친구">익명의 청춘 친구</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">응원 카테고리</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-slate-50 focus:bg-white"
              >
                <option value="취준위로">취준위로</option>
                <option value="자존감">자존감</option>
                <option value="면접응원">면접응원</option>
                <option value="진로나침반">진로나침반</option>
              </select>
            </div>
          </div>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="어떤 위로나 격려도 큰 힘이 됩니다 (예: '나도 30번 탈락하고 나서야 나에게 딱 맞는 회사를 찾았어. 너의 속도를 믿어줘!')"
            rows={3}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
            >
              등록하기
            </button>
          </div>
        </form>
      )}

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['전체', '취준위로', '자존감', '면접응원', '진로나침반'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => {
          const isLiked = likedIds.has(note.id);
          return (
            <div
              key={note.id}
              className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
                      {note.authorType}
                    </span>
                    <span className="text-[10px] text-slate-400">• {note.createdAt}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                    {note.category}
                  </span>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  "{note.content}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">누군가에게 닿은 온기</span>
                <button
                  onClick={() => handleLike(note.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                    isLiked
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{note.likes}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
