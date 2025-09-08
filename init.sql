CREATE DATABASE IF NOT EXISTS nehemiah_publishing;
USE nehemiah_publishing;

CREATE USER IF NOT EXISTS 'nehemiah_user'@'%' IDENTIFIED BY 'nehemiah_password';
GRANT ALL PRIVILEGES ON nehemiah_publishing.* TO 'nehemiah_user'@'%';
FLUSH PRIVILEGES;
