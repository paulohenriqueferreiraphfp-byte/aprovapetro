"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
prisma.topic.findMany().then(console.log).finally(() => prisma.$disconnect());
//# sourceMappingURL=get-topics.js.map