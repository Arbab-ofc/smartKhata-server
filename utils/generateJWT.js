import jwt from 'jsonwebtoken';

const generateJWT = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export default generateJWT;
