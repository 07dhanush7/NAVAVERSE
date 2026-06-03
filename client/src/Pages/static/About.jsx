import { Award, Blocks, Compass, Users } from "lucide-react";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
const pillars = [
  {
    icon: Blocks,
    title: "Connected Modules",
    description: "Blogs, Jobs, Events, Courses, and Startups live together in one unified journey.",
  },
  {
    icon: Compass,
    title: "Clear Direction",
    description: "Every page is designed to help users find the next step faster and with less friction.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "We bring learners, developers, founders, and opportunities into the same space.",
  },
  {
    icon: Award,
    title: "Premium Experience",
    description: "NAVAVERSE uses a clean, modern design system to keep the platform polished and usable.",
  },
];

const About = () => {
  return (
    <div className="static-page">
      <Navbar />

      <main className="static-main">
        <section className="static-hero">
          <p className="static-kicker">About NAVAVERSE</p>
          <h1>Build / Learn / Launch</h1>
          <p>
            NAVAVERSE is a platform connecting learners, developers, startups, and opportunities
            through Blogs, Jobs, Events, Courses, and Startups.
          </p>
        </section>

        <section className="static-section">
          <div className="static-grid-2">
            <article className="static-card">
              <h2>Who we are</h2>
              <p>
                We are building a single destination where content, discovery, and collaboration
                work together. The goal is to make the journey from reading to applying, joining,
                or creating feel natural.
              </p>
              <div className="static-pill-row">
                <span className="static-pill">Blogs</span>
                <span className="static-pill">Jobs</span>
                <span className="static-pill">Events</span>
                <span className="static-pill">Courses</span>
                <span className="static-pill">Startups</span>
              </div>
            </article>

            <article className="static-card">
              <h2>Mission</h2>
              <p>
                Build / Learn / Launch
              </p>
              <p>
                Our mission is to give the NAVAVERSE community one premium place to explore
                knowledge, opportunities, and startup growth without switching between disconnected
                tools.
              </p>
            </article>
          </div>
        </section>

        <section className="static-section">
          <div className="static-section-header">
            <h2>Why choose NAVAVERSE</h2>
            <p>
              We focus on clarity, structure, and consistency so every module feels like part of
              the same platform.
            </p>
          </div>

          <div className="static-grid-2">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article key={pillar.title} className="static-card">
                  <div className="static-icon" aria-hidden="true">
                    <Icon size={26} />
                  </div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;



