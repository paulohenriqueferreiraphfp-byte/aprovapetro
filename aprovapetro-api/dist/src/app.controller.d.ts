import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AppController {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(body: {
        email: string;
        password?: string;
    }): Promise<{
        userId: string;
        accessToken: string;
        isOnboarded: boolean;
        name: string;
        email: string;
        avatarId: string | null;
    }>;
    register(body: {
        name: string;
        email: string;
        password?: string;
    }): Promise<{
        userId: string;
        accessToken: string;
        isOnboarded: boolean;
        name: string;
        email: string;
        avatarId: string | null;
    }>;
    checkSession(): Promise<{
        isValid: boolean;
    }>;
    hotmartWebhook(body: any): Promise<{
        received: boolean;
    }>;
    getCargos(): Promise<{
        id: string;
        name: string;
        description: string | null;
    }[]>;
    submitOnboarding(req: any, body: {
        cargoId: string;
    }): Promise<{
        success: boolean;
        missionId: string;
    }>;
    updateUser(req: any, id: string, body: {
        name?: string;
        avatarId?: string;
        examDate?: string;
    }): Promise<{
        success: boolean;
        name: string;
        avatarId: string | null;
        examDate: Date | null;
    }>;
    getDashboard(req: any): Promise<{
        id?: undefined;
        indexAprovaPetro?: undefined;
        topPercent?: undefined;
        rankMessage?: undefined;
        indexStatus?: undefined;
        xp?: undefined;
        level?: undefined;
        streak?: undefined;
        name?: undefined;
        cargoName?: undefined;
        avatarId?: undefined;
        examDate?: undefined;
        daysToExam?: undefined;
        stats?: undefined;
        topSubjects?: undefined;
        mission?: undefined;
    } | {
        id: string;
        indexAprovaPetro: number;
        topPercent: number;
        rankMessage: string;
        indexStatus: {
            text: string;
            color: string;
            bg: string;
        };
        xp: number;
        level: number;
        streak: number;
        name: string;
        cargoName: string;
        avatarId: string | null;
        examDate: Date | null;
        daysToExam: number | null;
        stats: {
            totalQuestions: number;
            timeFormatted: string;
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
    getRadarStats(req: any): Promise<{
        subject: string;
        score: number;
    }[]>;
    getDiagnostics(req: any): Promise<{
        subject: string;
        subjectId: string;
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
            text: string;
            orderIndex: number;
            questionId: string;
        }[];
    } & {
        id: string;
        bank: string | null;
        year: number | null;
        statement: string;
        correctOption: number;
        explanation: string | null;
        topicId: string;
    })[]>;
    submitAnswer(req: any, body: {
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
        description: string | null;
        cargoId: string;
        title: string;
        durationMin: number;
    })[]>;
    startSimulado(req: any, simuladoId: string): Promise<{
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
                    text: string;
                    orderIndex: number;
                    questionId: string;
                }[];
            } & {
                id: string;
                bank: string | null;
                year: number | null;
                statement: string;
                correctOption: number;
                explanation: string | null;
                topicId: string;
            };
        } & {
            id: string;
            orderIndex: number;
            questionId: string;
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
