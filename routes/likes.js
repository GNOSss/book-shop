const express = require('express');
const router = express.Router();
router.use(express.json());
const { likeHandler } = require('../controller/LikeController');

// 좋아요 추가
router.post('/:id', likeHandler);

// 좋아요 삭제
router.delete('/:id', likeHandler);

module.exports = router;
