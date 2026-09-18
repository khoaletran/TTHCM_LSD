import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function LockedQuestionModal({
  isOpen,
  onClose,
  question,
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  isPrevDisabled,
  isNextDisabled,
  nextLabel = 'Câu tiếp',
  // Quiz specific props
  selectedAnswer = null,
  onSelectAnswer = null,
  isInstant = false,
  // Bank specific props
  isBankMode = false,
}) {
  const [showAnswerInBank, setShowAnswerInBank] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Lock body scroll when in focus mode
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Reset showAnswerInBank when question changes
  useEffect(() => {
    setShowAnswerInBank(false);
  }, [currentIndex]);

  // Keyboard navigation (Arrow keys, Esc to exit)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && !isNextDisabled) {
        setSlideDirection('right');
        onNext();
      } else if (e.key === 'ArrowLeft' && !isPrevDisabled) {
        setSlideDirection('left');
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, onPrev, isNextDisabled, isPrevDisabled, onClose]);

  // Touch swipe handling
  const minSwipeDistance = 45;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY) * 1.2;

    if (isHorizontal && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0 && !isNextDisabled) {
        setSlideDirection('right');
        onNext();
      } else if (distanceX < 0 && !isPrevDisabled) {
        setSlideDirection('left');
        onPrev();
      }
    }
  };

  if (!isOpen || !question) return null;

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const isAnswered = selectedAnswer !== null && selectedAnswer !== undefined;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        height: '100dvh',
        zIndex: 99999, // Che toàn bộ website và header
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'pan-y'
      }}
    >
      {/* Thanh trên: Chỉ hiển thị số câu #/# và nút Thoát */}
      <div
        style={{
          padding: '12px 18px',
          paddingTop: 'max(14px, env(safe-area-inset-top))',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 10
        }}
      >
        <div style={{
          fontSize: '17px',
          fontWeight: 800,
          color: 'var(--text-main)',
          letterSpacing: '-0.3px'
        }}>
          Câu {currentIndex + 1} / {totalQuestions}
        </div>

        <button
          onClick={onClose}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '6px 14px',
            fontSize: '13.5px',
            fontWeight: 600,
            gap: '6px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border)'
          }}
          title="Thoát chế độ tập trung"
        >
          <X size={16} />
          <span>Thoát</span>
        </button>
      </div>

      {/* Vùng nội dung câu hỏi: Bỏ các badge thông tin phụ, chỉ giữ nội dung câu hỏi & đáp án */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 18px',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          key={currentIndex}
          className={slideDirection === 'right' ? 'animate-slide-right' : 'animate-slide-left'}
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Nội dung câu hỏi (Không hiển thị badge CLO hay thông tin phụ) */}
          <div style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-main)',
            lineHeight: 1.6
          }}>
            {question.q}
          </div>

          {/* Danh sách phương án A, B, C, D */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {question.options.map((opt, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrectAnswer = i === question.answer;

              let btnClass = 'option-btn';
              if (isSelected) btnClass += ' selected';

              if (isInstant && isAnswered) {
                if (isCorrectAnswer) btnClass += ' correct';
                else if (isSelected) btnClass += ' incorrect';
              } else if (isBankMode && showAnswerInBank) {
                if (isCorrectAnswer) btnClass += ' correct';
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectAnswer && onSelectAnswer(i)}
                  className={btnClass}
                  disabled={!onSelectAnswer || (isInstant && isAnswered)}
                  style={{
                    cursor: onSelectAnswer ? 'pointer' : 'default',
                    padding: '14px 18px',
                    fontSize: '16px',
                    lineHeight: 1.55
                  }}
                >
                  <span className="option-circle">
                    {(isInstant && isAnswered && isCorrectAnswer) || (isBankMode && showAnswerInBank && isCorrectAnswer) ? (
                      <Check size={15} />
                    ) : (
                      optionLetters[i]
                    )}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Nút xem đáp án khi ở Ngân hàng câu hỏi */}
          {isBankMode && (
            <div style={{ marginTop: '4px' }}>
              <button
                onClick={() => setShowAnswerInBank(!showAnswerInBank)}
                className={`btn btn-sm ${showAnswerInBank ? 'btn-secondary' : 'btn-primary'}`}
              >
                {showAnswerInBank ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showAnswerInBank ? 'Ẩn đáp án' : 'Xem đáp án & giải thích'}</span>
              </button>
            </div>
          )}

          {/* Giải thích khi làm bài có chấm điểm tức thì */}
          {isInstant && isAnswered && (
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: selectedAnswer === question.answer ? 'var(--success-bg)' : 'var(--error-bg)',
              borderLeft: `4px solid ${selectedAnswer === question.answer ? 'var(--success-solid)' : 'var(--error-solid)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 700,
                color: selectedAnswer === question.answer ? 'var(--success-text)' : 'var(--error-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {selectedAnswer === question.answer ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Chính xác! Đáp án là {optionLetters[question.answer]}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={18} />
                    <span>Chưa đúng! Đáp án đúng là {optionLetters[question.answer]}</span>
                  </>
                )}
              </div>
              {question.explain && (
                <div style={{ fontSize: '14px', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.6 }}>
                  {question.explain}
                </div>
              )}
            </div>
          )}

          {/* Giải thích khi ở Ngân hàng câu hỏi */}
          {isBankMode && showAnswerInBank && question.explain && (
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              borderLeft: '4px solid var(--primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={15} />
                <span>Đáp án đúng: {optionLetters[question.answer]}</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.6 }}>
                {question.explain}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thanh dưới: Chuyển câu trước / sau cố định ở đáy màn hình */}
      <div
        style={{
          padding: '12px 18px',
          paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <div style={{
          maxWidth: '680px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <button
            onClick={() => {
              setSlideDirection('left');
              onPrev();
            }}
            disabled={isPrevDisabled}
            className="btn btn-secondary"
            style={{ minWidth: '110px' }}
          >
            <ArrowLeft size={16} />
            <span>Câu trước</span>
          </button>

          <span style={{ fontSize: '11.5px', color: 'var(--text-subtle)', userSelect: 'none' }}>
            ‹ Vuốt chuyển câu ›
          </span>

          <button
            onClick={() => {
              setSlideDirection('right');
              onNext();
            }}
            className="btn btn-primary"
            style={{ minWidth: '110px' }}
          >
            <span>{nextLabel}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
