// ─── StatusBadge ───────────────────────────────────────────────────────────────
// Reusable badge to show settlement status with color coding
const StatusBadge = ({ status }) => {
  const styles = {
    pending: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      text: "text-yellow-400",
      label: "⏳ Pending Confirmation",
    },
    confirmed: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
      label: "✅ Settled",
    },
    cancelled: {
      bg: "bg-white/5",
      border: "border-white/10",
      text: "text-white/30",
      label: "❌ Cancelled",
    },
  };

  const style = styles[status] || styles.pending;

  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full border font-medium
        ${style.bg} ${style.border} ${style.text}`}
    >
      {style.label}
    </span>
  );
};

export default StatusBadge;
