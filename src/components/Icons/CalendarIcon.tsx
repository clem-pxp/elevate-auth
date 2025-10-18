interface CalendarIconProps {
  className?: string;
}

export default function CalendarIcon({ className }: CalendarIconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
        <line x1="5.75" y1="2.75" x2="5.75" y2=".75"></line>
        <line x1="12.25" y1="2.75" x2="12.25" y2=".75"></line>
        <rect x="2.25" y="2.75" width="13.5" height="12.5" rx="2" ry="2"></rect>
        <line x1="2.25" y1="6.25" x2="15.75" y2="6.25"></line>
      </g>
    </svg>
  );
}
