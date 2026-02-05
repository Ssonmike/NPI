import { Admin, Resource, ListGuesser } from 'react-admin';
import dataProvider from './dataProvider';

// Minimal test version
export default function AdminApp() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Panel Test</h1>
            <p>If you see this, React is working!</p>
            <Admin dataProvider={dataProvider}>
                <Resource name="warehouse-orders" list={ListGuesser} />
            </Admin>
        </div>
    );
}
