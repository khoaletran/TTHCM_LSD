import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  unansweredCount,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      backdropFilter: 'blur(3px)',
      padding: '16px'
    }}>
      <div className="card animate-fade-in" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: unansweredCount > 0 ? 'var(--warning-bg)' : 'var(--success-bg)',
            color: unansweredCount > 0 ? 'var(--warning-text)' : 'var(--success-solid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
              Xác nhận nộp bài
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              {unansweredCount > 0
                ? `Bạn còn ${unansweredCount} câu chưa trả lời.`
                : 'Bạn đã hoàn thành tất cả câu hỏi!'}
            </p>
          </div>
        </div>

        <p style={{ fontSize: '14.5px', color: 'var(--text-main)', lineHeight: 1.5 }}>
          {unansweredCount > 0
            ? 'Các câu chưa chọn sẽ được tính là bỏ trống. Bạn có chắc chắn muốn kết thúc bài làm và xem điểm không?'
            : 'Hệ thống sẽ chấm điểm và phân tích kết quả bài làm của bạn ngay lập tức.'}
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          marginTop: '4px'
        }}>
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ minWidth: '110px' }}
          >
            Tiếp tục làm
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary"
            style={{ minWidth: '110px' }}
          >
            Nộp bài ngay
          </button>
        </div>
      </div>
    </div>
  );
}
