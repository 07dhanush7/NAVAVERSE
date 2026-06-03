import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios, { assetUrl } from "../../../api/axios";
const JobApplications = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/jobs/admin/applicants/${jobId}`);
        setJob(data.job || null);
        setApplications(data.applicants || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId]);

  const handleStatusChange = async (applicationId, status) => {
    try {
      const { data } = await axios.patch(
        `/jobs/admin/application-status/${applicationId}`,
        { status }
      );

      setApplications((current) =>
        current.map((application) =>
          application._id === applicationId
            ? { ...application, status: data.application.status }
            : application
        )
      );

      toast.success(data.message || "Application status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section">
        <div className="panel-header">
          <div>
            <h3>Job Applications</h3>
            <p className="section-subtitle">
              {job
                ? `Applications for: ${job.title}`
                : "Review candidate applications and update their status."}
            </p>
          </div>
        </div>

        <div className="dashboard-table-wrap">
          <table className="performance-table job-table">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Resume</th>
                <th>Cover Letter</th>
                <th>Application Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty">
                    No applications found for this job
                  </td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr key={application._id}>
                    <td>{application.applicantName}</td>
                    <td>{application.email}</td>
                    <td>{application.phone || "-"}</td>
                    <td>
                      <a
                        className="resume-link"
                        href={assetUrl(application.resume)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    </td>
                    <td>{application.coverLetter || "No cover letter"}</td>
                    <td>{new Date(application.applicationDate).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="status-select"
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobApplications;


