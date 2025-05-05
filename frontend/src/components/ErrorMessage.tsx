import React from 'react';

interface ErrorMessageProps {
    title?: string;
    message: string | null;
    className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
    title = "Erreur",
    message,
    className = "p-5 mb-5 border border-red-400 rounded bg-red-100 text-red-800 text-center"
}) => {
    if (!message) return null;
    return (
        <div className={className}>
            <strong>{title} :</strong><br />{message}
        </div>
    );
};

export default ErrorMessage;