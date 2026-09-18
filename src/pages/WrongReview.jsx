import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  Play, 
  Layers, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { getAllQuestions, prepareQuestion, prepareQuestions } from '../data/repository';
import { getWrongBank, clearWrongBank } from '../utils/storage';
import QuestionCard from '../components/QuestionCard';

export default function WrongReview({ currentSubject }) {
  const navigate = useNavigate();
  const [bankRefresh, setBankRefresh] = useState(0);

  const sub = SUBJECTS[currentSubject] || SUBJECTS.tthcm;
  const allQuestions = useMemo(() => getAllQuestions(currentSubject), [currentSubject]);

  const wrongEntries = useMemo(() => {
    const rawBank = getWrongBank(currentSubject);
    const wrongIds = Object.keys(rawBank).map(Number);
    const matched = allQuestions.filter((q) => wrongIds.includes(q.id));
    return prepareQuestions(matched).map((q) => ({
      ...q,
      wrongCount: rawBank[String(q.id)]?.wrongCount || 1,
      lastFailedAt: rawBank[String(q.id)]?.lastFailedAt || null,
    }));
  }, [currentSubject, allQuestions, bankRefresh]);

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử câu sai của môn này?')) {
      clearWrongBank(currentSubject);
      setBankRefresh((prev) => prev + 1);
    }
  };

  const handlePracticeWrong = () => {
    if (wrongEntries.length === 0) return;
    // Save wrong questions list into a custom practice run
    const params = new URLSearchParams();
    params.set('mode', 'wrong-bank');
    params.set('subject', currentSubject);
    params.set('count', String(wrongEntries.length));
    params.set('instant', '1'); // Study mode with instant feedback
    params.set('shuffle', '1');
    params.set('t', String(Date.now()));

    navigate(`/quiz?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-primary">{sub.shortName}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>
              Kho dữ liệu học tập cá nhân
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
            Ôn luyện câu hay sai
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tự động lưu lại các câu bạn đã trả lời sai trong quá trình luyện tập và thi thử để ôn tập dứt điểm.
          </p>
        </div>

        {wrongEntries.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePracticeWrong}
              className="btn btn-primary btn-md"
            >
              <Play size={16} />
              <span>Luyện lại {wrongEntries.length} câu này</span>
            </button>
            <button
              onClick={handleClearAll}
              className="btn btn-ghost btn-md"
              style={{ color: 'var(--error-text)', border: '1px solid var(--border)' }}
              title="Xóa danh sách câu sai"
            >
              <Trash2 size={16} />
              <span>Làm sạch danh sách</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {wrongEntries.length === 0 ? (
        <div className="card" style={{
          padding: '48px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success-solid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
            Không có câu hỏi nào bị sai!
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.55 }}>
            Tuyệt vời! Bạn chưa từng trả lời sai câu nào, hoặc đã hoàn thành ôn tập đúng tất cả câu trong lần luyện gần nhất.
          </p>
          <button
            onClick={() => navigate('/practice')}
            className="btn btn-primary"
            style={{ marginTop: '8px' }}
          >
            Luyện tập ngay một đề mới
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            color: 'var(--warning-text)',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>
              Mỗi khi bạn trả lời <strong>ĐÚNG</strong> một câu trong quá trình làm bài, câu đó sẽ tự động được gỡ khỏi danh sách này.
            </span>
          </div>

          {wrongEntries.map((q, idx) => (
            <div key={q.id} style={{ position: 'relative' }}>
              <QuestionCard
                question={q}
                index={idx}
                subjectId={currentSubject}
                chapterName={`Đã sai ${q.wrongCount} lần`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
