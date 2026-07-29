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
exports.CheckoutController = void 0;
const common_1 = require("@nestjs/common");
const mercadopago_1 = require("mercadopago");
const client = new mercadopago_1.MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN ||
        'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000',
});
let CheckoutController = class CheckoutController {
    async createPreference(body) {
        try {
            const preference = new mercadopago_1.Preference(client);
            const response = await preference.create({
                body: {
                    items: [
                        {
                            id: body.planId,
                            title: 'Assinatura VIP AprovaPETRO',
                            quantity: 1,
                            unit_price: 49.9,
                            currency_id: 'BRL',
                        },
                    ],
                    external_reference: body.userId,
                    back_urls: {
                        success: 'http://localhost:3000/sucesso',
                        failure: 'http://localhost:3000/falha',
                        pending: 'http://localhost:3000/pendente',
                    },
                    auto_return: 'approved',
                    notification_url: 'https://seusite.com.br/api/checkout/webhook',
                },
            });
            return { success: true, init_point: response.init_point };
        }
        catch (error) {
            console.error(error);
            return { success: false, message: 'Erro ao gerar checkout' };
        }
    }
    async handleWebhook(req, signature) {
        const paymentId = req.query['data.id'] || req.body?.data?.id;
        const type = req.query.type || req.body?.type;
        if (type === 'payment' && paymentId) {
            console.log(`[Segurança] Recebido aviso de pagamento secreto: ID ${paymentId}`);
        }
        return { received: true };
    }
};
exports.CheckoutController = CheckoutController;
__decorate([
    (0, common_1.Post)('create-preference'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "createPreference", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "handleWebhook", null);
exports.CheckoutController = CheckoutController = __decorate([
    (0, common_1.Controller)('checkout')
], CheckoutController);
//# sourceMappingURL=checkout.controller.js.map