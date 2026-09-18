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
  ChevronLeft,
  ExternalLink,
  Copy,
  Check,
  Clock,
  History
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { getKnowledgeBySubject } from '../data/repository';

// Map icon names to Lucide icons
const ICONS = {
  BookOpen,
  Calendar,
  Clock,
  History,
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
  const [copiedTimeline, setCopiedTimeline] = useState(false);

  // Sync state when subject or URL param changes
  useEffect(() => {
    if (initialChapter && knowledgeData[initialChapter]) {
      setSelectedChapterId(initialChapter);
    } else {
      setSelectedChapterId(sub.chapters[0]?.id || '');
    }
  }, [currentSubject, initialChapter, knowledgeData]);

  const activeChapterData = knowledgeData[selectedChapterId] || knowledgeData[defaultChapter];
  const activeChapterMeta = sub.chapters.find((c) => c.id === selectedChapterId) || sub.chapters[0];

  const currentChapterIndex = sub.chapters.findIndex((c) => c.id === (activeChapterMeta?.id || selectedChapterId));
  const prevChapter = currentChapterIndex > 0 ? sub.chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex >= 0 && currentChapterIndex < sub.chapters.length - 1 ? sub.chapters[currentChapterIndex + 1] : null;

  // List of sections in current chapter (theory sections + timeline)
  const chapterSections = useMemo(() => {
    if (!activeChapterData) return [];
    const list = (activeChapterData.sections || []).map((sec) => ({
      id: sec.id,
      title: sec.title,
      icon: sec.icon || 'BookOpen',
      itemCount: sec.items?.length || 0,
      isTimeline: false,
    }));
    if (activeChapterData.timeline && activeChapterData.timeline.length > 0) {
      list.push({
        id: 'timeline',
        title: 'Dòng thời gian sự kiện (Timeline)',
        icon: 'Clock',
        itemCount: activeChapterData.timeline.length,
        isTimeline: true,
      });
    }
    return list;
  }, [activeChapterData]);

  // Selected section state inside active chapter
  const [selectedSectionId, setSelectedSectionId] = useState(() => {
    return activeChapterData?.sections?.[0]?.id || 'all';
  });

  // When chapter or subject changes, reset selected section to first section
  useEffect(() => {
    if (activeChapterData?.sections?.[0]?.id) {
      setSelectedSectionId(activeChapterData.sections[0].id);
    } else {
      setSelectedSectionId('all');
    }
    setSearchQuery('');
  }, [selectedChapterId, activeChapterData]);

  const activeSectionIndex = chapterSections.findIndex((s) => s.id === selectedSectionId);

  const handleSelectChapter = (chId) => {
    setSelectedChapterId(chId);
    setSearchParams({ chapter: chId });
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSection = (secId) => {
    setSelectedSectionId(secId);
    setSearchQuery('');
    const el = document.getElementById('chapter-sections-view');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleCopy = (text, termKey) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedTerm(termKey);
      setTimeout(() => setCopiedTerm(null), 2000);
    } catch {}
  };

  const handleCopyAllTimeline = () => {
    if (!activeChapterData || !activeChapterData.timeline) return;
    const header = `[${sub.name}] ${activeChapterData.title}\nDÒNG THỜI GIAN CÁC MỐC SỰ KIỆN LỊCH SỬ QUAN TRỌNG:\n\n`;
    const text = activeChapterData.timeline
      .map((item, idx) => `${idx + 1}. [${item.time}] ${item.title}\n   -> ${item.description}${item.tag ? ` (${item.tag})` : ''}`)
      .join('\n\n');
    try {
      navigator.clipboard.writeText(header + text);
      setCopiedTimeline(true);
      setTimeout(() => setCopiedTimeline(false), 2000);
    } catch {}
  };

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!activeChapterData) return [];
    if (!searchQuery.trim()) return activeChapterData.sections || [];

    const queryLower = searchQuery.toLowerCase().trim();

    return (activeChapterData.sections || [])
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

  // Filter timeline by search query
  const filteredTimeline = useMemo(() => {
    if (!activeChapterData || !activeChapterData.timeline) return [];
    if (!searchQuery.trim()) return activeChapterData.timeline;

    const queryLower = searchQuery.toLowerCase().trim();
    return activeChapterData.timeline.filter((item) => {
      return (
        item.time.toLowerCase().includes(queryLower) ||
        item.title.toLowerCase().includes(queryLower) ||
        item.description.toLowerCase().includes(queryLower) ||
        (item.tag && item.tag.toLowerCase().includes(queryLower))
      );
    });
  }, [activeChapterData, searchQuery]);

  // Calculate displayed sections based on section selection & search
  const displayedSections = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredSections;
    }
    if (selectedSectionId === 'all') {
      return filteredSections;
    }
    if (selectedSectionId === 'timeline') {
      return [];
    }
    return filteredSections.filter((sec) => sec.id === selectedSectionId);
  }, [searchQuery, selectedSectionId, filteredSections]);

  const shouldShowTimeline = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredTimeline.length > 0;
    }
    if (selectedSectionId === 'all') {
      return Boolean(activeChapterData?.timeline?.length);
    }
    if (selectedSectionId === 'timeline') {
      return Boolean(activeChapterData?.timeline?.length);
    }
    return false;
  }, [searchQuery, selectedSectionId, filteredTimeline.length, activeChapterData]);

  const hasNoResults = searchQuery.trim() && displayedSections.length === 0 && !shouldShowTimeline;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} className="animate-fade-in">
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
        WebkitOverflowScrolling: 'touch',
        maxWidth: '100%',
        boxSizing: 'border-box',
        scrollbarWidth: 'none'
      }}>
        {sub.chapters.map((ch) => {
          const isSelected = ch.id === selectedChapterId;
          const chapterKnow = knowledgeData[ch.id];
          const totalPoints = chapterKnow ? chapterKnow.sections.reduce((acc, s) => acc + s.items.length, 0) : 0;
          const totalMilestones = chapterKnow?.timeline ? chapterKnow.timeline.length : 0;

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
                {totalPoints} mục {totalMilestones > 0 && `• ${totalMilestones} mốc`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chapter Details & Action Bar */}
      {activeChapterData && (
        <div className="card" style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderLeft: '4px solid var(--primary)',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1 1 280px', minWidth: 0, maxWidth: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-gold">
                  {activeChapterMeta?.shortName}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>
                  {activeChapterMeta?.questionCount} câu hỏi trắc nghiệm
                </span>
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.35, wordBreak: 'break-word' }}>
                {activeChapterData.title}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.6 }}>
                {activeChapterData.summary}
              </p>
            </div>

            {/* Quick action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap', maxWidth: '100%' }}>
              {activeChapterData.timeline && activeChapterData.timeline.length > 0 && (
                <button
                  onClick={() => handleSelectSection('timeline')}
                  className="btn btn-secondary btn-sm"
                  title="Xem Dòng thời gian sự kiện của chương này"
                  style={{
                    backgroundColor: selectedSectionId === 'timeline' ? 'var(--primary-light)' : undefined,
                    borderColor: selectedSectionId === 'timeline' ? 'var(--primary)' : undefined,
                    color: selectedSectionId === 'timeline' ? 'var(--primary)' : undefined,
                  }}
                >
                  <Clock size={15} />
                  <span>Dòng thời gian ({activeChapterData.timeline.length})</span>
                </button>
              )}

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
            padding: '8px 14px',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Search size={16} color="var(--text-subtle)" style={{ flexShrink: 0 }} />
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
                color: 'var(--text-main)',
                minWidth: 0
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn btn-ghost btn-sm"
                style={{ padding: '2px 8px', fontSize: '12px', flexShrink: 0 }}
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search notice banner when query active */}
      {searchQuery.trim() && (
        <div className="card" style={{
          padding: '12px 16px',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-main)' }}>
            <Search size={16} color="var(--primary)" />
            <span>Kết quả tìm kiếm cho: <strong>"{searchQuery}"</strong> trong toàn bộ chương</span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            Quay lại mục học tập
          </button>
        </div>
      )}

      {/* Section Navigation Tabs (Segmented Control / Horizontal Pills) */}
      {!searchQuery.trim() && (
        <div 
          id="chapter-sections-view"
          className="card" 
          style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            scrollMarginTop: '80px',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} color="var(--primary)" />
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                Phân mục học tập ({chapterSections.length} mục):
              </span>
            </div>
            {selectedSectionId !== 'all' && activeSectionIndex >= 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                Đang xem mục {activeSectionIndex + 1}/{chapterSections.length}
              </span>
            )}
          </div>

          {/* Horizontal Scrollable Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            WebkitOverflowScrolling: 'touch',
            maxWidth: '100%',
            scrollbarWidth: 'none'
          }}>
            {chapterSections.map((sec, idx) => {
              const isSelected = selectedSectionId === sec.id;
              const IconComponent = ICONS[sec.icon] || BookOpen;

              return (
                <button
                  key={sec.id}
                  onClick={() => handleSelectSection(sec.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-subtle)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <IconComponent size={14} />
                  <span>
                    {sec.id === 'timeline'
                      ? `⏱️ Timeline (${sec.itemCount})`
                      : sec.id === 'traps'
                      ? '⚠️ Bẫy trắc nghiệm'
                      : `${idx + 1}. ${sec.title.replace(/^[IVXLCDM]+\.\s*/, '')}`}
                  </span>
                  {sec.id !== 'timeline' && (
                    <span style={{
                      fontSize: '11px',
                      padding: '1px 5px',
                      borderRadius: '9999px',
                      backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                      color: isSelected ? '#ffffff' : 'var(--text-subtle)',
                      fontWeight: 600
                    }}>
                      {sec.itemCount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* View All tab */}
            <button
              onClick={() => handleSelectSection('all')}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: selectedSectionId === 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: selectedSectionId === 'all' ? 'var(--primary-light)' : 'var(--bg-subtle)',
                color: selectedSectionId === 'all' ? 'var(--primary)' : 'var(--text-subtle)',
                fontWeight: selectedSectionId === 'all' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
              title="Xem toàn bộ các mục và dòng thời gian của chương này trên cùng một trang"
            >
              <BookOpen size={14} />
              <span>Xem tất cả</span>
            </button>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '100%', boxSizing: 'border-box' }}>
        {hasNoResults ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center', maxWidth: '100%' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              Không tìm thấy nội dung kiến thức hay mốc sự kiện nào khớp với từ khóa "{searchQuery}".
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
          displayedSections.map((sec) => {
            const IconComponent = ICONS[sec.icon] || BookOpen;

            return (
              <div
                key={sec.id}
                className="card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden'
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
                    margin: 0,
                    wordBreak: 'break-word',
                    lineHeight: 1.35
                  }}>
                    {sec.title}
                  </h3>
                </div>

                {/* Section Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '100%' }}>
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
                          gap: '8px',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: sec.id === 'traps' ? 'var(--warning-text)' : 'var(--text-main)',
                            lineHeight: 1.4,
                            wordBreak: 'break-word'
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
                              gap: '4px',
                              flexShrink: 0
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
                          whiteSpace: 'pre-line',
                          wordBreak: 'break-word'
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
                            gap: '6px',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            wordBreak: 'break-word'
                          }}>
                            <span style={{ flexShrink: 0 }}>📌 Điểm cốt lõi:</span>
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

      {/* Chapter Timeline (Dòng thời gian sự kiện lịch sử) */}
      {shouldShowTimeline && (
        <div 
          id="chapter-timeline"
          className="card" 
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            borderTop: '4px solid var(--primary)',
            scrollMarginTop: '80px',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          {/* Timeline Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 280px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Dòng thời gian sự kiện lịch sử (Timeline)
                  </h3>
                  <span className="badge badge-primary" style={{ fontSize: '12px' }}>
                    {filteredTimeline.length} mốc sự kiện
                  </span>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                  Tổng hợp theo thứ tự thời gian các sự kiện, năm, tháng cốt lõi phục vụ ôn thi của {activeChapterMeta?.shortName}.
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyAllTimeline}
              className="btn btn-secondary btn-sm"
              style={{
                gap: '6px',
                color: copiedTimeline ? 'var(--success-solid)' : 'var(--text-main)',
                borderColor: copiedTimeline ? 'var(--success-border)' : 'var(--border)',
                flexShrink: 0
              }}
              title="Sao chép toàn bộ danh sách mốc thời gian của chương này"
            >
              {copiedTimeline ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedTimeline ? 'Đã sao chép timeline' : 'Sao chép toàn bộ timeline'}</span>
            </button>
          </div>

          {/* Timeline List */}
          {filteredTimeline.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Không có mốc sự kiện nào khớp với từ khóa "{searchQuery}".
            </div>
          ) : (
            <div style={{
              position: 'relative',
              paddingLeft: '22px',
              marginLeft: '12px',
              borderLeft: '2px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              paddingTop: '6px',
              paddingBottom: '6px',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              {filteredTimeline.map((item, idx) => {
                const isCopied = copiedTerm === `timeline-${idx}`;

                return (
                  <div 
                    key={idx}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Circle Node on Timeline Line */}
                    <div 
                      style={{
                        position: 'absolute',
                        left: '-29px',
                        top: '14px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        border: '2.5px solid var(--bg-card)',
                        boxShadow: '0 0 0 2px var(--primary-border)'
                      }}
                    />

                    {/* Milestone Content Card */}
                    <div 
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'all 0.15s ease',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {/* Time Badge */}
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: 'var(--primary)',
                            color: '#ffffff',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 700,
                            fontSize: '12.5px',
                            letterSpacing: '0.2px'
                          }}>
                            <Calendar size={12} />
                            <span>{item.time}</span>
                          </span>

                          {/* Tag */}
                          {item.tag && (
                            <span style={{
                              fontSize: '11.5px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: 'var(--bg-card)',
                              color: 'var(--text-subtle)',
                              border: '1px solid var(--border)'
                            }}>
                              {item.tag}
                            </span>
                          )}
                        </div>

                        {/* Copy single milestone */}
                        <button
                          onClick={() => handleCopy(`[${item.time}] ${item.title}: ${item.description}`, `timeline-${idx}`)}
                          className="btn btn-ghost btn-sm"
                          style={{
                            padding: '3px 8px',
                            fontSize: '11.5px',
                            color: isCopied ? 'var(--success-solid)' : 'var(--text-subtle)',
                            gap: '4px',
                            flexShrink: 0
                          }}
                          title="Sao chép mốc sự kiện này"
                        >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          <span>{isCopied ? 'Đã chép' : 'Chép'}</span>
                        </button>
                      </div>

                      {/* Title */}
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        lineHeight: 1.45,
                        wordBreak: 'break-word'
                      }}>
                        {item.title}
                      </div>

                      {/* Description */}
                      <div style={{
                        fontSize: '14px',
                        color: 'var(--text-muted)',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word'
                      }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Section Switcher / Pagination Control (Chuyển mục trong chương) */}
      {!searchQuery.trim() && selectedSectionId !== 'all' && activeSectionIndex >= 0 && (
        <div className="card" style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--primary-border)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Previous Section Button */}
          <button
            onClick={() => {
              if (activeSectionIndex > 0) {
                handleSelectSection(chapterSections[activeSectionIndex - 1].id);
              } else if (prevChapter) {
                handleSelectChapter(prevChapter.id);
              }
            }}
            disabled={activeSectionIndex === 0 && !prevChapter}
            className="btn btn-secondary btn-sm"
            style={{
              flex: '1 1 130px',
              maxWidth: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              justifyContent: 'flex-start',
              padding: '8px 12px',
              opacity: activeSectionIndex === 0 && !prevChapter ? 0.4 : 1
            }}
          >
            <ChevronLeft size={16} style={{ flexShrink: 0 }} />
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '13px',
              minWidth: 0
            }}>
              {activeSectionIndex > 0
                ? `Mục trước: ${chapterSections[activeSectionIndex - 1].title.replace(/^[IVXLCDM]+\.\s*/, '')}`
                : prevChapter
                ? `← ${prevChapter.shortName}`
                : 'Đầu chương'}
            </span>
          </button>

          {/* Current Section Indicator Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0
          }}>
            <span style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              Mục {activeSectionIndex + 1} / {chapterSections.length}
            </span>
          </div>

          {/* Next Section Button */}
          <button
            onClick={() => {
              if (activeSectionIndex < chapterSections.length - 1) {
                handleSelectSection(chapterSections[activeSectionIndex + 1].id);
              } else if (nextChapter) {
                handleSelectChapter(nextChapter.id);
              }
            }}
            className="btn btn-primary btn-sm"
            style={{
              flex: '1 1 130px',
              maxWidth: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              justifyContent: 'flex-end',
              padding: '8px 12px'
            }}
          >
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '13px',
              minWidth: 0
            }}>
              {activeSectionIndex < chapterSections.length - 1
                ? `${chapterSections[activeSectionIndex + 1].title.replace(/^[IVXLCDM]+\.\s*/, '')} →`
                : nextChapter
                ? `Sang ${nextChapter.shortName} →`
                : 'Hoàn thành chương'}
            </span>
            <ChevronRight size={16} style={{ flexShrink: 0 }} />
          </button>
        </div>
      )}

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
        marginTop: '8px',
        maxWidth: '100%',
        boxSizing: 'border-box'
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

      {/* Chapter Navigation (Nút chuyển chương trước / sau ở cuối trang) */}
      {(prevChapter || nextChapter) && (
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          marginTop: '4px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          {prevChapter && (
            <button
              onClick={() => handleSelectChapter(prevChapter.id)}
              className="card"
              style={{
                flex: '1 1 240px',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-card)',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              title={`Chuyển về ${prevChapter.name}`}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--primary)'
              }}>
                <ChevronLeft size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  ← Chương trước
                </span>
                <span style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                  lineHeight: 1.35
                }}>
                  {prevChapter.name}
                </span>
              </div>
            </button>
          )}

          {nextChapter && (
            <button
              onClick={() => handleSelectChapter(nextChapter.id)}
              className="card"
              style={{
                flex: '1 1 240px',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                marginLeft: prevChapter ? 0 : 'auto',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                cursor: 'pointer',
                border: '1px solid var(--primary-border)',
                backgroundColor: 'var(--primary-light)',
                textAlign: 'right',
                transition: 'all 0.15s ease'
              }}
              title={`Chuyển sang ${nextChapter.name}`}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1, textAlign: 'right', overflow: 'hidden' }}>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Chương tiếp theo →
                </span>
                <span style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                  lineHeight: 1.35
                }}>
                  {nextChapter.name}
                </span>
              </div>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#ffffff'
              }}>
                <ChevronRight size={18} />
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
