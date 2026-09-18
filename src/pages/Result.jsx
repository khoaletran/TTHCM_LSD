import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  Layers, 
  Filter, 
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';

export default function Result() {
  const navigate = useNavigate();

  const sessionData = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('last_quiz_result');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [filterMode, setFilterMode] = useState('all'); // 'all', 'wrong', 'correct'
  const [wrongReviewIndex, setWrongReviewIndex] = useState(0);

  if (!sessionData) {
    return (
      <div className="card animate-fade-in" style={{ padding: '36px', textAlign: 'center' }}>
        <h2>Không có dữ liệu kết quả</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Bạn chưa hoàn thành bài làm nào gần đây.
        </p>
        <button onClick={() => navigate('/practice')} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Bắt đầu luyện tập
        </button>
      </div>
    );
  }

  const {
    subject,
    mode,
    totalQuestions,
    correctCount,
    answers,
    questions,
    timeSpent,
  } = sessionData;

  const answeredCount = Object.values(answers).filter((a) => a !== null && a !== undefined).length;
  const skippedCount = totalQuestions - answeredCount;
  const wrongCount = totalQuestions - correctCount - skippedCount;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const score10 = ((correctCount / totalQuestions) * 10).toFixed(1);

  const sub = SUBJECTS[subject] || SUBJECTS.tthcm;
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Filtered review questions
  const reviewQuestions = useMemo(() => {
    return questions.map((q, idx) => {
      const userAns = answers[idx];
      const isCorrect = userAns === q.answer;
      const isSkipped = userAns === undefined || userAns === null;
      return {
        ...q,
        originalIndex: idx,
        userAns,
        isCorrect,
        isSkipped,
      };
    });
  }, [questions, answers]);

  const displayedList = useMemo(() => {
    if (filterMode === 'wrong') {
      return reviewQuestions.filter((q) => !q.isCorrect);
    }
    if (filterMode === 'correct') {
      return reviewQuestions.filter((q) => q.isCorrect);
    }
    return reviewQuestions;
  }, [reviewQuestions, filterMode]);

  const formatTime = (secs) => {
    if (secs == null) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} phút ${s} giây`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Result Score Card */}
      <div className="card" style={{
        padding: '32px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        background: 'linear-gradient(180deg, var(--bg-card), var(--bg-subtle))',
        borderTop: '6px solid var(--primary)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          backgroundColor: percentage >= 70 ? 'var(--success-bg)' : percentage >= 50 ? 'var(--warning-bg)' : 'var(--error-bg)',
          color: percentage >= 70 ? 'var(--success-solid)' : percentage >= 50 ? 'var(--warning-text)' : 'var(--error-solid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <Trophy size={32} />
        </div>

        <div>
          <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
            {sub.shortName} • {mode === 'midterm' ? 'Thi giữa kỳ' : mode === 'final' ? 'Thi cuối kỳ' : 'Luyện tập'}
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>
            Kết quả bài làm
          </h1>
        </div>

        {/* Big Score Numbers */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: '8px',
          margin: '4px 0'
        }}>
          <span style={{ fontSize: '48px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px' }}>
            {correctCount}
          </span>
          <span style={{ fontSize: '24px', color: 'var(--text-subtle)', fontWeight: 600 }}>
            / {totalQuestions}
          </span>
          <span style={{
            fontSize: '18px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: percentage >= 70 ? 'var(--success-bg)' : 'var(--bg-subtle)',
            color: percentage >= 70 ? 'var(--success-text)' : 'var(--text-main)',
            marginLeft: '8px'
          }}>
            {percentage}% (Điểm: {score10}/10)
          </span>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '12px',
          width: '100%',
          maxWidth: '520px',
          marginTop: '8px'
        }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success-text)' }}>{correctCount}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success-text)' }}>Câu đúng</div>
          </div>

          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--error-text)' }}>{wrongCount}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--error-text)' }}>Câu sai</div>
          </div>

          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-muted)' }}>{skippedCount}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Bỏ trống</div>
          </div>

          {timeSpent !== null && (
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{formatTime(timeSpent)}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Thời gian</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '12px'
        }}>
          <button
            onClick={() => navigate('/practice')}
            className="btn btn-primary btn-md"
          >
            <RotateCcw size={16} />
            <span>Luyện tiếp bài khác</span>
          </button>

          {wrongCount + skippedCount > 0 && (
            <button
              onClick={() => setFilterMode('wrong')}
              className="btn btn-secondary btn-md"
            >
              <XCircle size={16} color="var(--error-solid)" />
              <span>Xem {wrongCount + skippedCount} câu sai</span>
            </button>
          )}

          <button
            onClick={() => navigate('/bank')}
            className="btn btn-ghost btn-md"
            style={{ border: '1px solid var(--border)' }}
          >
            <Layers size={16} />
            <span>Về ngân hàng câu hỏi</span>
          </button>
        </div>
      </div>

      {/* Review Section */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '19px', fontWeight: 800 }}>
              Xem lại chi tiết bài làm
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Kiểm tra lại lựa chọn của bạn và so sánh với đáp án chuẩn
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setFilterMode('all')}
              className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Tất cả ({totalQuestions})
            </button>
            <button
              onClick={() => setFilterMode('wrong')}
              className={`btn btn-sm ${filterMode === 'wrong' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Câu sai ({wrongCount + skippedCount})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`btn btn-sm ${filterMode === 'correct' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Câu đúng ({correctCount})
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayedList.map((q) => {
            const userChoice = q.userAns;
            const isCorrect = q.isCorrect;
            const isSkipped = q.isSkipped;

            return (
              <div
                key={q.id}
                className="card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderLeft: `4px solid ${isCorrect ? 'var(--success-solid)' : 'var(--error-solid)'}`
                }}
              >
                {/* Status Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-primary">
                      Câu {q.originalIndex + 1}
                    </span>

                    {isCorrect ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={13} />
                        Trả lời đúng
                      </span>
                    ) : isSkipped ? (
                      <span className="badge" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        Chưa chọn đáp án
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', borderColor: 'var(--error-border)' }}>
                        <XCircle size={13} />
                        Trả lời sai
                      </span>
                    )}
                  </div>
                </div>

                {/* Question */}
                <div style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.55 }}>
                  {q.q}
                </div>

                {/* Options Review */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {q.options.map((opt, optIdx) => {
                    const isUserChoice = userChoice === optIdx;
                    const isAnswerKey = optIdx === q.answer;

                    let bg = 'var(--bg-card)';
                    let border = '1.5px solid var(--border)';
                    let color = 'var(--text-main)';

                    if (isAnswerKey) {
                      bg = 'var(--success-bg)';
                      border = '1.5px solid var(--success-solid)';
                      color = 'var(--success-text)';
                    } else if (isUserChoice && !isCorrect) {
                      bg = 'var(--error-bg)';
                      border = '1.5px solid var(--error-solid)';
                      color = 'var(--error-text)';
                    }

                    return (
                      <div
                        key={optIdx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: bg,
                          border: border,
                          color: color,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          lineHeight: 1.5
                        }}
                      >
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: isAnswerKey ? 'var(--success-solid)' : isUserChoice ? 'var(--error-solid)' : 'var(--bg-subtle)',
                          color: isAnswerKey || isUserChoice ? '#fff' : 'var(--text-muted)',
                          fontWeight: 700,
                          fontSize: '11px',
                          flexShrink: 0
                        }}>
                          {optionLetters[optIdx]}
                        </span>
                        <div style={{ flex: 1 }}>{opt}</div>
                        {isUserChoice && (
                          <span style={{ fontSize: '12px', fontWeight: 700, alignSelf: 'center' }}>
                            (Bạn chọn)
                          </span>
                        )}
                        {isAnswerKey && (
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success-text)', alignSelf: 'center' }}>
                            (Đáp án đúng)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explain && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-light)',
                    borderLeft: '3px solid var(--primary)',
                    fontSize: '13.5px',
                    color: 'var(--text-main)',
                    lineHeight: 1.55
                  }}>
                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '2px' }}>
                      Giải thích:
                    </strong>
                    {q.explain}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
