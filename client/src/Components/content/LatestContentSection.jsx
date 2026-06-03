import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import ContentCard from "./ContentCard";
const LatestContentSection = ({
  title,
  apiPath,
  actionLabel,
  explorePath,
  detailPath,
}) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get(`${apiPath}?limit=4`);
        setItems(data.items || []);
      } catch (error) {
        console.error(`Failed to fetch ${title}:`, error);
      }
    };

    fetchItems();
  }, [apiPath, title]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="latest-content-section">
      <div className="latest-content-header">
        <div>
          <h2>{title}</h2>
          <p>Freshly approved opportunities and community content from NAVAVERSE.</p>
        </div>

        <button type="button" className="latest-content-link" onClick={() => navigate(explorePath)}>
          Explore All
        </button>
      </div>

      <div className="latest-content-grid">
        {items.map((item) => (
          <ContentCard
            key={item._id}
            item={item}
            actionLabel={actionLabel}
            onAction={() => navigate(detailPath(item))}
            onView={() => navigate(detailPath(item))}
          />
        ))}
      </div>
    </section>
  );
};

export default LatestContentSection;


