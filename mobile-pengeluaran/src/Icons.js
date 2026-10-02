import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export function BackIcon({ width = 16, height = 16, color = '#0F172A' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M10 12L6 8L10 4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronDownIcon({ width = 18, height = 18, color = '#64748B' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5 7.5L10 12.5L15 7.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon({ width = 12, height = 12, color = '#36665A' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M6 4L10 8L6 12"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HeaderUserIcon({ width = 14, height = 14, color = '#FFFFFF' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
        fill={color}
      />
      <Path
        d="M2.5 14C2.5 11.5147 4.96243 9.5 8 9.5C11.0376 9.5 13.5 11.5147 13.5 14"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function InfoIcon({ width = 14, height = 14, color = '#64748B' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" />
      <Path d="M8 7.5V11.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="8" cy="4.8" r="0.8" fill={color} />
    </Svg>
  );
}

export function PlusIcon({ width = 14, height = 14, color = '#FFFFFF' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 3V13M3 8H13"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ReloadIcon({ width = 14, height = 14, color = '#36665A' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M13.5 8C13.5 11.0376 11.0376 13.5 8 13.5C4.96243 13.5 2.5 11.0376 2.5 8C2.5 4.96243 4.96243 2.5 8 2.5C10.1264 2.5 11.9774 3.71101 12.892 5.5M13.5 2.5V5.5H10.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SuccessIcon({ width = 18, height = 18, color = '#166534' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.6" />
      <Path
        d="M6.5 10L9 12.5L13.5 7.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckIcon({ width = 14, height = 14, color = '#FFFFFF' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AlertCircleIcon({ width = 14, height = 14, color = '#BA1A1A' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" />
      <Path d="M8 4.5V8.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="8" cy="11.2" r="0.8" fill={color} />
    </Svg>
  );
}

export function ReceiptIcon({ width = 15, height = 15, color = '#64748B' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 2V22L7 20L10 22L13 20L16 22L19 20L22 22V2L19 4L16 2L13 4L10 2L7 4L4 2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8 8H16M8 12H16M8 16H12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function CalendarIcon({ width = 15, height = 15, color = '#0F172A' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth="1.8" />
      <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function LockIcon({ width = 15, height = 15, color = '#0F172A' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="10" width="16" height="12" rx="2" stroke={color} strokeWidth="1.8" />
      <Path
        d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10"
        stroke={color}
        strokeWidth="1.8"
      />
    </Svg>
  );
}

export function SaveIcon({ width = 16, height = 16, color = '#FFFFFF' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M17 21V13H7V21M7 3V8H15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function TrashIcon({ width = 16, height = 16, color = '#BA1A1A' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6H21M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M10 11V17M14 11V17" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function ClearIcon({ width = 16, height = 16, color = '#94A3B8' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
      <Path d="M15 9L9 15M9 9L15 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function CutleryIcon({ width = 16, height = 16, color = '#36665A' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 2V22M18 6C19.6569 6 21 4.65685 21 3C21 2 20 2 20 2V6M3 2V8C3 9.65685 4.34315 11 6 11V22M9 2V8C9 9.65685 7.65685 11 6 11M6 2V8"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function GraduationCapIcon({ width = 16, height = 16, color = '#36665A' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 10L12 5L2 10L12 15L22 10ZM22 10V16M6 12.5V17C6 18.5 8.68629 20 12 20C15.3137 20 18 18.5 18 17V12.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TransportIcon({ width = 16, height = 16, color = '#36665A' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="3" width="16" height="15" rx="3" stroke={color} strokeWidth="1.8" />
      <Path d="M4 9H20M4 14H20M8 18L6 21M16 18L18 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="8" cy="11.5" r="1" fill={color} />
      <Circle cx="16" cy="11.5" r="1" fill={color} />
    </Svg>
  );
}

export function TheaterMasksIcon({ width = 16, height = 16, color = '#36665A' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 9C2 5 6 3 11 3C16 3 20 5 20 9C20 14 16 18 11 18C6 18 2 14 2 9Z"
        stroke={color}
        strokeWidth="1.8"
      />
      <Circle cx="7.5" cy="8.5" r="1" fill={color} />
      <Circle cx="14.5" cy="8.5" r="1" fill={color} />
      <Path d="M8 13.5C9 14.5 13 14.5 14 13.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function NoCategoryIcon({ width = 16, height = 16, color = '#64748B' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <Path d="M6 6L18 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function EmptyIcon({ width = 32, height = 32, color = '#64748B' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4H20V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V4Z"
        stroke={color}
        strokeWidth="1.8"
      />
      <Path d="M9 10H15M9 14H13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function FileSearchNotFoundIcon({ width = 48, height = 48 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 48 48" fill="none">
      {/* File Document */}
      <Path
        d="M14 8C14 6.89543 14.8954 6 16 6H26L34 14V34C34 35.1046 33.1046 36 32 36H16C14.8954 36 14 35.1046 14 34V8Z"
        stroke="#64748B"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M26 6V14H34" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" />
      {/* Magnifier on document */}
      <Circle cx="23" cy="24" r="5" stroke="#64748B" strokeWidth="2" />
      <Path d="M26.5 27.5L30 31" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
      {/* Alert badge on bottom right */}
      <Circle cx="35" cy="35" r="6" fill="#FEE2E2" stroke="#BA1A1A" strokeWidth="1.5" />
      <Path d="M35 32.5V35.5" stroke="#BA1A1A" strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="35" cy="37.5" r="0.7" fill="#BA1A1A" />
    </Svg>
  );
}

export function LightbulbIcon({ width = 16, height = 16, color = '#36665A' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18H15M10 21H14M12 3C8.13401 3 5 6.13401 5 10C5 12.3824 6.19176 14.4866 8 15.7335V17C8 17.5523 8.44772 18 9 18H15C15.5523 18 16 17.5523 16 17V15.7335C17.8082 14.4866 19 12.3824 19 10C19 6.13401 15.866 3 12 3Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArrowLeftIcon({ width = 16, height = 16, color = '#FFFFFF' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M13 8H3M3 8L7 4M3 8L7 12"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
