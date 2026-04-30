-- BuyMe Auction System - MySQL Schema
-- CS 527 Database Systems

CREATE DATABASE IF NOT EXISTS buyme;
USE buyme;

CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('buyer','seller','rep','admin') NOT NULL DEFAULT 'buyer',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at    DATETIME DEFAULT NULL
);

CREATE TABLE category (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    parent_id INT DEFAULT NULL,
    level     ENUM('root','sub','leaf') NOT NULL DEFAULT 'root',
    CONSTRAINT fk_category_parent
        FOREIGN KEY (parent_id) REFERENCES category(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE category_fields (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    field_name  VARCHAR(100) NOT NULL,
    field_type  ENUM('text','number','boolean','date') NOT NULL DEFAULT 'text',
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_catfields_category
        FOREIGN KEY (category_id) REFERENCES category(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    seller_id       INT NOT NULL,
    category_id     INT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    image_url       VARCHAR(1024) DEFAULT NULL,
    description     TEXT,
    starting_price  DECIMAL(12,2) NOT NULL,
    reserve_price   DECIMAL(12,2) DEFAULT NULL,   -- hidden from buyers
    bid_increment   DECIMAL(12,2) NOT NULL DEFAULT 1.00,
    closes_at       DATETIME NOT NULL,
    status          ENUM('active','closed','cancelled') NOT NULL DEFAULT 'active',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_items_seller
        FOREIGN KEY (seller_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_items_category
        FOREIGN KEY (category_id) REFERENCES category(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE item_field_values (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    item_id           INT NOT NULL,
    category_field_id INT NOT NULL,
    value             VARCHAR(500) NOT NULL,
    CONSTRAINT fk_ifv_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ifv_field
        FOREIGN KEY (category_field_id) REFERENCES category_fields(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_item_field (item_id, category_field_id)
);

CREATE TABLE bids (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    item_id        INT NOT NULL,
    bidder_id      INT NOT NULL,
    amount         DECIMAL(12,2) NOT NULL,
    auto_bid_limit DECIMAL(12,2) DEFAULT NULL,  -- NULL = manual bid
    is_auto        BOOLEAN NOT NULL DEFAULT FALSE,
    placed_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    removed_by     INT DEFAULT NULL,             -- rep who removed it
    removed_at     DATETIME DEFAULT NULL,
    CONSTRAINT fk_bids_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bids_bidder
        FOREIGN KEY (bidder_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bids_removedby
        FOREIGN KEY (removed_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE auction_result (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    item_id     INT NOT NULL UNIQUE,
    winner_id   INT DEFAULT NULL,           -- NULL = no winner (reserve not met)
    final_price DECIMAL(12,2) NOT NULL,
    resolved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_result_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_result_winner
        FOREIGN KEY (winner_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE alerts (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    category_id INT DEFAULT NULL,
    keyword     VARCHAR(255) DEFAULT NULL,
    max_price   DECIMAL(12,2) DEFAULT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alerts_category
        FOREIGN KEY (category_id) REFERENCES category(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE questions (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    item_id       INT DEFAULT NULL,
    rep_id        INT DEFAULT NULL,
    question_text TEXT NOT NULL,
    answer_text   TEXT DEFAULT NULL,
    asked_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answered_at   DATETIME DEFAULT NULL,
    CONSTRAINT fk_questions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_questions_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_questions_rep
        FOREIGN KEY (rep_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE notifications (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    item_id    INT DEFAULT NULL,
    type       ENUM(
                 'outbid',
                 'auto_limit_exceeded',
                 'auction_won',
                 'auction_closed',
                 'alert_match',
                 'question_answered'
               ) NOT NULL,
    message    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notif_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_items_status_closes   ON items(status, closes_at);
CREATE INDEX idx_items_seller          ON items(seller_id);
CREATE INDEX idx_items_category        ON items(category_id);
CREATE INDEX idx_bids_item             ON bids(item_id);
CREATE INDEX idx_bids_bidder           ON bids(bidder_id);
CREATE INDEX idx_bids_placed           ON bids(placed_at);
CREATE INDEX idx_notifications_user    ON notifications(user_id, is_read);
CREATE INDEX idx_alerts_user           ON alerts(user_id, is_active);
CREATE INDEX idx_category_parent       ON category(parent_id);

INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@buyme.com', 'CHANGE_ME_USE_BCRYPT', 'admin');