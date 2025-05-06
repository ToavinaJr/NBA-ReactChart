import { useState, useEffect } from 'react'

export const useEntityList = (entityType: 'team' | 'college' | null) => {
    const [entities, setEntities] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Récupère l'URL de base de l'API depuis les variables d'environnement
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (!entityType) {
            setEntities([]);
            setLoading(false);
            setError(null);
            return;
        }

        let isMounted = true;
        const fetchEntities = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE_URL}/api/entities/list?type=${entityType}`);
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
                    throw new Error(errorData.message || `Erreur ${res.status}`);
                }
                const data: string[] = await res.json();

                if (!Array.isArray(data)) {
                    throw new Error("Format de réponse invalide.");
                }

                if (isMounted) {
                    setEntities(data);
                }
            } catch (err) {
                 console.error(`Erreur chargement liste ${entityType}:`, err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Erreur inconnue.");
                    setEntities([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchEntities();

        // Cleanup function pour annuler les mises à jour si le composant est démonté
        return () => {
            isMounted = false;
        };
    }, [entityType, API_BASE_URL]);

    return { entities, loading, error };
};