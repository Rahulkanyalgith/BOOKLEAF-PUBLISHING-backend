export declare const logAiJob: (ticketId: string, jobType: string, status: "pending" | "success" | "failed", result?: string, errorMsg?: string) => Promise<void>;
export declare const getAiJobLogs: (ticketId?: string) => Promise<{
    result: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    ticketId: string;
    jobType: string;
    attempt: number;
    errorMsg: string | null;
}[]>;
//# sourceMappingURL=aiJobLog.service.d.ts.map