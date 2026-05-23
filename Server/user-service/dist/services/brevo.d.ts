interface SendEmailOptions {
    to: string;
    toName?: string;
    subject: string;
    htmlContent: string;
    otp?: string;
}
export declare function sendEmail(options: SendEmailOptions): Promise<void>;
export declare function buildOtpEmailHtml(otp: string, firstName: string): string;
export {};
