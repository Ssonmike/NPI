import {
    List,
    Datagrid,
    TextField,
    DateField,
    FunctionField,
    TextInput,
    SelectInput,
    BulkDeleteButton,
    BulkExportButton
} from 'react-admin';
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

const WarehouseOrderBulkActionButtons = () => (
    <>
        <BulkExportButton />
        <BulkDeleteButton />
    </>
);

export const WarehouseOrderList = () => (
    <List
        filters={warehouseOrderFilters}
        perPage={25}
        sort={{ field: 'created_at', order: 'DESC' }}
    >
        <Datagrid
            rowClick="show"
            bulkActionButtons={<WarehouseOrderBulkActionButtons />}
        >
            <TextField source="id" label="Order ID" />
            <FunctionField
                label="Status"
                render={record => <StatusChip status={record.status} />}
            />
            <TextField source="total_tasks" label="Total Tasks" />
            <TextField source="completed_tasks" label="Completed" />
            <TextField source="failed_tasks" label="Failed" />
            <DateField source="created_at" label="Created" showTime />
        </Datagrid>
    </List>
);
