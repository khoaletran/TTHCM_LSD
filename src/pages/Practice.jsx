import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  Layers, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  HelpCircle,
  Shuffle
} from 'lucide-react';
import { SUBJECTS, getSectionInfo } from '../data/subjects';
import { getAllQuestions, getQuestionsByChapter } from '../data/repository';

export default function Practice({ currentSubject }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultChapter = searchParams.get('chapter') || '';

  const [selectedMode, setSelectedMode] = useState('chapter'); // 'chapter', 'all', 'midterm', 'final'
  const [selectedChapter, setSelectedChapter] = useState(defaultChapter || (SUBJECTS[currentSubject]?.chapters[0]?.id || ''));
  const [selectedSection, setSelectedSection] = useState('all');
  const [questionCount, setQuestionCount] = useState(0); // default 0: all questions
  const [instantFeedback, setInstantFeedback] = useState(false); // true: xem kết quả ngay, false: làm xong nộp
  const [isShuffle, setIsShuffle] = useState(true);

  const sub = SUBJECTS[currentSubject] || SUBJECTS.tthcm;
  const allQuestions = getAllQuestions(currentSubject);

  const activeChapterMeta = sub.chapters.find((c) => c.id === selectedChapter) || sub.chapters[0];
  const activeChapterSections = activeChapterMeta?.sections || [];
  const hasSubSections = activeChapterSections.length > 1;

  // Reset selected section when chapter or subject changes
  React.useEffect(() => {
    setSelectedSection('all');
  }, [selectedChapter, currentSubject]);

  const handleStart = () => {
    const params = new URLSearchParams();
    params.set('mode', selectedMode);
    params.set('subject', currentSubject);
    params.set('instant', instantFeedback ? '1' : '0');
    params.set('shuffle', isShuffle ? '1' : '0');
    params.set('t', String(Date.now()));

    if (selectedMode === 'chapter') {
      params.set('chapter', selectedChapter);
      if (hasSubSections && selectedSection && selectedSection !== 'all') {
        params.set('section', selectedSection);
      }
      params.set('count', String(questionCount));
    } else if (selectedMode === 'all') {
      params.set('count', String(questionCount));
    } else if (selectedMode === 'midterm') {
      params.set('count', currentSubject === 'tthcm' ? '40' : '50');
      params.set('timed', '1');
    } else if (selectedMode === 'final') {
      params.set('count', currentSubject === 'tthcm' ? '40' : '50');
      params.set('timed', '1');
    }

    navigate(`/quiz?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-primary">{sub.shortName}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>
            Thiết lập phòng luyện thi
          </span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
          Bắt đầu luyện tập
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Chọn chế độ, phạm vi câu hỏi và số lượng để bắt đầu luyện phản xạ và củng cố kiến thức.
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div>
        <label style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', display: 'block' }}>
          1. Chọn chế độ làm bài
        </label>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px'
        }}>
          {/* Luyện theo chương */}
          <div
            onClick={() => setSelectedMode('chapter')}
            className="card"
            style={{
              padding: '18px',
              cursor: 'pointer',
              border: selectedMode === 'chapter' ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: selectedMode === 'chapter' ? 'var(--primary-light)' : 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Layers size={20} />
              </div>
              <input type="radio" checked={selectedMode === 'chapter'} onChange={() => setSelectedMode('chapter')} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              Theo từng chương
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Tập trung ôn sâu từng bài học cụ thể theo đề cương.
            </div>
          </div>

          {/* Luyện toàn bộ môn */}
          <div
            onClick={() => setSelectedMode('all')}
            className="card"
            style={{
              padding: '18px',
              cursor: 'pointer',
              border: selectedMode === 'all' ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: selectedMode === 'all' ? 'var(--primary-light)' : 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Shuffle size={20} />
              </div>
              <input type="radio" checked={selectedMode === 'all'} onChange={() => setSelectedMode('all')} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              Toàn bộ ngân hàng
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Trộn ngẫu nhiên câu hỏi từ tất cả các chương ({allQuestions.length} câu).
            </div>
          </div>

          {/* Thi thử Giữa kỳ */}
          <div
            onClick={() => setSelectedMode('midterm')}
            className="card"
            style={{
              padding: '18px',
              cursor: 'pointer',
              border: selectedMode === 'midterm' ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: selectedMode === 'midterm' ? 'var(--primary-light)' : 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-dark)' }}>
                <Clock size={20} />
              </div>
              <input type="radio" checked={selectedMode === 'midterm'} onChange={() => setSelectedMode('midterm')} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              Thi thử Giữa kỳ
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {currentSubject === 'tthcm' ? '40 câu / 50 phút (Chương 1–3)' : '50 câu / 60 phút (Chương Mở đầu–2)'}
            </div>
          </div>

          {/* Thi thử Cuối kỳ */}
          <div
            onClick={() => setSelectedMode('final')}
            className="card"
            style={{
              padding: '18px',
              cursor: 'pointer',
              border: selectedMode === 'final' ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: selectedMode === 'final' ? 'var(--primary-light)' : 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <GraduationCap size={20} />
              </div>
              <input type="radio" checked={selectedMode === 'final'} onChange={() => setSelectedMode('final')} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              Thi thử Cuối kỳ
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {currentSubject === 'tthcm' ? '40 câu / 50 phút (Chương 4–6)' : '50 câu / 60 phút (Chương 2–3)'}
            </div>
          </div>
        </div>
      </div>

      {/* Scope Settings */}
      {selectedMode === 'chapter' && (
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-main)' }}>
            2. Chọn chương cần ôn tập
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            {sub.chapters.map((ch) => {
              const qCount = allQuestions.filter((q) => ch.sections.includes(q.section)).length;
              const isChSelected = selectedChapter === ch.id;

              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChapter(ch.id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: isChSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isChSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="radio"
                      name="chapter-select"
                      checked={isChSelected}
                      onChange={() => setSelectedChapter(ch.id)}
                    />
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '14.5px', color: 'var(--text-main)' }}>
                        {ch.name}
                      </span>
                    </div>
                  </div>
                  <span className="badge" style={{ flexShrink: 0 }}>
                    {qCount} câu
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section Selector (Thay thế số câu thành Mục khi chương có nhiều mục) */}
      {selectedMode === 'chapter' && hasSubSections && (
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <label style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              3. Chọn mục cần ôn tập
            </label>
            <span style={{ fontSize: '12.5px', color: 'var(--text-subtle)' }}>
              {activeChapterMeta?.shortName} gồm {activeChapterSections.length} mục
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            {/* Option: Tất cả các mục trong chương */}
            {(() => {
              const totalChapterQ = allQuestions.filter((q) => activeChapterSections.includes(q.section)).length;
              const isAllSelected = selectedSection === 'all';

              return (
                <div
                  onClick={() => setSelectedSection('all')}
                  className="card"
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: isAllSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isAllSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <input
                      type="radio"
                      name="section-select"
                      checked={isAllSelected}
                      onChange={() => setSelectedSection('all')}
                      style={{ cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-main)' }}>
                        Tất cả các mục ({activeChapterMeta?.shortName})
                      </span>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        Bao gồm toàn bộ câu hỏi của tất cả các mục trong chương này.
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-primary" style={{ flexShrink: 0, fontWeight: 700 }}>
                    {totalChapterQ} câu
                  </span>
                </div>
              );
            })()}

            {/* Từng mục cụ thể: Mục 1.1, Mục 1.2, Mục 2.1, Mục 2.2, v.v. */}
            {activeChapterSections.map((secId) => {
              const secInfo = getSectionInfo(secId) || { title: secId, description: '' };
              const qCount = allQuestions.filter((q) => q.section === secId).length;
              const isSecSelected = selectedSection === secId;

              return (
                <div
                  key={secId}
                  onClick={() => setSelectedSection(secId)}
                  className="card"
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: isSecSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isSecSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <input
                      type="radio"
                      name="section-select"
                      checked={isSecSelected}
                      onChange={() => setSelectedSection(secId)}
                      style={{ cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-main)', lineHeight: 1.35 }}>
                        {secInfo.title}
                      </span>
                      {secInfo.description && (
                        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                          {secInfo.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="badge" style={{ flexShrink: 0, fontWeight: 700 }}>
                    {qCount} câu
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tùy chọn số lượng câu hỏi luyện tập */}
          <div style={{
            marginTop: '4px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-subtle)', fontWeight: 600 }}>
              Số lượng câu (có thể nộp bài bất kỳ lúc nào):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[0, 20, 30, 50].map((num) => {
                const isSelected = questionCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ minWidth: '68px' }}
                  >
                    {num === 0 ? 'Tất cả' : `${num} câu`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Question Count Selector (khi không có nhiều mục hoặc khi chọn chế độ toàn bộ môn) */}
      {((selectedMode === 'chapter' && !hasSubSections) || selectedMode === 'all') && (
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-main)' }}>
            {selectedMode === 'chapter' ? '3.' : '2.'} Chọn số lượng câu hỏi
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[10, 20, 30, 40, 50, 0].map((num) => {
              const isSelected = questionCount === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minWidth: '76px' }}
                >
                  {num === 0 ? 'Tất cả' : `${num} câu`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode settings: Instant Feedback & Shuffle */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-main)' }}>
          Tùy chọn hiển thị
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={instantFeedback}
              onChange={(e) => setInstantFeedback(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                Xem đáp án ngay sau mỗi câu
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Khi chọn xong một đáp án, hệ thống sẽ báo ngay đúng hay sai kèm giải thích (phù hợp khi học mới).
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isShuffle}
              onChange={(e) => setIsShuffle(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                Xáo trộn ngẫu nhiên thứ tự câu hỏi
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Tránh ghi nhớ thụ động theo vị trí cố định của đề thi.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Start Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <button
          onClick={handleStart}
          className="btn btn-primary btn-lg"
          style={{ minWidth: '260px', padding: '16px 32px', fontSize: '17px' }}
        >
          <CheckCircle2 size={20} />
          <span>Bắt đầu làm bài</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
