import {
    List,
    Datagrid,
    TextField,
    DateField,
    FunctionField,
    TextInput,
    SelectInput,
    BulkDeleteButton,
    BulkExportButton,
    Button
} from 'react-admin';
import { ExternalLink } from 'lucide-react';
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

const TaskBulkActionButtons = () => (
    <>
        <BulkExportButton />
        <BulkDeleteButton />
    </>
);

export const WarehouseTaskList = () => (
    <List
        filters={taskFilters}
        perPage={25}
        sort={{ field: 'created_at', order: 'DESC' }}
    >
        <Datagrid
            rowClick="show"
            bulkActionButtons={<TaskBulkActionButtons />}
        >
            <TextField source="id" label="Task ID" sx={{ fontSize: '0.875rem', fontFamily: 'monospace' }} />
            <TextField source="warehouse_order_id" label="Order ID" />
            <TextField source="sequence" label="#" />
            <FunctionField
                label="Status"
                render={record => <StatusChip status={record.status} />}
            />
            <TextField source="picking_location" label="Location" />
            <TextField source="serial_number" label="SKU" />
            <FunctionField
                label="AMR URL"
                render={record => {
                    if (!record.task_url) return '—';
                    return (
                        <Button
                            label="Open"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(record.task_url, '_blank');
                            }}
                            size="small"
                        >
                            <ExternalLink size={16} />
                        </Button>
                    );
                }}
            />
            <DateField source="completed_at" label="Completed" showTime />
        </Datagrid>
    </List>
);
