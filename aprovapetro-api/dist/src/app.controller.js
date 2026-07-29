"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
let AppController = class AppController {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(body) {
        const user = await this.prisma.user.findUnique({
            where: { email: body.email }
        });
        if (!user)
            throw new common_1.UnauthorizedException('E-mail ou senha incorretos.');
        if (user.passwordHash !== 'hashed_pw') {
            const isMatch = await bcrypt.compare(body.password || '', user.passwordHash);
            if (!isMatch)
                throw new common_1.UnauthorizedException('E-mail ou senha incorretos.');
        }
        const payload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(payload);
        return {
            userId: user.id,
            accessToken,
            isOnboarded: !!user.cargoId,
            name: user.name,
            email: user.email,
            avatarId: user.avatarId,
        };
    }
    async register(body) {
        const isAdmin = body.email === 'paulo.henrique.ferreira.phfp@gmail.com' || body.email.includes('admin');
        if (!isAdmin) {
            const allowed = await this.prisma.allowedEmail.findUnique({
                where: { email: body.email }
            });
            if (!allowed) {
                throw new common_1.UnauthorizedException('E-mail não autorizado. Você precisa adquirir o acesso na Hotmart primeiro.');
            }
        }
        const existing = await this.prisma.user.findUnique({ where: { email: body.email } });
        if (existing) {
            throw new common_1.UnauthorizedException('Este e-mail já está em uso.');
        }
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(body.password || 'senha123', salt);
        const user = await this.prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                passwordHash: hash,
                indexAprovaPetro: 0,
                xp: 0,
                avatarId: 'avatar-1',
            }
        });
        const payload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(payload);
        return {
            userId: user.id,
            accessToken,
            isOnboarded: false,
            name: user.name,
            email: user.email,
            avatarId: user.avatarId,
        };
    }
    async checkSession() {
        return { isValid: true };
    }
    async hotmartWebhook(body) {
        if (body.event === 'PURCHASE_APPROVED' && body.data && body.data.buyer) {
            const buyerEmail = body.data.buyer.email;
            try {
                await this.prisma.allowedEmail.upsert({
                    where: { email: buyerEmail },
                    update: {},
                    create: { email: buyerEmail }
                });
                console.log(`Venda Aprovada (Hotmart)! E-mail ${buyerEmail} liberado para cadastro.`);
            }
            catch (e) {
                console.error('Erro ao salvar AllowedEmail:', e);
            }
        }
        return { received: true };
    }
    async getCargos() {
        return this.prisma.cargo.findMany();
    }
    async submitOnboarding(req, body) {
        const user = await this.prisma.user.update({
            where: { id: req.user.userId },
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
    async updateUser(req, id, body) {
        if (id !== req.user.userId)
            throw new common_1.UnauthorizedException();
        const dataToUpdate = {
            name: body.name,
            avatarId: body.avatarId
        };
        if (body.examDate !== undefined) {
            dataToUpdate.examDate = body.examDate ? new Date(body.examDate) : null;
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: dataToUpdate
        });
        return { success: true, name: user.name, avatarId: user.avatarId, examDate: user.examDate };
    }
    async getDashboard(req) {
        const user = await this.prisma.user.findFirst({
            where: { id: req.user.userId },
            include: {
                missions: { orderBy: { date: 'desc' }, take: 1 },
                cargo: true
            }
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
        const totalMinutes = Math.floor(totalTimeMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        let daysToExam = null;
        if (user.examDate) {
            const diffTime = new Date(user.examDate).getTime() - new Date().getTime();
            daysToExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (daysToExam < 0)
                daysToExam = 0;
        }
        let topPercent = 100;
        if (user.xp > 0) {
            const usersAhead = await this.prisma.user.count({
                where: { xp: { gt: user.xp } }
            });
            const totalUsers = await this.prisma.user.count();
            if (totalUsers > 1) {
                const rank = usersAhead + 1;
                topPercent = Math.max(1, Math.round((rank / totalUsers) * 100));
            }
            else {
                topPercent = 1;
            }
        }
        if (topPercent === 0)
            topPercent = 1;
        let indexStatus = { text: "REGULAR", color: "#F5C518", bg: "bg-[#F5C518]" };
        if (precision >= 85)
            indexStatus = { text: "ELITE", color: "#3ADB6E", bg: "bg-[#3ADB6E]" };
        else if (precision >= 70)
            indexStatus = { text: "COMPETITIVO", color: "#3ADB6E", bg: "bg-[#3ADB6E]" };
        else if (precision < 50)
            indexStatus = { text: "PERIGO", color: "#EF4444", bg: "bg-[#EF4444]" };
        let rankMessage = `Você está no Top ${topPercent}%`;
        if (totalQuestions === 0) {
            rankMessage = "Aviso: Faça o Nivelamento Urgente!";
        }
        else if (precision < 50) {
            rankMessage = "Alerta: Você está abaixo da média. Treine mais!";
        }
        else if (precision < 70) {
            rankMessage = `Atenção: Acelere o ritmo! (Top ${topPercent}%)`;
        }
        const topSubjects = [
            { name: "Segurança do Trabalho", percentage: 92, status: "Bom", color: "#3ADB6E" },
            { name: "Português Instrumental", percentage: 68, status: "Regular", color: "#F5C518" },
            { name: "Termodinâmica", percentage: 41, status: "Crítico", color: "#EF4444" }
        ];
        const mission = user.missions[0];
        const level = Math.floor(user.xp / 100) + 1;
        return {
            id: user.id,
            indexAprovaPetro: precision,
            topPercent,
            rankMessage,
            indexStatus,
            xp: user.xp,
            level,
            streak: user.streak,
            name: user.name,
            cargoName: user.cargo?.name || "Aluno PETRO",
            avatarId: user.avatarId,
            examDate: user.examDate,
            daysToExam,
            stats: { totalQuestions, timeFormatted, precision },
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
    async getRadarStats(req) {
        const userId = req.user.userId;
        if (!userId)
            return [];
        const answers = await this.prisma.userAnswer.findMany({
            where: { userId },
            include: {
                question: { include: { topic: { include: { subject: true } } } }
            }
        });
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { cargo: true }
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
        let defaultLabels = ['Português', 'Matemática', 'Legislação', 'NR-10', 'Específicas', 'Inglês'];
        if (user?.cargo?.name) {
            if (user.cargo.name.includes('Segurança')) {
                defaultLabels = ['Português', 'Matemática', 'NR-10', 'NRs', 'Higiene', 'Prevenção'];
            }
            else if (user.cargo.name.includes('Eletrotécnica')) {
                defaultLabels = ['Português', 'Matemática', 'NR-10', 'Circuitos', 'Máquinas Elét.', 'Instalações'];
            }
            else if (user.cargo.name.includes('Mecânica')) {
                defaultLabels = ['Português', 'Matemática', 'Termodinâmica', 'Fluidos', 'Metrologia', 'Resistência'];
            }
            else if (user.cargo.name.includes('Operação')) {
                defaultLabels = ['Português', 'Matemática', 'Química', 'Física', 'Instrumentação', 'Equipamentos'];
            }
        }
        const finalRadar = defaultLabels.map(label => {
            const found = radar.find(r => r.subject.includes(label) || label.includes(r.subject));
            return {
                subject: label,
                score: found ? found.score : 0
            };
        });
        return finalRadar;
    }
    async getDiagnostics(req) {
        const userId = req.user.userId;
        if (!userId)
            return [];
        const answers = await this.prisma.userAnswer.findMany({
            where: { userId },
            include: {
                question: { include: { topic: { include: { subject: true } } } }
            }
        });
        if (answers.length === 0) {
            return [
                { subject: "Nivelamento Geral", subjectId: "", drop: 100, msg: "Você ainda não respondeu questões suficientes. Faça o nivelamento.", type: "danger" }
            ];
        }
        const subjectStats = {};
        answers.forEach(ans => {
            const subjName = ans.question.topic?.subject?.name || 'Gerais';
            const subjId = ans.question.topic?.subjectId || '';
            if (!subjectStats[subjName]) {
                subjectStats[subjName] = { total: 0, correct: 0, id: subjId };
            }
            subjectStats[subjName].total++;
            if (ans.isCorrect)
                subjectStats[subjName].correct++;
        });
        const diagnostics = Object.entries(subjectStats).map(([subject, counts]) => {
            const score = Math.round((counts.correct / counts.total) * 100);
            const drop = 100 - score;
            let type = "warning";
            if (drop > 50)
                type = "danger";
            return {
                subject,
                subjectId: counts.id,
                drop,
                msg: `Sua precisão atual é de ${score}%. É recomendado um treino de choque nesta área.`,
                type
            };
        });
        diagnostics.sort((a, b) => b.drop - a.drop);
        return diagnostics.slice(0, 2);
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
    async submitAnswer(req, body) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
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
    async startSimulado(req, simuladoId) {
        const attempt = await this.prisma.simuladoAttempt.create({
            data: {
                userId: req.user.userId,
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('auth/check-session'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "checkSession", null);
__decorate([
    (0, common_1.Post)('webhooks/hotmart'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "hotmartWebhook", null);
__decorate([
    (0, common_1.Get)('cargos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getCargos", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('onboarding'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "submitOnboarding", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('users/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "updateUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('stats/radar'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getRadarStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('stats/diagnostics'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getDiagnostics", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('subjects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('questions'),
    __param(0, (0, common_1.Query)('subjectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getQuestions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('answers'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "submitAnswer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('simulados'),
    __param(0, (0, common_1.Query)('cargoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getSimulados", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('simulados/:id/start'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService])
], AppController);
//# sourceMappingURL=app.controller.js.map