import React, { useState, useEffect } from 'react';
import styles from './NewsCard.module.css';

interface NewsCardProps {
  title: string;
  content: string;
  category: string;
  publishedAt: string;
  url: string;
  showSummary?: boolean;
  onClick?: () => void;
}

export default function NewsCard({ 
  title, 
  content, 
  category, 
  publishedAt, 
  url, 
  showSummary = true,
  onClick
}: NewsCardProps) {
  const [summary, setSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    if (showSummary && content && !summary) {
      generateSummary();
    }
  }, [content, showSummary]);

  const generateSummary = async () => {
    if (!content || summary) return;
    
    setIsLoadingSummary(true);
    try {
      const response = await fetch('http://localhost:3001/api/news/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          title: title
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      } else {
        setSummary(generateSimpleSummary(content));
      }
    } catch (error) {
      setSummary(generateSimpleSummary(content));
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const generateSimpleSummary = (text: string) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length <= 2) return text;
    
    const firstSentence = sentences[0].trim();
    const lastSentence = sentences[sentences.length - 1].trim();
    
    if (firstSentence === lastSentence) return firstSentence;
    return `${firstSentence}. ${lastSentence}`;
  };

  const displayContent = showSummary && summary ? summary : content;
  const shouldTruncate = displayContent.length > 150 && !showFullContent;

  const cardContent = (
    <>
      <div className={styles.category}>{category}</div>
      <h3 className={styles.title}>{title}</h3>
      {showSummary && (
        <div className={styles.summarySection}>
          {isLoadingSummary ? (
            <div className={styles.loadingSummary}>AI가 요약 중...</div>
          ) : (
            <p className={styles.content}>
              {shouldTruncate 
                ? `${displayContent.substring(0, 150)}...` 
                : displayContent
              }
            </p>
          )}
          {shouldTruncate && (
            <button 
              className={styles.readMore}
              onClick={(e) => {
                e.stopPropagation();
                setShowFullContent(true);
              }}
            >
              더 보기
            </button>
          )}
        </div>
      )}
      <div className={styles.footer}>
        <span className={styles.publishedAt}>{publishedAt}</span>
        <span className={styles.readMoreText}>클릭하여 읽기</span>
      </div>
    </>
  );

  return (
    <div className={styles.card} onClick={onClick} style={{ cursor: 'pointer' }}>
      {cardContent}
    </div>
  );
} 