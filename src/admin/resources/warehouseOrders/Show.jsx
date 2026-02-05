import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    FunctionField,
    ReferenceManyField,
    Datagrid,
    Button,
    useRecordContext,
    useRefresh,
    useNotify,
} from 'react-admin';
import { ExternalLink, RotateCcw } from 'lucide-react';
import StatusChip from '../../components/StatusChip';

const RetryOrderButton = () => {
    const record = useRecordContext();
    const refresh = useRefresh();
    const notify = useNotify();

    const handleRetry = async () => {
        try {
            const response = await fetch(`/api/warehouse-orders/${record.id}/retry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                notify('Order retry initiated', { type: 'success' });
                refresh();
            } else {
                notify('Failed to retry order', { type: 'error' });
            }
        } catch (error) {
            notify('Error retrying order', { type: 'error' });
        }
    };

    if (record?.status !== 'FAILED') {
        return null;
    }

    return (
        <Button label="Retry Order" onClick={handleRetry}>
            <RotateCcw size={16} />
        </Button>
    );
};

const OpenPVButton = () => {
    const record = useRecordContext();

    const handleOpenPV = () => {
        // Open the first task in PV viewer
        if (record?.id) {
            window.open(`/${record.id}/task/1`, '_blank');
        }
    };

    return (
        <Button label="Open PV" onClick={handleOpenPV}>
            <ExternalLink size={16} />
        </Button>
    );
};

export const WarehouseOrderShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" label="Warehouse Order ID" />
            <FunctionField
                label="Status"
                render={record => <StatusChip status={record.status} />}
            />
            <TextField source="total_tasks" label="Total Tasks" />
            <DateField source="created_at" label="Created At" showTime />
            <DateField source="completed_at" label="Completed At" showTime />
            <TextField source="sap_pshu_id" label="SAP PSHU ID" />

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <OpenPVButton />
                <RetryOrderButton />
            </div>

            <ReferenceManyField
                label="Tasks"
                reference="tasks"
                target="warehouse_order_id"
                sort={{ field: 'sequence', order: 'ASC' }}
            >
                <Datagrid rowClick="show">
                    <TextField source="sequence" label="Seq" />
                    <TextField source="id" label="Task ID" />
                    <FunctionField
                        label="Status"
                        render={record => <StatusChip status={record.status} />}
                    />
                    <TextField source="picking_location" label="Picking Location" />
                    <TextField source="serial_number" label="SKU" />
                    <DateField source="started_at" label="Started" showTime />
                    <DateField source="completed_at" label="Completed" showTime />
                </Datagrid>
            </ReferenceManyField>
        </SimpleShowLayout>
    </Show>
);
