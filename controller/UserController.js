const conn = require("../db");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // 비밀번호 암호화 모듈 (복호화 불가능한 방식)
const dotenv = require("dotenv");
dotenv.config();

// 회원가입
const joinUser = (req, res) => {
  const { email, password } = req.body;

  let sql = `INSERT INTO users (email, password, salt) VALUES (?, ?, ?)`;

  // 암화화된 비밀번호와 salt 값을 같이 DB에 저장
  const salt = crypto.randomBytes(10).toString("base64");
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  // req.body에서 받은 password로 암호화한 hashedPassword를 DB의 password컬럼에 할당
  let values = [email, hashedPassword, salt];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "데이터베이스 오류입니다." });
    }

    return res
      .status(StatusCodes.CREATED)
      .json({ message: `${values[0]} 회원가입 성공` });
  });
};

// 로그인
const login = (req, res) => {
  const { email, password } = req.body;

  let sql = `SELECT * FROM users WHERE email =? `;
  conn.query(sql, email, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "데이터베이스 오류입니다." });
    }

    const loginUser = results[0];

    // salt 값을 꺼내서 날 것으로 들어온 비밀번호를 암호화 해보고
    const hashPassword = crypto
      .pbkdf2Sync(password, loginUser.salt, 10000, 10, "sha512")
      .toString("base64");

    // 데이터베이스에 저장된 비밀번호랑 비교
    if (loginUser && loginUser.password === hashPassword) {
      const token = jwt.sign(
        {
          email: loginUser.email,
        },
        process.env.PRIVATE_KEY,
        { expiresIn: "1h", issuer: "loginUser" }
      );

      res.cookie("token", token, { httpOnly: true });

      return res
        .status(StatusCodes.OK)
        .json({ message: `${loginUser.email} 님 로그인 성공하였습니다.` });
    } else {
      // 403 : Forbidden (접근 권리 없음) , 401 : Unauthorized (비인증 상태)
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
  });
};

const passwordResetRequest = (req, res) => {
  const { email } = req.body;

  let sql = `SELECT * FROM users WHERE email =? `;

  conn.query(sql, email, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "데이터베이스 오류입니다." });
    }

    // req.body에 들어온 이메일로 유저가 있는지 찾는다.
    const user = results[0];
    if (user) {
      return res.status(StatusCodes.OK).json({
        email: email,
      });
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
  });
};

const passwordReset = (req, res) => {
  const { email, password } = req.body;

  let sql = `UPDATE users SET password = ? , salt = ? where email = ?`;

  // 암화화된 비밀번호와 salt 값을 같이 DB에 저장
  const salt = crypto.randomBytes(10).toString("base64");
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  let values = [hashedPassword, salt, email];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "데이터베이스 오류입니다." });
    }

    if (results.affectedRows == 0) {
      return res.status(StatusCodes.BAD_REQUEST).end();
    } else {
      return res.status(StatusCodes.OK).json(results);
    }
  });
};

module.exports = { joinUser, login, passwordResetRequest, passwordReset };
