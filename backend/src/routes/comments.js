const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

// 获取资料的评论列表
router.get('/resources/:resourceId/comments', async (req, res) => {
  try {
    const [comments] = await pool.query(
      `SELECT c.*, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.resource_id = ? 
       ORDER BY c.created_at DESC`,
      [req.params.resourceId]
    );
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取评论失败' });
  }
});

// 添加评论
router.post('/resources/:resourceId/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    const resourceId = req.params.resourceId;

    await pool.query(
      'INSERT INTO comments (content, user_id, resource_id) VALUES (?, ?, ?)',
      [content, userId, resourceId]
    );

    res.json({ message: '评论成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '评论失败' });
  }
});

// 删除评论
router.delete('/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const [comment] = await pool.query('SELECT * FROM comments WHERE id = ?', [req.params.commentId]);
    
    if (!comment || comment.length === 0) {
      return res.status(404).json({ message: '评论不存在' });
    }

    if (comment[0].user_id !== req.user.id) {
      return res.status(403).json({ message: '无权删除该评论' });
    }

    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.commentId]);
    res.json({ message: '删除评论成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '删除评论失败' });
  }
});

module.exports = router;