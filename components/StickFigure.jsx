export default function StickFigure({ size = 44 }) {
  const h = Math.round((size * 58) / 44);
  return (
    <svg
      className="stick-figure"
      width={size}
      height={h}
      viewBox="0 0 44 58"
      fill="none"
      stroke="#b5f23d"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="19" cy="7" r="6" />
      <line x1="19" y1="13" x2="19" y2="34" />
      <line x1="19" y1="22" x2="8" y2="27" />
      <g transform="translate(19,22)">
        <g className="wave-arm">
          <line x1="0" y1="0" x2="11" y2="-3" />
        </g>
      </g>
      <line x1="19" y1="34" x2="11" y2="48" />
      <line x1="19" y1="34" x2="27" y2="48" />
    </svg>
  );
}
