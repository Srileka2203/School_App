import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from '../../../components/common/Navbar';
import { api } from '../../../services/api';
import {
  BellIcon,
  CheckCircleIcon,
  MailIcon,
  SparklesIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  TargetIcon,
  CalendarIcon,
  XIcon,
} from '../../../components/common/Icons';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'lead' | 'deal' | 'system' | 'task';
  timestamp: string;
  read: boolean;
}

export const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'lead' | 'deal'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get<any>('/notifications');
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      if (list.length > 0) {
        setNotifications(
          list.map((n: any) => ({
            id: n.id,
            title: n.title || 'Notification',
            description: n.message || n.description || '',
            category: (n.category || 'system').toLowerCase() as any,
            timestamp: n.createdAt ? new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
            read: Boolean(n.isRead ?? n.read),
          }))
        );
      } else {
        setNotifications([]);
      }
    } catch {
      // If endpoint not reachable, keep empty
      setNotifications([]);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all', {});
    } catch {
      // Ignore network errors in local dev
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    window.dispatchEvent(new CustomEvent('crm:notifications-updated'));
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
    } catch {
      // Ignore network errors in local dev
    }
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    window.dispatchEvent(new CustomEvent('crm:notifications-updated'));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'lead') return n.category === 'lead';
    if (filter === 'deal') return n.category === 'deal';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lead':
        return <TargetIcon size={16} />;
      case 'deal':
        return <TrendingUpIcon size={16} />;
      case 'task':
        return <CalendarIcon size={16} />;
      default:
        return <BellIcon size={16} />;
    }
  };

  return (
    <div className="crm-page-container">
      <Navbar />

      <main className="crm-main-content">
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <div className="page-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="section-icon-badge" style={{ width: '38px', height: '38px', borderRadius: '10px' }}>
                <BellIcon size={20} />
              </span>
              <div>
                <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  Notifications &amp; Alerts
                </h1>
                <p className="page-subtitle" style={{ fontSize: '0.85rem' }}>
                  Real-time activity alerts, deal updates, and system communications
                </p>
              </div>
            </div>
          </div>

          <div className="page-actions-group">
            {unreadCount > 0 && (
              <button
                type="button"
                className="crm-btn crm-btn-secondary crm-btn-sm"
                onClick={markAllAsRead}
                style={{ height: '38px' }}
              >
                <CheckCircleIcon size={15} />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              type="button"
              className="refresh-btn-secondary"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCwIcon size={16} className={isRefreshing ? 'icon-spin' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* View Switcher Filter */}
        <div className="ld-view-switcher ld-view-mode-group" style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`ld-view-btn ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            type="button"
            className={`ld-view-btn ${filter === 'unread' ? 'is-active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            className={`ld-view-btn ${filter === 'lead' ? 'is-active' : ''}`}
            onClick={() => setFilter('lead')}
          >
            Leads
          </button>
          <button
            type="button"
            className={`ld-view-btn ${filter === 'deal' ? 'is-active' : ''}`}
            onClick={() => setFilter('deal')}
          >
            Deals
          </button>
        </div>

        {/* Notifications List */}
        <div className="crm-card" style={{ padding: '0.5rem', borderRadius: '16px' }}>
          {filteredNotifications.length === 0 ? (
            <div className="empty-state-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <CheckCircleIcon size={36} style={{ color: '#10B981', margin: '0 auto 0.75rem' }} />
              <h3 className="empty-state-title" style={{ fontSize: '1rem', fontWeight: 700 }}>
                All Caught Up!
              </h3>
              <p className="empty-state-desc" style={{ fontSize: '0.82rem', color: '#64748B' }}>
                You have no notifications in this category.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderRadius: '10px',
                    borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
                    background: n.read ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: n.read ? 'rgba(100, 116, 139, 0.15)' : '#10B981',
                        color: n.read ? '#64748B' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getCategoryIcon(n.category)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.92rem' }}>{n.title}</strong>
                        {!n.read && (
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#EF4444',
                              display: 'inline-block',
                            }}
                          />
                        )}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.25rem 0 0' }}>{n.description}</p>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.35rem', display: 'block' }}>
                        {n.timestamp}
                      </span>
                    </div>
                  </div>

                  {!n.read && (
                    <button
                      type="button"
                      className="lg-link-btn"
                      onClick={() => markAsRead(n.id)}
                      style={{ fontSize: '0.75rem', color: '#10B981', flexShrink: 0 }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;
