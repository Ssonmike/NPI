import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    FunctionField,
    Button,
    useRecordContext,
    useRefresh,
    useNotify,
} from 'react-admin';
import { Copy, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import StatusChip from '../../components/StatusChip';

const CopyUrlButton = () => {
    const record = useRecordContext();
    const notify = useNotify();

    const handleCopy = () => {
        const url = `${window.location.origin}/${record.warehouse_order_id}/task/${record.id}`;
        navigator.clipboard.writeText(url);
        notify('URL copied to clipboard', { type: 'success' });
    };

    return (
        <Button label="Copy URL" onClick={handleCopy}>
            <Copy size={16} />
        </Button>
    );
};

const OpenInAmrButton = () => {
    const record = useRecordContext();

    const handleOpen = () => {
        const url = `/${record.warehouse_order_id}/task/${record.id}`;
        window.open(url, '_blank');
    };

    return (
        <Button label="Open in AMR" onClick={handleOpen}>
            <ExternalLink size={16} />
        </Button>
    );
};

const CompleteTaskButton = () => {
    const record = useRecordContext();
    const refresh = useRefresh();
    const notify = useNotify();

    const handleComplete = async () => {
        try {
            const response = await fetch(`/api/tasks/${record.id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                notify('Task marked as completed', { type: 'success' });
                refresh();
            } else {
                notify('Failed to complete task', { type: 'error' });
            }
        } catch (error) {
            notify('Error completing task', { type: 'error' });
        }
    };

    if (record?.status === 'COMPLETED' || record?.status === 'FAILED') {
        return null;
    }

    return (
        <Button label="Mark Complete" onClick={handleComplete}>
            <CheckCircle size={16} />
        </Button>
    );
};

const FailTaskButton = () => {
    const record = useRecordContext();
    const refresh = useRefresh();
    const notify = useNotify();

    const handleFail = async () => {
        try {
            const response = await fetch(`/api/tasks/${record.id}/fail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                notify('Task marked as failed', { type: 'success' });
                refresh();
            } else {
                notify('Failed to mark task as failed', { type: 'error' });
            }
        } catch (error) {
            notify('Error marking task as failed', { type: 'error' });
        }
    };

    if (record?.status === 'COMPLETED' || record?.status === 'FAILED') {
        return null;
    }

    return (
        <Button label="Mark Failed" onClick={handleFail}>
            <XCircle size={16} />
        </Button>
    );
};

export const WarehouseTaskShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" label="Task ID" />
            <TextField source="warehouse_order_id" label="Warehouse Order ID" />
            <TextField source="sequence" label="Sequence" />
            <FunctionField
                label="Status"
                render={record => <StatusChip status={record.status} />}
            />
            <TextField source="picking_location" label="Picking Location" />
            <TextField source="serial_number" label="Serial Number / SKU" />
            <TextField source="package_id" label="Package ID" />
            <DateField source="started_at" label="Started At" showTime />
            <DateField source="completed_at" label="Completed At" showTime />

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <CopyUrlButton />
                <OpenInAmrButton />
                <CompleteTaskButton />
                <FailTaskButton />
            </div>

            <FunctionField
                label="Block Data"
                render={record => (
                    <pre style={{
                        background: '#f5f5f5',
                        padding: '10px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '400px',
                    }}>
                        {JSON.stringify(record.block_data, null, 2)}
                    </pre>
                )}
            />
        </SimpleShowLayout>
    </Show>
);
