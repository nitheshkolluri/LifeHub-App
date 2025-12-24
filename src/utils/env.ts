export const getEnv = (key: string): string => {
    if (typeof window !== 'undefined' && (window as any).env && (window as any).env[key] && (window as any).env[key] !== '' && (window as any).env[key] !== 'PLACEHOLDER') {
        return (window as any).env[key];
    }
    return (import.meta as any).env[key] || '';
};
