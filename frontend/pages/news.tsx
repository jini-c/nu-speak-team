import React, { useEffect, useState, useRef } from 'react';
import NewsCard from '../components/NewsCard';
import NuSpeakLogo from '../components/NuSpeakLogo';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

function NewsModal({ open, article, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const [ttsLoading, setTtsLoading] = React.useState(false);
  const [ttsError, setTtsError] = React.useState('');
  const [ttsAudio, setTtsAudio] = React.useState<string|null>(null);
  const [summary, setSummary] = React.useState<string>('');
  const [summaryLoading, setSummaryLoading] = React.useState(false);
  const [summaryError, setSummaryError] = React.useState('');
  const [comicImage, setComicImage] = React.useState<string>('');
  const [comicPanels, setComicPanels] = React.useState<{ panelNumber: number, caption: string }[]>([]);
  const [comicSummary, setComicSummary] = React.useState('');
  const [comicLoading, setComicLoading] = React.useState(false);
  const [comicError, setComicError] = React.useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // 로컬 스토리지에서 저장된 데이터 복원
  const loadSavedData = () => {
    if (typeof window !== 'undefined' && article?.title) {
      try {
        // 만화 데이터 복원
        const savedComic = localStorage.getItem(`comic_${article.title}`);
        if (savedComic) {
          const comicData = JSON.parse(savedComic);
          setComicImage(comicData.comicImage || '');
          setComicPanels(comicData.comicPanels || []);
          setComicSummary(comicData.comicSummary || '');
        }
        
        // 요약 데이터 복원
        const savedSummary = localStorage.getItem(`summary_${article.title}`);
        if (savedSummary) {
          setSummary(savedSummary);
        }
      } catch (error) {
        console.error('저장된 데이터 로드 실패:', error);
      }
    }
  };

  // 만화 데이터를 로컬 스토리지에 저장
  const saveComic = (image: string, panels: { panelNumber: number, caption: string }[], summary: string) => {
    if (typeof window !== 'undefined' && article?.title) {
      try {
        const data = { comicImage: image, comicPanels: panels, comicSummary: summary };
        localStorage.setItem(`comic_${article.title}`, JSON.stringify(data));
      } catch (error) {
        console.error('만화 데이터 저장 실패:', error);
      }
    }
  };

  // 요약 데이터를 로컬 스토리지에 저장
  const saveSummary = (summaryText: string) => {
    if (typeof window !== 'undefined' && article?.title) {
      try {
        localStorage.setItem(`summary_${article.title}`, summaryText);
      } catch (error) {
        console.error('요약 데이터 저장 실패:', error);
      }
    }
  };

  // 저장된 데이터 삭제
  const clearSavedData = () => {
    if (typeof window !== 'undefined' && article?.title) {
      try {
        localStorage.removeItem(`comic_${article.title}`);
        localStorage.removeItem(`summary_${article.title}`);
        setComicImage('');
        setComicPanels([]);
        setComicSummary('');
        setSummary('');
      } catch (error) {
        console.error('저장된 데이터 삭제 실패:', error);
      }
    }
  };

  React.useEffect(() => {
    setTtsAudio(null);
    setTtsError('');
    setSummary('');
    setSummaryError('');
    setSummaryLoading(false);
    setComicLoading(false);
    setComicError('');
    
    // 기존 만화 데이터 초기화 후 저장된 데이터 로드
    setComicImage('');
    setComicPanels([]);
    setComicSummary('');
    
    // 저장된 데이터가 있으면 복원
    if (article) {
      loadSavedData();
    }
  }, [article]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  // 오버레이 클릭 시 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open || !article) return null;

  // 기사 본문 fallback 처리
  const mainText = article.content || article.body || article.description || article.title || '';

  const handleTTS = async () => {
    setTtsLoading(true);
    setTtsError('');
    setTtsAudio(null);
    try {
      const res = await fetch('http://localhost:3001/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: mainText })
      });
      const data = await res.json();
      if (data.audioContent) {
        setTtsAudio('data:audio/mp3;base64,' + data.audioContent);
      } else {
        setTtsError(data.message || '음성 변환에 실패했습니다.');
      }
    } catch (err) {
      setTtsError('음성 변환 중 오류가 발생했습니다.');
    } finally {
      setTtsLoading(false);
    }
  };

  const handleSummary = async () => {
    setSummaryLoading(true);
    setSummaryError('');
    setSummary('');
    try {
      const res = await fetch('http://localhost:3001/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: mainText })
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
        // 생성된 요약을 로컬 스토리지에 저장
        saveSummary(data.summary);
      } else {
        setSummaryError(data.error || '요약 생성에 실패했습니다.');
      }
    } catch (err) {
      setSummaryError('요약 생성 중 오류가 발생했습니다.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleComic = async () => {
    setComicLoading(true);
    setComicError('');
    setComicImage('');
    setComicPanels([]);
    setComicSummary('');
    try {
      const res = await fetch('http://localhost:3001/api/ai/comic-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: mainText, 
          title: article?.title || '' 
        })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (data.comicImage && data.comicPanels) {
        setComicImage(data.comicImage);
        setComicPanels(data.comicPanels);
        setComicSummary(data.summary || '');
        // 생성된 만화 데이터를 로컬 스토리지에 저장
        saveComic(data.comicImage, data.comicPanels, data.summary || '');
      } else {
        setComicError(data.error || '만화 생성에 실패했습니다.');
      }
    } catch (err) {
      setComicError('만화 생성 중 오류가 발생했습니다.');
    } finally {
      setComicLoading(false);
    }
  };



  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.45)', zIndex: 1000,
        overflowY: 'auto'
      }}
    >
      <div
        ref={modalRef}
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: 1400, width: '95vw',
          maxHeight: '95vh', overflowY: 'auto',
          background: '#fff', borderRadius: 32,
          boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
          padding: '3rem 2.5rem 2rem 2.5rem'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 32, right: 40, background: 'none', border: 'none', fontSize: 36, cursor: 'pointer', color: '#7ee7e7' }}>×</button>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <button onClick={onPrev} disabled={!hasPrev} style={{ background: 'none', border: 'none', fontSize: 32, color: hasPrev ? '#7ee7e7' : '#ccc', cursor: hasPrev ? 'pointer' : 'not-allowed', padding: '0 24px' }}>{'‹'}</button>
          <h2 style={{ flex: 1, textAlign: 'center', fontSize: '2.2rem', fontWeight: 800, color: '#22313a', margin: 0 }}>{article.title}</h2>
          <button onClick={onNext} disabled={!hasNext} style={{ background: 'none', border: 'none', fontSize: 32, color: hasNext ? '#7ee7e7' : '#ccc', cursor: hasNext ? 'pointer' : 'not-allowed', padding: '0 24px' }}>{'›'}</button>
        </div>
        {/* 기능 버튼 영역 */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
          <button onClick={handleSummary} disabled={summaryLoading} style={{ background: '#e0f7fa', color: '#22313a', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 700, fontSize: 16, cursor: summaryLoading ? 'not-allowed' : 'pointer', opacity: summaryLoading ? 0.6 : 1 }}>
            {summaryLoading ? '요약 생성 중...' : 'AI 요약'}
          </button>

          <button onClick={handleComic} disabled={comicLoading} style={{ background: '#e0f7fa', color: '#22313a', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 700, fontSize: 16, cursor: comicLoading ? 'not-allowed' : 'pointer', opacity: comicLoading ? 0.6 : 1 }}>
            {comicLoading ? '만화 생성 중...' : '4컷만화'}
          </button>
          <button onClick={handleTTS} disabled={ttsLoading} style={{ background: '#7ee7e7', color: '#22313a', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 700, fontSize: 16, cursor: ttsLoading ? 'not-allowed' : 'pointer', opacity: ttsLoading ? 0.6 : 1 }}>
            {ttsLoading ? '음성 생성 중...' : '음성으로 듣기'}
          </button>
          
          {(summary || comicImage) && (
            <button onClick={clearSavedData} style={{ background: '#ff6b6b', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
              저장된 내용 삭제
            </button>
          )}
        </div>

        {/* 결과 영역 */}
        {summary && (
          <div style={{ color: '#7ee7e7', fontWeight: 600, marginBottom: 16, fontSize: 18 }}>
            AI 요약
            <span style={{ fontSize: 14, color: '#666', marginLeft: 8, fontWeight: 400 }}>💾 자동 저장됨</span>
          </div>
        )}
        {summaryError && <div style={{ color: 'red', marginBottom: 8 }}>{summaryError}</div>}
        {summary && (
          <div style={{ color: '#222', marginBottom: 24, fontSize: 18, minHeight: 60 }}>{summary}</div>
        )}

        {ttsError && <div style={{ color: 'red', marginBottom: 8 }}>{ttsError}</div>}
        {ttsAudio && <audio src={ttsAudio} controls autoPlay style={{ marginBottom: 12, width: '100%' }} />}
        {comicError && <div style={{ color: 'red', marginBottom: 8 }}>{comicError}</div>}
        {comicImage && (
          <>
            <div style={{ color: '#7ee7e7', fontWeight: 600, marginBottom: 16, fontSize: 18 }}>
              4컷만화
              <span style={{ fontSize: 14, color: '#666', marginLeft: 8, fontWeight: 400 }}>💾 자동 저장됨</span>
            </div>
            
            {/* 연속된 만화 이미지 */}
            <div style={{ 
              width: '100%', 
              maxWidth: 800, 
              margin: '0 auto', 
              marginBottom: 24,
              background: '#f8f8f8',
              borderRadius: 12,
              padding: 20
            }}>
              <img 
                src={comicImage} 
                alt="4컷만화" 
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  borderRadius: 8,
                  display: 'block',
                  minHeight: '600px',
                  maxHeight: '800px',
                  objectFit: 'contain'
                }} 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            
            {/* 각 컷별 설명 */}
            {comicPanels.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: 16,
                width: '100%',
                maxWidth: 700,
                margin: '0 auto',
                marginBottom: 24
              }}>
                {comicPanels.map((panel, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    background: '#e0f7fa', 
                    borderRadius: 12, 
                    padding: 16,
                    border: '2px solid #7ee7e7'
                  }}>
                    <div style={{ 
                      fontSize: 18, 
                      fontWeight: 700, 
                      color: '#22313a', 
                      marginBottom: 8,
                      background: '#7ee7e7',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {panel.panelNumber}
                    </div>
                    <div style={{ 
                      fontSize: 14, 
                      color: '#22313a', 
                      textAlign: 'center', 
                      fontWeight: 500,
                      lineHeight: 1.4
                    }}>
                      {panel.caption}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {comicSummary && (
              <div style={{ color: '#22313a', fontWeight: 500, fontSize: 17, textAlign: 'center', marginTop: 8, marginBottom: 12, background: '#f8f8f8', borderRadius: 8, padding: 12 }}>
                {comicSummary}
              </div>
            )}
          </>
        )}
        {/* 원문 기사 링크 */}
        {getExternalUrl(article.url) && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a
              href={getExternalUrl(article.url)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#7ee7e7', 
                fontWeight: 700, 
                textDecoration: 'underline', 
                fontSize: 18,
                padding: '0.5rem 1rem',
                border: '2px solid #7ee7e7',
                borderRadius: '8px',
                display: 'inline-block'
              }}
              onMouseEnter={() => console.log('원문기사 링크:', article.url, '->', getExternalUrl(article.url))}
            >
              원문 기사 바로가기
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function getExternalUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // 네이버 뉴스 상대경로 보정
  if (url.startsWith('/')) return 'https://news.naver.com' + url;
  return url;
}

const CATEGORIES = [
  { id: 'recommended', name: '추천', value: ['IT', '경제', '사회', '정치', '세계', '생활/문화'] },
  { id: 'it', name: 'IT', value: ['IT'] },
  { id: 'economy', name: '경제', value: ['경제'] },
  { id: 'society', name: '사회', value: ['사회'] },
  { id: 'politics', name: '정치', value: ['정치'] },
  { id: 'world', name: '세계', value: ['세계'] },
  { id: 'culture', name: '생활/문화', value: ['생활/문화'] }
];

export default function News() {
  const [articles, setArticles] = useState<any[]>([]);
  const [weights, setWeights] = useState<{ [key: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState('recommended');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { newsType } = router.query;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    // localStorage에서 저장된 가중치 읽기
    const savedWeights = localStorage.getItem('nuspeak_weights');
    if (savedWeights) {
      setWeights(JSON.parse(savedWeights));
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, weights]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const category = CATEGORIES.find(cat => cat.id === selectedCategory);
      let categoryValue = category ? category.value : ['IT', '경제', '사회', '정치', '세계', '생활/문화'];
      
      // 추천 카테고리인 경우 가중치 기반으로 필터링
      if (selectedCategory === 'recommended' && Object.keys(weights).length > 0) {
        const weightedCategories = Object.entries(weights)
          .filter(([_, weight]) => weight > 0)
          .map(([cat, _]) => cat);
        
        if (weightedCategories.length > 0) {
          categoryValue = weightedCategories;
        }
      }
      
      let url = 'http://localhost:3001/api/news/personalized';
      if (categoryValue.length === 1) {
        url += `?newsType=${categoryValue[0]}`;
      } else if (categoryValue.length > 1) {
        url += `?newsType=${categoryValue.join(',')}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      // API에서 배열이 아닌 단일 객체가 올 경우도 배열로 변환
      const newsArray = Array.isArray(data) ? data : (data ? [data] : []);
      setArticles(newsArray.slice(0, 30));
    } catch (error) {
      console.error('뉴스 가져오기 오류:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // 가중치를 적용하여 뉴스 결과 조절
  const applyWeights = (articles: any[], weights: { [key: string]: number }) => {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) return articles;

    const categoryArticles: { [key: string]: any[] } = {};
    articles.forEach(article => {
      if (!categoryArticles[article.category]) {
        categoryArticles[article.category] = [];
      }
      categoryArticles[article.category].push(article);
    });

    const weightedArticles: any[] = [];
    Object.entries(weights).forEach(([category, weight]) => {
      if (weight > 0 && categoryArticles[category]) {
        const ratio = weight / totalWeight;
        const count = Math.round(articles.length * ratio);
        const selected = categoryArticles[category].slice(0, count);
        weightedArticles.push(...selected);
      }
    });

    // 가중치로 선택되지 않은 뉴스들도 일부 추가
    const remainingArticles = articles.filter(article => 
      !weightedArticles.some(w => w.id === article.id)
    );
    weightedArticles.push(...remainingArticles.slice(0, Math.max(0, 12 - weightedArticles.length)));

    return weightedArticles.slice(0, 12);
  };

  return (
    <div className={styles.container}>
      {/* 상단 가로 헤더: 로고, 제목/설명, 설정 버튼을 한 줄에 */}
      <header className={styles.header}>
        {/* 좌측: 로고 */}
        <div className={styles.headerLeft}>
          <NuSpeakLogo size={72} showText={true} />
        </div>
        {/* 중앙: 제목/설명 */}
        <div className={styles.headerCenter}>
          <h1 className={styles.headerTitle}>AI 맞춤형 뉴스, nu:speak</h1>
          <p className={styles.headerSubtitle}>관심사에 딱 맞는 뉴스를 AI가 큐레이션!</p>
        </div>
        {/* 우측: 설정 버튼 */}
        <div className={styles.headerRight}>
          <a href="/" className={styles.headerButton} style={{ marginRight: '1rem', padding: '0.75rem' }} title="홈으로">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="/settings" className={styles.headerButton}>설정</a>
        </div>
      </header>
      
      {/* 카테고리 선택 */}
      <div className={styles.categorySelector}>
        <div className={styles.categoryButtons}>
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`${styles.categoryButton} ${selectedCategory === category.id ? styles.categoryButtonActive : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* 뉴스 피드 섹션 */}
      <main className={styles.newsSection}>
        <h2 className={styles.newsTitle}>
          {loading ? '뉴스를 불러오는 중...' : `${CATEGORIES.find(cat => cat.id === selectedCategory)?.name} 뉴스`}
        </h2>
        {loading ? (
          <div className={styles.loading}>뉴스를 불러오는 중입니다...</div>
        ) : Array.isArray(articles) && articles.length > 0 ? (
          <div className={styles.newsGrid}>
            {articles.map((article, index) => (
              <NewsCard 
                key={index}
                title={article.title}
                content={article.content}
                category={article.category}
                publishedAt={article.publishedAt}
                url={article.url}
                showSummary={true}
                onClick={() => { setSelectedArticle(article); setModalOpen(true); setSelectedIndex(index); }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.noNews}>추천 뉴스가 없습니다.<br/>카테고리를 바꿔보세요.</div>
        )}
        <NewsModal 
          open={modalOpen} 
          article={selectedArticle} 
          onClose={() => setModalOpen(false)}
          onPrev={() => {
            if (selectedIndex > 0) {
              setSelectedArticle(articles[selectedIndex - 1]);
              setSelectedIndex(selectedIndex - 1);
            }
          }}
          onNext={() => {
            if (selectedIndex < articles.length - 1) {
              setSelectedArticle(articles[selectedIndex + 1]);
              setSelectedIndex(selectedIndex + 1);
            }
          }}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex < articles.length - 1}
        />
      </main>
      
      {/* 푸터 */}
      <footer className={styles.footer}>
        <span>© 2024 nu:speak. All rights reserved.</span>
      </footer>
    </div>
  );
} 