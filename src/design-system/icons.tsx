import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

/** The prototypes' line icons, drawn on a 24×24 grid. */
const PATHS = {
  plane: <Path d="M2 16l20-7-4 12-4-4-6 3 2-6-8 2z" />,
  back: <Path d="M15 18l-6-6 6-6" />,
  bell: (
    <>
      <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  user: (
    <>
      <Circle cx="12" cy="8" r="3.4" />
      <Path d="M5 20c1.4-3.6 4.2-5.5 7-5.5s5.6 1.9 7 5.5" />
    </>
  ),
  pin: (
    <>
      <Path d="M12 21s7-6.1 7-11a7 7 0 0 0-14 0c0 4.9 7 11 7 11z" />
      <Circle cx="12" cy="10" r="2.4" />
    </>
  ),
  refresh: (
    <>
      <Path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <Path d="M21 3v6h-6" />
    </>
  ),
  cancel: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="m9.5 9.5 5 5M14.5 9.5l-5 5" />
    </>
  ),
  check: <Polyline points="20 6 9 17 4 12" />,
  close: <Path d="M6 6l12 12M18 6L6 18" />,
  shield: (
    <>
      <Path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6z" />
      <Path d="m9 12 2 2 4-4" />
    </>
  ),
  card: (
    <>
      <Rect x="2" y="5" width="20" height="14" rx="2" />
      <Line x1="2" y1="10" x2="22" y2="10" />
    </>
  ),
  phone: (
    <>
      <Rect x="7" y="2" width="10" height="20" rx="2" />
      <Line x1="11" y1="18" x2="13" y2="18" />
    </>
  ),
  bank: (
    <>
      <Path d="M3 10l9-6 9 6" />
      <Path d="M5 10v9M10 10v9M14 10v9M19 10v9" />
      <Path d="M3 21h18" />
    </>
  ),
  star: <Path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  link: (
    <>
      <Path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <Path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </>
  ),
  help: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6" />
      <Path d="M12 17h.01" />
    </>
  ),
  users: (
    <>
      <Circle cx="9" cy="8" r="3.2" />
      <Path d="M3 20c1.1-3.2 3.4-5 6-5s4.9 1.8 6 5" />
      <Path d="M16 5.2a3 3 0 0 1 0 5.6" />
      <Path d="M18 15c1.4.6 2.4 2.2 3 5" />
    </>
  ),
  logout: (
    <>
      <Path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <Path d="M10 17l-5-5 5-5" />
      <Path d="M5 12h11" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  swap: (
    <>
      <Path d="M7 4v16M3 8l4-4 4 4" />
      <Path d="M17 20V4M13 16l4 4 4-4" />
    </>
  ),
  home: (
    <>
      <Path d="M3 11.5 12 4l9 7.5" />
      <Path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </>
  ),
  book: (
    <>
      <Path d="M4 7h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <Path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <Path d="M4 12h16" />
    </>
  ),
  trips: (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="2" />
      <Path d="M3 10h18" />
      <Path d="M8 3v4M16 3v4" />
      <Path d="M9 15l2.2 2L15 13" />
    </>
  ),
  checkin: (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="2" />
      <Path d="M3 10h18" />
      <Path d="M8 14l2 2 4-4" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {PATHS[name]}
    </Svg>
  );
}
