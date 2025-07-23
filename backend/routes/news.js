const express = require('express');
const router = express.Router();
const { getPersonalizedNews } = require('../services/newsCollector');

router.get('/personalized', async (req, res) => {
  const userId = 1;
  // newsType=IT,경제,연예 등 쿼리 파라미터 처리
  const newsType = req.query.newsType ? req.query.newsType.split(',') : undefined;
  try {
    const news = await getPersonalizedNews(userId, newsType);
    res.json(news);
  } catch (e) {
    res.status(500).json({ error: '뉴스 크롤링 실패', detail: e.message });
  }
});

module.exports = router; 