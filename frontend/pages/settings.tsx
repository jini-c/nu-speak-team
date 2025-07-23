import React, { useState, useEffect } from 'react';
import styles from '../styles/Onboarding.module.css';
import NuSpeakLogo from '../components/NuSpeakLogo';

const categories = [
  { key: 'IT', label: 'IT' },
  { key: '경제', label: '경제' },
  { key: '스포츠', label: '스포츠' },
  { key: '사회', label: '사회' },
  { key: '생활/문화', label: '생활/문화' },
  { key: '세계', label: '세계' },
  { key: '정치', label: '정치' },
];

export default function Settings() {
  // 각 카테고리별 가중치 상태 (0~100) - 기본값으로 초기화
  const [weights, setWeights] = useState<{ [key: string]: number }>(
    Object.fromEntries(categories.map(cat => [cat.key, 50]))
  );
  const [saved, setSaved] = useState(false);

  // 클라이언트 사이드에서 localStorage에서 저장된 값 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('nuspeak_weights');
    if (saved) {
      try {
        setWeights(JSON.parse(saved));
      } catch {
        // 에러 시 기본값 유지
      }
    }
  }, []);

  const handleChange = (cat: string, value: number) => {
    setWeights(w => ({ ...w, [cat]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('nuspeak_weights', JSON.stringify(weights));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className={styles.container} style={{ position: 'relative', minHeight: '100vh', background: 'linear-gradient(90deg, #0f2027 0%, #2c5364 100%)' }}>
      {/* 상단 헤더 */}
      <div style={{ position: 'absolute', top: 32, left: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
        <NuSpeakLogo size={40} showText={true} />
        <span style={{ color: '#7ee7e7', fontWeight: 700, fontSize: 24, letterSpacing: 1 }}>nu:speak</span>
      </div>
      
      {/* 중앙 제목 */}
      <div style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 1 }}>
        <h1 style={{ color: '#ffffff', fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>
          AI 맞춤형 뉴스, nu:speak
        </h1>
        <p style={{ color: '#cccccc', fontSize: 16, margin: 0, fontWeight: 400 }}>
          관심사에 딱 맞는 뉴스를 AI가 큐레이션!
        </p>
      </div>
      
      {/* 우측 상단 네비게이션 버튼들 */}
      <div style={{ position: 'absolute', top: 32, right: 32, zIndex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* 홈 버튼 */}
        <a href="/" style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          background: '#7ee7e7',
          color: '#22313a',
          borderRadius: '50%',
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(126, 231, 231, 0.3)',
          transition: 'all 0.2s'
        }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
        
        {/* 설정 버튼 */}
        <a href="/settings" style={{ 
          padding: '12px 24px',
          borderRadius: '9999px',
          backgroundColor: '#7ee7e7',
          color: '#22313a',
          fontWeight: 'bold',
          textDecoration: 'none',
          transition: 'all 0.2s'
        }}>
          설정
        </a>
      </div>
      {/* 카테고리 네비게이션 바 */}
      <div style={{ 
        position: 'absolute', 
        top: 120, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        display: 'flex', 
        gap: 16, 
        zIndex: 1 
      }}>
        {['추천', 'IT', '경제', '사회', '정치', '세계', '생활/문화'].map((category) => (
          <button
            key={category}
            style={{
              padding: '12px 20px',
              borderRadius: '25px',
              border: 'none',
              background: category === '추천' ? '#7ee7e7' : 'rgba(126, 231, 231, 0.1)',
              color: category === '추천' ? '#22313a' : '#7ee7e7',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '60px'
            }}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* 좌우 subtle 라인/그래픽 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 80, height: '100%', background: 'linear-gradient(90deg, #7ee7e722 0%, transparent 100%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: '100%', background: 'linear-gradient(270deg, #7ee7e722 0%, transparent 100%)', zIndex: 0 }} />
      
      {/* 메인 콘텐츠 영역 */}
      <div style={{ 
        position: 'absolute', 
        top: 200, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '90%', 
        maxWidth: 800,
        zIndex: 1
      }}>
        {/* 섹션 제목 */}
        <h2 style={{ 
          color: '#ffffff', 
          fontSize: 24, 
          fontWeight: 700, 
          textAlign: 'center', 
          margin: '0 0 40px 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          EQ 설정
        </h2>
        
        <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
          <h3 style={{ color: '#7ee7e7', fontWeight: 700, fontSize: '1.5rem', marginBottom: 8 }}>카테고리별 추천 강도(EQ) 설정</h3>
          <p style={{ color: '#b0e0e6', fontSize: 16, marginBottom: 0 }}>
            각 카테고리별로 관심도를 조절하면<br/>AI가 더욱 맞춤형 뉴스를 추천해줍니다.
          </p>
        </div>
      <div style={{ width: '100%', maxWidth: 500, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {categories.map(cat => (
          <div key={cat.key} style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 'bold', color: '#7ee7e7', marginBottom: 4, display: 'block' }}>{cat.label}</label>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={weights[cat.key]}
              onChange={e => handleChange(cat.key, Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'right', fontSize: 14, color: '#7ee7e7' }}>{weights[cat.key]}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 32, position: 'relative', zIndex: 1 }}>
        <button
          onClick={handleSave}
          style={{ 
            background: '#7ee7e7', 
            color: '#22313a', 
            border: 'none', 
            borderRadius: 8, 
            padding: '12px 32px', 
            fontWeight: 700, 
            fontSize: 16, 
            cursor: 'pointer',
            minWidth: 120
          }}
        >
          저장
        </button>
        {saved && (
          <div style={{ 
            color: '#7ee7e7', 
            marginTop: 12, 
            fontSize: 14, 
            fontWeight: 500 
          }}>
            저장되었습니다!
          </div>
        )}
      </div>
      </div>
      
      {/* 좌측 하단 이전 버튼 */}
      <div style={{ position: 'fixed', left: 24, bottom: 24, zIndex: 2 }}>
        <button 
          onClick={() => window.history.back()} 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            background: 'rgba(126, 231, 231, 0.1)',
            color: '#7ee7e7',
            border: '2px solid #7ee7e7',
            borderRadius: '25px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          이전
        </button>
      </div>
    </div>
  );
} 