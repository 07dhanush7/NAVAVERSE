import Navbar from "../../Components/common/Navbar";
import Header from "../../Components/common/Header";
import Newsletter from "../../Components/common/Newsletter";
import Footer from "../../Components/common/Footer";

import FeaturedSection from "../../Components/blog/FeaturedSection";
import UpcomingSection from "../../Components/blog/UpcomingSection";
import UpcomingEventsSection from "../../Components/events/UpcomingEventsSection";
import JobSection from "../../Components/jobs/JobSection";
import BlogSection from "../../Components/blog/BlogSection";
import FeaturedStartupsSection from "../../Components/startups/FeaturedStartupsSection";
import FeaturedCoursesSection from "../../Components/courses/FeaturedCoursesSection";
const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <Header />

      <BlogSection />
      <JobSection />
      <FeaturedCoursesSection />
      <FeaturedStartupsSection />
      <UpcomingEventsSection />


      <FeaturedSection />
      <UpcomingSection />

      <Newsletter />
      <Footer />
    </div>
  );
};

export default Home;



