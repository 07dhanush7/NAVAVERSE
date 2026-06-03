import { useState } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import { isValidYouTubeUrl } from "../../utils/youtube";
const createLesson = () => ({
  title: "",
  videoUrl: "",
  duration: "",
  description: "",
});

const initialCourseForm = {
  title: "",
  description: "",
  instructor: "",
  duration: "",
  level: "Beginner",
  category: "",
};

const CourseBuilderForm = ({
  apiPath,
  submitLabel,
  formClassName = "",
  onSuccess,
}) => {
  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [lessons, setLessons] = useState([createLesson()]);
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCourseChange = (event) => {
    const { name, value } = event.target;
    setCourseForm((current) => ({ ...current, [name]: value }));
  };

  const updateLesson = (index, field, value) => {
    setLessons((current) =>
      current.map((lesson, lessonIndex) =>
        lessonIndex === index ? { ...lesson, [field]: value } : lesson
      )
    );
  };

  const addLesson = () => {
    setLessons((current) => [...current, createLesson()]);
  };

  const removeLesson = (index) => {
    setLessons((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)));
  };

  const resetForm = () => {
    setCourseForm(initialCourseForm);
    setLessons([createLesson()]);
    setImage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedLessons = lessons
      .map((lesson) => ({
        title: lesson.title.trim(),
        videoUrl: lesson.videoUrl.trim(),
        duration: lesson.duration.trim(),
        description: lesson.description.trim(),
      }))
      .filter((lesson) => lesson.title || lesson.videoUrl || lesson.duration || lesson.description);

    if (!normalizedLessons.length) {
      toast.error("Add at least one lesson before submitting the course");
      return;
    }

    const invalidLesson = normalizedLessons.find(
      (lesson) =>
        !lesson.title ||
        !lesson.videoUrl ||
        !lesson.duration ||
        !lesson.description ||
        !isValidYouTubeUrl(lesson.videoUrl)
    );

    if (invalidLesson) {
      toast.error("Each lesson needs a valid YouTube link, title, duration, and description");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();

      Object.entries(courseForm).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append("lessons", JSON.stringify(normalizedLessons));

      if (image) {
        formData.append("image", image);
      }

      const { data } = await axios.post(apiPath, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Your submission is under review");
      resetForm();

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit course");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={`content-form-card add-course-form-card ${formClassName}`.trim()} onSubmit={handleSubmit}>
      <div className="content-form-grid">
        <label>
          Title
          <input
            type="text"
            name="title"
            value={courseForm.title}
            onChange={handleCourseChange}
            placeholder="Full-Stack MERN Accelerator"
            required
          />
        </label>

        <label>
          Instructor
          <input
            type="text"
            name="instructor"
            value={courseForm.instructor}
            onChange={handleCourseChange}
            placeholder="Dhanush R"
            required
          />
        </label>

        <label>
          Duration
          <input
            type="text"
            name="duration"
            value={courseForm.duration}
            onChange={handleCourseChange}
            placeholder="8 weeks"
            required
          />
        </label>

        <label>
          Level
          <select name="level" value={courseForm.level} onChange={handleCourseChange} required>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </label>

        <label>
          Category
          <input
            type="text"
            name="category"
            value={courseForm.category}
            onChange={handleCourseChange}
            placeholder="Web Development"
            required
          />
        </label>

        <label>
          Image Upload
          <input
            type="file"
            accept="image/*"
            onChange={(submitEvent) => setImage(submitEvent.target.files?.[0] || null)}
          />
        </label>

        <label className="content-form-full">
          Description
          <textarea
            name="description"
            value={courseForm.description}
            onChange={handleCourseChange}
            placeholder="Describe the course outcomes, project flow, and who this course is built for."
            rows={6}
            required
          />
        </label>
      </div>

      <section className="course-lessons-builder">
        <div className="course-lessons-header">
          <div>
            <h2>Lessons</h2>
            <p>Add each YouTube lesson with its own title, duration, and description.</p>
          </div>
          <button type="button" className="content-form-btn lesson-add-btn" onClick={addLesson}>
            Add Lesson
          </button>
        </div>

        <div className="course-lessons-list">
          {lessons.map((lesson, index) => (
            <article key={`lesson-${index}`} className="course-lesson-card">
              <div className="course-lesson-card-header">
                <h3>Lesson {index + 1}</h3>
                <button type="button" onClick={() => removeLesson(index)} disabled={lessons.length === 1}>
                  Remove
                </button>
              </div>

              <div className="content-form-grid">
                <label>
                  Lesson Title
                  <input
                    type="text"
                    value={lesson.title}
                    onChange={(event) => updateLesson(index, "title", event.target.value)}
                    placeholder="Introduction to the MERN stack"
                    required
                  />
                </label>

                <label>
                  Duration
                  <input
                    type="text"
                    value={lesson.duration}
                    onChange={(event) => updateLesson(index, "duration", event.target.value)}
                    placeholder="12 min"
                    required
                  />
                </label>

                <label className="content-form-full">
                  YouTube Video URL
                  <input
                    type="url"
                    value={lesson.videoUrl}
                    onChange={(event) => updateLesson(index, "videoUrl", event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </label>

                <label className="content-form-full">
                  Description
                  <textarea
                    value={lesson.description}
                    onChange={(event) => updateLesson(index, "description", event.target.value)}
                    placeholder="What this lesson covers and what the learner will build."
                    rows={4}
                    required
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <button type="submit" className="content-form-btn add-course-submit-btn" disabled={submitting}>
        {submitting ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
};

export default CourseBuilderForm;


