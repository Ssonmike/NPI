/**
 * Status chip component with color coding
 */
export default function StatusChip({ status }) {
    const getStatusStyle = (status) => {
        const baseStyle = {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: '500',
            border: '1px solid',
        };

        switch (status?.toUpperCase()) {
            case 'PENDING':
                return {
                    ...baseStyle,
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    borderColor: '#fcd34d',
                };
            case 'IN_PROGRESS':
                return {
                    ...baseStyle,
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    borderColor: '#93c5fd',
                };
            case 'COMPLETED':
                return {
                    ...baseStyle,
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    borderColor: '#6ee7b7',
                };
            case 'FAILED':
                return {
                    ...baseStyle,
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    borderColor: '#fca5a5',
                };
            case 'ACTIVE':
                return {
                    ...baseStyle,
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    borderColor: '#6ee7b7',
                };
            case 'CANCELLED':
                return {
                    ...baseStyle,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    borderColor: '#d1d5db',
                };
            default:
                return {
                    ...baseStyle,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    borderColor: '#d1d5db',
                };
        }
    };

    return (
        <span style={getStatusStyle(status)}>
            {status || 'UNKNOWN'}
        </span>
    );
}
