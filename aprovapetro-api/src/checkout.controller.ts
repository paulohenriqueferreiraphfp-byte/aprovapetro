import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// ⚠️ Em produção, essas chaves DEVEM vir de variáveis de ambiente (.env)
const client = new MercadoPagoConfig({
  accessToken:
    process.env.MP_ACCESS_TOKEN ||
    'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000',
});

@Controller('checkout')
export class CheckoutController {
  // 1. Rota chamada pelo nosso site para gerar o link de pagamento seguro
  @Post('create-preference')
  async createPreference(@Body() body: { planId: string; userId: string }) {
    try {
      const preference = new Preference(client);

      const response = await preference.create({
        body: {
          items: [
            {
              id: body.planId,
              title: 'Assinatura VIP AprovaPETRO',
              quantity: 1,
              unit_price: 49.9, // Valor em reais
              currency_id: 'BRL',
            },
          ],
          external_reference: body.userId, // Guardamos o ID do usuário para saber quem pagou
          back_urls: {
            success: 'http://localhost:3000/sucesso',
            failure: 'http://localhost:3000/falha',
            pending: 'http://localhost:3000/pendente',
          },
          auto_return: 'approved',
          // O webhook avisa o nosso servidor sem depender do navegador do cliente
          notification_url: 'https://seusite.com.br/api/checkout/webhook',
        },
      });

      return { success: true, init_point: response.init_point }; // init_point é a URL segura do Mercado Pago
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Erro ao gerar checkout' };
    }
  }

  // 2. Rota chamada SOMENTE pelo Mercado Pago avisando se o Pix/Cartão passou
  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Headers('x-signature') signature: string,
  ) {
    // 🔒 Verificação de Segurança (Assinatura do Webhook)
    // Na vida real, validaríamos a "signature" usando o "webhook secret" do Mercado Pago
    // para garantir que hackers não falsifiquem essa chamada.

    const paymentId = req.query['data.id'] || req.body?.data?.id;
    const type = req.query.type || req.body?.type;

    if (type === 'payment' && paymentId) {
      console.log(
        `[Segurança] Recebido aviso de pagamento secreto: ID ${paymentId}`,
      );

      // Aqui faríamos a consulta na API do Mercado Pago para ver se o status é "approved"
      // E então: await prisma.user.update({ where: { id: userId }, data: { isVip: true } })
    }

    return { received: true };
  }
}
