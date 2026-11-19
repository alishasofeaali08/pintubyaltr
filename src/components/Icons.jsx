// Lightweight inline SVG icons so the UI has no extra icon dependency.

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const make = (paths) => function Icon(props) {
  return <svg {...base} {...props}>{paths}</svg>
}

export const HomeIcon = make(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" /><path d="M9.5 21v-6h5v6" /></>)
export const ServicesIcon = make(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>)
export const PlusIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>)
export const BellIcon = make(<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>)
export const UserIcon = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>)
export const HeartIcon = make(<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" />)
export const CommentIcon = make(<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.6 9.6 0 0 1-3.5-.6L3 21l1.7-5a8.1 8.1 0 0 1-.7-3.5 8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 8 8.4Z" />)
export const ShareIcon = make(<><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></>)
export const BookmarkIcon = make(<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />)
export const MoreIcon = make(<><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>)
export const MessageIcon = make(<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.6 9.6 0 0 1-3.5-.6L3 21l1.7-5a8.1 8.1 0 0 1-.7-3.5 8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 8 8.4Z" />)
export const CameraIcon = make(<><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.5" /></>)
export const CloseIcon = make(<path d="M18 6 6 18M6 6l12 12" />)
export const SendIcon = make(<><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></>)
export const CheckIcon = make(<path d="m5 12 4 4L19 6" />)
