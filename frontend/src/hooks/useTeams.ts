import { useEffect, useState } from "react";

export const useTeams = () => {
    const [teams, setTeams] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch("http://localhost:3001/api/teams/list");
                if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
                const data = await res.json();
                if (!Array.isArray(data)) throw new Error("Format invalide.");
                setTeams(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Erreur inconnue");
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    return { teams, loading, error };
};
