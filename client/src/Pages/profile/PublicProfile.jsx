import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios, { assetUrl } from "../../api/axios";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
const PublicProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const { data } = await axios.get(`/users/public/${id}`);
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching public profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [id]);

  if (loading) return <div className="modern-loader"></div>;
  if (!user) return <h2 className="mt-[50px] text-center">User not found</h2>;

  const imageUrl = user.profileImage
    ? assetUrl(user.profileImage)
    : "https://i.imgur.com/6VBx3io.png";

  return (
    <>
      <Navbar />
      <div className="profile-container mt-20 min-h-[60vh] text-center">
        <div className="profile-card inline-block rounded-[15px] bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-10 text-inherit">
          <img
            src={imageUrl}
            alt="profile"
            className="h-[150px] w-[150px] rounded-full border-4 border-current object-cover"
          />
          <h1 className="mt-5">{user.username}</h1>
          <p className="text-inherit">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          
          <div className="mt-[30px]">
            <span className="rounded-[20px] bg-[rgba(15,23,42,0.72)] px-[15px] py-2 text-sm">
              Navaverse Explorer 🚀
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PublicProfile;



