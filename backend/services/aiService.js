// LangChain 및 OpenAI 연동 서비스
const OpenAI = require("openai");
const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;

const openai = OPENAI_API_KEY && OPENAI_API_KEY !== "DUMMY_KEY"
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

async function getSummary(text) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "DUMMY_KEY") {
    return "[더미 요약] 요약 기능을 사용하려면 OpenAI API 키가 필요합니다.";
  }
  const prompt = `다음 뉴스를 3문장으로 요약해줘:\n${text}`;
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300
  });
  return response.choices[0].message.content.trim();
}

async function getComic(text) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "DUMMY_KEY") {
    return [
      "[더미 만화] 1컷: 주인공이 뉴스를 읽고 놀란다.",
      "2컷: 친구에게 뉴스를 설명한다.",
      "3컷: 둘이 함께 뉴스를 토론한다.",
      "4컷: 결론을 내리며 웃는다."
    ];
  }
  const prompt = `다음 뉴스 내용을 4컷 만화 대본(컷별 상황과 대사)으로 만들어줘. 각 컷을 1~2문장으로 설명해줘:\n${text}`;
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500
  });
  // 컷별로 분리 (줄바꿈 기준)
  return response.choices[0].message.content
    .split(/\n|\r/)
    .filter(line => line.trim().length > 0);
}

async function getComicWithImages(text) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "DUMMY_KEY") {
    // 더미 응답
    return [
      { imageUrl: '', caption: '[더미 만화] 1컷: 주인공이 뉴스를 읽고 놀란다.' },
      { imageUrl: '', caption: '2컷: 친구에게 뉴스를 설명한다.' },
      { imageUrl: '', caption: '3컷: 둘이 함께 뉴스를 토론한다.' },
      { imageUrl: '', caption: '4컷: 결론을 내리며 웃는다.' }
    ];
  }

  try {
    // 1. 4컷 대본 생성 (간단하게)
    const storyPrompt = `다음 뉴스를 4컷 만화로 만들어줘. 각 컷을 간단히 설명해줘:
${text}

1컷:
2컷:
3컷:
4컷:`;

    const storyResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: storyPrompt }],
      max_tokens: 300
    });

    const storyContent = storyResponse.choices[0].message.content.trim();
    const lines = storyContent.split('\n').filter(line => line.trim().length > 0);
    
    // 컷 설명 추출
    const panels = [];
    for (let i = 1; i <= 4; i++) {
      const line = lines.find(l => l.includes(`${i}컷`));
      if (line) {
        let content = line;
        content = content.replace(`${i}컷:`, '');
        content = content.replace(`${i}컷：`, '');
        content = content.replace(`${i}컷`, '');
        content = content.trim();
        panels.push(content);
      }
    }
    
    // 부족한 패널 채우기
    while (panels.length < 4) {
      panels.push(`장면 ${panels.length + 1}`);
    }

    // 2. DALL-E 3로 2x2 4컷만화 생성 (한국인 캐릭터 우선)
    const imagePrompt = `Create a 2x2 four-panel comic strip. No text or speech bubbles.

Panel 1: ${panels[0]}
Panel 2: ${panels[1]}
Panel 3: ${panels[2]}
Panel 4: ${panels[3]}

Style: Simple cartoon comic style with Korean/Asian characters, clean and clear, consistent characters`;

    const imgRes = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024"
    });

    // 4컷을 하나의 이미지로 반환
    return [{
      imageUrl: imgRes.data[0].url,
      caption: "2x2 형식의 4컷만화",
      panels: panels.map((line, idx) => `${idx + 1}컷: ${line}`)
    }];

  } catch (e) {
    console.error('4컷만화 생성 오류:', e);
    return [{
      imageUrl: '',
      caption: '4컷만화 생성 중 오류가 발생했습니다.',
      error: e.message
    }];
  }
}

async function getComicWithImagesAndSummary(text, title = '') {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }
  
  try {
    // 1. 기사 내용을 4컷만화 스토리로 변환 (심플하게)
    const storyPrompt = `
다음 뉴스를 4컷만화로 만들어주세요:

제목: ${title}
내용: ${text}

각 컷을 간단명료하게 설명해주세요:
1컷: (상황 소개)
2컷: (전개)
3컷: (클라이막스)
4컷: (결말)`;
    
    const storyResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: storyPrompt }],
      max_tokens: 400,
      temperature: 0.7
    });
    
    const storyContent = storyResponse.choices[0].message.content.trim();
    console.log("Generated story:", storyContent);
    
    // 각 컷 추출
    const panels = [];
    const lines = storyContent.split('\n').filter(line => line.trim());
    
    for (let i = 1; i <= 4; i++) {
      const line = lines.find(l => l.includes(`${i}컷`));
      if (line) {
        let content = line;
        content = content.replace(`${i}컷:`, '');
        content = content.replace(`${i}컷：`, '');
        content = content.replace(`${i}컷`, '');
        content = content.replace('(', '').replace(')', '');
        content = content.trim();
        panels.push(content);
      }
    }
    
    // 패널이 부족하면 기본값 추가
    while (panels.length < 4) {
      const defaultPanels = ['상황 소개', '사건 전개', '클라이막스', '결말'];
      panels.push(defaultPanels[panels.length] || `장면 ${panels.length + 1}`);
    }
    
    // 2. 영어로 간단히 번역
    const translatePrompt = `Translate these Korean comic panels to simple English descriptions:
1: ${panels[0]}
2: ${panels[1]}
3: ${panels[2]}
4: ${panels[3]}`;

    const translateResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: translatePrompt }],
      max_tokens: 200
    });
    
    const englishPanels = translateResponse.choices[0].message.content.trim();
    
    // 3. DALL-E 3로 2x2 4컷만화 생성 (한국인 캐릭터 기본)
    const imagePrompt = `2x2 four-panel comic strip without any text. ${englishPanels} Simple cartoon style with Korean/Asian characters, consistent character designs, clear storytelling.`;
    
    console.log("DALL-E prompt:", imagePrompt);
    
    const imgRes = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard"  // hd 대신 standard 사용
    });
    
    // 4. 기사 요약 생성
    const summaryPrompt = `다음 기사를 3문장으로 요약해주세요:
제목: ${title}
내용: ${text}`;
    
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: summaryPrompt }],
      max_tokens: 200
    });
    
    const summary = summaryResponse.choices[0].message.content.trim();
    
    return { 
      comicImage: imgRes.data[0].url, 
      comicPanels: panels.map((caption, idx) => ({ 
        panelNumber: idx + 1, 
        caption: `${idx + 1}컷: ${caption}` 
      })),
      summary,
      layoutType: '2x2'
    };
    
  } catch (error) {
    console.error('만화 생성 오류:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    const fallbackStory = [
      "뉴스의 핵심 상황을 보여주는 장면",
      "상황이 전개되는 모습", 
      "중요한 전환점이나 클라이막스",
      "최종 결과나 영향을 보여주는 장면"
    ];
    
    return {
      comicImage: '',
      comicPanels: fallbackStory.map((caption, idx) => ({ 
        panelNumber: idx + 1, 
        caption: `${idx + 1}컷: ${caption}` 
      })),
      summary: '4컷만화 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      error: error.message,
      layoutType: '2x2'
    };
  }
}

async function getGoogleTTS(text) {
  if (!GOOGLE_TTS_API_KEY || GOOGLE_TTS_API_KEY === 'DUMMY_KEY') {
    return null;
  }
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;
  const body = {
    input: { text },
    voice: { languageCode: 'ko-KR', name: 'ko-KR-Standard-A' },
    audioConfig: { audioEncoding: 'MP3' }
  };
  const response = await axios.post(url, body);
  return response.data.audioContent; // base64 string
}

async function getSingleImageSummary(text) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "DUMMY_KEY") {
    return { imageUrl: '', summary: '[더미] 1컷 이미지+요약 기능을 사용하려면 OpenAI API 키가 필요합니다.' };
  }
  
  try {
    // 1. 1줄 요약 생성 (한글)
    const summaryPrompt = `다음 뉴스 내용을 한 문장으로 요약해줘:\n${text}`;
    const summaryRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: summaryPrompt }],
      max_tokens: 80
    });
    const summary = summaryRes.choices[0].message.content.trim();
    
    // 2. 한국어 요약을 영어로 변환
    const translatePrompt = `Translate to English: ${summary}`;
    const translateRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: translatePrompt }],
      max_tokens: 100
    });
    
    const englishSummary = translateRes.choices[0].message.content.trim();
    const engPrompt = `Single illustration of: ${englishSummary}. No text, clean style.`;
    
    // 3. DALL·E로 1컷 이미지 생성
    const imgRes = await openai.images.generate({
      model: "dall-e-3",
      prompt: engPrompt,
      n: 1,
      size: "1024x1024"
    });
    
    return { imageUrl: imgRes.data[0].url, summary };
  } catch (e) {
    console.error('1컷 이미지 생성 오류:', e);
    return { imageUrl: '', summary, error: '이미지 생성 중 오류가 발생했습니다.' };
  }
}

module.exports = {
  getSummary,
  getComic,
  getGoogleTTS,
  getComicWithImages,
  getComicWithImagesAndSummary,
  getSingleImageSummary
};