import { List, Datagrid, TextField, DateField, FunctionField, TextInput, SelectInput, ReferenceField } from 'react-admin';
import StatusChip from '../../components/StatusChip';

const taskFilters = [
    <TextInput key="q" label="Search" source="q" alwaysOn />,
    <SelectInput
        key="status"
        source="status"
        choices={[
            { id: 'PENDING', name: 'Pending' },
            { id: 'IN_PROGRESS', name: 'In Progress' },
            { id: 'COMPLETED', name: 'Completed' },
            { id: 'FAILED', name: 'Failed' },
        ]}
    />,
    <TextInput key="warehouse_order_id" label="Warehouse Order ID" source="warehouse_order_id" />,
];

export const WarehouseTaskList = () => (
    <List filters={taskFilters} perPage={25} sort={{ field: 'created_at', order: 'DESC' }}>
        <Datagrid rowClick="show">
            <TextField source="id" label="Task ID" />
            <TextField source="warehouse_order_id" label="Warehouse Order" />
            <TextField source="sequence" label="Sequence" />
            <FunctionField
                label="Status"
                render={record => <StatusChip status={record.status} />}
            />
            <TextField source="picking_location" label="Picking Location" />
            <TextField source="serial_number" label="SKU" />
            <DateField source="started_at" label="Started" showTime />
            <DateField source="completed_at" label="Completed" showTime />
        </Datagrid>
    </List>
);
