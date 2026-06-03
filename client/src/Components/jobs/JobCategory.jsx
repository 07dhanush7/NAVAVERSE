const JobCategory = ({ selectedCategory, setCategory }) => {
  const categories = [
    "All",
    "KAS",
    "Central Govt",
    "Private IT",
    "Private Non-IT",
    "Internship",
  ];

  return (
    <div className="job-category-shell">
      <div className="job-category-heading">
        <p className="job-category-kicker">Job Categories</p>
        <h3>Browse by sector</h3>
      </div>

      <div className="job-category-container">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`job-category-card ${selectedCategory === category ? "active" : ""}`}
            onClick={() => setCategory(category)}
          >
            <span>{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default JobCategory;


