export const getEnv = (key: string): string => {
    if (typeof window !== 'undefined' && (window as any).env && (window as any).env[key]) {
        return (window as any).env[key];
    }
    return import.meta.env[key] || '';
};
