import { Title } from 'react-admin';
import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
    const [stats, setStats] = useState({
        activeOrders: 0,
        pendingTasks: 0,
        completedToday: 0,
        failedToday: 0,
        recentTasks: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch('/api/dashboard/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            padding: '24px',
            maxWidth: '1400px',
            margin: '0 auto',
        }}>
            <Title title="Dashboard" />

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '600',
                    color: '#f1f5f9',
                    marginBottom: '8px',
                    letterSpacing: '-0.5px',
                }}>
                    Warehouse Operations
                </h1>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                }}>
                    Real-time overview of your warehouse operations
                </p>
            </div>

            {/* KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px',
                marginBottom: '32px',
            }}>
                <KpiCard
                    title="Active Orders"
                    value={stats.activeOrders}
                    icon={<Package size={20} />}
                    color="#10b981"
                    bgColor="rgba(16, 185, 129, 0.1)"
                    loading={loading}
                />
                <KpiCard
                    title="Pending Tasks"
                    value={stats.pendingTasks}
                    icon={<Clock size={20} />}
                    color="#f59e0b"
                    bgColor="rgba(245, 158, 11, 0.1)"
                    loading={loading}
                />
                <KpiCard
                    title="Completed Today"
                    value={stats.completedToday}
                    icon={<CheckCircle size={20} />}
                    color="#22c55e"
                    bgColor="rgba(34, 197, 94, 0.1)"
                    loading={loading}
                />
                <KpiCard
                    title="Failed Today"
                    value={stats.failedToday}
                    icon={<XCircle size={20} />}
                    color="#ef4444"
                    bgColor="rgba(239, 68, 68, 0.1)"
                    loading={loading}
                />
            </div>

            {/* Recent Tasks Table */}
            <div style={{
                backgroundColor: '#1e293b',
                borderRadius: '12px',
                border: '1px solid #334155',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <TrendingUp size={20} style={{ color: '#10b981' }} />
                    <h2 style={{
                        fontWeight: '600',
                        fontSize: '16px',
                        color: '#f1f5f9',
                        margin: 0,
                    }}>
                        Recent Activity
                    </h2>
                </div>
                <div style={{ padding: '0' }}>
                    {loading ? (
                        <div style={{
                            padding: '48px',
                            textAlign: 'center',
                            color: '#64748b',
                        }}>
                            Loading...
                        </div>
                    ) : stats.recentTasks && stats.recentTasks.length > 0 ? (
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                        }}>
                            <thead>
                                <tr style={{
                                    backgroundColor: '#0f172a',
                                }}>
                                    <th style={{
                                        padding: '16px 24px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>Task ID</th>
                                    <th style={{
                                        padding: '16px 24px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>Order</th>
                                    <th style={{
                                        padding: '16px 24px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>Sequence</th>
                                    <th style={{
                                        padding: '16px 24px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>Completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentTasks.map((task, index) => (
                                    <tr key={task.id} style={{
                                        borderTop: '1px solid #334155',
                                        transition: 'background-color 0.15s',
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{
                                            padding: '16px 24px',
                                            color: '#f1f5f9',
                                            fontFamily: 'monospace',
                                            fontSize: '13px',
                                        }}>
                                            {task.id}
                                        </td>
                                        <td style={{
                                            padding: '16px 24px',
                                            color: '#cbd5e1',
                                            fontSize: '14px',
                                        }}>
                                            {task.warehouse_order_id}
                                        </td>
                                        <td style={{
                                            padding: '16px 24px',
                                            color: '#cbd5e1',
                                            fontSize: '14px',
                                        }}>
                                            #{task.sequence}
                                        </td>
                                        <td style={{
                                            padding: '16px 24px',
                                            color: '#94a3b8',
                                            fontSize: '13px',
                                        }}>
                                            {new Date(task.completed_at).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{
                            padding: '48px',
                            textAlign: 'center',
                            color: '#64748b',
                        }}>
                            <Clock size={32} style={{
                                marginBottom: '12px',
                                opacity: 0.5,
                            }} />
                            <div>No completed tasks today</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const KpiCard = ({ title, value, icon, color, bgColor, loading }) => (
    <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
    }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        {/* Background decoration */}
        <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: bgColor,
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
            opacity: 0.5,
        }} />

        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'relative',
        }}>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: '13px',
                    color: '#94a3b8',
                    marginBottom: '12px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    {title}
                </div>
                <div style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#f1f5f9',
                    lineHeight: 1,
                }}>
                    {loading ? '—' : value.toLocaleString()}
                </div>
            </div>
            <div style={{
                backgroundColor: bgColor,
                padding: '12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{ color }}>{icon}</div>
            </div>
        </div>
    </div>
);
