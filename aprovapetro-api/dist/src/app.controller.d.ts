import { PrismaService } from './prisma.service';
export declare class AppController {
    private prisma;
    constructor(prisma: PrismaService);
    login(body: {
        email: string;
        password?: string;
    }): Promise<{
        userId: string;
        isOnboarded: boolean;
        name: string;
        email: string;
    }>;
    register(body: {
        name: string;
        email: string;
        password?: string;
    }): Promise<{
        userId: string;
        isOnboarded: boolean;
        name: string;
        email: string;
    }>;
    getCargos(): Promise<{
        id: string;
        name: string;
        description: string | null;
    }[]>;
    submitOnboarding(body: {
        userId: string;
        cargoId: string;
    }): Promise<{
        success: boolean;
        missionId: string;
    }>;
    getDashboard(userId: string): Promise<{
        indexAprovaPetro?: undefined;
        xp?: undefined;
        level?: undefined;
        streak?: undefined;
        name?: undefined;
        stats?: undefined;
        topSubjects?: undefined;
        mission?: undefined;
    } | {
        indexAprovaPetro: number;
        xp: number;
        level: number;
        streak: number;
        name: string;
        stats: {
            totalQuestions: number;
            hours: number;
            precision: number;
        };
        topSubjects: {
            name: string;
            percentage: number;
            status: string;
            color: string;
        }[];
        mission: {
            id: string;
            title: string;
            tasks: any;
        };
    }>;
    getRadarStats(userId: string): Promise<{
        subject: string;
        score: number;
    }[]>;
    getDiagnostics(userId: string): Promise<{
        subject: string;
        drop: number;
        msg: string;
        type: string;
    }[]>;
    getSubjects(): Promise<{
        id: string;
        name: string;
        color: string | null;
    }[]>;
    getQuestions(subjectId?: string): Promise<({
        topic: {
            subject: {
                id: string;
                name: string;
                color: string | null;
            };
        } & {
            id: string;
            name: string;
            subjectId: string;
        };
        options: {
            id: string;
            questionId: string;
            text: string;
            orderIndex: number;
        }[];
    } & {
        id: string;
        topicId: string;
        bank: string | null;
        year: number | null;
        statement: string;
        correctOption: number;
        explanation: string | null;
    })[]>;
    submitAnswer(body: {
        userId: string;
        questionId: string;
        optionIndex: number;
        timeSpentMs: number;
    }): Promise<{
        success: boolean;
        isCorrect?: undefined;
        explanation?: undefined;
        correctOption?: undefined;
    } | {
        success: boolean;
        isCorrect: boolean;
        explanation: string | null;
        correctOption: number;
    }>;
    getSimulados(cargoId: string): Promise<({
        _count: {
            questions: number;
        };
    } & {
        id: string;
        cargoId: string;
        description: string | null;
        title: string;
        durationMin: number;
    })[]>;
    startSimulado(simuladoId: string, body: {
        userId: string;
    }): Promise<{
        attemptId: string;
        questions: ({
            question: {
                topic: {
                    subject: {
                        id: string;
                        name: string;
                        color: string | null;
                    };
                } & {
                    id: string;
                    name: string;
                    subjectId: string;
                };
                options: {
                    id: string;
                    questionId: string;
                    text: string;
                    orderIndex: number;
                }[];
            } & {
                id: string;
                topicId: string;
                bank: string | null;
                year: number | null;
                statement: string;
                correctOption: number;
                explanation: string | null;
            };
        } & {
            id: string;
            questionId: string;
            orderIndex: number;
            simuladoId: string;
        })[];
    }>;
    finishSimulado(body: {
        attemptId: string;
        answers: Record<string, number>;
    }): Promise<{
        success: boolean;
        score?: undefined;
        correctCount?: undefined;
        totalQuestions?: undefined;
    } | {
        success: boolean;
        score: number;
        correctCount: number;
        totalQuestions: number;
    }>;
    importQuestions(body: {
        questions: any[];
    }): Promise<{
        success: boolean;
        message: string;
        count?: undefined;
    } | {
        success: boolean;
        count: number;
        message?: undefined;
    }>;
    chat(body: {
        message: string;
    }): Promise<{
        reply: string;
    }>;
}
