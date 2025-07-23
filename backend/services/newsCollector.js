const axios = require('axios');
const cheerio = require('cheerio');

const NAVER_NEWS_URLS = {
  'IT': 'https://news.naver.com/section/105',
  '경제': 'https://news.naver.com/section/101',
  '사회': 'https://news.naver.com/section/102',
  '생활/문화': 'https://news.naver.com/section/103',
  '세계': 'https://news.naver.com/section/104',
  '정치': 'https://news.naver.com/section/100'
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function fetchNaverNews(categories = ['IT', '경제', '사회', '정치', '세계', '생활/문화']) {
  let allNews = [];
  
  for (const cat of categories) {
    const url = NAVER_NEWS_URLS[cat];
    if (!url) continue;
    
    try {
      console.log(`크롤링 시도: ${cat} - ${url}`);
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(data);
      const articles = [];
      
      $('.sa_text').slice(0, 10).each((i, el) => {
        const title = $(el).find('.sa_text_title').text().trim();
        const content = $(el).find('.sa_text_lede').text().trim();
        const publishedAt = $(el).find('.sa_text_press').text().trim();
        // 다양한 a 태그 시도
        let url = $(el).find('.sa_text_title a').attr('href')
                || $(el).find('a').attr('href')
                || $(el).find('.sa_text a').attr('href')
                || '';
        // 콘솔로 확인
        console.log('크롤링 뉴스:', title, url);
        // URL 정규화
        if (url) {
          if (url.startsWith('/')) {
            url = 'https://news.naver.com' + url;
          } else if (!url.startsWith('http')) {
            url = 'https://news.naver.com' + url;
          }
        }
        if (title && content && url) {
          articles.push({
            title,
            content,
            category: cat,
            publishedAt,
            url
          });
        }
      });
      
      console.log(`${cat}: ${articles.length}개 기사 수집 완료`);
      allNews = allNews.concat(articles);
      
    } catch (error) {
      console.error(`${cat} 크롤링 오류:`, error.message);
    }
  }
  
  // 중복 뉴스(제목 기준) 제거
  const uniqueNews = Array.from(new Map(allNews.map(item => [item.title, item])).values());
  console.log(`총 ${uniqueNews.length}개 고유 뉴스 수집 완료`);
  
  // 랜덤 섞기
  return shuffleArray(uniqueNews);
}

function simpleSummary(content) {
  if (!content) return '';
  
  // 문장 단위로 분리
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);
  
  // 첫 번째 의미있는 문장 반환
  if (sentences.length > 0) {
    return sentences[0].trim() + '.';
  }
  
  // 문장이 없으면 첫 100자 반환
  if (content.length > 100) {
    return content.substring(0, 100).trim() + '...';
  }
  
  return content;
}

function extractKeywords(content) {
  return Array.from(new Set(content.split(/\s+/).filter(w => w.length > 1))).slice(0, 3);
}

async function getPersonalizedNews(userId, newsType) {
  // 기본적으로 모든 카테고리 사용
  let categories = ['IT', '경제', '사회', '정치', '세계', '생활/문화'];
  
  // newsType이 배열이고 비어있지 않으면 사용
  if (newsType && Array.isArray(newsType) && newsType.length > 0) {
    categories = newsType;
  }
  // newsType이 문자열이면 배열로 변환
  else if (newsType && typeof newsType === 'string') {
    categories = [newsType];
  }
  
  console.log(`뉴스 수집 시작: ${categories.join(', ')}`);
  const crawled = await fetchNaverNews(categories);
  
  // 최대 12개만 반환
  const result = crawled.slice(0, 12).map((article, idx) => ({
    id: idx + 1,
    title: article.title,
    aiSummary: simpleSummary(article.content),
    keywords: extractKeywords(article.content),
    readTime: Math.max(1, Math.round((article.content || '').length / 50)),
    likes: Math.floor(Math.random() * 100),
    publishedAt: article.publishedAt || '',
    category: article.category,
    url: article.url || ''
  }));
  
  console.log(`최종 결과: ${result.length}개 뉴스 반환`);
  return result;
}

module.exports = { fetchNaverNews }; 