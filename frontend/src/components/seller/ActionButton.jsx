export default function ActionButton({
  label,
  icon,
  onClick,
  backgroundColor = "rgb(212, 54, 1)",
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-1.5 rounded-md text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap ${className}`}
      style={{ backgroundColor }}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {label}
    </button>
  );
}
