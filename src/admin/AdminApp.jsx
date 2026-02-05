import { Admin, Resource, defaultTheme } from 'react-admin';
import { Package, ListChecks } from 'lucide-react';
import dataProvider from './dataProvider';
import { Dashboard } from './dashboard/Dashboard';
import { WarehouseOrderList } from './resources/warehouseOrders/List';
import { WarehouseOrderShow } from './resources/warehouseOrders/Show';
import { WarehouseTaskList } from './resources/warehouseTasks/List';
import { WarehouseTaskShow } from './resources/warehouseTasks/Show';

const customTheme = {
    ...defaultTheme,
    palette: {
        mode: 'dark',
        primary: { main: '#10b981' },
        secondary: { main: '#6366f1' },
        background: {
            default: '#0f172a',
            paper: '#1e293b',
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", sans-serif',
        fontSize: 14,
    },
    shape: { borderRadius: 8 },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1e293b',
                    boxShadow: 'none',
                    borderBottom: '1px solid #334155',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                },
            },
        },
    },
};

export default function AdminApp() {
    return (
        <Admin
            dataProvider={dataProvider}
            dashboard={Dashboard}
            title="Pallet Visualizer"
            theme={customTheme}
            disableTelemetry
        >
            <Resource
                name="warehouse-orders"
                list={WarehouseOrderList}
                show={WarehouseOrderShow}
                icon={Package}
            />
            <Resource
                name="tasks"
                list={WarehouseTaskList}
                show={WarehouseTaskShow}
                icon={ListChecks}
            />
        </Admin>
    );
}