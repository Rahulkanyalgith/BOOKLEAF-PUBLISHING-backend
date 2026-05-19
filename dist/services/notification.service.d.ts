export declare const notificationService: {
    create(input: {
        userId: string;
        title: string;
        message: string;
    }): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        read: boolean;
    } | undefined>;
    getUserNotifications(userId: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        read: boolean;
    }[]>;
    markRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
};
//# sourceMappingURL=notification.service.d.ts.map