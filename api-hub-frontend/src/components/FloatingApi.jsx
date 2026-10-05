function FloatingApi({
  name,
  icon,
  className = "",
  color = "purple",
}) {
  return (
    <div className={`floating-api ${color} ${className}`}>
      <div className="floating-api-icon">
        {icon}
      </div>

      <span>{name}</span>
    </div>
  );
}

export default FloatingApi;