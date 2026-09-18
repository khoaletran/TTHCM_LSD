import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Clock,
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
  timeLeft = null,
  // Bank specific props
  isBankMode = false,
  chapterName = '',
}) {
  const [showAnswerInBank, setShowAnswerInBank] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Lock body scroll when modal is open
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

  // Keyboard navigation
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

  const formatTime = (secs) => {
    if (secs == null) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y'
      }}
      onClick={(e) => {
        // Prevent background click from accidentally closing if user wants locked experience,
        // or let them use the explicit Unlock button
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid var(--primary)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          overscrollBehavior: 'contain',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Lock Header */}
        <div style={{
          padding: '14px 20px',
          backgroundColor: 'var(--primary-light)',
          borderBottom: '1.5px solid var(--primary-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 700
            }}>
              <Lock size={13} />
              <span>Đã khóa câu hỏi</span>
            </span>

            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--primary)' }}>
              Câu {currentIndex + 1} / {totalQuestions}
            </span>

            {chapterName && (
              <span className="badge" style={{ display: 'none' }}>
                {chapterName}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {timeLeft !== null && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '13px',
                fontWeight: 700,
                color: timeLeft < 300 ? 'var(--error-text)' : 'var(--text-main)',
                backgroundColor: 'var(--bg-card)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)'
              }}>
                <Clock size={14} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--primary-border)',
                color: 'var(--primary)',
                fontWeight: 600,
                gap: '5px'
              }}
              title="Mở khóa và quay lại giao diện thường"
            >
              <Unlock size={14} />
              <span>Mở khóa</span>
            </button>
          </div>
        </div>

        {/* Scrollable Question Content (contained, won't bounce page) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 22px',
            overscrollBehavior: 'contain',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Animated Question Block */}
          <div
            key={currentIndex}
            className={slideDirection === 'right' ? 'animate-slide-right' : 'animate-slide-left'}
            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            {/* Meta Tags */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-primary">
                  Câu {currentIndex + 1}
                </span>
                {question.clo && (
                  <span className="badge badge-gold">
                    CLO {question.clo}
                  </span>
                )}
                {chapterName && (
                  <span className="badge">
                    {chapterName}
                  </span>
                )}
              </div>

              {isBankMode && (
                <button
                  onClick={() => setShowAnswerInBank(!showAnswerInBank)}
                  className={`btn btn-sm ${showAnswerInBank ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ fontSize: '12.5px', padding: '4px 10px' }}
                >
                  {showAnswerInBank ? (
                    <>
                      <EyeOff size={14} />
                      <span>Ẩn đáp án</span>
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      <span>Xem đáp án</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Question Text */}
            <div style={{
              fontSize: '17.5px',
              fontWeight: 600,
              color: 'var(--text-main)',
              lineHeight: 1.6
            }}>
              {question.q}
            </div>

            {/* Options List */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '11px' }}>
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
                      padding: '13px 16px'
                    }}
                  >
                    <span className="option-circle">
                      {(isInstant && isAnswered && isCorrectAnswer) || (isBankMode && showAnswerInBank && isCorrectAnswer) ? (
                        <Check size={14} />
                      ) : (
                        optionLetters[i]
                      )}
                    </span>
                    <span style={{ flex: 1, fontSize: '15px' }}>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Instant feedback (Quiz mode) */}
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
                  <div style={{ fontSize: '13.5px', color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.55 }}>
                    {question.explain}
                  </div>
                )}
              </div>
            )}

            {/* Bank explanation box */}
            {isBankMode && showAnswerInBank && question.explain && (
              <div style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                borderLeft: '4px solid var(--primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
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

        {/* Modal Bottom Controls */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: '10px'
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

          <div style={{
            fontSize: '11.5px',
            color: 'var(--text-subtle)',
            userSelect: 'none',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            <span>‹ Vuốt trái/phải để chuyển câu ›</span>
            <span style={{ opacity: 0.75 }}>Khung cố định, không trượt trang</span>
          </div>

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
