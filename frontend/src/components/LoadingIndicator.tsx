import React from 'react';

interface LoadingIndicatorProps {
    message?: string;
    className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    message = "Chargement...",
    className = "text-center italic text-gray-500 py-10"
}) => {
    return <p className={className}>{message}</p>;
};

export default LoadingIndicator;