import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { createLog } from '../services/logService.js';

export const register = async (req, res) => {
  try {
    const { username, password, email, fullName, avatar } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const trimmedUser = username.trim().toLowerCase();

    if (trimmedUser.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if username already exists in database
    const existingUser = await User.findOne({ username: trimmedUser });
    const adminUser = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();

    if (existingUser || trimmedUser === adminUser) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken. Please choose another.',
      });
    }

    // Create new user in MongoDB
    const newUser = new User({
      username: trimmedUser,
      email: email ? email.trim().toLowerCase() : '',
      fullName: fullName ? fullName.trim() : '',
      avatar: avatar || '',
      password,
      role: 'User',
    });

    await newUser.save();

    // Log registration in MongoDB
    await createLog(
      'USER_REGISTERED',
      `New user registered: '${trimmedUser}'`,
      null,
      newUser._id,
      newUser.username
    );

    const token = jwt.sign(
      {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to TaskFlow.',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        bio: newUser.bio,
        avatar: newUser.avatar,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('[AuthController] Register Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during registration.',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const inputUser = username.trim().toLowerCase();
    const adminUser = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    // 1. Check if matches predefined admin from env
    if (inputUser === adminUser && password === adminPass) {
      // Find or create admin in User collection to support avatar
      let adminRecord = await User.findOne({ username: adminUser });
      if (!adminRecord) {
        adminRecord = new User({
          username: adminUser,
          password: adminPass,
          role: 'Administrator',
          fullName: 'System Administrator',
        });
        await adminRecord.save();
      }

      const token = jwt.sign(
        { id: adminRecord._id, username: adminUser, role: 'Administrator' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      // Record activity log in MongoDB
      await createLog('LOGIN', `Administrator '${adminUser}' logged in.`, null, adminRecord._id, adminUser);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: adminRecord._id,
          username: adminUser,
          role: 'Administrator',
          fullName: adminRecord.fullName || 'System Administrator',
          email: adminRecord.email || '',
          bio: adminRecord.bio || '',
          avatar: adminRecord.avatar || '',
        },
      });
    }

    // 2. Check MongoDB User collection
    const user = await User.findOne({ username: inputUser });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Record activity log in MongoDB
    await createLog('LOGIN', `User '${user.username}' logged in.`, null, user._id, user.username);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[AuthController] Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    });
  }
};

export const logout = async (req, res) => {
  try {
    const username = req.user?.username || 'user';
    const userId = req.user?.id || null;

    // Record activity log in MongoDB
    await createLog('LOGOUT', `User '${username}' logged out.`, null, userId, username);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[AuthController] Logout Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during logout.',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const currentUser = req.user;
    let userRecord = null;

    if (currentUser?.id) {
      userRecord = await User.findById(currentUser.id).select('-password');
    } else if (currentUser?.username) {
      userRecord = await User.findOne({ username: currentUser.username }).select('-password');
    }

    if (!userRecord) {
      return res.status(200).json({
        success: true,
        user: currentUser,
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: userRecord._id,
        username: userRecord.username,
        email: userRecord.email,
        fullName: userRecord.fullName,
        bio: userRecord.bio,
        avatar: userRecord.avatar,
        role: userRecord.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const currentUser = req.user;
    const { fullName, email, bio, avatar } = req.body;

    let user = null;
    if (currentUser?.id) {
      user = await User.findById(currentUser.id);
    }
    if (!user && currentUser?.username) {
      user = await User.findOne({ username: currentUser.username });
    }

    if (!user) {
      // If admin user doesn't exist yet in User collection, create it
      user = new User({
        username: currentUser.username,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: currentUser.role || 'Administrator',
      });
    }

    if (fullName !== undefined) user.fullName = fullName.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar !== undefined) user.avatar = avatar; // Base64 data URI

    await user.save();

    // Log profile update in MongoDB
    await createLog(
      'PROFILE_UPDATED',
      `User '${user.username}' updated profile and avatar.`,
      null,
      user._id,
      user.username
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[AuthController] UpdateProfile Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile.',
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const currentUser = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    let user = null;
    if (currentUser?.id) {
      user = await User.findById(currentUser.id);
    }
    if (!user && currentUser?.username) {
      user = await User.findOne({ username: currentUser.username });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    await createLog(
      'PROFILE_UPDATED',
      `User '${user.username}' changed their password.`,
      null,
      user._id,
      user.username
    );

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('[AuthController] ChangePassword Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to change password.',
    });
  }
};
