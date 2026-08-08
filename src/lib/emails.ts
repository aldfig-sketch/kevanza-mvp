/**
 * Email Transaccionales - KEVANZA
 * Integración con SendGrid/Mailgun
 *
 * Por ahora: logging local
 * Futuro: SendGrid API
 */

interface EmailOptions {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

/**
 * Email: Bienvenida usuario nuevo
 */
export async function enviarEmailBienvenida(
  email: string,
  nombreOrganismo: string,
  rol: string
): Promise<void> {
  const mailOptions: EmailOptions = {
    to: email,
    subject: `Bienvenido a KEVANZA - ${nombreOrganismo}`,
    template: 'welcome',
    data: {
      email,
      nombreOrganismo,
      rol,
      url: 'https://kevanza-mvp.vercel.app',
      cambiarContraseniaUrl: 'https://kevanza-mvp.vercel.app/auth/cambiar-contrasenia',
    },
  }

  await enviarEmail(mailOptions)
}

/**
 * Email: Bases listas para Mercado Publico
 */
export async function enviarEmailBasesListas(
  emailAdmin: string,
  numeroRequerimiento: string,
  titulo: string
): Promise<void> {
  const mailOptions: EmailOptions = {
    to: emailAdmin,
    subject: `Bases listas para Mercado Público: ${numeroRequerimiento}`,
    template: 'bases-ready',
    data: {
      numeroRequerimiento,
      titulo,
      url: `https://kevanza-mvp.vercel.app/licitaciones/${numeroRequerimiento}`,
    },
  }

  await enviarEmail(mailOptions)
}

/**
 * Email: Reporte generado
 */
export async function enviarEmailReporteGenerado(
  emailAdmin: string,
  numeroLicitacion: string,
  tipoReporte: 'pdf' | 'excel'
): Promise<void> {
  const mailOptions: EmailOptions = {
    to: emailAdmin,
    subject: `Reporte ${tipoReporte.toUpperCase()} generado: ${numeroLicitacion}`,
    template: 'report-generated',
    data: {
      numeroLicitacion,
      tipoReporte,
      url: `https://kevanza-mvp.vercel.app/licitaciones/${numeroLicitacion}`,
    },
  }

  await enviarEmail(mailOptions)
}

/**
 * Email: Notificación de error
 */
export async function enviarEmailError(
  emailAdmin: string,
  numeroLicitacion: string,
  error: string
): Promise<void> {
  const mailOptions: EmailOptions = {
    to: emailAdmin,
    subject: `⚠️ Error en licitación: ${numeroLicitacion}`,
    template: 'error-notification',
    data: {
      numeroLicitacion,
      error,
      supportUrl: 'mailto:soporte@kevanza.cl',
      supportPhone: '+56 9 XXXX XXXX',
    },
  }

  await enviarEmail(mailOptions)
}

/**
 * Función principal: Enviar email
 *
 * Hoy: logging
 * Futuro: SendGrid/Mailgun API
 */
async function enviarEmail(options: EmailOptions): Promise<void> {
  console.log(
    `[EMAIL] ${options.to} | ${options.subject} | Template: ${options.template}`
  )

  // TODO: Integrar con SendGrid
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: options.to,
  //   from: 'noreply@kevanza.cl',
  //   subject: options.subject,
  //   html: renderTemplate(options.template, options.data),
  // });
}

/**
 * Batch: Enviar múltiples emails
 */
export async function enviarEmailsEnLote(
  emails: EmailOptions[]
): Promise<void> {
  console.log(
    `[EMAIL BATCH] Enviando ${emails.length} emails (${emails.map((e) => e.to).join(', ')})`
  )

  for (const email of emails) {
    await enviarEmail(email)
  }
}
