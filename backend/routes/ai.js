const express = require('express');
const router = express.Router();
const { 
  getSummary, 
  getComic, 
  getGoogleTTS, 
  getComicWithImages, 
  getComicWithImagesAndSummary, 
  getSingleImageSummary 
} = require('../services/aiService');

// 요청 유효성 검사 미들웨어
const validateTextRequest = (req, res, next) => {
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ 
      error: 'text 필드가 필요합니다.',
      message: '요청 본문에 text 필드를 포함해주세요.'
    });
  }
  // 텍스트 길이 제한 (옵션)
  if (text.length > 10000) {
    return res.status(400).json({ 
      error: '텍스트가 너무 깁니다.',
      message: '텍스트는 10,000자 이하여야 합니다.'
    });
  }
  next();
};

// 뉴스 요약
router.post('/summary', validateTextRequest, async (req, res) => {
  try {
    const { text } = req.body;
    const summary = await getSummary(text);
    res.json({ 
      success: true,
      summary 
    });
  } catch (err) {
    console.error('AI 요약 오류:', err);
    res.status(500).json({ 
      success: false,
      error: 'AI 요약 처리 중 오류 발생', 
      detail: err.message 
    });
  }
});

// 4컷만화 대본
router.post('/comic', validateTextRequest, async (req, res) => {
  try {
    const { text } = req.body;
    const comic = await getComic(text);
    res.json({ 
      success: true,
      comic 
    });
  } catch (err) {
    console.error('AI 만화 대본 오류:', err);
    res.status(500).json({ 
      success: false,
      error: 'AI 만화 처리 중 오류 발생', 
      detail: err.message 
    });
  }
});

// 4컷만화 이미지+설명
router.post('/comic-images', validateTextRequest, async (req, res) => {
  try {
    const { text } = req.body;
    const comicImages = await getComicWithImages(text);
    
    // 이미지 생성 실패 체크
    if (comicImages && comicImages[0] && !comicImages[0].imageUrl) {
      return res.status(500).json({ 
        success: false,
        error: '만화 이미지 생성 실패',
        detail: comicImages[0].error || '이미지 생성 중 오류가 발생했습니다.',
        comicImages // 디버깅을 위해 결과 포함
      });
    }
    
    res.json({ 
      success: true,
      comicImages 
    });
  } catch (err) {
    console.error('AI 만화 이미지 오류:', err);
    res.status(500).json({ 
      success: false,
      error: 'AI 만화 이미지 처리 중 오류 발생', 
      detail: err.message 
    });
  }
});

// 4컷만화+기사요약
router.post('/comic-summary', validateTextRequest, async (req, res) => {
  try {
    const { text, title } = req.body;
    const result = await getComicWithImagesAndSummary(text, title || '');
    
    // 이미지 생성 실패 체크
    if (!result.comicImage) {
      return res.status(500).json({ 
        success: false,
        error: '만화 이미지 생성 실패',
        detail: result.error || '이미지 생성 중 오류가 발생했습니다.',
        ...result // 나머지 데이터는 포함
      });
    }
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('AI 만화+요약 오류:', err);
    res.status(500).json({ 
      success: false,
      error: 'AI 만화+요약 처리 중 오류 발생', 
      detail: err.message 
    });
  }
});

// 1컷 이미지+요약
router.post('/single-image-summary', validateTextRequest, async (req, res) => {
  try {
    const { text } = req.body;
    const result = await getSingleImageSummary(text);
    
    // 이미지 생성 실패 체크
    if (!result.imageUrl && result.error) {
      return res.status(500).json({ 
        success: false,
        error: '이미지 생성 실패',
        detail: result.error,
        summary: result.summary // 요약은 포함
      });
    }
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('AI 1컷 이미지+요약 오류:', err);
    res.status(500).json({ 
      success: false,
      error: 'AI 1컷 이미지+요약 처리 중 오류 발생', 
      detail: err.message 
    });
  }
});

// TTS (음성 변환)
router.post('/tts', validateTextRequest, async (req, res) => {
  try {
    const { text } = req.body;
    const audioContent = await getGoogleTTS(text);
    
    if (!audioContent) {
      return res.status(200).json({ 
        success: true,
        audioContent: null, 
        message: 'TTS 기능을 사용하려면 Google TTS API 키가 필요합니다.' 
      });
    }
    
    res.json({ 
      success: true,
      audioContent 
    });
  } catch (err) {
    console.error('TTS 오류:', err);
    res.status(500).json({ 
      success: false,
      error: 'TTS 처리 중 오류 발생', 
      detail: err.message 
    });
  }
});

// 헬스 체크 엔드포인트 (옵션)
router.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'AI 서비스가 정상 작동 중입니다.',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;