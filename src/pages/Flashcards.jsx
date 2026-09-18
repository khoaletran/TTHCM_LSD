import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle,
  Layers,
  BookOpen
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { getFlashcardsByChapter, shuffleArray } from '../data/repository';

export default function Flashcards({ currentSubject }) {
  const sub = SUBJECTS[currentSubject] || SUBJECTS.tthcm;
  const [selectedChapter, setSelectedChapter] = useState(sub.chapters[0]?.id || '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Sync default chapter when subject changes
  const cards = useMemo(() => {
    return getFlashcardsByChapter(currentSubject, selectedChapter);
  }, [currentSubject, selectedChapter]);

  const [activeCards, setActiveCards] = useState(cards);

  // Update activeCards when cards change
  React.useEffect(() => {
    setActiveCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  const currentCard = activeCards[currentIndex];
  const [slideDirection, setSlideDirection] = useState('right');

  // Touch swipe states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleNext = () => {
    if (currentIndex < activeCards.length - 1) {
      setSlideDirection('right');
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSlideDirection('left');
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    setActiveCards(shuffleArray(activeCards));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, activeCards.length]);

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
        // Swipe left -> Next card
        handleNext();
      } else {
        // Swipe right -> Prev card
        handlePrev();
      }
    }
  };

  const selectedChapterMeta = sub.chapters.find((c) => c.id === selectedChapter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-primary">{sub.shortName}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>
            Ghi nhớ nhanh mốc sự kiện &amp; khái niệm cốt lõi
          </span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
          Thẻ ghi nhớ (Flashcards)
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Bấm vào thẻ để lật mặt xem nội dung giải nghĩa. Rất hữu hiệu để ghi nhớ các mốc năm, sự kiện và định nghĩa quan trọng.
        </p>
      </div>

      {/* Chapter Selection Pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '4px'
      }}>
        {sub.chapters.map((ch) => {
          const isSelected = selectedChapter === ch.id;
          const cardCount = getFlashcardsByChapter(currentSubject, ch.id).length;
          return (
            <button
              key={ch.id}
              onClick={() => {
                setSelectedChapter(ch.id);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '9999px', fontSize: '13px' }}
            >
              <span>{ch.shortName}</span>
              <span style={{ opacity: 0.75, fontSize: '11.5px' }}>({cardCount})</span>
            </button>
          );
        })}
      </div>

      {/* Flashcard Area */}
      {activeCards.length === 0 ? (
        <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Chương này hiện chưa có thẻ ghi nhớ.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
          {/* Card Info Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '680px',
            fontSize: '13.5px',
            color: 'var(--text-muted)'
          }}>
            <span style={{ fontWeight: 600 }}>
              {selectedChapterMeta?.name}
            </span>
            <span className="badge badge-primary">
              Thẻ {currentIndex + 1} / {activeCards.length}
            </span>
          </div>

          {/* Interactive Card with Touch Swipe */}
          <div
            key={currentIndex}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsFlipped(!isFlipped)}
            className={`card touch-swipe-zone ${slideDirection === 'right' ? 'animate-slide-right' : 'animate-slide-left'}`}
            style={{
              width: '100%',
              maxWidth: '680px',
              minHeight: '260px',
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: isFlipped ? '2px solid var(--gold-dark)' : '2px solid var(--border)',
              backgroundColor: isFlipped ? 'var(--gold-light)' : 'var(--bg-card)',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: isFlipped ? 'var(--gold-dark)' : 'var(--primary)'
            }}>
              {isFlipped ? 'Mặt sau: Lời giải nghĩa / Sự kiện' : 'Mặt trước: Câu hỏi / Khái niệm'}
            </div>

            {/* Content */}
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: 1.6,
              margin: '20px 0'
            }}>
              {isFlipped ? currentCard?.back : currentCard?.front}
            </div>

            {/* Flip & Swipe Hint */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12.5px',
              color: 'var(--text-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RotateCw size={14} />
                <span>Chạm để {isFlipped ? 'xem câu hỏi' : 'lật xem đáp án'} (hoặc phím Space/Enter)</span>
              </div>
              <div style={{ fontSize: '11.5px', opacity: 0.8 }}>
                ‹ Vuốt phải: Thẻ trước • Vuốt trái: Thẻ sau ›
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginTop: '8px'
          }}>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn btn-secondary"
              style={{ width: '130px' }}
            >
              <ChevronLeft size={18} />
              <span>Thẻ trước</span>
            </button>

            <button
              onClick={handleShuffle}
              className="btn btn-ghost"
              title="Xáo trộn ngẫu nhiên thứ tự thẻ"
            >
              <Shuffle size={18} />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === activeCards.length - 1}
              className="btn btn-primary"
              style={{ width: '130px' }}
            >
              <span>Thẻ tiếp theo</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
