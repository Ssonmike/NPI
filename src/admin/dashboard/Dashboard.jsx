import { Title } from 'react-admin';
import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

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
        <div style={{ padding: '20px' }}>
            <Title title="Dashboard" />
            <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
                Warehouse Operations Dashboard
            </h1>

            {/* KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px',
            }}>
                <KpiCard
                    title="Active Orders"
                    value={stats.activeOrders}
                    icon={<Package size={24} />}
                    color="#10b981"
                    loading={loading}
                />
                <KpiCard
                    title="Pending Tasks"
                    value={stats.pendingTasks}
                    icon={<Clock size={24} />}
                    color="#f59e0b"
                    loading={loading}
                />
                <KpiCard
                    title="Completed Today"
                    value={stats.completedToday}
                    icon={<CheckCircle size={24} />}
                    color="#22c55e"
                    loading={loading}
                />
                <KpiCard
                    title="Failed Today"
                    value={stats.failedToday}
                    icon={<XCircle size={24} />}
                    color="#ef4444"
                    loading={loading}
                />
            </div>

            {/* Recent Tasks Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #e5e7eb',
                    fontWeight: 'bold',
                    fontSize: '16px',
                }}>
                    Last 10 Completed Tasks
                </div>
                <div style={{ padding: '16px' }}>
                    {loading ? (
                        <div>Loading...</div>
                    ) : stats.recentTasks.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Task ID</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Warehouse Order</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Sequence</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Completed At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentTasks.map((task) => (
                                    <tr key={task.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '12px' }}>{task.id}</td>
                                        <td style={{ padding: '12px' }}>{task.warehouse_order_id}</td>
                                        <td style={{ padding: '12px' }}>{task.sequence}</td>
                                        <td style={{ padding: '12px' }}>
                                            {new Date(task.completed_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                            No completed tasks today
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const KpiCard = ({ title, value, icon, color, loading }) => (
    <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        borderLeft: `4px solid ${color}`,
        padding: '16px',
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    {title}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
                    {loading ? '—' : value}
                </div>
            </div>
            <div style={{ color }}>
                {icon}
            </div>
        </div>
    </div>
);
