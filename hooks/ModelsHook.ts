import { useQuery } from "@tanstack/react-query";
import { AVAILABLE_MODELS } from "@/lib/mistralConfig";

export interface MistralModel {
    id: string;
    name: string;
    description: string;
}

const modelsHookKey = ["mistral-models"];

/**
 * Hook to fetch available Mistral models from the API
 * Falls back to hardcoded models if the API fails
 */
export function useModelsHook() {
    const query = useQuery({
        queryKey: modelsHookKey,
        queryFn: async (): Promise<MistralModel[]> => {
            try {
                const response = await fetch("/api/models");
                if (!response.ok) {
                    console.warn("Failed to fetch models, using fallback");
                    return AVAILABLE_MODELS;
                }
                const data = await response.json();
                return data.models || AVAILABLE_MODELS;
            } catch (error) {
                console.warn("Error fetching models:", error);
                return AVAILABLE_MODELS;
            }
        },
        staleTime: 1000 * 60 * 60, // Cache for 1 hour (models don't change often)
        retry: 1, // Only retry once
    });

    return {
        models: query.data || AVAILABLE_MODELS,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
}
