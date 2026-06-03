# Implementation Plan - NAVAVERSE Blog Restructuring & Curated Content

## Workflow Steps

### [x] Step: Requirements
Create a Product Requirements Document (PRD) based on the feature description.
- [x] Review existing codebase
- [x] Analyze feature definition
- [x] Ask clarifying questions (if needed - assumptions made)
- [x] Save to `requirements.md`

### [x] Step: Technical Specification
Create a technical specification based on the PRD.
- [x] Review existing codebase architecture
- [x] Define implementation approach
- [x] Save to `spec.md`

### [ ] Step: Planning
Create a detailed implementation plan based on `spec.md`.
- [x] Break down the work into concrete tasks
- [x] Each task should reference relevant contracts and include verification steps
- [x] Update `plan.md` with tasks (Current step)

### [ ] Step: Backend Implementation
#### Tasks
- [ ] **B1: Update Blog Model**
  - Add `isFeatured` and `isUpcoming` boolean fields to `server/models/Blog.js`.
  - Verification: `npx jest` (if tests exist) or manual check of DB schema.
- [ ] **B2: Implement Admin API Endpoints**
  - Add `PATCH /api/admin/blogs/:id/featured` and `PATCH /api/admin/blogs/:id/upcoming` in `server/routes/adminRoutes.js` and `server/controllers/adminController.js`.
  - Verification: Test with Postman or Curl.
- [ ] **B3: Implement Public API Endpoints**
  - Add `GET /api/blogs/featured` and `GET /api/blogs/upcoming` in `server/routes/blogRoutes.js` and `server/controllers/blogController.js`.
  - Verification: Test with Postman or Curl.

### [ ] Step: Frontend Implementation - Core Pages
#### Tasks
- [ ] **F1: Create Blogs Page**
  - Create `client/src/Pages/Blogs.jsx`.
  - Move `Search Bar` (Header functionality), `CategoryBar`, and `Bloglist` from `Home.jsx` to `Blogs.jsx`.
  - Verification: Navigate to `/blogs` and check search/category filtering.
- [ ] **F2: Update Navbar**
  - Add "Blogs" link to `client/src/Components/Navbar.jsx`.
  - Verification: Check if "Blogs" link appears and works.
- [ ] **F3: Update Home Page (Landing Page)**
  - Modify `client/src/Pages/Home.jsx` to remove `CategoryBar` and `Bloglist`.
  - Modify `client/src/Components/Header.jsx` to remove the search form (or keep a simplified version).
  - Verification: Check Home page layout.

### [ ] Step: Frontend Implementation - Curated Sections
#### Tasks
- [ ] **F4: Create Featured Blogs Section**
  - Create `client/src/Components/FeaturedSection.jsx` (or similar).
  - Add it to `Home.jsx`.
  - Verification: Check if featured blogs appear on Home page.
- [ ] **F5: Create Upcoming Blogs Section**
  - Create `client/src/Components/UpcomingSection.jsx` (or similar).
  - Add it to `Home.jsx`.
  - Verification: Check if upcoming blogs appear on Home page.
- [ ] **F6: Create Dedicated Featured/Upcoming Pages**
  - Create `client/src/Pages/FeaturedBlogs.jsx` and `client/src/Pages/UpcomingBlogs.jsx`.
  - Verification: Navigate to `/featured-blogs` and `/upcoming-blogs`.

### [ ] Step: Frontend Implementation - Admin Panel
#### Tasks
- [ ] **F7: Update Admin Blog Management**
  - Update `client/src/Pages/admin/ListBlog.jsx` to include toggles for "Featured" and "Upcoming".
  - Verification: Check if toggles work and update the DB correctly.

### [ ] Step: Verification & Cleanup
#### Tasks
- [ ] **V1: Final Testing**
  - Verify all new pages are responsive.
  - Check animations and styling consistency.
  - Run lint/typecheck if applicable.
