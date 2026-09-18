import React from 'react';
import { Clock } from 'lucide-react';

export default function ProgressBar({
  currentIndex,
  totalQuestions,
  timeLeft = null, // seconds if timer is active
}) {
  const progressPercent = totalQuestions > 0 
    ? Math.round(((currentIndex + 1) / totalQuestions) * 100) 
    : 0;

  const formatTime = (secs) => {
    if (secs == null) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '100%',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13.5px',
        fontWeight: 600,
        color: 'var(--text-muted)'
      }}>
        <span>
          Câu <strong style={{ color: 'var(--text-main)', fontSize: '15px' }}>{currentIndex + 1}</strong> / {totalQuestions}
        </span>

        {timeLeft !== null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: timeLeft < 300 ? 'var(--error-text)' : 'var(--text-main)',
            fontWeight: 700,
            fontSize: '14px',
            backgroundColor: timeLeft < 300 ? 'var(--error-bg)' : 'var(--bg-subtle)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${timeLeft < 300 ? 'var(--error-border)' : 'var(--border)'}`
          }}>
            <Clock size={15} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Progress track */}
      <div style={{
        width: '100%',
        height: '6px',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: '9999px',
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          backgroundColor: 'var(--primary)',
          borderRadius: '9999px',
          transition: 'width 0.25s ease'
        }} />
      </div>
    </div>
  );
}
