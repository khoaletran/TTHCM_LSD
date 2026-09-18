import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  RotateCcw, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Bookmark,
  Sparkles,
  ArrowRightLeft,
  GraduationCap
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';

export default function Header({ currentSubject, onSubjectChange, theme, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const subConfig = SUBJECTS[currentSubject] || SUBJECTS.tthcm;

  const navItems = [
    { label: 'Trang chủ', path: '/', icon: BookOpen },
    { label: 'Ngân hàng câu hỏi', path: '/bank', icon: Layers },
    { label: 'Luyện tập', path: '/practice', icon: CheckCircle2 },
    { label: 'Kiến thức', path: '/knowledge', icon: GraduationCap },
    { label: 'Câu hay sai', path: '/wrong-review', icon: RotateCcw },
  ];

  const handleSubjectSwitch = (newSubId) => {
    onSubjectChange(newSubId);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Brand / Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div className="academic-seal">
            {currentSubject === 'lsd' ? 'LSĐ' : 'HCM'}
          </div>
          <div>
            <div style={{ 
              fontSize: '16.5px', 
              fontWeight: 800, 
              color: 'var(--text-main)', 
              letterSpacing: '-0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {subConfig.shortName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-subtle)', fontWeight: 500 }}>
              Học & Luyện Câu Hỏi
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '6px' }} className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Switch subject button */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '3px', border: '1px solid var(--border)' }}>
            <button
              onClick={() => handleSubjectSwitch('tthcm')}
              style={{
                padding: '4px 10px',
                fontSize: '12.5px',
                fontWeight: currentSubject === 'tthcm' ? 700 : 500,
                borderRadius: '6px',
                backgroundColor: currentSubject === 'tthcm' ? 'var(--bg-card)' : 'transparent',
                color: currentSubject === 'tthcm' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: currentSubject === 'tthcm' ? 'var(--shadow-sm)' : 'none',
              }}
              title="Chuyển sang môn Tư tưởng Hồ Chí Minh"
            >
              TTHCM
            </button>
            <button
              onClick={() => handleSubjectSwitch('lsd')}
              style={{
                padding: '4px 10px',
                fontSize: '12.5px',
                fontWeight: currentSubject === 'lsd' ? 700 : 500,
                borderRadius: '6px',
                backgroundColor: currentSubject === 'lsd' ? 'var(--bg-card)' : 'transparent',
                color: currentSubject === 'lsd' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: currentSubject === 'lsd' ? 'var(--shadow-sm)' : 'none',
              }}
              title="Chuyển sang môn Lịch sử Đảng"
            >
              LS ĐẢNG
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="btn btn-ghost btn-sm"
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}
            title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {theme === 'dark' ? <Sun size={17} color="var(--gold)" /> : <Moon size={17} />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-ghost btn-sm mobile-menu-btn"
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          padding: '12px 16px 20px 16px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  textDecoration: 'none'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
}
