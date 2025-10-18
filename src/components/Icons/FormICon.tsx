interface FormIconProps {
  className?: string;
}

export default function FormIcon({ className }: FormIconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
        <path d="M5 10C5.552 10 6 9.552 6 9C6 8.448 5.552 8 5 8C4.448 8 4 8.448 4 9C4 9.552 4.448 10 5 10Z" fill="currentColor" data-stroke="none" stroke="none"></path>{' '}
        <path d="M8.5 10C9.052 10 9.5 9.552 9.5 9C9.5 8.448 9.052 8 8.5 8C7.948 8 7.5 8.448 7.5 9C7.5 9.552 7.948 10 8.5 10Z" fill="currentColor" data-stroke="none" stroke="none"></path>{' '}
        <path d="M15.75 9.26318V6.75C15.75 5.646 14.855 4.75 13.75 4.75H3.25C2.145 4.75 1.25 5.646 1.25 6.75V11.25C1.25 12.354 2.145 13.25 3.25 13.25H8.34879"></path>{' '}
        <path d="M11.126 10.768L17.066 12.938C17.316 13.029 17.309 13.386 17.055 13.467L14.336 14.337L13.466 17.0561C13.385 17.3101 13.028 17.3171 12.937 17.0671L10.767 11.1271C10.685 10.9041 10.902 10.687 11.126 10.768Z"></path>
      </g>
    </svg>
  );
}
