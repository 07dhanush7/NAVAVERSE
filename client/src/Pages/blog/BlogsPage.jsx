import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import CategoryBar from "../../Components/blog/CategoryBar";
import Bloglist from "../../Components/blog/Bloglist";
const BlogsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("search") || "";
  const [search, setSearch] = useState(searchQuery);

  const onSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(search)}`);
    } else {
      navigate("/blogs");
    }
  };

  const clearSearch = () => {
    setSearch("");
    navigate("/blogs");
  };

  return (
    <div className="blogs-page">
      <Navbar />
      <div className="blogs-header">
        <form className="blogs-search" onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
          {search && (
            <button type="button" className="clear-btn" onClick={clearSearch}>
              Clear
            </button>
          )}
        </form>
      </div>
      <CategoryBar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
      <Bloglist selectedCategory={selectedCategory} />
      <Footer />
    </div>
  );
};

export default BlogsPage;



