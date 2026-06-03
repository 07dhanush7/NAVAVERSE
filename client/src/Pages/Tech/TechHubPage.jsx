import { Link } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
const opportunities = [
  {
    icon: "J",
    title: "Tech Jobs",
    description:
      "Discover IT and non-IT job opportunities including government jobs, private sector roles, and internships.",
    cta: "Explore Jobs",
    path: "/jobs",
  },
  {
    icon: "E",
    title: "Tech Events",
    description:
      "Stay updated with hackathons, workshops, meetups, and technology conferences happening around the community.",
    cta: "Explore Events",
    path: "/events",
  },
  {
    icon: "C",
    title: "Tech Courses",
    description:
      "Learn new technologies through curated courses, tutorials, and training programs.",
    cta: "Explore Courses",
    path: "/courses",
  },
  {
    icon: "S",
    title: "Tech Startups",
    description:
      "Explore startup ideas, founder journeys, and collaboration-ready ventures building inside the NAVAVERSE ecosystem.",
    cta: "Explore Startups",
    path: "/startups",
  },
];

const TechHubPage = () => {
  return (
    <div className="tech-hub-page">
      <Navbar />

      <main className="tech-hub-main">
        <section className="tech-hub-hero">
          <p className="tech-hub-kicker">NAVAVERSE TECH HUB</p>
          <h1>Explore Tech Opportunities</h1>
          <p className="tech-hub-description">
            Discover jobs, events, courses, and startups that help you grow in the technology
            ecosystem.
          </p>
        </section>

        <section className="tech-hub-grid">
          {opportunities.map((item) => (
            <article key={item.title} className="tech-hub-card">
              <div className="tech-hub-icon" aria-hidden="true">
                {item.icon}
              </div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <Link to={item.path} className="tech-hub-button">
                {item.cta}
              </Link>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TechHubPage;



