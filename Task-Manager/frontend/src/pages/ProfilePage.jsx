import React, { useState, useRef } from 'react';
import {
  User,
  Camera,
  Upload,
  Trash2,
  Lock,
  Mail,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { authService } from '../services/authService';
import {
  PasswordStrengthIndicator,
  checkPasswordStrength,
} from '../components/PasswordStrengthIndicator';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useNotification();

  const fileInputRef = useRef(null);

  // Profile fields state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Handle custom image file upload
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      showError('Image size exceeds 4MB. Please choose a smaller image.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target.result);
      showSuccess('Profile picture loaded. Click "Save Profile Changes" to apply.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Profile Update Submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const res = await authService.updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        bio: bio.trim(),
        avatar,
      });

      if (res.success && res.user) {
        updateUser(res.user);
        showSuccess('✓ Profile & avatar updated successfully');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Change Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Please fill in all password fields.');
      return;
    }

    const { isStrong } = checkPasswordStrength(newPassword);
    if (!isStrong) {
      showError('New password must be at least 8 characters long and contain uppercase, lowercase, a number, and a special symbol.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        showSuccess('✓ Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
          User Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Manage your personal details, profile picture, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Avatar & Personal Info */}
        <div className="lg:col-span-8 space-y-6">
          <form
            onSubmit={handleProfileSubmit}
            className="bg-surface rounded-3xl border border-borderMuted shadow-card p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-borderMuted">
              <div>
                <h2 className="text-base font-bold text-textMain">Profile Picture</h2>
                <p className="text-xs text-muted">Upload a custom photo or choose a preset.</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold">
                {user?.role || 'User'}
              </span>
            </div>

            {/* Avatar Preview & Upload Action */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-brand-200 bg-brand-50 flex items-center justify-center text-brand-700 shadow-md">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-extrabold uppercase">
                      {user?.username?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-2 bg-brand-700 hover:bg-brand-800 text-white rounded-2xl shadow-md border-2 border-surface transition-transform hover:scale-105"
                  title="Upload image"
                  aria-label="Upload profile image"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>

                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200/60 rounded-xl text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-muted">
                  Supports JPG, PNG, or WebP. Max file size 4MB.
                </p>

                {/* Preset Avatars */}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                    Or choose a preset:
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    {PRESET_AVATARS.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(presetUrl)}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-transform hover:scale-105 ${
                          avatar === presetUrl
                            ? 'border-brand-700 ring-2 ring-brand-700/30'
                            : 'border-borderMuted hover:border-brand-300'
                        }`}
                        aria-label={`Select avatar preset ${idx + 1}`}
                      >
                        <img
                          src={presetUrl}
                          alt={`Preset ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info Fields */}
            <div className="space-y-4 pt-4 border-t border-borderMuted">
              {/* Username (Read Only) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    disabled
                    value={user?.username || ''}
                    className="w-full pl-10 pr-4 py-2.5 bg-bgMain/80 border border-borderMuted rounded-xl text-sm text-textMain font-mono font-medium cursor-not-allowed opacity-80"
                  />
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Your unique account username cannot be changed.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Alex Henderson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bgMain/50 border border-borderMuted rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-bgMain/50 border border-borderMuted rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                  Bio / Notes <span className="text-muted text-[11px] font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Write a brief note or title for your profile..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bgMain/50 border border-borderMuted rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring resize-none transition-colors"
                />
              </div>
            </div>

            {/* Save Profile Button */}
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all focus-ring disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSavingProfile ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (4 cols): Change Password & Account Badge */}
        <div className="lg:col-span-4 space-y-6">
          {/* Account Overview Box */}
          <div className="bg-surface rounded-3xl border border-borderMuted shadow-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-textMain">Account Summary</h3>
            <div className="space-y-2.5 text-xs text-muted">
              <div className="flex items-center justify-between pb-2 border-b border-borderMuted/60">
                <span>Account Role:</span>
                <span className="font-semibold text-brand-800">{user?.role || 'User'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-borderMuted/60">
                <span>Status:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Security:</span>
                <span className="font-semibold text-textMain">Bcrypt Hashed</span>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <form
            onSubmit={handlePasswordSubmit}
            className="bg-surface rounded-3xl border border-borderMuted shadow-card p-6 space-y-4"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-borderMuted">
              <KeyRound className="w-4 h-4 text-brand-700" />
              <h3 className="text-sm font-bold text-textMain">Change Password</h3>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-9 bg-bgMain/50 border border-borderMuted rounded-xl text-xs text-textMain focus-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted hover:text-textMain"
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-9 bg-bgMain/50 border border-borderMuted rounded-xl text-xs text-textMain focus-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted hover:text-textMain"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <PasswordStrengthIndicator password={newPassword} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-bgMain/50 border border-borderMuted rounded-xl text-xs text-textMain focus-ring transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all focus-ring disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isChangingPassword ? (
                <span>Updating...</span>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
