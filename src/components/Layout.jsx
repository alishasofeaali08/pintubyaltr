import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { OPEN_COMPOSER_EVENT } from '../lib/events'
import {
  BellIcon,
  CheckIcon,
  HomeIcon,
  PlusIcon,
  ServicesIcon,
  UserIcon,
} from './Icons'

const currentYear = new Date().getFullYear()

const serviceLinks = [
  { label: 'Property Listings', to: '/marketplace' },
  { label: 'Rental Management' },
  { label: 'Payment Management' },
  { label: 'Maintenance Requests' },
]

export default function Layout() {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeMenu, setActiveMenu] = useState(null)
  const navRef = useRef(null)

  useEffect(() => {
    const isAuthPage = ['/login', '/signup'].includes(location.pathname)
    document.body.classList.toggle('auth-background', isAuthPage)
    return () => document.body.classList.remove('auth-background')
  }, [location.pathname])

  useEffect(() => {
    const closeOnOutside = (event) => {
      if (!navRef.current?.contains(event.target)) setActiveMenu(null)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setActiveMenu(null)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const toggleMenu = (menu) => {
    setActiveMenu((current) => (current === menu ? null : menu))
  }

  const openComposer = () => {
    setActiveMenu(null)
    if (location.pathname === '/' || location.pathname === '/community') {
      window.dispatchEvent(new CustomEvent(OPEN_COMPOSER_EVENT))
    } else {
      navigate('/', { state: { compose: true } })
    }
  }

  const handleLogout = async () => {
    setActiveMenu(null)
    await signOut()
    navigate('/login')
  }

  const isHome = location.pathname === '/' || location.pathname === '/community'
  const isServices = location.pathname === '/marketplace'
  const isProfile = ['/dashboard', '/admin'].includes(location.pathname)

  return (
    <div className="app-shell">
      <main className="page-content">
        <Outlet />
      </main>

      <footer className="site-footer">© {currentYear} PINTU · The Gateway to Better Property Living.</footer>

      <div className="bottom-nav-wrap" ref={navRef}>
        {activeMenu === 'services' && (
          <div className="nav-popover left" role="menu" aria-label="Services">
            <p className="popover-title">Services</p>
            {serviceLinks.map(({ label, to }) => (to ? (
              <NavLink key={label} to={to} className="popover-item" onClick={() => setActiveMenu(null)} role="menuitem">
                {label}
                <CheckIcon className="popover-check" />
              </NavLink>
            ) : (
              <button type="button" className="popover-item disabled" key={label} disabled role="menuitem">
                {label}<span className="popover-badge">Soon</span>
              </button>
            )))}
          </div>
        )}

        {activeMenu === 'notifications' && (
          <div className="nav-popover right" role="dialog" aria-label="Notifications">
            <p className="popover-title">Notifications</p>
            <div className="popover-note">
              <BellIcon />
              <strong>Announcements from PINTU</strong>
              <p>Campaigns and platform updates from our admin team will appear here.</p>
            </div>
          </div>
        )}

        {activeMenu === 'profile' && (
          <div className="nav-popover right" role="menu" aria-label="Profile menu">
            <p className="popover-title">{user ? `Hi, ${user.name}` : 'Account'}</p>
            {user ? (
              <>
                <NavLink to="/dashboard" className="popover-item" onClick={() => setActiveMenu(null)} role="menuitem">My Profile</NavLink>
                <NavLink to="/dashboard" className="popover-item" onClick={() => setActiveMenu(null)} role="menuitem">Dashboard &amp; Wallet</NavLink>
                <NavLink to="/marketplace" className="popover-item" onClick={() => setActiveMenu(null)} role="menuitem">My Listings</NavLink>
                {isAdmin && <NavLink to="/admin" className="popover-item" onClick={() => setActiveMenu(null)} role="menuitem">Admin Portal</NavLink>}
                <button type="button" className="popover-item disabled" disabled role="menuitem">Account Settings <span className="popover-badge">Soon</span></button>
                <button type="button" className="popover-item nav-action" onClick={handleLogout} role="menuitem">Log Out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="popover-item" onClick={() => setActiveMenu(null)} role="menuitem">Log In</NavLink>
                <NavLink to="/signup" className="popover-item" onClick={() => setActiveMenu(null)} role="menuitem">Sign Up</NavLink>
                <NavLink to="/admin/login" className="popover-item" onClick={() => setActiveMenu(null)} role="menuitem">Admin Login</NavLink>
              </>
            )}
          </div>
        )}

        <nav className="bottom-nav" aria-label="Main navigation">
          <div className="bottom-nav-inner">
            <NavLink to="/" className={`nav-icon-btn${isHome ? ' active' : ''}`} aria-label="Home" title="Home">
              <HomeIcon />
              <span className="nav-label">Home</span>
            </NavLink>

            <button
              type="button"
              className={`nav-icon-btn${isServices || activeMenu === 'services' ? ' active' : ''}`}
              aria-label="Services"
              aria-expanded={activeMenu === 'services'}
              title="Services"
              onClick={() => toggleMenu('services')}
            >
              <ServicesIcon />
              <span className="nav-label">Services</span>
            </button>

            <button type="button" className="nav-icon-btn nav-plus" aria-label="Create post" title="Create post" onClick={openComposer}>
              <PlusIcon />
            </button>

            <button
              type="button"
              className={`nav-icon-btn${activeMenu === 'notifications' ? ' active' : ''}`}
              aria-label="Notifications"
              aria-expanded={activeMenu === 'notifications'}
              title="Notifications"
              onClick={() => toggleMenu('notifications')}
            >
              <BellIcon />
              <span className="nav-label">Alerts</span>
            </button>

            <button
              type="button"
              className={`nav-icon-btn${isProfile || activeMenu === 'profile' ? ' active' : ''}`}
              aria-label="Profile"
              aria-expanded={activeMenu === 'profile'}
              title="Profile"
              onClick={() => toggleMenu('profile')}
            >
              <UserIcon />
              <span className="nav-label">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}
