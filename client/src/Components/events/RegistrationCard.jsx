const RegistrationCard = ({ registration, onApprove, onReject }) => {
  const isPending = registration.status === "Pending";

  return (
    <article className="registration-card card">
      <div className="registration-card-top">
        <div>
          <p className="registration-card-event">{registration.event.title}</p>
          <h3>{registration.applicantName}</h3>
        </div>
        <span
          className={`registration-status status-badge registration-status-${registration.status.toLowerCase()}`}
        >
          {registration.status}
        </span>
      </div>

      <div className="registration-card-grid">
        <div>
          <h4>Contact</h4>
          <p>{registration.email}</p>
          <p>{registration.phone || "No phone provided"}</p>
        </div>

        <div>
          <h4>Event Info</h4>
          <p>{registration.event.organizer}</p>
          <p>{`${registration.event.date} - ${registration.event.time}`}</p>
          <p>{registration.event.location}</p>
        </div>
      </div>

      <div className="registration-card-actions">
        {isPending ? (
          <>
            <button type="button" className="registration-card-btn approve" onClick={() => onApprove(registration._id)}>
              Approve
            </button>
            <button type="button" className="registration-card-btn reject" onClick={() => onReject(registration._id)}>
              Reject
            </button>
          </>
        ) : (
          <span className="registration-card-note">Registration already marked as {registration.status}.</span>
        )}
      </div>
    </article>
  );
};

export default RegistrationCard;


