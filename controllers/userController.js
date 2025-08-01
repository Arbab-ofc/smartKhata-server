import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateOTP from '../utils/generateOTP.js';
import generateJWT from '../utils/generateJWT.js';
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import {sendOtpEmail} from '../utils/sendOtpEmail.js';

const resend = new Resend('re_QCNsCz8W_FEa1TjA8ZtBJhgaQhCEFY2sD');

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpiresAt,
    });

    // Send styled email with OTP
    await sendOtpEmail(email, name, otp);

    const token = generateJWT(newUser._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'User registered successfully. OTP sent to your email.',
    });

  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};



export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(410).json({ message: 'OTP has expired' });
    }

    user.isVerified = true;
    user.otp = '';
    user.otpExpiresAt = null;
    await user.save();

    const token = generateJWT(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (err) {
    console.error('Verify Email Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    
    const token = generateJWT(user._id);

    
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id; 

    const user = await User.findById(userId).select('-password -otp -otpExpiresAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User info fetched successfully',
      user,
    });
  } catch (error) {
    console.error('Get User Info Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await sendOtpEmail(email, user.name, otp);

    return res.status(200).json({
      message: 'OTP sent to your email to reset password',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email , otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and Otp are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }
    // Check if OTP has expired
    if (user.otpExpiresAt < new Date()) {
      return res.status(410).json({ message: 'OTP has expired please regenerate OTP again' });
    }

    if(user.otp === otp){
      // Clear OTP after successful verification
      user.otp = '';
      user.otpExpiresAt = null;
      await user.save();
    }


    return res.status(200).json({
      message: 'OTP verified successfully',
      userId: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      otpExpiresAt: user.otpExpiresAt,
    });
  } catch (error) {
    console.error('Error in verify OTP for forget password : ', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email , newPassword, confirmPassword } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.otp = ''; // Clear OTP after password reset
    user.otpExpiresAt = null; // Clear OTP expiration
    await user.save();
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    await resend.emails.send({
      from: 'SmartKhata <no-reply@smartkhata.app>',
      to: email,
      subject: 'Resend OTP - SmartKhata',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Email Verification - OTP</h2>
          <p>Your new OTP is:</p>
          <h3 style="color: #333; background: #eee; padding: 10px; display: inline-block;">${otp}</h3>
          <p>This OTP will expire in 15 minutes.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'New OTP sent successfully' });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const resendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Send OTP via Resend
    await resend.emails.send({
      from: 'SmartKhata <no-reply@smartkhata.app>',
      to: email,
      subject: 'SmartKhata - Forgot Password OTP',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Reset Your Password</h2>
          <p>Here is your new OTP to reset your password:</p>
          <h3 style="background: #f0f0f0; padding: 10px 20px; display: inline-block; font-size: 1.5em;">${otp}</h3>
          <p>This OTP will expire in 15 minutes.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'OTP for password reset has been resent to your email' });
  } catch (error) {
    console.error('Resend Forgot Password OTP Error:', error);
    res.status(500).json({ message: 'Server error while resending OTP' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phoneNumber, currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required to update profile' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified. Please verify your account first.' });
    }

    // ✅ Validate current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    // ✅ Apply updates
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};3


export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account not verified. Please verify your email first.' });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    await User.findByIdAndDelete(userId);

    res.clearCookie('token'); // Clear JWT cookie
    res.status(200).json({ message: 'Your account has been deleted successfully' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
};

export const logoutUser = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Server error while logging out' });
  }
};