import React from 'react';
import NuSpeakLogo from '../components/NuSpeakLogo';
import styles from '../styles/Home.module.css';

const features = [
  {
    icon: (
      <svg width="36" height="36" fill="none"><circle cx="18" cy="18" r="18" fill="#7ee7e7"/><path d="M12 18h12M18 12v12" stroke="#22313a" strokeWidth="2.5" strokeLinecap="round"/></svg>
    ),
    title: 'AI 맞춤 뉴스',
    desc: 'AI가 관심사와 패턴을 분석해 딱 맞는 뉴스를 추천합니다.'
  },
  {
    icon: (
      <svg width="36" height="36" fill="none"><circle cx="18" cy="18" r="18" fill="#7ee7e7"/><path d="M12 18h12" stroke="#22313a" strokeWidth="2.5" strokeLinecap="round"/></svg>
    ),
    title: '관심사 기반 추천',
    desc: '정치, 경제, IT, 스포츠 등 원하는 카테고리만 골라보세요.'
  },
  {
    icon: (
      <svg width="36" height="36" fill="none"><circle cx="18" cy="18" r="18" fill="#7ee7e7"/><path d="M14 22l4-8 4 8" stroke="#22313a" strokeWidth="2.5" strokeLinecap="round"/></svg>
    ),
    title: '실시간 요약',
    desc: '긴 뉴스도 AI가 한눈에 들어오게 요약해줍니다.'
  }
];

export default function Home() {
  return (
    <div className={styles.container}>
      {/* 상단 가로 헤더: 로고 + 제목/설명 */}
      <header className={styles.headerCentered}>
        <div className={styles.headerLeft}>
          <NuSpeakLogo size={72} showText={true} />
        </div>
        <div className={styles.headerCenterFull}>
          <h1 className={styles.headerTitle}>AI 개인 맞춤형 뉴스, nu:speak</h1>
          <p className={styles.headerSubtitle}>관심사에 딱 맞는 뉴스를 AI가 큐레이션!</p>
        </div>
        <div className={styles.headerRight}>
          {/* 향후 로그인/회원가입 버튼 등이 들어갈 공간 */}
        </div>
      </header>
      
      {/* Hero 섹션: 헤더 아래 */}
      <section className={styles.hero} style={{ minHeight: '480px', padding: '4rem 0' }}>
        <div className={styles.heroBackground} />
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>정보의 바다에서 <span className={styles.highlight}>당신만의 섬</span>을 발견하세요</h2>
          <p className={styles.heroSubtitle}>AI가 당신의 관심사를 학습해 가장 중요한 뉴스만 선별해드립니다</p>
          <a href="/news" className={styles.heroButton}>
            <span>지금 시작하기</span>
            <svg className={styles.buttonIcon} width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>
      
      {/* 기능/특장점 섹션 */}
      <section className={styles.features}>
        <div className={styles.featuresHeader}>
          <h3 className={styles.featuresTitle}>왜 nu:speak인가요?</h3>
          <p className={styles.featuresSubtitle}>기존 뉴스 앱과는 다른, 진정한 개인화 경험</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* 푸터 */}
      <footer className={styles.footer}>
        <span>© 2025 nu:speak. All rights reserved.</span>
      </footer>
    </div>
  );
} 