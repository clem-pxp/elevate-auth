interface PartyIconProps {
  className?: string;
}

export default function PartyIcon({ className }: PartyIconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
        <path d="M2.795,13.957L5.568,4.846c.22-.722,1.13-.95,1.664-.416l6.339,6.339c.534,.534,.306,1.444-.416,1.664l-9.112,2.773c-.765,.233-1.481-.482-1.248-1.248Z"></path>
        <line x1="6.825" y1="14.359" x2="4.654" y2="7.848"></line>
        <line x1="10.346" y1="13.287" x2="7.475" y2="4.673"></line>
        <path
          d="M16.743,2.492l-.946-.315-.316-.947c-.102-.306-.609-.306-.711,0l-.316,.947-.946,.315c-.153,.051-.257,.194-.257,.356s.104,.305,.257,.356l.946,.315,.316,.947c.051,.153,.194,.256,.355,.256s.305-.104,.355-.256l.316-.947,.946-.315c.153-.051,.257-.194,.257-.356s-.104-.305-.257-.356Z"
          fill="currentColor"
          data-stroke="none"
          stroke="none"
        ></path>
        <circle cx="12.75" cy="5.25" r=".75" fill="currentColor" data-stroke="none" stroke="none"></circle>
        <path d="M10,3.439c.184-.133,.588-.465,.823-1.048,.307-.763,.118-1.442,.055-1.64"></path>
        <path d="M14.561,8c.133-.184,.465-.588,1.048-.823,.763-.307,1.442-.118,1.64-.055"></path>
      </g>
    </svg>
  );
}
