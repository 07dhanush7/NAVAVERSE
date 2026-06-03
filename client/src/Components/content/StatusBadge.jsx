const StatusBadge = ({ status }) => {
  const rawStatus = String(status || "pending").toLowerCase();
  const normalizedStatus =
    rawStatus === "accepted"
      ? "approved"
      : rawStatus === "declined"
        ? "rejected"
        : rawStatus;
  const statusLabel =
    normalizedStatus === "approved"
      ? "Approved"
      : normalizedStatus === "rejected"
        ? "Rejected"
        : "Pending";
  const statusIcon =
    normalizedStatus === "approved" ? "🟢" : normalizedStatus === "rejected" ? "🔴" : "🟡";

  return (
    <span className={`status-badge status-${normalizedStatus}`}>
      <span aria-hidden="true">{statusIcon}</span>
      <span>{statusLabel}</span>
    </span>
  );
};

export default StatusBadge;