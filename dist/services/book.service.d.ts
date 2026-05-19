export declare const bookService: {
    getAuthorBooks(authorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        title: string;
        isbn: string | null;
        genre: string;
        status: import(".prisma/client").$Enums.BookStatus;
        publicationDate: Date | null;
        mrp: number;
        totalCopiesSold: number;
        royaltyEarned: number;
        royaltyPaid: number;
        royaltyPending: number;
    }[]>;
    getBookById(id: string, authorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        title: string;
        isbn: string | null;
        genre: string;
        status: import(".prisma/client").$Enums.BookStatus;
        publicationDate: Date | null;
        mrp: number;
        totalCopiesSold: number;
        royaltyEarned: number;
        royaltyPaid: number;
        royaltyPending: number;
    }>;
    getAllBooks(filters: {
        search?: string;
        status?: string;
        genre?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        books: ({
            author: {
                name: string;
                email: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            authorId: string;
            title: string;
            isbn: string | null;
            genre: string;
            status: import(".prisma/client").$Enums.BookStatus;
            publicationDate: Date | null;
            mrp: number;
            totalCopiesSold: number;
            royaltyEarned: number;
            royaltyPaid: number;
            royaltyPending: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
};
//# sourceMappingURL=book.service.d.ts.map