import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Layers, 
  CheckCircle2, 
  Calendar, 
  AlertTriangle, 
  Compass, 
  Target, 
  Shield, 
  Award, 
  Building, 
  Users, 
  Globe, 
  Feather, 
  Heart, 
  Smile, 
  Flag, 
  TrendingUp, 
  Sun, 
  ShieldAlert, 
  Zap, 
  Flame, 
  Rocket, 
  ChevronRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { getKnowledgeBySubject } from '../data/repository';

// Map icon names to Lucide icons
const ICONS = {
  BookOpen,
  Calendar,
  AlertTriangle,
  Compass,
  Target,
  Shield,
  Award,
  Building,
  Users,
  Globe,
  Feather,
  Heart,
  Smile,
  Flag,
  TrendingUp,
  Sun,
  ShieldAlert,
  Zap,
  Flame,
  Rocket,
  Layers,
};

export default function Knowledge({ currentSubject, onSelectSubject }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialChapter = searchParams.get('chapter') || '';

  const sub = SUBJECTS[currentSubject] || SUBJECTS.tthcm;
  const knowledgeData = useMemo(() => getKnowledgeBySubject(currentSubject), [currentSubject]);

  // Selected chapter
  const defaultChapter = sub.chapters[0]?.id || '';
  const [selectedChapterId, setSelectedChapterId] = useState(() => {
    return initialChapter && knowledgeData[initialChapter] ? initialChapter : defaultChapter;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTerm, setCopiedTerm] = useState(null);

  // Sync state when subject or URL param changes
  useEffect(() => {
    if (initialChapter && knowledgeData[initialChapter]) {
      setSelectedChapterId(initialChapter);
    } else {
      setSelectedChapterId(sub.chapters[0]?.id || '');
    }
  }, [currentSubject, initialChapter, knowledgeData]);

  const handleSelectChapter = (chId) => {
    setSelectedChapterId(chId);
    setSearchParams({ chapter: chId });
  };

  const handleCopy = (text, termKey) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedTerm(termKey);
      setTimeout(() => setCopiedTerm(null), 2000);
    } catch {}
  };

  const activeChapterData = knowledgeData[selectedChapterId] || knowledgeData[defaultChapter];
  const activeChapterMeta = sub.chapters.find((c) => c.id === selectedChapterId) || sub.chapters[0];

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!activeChapterData) return [];
    if (!searchQuery.trim()) return activeChapterData.sections;

    const queryLower = searchQuery.toLowerCase().trim();

    return activeChapterData.sections
      .map((sec) => {
        const matchedItems = sec.items.filter((item) => {
          return (
            item.term.toLowerCase().includes(queryLower) ||
            item.content.toLowerCase().includes(queryLower) ||
            (item.highlight && item.highlight.toLowerCase().includes(queryLower))
          );
        });

        if (matchedItems.length > 0) {
          return {
            ...sec,
            items: matchedItems,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [activeChapterData, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-primary">{sub.shortName}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>
            Sổ tay kiến thức &amp; Tóm tắt trọng tâm
          </span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
          Kiến thức trọng tâm ôn thi
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Hệ thống hóa toàn bộ định nghĩa, luận điểm cốt lõi, mốc sự kiện quan trọng và bẫy trắc nghiệm theo từng chương học phần.
        </p>
      </div>

      {/* Chapter Tabs (Horizontal scrollable on mobile) */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border)',
        WebkitOverflowScrolling: 'touch'
      }}>
        {sub.chapters.map((ch) => {
          const isSelected = ch.id === selectedChapterId;
          const chapterKnow = knowledgeData[ch.id];
          const totalPoints = chapterKnow ? chapterKnow.sections.reduce((acc, s) => acc + s.items.length, 0) : 0;

          return (
            <button
              key={ch.id}
              onClick={() => handleSelectChapter(ch.id)}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <span>{ch.shortName}</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '9999px',
                backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-subtle)',
                color: isSelected ? '#fff' : 'var(--text-subtle)',
                fontWeight: 600
              }}>
                {totalPoints} mục
              </span>
            </button>
          );
        })}
      </div>

      {/* Chapter Details & Action Bar */}
      {activeChapterData && (
        <div className="card" style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderLeft: '4px solid var(--primary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-gold">
                  {activeChapterMeta?.shortName}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>
                  {activeChapterMeta?.questionCount} câu hỏi trắc nghiệm
                </span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                {activeChapterData.title}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.6 }}>
                {activeChapterData.summary}
              </p>
            </div>

            {/* Quick action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/bank?chapter=${selectedChapterId}`)}
                className="btn btn-secondary btn-sm"
                title="Xem ngân hàng câu hỏi của chương này"
              >
                <Layers size={15} />
                <span>Xem câu hỏi ({activeChapterMeta?.questionCount})</span>
              </button>

              <button
                onClick={() => navigate(`/practice?chapter=${selectedChapterId}`)}
                className="btn btn-primary btn-sm"
                title="Bắt đầu phòng luyện tập cho chương này"
              >
                <CheckCircle2 size={15} />
                <span>Luyện thi chương này</span>
              </button>
            </div>
          </div>

          {/* Search bar within chapter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px'
          }}>
            <Search size={16} color="var(--text-subtle)" />
            <input
              type="text"
              placeholder={`Tìm nhanh trong ${activeChapterMeta?.shortName} (từ khóa, sự kiện, mốc năm, bẫy trắc nghiệm)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '14px',
                color: 'var(--text-main)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn btn-ghost btn-sm"
                style={{ padding: '2px 6px', fontSize: '12px' }}
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredSections.length === 0 ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              Không tìm thấy nội dung kiến thức nào khớp với từ khóa "{searchQuery}".
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="btn btn-secondary"
              style={{ marginTop: '12px' }}
            >
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        ) : (
          filteredSections.map((sec) => {
            const IconComponent = ICONS[sec.icon] || BookOpen;

            return (
              <div
                key={sec.id}
                className="card"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}
              >
                {/* Section Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: sec.id === 'traps' ? 'var(--warning-bg)' : 'var(--primary-light)',
                    color: sec.id === 'traps' ? 'var(--warning-text)' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <IconComponent size={18} />
                  </div>
                  <h3 style={{
                    fontSize: '17px',
                    fontWeight: 800,
                    color: sec.id === 'traps' ? 'var(--warning-text)' : 'var(--text-main)',
                    margin: 0
                  }}>
                    {sec.title}
                  </h3>
                </div>

                {/* Section Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sec.items.map((item, idx) => {
                    const isCopied = copiedTerm === `${sec.id}-${idx}`;

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: sec.id === 'traps' ? 'var(--warning-bg)' : 'var(--bg-subtle)',
                          border: sec.id === 'traps' ? '1px solid var(--warning-border)' : '1px solid var(--border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: sec.id === 'traps' ? 'var(--warning-text)' : 'var(--text-main)'
                          }}>
                            {item.term}
                          </div>

                          <button
                            onClick={() => handleCopy(`${item.term}: ${item.content}`, `${sec.id}-${idx}`)}
                            className="btn btn-ghost btn-sm"
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              color: isCopied ? 'var(--success-solid)' : 'var(--text-subtle)',
                              gap: '4px'
                            }}
                            title="Sao chép nội dung kiến thức này"
                          >
                            {isCopied ? <Check size={13} /> : <Copy size={13} />}
                            <span style={{ fontSize: '11px' }}>{isCopied ? 'Đã chép' : 'Chép'}</span>
                          </button>
                        </div>

                        <div style={{
                          fontSize: '14.5px',
                          lineHeight: 1.65,
                          color: 'var(--text-main)',
                          whiteSpace: 'pre-line'
                        }}>
                          {item.content}
                        </div>

                        {item.highlight && (
                          <div style={{
                            marginTop: '4px',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: 'var(--primary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span>📌 Điểm cốt lõi:</span>
                            <span>{item.highlight}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Practice CTA */}
      <div className="card" style={{
        padding: '24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--bg-card), var(--primary-light))',
        border: '1px solid var(--primary-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        marginTop: '12px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Đã nắm vững lý thuyết {activeChapterMeta?.shortName}?
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '520px', lineHeight: 1.5 }}>
          Luyện ngay các câu hỏi trắc nghiệm thực tế để củng cố phản xạ và kiểm tra khả năng ghi nhớ của bạn.
        </p>
        <button
          onClick={() => navigate(`/practice?chapter=${selectedChapterId}`)}
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontWeight: 700 }}
        >
          <CheckCircle2 size={16} />
          <span>Bắt đầu luyện thi ngay ({activeChapterMeta?.questionCount} câu)</span>
        </button>
      </div>
    </div>
  );
}
