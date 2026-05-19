export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}
export interface LoginInput {
    email: string;
    password: string;
}
export declare const authService: {
    register(input: RegisterInput): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        };
        token: string;
    }>;
    login(input: LoginInput): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        };
        token: string;
    }>;
    getProfile(userId: string): Promise<{
        name: string;
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map