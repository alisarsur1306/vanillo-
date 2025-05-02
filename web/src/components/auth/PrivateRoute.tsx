import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface PrivateRouteProps {
    children: React.ReactNode;
    roles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) {
        // Not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    if (roles && user && !roles.includes(user.role)) {
        // User's role is not authorized, redirect to home page
        return <Navigate to="/" replace />;
    }

    // Authorized, render component
    return <>{children}</>;
};

export default PrivateRoute; 