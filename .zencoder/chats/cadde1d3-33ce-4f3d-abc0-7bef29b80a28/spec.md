# Technical Specification - NAVAVERSE Blog Restructuring & Curated Content

## Technical Context
- **Language**: JavaScript (Node.js/React)
- **Frontend Framework**: React
- **Backend Framework**: Express
- **Database**: MongoDB (Mongoose)
- **Styling**: Tailwind CSS / CSS Modules
- **State Management**: React Hooks (useState, useEffect)
- **API Client**: Axios
- **Routing**: React Router DOM

## Implementation Approach

### 1. Backend Changes
#### Blog Model Update
- **File**: `server/models/Blog.js`
- **Change**: Add `isFeatured` (Boolean, default: false) and `isUpcoming` (Boolean, default: false).

#### Admin Routes & Controller
- **File**: `server/routes/adminRoutes.js`, `server/controllers/adminController.js`
- **Action**: Add `toggleFeatured` and `toggleUpcoming` methods.
  - `PATCH /api/admin/blogs/:id/featured`
  - `PATCH /api/admin/blogs/:id/upcoming`

#### Public Routes & Controller
- **File**: `server/routes/blogRoutes.js`, `server/controllers/blogController.js`
- **Action**: Add endpoints to fetch featured and upcoming blogs.
  - `GET /api/blogs/featured` (Limit: 4-8 for sections, but also need all for pages)
  - `GET /api/blogs/upcoming` (Limit: 4-8 for sections, but also need all for pages)

### 2. Frontend Changes
#### Shared Logic
- **API Utilities**: Add functions to fetch featured and upcoming blogs.

#### New Components
- **FeaturedBlogsSection**: For Home page.
- **UpcomingBlogsSection**: For Home page.

#### New Pages
- **BlogsPage**: Container for Search, Categories, and Bloglist.
- **FeaturedBlogsPage**: Grid for all featured blogs.
- **UpcomingBlogsPage**: Grid for all upcoming blogs.

#### Page Modifications
- **Home.jsx**:
  - Remove `CategoryBar` and `Bloglist`.
  - Modify `Header` to remove search (or create a simplified Hero).
  - Add `FeaturedBlogsSection` and `UpcomingBlogsSection`.
- **Navbar.jsx**:
  - Add "Blogs" link.
- **Admin Pages**:
  - Update `ListBlog.jsx` to show and toggle `isFeatured` and `isUpcoming` statuses.

## Source Code Structure Changes
- **Client**:
  - `src/Pages/Blogs.jsx` (New)
  - `src/Pages/FeaturedBlogs.jsx` (New)
  - `src/Pages/UpcomingBlogs.jsx` (New)
  - `src/Components/FeaturedBlogsSection.jsx` (New)
  - `src/Components/UpcomingBlogsSection.jsx` (New)
- **Server**: (Existing files updated)

## Data Model Changes
```javascript
// Blog.js
isFeatured: { type: Boolean, default: false },
isUpcoming: { type: Boolean, default: false },
```

## API Changes
- `PATCH /api/admin/blogs/:id/featured`
- `PATCH /api/admin/blogs/:id/upcoming`
- `GET /api/blogs/featured`
- `GET /api/blogs/upcoming`

## Verification Approach
- **Linting**: Run project lint command (e.g., `npm run lint` in client/server if available).
- **Manual Testing**:
  - Verify "Blogs" link in navbar.
  - Verify search and categories work correctly on the new Blogs page.
  - Verify admin can toggle featured/upcoming statuses.
  - Verify featured/upcoming sections appear on Home page.
  - Verify dedicated pages display the correct blogs.
