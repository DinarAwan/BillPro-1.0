import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Bell, Search, Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import useAuthStore from '../stores/authStore';
import useOrgStore from '../stores/orgStore';

export default function Layout() {
    const { fetchProfile, user } = useAuthStore();
    const { fetchOrganizations } = useOrgStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchOrganizations();
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 35, display: 'none' }} />
            )}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="main-content" style={{ marginLeft: 250 }}>
                {/* Top Bar */}
                <div className="top-bar print-hide">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Hamburger - hidden on desktop */}
                        <button className="hamburger" onClick={() => setSidebarOpen(true)}
                            style={{ display: 'none', alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 8, border: 'none', background: 'var(--color-bg-main)', cursor: 'pointer' }}>
                            <Menu size={20} style={{ color: 'var(--color-text-primary)' }} />
                        </button>
                        <div className="search-desktop" style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                            <input type="text" placeholder="Cari invoice, klien..."
                                style={{
                                    padding: '8px 14px 8px 36px', borderRadius: 10, width: 300,
                                    border: '1px solid var(--color-border)', background: 'var(--color-bg-main)',
                                    fontSize: 13, color: 'var(--color-text-primary)', outline: 'none'
                                }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button style={{
                            position: 'relative', padding: 8, borderRadius: 10, border: 'none',
                            background: 'var(--color-bg-main)', cursor: 'pointer'
                        }}>
                            <Bell size={18} style={{ color: 'var(--color-text-secondary)' }} />
                            <div style={{
                                position: 'absolute', top: 6, right: 6, width: 7, height: 7,
                                borderRadius: '50%', background: 'var(--color-danger)'
                            }} />
                        </button>
                        <div style={{ height: 24, width: 1, background: 'var(--color-border)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: 12, fontWeight: 600
                            }}>{user?.fullName?.charAt(0) || 'U'}</div>
                            <div className="search-desktop">
                                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.fullName}</p>
                                <p style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Free Plan</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main style={{ padding: 24, minHeight: 'calc(100vh - 57px)' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }} className="animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
