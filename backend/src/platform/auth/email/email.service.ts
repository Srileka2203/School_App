import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly transporter: nodemailer.Transporter | null = null;
    private readonly isConfigured: boolean = false;

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.get<string>('MAIL_HOST');
        const port = Number(this.configService.get<string>('MAIL_PORT') || 587);
        const secure =
            this.configService.get<string>('MAIL_SECURE') === 'true' || port === 465;

        const user = this.configService.get<string>('MAIL_USER');
        const password = this.configService.get<string>('MAIL_PASSWORD');

        if (!host || !user || !password) {
            this.logger.warn(
                'Email configuration is missing (MAIL_HOST, MAIL_USER, MAIL_PASSWORD). ' +
                'Running in development/mock mode: outgoing emails will be logged to console.',
            );
            this.isConfigured = false;
            this.transporter = null;
            return;
        }

        try {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure,
                auth: {
                    user,
                    pass: password,
                },
            });
            this.isConfigured = true;
            this.logger.log(`Email service initialized with host: ${host}:${port}`);
        } catch (err) {
            this.logger.error('Failed to initialize email transporter', err);
            this.isConfigured = false;
            this.transporter = null;
        }
    }

    private get sender(): string {
        const name =
            this.configService.get<string>('MAIL_FROM_NAME') || 'CRM';

        const email =
            this.configService.get<string>('MAIL_FROM_EMAIL') ||
            this.configService.get<string>('MAIL_USER') ||
            'noreply@crm.local';

        return `"${name}" <${email}>`;
    }

    private escapeHtml(value: string): string {
        return value.replace(/[&<>"']/g, (character) => {
            const entities: Record<string, string> = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            };

            return entities[character];
        });
    }

    async sendWelcomeEmail(email: string, name: string, loginUrl?: string): Promise<void> {
        if (!this.isConfigured || !this.transporter) {
            this.logger.log(`[DEV MODE] Welcome email to ${email} (${name}): Account created successfully.`);
            return;
        }

        const effectiveLoginUrl =
            loginUrl ||
            this.configService.get<string>('app.frontendUrl') ||
            this.configService.get<string>('FRONTEND_URL') ||
            'http://localhost:5173/login';

        try {
            await this.transporter.sendMail({
                from: this.sender,
                to: email,
                subject: 'Welcome to CRM - Account Confirmation',
                text: `Hello ${name},\n\nWelcome to our CRM platform! Your account has been created successfully.\n\nYou can sign in here: ${effectiveLoginUrl}\n\nBest regards,\nThe CRM Team`,
                html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px 24px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff; color: #1e293b;">
            <div style="margin-bottom: 20px;">
              <h2 style="color: #065f46; margin: 0 0 6px 0; font-size: 22px;">Welcome to CRM!</h2>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Your account is ready</p>
            </div>
            <p style="font-size: 15px; line-height: 1.6;">Hello <strong>${this.escapeHtml(name)}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6;">Thank you for registering. Your CRM account has been created successfully and is now active.</p>
            <p style="font-size: 15px; line-height: 1.6;">You can begin managing your leads, contacts, deals, communications, and collaborating with your team.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${effectiveLoginUrl}" style="background-color: #10b981; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
                Sign In to Your Account
              </a>
            </div>
            <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px;">
              If you did not register for this account, you can safely ignore this email.
            </p>
          </div>
        `,
            });

            this.logger.log(`Welcome email successfully sent to ${email}`);
        } catch (error) {
            this.logger.error(
                `Failed to send welcome email to ${email}`,
                error instanceof Error ? error.stack : String(error),
            );
        }
    }

    async sendPasswordResetEmail(
        email: string,
        name: string,
        resetLink: string,
    ): Promise<void> {
        if (!this.isConfigured || !this.transporter) {
            this.logger.log(
                `[DEV MODE] Password reset email to ${email} (${name}). Reset Link: ${resetLink}`,
            );
            return;
        }

        try {
            await this.transporter.sendMail({
                from: this.sender,
                to: email,
                subject: 'Reset Your CRM Password',
                text: `Hello ${name},\n\nWe received a request to reset your CRM password.\n\nClick the link below to set a new password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe CRM Team`,
                html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px 24px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff; color: #1e293b;">
            <div style="margin-bottom: 20px;">
              <h2 style="color: #065f46; margin: 0 0 6px 0; font-size: 22px;">Password Reset Request</h2>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Secure link to reset your account password</p>
            </div>
            <p style="font-size: 15px; line-height: 1.6;">Hello <strong>${this.escapeHtml(name)}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6;">We received a request to reset the password for your CRM account. Click the button below to set a new password:</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${resetLink}" style="background-color: #10b981; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              This link is valid for <strong>1 hour</strong>. If the button above does not work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #0284c7; word-break: break-all; background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ${resetLink}
            </p>
            <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
        `,
            });

            this.logger.log(`Password reset email successfully sent to ${email}`);
        } catch (error) {
            this.logger.error(
                `Failed to send password reset email to ${email}`,
                error instanceof Error ? error.stack : String(error),
            );
        }
    }

    async sendUserInvitationEmail(
        email: string,
        name: string,
        tempPassword?: string,
        roleName?: string,
        loginUrl?: string,
    ): Promise<void> {
        if (!this.isConfigured || !this.transporter) {
            this.logger.log(
                `[DEV MODE] User invitation email to ${email} (${name}). Temp Pass: ${tempPassword}, Role: ${roleName}`,
            );
            return;
        }

        const effectiveLoginUrl =
            loginUrl ||
            this.configService.get<string>('app.frontendUrl') ||
            this.configService.get<string>('FRONTEND_URL') ||
            'http://localhost:5173/login';

        try {
            await this.transporter.sendMail({
                from: this.sender,
                to: email,
                subject: "You've been invited to join CRM!",
                text: `Hello ${name},\n\nYou have been invited to join the CRM platform as a ${roleName || 'Team Member'}.\n\nYour login email: ${email}${tempPassword ? `\nTemporary password: ${tempPassword}` : ''}\n\nSign in here: ${effectiveLoginUrl}\n\nBest regards,\nThe CRM Team`,
                html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px 24px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff; color: #1e293b;">
            <div style="margin-bottom: 20px;">
              <h2 style="color: #065f46; margin: 0 0 6px 0; font-size: 22px;">You're Invited to Join CRM!</h2>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Your team member account has been created</p>
            </div>
            <p style="font-size: 15px; line-height: 1.6;">Hello <strong>${this.escapeHtml(name)}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6;">You have been invited to join the CRM platform as <strong>${this.escapeHtml(roleName || 'Team Member')}</strong>.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Login Email:</strong> ${this.escapeHtml(email)}</p>
              ${tempPassword ? `<p style="margin: 0; font-size: 14px;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: #0f172a;">${this.escapeHtml(tempPassword)}</code></p>` : ''}
            </div>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${effectiveLoginUrl}" style="background-color: #10b981; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
                Sign In to CRM
              </a>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              For security, we recommend changing your password after signing in for the first time.
            </p>
            <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px;">
              If you have any questions, reach out to your administrator.
            </p>
          </div>
        `,
            });

            this.logger.log(`User invitation email successfully sent to ${email}`);
        } catch (error) {
            this.logger.error(
                `Failed to send user invitation email to ${email}`,
                error instanceof Error ? error.stack : String(error),
            );
        }
    }

    async sendWorkspaceInviteEmail(
        email: string,
        workspaceName: string,
        roleName: string,
        inviteLink: string,
    ): Promise<void> {
        if (!this.isConfigured || !this.transporter) {
            this.logger.log(
                `[DEV MODE] Workspace invite email to ${email}. Workspace: ${workspaceName}, Role: ${roleName}`,
            );
            return;
        }

        try {
            await this.transporter.sendMail({
                from: this.sender,
                to: email,
                subject: `Invitation to join ${workspaceName} on CRM`,
                text: `Hello,\n\nYou have been invited to join the "${workspaceName}" workspace on CRM as ${roleName}.\n\nAccept your invitation here:\n${inviteLink}\n\nBest regards,\nThe CRM Team`,
                html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px 24px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff; color: #1e293b;">
            <div style="margin-bottom: 20px;">
              <h2 style="color: #065f46; margin: 0 0 6px 0; font-size: 22px;">Workspace Invitation</h2>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Collaborate with your team</p>
            </div>
            <p style="font-size: 15px; line-height: 1.6;">Hello,</p>
            <p style="font-size: 15px; line-height: 1.6;">You have been invited to join the <strong>${this.escapeHtml(workspaceName)}</strong> workspace on CRM as <strong>${this.escapeHtml(roleName)}</strong>.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${inviteLink}" style="background-color: #10b981; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              If the button above does not work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #0284c7; word-break: break-all; background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ${inviteLink}
            </p>
          </div>
        `,
            });

            this.logger.log(`Workspace invitation email successfully sent to ${email}`);
        } catch (error) {
            this.logger.error(
                `Failed to send workspace invitation email to ${email}`,
                error instanceof Error ? error.stack : String(error),
            );
        }
    }
}
