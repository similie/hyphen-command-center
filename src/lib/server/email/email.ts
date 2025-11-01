/* eslint-disable @typescript-eslint/no-explicit-any */
// import nodemailer from 'nodemailer';
import { EmailTransport } from "./transport";
import { htmlRender } from "@sveltelaunch/svelte-5-email";
import { EmailQuery } from "$lib/server/db/query";
import { _dirname } from "$lib/server/utils";
export type EmailTemplateContent = {
  data: Record<string, any>;
  templateName: string;
};
export type EmailContent = { html: string; text: string };

enum CommonSubject {
  otp = "Your One-Time Passcode",
  verify = "Verify your email address",
  password = "Your password reset request",
  account = "Your Hyphen Account",
}

const templates = import.meta.glob<{
  default: import("svelte").SvelteComponent;
}>("./templates/*.svelte", { eager: true });

export class EmailTemplate {
  private static templatePath = "./templates"; // path.join(_dirname, "..", "email", "templates");
  public static async renderTemplate(
    templateName: string,
    props: Record<string, any>,
    isHtml = true,
  ): Promise<string> {
    const extension = "svelte";
    const templatePath = `./templates/${templateName}.${extension}`;
    const template = templates[templatePath];
    if (!template) {
      throw new Error(
        `Template ${templateName}.${extension} not found in ${this.templatePath}`,
      );
    }
    const renderValues = {
      template: template.default,
      props,
      options: {
        plainText: !isHtml,
      },
    };
    const html = htmlRender(renderValues);
    return html;
  }

  /**
   * Render the specified EJS template with provided data.
   * @param {string} templateName The name of the EJS template file (without extension)
   * @param {Record<string, any>} data The data to inject into the template
   * @returns {Promise<string>} The rendered HTML or text
   */
  public static async render(
    templateName: string,
    data: Record<string, any>,
  ): Promise<EmailContent> {
    const [html, text] = await Promise.all([
      this.renderTemplate(templateName, data),
      this.renderTemplate(templateName, data, false),
    ]);
    return { html, text };
  }
}

export class SystemEmail {
  private static readonly FROM: string =
    process.env.DEFAULT_EMAIL_ADDRESS || "info@similie.org";
  // private static readonly eq: EmailQuery = new EmailQuery();
  public static async send(to: string, template: EmailTemplateContent) {
    const subject =
      CommonSubject[template.templateName as keyof typeof CommonSubject] ||
      "Your Hyphen Request";
    const content = await EmailTemplate.render(
      template.templateName,
      template.data,
    );

    const eq = new EmailQuery();
    // console.log("Email content", content, template);
    const email = await eq.createOne({
      email: to,
      content: content.text,
      templateProps: template.data,
    });

    try {
      const results = await this.sendMail(to, subject, content);
      email && (await eq.update({ sent: true }, { uid: email?.uid }));
      return results;
    } catch (e: any) {
      console.error("Email sending error", e);
      email &&
        (await eq.update(
          { sent: false, error: e.message },
          { uid: email?.uid },
        ));
    }

    return null;
  }

  public static sendMail(to: string, subject: string, content: EmailContent) {
    const mailOptions = {
      from: this.FROM,
      to: to,
      subject: subject,
      text: content.text,
      html: content.html,
    };

    const transporter = EmailTransport.transport;
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err: Error | null, data: any) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }
}
