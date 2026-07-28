export declare class CheckoutController {
    createPreference(body: {
        planId: string;
        userId: string;
    }): Promise<{
        success: boolean;
        init_point: string | undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        init_point?: undefined;
    }>;
    handleWebhook(req: any, signature: string): Promise<{
        received: boolean;
    }>;
}
