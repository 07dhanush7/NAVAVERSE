import { Link } from "react-router-dom";
import Logo from "../../assets/Logo.webp";
const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Blogs", to: "/blogs" },
  { label: "Jobs", to: "/jobs" },
  { label: "Events", to: "/events" },
  { label: "Courses", to: "/courses" },
  { label: "Startups", to: "/startups" },
];

const companyLinks = [
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const platformLinks = [
  { label: "Add Blog", to: "/write-blog" },
  { label: "Add Job", to: "/jobs/add" },
  { label: "Add Startup", to: "/startups/add" },
  { label: "Add Course", to: "/courses/add" },
];

const FooterLinkList = ({ title, links }) => (
  <div className="footer-column">
    <h3>{title}</h3>
    <ul>
      {links.map((link) => (
        <li key={link.label}>
          <Link to={link.to} className="footer-link">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-background" aria-hidden="true" />

      <div className="footer-inner">
        <div className="footer-grid">
          <section className="footer-top footer-column footer-brand">
            <Link to="/" className="footer-logo-row" aria-label="NAVAVERSE home">
              <span className="footer-logo-mark">
                <img src={Logo} alt="NAVAVERSE logo" />
              </span>
              <span className="footer-logo-copy">
                <strong>NAVAVERSE</strong>
                <small>Build. Learn. Launch.</small>
              </span>
            </Link>

            <p className="footer-tagline">Build. Learn. Launch.</p>

            <p className="footer-description">
              NAVAVERSE brings blogs, jobs, events, startups, and courses into one connected
              platform for builders, learners, and founders.
            </p>
          </section>

          <FooterLinkList title="Explore" links={quickLinks} />
          <FooterLinkList title="Company" links={companyLinks} />
          <FooterLinkList title="Platform" links={platformLinks} />
        </div>

        <div className="footer-divider" aria-hidden="true" />

        <div className="footer-bottom">
          <p>&copy; 2026 NAVAVERSE</p>
          <p>Build &bull; Learn &bull; Launch</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


