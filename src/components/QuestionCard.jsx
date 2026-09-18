import React, { useState } from 'react';
import { Bookmark, Eye, EyeOff, Check, CheckCircle2, HelpCircle, Maximize2 } from 'lucide-react';
import { isBookmarked, toggleBookmark } from '../utils/storage';

export default function QuestionCard({ 
  question, 
  index, 
  subjectId, 
  chapterName, 
  onBookmarkToggle,
  onLockModal
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(subjectId, question.id));

  const handleBookmark = (e) => {
    e.stopPropagation();
    const updated = toggleBookmark(subjectId, question.id);
    setBookmarked(updated);
    if (onBookmarkToggle) onBookmarkToggle(question.id, updated);
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="card animate-fade-in" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative'
    }}>
      {/* Meta header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-primary">
            Câu {index != null ? index + 1 : question.id}
          </span>

          {chapterName && (
            <span className="badge" style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {chapterName}
            </span>
          )}

          {question.clo && (
            <span className="badge badge-gold" title={`Chuẩn đầu ra CLO ${question.clo}`}>
              CLO {question.clo}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onLockModal && (
            <button
              onClick={() => onLockModal(question, index)}
              className="btn btn-ghost btn-sm"
              style={{ 
                padding: '6px', 
                color: 'var(--primary)' 
              }}
              title="Chế độ tập trung toàn màn hình (không trượt trang)"
            >
              <Maximize2 size={17} />
            </button>
          )}

          <button
            onClick={handleBookmark}
            className="btn btn-ghost btn-sm"
            style={{ 
              padding: '6px', 
              color: bookmarked ? 'var(--primary)' : 'var(--text-subtle)' 
            }}
            title={bookmarked ? 'Bỏ đánh dấu' : 'Lưu câu hỏi này'}
          >
            <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className={`btn btn-sm ${showAnswer ? 'btn-secondary' : 'btn-primary'}`}
            style={{ fontSize: '13px', padding: '6px 12px' }}
          >
            {showAnswer ? (
              <>
                <EyeOff size={15} />
                <span>Ẩn đáp án</span>
              </>
            ) : (
              <>
                <Eye size={15} />
                <span>Xem đáp án</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Question Content */}
      <div style={{
        fontSize: '16px',
        fontWeight: 600,
        color: 'var(--text-main)',
        lineHeight: 1.6
      }}>
        {question.q}
      </div>

      {/* Options List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '10px'
      }}>
        {question.options.map((opt, i) => {
          const isCorrect = i === question.answer;
          let optStyle = {
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)',
            fontSize: '14.5px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            lineHeight: 1.5,
            transition: 'all 0.15s ease'
          };

          if (showAnswer) {
            if (isCorrect) {
              optStyle = {
                ...optStyle,
                border: '1.5px solid var(--success-solid)',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success-text)',
                fontWeight: 600
              };
            }
          }

          return (
            <div key={i} style={optStyle}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: showAnswer && isCorrect ? 'var(--success-solid)' : 'var(--bg-subtle)',
                color: showAnswer && isCorrect ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '12px',
                flexShrink: 0
              }}>
                {showAnswer && isCorrect ? <Check size={14} /> : optionLetters[i]}
              </span>
              <div style={{ flex: 1 }}>{opt}</div>
            </div>
          );
        })}
      </div>

      {/* Explanation Box when revealed */}
      {showAnswer && question.explain && (
        <div style={{
          marginTop: '4px',
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--primary-light)',
          borderLeft: '4px solid var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.4px'
          }}>
            <HelpCircle size={15} />
            <span>Giải thích đáp án ({optionLetters[question.answer]})</span>
          </div>
          <div style={{
            fontSize: '14px',
            color: 'var(--text-main)',
            lineHeight: 1.6
          }}>
            {question.explain}
          </div>
        </div>
      )}
    </div>
  );
}
