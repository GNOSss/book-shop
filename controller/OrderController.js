const db = require('mysql2/promise');
const { StatusCodes } = require('http-status-codes');
const ensureAuthorization = require('../middleware/Auth');
const jwt = require('jsonwebtoken');

const order = async (req, res) => {
  const conn = await db.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '930809',
    database: 'bookshop',
    dateStrings: true,
  });

  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인 세션이 만료되었습니다. 다시 로그인 하세요.',
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '잘못된 토큰입니다.',
    });
  } else {
    const { items, delivery, totalQuantity, totalPrice, firstBookTitle } = req.body;

    // delivery
    let sql = `INSERT INTO delivery (address, recelver , contact) VALUES (?, ?, ?)`;
    let values = [delivery.address, delivery.recelver, delivery.contact];

    let [results] = await conn.execute(sql, values);
    console.log(results);

    let delivey_id = results.insertId;

    // orders
    sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)VALUES (?, ?, ?, ?, ?);`;

    values = [firstBookTitle, totalQuantity, totalPrice, authorization.id, delivey_id];

    [results] = await conn.execute(sql, values);

    let order_id = results.insertId;

    // items를 가지고 , 장바구니에서 book_id, quantity 조회
    sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?)`;
    let [orderItems] = await conn.query(sql, [items]);

    // orderedBook
    sql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?`;

    values = [];

    // items... 배열 : 요소들을 하나씩 꺼내서 (forEach문을 사용)
    orderItems.forEach((item) => {
      values.push([order_id, item.book_id, item.quantity]);
    });

    [results] = await conn.query(sql, [values]);

    // removeCartItems
    let result = await removeCartItems(conn, items);

    return res.status(StatusCodes.OK).json(result);
  }
};

// delete cartItems
const removeCartItems = async (conn, items) => {
  let sql = `DELETE FROM cartItems WHERE id IN (?)`;

  let result = await conn.query(sql, [items]);

  return result;
};

const getOrders = async (req, res) => {
  const conn = await db.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '930809',
    database: 'bookshop',
    dateStrings: true,
  });

  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인 세션이 만료되었습니다. 다시 로그인 하세요.',
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '잘못된 토큰입니다.',
    });
  } else {
    let sql = `SELECT o.id, o.created_at, d.address, d.recelver, d.contact,
              o.book_title, o.total_quantity, o.total_price
            FROM orders o JOIN delivery d ON o.delivery_id = d.id`;

    let [rows, fields] = await conn.query(sql);

    return res.status(StatusCodes.OK).json(rows);
  }
};

const getOrderDetail = async (req, res) => {
  const conn = await db.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '930809',
    database: 'bookshop',
    dateStrings: true,
  });

  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인 세션이 만료되었습니다. 다시 로그인 하세요.',
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '잘못된 토큰입니다.',
    });
  } else {
    const orderId = req.params.id;

    let sql = `SELECT o.book_id , b.title , b.author, b.price, o.quantity
            FROM orderedBook o JOIN books b ON o.book_id = b.id
            WHERE o.order_id = ?`;

    let [rows, fields] = await conn.query(sql, [orderId]);

    return res.status(StatusCodes.OK).json(rows);
  }
};

module.exports = { order, getOrders, getOrderDetail };
