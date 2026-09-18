import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  X, 
  Bookmark, 
  Layers, 
  ChevronDown, 
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { getAllQuestions, filterQuestions } from '../data/repository';
import { getBookmarks } from '../utils/storage';
import QuestionCard from '../components/QuestionCard';
import LockedQuestionModal from '../components/LockedQuestionModal';

export default function QuestionBank({ currentSubject, onSelectSubject }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialChapter = searchParams.get('chapter') || '';
  const initialFilter = searchParams.get('filter') || '';

  const [query, setQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [onlyBookmarked, setOnlyBookmarked] = useState(initialFilter === 'bookmarked');
  const [displayCount, setDisplayCount] = useState(25);
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'id-asc', 'id-desc'
  const [lockedQuestionIndex, setLockedQuestionIndex] = useState(null);

  const sub = SUBJECTS[currentSubject] || SUBJECTS.tthcm;
  const allQuestions = useMemo(() => getAllQuestions(currentSubject), [currentSubject]);

  // Sync state when URL params change
  useEffect(() => {
    if (searchParams.get('chapter')) {
      setSelectedChapter(searchParams.get('chapter'));
    }
    if (searchParams.get('filter') === 'bookmarked') {
      setOnlyBookmarked(true);
    }
  }, [searchParams]);

  // Reset pagination when filter changes
  useEffect(() => {
    setDisplayCount(25);
  }, [query, selectedChapter, onlyBookmarked, currentSubject, sortOrder]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    let result = filterQuestions(currentSubject, {
      query,
      chapterId: selectedChapter,
    });

    if (onlyBookmarked) {
      const savedIds = getBookmarks(currentSubject);
      result = result.filter((q) => savedIds.includes(q.id));
    }

    if (sortOrder === 'id-asc') {
      result = [...result].sort((a, b) => a.id - b.id);
    } else if (sortOrder === 'id-desc') {
      result = [...result].sort((a, b) => b.id - a.id);
    }

    return result;
  }, [currentSubject, query, selectedChapter, onlyBookmarked, sortOrder]);

  const visibleQuestions = useMemo(() => {
    return filteredQuestions.slice(0, displayCount);
  }, [filteredQuestions, displayCount]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedChapter('');
    setOnlyBookmarked(false);
    setSearchParams({});
  };

  const getChapterName = (section) => {
    const ch = sub.chapters.find((c) => c.sections.includes(section));
    return ch ? ch.shortName : '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-primary">{sub.shortName}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>
            Ngân hàng câu hỏi trắc nghiệm
          </span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
          Tra cứu &amp; Ôn tập câu hỏi
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Tìm kiếm theo từ khóa nội dung, xem từng lựa chọn, bấm "Xem đáp án" để kiểm tra và đọc giải thích chi tiết.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '12px'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              className="input-text"
              placeholder="Tìm kiếm nội dung câu hỏi, đáp án, mã câu..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '38px', paddingRight: query ? '36px' : '14px' }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  color: 'var(--text-subtle)',
                  padding: '4px'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Chapter Filter Select */}
          <div>
            <select
              className="input-text"
              value={selectedChapter}
              onChange={(e) => {
                setSelectedChapter(e.target.value);
                setSearchParams(e.target.value ? { chapter: e.target.value } : {});
              }}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Tất cả chương / phần ({allQuestions.length} câu)</option>
              {sub.chapters.map((ch) => {
                const count = allQuestions.filter((q) => ch.sections.includes(q.section)).length;
                return (
                  <option key={ch.id} value={ch.id}>
                    {ch.shortName}: {ch.name} ({count} câu)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Filter Pills / Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          borderTop: '1px solid var(--border)',
          paddingTop: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Bookmark Filter Button */}
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`btn btn-sm ${onlyBookmarked ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Bookmark size={14} fill={onlyBookmarked ? 'currentColor' : 'none'} />
              <span>Chỉ câu đã đánh dấu</span>
            </button>

            {/* Sort Toggle */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="btn btn-secondary btn-sm"
              style={{ paddingRight: '8px', cursor: 'pointer' }}
            >
              <option value="default">Thứ tự mặc định</option>
              <option value="id-asc">Mã câu tăng dần</option>
              <option value="id-desc">Mã câu giảm dần</option>
            </select>

            {(query || selectedChapter || onlyBookmarked) && (
              <button
                onClick={handleResetFilters}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--error-text)' }}
              >
                <X size={14} />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>

          <div style={{ fontSize: '13.5px', color: 'var(--text-subtle)', fontWeight: 600 }}>
            Hiển thị {Math.min(displayCount, filteredQuestions.length)} / {filteredQuestions.length} câu
          </div>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="card" style={{
          padding: '48px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Search size={28} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 700 }}>
            Không tìm thấy câu hỏi phù hợp
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px' }}>
            Không có câu hỏi nào khớp với từ khóa "{query}" hoặc bộ lọc hiện tại.
          </p>
          <button
            onClick={handleResetFilters}
            className="btn btn-primary btn-sm"
            style={{ marginTop: '8px' }}
          >
            Đặt lại tất cả bộ lọc
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {visibleQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              subjectId={currentSubject}
              chapterName={getChapterName(q.section)}
              onLockModal={(_, cardIdx) => setLockedQuestionIndex(cardIdx)}
            />
          ))}

          {/* Load More Button */}
          {displayCount < filteredQuestions.length && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                onClick={() => setDisplayCount((prev) => prev + 25)}
                className="btn btn-secondary btn-lg"
                style={{ minWidth: '220px' }}
              >
                <span>Tải thêm câu hỏi ({filteredQuestions.length - displayCount} câu còn lại)</span>
                <ChevronDown size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Locked Question Modal in Bank Mode (Cố định, không bị trượt trang) */}
      {lockedQuestionIndex !== null && filteredQuestions[lockedQuestionIndex] && (
        <LockedQuestionModal
          isOpen={true}
          onClose={() => setLockedQuestionIndex(null)}
          question={filteredQuestions[lockedQuestionIndex]}
          currentIndex={lockedQuestionIndex}
          totalQuestions={filteredQuestions.length}
          onPrev={() => setLockedQuestionIndex((prev) => Math.max(0, prev - 1))}
          onNext={() => setLockedQuestionIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))}
          isPrevDisabled={lockedQuestionIndex === 0}
          isNextDisabled={lockedQuestionIndex === filteredQuestions.length - 1}
          isBankMode={true}
          chapterName={getChapterName(filteredQuestions[lockedQuestionIndex].section)}
        />
      )}
    </div>
  );
}
