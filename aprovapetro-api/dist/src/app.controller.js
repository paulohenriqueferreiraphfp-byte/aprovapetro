"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const generative_ai_1 = require("@google/generative-ai");
let AppController = class AppController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async login(body) {
        const user = await this.prisma.user.findUnique({
            where: { email: body.email }
        });
        if (!user)
            throw new common_1.UnauthorizedException('E-mail ou senha incorretos.');
        return {
            userId: user.id,
            isOnboarded: !!user.cargoId,
            name: user.name,
            email: user.email,
        };
    }
    async register(body) {
        const existing = await this.prisma.user.findUnique({ where: { email: body.email } });
        if (existing) {
            throw new common_1.UnauthorizedException('Este e-mail já está em uso.');
        }
        const user = await this.prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                passwordHash: 'hashed_pw',
                indexAprovaPetro: 0,
                xp: 0,
            }
        });
        return {
            userId: user.id,
            isOnboarded: false,
            name: user.name,
            email: user.email,
        };
    }
    async getCargos() {
        return this.prisma.cargo.findMany();
    }
    async submitOnboarding(body) {
        const user = await this.prisma.user.update({
            where: { id: body.userId },
            data: { cargoId: body.cargoId },
            include: { cargo: true },
        });
        const mission = await this.prisma.dailyMission.create({
            data: {
                userId: user.id,
                title: `Missão de Nivelamento - ${user.cargo?.name}`,
                tasks: JSON.stringify([
                    { type: 'questions', title: 'Resolver 20 questões', subject: 'Conhecimentos Específicos', done: false },
                    { type: 'flashcards', title: 'Revisar 15 flashcards', subject: 'Português', done: false },
                ]),
            }
        });
        return { success: true, missionId: mission.id };
    }
    async getDashboard(userId) {
        const user = await this.prisma.user.findFirst({
            where: userId ? { id: userId } : undefined,
            include: { missions: { orderBy: { date: 'desc' }, take: 1 } }
        });
        if (!user)
            return {};
        const answers = await this.prisma.userAnswer.findMany({
            where: { userId: user.id }
        });
        let totalQuestions = answers.length;
        let correctCount = answers.filter(a => a.isCorrect).length;
        let totalTimeMs = answers.reduce((acc, curr) => acc + (curr.timeSpentMs || 0), 0);
        const precision = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
        const hours = Math.round(totalTimeMs / (1000 * 60 * 60)) || 0;
        const topSubjects = [
            { name: "Segurança do Trabalho", percentage: 92, status: "Bom", color: "#3ADB6E" },
            { name: "Português Instrumental", percentage: 68, status: "Regular", color: "#F5C518" },
            { name: "Termodinâmica", percentage: 41, status: "Crítico", color: "#EF4444" }
        ];
        const mission = user.missions[0];
        const level = Math.floor(user.xp / 100) + 1;
        return {
            indexAprovaPetro: precision,
            xp: user.xp,
            level,
            streak: user.streak,
            name: user.name,
            stats: { totalQuestions, hours, precision },
            topSubjects,
            mission: mission ? {
                id: mission.id,
                title: mission.title,
                tasks: JSON.parse(mission.tasks),
            } : {
                id: "default-1",
                title: "Missão Diária",
                tasks: [
                    { title: "Resolver 10 questões da CESGRANRIO", type: "questions" },
                    { title: "Revisar 5 Flashcards de Segurança", type: "flashcards" },
                    { title: "Ler resumo de Termodinâmica", type: "reading" }
                ]
            },
        };
    }
    async getRadarStats(userId) {
        if (!userId)
            return [];
        const answers = await this.prisma.userAnswer.findMany({
            where: { userId },
            include: {
                question: { include: { topic: { include: { subject: true } } } }
            }
        });
        const subjectStats = {};
        answers.forEach(ans => {
            const subjName = ans.question.topic?.subject?.name || 'Gerais';
            if (!subjectStats[subjName]) {
                subjectStats[subjName] = { total: 0, correct: 0 };
            }
            subjectStats[subjName].total++;
            if (ans.isCorrect)
                subjectStats[subjName].correct++;
        });
        const radar = Object.entries(subjectStats).map(([subject, counts]) => ({
            subject,
            score: counts.total === 0 ? 0 : Math.round((counts.correct / counts.total) * 100)
        }));
        const defaultLabels = ['Português', 'Matemática', 'Legislação', 'NR-10', 'Específicas', 'Inglês'];
        const finalRadar = defaultLabels.map(label => {
            const found = radar.find(r => r.subject.includes(label) || label.includes(r.subject));
            return {
                subject: label,
                score: found ? found.score : Math.floor(Math.random() * 40) + 20
            };
        });
        return finalRadar;
    }
    async getDiagnostics(userId) {
        return [
            { subject: "Instalações Elétricas", drop: 15, msg: "Visto pela última vez há 12 dias. Risco de esquecimento alto.", type: "danger" },
            { subject: "Regência Verbal", drop: 8, msg: "Dificuldade recorrente em questões do tipo CESGRANRIO.", type: "warning" }
        ];
    }
    async getSubjects() {
        return this.prisma.subject.findMany();
    }
    async getQuestions(subjectId) {
        return this.prisma.question.findMany({
            where: subjectId ? { topic: { subjectId } } : undefined,
            include: {
                options: true,
                topic: {
                    include: { subject: true }
                }
            }
        });
    }
    async submitAnswer(body) {
        const user = await this.prisma.user.findUnique({ where: { id: body.userId } });
        const question = await this.prisma.question.findUnique({ where: { id: body.questionId } });
        if (!user || !question)
            return { success: false };
        const isCorrect = question.correctOption === body.optionIndex;
        const answer = await this.prisma.userAnswer.create({
            data: {
                userId: user.id,
                questionId: question.id,
                isCorrect,
                timeSpentMs: body.timeSpentMs,
            }
        });
        if (isCorrect) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { xp: { increment: 10 } }
            });
        }
        return {
            success: true,
            isCorrect,
            explanation: question.explanation,
            correctOption: question.correctOption
        };
    }
    async getSimulados(cargoId) {
        return this.prisma.simulado.findMany({
            where: cargoId ? { cargoId } : undefined,
            include: {
                _count: {
                    select: { questions: true }
                }
            }
        });
    }
    async startSimulado(simuladoId, body) {
        const attempt = await this.prisma.simuladoAttempt.create({
            data: {
                userId: body.userId,
                simuladoId: simuladoId
            }
        });
        const questions = await this.prisma.simuladoQuestion.findMany({
            where: { simuladoId },
            orderBy: { orderIndex: 'asc' },
            include: {
                question: {
                    include: { options: true, topic: { include: { subject: true } } }
                }
            }
        });
        return { attemptId: attempt.id, questions };
    }
    async finishSimulado(body) {
        const attempt = await this.prisma.simuladoAttempt.findUnique({
            where: { id: body.attemptId },
            include: { simulado: { include: { questions: { include: { question: true } } } } }
        });
        if (!attempt)
            return { success: false };
        let correctCount = 0;
        const totalQuestions = attempt.simulado.questions.length;
        for (const sq of attempt.simulado.questions) {
            const userAnswer = body.answers[sq.question.id];
            if (userAnswer === sq.question.correctOption) {
                correctCount++;
            }
        }
        const score = Math.round((correctCount / totalQuestions) * 100);
        await this.prisma.simuladoAttempt.update({
            where: { id: attempt.id },
            data: { score, finishedAt: new Date() }
        });
        await this.prisma.user.update({
            where: { id: attempt.userId },
            data: { xp: { increment: correctCount * 15 } }
        });
        return { success: true, score, correctCount, totalQuestions };
    }
    async importQuestions(body) {
        if (!body.questions || !Array.isArray(body.questions)) {
            return { success: false, message: 'Invalid data format' };
        }
        const createdQuestions = [];
        const defaultTopic = await this.prisma.topic.findFirst();
        for (const q of body.questions) {
            let topicId = q.topicId;
            if (!topicId || !topicId.includes('-')) {
                topicId = defaultTopic?.id;
            }
            const created = await this.prisma.question.create({
                data: {
                    topicId: topicId,
                    bank: q.bank,
                    year: q.year,
                    statement: q.statement,
                    correctOption: q.correctOption,
                    explanation: q.explanation,
                    options: {
                        create: q.options.map((optText, index) => ({
                            text: optText,
                            orderIndex: index
                        }))
                    }
                }
            });
            createdQuestions.push(created);
        }
        return { success: true, count: createdQuestions.length };
    }
    async chat(body) {
        const apiKey = process.env.GEMINI_API_KEY || '';
        const genAI = apiKey ? new generative_ai_1.GoogleGenerativeAI(apiKey) : null;
        if (!genAI) {
            return {
                reply: '⚠️ **Aviso de Sistema:** A minha inteligência neural (Google Gemini) ainda está desligada! O desenvolvedor precisa colar a chave (GEMINI_API_KEY) no arquivo .env do backend para eu poder pensar de verdade.'
            };
        }
        try {
            const model = genAI.getGenerativeModel({
                model: 'gemini-3.5-flash',
                systemInstruction: "Você é a PETRA IA, tutora inteligente e exclusiva do aplicativo AprovaPETRO. Você ajuda engenheiros e técnicos a passarem no concurso da Petrobras. Responda de forma direta, encorajadora, use emojis, e foque em dicas de estudo, estatísticas e resolução de questões. Nunca diga que é um modelo do Google, assuma a identidade da PETRA IA."
            });
            const result = await model.generateContent(body.message);
            const response = await result.response;
            return { reply: response.text() };
        }
        catch (error) {
            console.error('Erro na IA:', error);
            return { reply: 'Minhas engrenagens travaram um pouco! Houve um erro de conexão com a central de inteligência. Tente novamente mais tarde.' };
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Post)('auth/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('auth/register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('cargos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getCargos", null);
__decorate([
    (0, common_1.Post)('onboarding'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "submitOnboarding", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('stats/radar'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getRadarStats", null);
__decorate([
    (0, common_1.Get)('stats/diagnostics'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getDiagnostics", null);
__decorate([
    (0, common_1.Get)('subjects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Get)('questions'),
    __param(0, (0, common_1.Query)('subjectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getQuestions", null);
__decorate([
    (0, common_1.Post)('answers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "submitAnswer", null);
__decorate([
    (0, common_1.Get)('simulados'),
    __param(0, (0, common_1.Query)('cargoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getSimulados", null);
__decorate([
    (0, common_1.Post)('simulados/:id/start'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "startSimulado", null);
__decorate([
    (0, common_1.Post)('simulados/finish'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "finishSimulado", null);
__decorate([
    (0, common_1.Post)('admin/questions/import'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "importQuestions", null);
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "chat", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppController);
//# sourceMappingURL=app.controller.js.map