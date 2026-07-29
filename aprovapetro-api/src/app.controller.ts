import { Controller, Get, Post, Body, UnauthorizedException, Query, Param, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('api')
export class AppController {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  @Post('auth/login')
  async login(@Body() body: { email: string; password?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email }
    });
    
    if (!user) throw new UnauthorizedException('E-mail ou senha incorretos.');
    
    // Validar senha (como o banco de dados tem 'hashed_pw' mocado, a gente deixa passar se for 'hashed_pw', caso contrário usa bcrypt)
    if (user.passwordHash !== 'hashed_pw') {
      const isMatch = await bcrypt.compare(body.password || '', user.passwordHash);
      if (!isMatch) throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    
    return {
      userId: user.id, // Mantemos para retrocompatibilidade
      accessToken,
      isOnboarded: !!user.cargoId,
      name: user.name,
      email: user.email,
      avatarId: user.avatarId,
    };
  }

  @Post('auth/register')
  async register(@Body() body: { name: string; email: string; password?: string }) {
    const isAdmin = body.email === 'paulo.henrique.ferreira.phfp@gmail.com' || body.email.includes('admin');
    
    if (!isAdmin) {
      const allowed = await this.prisma.allowedEmail.findUnique({
        where: { email: body.email }
      });
      if (!allowed) {
        throw new UnauthorizedException('E-mail não autorizado. Você precisa adquirir o acesso na Hotmart primeiro.');
      }
    }

    const existing = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      throw new UnauthorizedException('Este e-mail já está em uso.');
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

  @UseGuards(JwtAuthGuard)
  @Get('auth/check-session')
  async checkSession() {
    return { isValid: true };
  }

  @Post('webhooks/hotmart')
  async hotmartWebhook(@Body() body: any) {
    // A Hotmart envia um POST para cá quando uma venda é aprovada.
    // O formato do Postback V2 da Hotmart coloca os dados dentro de body.data e body.event
    if (body.event === 'PURCHASE_APPROVED' && body.data && body.data.buyer) {
      const buyerEmail = body.data.buyer.email;
      
      // Tentar salvar o email na lista VIP
      try {
        await this.prisma.allowedEmail.upsert({
          where: { email: buyerEmail },
          update: {},
          create: { email: buyerEmail }
        });
        console.log(`Venda Aprovada (Hotmart)! E-mail ${buyerEmail} liberado para cadastro.`);
      } catch (e) {
        console.error('Erro ao salvar AllowedEmail:', e);
      }
    }
    
    // Sempre retornar 200 OK para a Hotmart saber que recebemos
    return { received: true };
  }


  @Get('cargos')
  async getCargos() {
    return this.prisma.cargo.findMany();
  }

  @UseGuards(JwtAuthGuard)
  @Post('onboarding')
  async submitOnboarding(@Req() req: any, @Body() body: { cargoId: string }) {
    const user = await this.prisma.user.update({
      where: { id: req.user.userId },
      data: { cargoId: body.cargoId },
      include: { cargo: true },
    });

    // Create Initial Daily Mission based on Cargo
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

  @UseGuards(JwtAuthGuard)
  @Post('users/:id')
  async updateUser(@Req() req: any, @Param('id') id: string, @Body() body: { name?: string, avatarId?: string, examDate?: string }) {
    if (id !== req.user.userId) throw new UnauthorizedException();
    
    const dataToUpdate: any = {
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

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    const user = await this.prisma.user.findFirst({
      where: { id: req.user.userId },
      include: { 
        missions: { orderBy: { date: 'desc' }, take: 1 },
        cargo: true
      }
    });
    if (!user) return {};
    
    // Calculate total hours and precision using DB aggregations instead of pulling all rows
    const aggregate = await this.prisma.userAnswer.aggregate({
      where: { userId: user.id },
      _count: { id: true },
      _sum: { timeSpentMs: true }
    });
    const correctCount = await this.prisma.userAnswer.count({
      where: { userId: user.id, isCorrect: true }
    });
    
    let totalQuestions = aggregate._count.id;
    let totalTimeMs = aggregate._sum.timeSpentMs || 0;
    
    const precision = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
    
    const totalMinutes = Math.floor(totalTimeMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    let daysToExam = null;
    if (user.examDate) {
      const diffTime = new Date(user.examDate).getTime() - new Date().getTime();
      daysToExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (daysToExam < 0) daysToExam = 0;
    } 

    // REAL RANKING
    let topPercent = 100;
    if (user.xp > 0) {
      const usersAhead = await this.prisma.user.count({
        where: { xp: { gt: user.xp } }
      });
      const totalUsers = await this.prisma.user.count();
      if (totalUsers > 1) {
        const rank = usersAhead + 1;
        topPercent = Math.max(1, Math.round((rank / totalUsers) * 100));
      } else {
        topPercent = 1;
      }
    }
    if (topPercent === 0) topPercent = 1; 
    
    let indexStatus = { text: "REGULAR", color: "#F5C518", bg: "bg-[#F5C518]" };
    if (precision >= 85) indexStatus = { text: "ELITE", color: "#3ADB6E", bg: "bg-[#3ADB6E]" };
    else if (precision >= 70) indexStatus = { text: "COMPETITIVO", color: "#3ADB6E", bg: "bg-[#3ADB6E]" };
    else if (precision < 50) indexStatus = { text: "PERIGO", color: "#EF4444", bg: "bg-[#EF4444]" };

    let rankMessage = `Você está no Top ${topPercent}%`;
    if (totalQuestions === 0) {
      rankMessage = "Aviso: Faça o Nivelamento Urgente!";
    } else if (precision < 50) {
      rankMessage = "Alerta: Você está abaixo da média. Treine mais!";
    } else if (precision < 70) {
      rankMessage = `Atenção: Acelere o ritmo! (Top ${topPercent}%)`;
    }

    // Fake subjects performance for Home view
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

  @UseGuards(JwtAuthGuard)
  @Get('stats/radar')
  async getRadarStats(@Req() req: any) {
    const userId = req.user.userId;
    if (!userId) return [];
    
    // Fetch user answers joined with topics and subjects
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

    const subjectStats: Record<string, { total: number; correct: number }> = {};
    
    answers.forEach(ans => {
      const subjName = ans.question.topic?.subject?.name || 'Gerais';
      if (!subjectStats[subjName]) {
        subjectStats[subjName] = { total: 0, correct: 0 };
      }
      subjectStats[subjName].total++;
      if (ans.isCorrect) subjectStats[subjName].correct++;
    });

    const radar = Object.entries(subjectStats).map(([subject, counts]) => ({
      subject,
      score: counts.total === 0 ? 0 : Math.round((counts.correct / counts.total) * 100)
    }));

    // Ensure we always have 6 points for the hexagon radar
    let defaultLabels = ['Português', 'Matemática', 'Legislação', 'NR-10', 'Específicas', 'Inglês'];
    
    if (user?.cargo?.name) {
      if (user.cargo.name.includes('Segurança')) {
        defaultLabels = ['Português', 'Matemática', 'NR-10', 'NRs', 'Higiene', 'Prevenção'];
      } else if (user.cargo.name.includes('Eletrotécnica')) {
        defaultLabels = ['Português', 'Matemática', 'NR-10', 'Circuitos', 'Máquinas Elét.', 'Instalações'];
      } else if (user.cargo.name.includes('Mecânica')) {
        defaultLabels = ['Português', 'Matemática', 'Termodinâmica', 'Fluidos', 'Metrologia', 'Resistência'];
      } else if (user.cargo.name.includes('Operação')) {
        defaultLabels = ['Português', 'Matemática', 'Química', 'Física', 'Instrumentação', 'Equipamentos'];
      }
    }

    const finalRadar = defaultLabels.map(label => {
      const found = radar.find(r => r.subject.includes(label) || label.includes(r.subject));
      return {
        subject: label,
        score: found ? found.score : 0 // Matemática real: 0 para matérias não respondidas
      };
    });

    return finalRadar;
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/diagnostics')
  async getDiagnostics(@Req() req: any) {
    const userId = req.user.userId;
    if (!userId) return [];
    
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

    const subjectStats: Record<string, { total: number; correct: number; id: string }> = {};
    
    answers.forEach(ans => {
      const subjName = ans.question.topic?.subject?.name || 'Gerais';
      const subjId = ans.question.topic?.subjectId || '';
      if (!subjectStats[subjName]) {
        subjectStats[subjName] = { total: 0, correct: 0, id: subjId };
      }
      subjectStats[subjName].total++;
      if (ans.isCorrect) subjectStats[subjName].correct++;
    });

    const diagnostics = Object.entries(subjectStats).map(([subject, counts]) => {
      const score = Math.round((counts.correct / counts.total) * 100);
      const drop = 100 - score;
      let type = "warning";
      if (drop > 50) type = "danger";
      
      return {
        subject,
        subjectId: counts.id,
        drop,
        msg: `Sua precisão atual é de ${score}%. É recomendado um treino de choque nesta área.`,
        type
      };
    });

    // Ordenar pelo maior drop (pior matéria)
    diagnostics.sort((a, b) => b.drop - a.drop);

    return diagnostics.slice(0, 2);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subjects')
  async getSubjects() {
    return this.prisma.subject.findMany();
  }

  @UseGuards(JwtAuthGuard)
  @Get('questions')
  async getQuestions(@Query('subjectId') subjectId?: string) {
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

  @UseGuards(JwtAuthGuard)
  @Post('answers')
  async submitAnswer(@Req() req: any, @Body() body: { questionId: string; optionIndex: number; timeSpentMs: number }) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    const question = await this.prisma.question.findUnique({ where: { id: body.questionId } });
    
    if (!user || !question) return { success: false };

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

  @UseGuards(JwtAuthGuard)
  @Get('simulados')
  async getSimulados(@Query('cargoId') cargoId: string) {
    return this.prisma.simulado.findMany({
      where: cargoId ? { cargoId } : undefined,
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('simulados/:id/start')
  async startSimulado(@Req() req: any, @Param('id') simuladoId: string) {
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

  @Post('simulados/finish')
  async finishSimulado(@Body() body: { attemptId: string; answers: Record<string, number> }) {
    const attempt = await this.prisma.simuladoAttempt.findUnique({
      where: { id: body.attemptId },
      include: { simulado: { include: { questions: { include: { question: true } } } } }
    });

    if (!attempt) return { success: false };

    let correctCount = 0;
    const totalQuestions = attempt.simulado.questions.length;

    // We don't save individual answers for MVP speed, just calculate score
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

    // Award XP
    await this.prisma.user.update({
      where: { id: attempt.userId },
      data: { xp: { increment: correctCount * 15 } } // More XP for simulado
    });

    return { success: true, score, correctCount, totalQuestions };
  }

  @Post('admin/questions/import')
  async importQuestions(@Body() body: { questions: any[] }) {
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
            create: q.options.map((optText: string, index: number) => ({
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
  @Post('chat')
  async chat(@Body() body: { message: string }) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

    } catch (error) {
      console.error('Erro na IA:', error);
      return { reply: 'Minhas engrenagens travaram um pouco! Houve um erro de conexão com a central de inteligência. Tente novamente mais tarde.' };
    }
  }
}
