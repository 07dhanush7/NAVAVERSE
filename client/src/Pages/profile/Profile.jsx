import { useCallback, useEffect, useRef, useState } from "react";
import axios, { assetUrl } from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
const Profile = () => {
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await axios.get("/users/profile");
      setUser(data.user);
    } catch (error) {
      console.error("Profile Fetch Error:", error);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(fetchProfile);
  }, [fetchProfile]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      await axios.put("/users/profile", formData);
      toast.success("Profile photo updated");
      fetchProfile();
    } catch (error) {
      toast.error("Upload failed");
      console.error(error);
    }
  };

  if (!user) return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        <h2>Loading profile...</h2>
      </div>
      <Footer />
    </div>
  );

  const imageUrl = user.profileImage
    ? assetUrl(user.profileImage)
    : "https://i.imgur.com/6VBx3io.png";

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-section">
            <img
              src={preview || imageUrl}
              alt="profile"
              className="profile-img"
            />
            <div className="edit-avatar-btn" onClick={() => fileInputRef.current.click()}>
              <span>✏️</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
            />
          </div>

          <div className="profile-info">
            <h1>{user.username}</h1>
            <p>{user.email}</p>
            
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Blogs Published</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Total Likes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>About Me</h2>
            <p className="leading-[1.6]">
              Welcome to my profile! I'm a passionate reader and writer on Navaverse. 
              I enjoy exploring diverse topics ranging from technology to lifestyle.
            </p>
          </div>

          <div className="profile-section">
            <h2>Recent Activity</h2>
            <p className="p-5 text-center">
              No recent activity to show. Start writing or interacting with blogs to see them here!
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;


