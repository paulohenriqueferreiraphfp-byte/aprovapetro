"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const qs = await prisma.question.findMany({ take: 5, include: { options: true } });
    for (const q of qs) {
        console.log(`Q ID: ${q.id}, Bank: ${q.bank}`);
        console.log(`Statement length: ${q.statement.length}`);
        console.log(`Statement text: ${q.statement}`);
        console.log(`Options count: ${q.options.length}`);
        console.log('---');
    }
}
main().then(() => prisma.$disconnect()).catch(console.error);
//# sourceMappingURL=check-statements.js.map