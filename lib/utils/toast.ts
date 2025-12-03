import { toast } from "sonner";

/**
 * Extracts a user-friendly error message from various error formats
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    
    if (typeof error === 'string') {
        return error;
    }
    
    if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>;
        if (err.message && typeof err.message === 'string') {
            return err.message;
        }
        if (err.error && typeof err.error === 'string') {
            return err.error;
        }
    }
    
    return 'An unexpected error occurred';
}

/**
 * Shows an error toast with a user-friendly message
 */
export function showError(error: unknown, defaultMessage = 'Something went wrong') {
    const message = getErrorMessage(error) || defaultMessage;
    toast.error(message);
}

/**
 * Shows a success toast
 */
export function showSuccess(message: string) {
    toast.success(message);
}

/**
 * Shows an info toast
 */
export function showInfo(message: string) {
    toast.info(message);
}



