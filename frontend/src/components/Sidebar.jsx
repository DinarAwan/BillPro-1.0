import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, CreditCard, Building2, Crown, LogOut, ChevronRight, X } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useOrgStore from '../stores/orgStore';
import logo from '../assets/BillPro.logo.png';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/invoices', icon: FileText, label: 'Invoice' },
    { to: '/clients', icon: Users, label: 'Klien' },
    { to: '/payments', icon: CreditCard, label: 'Pembayaran' },
    { to: '/organization', icon: Building2, label: 'Organisasi' },
    { to: '/subscription', icon: Crown, label: 'Langganan' },
];

export default function Sidebar({ isOpen, onClose }) {
    const { logout } = useAuthStore();
    const { user } = useAuthStore();
    const { currentOrg } = useOrgStore();
    const location = useLocation();

    const handleNavClick = () => {
        if (onClose) onClose();
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{
            width: 250, minWidth: 250, height: '100vh', position: 'fixed', left: 0, top: 0,
            background: 'linear-gradient(180deg, #0c4a6e 0%, #0e7490 50%, #0891b2 100%)',
            display: 'flex', flexDirection: 'column', zIndex: 40,
            boxShadow: '4px 0 16px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease'
        }}>
            {/* Logo */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={logo} alt="BillPro" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'contain' }} />
                    <div>
                        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>BillPro</h1>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Invoice Management</p>
                    </div>
                </div>
                {/* Close button - only visible on mobile */}
                <button onClick={onClose} className="hamburger" style={{
                    display: 'none', alignItems: 'center', justifyContent: 'center',
                    padding: 4, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', cursor: 'pointer'
                }}>
                    <X size={18} style={{ color: 'white' }} />
                </button>
            </div>

            {/* Organization */}
            {currentOrg && (
                <div style={{ padding: '12px 16px', margin: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Organisasi</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentOrg.name}</p>
                </div>
            )}

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map(({ to, icon: Icon, label }) => {
                        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
                        return (
                            <NavLink key={to} to={to} className="nav-item" onClick={handleNavClick} style={{
                                ...(isActive && { background: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 600 })
                            }}>
                                <Icon size={18} />
                                <span style={{ flex: 1 }}>{label}</span>
                                {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            {/* User Profile */}
            <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 13, fontWeight: 600
                    }}>{user?.fullName?.charAt(0) || 'U'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                    </div>
                </div>
                <button onClick={logout} style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
                    fontSize: 13
                }}>
                    <LogOut size={14} /> Log out
                </button>
            </div>
        </aside>
    );
}
