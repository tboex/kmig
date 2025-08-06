import { useTheme } from '../contexts/ThemeContext';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({ width = 100, height = 30, className = "" }: LogoProps) {
  const { currentTheme } = useTheme();

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 60"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect
        width="200"
        height="60"
        rx="8"
        fill={currentTheme.colors.sub}
        stroke={currentTheme.colors.subAlt}
        strokeWidth="2"
      />

      {/* First part: 끝말 */}
      <text
        x="65"
        y="45"
        fontSize="40"
        fontWeight="bold"
        textAnchor="middle"
        fill={currentTheme.colors.main}
        className='black-han-sans-regular'
      >
        끝말
      </text>

      {/* Second part: 잇기 */}
      <text
        x="133"
        y="45"
        fontSize="40"
        fontWeight="bold"
        textAnchor="middle"
        fill={currentTheme.colors.bg}
        className='black-han-sans-regular'
      >
        잇기
      </text>

      {/* Accent elements */}
      {/* <circle
        cx="20"
        cy="20"
        r="6"
        fill={currentTheme.colors.main}
      />
      <circle
        cx="180"
        cy="40"
        r="4"
        fill={currentTheme.colors.sub}
      /> */}
    </svg>
  );
}
