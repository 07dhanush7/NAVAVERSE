const categories = [
  "All",
  "Technology",
  "Startup",
  "Lifestyle",
  "Social Affairs",
  "Finance",
  "Education",
  "Movies & Series",
  "Travel & Explore",
  "Foods & Reviews",
  "Sports",
  "Others"
];

const CategoryBar = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="category-bar">
      {categories.map((cat) => (
        <button
          key={cat}
          className={selectedCategory === cat ? "active" : ""}
          onClick={() => setSelectedCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;

