import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const siteName = "NAVAVERSE";
const siteDescription =
  "Explore NAVAVERSE jobs, events, courses, startups, and blogs in one connected platform.";

const routeSeo = [
  {
    match: /^\/$/,
    title: "NAVAVERSE | Jobs, Events, Courses, Startups and Blogs",
    description: siteDescription,
  },
  {
    match: /^\/blogs/,
    title: "Blogs | NAVAVERSE",
    description: "Read approved NAVAVERSE blogs, insights, articles, and community posts.",
  },
  {
    match: /^\/jobs/,
    title: "Jobs | NAVAVERSE",
    description: "Discover jobs, internships, and career opportunities on NAVAVERSE.",
  },
  {
    match: /^\/events/,
    title: "Events | NAVAVERSE",
    description: "Browse and register for approved NAVAVERSE events and community programs.",
  },
  {
    match: /^\/courses/,
    title: "Courses | NAVAVERSE",
    description: "Explore NAVAVERSE courses, lessons, and learning opportunities.",
  },
  {
    match: /^\/startups/,
    title: "Startups | NAVAVERSE",
    description: "Discover approved startups and collaboration opportunities on NAVAVERSE.",
  },
  {
    match: /^\/about/,
    title: "About | NAVAVERSE",
    description: "Learn about the NAVAVERSE platform and its connected ecosystem.",
  },
  {
    match: /^\/contact/,
    title: "Contact | NAVAVERSE",
    description: "Contact NAVAVERSE for support, collaboration, and platform questions.",
  },
];

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const upsertCanonical = (href) => {
  let element = document.head.querySelector("link[rel='canonical']");

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
};

const Seo = () => {
  const location = useLocation();

  useEffect(() => {
    const seo = routeSeo.find((item) => item.match.test(location.pathname)) || routeSeo[0];
    const canonicalUrl = `${window.location.origin}${location.pathname}`;

    document.title = seo.title;
    upsertMeta("meta[name='description']", {
      name: "description",
      content: seo.description,
    });
    upsertMeta("meta[property='og:title']", {
      property: "og:title",
      content: seo.title,
    });
    upsertMeta("meta[property='og:description']", {
      property: "og:description",
      content: seo.description,
    });
    upsertMeta("meta[property='og:type']", {
      property: "og:type",
      content: "website",
    });
    upsertMeta("meta[property='og:site_name']", {
      property: "og:site_name",
      content: siteName,
    });
    upsertMeta("meta[property='og:url']", {
      property: "og:url",
      content: canonicalUrl,
    });
    upsertMeta("meta[name='twitter:card']", {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertCanonical(canonicalUrl);
  }, [location.pathname]);

  return null;
};

export default Seo;
