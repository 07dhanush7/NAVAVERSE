import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../../api/axios";
import BlogCard from "./BlogCard";
const Bloglist = ({ selectedCategory }) => {
  const [blogs, setBlogs] = useState([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        let url = "/blog";
        const params = new URLSearchParams();
        
        if (searchQuery) {
          params.append("search", searchQuery);
        }
        
        if (selectedCategory && selectedCategory !== "All") {
          params.append("category", selectedCategory);
        }
        
        const queryString = params.toString();
        url = queryString ? `${url}?${queryString}` : url;
        
        const { data } = await axios.get(url);
        setBlogs(data.blogs);
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };

    fetchBlogs();
  }, [selectedCategory, searchQuery]);

  const filteredBlogs = blogs;

  return (
    <div className="bloglist-container">
      <h2>Latest Blogs</h2>

      <div className="bloglist-grid">
        {filteredBlogs.map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>
    </div>
  );
};

export default Bloglist;

