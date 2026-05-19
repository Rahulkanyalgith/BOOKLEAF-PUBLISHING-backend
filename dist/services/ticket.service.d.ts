import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';
export interface CreateTicketInput {
    subject: string;
    description: string;
    bookId?: string;
    authorId: string;
}
export interface TicketFilters {
    search?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    assignedTo?: string;
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
}
export declare const ticketService: {
    createTicket(input: CreateTicketInput): Promise<{
        book: {
            id: string;
            title: string;
            isbn: string | null;
        } | null;
        author: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        bookId: string | null;
        subject: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        aiCategory: import(".prisma/client").$Enums.TicketCategory | null;
        priority: import(".prisma/client").$Enums.TicketPriority;
        aiPriority: import(".prisma/client").$Enums.TicketPriority | null;
        assignedTo: string | null;
        aiClassified: boolean;
        aiDraftGenerated: boolean;
    }>;
    getAuthorTickets(authorId: string): Promise<({
        book: {
            id: string;
            title: string;
            isbn: string | null;
        } | null;
        messages: ({
            sender: {
                name: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            message: string;
            id: string;
            createdAt: Date;
            ticketId: string;
            senderId: string;
            senderType: import(".prisma/client").$Enums.SenderType;
            isInternal: boolean;
        })[];
        assignedUser: {
            name: string;
            id: string;
        } | null;
    } & {
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        bookId: string | null;
        subject: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        aiCategory: import(".prisma/client").$Enums.TicketCategory | null;
        priority: import(".prisma/client").$Enums.TicketPriority;
        aiPriority: import(".prisma/client").$Enums.TicketPriority | null;
        assignedTo: string | null;
        aiClassified: boolean;
        aiDraftGenerated: boolean;
    })[]>;
    getTicketById(id: string, authorId?: string): Promise<{
        book: {
            id: string;
            title: string;
            isbn: string | null;
        } | null;
        author: {
            name: string;
            email: string;
            id: string;
        };
        messages: (({
            sender: {
                name: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            message: string;
            id: string;
            createdAt: Date;
            ticketId: string;
            senderId: string;
            senderType: import(".prisma/client").$Enums.SenderType;
            isInternal: boolean;
        }) | ({
            sender: {
                name: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            message: string;
            id: string;
            createdAt: Date;
            ticketId: string;
            senderId: string;
            senderType: import(".prisma/client").$Enums.SenderType;
            isInternal: boolean;
        }))[];
        assignedUser: {
            name: string;
            id: string;
        } | null;
    } & {
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        bookId: string | null;
        subject: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        aiCategory: import(".prisma/client").$Enums.TicketCategory | null;
        priority: import(".prisma/client").$Enums.TicketPriority;
        aiPriority: import(".prisma/client").$Enums.TicketPriority | null;
        assignedTo: string | null;
        aiClassified: boolean;
        aiDraftGenerated: boolean;
    }>;
    getAllTickets(filters: TicketFilters): Promise<{
        tickets: ({
            book: {
                id: string;
                title: string;
                isbn: string | null;
            } | null;
            author: {
                name: string;
                email: string;
                id: string;
            };
            messages: {
                id: string;
            }[];
            assignedUser: {
                name: string;
                id: string;
            } | null;
        } & {
            description: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            authorId: string;
            status: import(".prisma/client").$Enums.TicketStatus;
            bookId: string | null;
            subject: string;
            category: import(".prisma/client").$Enums.TicketCategory;
            aiCategory: import(".prisma/client").$Enums.TicketCategory | null;
            priority: import(".prisma/client").$Enums.TicketPriority;
            aiPriority: import(".prisma/client").$Enums.TicketPriority | null;
            assignedTo: string | null;
            aiClassified: boolean;
            aiDraftGenerated: boolean;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    updateTicketStatus(ticketId: string, updates: {
        status?: TicketStatus;
        priority?: TicketPriority;
        category?: TicketCategory;
        assignedTo?: string;
    }, adminId: string): Promise<{
        book: {
            id: string;
            title: string;
        } | null;
        author: {
            name: string;
            email: string;
            id: string;
        };
        assignedUser: {
            name: string;
            id: string;
        } | null;
    } & {
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        bookId: string | null;
        subject: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        aiCategory: import(".prisma/client").$Enums.TicketCategory | null;
        priority: import(".prisma/client").$Enums.TicketPriority;
        aiPriority: import(".prisma/client").$Enums.TicketPriority | null;
        assignedTo: string | null;
        aiClassified: boolean;
        aiDraftGenerated: boolean;
    }>;
    addResponse(ticketId: string, senderId: string, message: string, isInternal: boolean, senderType: "AUTHOR" | "ADMIN"): Promise<{
        sender: {
            name: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        message: string;
        id: string;
        createdAt: Date;
        ticketId: string;
        senderId: string;
        senderType: import(".prisma/client").$Enums.SenderType;
        isInternal: boolean;
    }>;
};
//# sourceMappingURL=ticket.service.d.ts.map