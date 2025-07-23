const express = require('express');
const router = express.Router();

// 회원가입/로그인 예시
router.post('/login', (req, res) => {
  // TODO: 실제 인증 구현
  res.json({ token: 'mock-jwt-token', user: { id: 1, email: req.body.email } });
});

module.exports = router; 