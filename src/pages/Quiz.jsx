import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Flag, 
  CheckCircle2, 
  AlertCircle,
  X,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { 
  getAllQuestions, 
  getQuestionsByChapter, 
  getQuestionsBySection,
  shuffleArray,
  prepareQuestion,
  getSectionInfo
} from '../data/repository';
import { 
  recordQuestionResult, 
  saveQuizHistory, 
  getWrongBank 
} from '../utils/storage';
import ConfirmModal from '../components/ConfirmModal';

export default function Quiz({ currentSubject }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get('mode') || 'chapter';
  const chapterId = searchParams.get('chapter') || '';
  const sectionId = searchParams.get('section') || '';
  const countParam = parseInt(searchParams.get('count') || '0', 10);
  const instant = searchParams.get('instant') === '1';
  const shouldShuffle = searchParams.get('shuffle') !== '0';
  const isTimed = searchParams.get('timed') === '1';
  const sessionId = searchParams.get('t') || '';

  const activeSectionInfo = sectionId ? getSectionInfo(sectionId) : null;

  // Load questions for the session
  const questions = useMemo(() => {
    let pool = [];
    const sub = SUBJECTS[currentSubject] || SUBJECTS.tthcm;

    if (mode === 'chapter' && chapterId) {
      if (sectionId && sectionId !== 'all') {
        pool = getQuestionsBySection(currentSubject, sectionId);
      } else {
        pool = getQuestionsByChapter(currentSubject, chapterId);
      }
    } else if (mode === 'midterm') {
      if (currentSubject === 'tthcm') {
        const ch1 = getQuestionsByChapter('tthcm', 'tthcm-ch1');
        const ch2 = getQuestionsByChapter('tthcm', 'tthcm-ch2');
        const ch3 = getQuestionsByChapter('tthcm', 'tthcm-ch3');
        pool = [...ch1, ...ch2, ...ch3];
      } else {
        const q0 = getQuestionsByChapter('lsd', 'mo-dau');
        const q1 = getQuestionsByChapter('lsd', 'ch1');
        const q2 = getAllQuestions('lsd').filter((q) => q.section === 'ch2-1');
        pool = [...q0, ...q1, ...q2];
      }
    } else if (mode === 'final') {
      if (currentSubject === 'tthcm') {
        const ch4 = getQuestionsByChapter('tthcm', 'tthcm-ch4');
        const ch5 = getQuestionsByChapter('tthcm', 'tthcm-ch5');
        const ch6 = getQuestionsByChapter('tthcm', 'tthcm-ch6');
        pool = [...ch4, ...ch5, ...ch6];
      } else {
        const q2 = getQuestionsByChapter('lsd', 'ch2');
        const q3 = getQuestionsByChapter('lsd', 'ch3');
        pool = [...q2, ...q3];
      }
    } else if (mode === 'wrong-bank') {
      const wrongIds = Object.keys(getWrongBank(currentSubject)).map(Number);
      pool = getAllQuestions(currentSubject).filter((q) => wrongIds.includes(q.id));
    } else {
      pool = getAllQuestions(currentSubject);
    }

    if (shouldShuffle) {
      pool = shuffleArray(pool);
    }

    if (countParam > 0 && countParam < pool.length) {
      pool = pool.slice(0, countParam);
    }

    // Luôn luôn xáo trộn các phương án A, B, C, D của từng câu hỏi
    return pool.map(prepareQuestion);
  }, [currentSubject, mode, chapterId, countParam, shouldShuffle, sessionId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: selectedOptionIndex }
  const [flagged, setFlagged] = useState([]); // [index]
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right');

  // Touch swipe states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Timer setup for exam mode
  const initialSeconds = useMemo(() => {
    if (!isTimed) return null;
    return currentSubject === 'tthcm' ? 50 * 60 : 60 * 60;
  }, [isTimed, currentSubject]);

  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  // Timer effect
  useEffect(() => {
    if (!isTimed || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmitFinal();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimed, timeLeft]);

  const formatTime = (seconds) => {
    if (seconds == null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setSlideDirection('right');
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSlideDirection('left');
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions.length]);

  // Touch swipe detection
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
      if (distanceX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const handleSubmitFinal = () => {
    setIsSubmitModalOpen(false);

    let correctCount = 0;
    questions.forEach((q, idx) => {
      const userChoice = answers[idx];
      const isCorrect = userChoice === q.answer;
      if (isCorrect) correctCount++;
      recordQuestionResult(currentSubject, q.id, isCorrect);
    });

    const timeSpent = initialSeconds != null ? initialSeconds - Math.max(0, timeLeft || 0) : null;

    const resultData = {
      subject: currentSubject,
      mode,
      chapterId,
      sectionId,
      sectionTitle: activeSectionInfo?.title || null,
      totalQuestions: questions.length,
      correctCount,
      answers,
      questions,
      timeSpent,
      date: new Date().toISOString(),
    };

    saveQuizHistory({
      subject: currentSubject,
      mode,
      totalQuestions: questions.length,
      correctCount,
      percentage: Math.round((correctCount / questions.length) * 100),
    });

    try {
      sessionStorage.setItem('last_quiz_result', JSON.stringify(resultData));
    } catch {}

    navigate('/result');
  };

  const handleExitConfirm = () => {
    setIsExitModalOpen(false);
    navigate('/practice');
  };

  const unansweredCount = questions.length - Object.values(answers).filter((a) => a != null).length;
  const answeredCount = Object.values(answers).filter((a) => a != null).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (!questions || questions.length === 0) {
    return (
      <div style={{
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div className="card animate-fade-in" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Không có câu hỏi nào trong phạm vi đã chọn.</p>
          <button onClick={() => navigate('/practice')} className="btn btn-primary" style={{ marginTop: '16px' }}>
            Quay lại chọn phạm vi
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedOption = answers[currentIndex];
  const isAnswered = selectedOption !== undefined && selectedOption !== null;
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const handleSelectOption = (optIndex) => {
    if (instant && isAnswered) return;
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIndex,
    }));
  };

  const handleToggleFlag = () => {
    setFlagged((prev) => 
      prev.includes(currentIndex) ? prev.filter((i) => i !== currentIndex) : [...prev, currentIndex]
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-main)',
    }}>
      {/* 1. TOP BAR: Chỉ hiển thị số câu #/#, Timer (nếu có), và nút Thoát */}
      <div style={{
        padding: '10px 16px',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 20,
        position: 'relative'
      }}>
        {/* Số câu #/# và Huy hiệu mục (nếu có) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <button
            onClick={() => setIsNavDrawerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: '9999px',
              padding: '5px 12px',
              cursor: 'pointer',
              color: 'var(--text-main)',
              fontWeight: 800,
              fontSize: '14.5px',
              flexShrink: 0
            }}
            title="Xem danh sách tất cả câu hỏi"
          >
            <span>Câu {currentIndex + 1} / {questions.length}</span>
            <LayoutGrid size={14} style={{ color: 'var(--text-subtle)' }} />
          </button>

          {activeSectionInfo && (
            <span className="badge badge-primary" style={{
              fontSize: '11.5px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '120px'
            }} title={activeSectionInfo.title}>
              {activeSectionInfo.code || activeSectionInfo.shortTitle}
            </span>
          )}
        </div>

        {/* Đồng hồ đếm ngược (nếu có) */}
        {isTimed && timeLeft != null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: 700,
            color: timeLeft < 300 ? 'var(--error-solid)' : 'var(--text-main)',
            backgroundColor: timeLeft < 300 ? 'var(--error-bg)' : 'transparent',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            flexShrink: 0
          }}>
            <Clock size={15} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}

        {/* Nút Nộp bài sớm, đánh dấu & Nút Thoát */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{
              backgroundColor: 'var(--success-solid)',
              borderColor: 'var(--success-solid)',
              color: '#ffffff',
              padding: '5px 12px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Nộp bài và chấm điểm ngay (kể cả khi chưa làm hết tất cả)"
          >
            <Check size={14} />
            <span>Nộp bài</span>
          </button>

          <button
            onClick={handleToggleFlag}
            className="btn btn-ghost btn-sm"
            style={{
              color: flagged.includes(currentIndex) ? 'var(--gold-dark)' : 'var(--text-subtle)',
              padding: '6px'
            }}
            title={flagged.includes(currentIndex) ? 'Bỏ đánh dấu xem lại' : 'Đánh dấu câu hỏi để xem lại'}
          >
            <Flag size={17} fill={flagged.includes(currentIndex) ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={() => setIsExitModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '5px 10px',
              fontSize: '13px',
              fontWeight: 600,
              gap: '3px',
              borderRadius: '9999px'
            }}
            title="Thoát bài làm"
          >
            <X size={14} />
            <span>Thoát</span>
          </button>
        </div>

        {/* Thanh tiến độ mảnh nằm ngay dưới top bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2.5px',
          backgroundColor: 'var(--border)'
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: 'var(--primary)',
            transition: 'width 0.2s ease'
          }} />
        </div>
      </div>

      {/* 2. MAIN SCROLL BODY: Không bị tràng, chỉ cuộn nội dung câu hỏi */}
      <div
        className="quiz-scroll-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          padding: '18px 16px 24px 16px',
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
            gap: '18px'
          }}
        >
          {/* Nội dung câu hỏi: Hoàn toàn bỏ bớt badge CLO và thông tin thừa, chỉ tập trung vào câu hỏi */}
          <div style={{
            fontSize: '17.5px',
            fontWeight: 700,
            color: 'var(--text-main)',
            lineHeight: 1.6
          }}>
            {currentQ.q}
          </div>

          {/* Các lựa chọn đáp án A, B, C, D */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrectAnswer = i === currentQ.answer;

              let btnClass = 'option-btn';
              if (isSelected) btnClass += ' selected';

              if (instant && isAnswered) {
                if (isCorrectAnswer) btnClass += ' correct';
                else if (isSelected) btnClass += ' incorrect';
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectOption(i)}
                  className={btnClass}
                  disabled={instant && isAnswered}
                  style={{
                    padding: '13px 16px',
                    fontSize: '15.5px',
                    lineHeight: 1.55,
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <span className="option-circle">
                    {instant && isAnswered && isCorrectAnswer ? <Check size={14} /> : optionLetters[i]}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Giải thích câu hỏi khi làm bài chế độ Chấm điểm tức thì (Instant mode) */}
          {instant && isAnswered && (
            <div style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: selectedOption === currentQ.answer ? 'var(--success-bg)' : 'var(--error-bg)',
              borderLeft: `4px solid ${selectedOption === currentQ.answer ? 'var(--success-solid)' : 'var(--error-solid)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '4px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 700,
                color: selectedOption === currentQ.answer ? 'var(--success-text)' : 'var(--error-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {selectedOption === currentQ.answer ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Chính xác! Đáp án đúng là {optionLetters[currentQ.answer]}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={18} />
                    <span>Chưa đúng! Đáp án đúng là {optionLetters[currentQ.answer]}</span>
                  </>
                )}
              </div>
              {currentQ.explain && (
                <div style={{ fontSize: '14px', color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.55 }}>
                  {currentQ.explain}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM BAR: Cố định ở đáy màn hình điện thoại, nút bấm to vừa tầm ngón tay cái */}
      <div style={{
        padding: '10px 16px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        flexShrink: 0,
        zIndex: 20
      }}>
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
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn btn-secondary"
            style={{ 
              flex: 1, 
              maxWidth: '135px', 
              height: '42px', 
              fontWeight: 600,
              fontSize: '14px' 
            }}
          >
            <ArrowLeft size={16} />
            <span>Câu trước</span>
          </button>

          <button
            onClick={() => setIsNavDrawerOpen(true)}
            className="btn btn-ghost"
            style={{ 
              fontSize: '12.5px', 
              color: 'var(--text-subtle)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '1px',
              padding: '2px 8px'
            }}
            title="Mở danh sách câu hỏi"
          >
            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>
              {answeredCount}/{questions.length}
            </span>
            <span style={{ fontSize: '10.5px' }}>Danh sách</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="btn btn-primary"
              style={{ 
                flex: 1, 
                maxWidth: '135px', 
                height: '42px', 
                fontWeight: 600,
                fontSize: '14px' 
              }}
            >
              <span>Câu tiếp</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="btn btn-primary"
              style={{ 
                flex: 1, 
                maxWidth: '135px', 
                height: '42px', 
                fontWeight: 600,
                fontSize: '14px',
                backgroundColor: 'var(--success-solid)',
                borderColor: 'var(--success-solid)'
              }}
            >
              <span>Nộp bài</span>
              <Check size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 4. MODAL XÁC NHẬN THOÁT */}
      {isExitModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(2px)',
          padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{
            maxWidth: '380px',
            width: '100%',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
              Xác nhận thoát bài làm?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Tiến độ làm bài của bạn sẽ không được lưu nếu bạn thoát ngay bây giờ. Bạn có chắc chắn muốn quay lại không?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => setIsExitModalOpen(false)}
                className="btn btn-secondary"
                style={{ minWidth: '100px' }}
              >
                Ở lại làm
              </button>
              <button
                onClick={handleExitConfirm}
                className="btn btn-primary"
                style={{ minWidth: '100px', backgroundColor: 'var(--error-solid)', borderColor: 'var(--error-solid)' }}
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL XÁC NHẬN NỘP BÀI */}
      <ConfirmModal
        isOpen={isSubmitModalOpen}
        unansweredCount={unansweredCount}
        totalQuestions={questions.length}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmitFinal}
      />

      {/* 6. BOTTOM SHEET: DANH SÁCH TẤT CẢ CÂU HỎI */}
      {isNavDrawerOpen && (
        <div 
          className="quiz-drawer-overlay"
          onClick={() => setIsNavDrawerOpen(false)}
        >
          <div 
            className="quiz-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '18px',
              paddingBottom: 'max(18px, env(safe-area-inset-bottom))'
            }}
          >
            {/* Sheet Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Danh sách câu hỏi</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-subtle)', marginTop: '2px' }}>
                  Đã làm: {answeredCount}/{questions.length} • Còn lại: {unansweredCount} câu
                </p>
              </div>
              <button
                onClick={() => setIsNavDrawerOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Chú thích màu sắc */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--primary)' }} />
                <span>Đã làm</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }} />
                <span>Chưa làm</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: 'var(--gold)' }} />
                <span>Đánh dấu</span>
              </div>
            </div>

            {/* Grid các số câu hỏi */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
              gap: '8px',
              maxHeight: '48vh',
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {questions.map((_, idx) => {
                const isAns = answers[idx] != null;
                const isCurr = currentIndex === idx;
                const isFlag = flagged.includes(idx);

                let cellClass = 'quiz-num-cell';
                if (isAns) cellClass += ' answered';
                if (isCurr) cellClass += ' current';
                if (isFlag) cellClass += ' flagged';

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSlideDirection(idx > currentIndex ? 'right' : 'left');
                      setCurrentIndex(idx);
                      setIsNavDrawerOpen(false);
                    }}
                    className={cellClass}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Nút Nộp bài bên trong Sheet */}
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
              <button
                onClick={() => {
                  setIsNavDrawerOpen(false);
                  setIsSubmitModalOpen(true);
                }}
                className="btn btn-primary"
                style={{ width: '100%', height: '42px', fontWeight: 600 }}
              >
                <span>Nộp bài ngay</span>
                <Check size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
