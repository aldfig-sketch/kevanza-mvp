export const emailTemplates = {
  enviadoAJuridico: (usuario: string, titulo: string) => ({
    subject: `✅ Bases enviadas a revisión jurídica - ${titulo}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f766e;">Hola ${usuario},</h2>
        <p style="color: #374151; font-size: 16px;">Tus bases han sido enviadas a revisión jurídica.</p>

        <div style="background: #f0fdfc; border-left: 4px solid #0f766e; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #374151;"><strong>Requerimiento:</strong> ${titulo}</p>
          <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">Estado: <span style="background: #0f766e; color: white; padding: 2px 8px; border-radius: 3px;">ENVIADA A JURÍDICO</span></p>
        </div>

        <p style="color: #6b7280; font-size: 14px;">El equipo jurídico revisará y te notificará cuando tengan observaciones o aprobación.</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">Sistema KEVANZA - Gestión de Bases de Licitaciones</p>
      </div>
    `,
  }),

  observacionesJuridicas: (usuario: string, titulo: string, observaciones: string) => ({
    subject: `⚠️ Observaciones jurídicas - ${titulo}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Hola ${usuario},</h2>
        <p style="color: #374151; font-size: 16px;">El equipo jurídico tiene observaciones sobre tus bases.</p>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #374151;"><strong>Requerimiento:</strong> ${titulo}</p>
          <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">Estado: <span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 3px;">EN REVISIÓN - OBSERVACIONES</span></p>
        </div>

        <p style="color: #374151; font-weight: 500;">Observaciones:</p>
        <pre style="background: #f3f4f6; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 12px; color: #374151;">${observaciones}</pre>

        <p style="color: #6b7280; font-size: 14px;">Por favor ajusta las bases según las observaciones y reenvía para continuar con el proceso.</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">Sistema KEVANZA - Gestión de Bases de Licitaciones</p>
      </div>
    `,
  }),

  basesAprobadas: (usuario: string, titulo: string) => ({
    subject: `✅ APROBADO - Bases listas para Mercado Público - ${titulo}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">¡Excelente, ${usuario}!</h2>
        <p style="color: #374151; font-size: 16px;">Tus bases han sido <span style="color: #10b981; font-weight: bold;">APROBADAS</span> por el equipo jurídico.</p>

        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #374151;"><strong>Requerimiento:</strong> ${titulo}</p>
          <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">Estado: <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 3px;">APROBADA</span></p>
        </div>

        <p style="color: #374151; font-weight: 500;">Las bases están listas para:</p>
        <ul style="color: #6b7280; padding-left: 20px;">
          <li>Generación del decreto</li>
          <li>Publicación en Mercado Público</li>
        </ul>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">Sistema KEVANZA - Gestión de Bases de Licitaciones</p>
      </div>
    `,
  }),

  nuevaRevision: (abogado: string, titulo: string, usuario: string) => ({
    subject: `📋 NUEVA REVISIÓN - ${titulo}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f766e;">Hola ${abogado},</h2>
        <p style="color: #374151; font-size: 16px;">Tienes una nueva base para revisar.</p>

        <div style="background: #f0fdfc; border-left: 4px solid #0f766e; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #374151;"><strong>Requerimiento:</strong> ${titulo}</p>
          <p style="margin: 8px 0 0 0; color: #374151;"><strong>Enviado por:</strong> ${usuario}</p>
          <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">Ingresa al panel de revisiones para evaluar las bases.</p>
        </div>

        <a href="https://kevanza-mvp.vercel.app/juridico/revisiones" style="display: inline-block; background: #0f766e; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 500; margin: 20px 0;">Ir al Panel de Revisiones</a>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">Sistema KEVANZA - Gestión de Bases de Licitaciones</p>
      </div>
    `,
  }),
}
