import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
import CourseBuilderForm from "../../Components/courses/CourseBuilderForm";
const AddCoursePage = () => {
  const navigate = useNavigate();

  return (
    <div className="content-form-page add-course-page">
      <Navbar />

      <main className="content-form-main">
        <section className="content-form-header">
          <p className="content-form-kicker">NAVAVERSE Creator Tools</p>
          <h1>Add Course</h1>
          <p>Submit a video-first course for review with lessons powered by YouTube.</p>
        </section>

        <CourseBuilderForm
          apiPath="/courses/create"
          submitLabel="Submit Course"
          onSuccess={() => navigate("/courses")}
        />
      </main>

      <Footer />
    </div>
  );
};

export default AddCoursePage;


