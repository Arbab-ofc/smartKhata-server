import jwt from 'jsonwebtoken';

export const protectRoute = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};
