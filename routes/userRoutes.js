import express from 'express';
import {
  registerUser,
  verifyEmail,
  loginUser,
  getUserInfo,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
  resetPassword,
  changePassword,
  resendOtp,
  updateProfile,
  deleteAccount,
  logoutUser
} from '../controllers/userController.js';

import { protectRoute } from '../middlewares/authMiddleware.js';

const UserRouter = express.Router();

UserRouter.post('/register', registerUser);
UserRouter.post('/verify-email', verifyEmail);
UserRouter.post('/login', loginUser);
UserRouter.post('/send-forget-password-otp', sendForgotPasswordOtp);
UserRouter.post('/reset-password', resetPassword);
UserRouter.post('/forgot-password', verifyForgotPasswordOtp);
UserRouter.post('/resend-forgot-password-otp', resendForgotPasswordOtp);
UserRouter.post('/resend-otp', resendOtp);

UserRouter.get('/me', protectRoute, getUserInfo);
UserRouter.put('/change-password', protectRoute, changePassword);
UserRouter.put('/update-profile', protectRoute, updateProfile);
UserRouter.delete('/delete-account', protectRoute, deleteAccount);
UserRouter.post('/logout', protectRoute, logoutUser);

export default UserRouter;
