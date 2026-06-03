import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Seo from "./Components/common/Seo";
import RouteLoader from "./Components/common/RouteLoader";

/* ================= USER PAGES ================= */
const Home = lazy(() => import("./Pages/home/Home"));
const About = lazy(() => import("./Pages/static/About"));
const Services = lazy(() => import("./Pages/static/Services"));
const Contact = lazy(() => import("./Pages/static/Contact"));
const Login = lazy(() => import("./Pages/auth/Login"));
const Register = lazy(() => import("./Pages/auth/Register"));
const ForgotPassword = lazy(() => import("./Pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/auth/ResetPassword"));
const BlogDetails = lazy(() => import("./Pages/blog/BlogDetails"));
const PublicProfile = lazy(() => import("./Pages/profile/PublicProfile"));
const BlogsPage = lazy(() => import("./Pages/blog/BlogsPage"));
const FeaturedBlogs = lazy(() => import("./Pages/home/FeaturedBlogs"));
const UpcomingBlogs = lazy(() => import("./Pages/home/UpcomingBlogs"));
const WriteBlog = lazy(() => import("./Pages/blog/WriteBlog"));
const JobsPage = lazy(() => import("./Pages/jobs/JobsPage"));
const JobDetails = lazy(() => import("./Pages/jobs/JobDetails"));
const ApplyJob = lazy(() => import("./Pages/jobs/ApplyJob"));
const AddJob = lazy(() => import("./Pages/jobs/AddJob"));
const MyJobApplications = lazy(() => import("./Pages/jobs/MyJobApplications"));
const TechHubPage = lazy(() => import("./Pages/Tech/TechHubPage"));
const Events = lazy(() => import("./Pages/events/Events"));
const AddEvent = lazy(() => import("./Pages/events/AddEvent"));
const EventDashboard = lazy(() => import("./Pages/events/Dashboard"));
const EventDetails = lazy(() => import("./Pages/events/EventDetails"));
const EventRegistrationSuccess = lazy(() => import("./Pages/events/EventRegistrationSuccess"));
const CoursesPage = lazy(() => import("./Pages/courses/CoursesPage"));
const AddCoursePage = lazy(() => import("./Pages/courses/AddCoursePage"));
const CourseDetails = lazy(() => import("./Pages/courses/CourseDetails"));
const StartupsPage = lazy(() => import("./Pages/startups/StartupsPage"));
const AddStartupPage = lazy(() => import("./Pages/startups/AddStartupPage"));
const StartupDetails = lazy(() => import("./Pages/startups/StartupDetails"));
const StartupRequestsPage = lazy(() => import("./Pages/startups/StartupRequestsPage"));
const UserDashboard = lazy(() => import("./Pages/dashboard/UserDashboard"));

/* ================= USER PROTECTION ================= */
import UserProtectedRoute from "./Components/common/ProtectedRoute";

/* ================= ADMIN PAGES ================= */
const AdminLogin = lazy(() => import("./Components/admin/AdminLogin"));
const Layout = lazy(() => import("./Pages/admin/Layout"));
const Dashboard = lazy(() => import("./Pages/admin/AdminDashboard"));
const AddBlog = lazy(() => import("./Pages/blog/AddBlog"));
const ListBlog = lazy(() => import("./Pages/blog/ListBlog"));
const Comments = lazy(() => import("./Pages/admin/Comments"));
const PendingBlogs = lazy(() => import("./Pages/admin/PendingBlogs"));
const JobsAdminPage = lazy(() => import("./Pages/admin/jobs/JobsAdminPage"));
const AdminJobApproval = lazy(() => import("./Pages/admin/jobs/AdminJobApproval"));
const JobApplications = lazy(() => import("./Pages/admin/jobs/JobApplications"));
const AdminEventsPage = lazy(() => import("./Pages/admin/events/AdminEventsPage"));
const AdminEventApproval = lazy(() => import("./Pages/admin/events/AdminEventApproval"));
const AdminCoursesPage = lazy(() => import("./Pages/admin/courses/AdminCoursesPage"));
const AdminCourseRequests = lazy(() => import("./Pages/admin/courses/AdminCourseRequests"));
const AdminStartupsPage = lazy(() => import("./Pages/admin/startups/AdminStartupsPage"));
const AdminStartupApproval = lazy(() => import("./Pages/admin/startups/AdminStartupApproval"));
const AdminStartupRequests = lazy(() => import("./Pages/admin/startups/AdminStartupRequests"));
const ChatbotWidget = lazy(() => import("./Components/common/ChatbotWidget"));

/* ================= ADMIN PROTECTION ================= */
import AdminProtectedRoute from "./Pages/admin/AdminProtectedRoute";

function App() {
  return (
    <div>
      <Seo />
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* USER ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/tech" element={<TechHubPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route
            path="/jobs/add"
            element={
              <UserProtectedRoute>
                <AddJob />
              </UserProtectedRoute>
            }
          />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route
            path="/events/registration-success"
            element={
              <UserProtectedRoute>
                <EventRegistrationSuccess />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/events/add"
            element={
              <UserProtectedRoute>
                <AddEvent />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/events/dashboard"
            element={
              <UserProtectedRoute>
                <EventDashboard />
              </UserProtectedRoute>
            }
          />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route
            path="/courses/add"
            element={
              <UserProtectedRoute>
                <AddCoursePage />
              </UserProtectedRoute>
            }
          />

          <Route path="/startups" element={<StartupsPage />} />
          <Route path="/startups/:id" element={<StartupDetails />} />
          <Route
            path="/startups/add"
            element={
              <UserProtectedRoute>
                <AddStartupPage />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/startups/requests"
            element={
              <UserProtectedRoute>
                <StartupRequestsPage />
              </UserProtectedRoute>
            }
          />

          <Route path="/featured" element={<FeaturedBlogs />} />
          <Route path="/upcoming" element={<UpcomingBlogs />} />
          <Route
            path="/write-blog"
            element={
              <UserProtectedRoute>
                <WriteBlog />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/jobs/apply/:id"
            element={
              <UserProtectedRoute>
                <ApplyJob />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/jobs/my-applicants"
            element={
              <UserProtectedRoute>
                <MyJobApplications />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <UserProtectedRoute>
                <UserDashboard />
              </UserProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <Layout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="addBlog" element={<AddBlog />} />
            <Route path="editBlog/:blogId" element={<AddBlog />} />
            <Route path="listBlog" element={<ListBlog />} />
            <Route path="comments" element={<Comments />} />
            <Route path="jobs" element={<JobsAdminPage />} />
            <Route path="jobs/approvals" element={<AdminJobApproval />} />
            <Route path="jobs/:jobId/applications" element={<JobApplications />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="events/approvals" element={<AdminEventApproval />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="courses/requests" element={<AdminCourseRequests />} />

            <Route path="startups" element={<AdminStartupsPage />} />
            <Route path="startups/approvals" element={<AdminStartupApproval />} />
            <Route path="startups/requests" element={<AdminStartupRequests />} />

            <Route path="/admin/pending-blogs" element={<PendingBlogs />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Suspense fallback={null}>
        <ChatbotWidget />
      </Suspense>
    </div>
  );
}

export default App;
