import Svg, { Circle, Ellipse, G, Path, Rect, Line } from "react-native-svg";

// Original vector artwork: invitation, arch and stage lights. No remote assets.
export default function EventArtwork() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 290">
      <Ellipse cx="162" cy="255" rx="128" ry="18" fill="#DFDFD1" />
      <G transform="rotate(-12 130 150)">
        <Rect x="41" y="38" width="153" height="213" rx="13" fill="#CDD7BB" />
        <Path d="M62 231V125a56 56 0 0 1 112 0v106" fill="#F2F2E7" />
        <Path d="M78 231V128a40 40 0 0 1 80 0v103" fill="#BCC9A7" />
        <Path d="M108 231V147a25 25 0 0 1 50 0v84" fill="#E6EAD9" />
        <Circle cx="118" cy="66" r="5" fill="#748163" />
      </G>
      <G transform="rotate(11 204 170)">
        <Rect x="128" y="79" width="142" height="175" rx="12" fill="#E47854" />
        <Rect
          x="141"
          y="92"
          width="116"
          height="149"
          rx="5"
          fill="none"
          stroke="#FFCAA9"
          strokeWidth="1"
        />
        <Path
          d="M184 119h30m-15-15v30m-11-25 22 22m0-22-22 22"
          stroke="#FFF4DF"
          strokeWidth="2"
        />
        <Path
          d="M160 161h79M170 171h59M176 205h45"
          stroke="#FFF4DF"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Path
          d="M158 225h9m6 0h4m7 0h8m7 0h4m7 0h10m8 0h10"
          stroke="#FFF4DF"
          strokeWidth="6"
        />
      </G>
      <Circle cx="265" cy="66" r="30" fill="#F6CF60" />
      <Path
        d="m250 66 10 10 19-21"
        stroke="#596044"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M25 154c-11-21-2-40 8-48M263 207c27-5 28-25 23-40"
        fill="none"
        stroke="#778664"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 5"
      />
      <Path
        d="m52 23 3-11 3 11 11 3-11 3-3 11-3-11-11-3ZM291 127l3-9 3 9 9 3-9 3-3 9-3-9-9-3Z"
        fill="#C74F2D"
      />
      <Circle cx="100" cy="15" r="3" fill="#A4B68A" />
      <Circle cx="302" cy="221" r="4" fill="#E6B760" />
      <Line
        x1="19"
        y1="206"
        x2="29"
        y2="211"
        stroke="#E47854"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}
