import React, { useState } from 'react';
import { AdminContextDefinition } from './AdminContext';
import { useAuth } from './AuthContext';

export const AdminProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    // Derivar estado de admin real del AuthContext
    const isAdmin = user?.role === 'admin';

    // Función dummy para mantener compatibilidad si algún componente viejo la llama
    const setIsAdmin = () => { };

    const addNotification = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <AdminContextDefinition.Provider value={{ isAdmin, setIsAdmin, notifications, addNotification, removeNotification }}>
            {children}
        </AdminContextDefinition.Provider>
    );
};
