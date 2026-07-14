export default function HeroArt() {
  return (
    <svg
      viewBox="0 0 800 220"
      className="w-full"
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <circle cx="620" cy="55" r="48" fill="#D9603F" />
      <text
        x="620"
        y="64"
        textAnchor="middle"
        fontFamily="'Dancing Script', cursive"
        fontWeight="700"
        fontSize="83"
        fill="#1C6B63"
        transform="rotate(90 620 55)"
      >
        f
      </text>
      <path
        d="M0 150 C120 120 220 180 360 150 C480 125 560 170 800 135 L800 220 L0 220 Z"
        fill="#14b8a6"
      />
      <path
        d="M0 175 C140 155 260 200 400 175 C520 155 620 195 800 165 L800 220 L0 220 Z"
        fill="#0f766e"
      />
      <path
        d="M0 198 C160 182 300 210 450 195 C580 182 660 208 800 192 L800 220 L0 220 Z"
        fill="#134e4a"
      />
    </svg>
  );
}
