-- 创建数据库
CREATE DATABASE IF NOT EXISTS siteqi_backend
    DEFAULT CHARACTER SET = 'utf8mb4';

USE siteqi_backend;

-- 用户表
CREATE TABLE IF NOT EXISTS siteqi_backend.users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    points INT DEFAULT 100,
    last_login DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_username (username)
);

-- 资料表
CREATE TABLE IF NOT EXISTS siteqi_backend.resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    points_required INT DEFAULT 0,
    downloads INT DEFAULT 0,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 评论表
CREATE TABLE IF NOT EXISTS siteqi_backend.comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    user_id INT,
    resource_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (resource_id) REFERENCES resources(id)
);

-- 点赞表
CREATE TABLE IF NOT EXISTS siteqi_backend.likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    resource_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, resource_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (resource_id) REFERENCES resources(id)
);

-- 收藏表
CREATE TABLE IF NOT EXISTS siteqi_backend.favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    resource_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (user_id, resource_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (resource_id) REFERENCES resources(id)
);