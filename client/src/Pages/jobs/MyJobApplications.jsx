import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios, { assetUrl } from "../../api/axios";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/common/Footer";
const getStatusClass = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "approved") return "status-approved";
  if (value === "rejected") return "status-rejected";
  return "status-pending";
};

const MyJobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/applications/my-jobs");
        setApplications(data.applications || data.items || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load applicants");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleStatusChange = async (applicationId, status) => {
    try {
      const { data } = await axios.patch(`/applications/my-jobs/${applicationId}/status`, {
        status,
      });

      setApplications((current) =>
        current.map((application) =>
          application._id === applicationId
            ? { ...application, status: data.application.status }
            : application
        )
      );

      toast.success(data.message || "Application status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update application");
    }
  };

  return (
    <div className="my-job-applications-page">
      <Navbar />

      <main className="my-job-applications-main">
        <section className="my-job-applications-card">
          <div className="my-job-applications-heading">
            <p className="my-job-applications-eyebrow">Owner Dashboard</p>
            <h1>Applicants for My Jobs</h1>
            <p>Review the people who applied to jobs you posted after admin approval.</p>
          </div>

          {loading ? (
            <div className="applications-empty">Loading applicants...</div>
          ) : applications.length === 0 ? (
            <div className="applications-empty">No applicants for your jobs yet.</div>
          ) : (
            <div className="applications-list">
              {applications.map((application) => (
                <article key={application._id} className="application-card">
                  <div className="application-top">
                    <div>
                      <p className="application-job">{application.job.title}</p>
                      <h2>{application.applicantName}</h2>
                      <p className="application-meta">{application.applicantEmail}</p>
                      {application.phone ? (
                        <p className="application-meta">{application.phone}</p>
                      ) : null}
                    </div>
                    <div className="application-top-right">
                      <span className={`status-badge ${getStatusClass(application.status)}`}>
                        {application.status}
                      </span>
                      <span className="application-date">
                        {new Date(application.appliedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="application-grid">
                    <div>
                      <h3>Job Details</h3>
                      <p>{application.job.companyName}</p>
                      <p>{application.job.location}</p>
                    </div>

                    <div>
                      <h3>Resume</h3>
                      <a
                        href={assetUrl(application.resume)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Resume
                      </a>
                    </div>

                    <div>
                      <h3>Details</h3>
                      <p>{application.details || "No extra details provided."}</p>
                    </div>

                    <div>
                      <h3>Status</h3>
                      <select
                        value={application.status}
                        onChange={(event) =>
                          handleStatusChange(application._id, event.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MyJobApplications;


