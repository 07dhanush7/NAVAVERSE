import { useState } from "react";
import { formatEventDate, formatEventTime, getEventLocationLabel } from "../../utils/eventUi";
const RegistrationForm = ({ event, open, onClose, onSubmit, submitting }) => {
  const [phone, setPhone] = useState("");

  if (!open || !event) {
    return null;
  }

  const handleSubmit = (formEvent) => {
    formEvent.preventDefault();
    onSubmit({ phone });
  };

  return (
    <div className="registration-overlay" role="presentation" onClick={onClose}>
      <div className="registration-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="registration-modal-header">
          <div>
            <p className="registration-kicker">Event Registration</p>
            <h2>{event.title}</h2>
          </div>
          <button type="button" className="registration-close" onClick={onClose}>
            Close
          </button>
        </div>

        <p className="registration-event-meta">
          {formatEventDate(event.date)} at {formatEventTime(event.time)} • {getEventLocationLabel(event)}
        </p>
        <p className="registration-success-note">
          After confirmation, you will see: You have successfully registered.
        </p>

        <form className="registration-form" onSubmit={handleSubmit}>
          <label>
            Phone Number
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter your contact number"
              required
            />
          </label>

          <div className="registration-actions">
            <button type="button" className="registration-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="registration-submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Confirm Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;


