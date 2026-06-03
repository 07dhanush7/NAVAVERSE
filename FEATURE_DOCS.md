# NAVAVERSE - Featured & Upcoming Blogs Feature

## Overview
This implementation adds curated blog sections to NAVAVERSE with admin controls for managing featured and upcoming blogs.

## Features Implemented

### 1. Backend Changes

#### MongoDB Schema Updates (`server/models/Blog.js`)
- Added `isFeatured` boolean field (default: false)
- Added `isUpcoming` boolean field (default: false)

#### New API Endpoints (`server/routes/blogRoutes.js`)
- **Public Routes:**
  - `GET /blog/featured` - Get all featured blogs
  - `GET /blog/upcoming` - Get all upcoming blogs
  
- **Admin Routes:**
  - `PUT /blog/featured/:id` - Toggle featured status
  - `PUT /blog/upcoming/:id` - Toggle upcoming status

#### Controller Methods (`server/controllers/blogController.js`)
- `toggleFeatured()` - Toggle featured status of a blog
- `toggleUpcoming()` - Toggle upcoming status of a blog
- `getFeaturedBlogs()` - Fetch all featured blogs
- `getUpcomingBlogs()` - Fetch all upcoming blogs

### 2. Frontend Changes

#### New Pages
- **BlogsPage.jsx** - Dedicated page with search and category filtering
- **FeaturedBlogs.jsx** - Display all featured blogs
- **UpcomingBlogs.jsx** - Display all upcoming blogs

#### New Components
- **FeaturedSection.jsx** - Horizontal scrollable section for featured blogs on homepage
- **UpcomingSection.jsx** - Horizontal scrollable section for upcoming blogs on homepage

#### Enhanced Components
- **BlogCard.jsx** - Added visual "Coming Soon" badge for upcoming blogs
- **Navbar.jsx** - Added navigation links to Blogs, Featured, and Upcoming pages
- **AddBlog.jsx** - Added checkboxes for featuring and marking blogs as upcoming
- **BlogTableItem.jsx** - Added columns and toggle buttons for featured/upcoming statuses
- **ListBlog.jsx** - Updated table header to display new columns

#### Routes Updated (`App.jsx`)
- `/blogs` - Dedicated blogs listing page
- `/featured` - Featured blogs page
- `/upcoming` - Upcoming blogs page

### 3. UI/UX Improvements
- Responsive dark theme consistent with NAVAVERSE
- "Coming Soon" badge on upcoming blog cards
- Smooth hover animations
- "See All" links in homepage sections
- Clean admin interface with toggle buttons for managing statuses

## Admin Dashboard Usage

### Adding a New Blog with Featured/Upcoming Flags
1. Navigate to Admin → Add Blog
2. Fill in blog details (title, subtitle, image, content, etc.)
3. Use the new checkboxes to:
   - Mark as Featured
   - Mark as Upcoming
4. Click "Add Blog"

### Managing Blog Statuses
1. Navigate to Admin → List Blogs
2. View the new "Featured" and "Upcoming" columns
3. Use the toggle buttons to:
   - Feature/Unfeature blogs
   - Mark/Unmark as upcoming
   - Publish/Unpublish
   - Delete

## Frontend User Experience

### Homepage
- Featured section displaying latest featured blogs
- Upcoming section displaying blogs marked as upcoming
- Both sections have "See All" links to dedicated pages

### Navigation
- "Blogs" link - Full blog listing with search and categories
- "Featured" link - All featured blogs
- "Upcoming" link - All upcoming blogs

## Database Fields

### Blog Schema
```javascript
{
  ...existing fields,
  isFeatured: Boolean (default: false),
  isUpcoming: Boolean (default: false)
}
```

## API Authentication
- Public endpoints (`GET /blog/featured`, `GET /blog/upcoming`) - No auth required
- Admin endpoints (`PUT /blog/featured/:id`, `PUT /blog/upcoming/:id`) - Admin token required

## Notes
- Featured blogs must be published to appear in the featured section
- Upcoming blogs can be unpublished (they show as coming soon)
- Admin token is auto-attached via axios interceptor for admin routes
