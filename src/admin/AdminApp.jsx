import { Admin, Resource } from 'react-admin';
import { Package, ListChecks } from 'lucide-react';
import dataProvider from './dataProvider';
import { Dashboard } from './dashboard/Dashboard';
import { WarehouseOrderList } from './resources/warehouseOrders/List';
import { WarehouseOrderShow } from './resources/warehouseOrders/Show';
import { WarehouseTaskList } from './resources/warehouseTasks/List';
import { WarehouseTaskShow } from './resources/warehouseTasks/Show';

export default function AdminApp() {
    return (
        <Admin
            dataProvider={dataProvider}
            dashboard={Dashboard}
            title="PV Admin"
        >
            <Resource
                name="warehouse-orders"
                list={WarehouseOrderList}
                show={WarehouseOrderShow}
                icon={Package}
                options={{ label: 'Warehouse Orders' }}
            />
            <Resource
                name="tasks"
                list={WarehouseTaskList}
                show={WarehouseTaskShow}
                icon={ListChecks}
                options={{ label: 'Tasks' }}
            />
        </Admin>
    );
}
