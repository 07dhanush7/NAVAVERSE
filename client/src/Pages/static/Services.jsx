import { BookOpenText, BriefcaseBusiness, CalendarCheck2, GraduationCap, Handshake, LaptopMinimal } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
const services = [
  {
    icon: BookOpenText,
    title: "Blog Publishing",
    description: "Publish articles, stories, and insights that help the NAVAVERSE community learn faster.",
    path: "/blogs",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job Opportunities",
    description: "Browse curated job openings for professionals, freshers, and interns across sectors.",
    path: "/jobs",
  },
  {
    icon: CalendarCheck2,
    title: "Event Registration",
    description: "Discover and register for workshops, meetups, hackathons, and learning sessions.",
    path: "/events",
  },
  {
    icon: Handshake,
    title: "Startup Collaboration",
    description: "Connect with founders, collaborators, and innovation-driven startup teams.",
    path: "/startups",
  },
  {
    icon: GraduationCap,
    title: "Online Courses",
    description: "Explore learning paths and courses that help you grow your technical and creative skills.",
    path: "/courses",
  },
  {
    icon: LaptopMinimal,
    title: "Career Guidance",
    description: "Find guidance, direction, and opportunities to build a stronger career roadmap.",
    path: "/contact",
  },
];

const Services = () => {
  return (
    <div className="static-page">
      <Navbar />

      <main className="static-main">
        <section className="static-hero">
          <p className="static-kicker">NAVAVERSE Services</p>
          <h1>Built for learners, builders, and startups</h1>
          <p>
            NAVAVERSE connects content, opportunities, and collaboration in one polished platform
            so every visitor can move from discovery to action quickly.
          </p>
        </section>

        <section className="static-section">
          <div className="static-section-header">
            <h2>What we offer</h2>
            <p>
              Each service is designed to support the platform's core modules and give users a
              seamless place to explore, create, and grow.
            </p>
          </div>

          <div className="static-grid-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.title} className="static-card">
                  <div className="static-icon" aria-hidden="true">
                    <Icon size={26} />
                  </div>
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                  <Link to={service.path} className="static-button">
                    Explore
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="static-cta">
          <div className="static-cta-inner">
            <div>
              <h3>Need help choosing the right NAVAVERSE module?</h3>
              <p>Reach out to our team and we'll guide you to the right place to start.</p>
            </div>
            <Link to="/contact" className="static-button">
              Contact Us
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Services;



