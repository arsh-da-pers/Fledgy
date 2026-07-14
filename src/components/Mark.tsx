export default function Mark({
  size = 32,
  opacity = 1,
  className = "",
}: {
  size?: number;
  opacity?: number;
  className?: string;
}) {
  return (
    <svg
      width={size * 0.67}
      height={size}
      viewBox="0 0 180 180"
      style={{ overflow: "visible", opacity }}
      aria-hidden="true"
      className={className}
    >
      <circle cx="90" cy="90" r="52" fill="#D9603F" />
      <text
        x="90"
        y="100"
        textAnchor="middle"
        fontFamily="'Dancing Script', cursive"
        fontWeight="700"
        fontSize="90"
        fill="#1C6B63"
        transform="rotate(90 90 90)"
      >
        f
      </text>
    </svg>
  );
}
