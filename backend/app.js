require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { fetchNaverNews } = require('./services/newsCollector');
const aiRouter = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 뉴스 요약 API (간단한 내장 요약)
app.post('/api/news/summarize', async (req, res) => {
  try {
    const { content, title } = req.body;
    if (!content) {
      return res.status(400).json({ error: '요약할 내용이 필요합니다.' });
    }
    // 간단한 요약 로직
    const summary = generateSummary(content, title);
    res.json({ summary });
  } catch (error) {
    console.error('요약 API 오류:', error);
    res.status(500).json({ error: '요약 처리 중 오류가 발생했습니다.' });
  }
});

function generateSummary(content, title) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length <= 2) {
    return content;
  }
  const firstSentence = sentences[0].trim();
  const lastSentence = sentences[sentences.length - 1].trim();
  if (firstSentence === lastSentence) {
    return firstSentence;
  }
  return `${firstSentence}. ${lastSentence}`;
}

// 뉴스 목록 API (상세 페이지용)
app.get('/api/news', async (req, res) => {
  try {
    const { newsType } = req.query;
    let categories = ['IT', '경제', '사회', '정치', '세계', '생활/문화'];
    if (newsType) {
      categories = newsType.split(',');
    }
    const news = await fetchNaverNews(categories);
    res.json({ articles: news });
  } catch (error) {
    console.error('뉴스 API 오류:', error);
    res.status(500).json({ error: '뉴스를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 기존 뉴스 API
app.get('/api/news/personalized', async (req, res) => {
  try {
    const { newsType } = req.query;
    let categories = ['IT', '경제', '사회', '정치', '세계', '생활/문화'];
    if (newsType) {
      categories = newsType.split(',');
    }
    const news = await fetchNaverNews(categories);
    res.json(news);
  } catch (error) {
    console.error('뉴스 API 오류:', error);
    res.status(500).json({ error: '뉴스를 가져오는 중 오류가 발생했습니다.' });
  }
});

app.use('/api/ai', aiRouter);

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 