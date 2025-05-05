interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '5px' }}>
            <button onClick={handlePrevious} disabled={currentPage === 1} style={{ padding: '8px 12px', cursor: 'pointer' }}>
                Précédent
            </button>
            
            {pageNumbers.map(num => (
                <button
                    key={num}
                    onClick={() => onPageChange(num)}
                    disabled={currentPage === num}
                    style={{ padding: '8px 12px', cursor: 'pointer', fontWeight: currentPage === num ? 'bold' : 'normal', backgroundColor: currentPage === num ? '#007bff' : 'white', color: currentPage === num ? 'white' : 'black', border: '1px solid #dee2e6' }}
                >
                    {num}
                </button>
            ))}
            <button onClick={handleNext} disabled={currentPage === totalPages} style={{ padding: '8px 12px', cursor: 'pointer' }}>
                Suivant
            </button>
        </div>
    );
};
