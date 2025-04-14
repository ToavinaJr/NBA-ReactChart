import React from 'react';

interface ChartFilterSidebarProps {
    targets: string[];
    selectedTarget: string;
    onSelectTarget: (target: string) => void;
    isLoading: boolean;
}

const getButtonStyle = (isSelected: boolean, isLoading: boolean): React.CSSProperties => ({
    display: 'block',
    width: '100%',
    margin: '8px 0',
    padding: '12px 15px',
    fontSize: '14px',
    backgroundColor: isSelected ? '#007bff' : (isLoading ? '#e9ecef' : 'white'),
    color: isSelected ? 'white' : '#495057',
    border: `1px solid ${isSelected ? '#007bff' : '#ced4da'}`,
    borderRadius: '4px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s, border-color 0.2s',
});

const ChartFilterSidebar: React.FC<ChartFilterSidebarProps> = ({
    targets,
    selectedTarget,
    onSelectTarget,
    isLoading,
}) => {
    return (
        <div style={{
            width: '220px',
            backgroundColor: '#f8f9fa',
            padding: '20px',
            overflowY: 'auto',
            borderRight: '1px solid #dee2e6'
        }}>
            <h3>Filtres Graphique</h3>
            {targets.map((target) => (
                <button
                    key={target}
                    onClick={() => onSelectTarget(target)}
                    disabled={isLoading}
                    style={getButtonStyle(selectedTarget === target, isLoading)}
                >
                    {target}
                </button>
            ))}
        </div>
    );
};

export default ChartFilterSidebar;
