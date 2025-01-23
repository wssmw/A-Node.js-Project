/**
 * 借阅表结构定义
 */
const borrows = {
  id: 'INT PRIMARY KEY AUTO_INCREMENT',
  user_id: 'INT NOT NULL COMMENT "借阅者ID"',
  book_id: 'INT NOT NULL COMMENT "图书ID"',
  borrow_date: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT "借阅时间"',
  return_date: 'TIMESTAMP NULL COMMENT "归还时间"',
  status: 'TINYINT DEFAULT 1 COMMENT "状态：1-借出 2-已还"',
  'FOREIGN KEY': '(user_id) REFERENCES users(id)'
}

module.exports = borrows 