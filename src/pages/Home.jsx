import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  Flame, 
  Award,
  GraduationCap,
  FileQuestion,
  ChevronRight
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { getSubjectStats, getGlobalStats } from '../data/repository';
import { getWrongBank, getBookmarks } from '../utils/storage';

export default function Home({ currentSubject, onSelectSubject }) {
  const navigate = useNavigate();
  const subStats = getSubjectStats(currentSubject);
  const globalStats = getGlobalStats();
  const wrongCount = Object.keys(getWrongBank(currentSubject)).length;
  const bookmarkCount = getBookmarks(currentSubject).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      {/* Hero Section */}
      <div className="card" style={{
        padding: '36px 28px',
        background: 'linear-gradient(135deg, var(--bg-card), var(--bg-subtle))',
        borderLeft: '5px solid var(--primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-primary">
            <GraduationCap size={14} />
            Học tập & Luyện thi thông minh
          </span>
          <span className="badge" style={{ backgroundColor: 'var(--bg-card)' }}>
            100% Miễn phí &amp; Không cần đăng nhập
          </span>
        </div>

        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Hỗ trợ ôn tập {subStats?.name}
          </h1>
          <p style={{ fontSize: '15.5px', color: 'var(--text-muted)', maxWidth: '720px', lineHeight: 1.6 }}>
            Ngân hàng câu hỏi trắc nghiệm chuẩn chỉnh, bao quát toàn bộ đề cương học phần.
            Luyện tập theo chương, làm bài thi thử có tính giờ hoặc tra cứu đáp án và giải thích chi tiết.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => navigate('/practice')}
            className="btn btn-primary btn-lg"
          >
            <CheckCircle2 size={18} />
            <span>Luyện tập ngay</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => navigate('/bank')}
            className="btn btn-secondary btn-lg"
          >
            <Layers size={18} />
            <span>Xem ngân hàng câu hỏi</span>
          </button>

          <button
            onClick={() => navigate('/flashcards')}
            className="btn btn-ghost btn-lg"
            style={{ border: '1px solid var(--border)' }}
          >
            <Sparkles size={18} color="var(--gold-dark)" />
            <span>Thẻ ghi nhớ</span>
          </button>
        </div>
      </div>

      {/* Subject Switcher Cards */}
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '14px' 
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
            Chọn học phần ôn tập
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>
            Tổng cộng: {globalStats.totalQuestions} câu hỏi
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {['tthcm', 'lsd'].map((subKey) => {
            const sub = SUBJECTS[subKey];
            const isSelected = currentSubject === subKey;
            const count = subKey === 'tthcm' ? globalStats.tthcm.count : globalStats.lsd.count;
            const chapCount = subKey === 'tthcm' ? globalStats.tthcm.chapters : globalStats.lsd.chapters;

            return (
              <div
                key={subKey}
                onClick={() => onSelectSubject(subKey)}
                className="card"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="academic-seal" style={{ width: '38px', height: '38px', fontSize: '13px' }}>
                      {subKey === 'lsd' ? 'LSĐ' : 'HCM'}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {sub.shortName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                        {sub.name}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="badge badge-primary">
                      Đang chọn
                    </span>
                  )}
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  fontSize: '13px', 
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '10px'
                }}>
                  <div><strong style={{ color: 'var(--text-main)' }}>{count}</strong> câu hỏi</div>
                  <div>•</div>
                  <div><strong style={{ color: 'var(--text-main)' }}>{chapCount}</strong> chương/phần</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        <div className="card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileQuestion size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
              {subStats?.totalQuestions}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Câu hỏi trong ngân hàng
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--gold-light)', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
              {subStats?.chapters?.reduce((acc, c) => acc + (c.flashcardCount || 0), 0) || 0}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Thẻ ghi nhớ cốt lõi
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/wrong-review')}
          className="card" 
          style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--error-bg)', color: 'var(--error-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RotateCcw size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
              {wrongCount}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Câu cần ôn lại (bấm để xem)
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/bank?filter=bookmarked')}
          className="card" 
          style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
              {bookmarkCount}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Câu đã đánh dấu
            </div>
          </div>
        </div>
      </div>

      {/* Chapters / Topics Breakdown */}
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px' 
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              Chương &amp; Nội dung bài học ({subStats?.shortName})
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Chọn chương để xem câu hỏi hoặc bắt đầu luyện tập nhanh
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {subStats?.chapters?.map((ch, idx) => (
            <div
              key={ch.id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-primary">
                    {ch.shortName}
                  </span>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-subtle)' }}>
                    {ch.questionCount} câu hỏi
                  </span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {ch.name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {ch.description}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => navigate(`/bank?chapter=${ch.id}`)}
                  className="btn btn-secondary btn-sm"
                >
                  <Layers size={14} />
                  <span>Xem câu hỏi</span>
                </button>
                <button
                  onClick={() => navigate(`/practice?chapter=${ch.id}`)}
                  className="btn btn-primary btn-sm"
                >
                  <CheckCircle2 size={14} />
                  <span>Luyện tập</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
