import React from 'react';

export default function QuizNavigator({
  totalQuestions,
  currentIndex,
  answers,
  flagged = [],
  onSelectIndex,
  onSubmit,
}) {
  const answeredCount = Object.values(answers).filter((a) => a !== null && a !== undefined).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="card" style={{
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'sticky',
      top: '80px',
    }}>
      {/* Header stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '12px'
      }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
          Danh sách câu hỏi
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
          {answeredCount}/{totalQuestions} đã làm
        </div>
      </div>

      {/* Numbered Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))',
        gap: '8px',
        maxHeight: '340px',
        overflowY: 'auto',
        padding: '2px'
      }}>
        {Array.from({ length: totalQuestions }, (_, i) => {
          const isCurrent = i === currentIndex;
          const isAnswered = answers[i] !== null && answers[i] !== undefined;
          const isFlagged = flagged.includes(i);

          let bg = 'var(--bg-card)';
          let border = '1.5px solid var(--border)';
          let color = 'var(--text-muted)';
          let fontWeight = '500';
          let shadow = 'none';

          if (isAnswered) {
            bg = 'var(--primary-light)';
            border = '1.5px solid var(--primary-border)';
            color = 'var(--primary)';
            fontWeight = '600';
          }

          if (isCurrent) {
            border = '2px solid var(--primary)';
            shadow = '0 0 0 2px var(--primary-light)';
            color = 'var(--primary)';
            fontWeight = '700';
          }

          return (
            <button
              key={i}
              onClick={() => onSelectIndex(i)}
              style={{
                height: '36px',
                borderRadius: '8px',
                backgroundColor: bg,
                border: isCurrent ? '2px solid var(--primary)' : border,
                color: color,
                fontSize: '13px',
                fontWeight: fontWeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: isCurrent ? '0 0 0 2px var(--primary-light)' : 'none',
                transition: 'all 0.1s ease'
              }}
              aria-label={`Đi tới câu ${i + 1}`}
            >
              {i + 1}
              {isFlagged && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--gold-dark)'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'var(--text-subtle)',
        borderTop: '1px solid var(--border)',
        paddingTop: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary-border)' }} />
          <span>Đã chọn ({answeredCount})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }} />
          <span>Chưa chọn ({unansweredCount})</span>
        </div>
      </div>

      {/* Direct Submit button */}
      {onSubmit && (
        <button
          onClick={onSubmit}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '4px' }}
        >
          Nộp bài làm
        </button>
      )}
    </div>
  );
}
