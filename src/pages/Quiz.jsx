import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  HelpCircle, 
  Bookmark, 
  Flag, 
  CheckCircle2, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { 
  getAllQuestions, 
  getQuestionsByChapter, 
  shuffleArray 
} from '../data/repository';
import { 
  recordQuestionResult, 
  saveQuizHistory, 
  isBookmarked, 
  toggleBookmark,
  getWrongBank 
} from '../utils/storage';
import ProgressBar from '../components/ProgressBar';
import QuizNavigator from '../components/QuizNavigator';
import ConfirmModal from '../components/ConfirmModal';

export default function Quiz({ currentSubject }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get('mode') || 'chapter';
  const chapterId = searchParams.get('chapter') || '';
  const countParam = parseInt(searchParams.get('count') || '20', 10);
  const instant = searchParams.get('instant') === '1';
  const shouldShuffle = searchParams.get('shuffle') !== '0';
  const isTimed = searchParams.get('timed') === '1';

  // Load questions for the session
  const questions = useMemo(() => {
    let pool = [];
    const sub = SUBJECTS[currentSubject] || SUBJECTS.tthcm;

    if (mode === 'chapter' && chapterId) {
      pool = getQuestionsByChapter(currentSubject, chapterId);
    } else if (mode === 'midterm') {
      // Scopes from new.html:
      // TTHCM: Chapters 1-3
      // LSD: mo-dau, ch1, ch2 part 1
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
      // TTHCM: Chapters 4-6
      // LSD: ch2-1, ch2-2, ch3-1, ch3-2
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

    return pool;
  }, [currentSubject, mode, chapterId, countParam, shouldShuffle]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: selectedOptionIndex }
  const [flagged, setFlagged] = useState([]); // [index]
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right'); // 'right' for next, 'left' for prev

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
      // Auto submit on time out
      handleSubmitFinal();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimed, timeLeft]);

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
    // Verify movement is predominantly horizontal
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY) * 1.2;

    if (isHorizontal && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // Swiped left (ngón tay vuốt từ phải sang trái) -> chuyển câu sau
        handleNext();
      } else {
        // Swiped right (ngón tay vuốt từ trái sang phải) -> chuyển câu trước
        handlePrev();
      }
    }
  };

  const handleSubmitFinal = () => {
    setIsSubmitModalOpen(false);

    // Calculate score
    let correctCount = 0;
    const details = questions.map((q, idx) => {
      const userChoice = answers[idx];
      const isCorrect = userChoice === q.answer;
      if (isCorrect) correctCount++;

      // Record in local wrong bank
      recordQuestionResult(currentSubject, q.id, isCorrect);

      return {
        questionId: q.id,
        userAnswer: userChoice ?? null,
        correctAnswer: q.answer,
        isCorrect,
      };
    });

    const timeSpent = initialSeconds != null ? initialSeconds - Math.max(0, timeLeft || 0) : null;

    const resultData = {
      subject: currentSubject,
      mode,
      totalQuestions: questions.length,
      correctCount,
      answers,
      questions,
      timeSpent,
      date: new Date().toISOString(),
    };

    // Save history
    saveQuizHistory({
      subject: currentSubject,
      mode,
      totalQuestions: questions.length,
      correctCount,
      percentage: Math.round((correctCount / questions.length) * 100),
    });

    // Save session in sessionStorage for the Result page
    try {
      sessionStorage.setItem('last_quiz_result', JSON.stringify(resultData));
    } catch {}

    navigate('/result');
  };

  const unansweredCount = questions.length - Object.values(answers).filter((a) => a != null).length;

  if (!questions || questions.length === 0) {
    return (
      <div className="card animate-fade-in" style={{ padding: '36px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Không có câu hỏi nào trong phạm vi đã chọn.</p>
        <button onClick={() => navigate('/practice')} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Quay lại chọn phạm vi
        </button>
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
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px',
      alignItems: 'start'
    }} className="quiz-layout animate-fade-in">
      {/* Main Question Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Progress Header */}
        <ProgressBar
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          timeLeft={timeLeft}
        />

        {/* Mobile Swipe Hint */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
          fontSize: '12px',
          color: 'var(--text-subtle)',
          userSelect: 'none'
        }}>
          <span>‹ Vuốt phải: Câu trước</span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>Vuốt hoặc dùng phím mũi tên ← →</span>
          <span>Vuốt trái: Câu sau ›</span>
        </div>

        {/* Question Card with Touch Swipe & Slide Animation */}
        <div
          key={currentIndex}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`card touch-swipe-zone ${slideDirection === 'right' ? 'animate-slide-right' : 'animate-slide-left'}`}
          style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Card Top Meta */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-primary">
                Câu {currentIndex + 1}
              </span>
              {currentQ.clo && (
                <span className="badge badge-gold">
                  CLO {currentQ.clo}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleToggleFlag}
                className="btn btn-ghost btn-sm"
                style={{
                  color: flagged.includes(currentIndex) ? 'var(--gold-dark)' : 'var(--text-subtle)',
                  padding: '6px'
                }}
                title={flagged.includes(currentIndex) ? 'Bỏ đánh dấu xem lại' : 'Đánh dấu để xem lại sau'}
              >
                <Flag size={17} fill={flagged.includes(currentIndex) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div style={{
            fontSize: '17px',
            fontWeight: 600,
            color: 'var(--text-main)',
            lineHeight: 1.6
          }}>
            {currentQ.q}
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
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
                >
                  <span className="option-circle">
                    {instant && isAnswered && isCorrectAnswer ? <Check size={14} /> : optionLetters[i]}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Instant Feedback Box */}
          {instant && isAnswered && (
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: selectedOption === currentQ.answer ? 'var(--success-bg)' : 'var(--error-bg)',
              borderLeft: `4px solid ${selectedOption === currentQ.answer ? 'var(--success-solid)' : 'var(--error-solid)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
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
                <div style={{ fontSize: '13.5px', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.55 }}>
                  {currentQ.explain}
                </div>
              )}
            </div>
          )}

          {/* Bottom Nav Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border)',
            paddingTop: '18px',
            marginTop: '4px'
          }}>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} />
              <span>Câu trước</span>
            </button>

            <button
              onClick={handleNext}
              className="btn btn-primary"
            >
              <span>{currentIndex === questions.length - 1 ? 'Nộp bài' : 'Câu tiếp'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar Navigator */}
      <div className="quiz-sidebar">
        <QuizNavigator
          totalQuestions={questions.length}
          currentIndex={currentIndex}
          answers={answers}
          flagged={flagged}
          onSelectIndex={(idx) => setCurrentIndex(idx)}
          onSubmit={() => setIsSubmitModalOpen(true)}
        />
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isSubmitModalOpen}
        unansweredCount={unansweredCount}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmitFinal}
      />

      <style>{`
        @media (min-width: 900px) {
          .quiz-layout {
            grid-template-columns: 1fr 310px !important;
          }
        }
      `}</style>
    </div>
  );
}
