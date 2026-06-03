import Profile from "../models/Profile.js";

export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id })
      .populate("user", "email");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ profile });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, bio, phone } = req.body;

    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    profile.username = username || profile.username;
    profile.bio = bio || profile.bio;
    profile.phone = phone || profile.phone;

    if (req.file) {
      profile.profileImage = `/uploads/${req.file.filename}`;
    }

    const updated = await profile.save();

    res.status(200).json({ profile: updated });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};