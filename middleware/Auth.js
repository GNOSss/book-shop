const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// req.headers를 검증하여 jwt를 디코딩된 정보를 출력
const ensureAuthorization = (req, res) => {
  try {
    let receivedJwt = req.headers['authorization'];
    console.log('\n req.headers_authorization : ', receivedJwt);

    if (receivedJwt) {
      // decodeJw안에는 login API의 .sign()를 사용해서 할당한 id와 email이 있음
      let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
      console.log(decodedJwt);

      return decodedJwt;
    } else {
      throw new ReferenceError('jwt must be provided');
    }
  } catch (err) {
    console.log('err.name : ', err.name);
    console.log('err.message : ', err.message);

    return err;
  }
};

module.exports = ensureAuthorization;
