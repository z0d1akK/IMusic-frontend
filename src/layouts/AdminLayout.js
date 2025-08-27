import React from 'react';
import Navbar from '../components/Navbar';

const AdminLayout = ({ children }) => {
    return (
        <div className="d-flex">
            <div className="flex-grow-1 p-4">
                <Navbar />
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
