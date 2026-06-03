# Requirements Document - NAVAVERSE Blog Restructuring & Curated Content

## Objective
Enhance the NAVAVERSE MERN blog platform by restructuring the blog discovery experience and adding curated content sections (Featured and Upcoming) controlled by the admin panel.

## Functional Requirements

### 1. Dedicated Blogs Page
- **Path**: `/blogs`
- **Navbar Integration**: Add "Blogs" link to the Navbar.
- **Features**:
  - Move Search Bar from landing page to this page.
  - Move Blog Categories filter from landing page to this page.
  - Move main Blog List/Grid from landing page to this page.
  - Support for pagination or structured grid layout.

### 2. Landing Page (Home) Enhancements
- **Featured Blogs Section**:
  - Displayed below the hero section.
  - Shows blogs marked as `isFeatured`.
  - Visually highlighted design (cards or horizontal scroll).
  - "See All" link leading to `/featured-blogs`.
- **Upcoming Blogs Section**:
  - Displayed below the Featured section.
  - Shows blogs marked as `isUpcoming`.
  - Visual indicator like "Coming Soon".
  - "See All" link leading to `/upcoming-blogs`.

### 3. Curated Content Pages
- **Featured Blogs Page** (`/featured-blogs`): Displays all featured blogs in a grid.
- **Upcoming Blogs Page** (`/upcoming-blogs`): Displays all upcoming blogs in a grid.

### 4. Admin Panel Enhancements
- **Admin Blog Management**:
  - Ability to mark/unmark any blog as "Featured".
  - Ability to mark/unmark any blog as "Upcoming".
  - Status updates should be immediate (via API).

### 5. Backend Requirements
- **Schema Update**: Add `isFeatured` (Boolean, default: false) and `isUpcoming` (Boolean, default: false) to the Blog model.
- **Admin API**:
  - Endpoint to toggle featured status.
  - Endpoint to toggle upcoming status.
- **Public API**:
  - Endpoint to fetch featured blogs.
  - Endpoint to fetch upcoming blogs.

## Non-Functional Requirements
- **UI/UX**: Consistent dark coding-style theme.
- **Responsiveness**: Fully responsive layout for all new pages and sections.
- **Animations**: Smooth hover effects and transitions.

## Assumptions & Decisions
- **Search on Home**: The search bar will be removed from the Home page header to simplify the landing page and drive traffic to the Blogs page.
- **Upcoming Content**: Upcoming blogs will show a "Coming Soon" label. They may or may not be fully published; if not published, the "read more" functionality might be disabled or show a teaser.
- **Mutually Exclusive**: `isFeatured` and `isUpcoming` are not mutually exclusive. A blog can technically be both.
