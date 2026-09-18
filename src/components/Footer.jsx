import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      backgroundColor: 'var(--bg-card)',
      padding: '28px 16px',
      marginTop: 'auto',
      fontSize: '13px',
      color: 'var(--text-subtle)'
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '10px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontWeight: 600
        }}>
          <ShieldCheck size={16} color="var(--success-solid)" />
          <span>Hoạt động 100% trên thiết bị của bạn • Không cần đăng nhập • Không thu thập thông tin cá nhân</span>
        </div>

        <p style={{ maxWidth: '640px', lineHeight: 1.5 }}>
          Ứng dụng hỗ trợ sinh viên tự học và tự luyện câu hỏi trắc nghiệm hai môn Tư tưởng Hồ Chí Minh và Lịch sử Đảng Cộng sản Việt Nam.
          Toàn bộ ngân hàng câu hỏi, tiến độ và lịch sử làm bài được bảo lưu an toàn trên trình duyệt của bạn.
        </p>

        <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>
          Tư tưởng Hồ Chí Minh &amp; Lịch sử Đảng • Rebuilt with React &amp; Modern UI/UX
        </div>
      </div>
    </footer>
  );
}
