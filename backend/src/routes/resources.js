const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// 文件上传配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// 文件类型和大小限制
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'application/zip', 'application/x-rar-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// 验证JWT中间件
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '未授权' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '无效的令牌' });
  }
};

// 上传资料
router.post('/', authenticateToken, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: '文件大小不能超过100MB' });
      }
      return res.status(400).json({ message: '文件上传错误' });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { title, description, points_required } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: '请上传文件' });
      }

      // 保存资料信息到数据库
      const [result] = await pool.execute(
        'INSERT INTO resources (title, description, file_path, points_required, user_id) VALUES (?, ?, ?, ?, ?)',
        [title, description, file.path, points_required || 0, req.user.id]
      );

      // 给上传用户增加积分
      await pool.execute(
        'UPDATE users SET points = points + 20 WHERE id = ?',
        [req.user.id]
      );

      res.status(201).json({
        message: '资料上传成功',
        resource_id: result.insertId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '服务器错误' });
    }
  });
});

// 获取资料列表
router.get('/', async (req, res) => {
  try {
    const [resources] = await pool.execute(
      'SELECT r.*, u.username FROM resources r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC'
    );

    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取资料详情
router.get('/:id', async (req, res) => {
  try {
    const [resources] = await pool.execute(
      'SELECT r.*, u.username FROM resources r LEFT JOIN users u ON r.user_id = u.id WHERE r.id = ?',
      [req.params.id]
    );

    if (resources.length === 0) {
      return res.status(404).json({ message: '资料不存在' });
    }

    // 增加浏览量
    await pool.execute(
      'UPDATE resources SET views = views + 1 WHERE id = ?',
      [req.params.id]
    );

    res.json(resources[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 下载资料
router.post('/:id/download', authenticateToken, async (req, res) => {
  try {
    // 获取资料信息
    const [resources] = await pool.execute(
      'SELECT * FROM resources WHERE id = ?',
      [req.params.id]
    );

    if (resources.length === 0) {
      return res.status(404).json({ message: '资料不存在' });
    }

    const resource = resources[0];

    // 检查用户积分是否足够
    const [users] = await pool.execute(
      'SELECT points FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users[0].points < resource.points_required) {
      return res.status(400).json({ message: '积分不足' });
    }

    // 扣除积分并增加下载次数
    await pool.execute(
      'UPDATE users SET points = points - ? WHERE id = ?',
      [resource.points_required, req.user.id]
    );

    await pool.execute(
      'UPDATE resources SET downloads = downloads + 1 WHERE id = ?',
      [req.params.id]
    );

    // 返回文件路径
    res.json({
      message: '下载成功',
      file_path: `/uploads/${path.basename(resource.file_path)}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;