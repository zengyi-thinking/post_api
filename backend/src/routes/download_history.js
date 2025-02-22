const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

// 创建下载历史记录
router.post('/resources/:resourceId/download-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const resourceId = req.params.resourceId;

    // 检查是否已经下载过
    const [existingDownload] = await pool.query(
      'SELECT * FROM download_history WHERE user_id = ? AND resource_id = ?',
      [userId, resourceId]
    );

    if (existingDownload.length === 0) {
      // 添加下载记录
      await pool.query(
        'INSERT INTO download_history (user_id, resource_id) VALUES (?, ?)',
        [userId, resourceId]
      );
    }

    res.json({ message: '下载记录已更新' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '操作失败' });
  }
});

// 获取用户的下载历史
router.get('/users/download-history', authenticateToken, async (req, res) => {
  try {
    const [downloads] = await pool.query(
      `SELECT r.*, u.username, dh.created_at as download_date
       FROM download_history dh
       JOIN resources r ON dh.resource_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE dh.user_id = ?
       ORDER BY dh.created_at DESC`,
      [req.user.id]
    );
    res.json(downloads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取下载历史失败' });
  }
});

// 检查资源是否已下载
router.get('/resources/:resourceId/download-status', authenticateToken, async (req, res) => {
  try {
    const [download] = await pool.query(
      'SELECT * FROM download_history WHERE user_id = ? AND resource_id = ?',
      [req.user.id, req.params.resourceId]
    );
    res.json({ downloaded: download.length > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '检查下载状态失败' });
  }
});

module.exports = router;