import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { createLog } from '../services/logService.js';
import { eventBus } from '../events/eventBus.js';
import { EVENT_TYPES } from '../events/eventTypes.js';

// Password strength validator: >=8 chars, uppercase, lowercase, number, special char
export const isStrongPassword = (pass) => {
  if (!pass || typeof pass !== 'string') return false;
  if (pass.length < 8) return false;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);
  return hasUpper && hasLower && hasNumber && hasSpecial;
};

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

    if (/\s/.test(trimmedUser)) {
      return res.status(400).json({
        success: false,
        message: 'Username cannot contain whitespace spaces.',
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special symbol (!@#$%^&*).',
      });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';

    // Check if username or email already exists in database
    const existingUser = await User.findOne({
      $or: [
        { username: trimmedUser },
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
      ],
    });
    const adminUser = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();

    if (existingUser || trimmedUser === adminUser) {
      return res.status(409).json({
        success: false,
        message: existingUser?.email === cleanEmail && cleanEmail
          ? 'Email address is already registered. Please log in instead.'
          : 'Username is already taken. Please choose another username.',
      });
    }

    // Create new user in MongoDB
    const newUser = new User({
      username: trimmedUser,
      email: cleanEmail,
      fullName: fullName ? fullName.trim() : '',
      avatar: avatar || '',
      password,
      role: 'User',
      authProvider: 'local',
    });

    await newUser.save();

    // Asynchronously dispatch domain event for registration
    eventBus.publish(
      EVENT_TYPES.USER_REGISTERED,
      { user: newUser },
      { userId: newUser._id, username: newUser.username }
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
        message: 'Username/email and password are required.',
      });
    }

    const inputIdentifier = username.trim().toLowerCase();
    const adminUser = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    // Search user in MongoDB by username OR email (case-insensitive)
    let user = await User.findOne({
      $or: [
        { username: inputIdentifier },
        { email: inputIdentifier },
      ],
    });

    // Auto-seed admin record if credentials match env admin
    if (!user && (inputIdentifier === adminUser || inputIdentifier === 'admin@taskflow.dev')) {
      if (password === adminPass) {
        user = new User({
          username: adminUser,
          email: 'admin@taskflow.dev',
          password: adminPass,
          role: 'Administrator',
          fullName: 'System Administrator',
        });
        await user.save();
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.',
      });
    }

    // Verify password: check user's bcrypt hash or admin fallback
    let isMatch = false;
    if (user.password) {
      isMatch = await user.comparePassword(password);
    }
    if (!isMatch && user.role === 'Administrator' && password === adminPass) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.',
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

    // Asynchronously dispatch domain event for login
    eventBus.publish(
      EVENT_TYPES.USER_LOGGED_IN,
      { user, authMethod: 'password' },
      { userId: user._id, username: user.username }
    );

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

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special symbol (!@#$%^&*).',
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

export const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address or username.',
      });
    }

    const cleanId = identifier.trim().toLowerCase();

    // Find user by either username or email
    const user = await User.findOne({
      $or: [{ username: cleanId }, { email: cleanId }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found matching that email or username.',
      });
    }

    // Generate 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    await user.save();

    await createLog(
      'PASSWORD_RESET_REQUESTED',
      `Password reset code requested for '${user.username}'.`,
      null,
      user._id,
      user.username
    );

    return res.status(200).json({
      success: true,
      message: 'Password reset code generated. Use the code below to reset your password.',
      resetCode,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error('[AuthController] ForgotPassword Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process forgot password request.',
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { identifier, resetCode, newPassword } = req.body;

    if (!identifier || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Identifier, reset code, and new password are required.',
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special symbol (!@#$%^&*).',
      });
    }

    const cleanId = identifier.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ username: cleanId }, { email: cleanId }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (!user.resetPasswordToken || user.resetPasswordToken !== resetCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset code. Please check and try again.',
      });
    }

    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new code.',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await createLog(
      'PASSWORD_RESET_COMPLETED',
      `Password successfully reset for '${user.username}'.`,
      null,
      user._id,
      user.username
    );

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (error) {
    console.error('[AuthController] ResetPassword Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password.',
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;

    let gEmail = req.body.email;
    let gName = req.body.name;
    let gAvatar = req.body.avatar;
    let gId = req.body.googleId;

    // 1. If an OAuth2 access token is provided, verify it directly with Google UserInfo API
    if (accessToken && (!gEmail || !gId)) {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (userInfoRes.ok) {
          const uInfo = await userInfoRes.json();
          gEmail = uInfo.email || gEmail;
          gName = uInfo.name || uInfo.given_name || gName;
          gAvatar = uInfo.picture || gAvatar;
          gId = uInfo.sub || gId;
        }
      } catch (tokenErr) {
        console.warn('[GoogleAuth] Google userinfo fetch warning:', tokenErr.message);
      }
    }

    // 2. Decode and verify Google ID Token (credential) if passed
    if (credential) {
      // First try Google's official tokeninfo endpoint
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.ok) {
          const verified = await verifyRes.json();
          gEmail = verified.email || gEmail;
          gName = verified.name || verified.given_name || gName;
          gAvatar = verified.picture || gAvatar;
          gId = verified.sub || gId;
        }
      } catch (verifyErr) {
        console.warn('[GoogleAuth] Google tokeninfo verify warning:', verifyErr.message);
      }

      // Fallback: Parse JWT payload via base64url
      if (!gEmail && !gId) {
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            let payload = null;
            try {
              payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
            } catch (b64urlErr) {
              const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
              payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
            }

            if (payload) {
              // Verify expiration
              if (payload.exp && Date.now() >= payload.exp * 1000) {
                return res.status(401).json({
                  success: false,
                  message: 'Google authentication session expired. Please sign in again.',
                });
              }

              gEmail = payload.email || gEmail;
              gName = payload.name || payload.given_name || gName;
              gAvatar = payload.picture || gAvatar;
              gId = payload.sub || gId;
            }
          }
        } catch (err) {
          console.warn('[GoogleAuth] Local JWT decode warning:', err.message);
        }
      }
    }

    if (!gEmail && !gId) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication requires email or Google ID.',
      });
    }

    const cleanEmail = gEmail ? gEmail.trim().toLowerCase() : '';

    // Check if user exists by googleId or email
    let user = null;
    if (gId) {
      user = await User.findOne({ googleId: gId });
    }
    if (!user && cleanEmail) {
      user = await User.findOne({ email: cleanEmail });
    }

    if (user) {
      // Update Google ID and avatar if needed
      if (!user.googleId && gId) user.googleId = gId;
      if (!user.avatar && gAvatar) user.avatar = gAvatar;
      if (!user.fullName && gName) user.fullName = gName;
      if (user.authProvider !== 'google' && !user.authProvider) user.authProvider = 'google';
      await user.save();
    } else {
      // Create new user for this Google account
      let baseUsername = (
        cleanEmail ? cleanEmail.split('@')[0] : (gName || 'google_user').replace(/\s+/g, '').toLowerCase()
      )
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      if (baseUsername.length < 3) baseUsername = 'user_' + Math.floor(100 + Math.random() * 900);

      let candidateUsername = baseUsername;
      let suffix = 1;
      while (await User.findOne({ username: candidateUsername })) {
        candidateUsername = `${baseUsername}${suffix++}`;
      }

      const randomPassword = 'G_' + Math.random().toString(36).slice(-10) + '!' + Date.now();

      user = new User({
        username: candidateUsername,
        email: cleanEmail,
        fullName: gName || '',
        avatar: gAvatar || '',
        googleId: gId || `google_${Date.now()}`,
        authProvider: 'google',
        password: randomPassword,
        role: 'User',
      });

      await user.save();

      await createLog(
        'USER_REGISTERED',
        `New user registered via Google Auth: '${candidateUsername}'`,
        null,
        user._id,
        user.username
      );
    }

    // Sign JWT token for the user
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    await createLog('LOGIN', `User '${user.username}' logged in via Google Auth.`, null, user._id, user.username);

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
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
    console.error('[AuthController] GoogleAuth Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during Google authentication.',
    });
  }
};

