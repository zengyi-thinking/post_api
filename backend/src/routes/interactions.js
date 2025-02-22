const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

// 点赞资料
router.post('/resources/:resourceId/like', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const resourceId = req.params.resourceId;

    // 检查是否已经点赞
    const [existingLike] = await pool.query(
      'SELECT * FROM likes WHERE user_id = ? AND resource_id = ?',
      [userId, resourceId]
    );

    if (existingLike.length > 0) {
      // 取消点赞
      await pool.query(
        'DELETE FROM likes WHERE user_id = ? AND resource_id = ?',
        [userId, resourceId]
      );
      await pool.query(
        'UPDATE resources SET likes = likes - 1 WHERE id = ?',
        [resourceId]
      );
      return res.json({ message: '取消点赞成功' });
    }

    // 添加点赞
    await pool.query(
      'INSERT INTO likes (user_id, resource_id) VALUES (?, ?)',
      [userId, resourceId]
    );
    await pool.query(
      'UPDATE resources SET likes = likes + 1 WHERE id = ?',
      [resourceId]
    );

    res.json({ message: '点赞成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '操作失败' });
  }
});

// 收藏资料
router.post('/resources/:resourceId/favorite', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const resourceId = req.params.resourceId;

    // 检查是否已经收藏
    const [existingFavorite] = await pool.query(
      'SELECT * FROM favorites WHERE user_id = ? AND resource_id = ?',
      [userId, resourceId]
    );

    if (existingFavorite.length > 0) {
      // 取消收藏
      await pool.query(
        'DELETE FROM favorites WHERE user_id = ? AND resource_id = ?',
        [userId, resourceId]
      );
      return res.json({ message: '取消收藏成功' });
    }

    // 添加收藏
    await pool.query(
      'INSERT INTO favorites (user_id, resource_id) VALUES (?, ?)',
      [userId, resourceId]
    );

    res.json({ message: '收藏成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '操作失败' });
  }
});

// 获取用户收藏列表
router.get('/users/favorites', authenticateToken, async (req, res) => {
  try {
    const [favorites] = await pool.query(
      `SELECT r.*, u.username 
       FROM favorites f 
       JOIN resources r ON f.resource_id = r.id 
       JOIN users u ON r.user_id = u.id 
       WHERE f.user_id = ?`,
      [req.user.id]
    );
    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取收藏列表失败' });
  }
});

module.exports = router;