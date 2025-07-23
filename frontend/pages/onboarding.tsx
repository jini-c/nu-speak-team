import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Onboarding.module.css';

const categories = [
  { key: 'IT', label: 'IT' },
  { key: '경제', label: '경제' },
  { key: '사회', label: '사회' },
  { key: '생활/문화', label: '생활/문화' },
  { key: '세계', label: '세계' },
  { key: '정치', label: '정치' },
];

export default function Onboarding() {
  const [selected, setSelected] = useState<string[]>([]);
  const [eq, setEq] = useState<number>(1); // 0: 원문, 1: AI 요약, 2: 4컷만화
  const router = useRouter();

  const toggleCategory = (cat: string) => {
    setSelected(sel => sel.includes(cat) ? sel.filter(c => c !== cat) : [...sel, cat]);
  };

  const handleNext = () => {
    if (selected.length === 0) return;
    router.push({ pathname: '/', query: { newsType: selected.join(','), eq } });
  };

  return (
    <div className={styles.container}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, color: '#7ee7e7', marginBottom: 8 }}>📰</div>
        <h2 className={styles.title}>관심 카테고리를 선택하세요</h2>
        <p style={{ color: '#b0e0e6', fontSize: 18, marginBottom: 0 }}>
          원하는 카테고리를 선택하면<br/>AI가 맞춤형 뉴스를 추천해줍니다.
        </p>
      </div>
      <div className={styles.categoryGrid}>
        {categories.map(cat => (
          <button
            key={cat.key}
            className={`${styles.categoryButton} ${selected.includes(cat.key) ? styles.selected : ''}`}
            onClick={() => toggleCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div style={{ margin: '2rem 0', width: '100%', maxWidth: 400 }}>
        <label htmlFor="eq-slider" style={{ fontWeight: 'bold', color: '#7ee7e7', marginBottom: 8, display: 'block' }}>
          뉴스 요약 방식(EQ)
        </label>
        <input
          id="eq-slider"
          type="range"
          min={0}
          max={2}
          step={1}
          value={eq}
          onChange={e => setEq(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 4 }}>
          <span style={{ color: eq === 0 ? '#7ee7e7' : '#ccc' }}>원문</span>
          <span style={{ color: eq === 1 ? '#7ee7e7' : '#ccc' }}>AI 요약</span>
          <span style={{ color: eq === 2 ? '#7ee7e7' : '#ccc' }}>4컷만화</span>
        </div>
      </div>
      <button
        className={`${styles.nextButton} ${selected.length ? styles.active : styles.disabled}`}
        onClick={handleNext}
        disabled={selected.length === 0}
      >
        다음
      </button>
    </div>
  );
} 