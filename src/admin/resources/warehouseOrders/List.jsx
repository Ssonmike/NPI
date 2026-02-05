import { List, Datagrid, TextField, DateField, FunctionField, TextInput, SelectInput } from 'react-admin';
import StatusChip from '../../components/StatusChip';

const warehouseOrderFilters = [
    <TextInput key="q" label="Search" source="q" alwaysOn />,
    <SelectInput
        key="status"
        source="status"
        choices={[
            { id: 'ACTIVE', name: 'Active' },
            { id: 'COMPLETED', name: 'Completed' },
            { id: 'CANCELLED', name: 'Cancelled' },
        ]}
    />,
];

export const WarehouseOrderList = () => (
    <List filters={warehouseOrderFilters} perPage={25}>
        <Datagrid rowClick="show">
            <TextField source="id" label="Warehouse Order ID" />
            <FunctionField
                label="Status"
                render={record => <StatusChip status={record.status} />}
            />
            <TextField source="total_tasks" label="Total Tasks" />
            <FunctionField
                label="Completed Tasks"
                render={record => {
                    // Calculate completed tasks from status
                    // This will be enhanced when we have the actual data
                    return '—';
                }}
            />
            <DateField source="created_at" label="Created" showTime />
            <DateField source="completed_at" label="Completed" showTime />
        </Datagrid>
    </List>
);
