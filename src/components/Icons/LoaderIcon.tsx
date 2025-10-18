interface LoaderIconProps {
  className?: string;
}

export default function LoaderIcon({ className }: LoaderIconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
        <path d="M9 16.25C13.0041 16.25 16.25 13.0041 16.25 9C16.25 4.99594 13.0041 1.75 9 1.75" stroke="url(#paint0_linear_4812_6)" strokeWidth="1.5"></path>{' '}
        <path d="M9 16.25C4.99594 16.25 1.75 13.0041 1.75 9C1.75 4.99594 4.99594 1.75 9 1.75" stroke="url(#paint1_linear_4812_6)" strokeWidth="1.5"></path>{' '}
        <circle cx="9" cy="16.25" r="0.75" fill="currentColor" data-stroke="none" stroke="none"></circle>{' '}
        <defs data-stroke="none" stroke="none">
          {' '}
          <linearGradient id="paint0_linear_4812_6" x1="9" y1="2.5" x2="9" y2="16.25" gradientUnits="userSpaceOnUse" data-stroke="none" stroke="none">
            {' '}
            <stop stopOpacity="0.5" data-stroke="none" stroke="none"></stop> <stop offset="1" data-stroke="none" stroke="none"></stop>{' '}
          </linearGradient>{' '}
          <linearGradient id="paint1_linear_4812_6" x1="9" y1="2.5" x2="9" y2="16.25" gradientUnits="userSpaceOnUse" data-stroke="none" stroke="none">
            {' '}
            <stop stopOpacity="0.5" data-stroke="none" stroke="none"></stop> <stop offset="1" stopOpacity="0" data-stroke="none" stroke="none"></stop>{' '}
          </linearGradient>{' '}
        </defs>
      </g>
    </svg>
  );
}
