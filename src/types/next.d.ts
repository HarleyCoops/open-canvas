declare module "next/headers" {
    export function cookies(): {
        getAll(): Array<{ name: string; value: string; }>;
        set(name: string, value: string, options?: any): void;
    };
} 