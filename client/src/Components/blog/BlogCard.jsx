import { memo } from "react";
import { Link } from "react-router-dom";
import { assetUrl } from "../../api/axios";

const fallbackImage = "https://via.placeholder.com/1200x720?text=NAVAVERSE+Blog";

const stripHtml = (value = "") => String(value).replace(/<[^>]*>/g, "");

const BlogCard = ({ blog }) => {
  const imageUrl = blog?.image ? assetUrl(encodeURI(blog.image)) : fallbackImage;
  const creatorName = blog?.creator?.username || blog?.author || "NAVAVERSE";
  const excerptSource = stripHtml(blog?.description || blog?.content || blog?.subtitle || "");
  const excerpt =
    excerptSource.length > 120 ? `${excerptSource.slice(0, 120)}...` : excerptSource;

  return (
    <Link to={`/blog/${blog?._id}`} className="blog-card">
      <div className="blog-image">
        <img src={imageUrl} alt={blog?.title || "NAVAVERSE blog"} loading="lazy" />
      </div>

      <div className="blog-card-content">
        {blog?.category && <span className="blog-category">{blog.category}</span>}
        <h3>{blog?.title || "Untitled Blog"}</h3>
        {excerpt && <p>{excerpt}</p>}

        <div className="blog-card-footer">
          <span>{creatorName}</span>
          {blog?.createdAt && (
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default memo(BlogCard);
