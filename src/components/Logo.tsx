export default function Logo({
  size = 28,
  showText = true,
}: {
  size?: number;
  showText?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 180 180"
        style={{ overflow: "visible" }}
        aria-hidden="true"
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
      {showText && (
        <span
          className="text-[#1C6B63]"
          style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700 }}
        >
          Fledgy
        </span>
      )}
    </span>
  );
}
