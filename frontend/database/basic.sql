DROP TABLE IF EXISTS user;

-- User table 
CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(15) NOT NULL UNIQUE,
    user_password VARCHAR(66) NOT NULL,
    user_role VARCHAR(1) NOT NULL CHECK (user_role IN ('1', '2', '3')),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
