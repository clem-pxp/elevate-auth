interface CreditCardIconProps {
  className?: string;
}

export default function CreditCardIcon({ className }: CreditCardIconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
        <line x1="1.75" y1="7.25" x2="16.25" y2="7.25"></line>
        <rect x="1.75" y="3.75" width="14.5" height="10.5" rx="2" ry="2" transform="translate(18 18) rotate(180)"></rect>
        <line x1="4.25" y1="11.25" x2="7.25" y2="11.25"></line>
        <line x1="12.75" y1="11.25" x2="13.75" y2="11.25"></line>
      </g>
    </svg>
  );
}
