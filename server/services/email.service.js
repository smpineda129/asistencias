const nodemailer = require('nodemailer');

/**
 * Configuración del transportador de correo con Gmail
 */
const crearTransportador = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true, // true para puerto 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Plantilla HTML para correo de notificación de ingreso
 */
const plantillaIngresoHTML = (nombreCompleto, area, fechaHora) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notificación de Ingreso</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #E0F2FE;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #E0F2FE; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0033CC 0%, #2563EB 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: bold;">
                    🔔 Notificación de Ingreso
                  </h1>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #1F2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Estimado/a,
                  </p>
                  
                  <div style="background-color: #E0F2FE; border-left: 4px solid #0033CC; padding: 20px; margin: 20px 0; border-radius: 8px;">
                    <p style="color: #1F2937; font-size: 16px; line-height: 1.6; margin: 0;">
                      El usuario <strong style="color: #0033CC;">${nombreCompleto}</strong> del área de <strong>${area}</strong> ha iniciado sesión en el sistema.
                    </p>
                  </div>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td style="padding: 15px; background-color: #F9FAFB; border-radius: 8px;">
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: #6B7280; font-size: 14px; width: 40%;">
                              <strong>👤 Usuario:</strong>
                            </td>
                            <td style="color: #1F2937; font-size: 14px;">
                              ${nombreCompleto}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: #6B7280; font-size: 14px;">
                              <strong>🏢 Área:</strong>
                            </td>
                            <td style="color: #1F2937; font-size: 14px;">
                              ${area}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: #6B7280; font-size: 14px;">
                              <strong>📅 Fecha y Hora:</strong>
                            </td>
                            <td style="color: #1F2937; font-size: 14px;">
                              ${fechaHora}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    Este es un correo automático del Sistema de Control de Asistencia.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #F9FAFB; padding: 20px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                  <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Sistema de Control de Asistencia. Todos los derechos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Enviar notificación de ingreso a todos los CEOs
 */
const enviarNotificacionIngreso = async (usuario, fechaHora, ceoEmails) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ Configuración SMTP no encontrada. No se enviará correo.');
      return { success: false, message: 'Configuración SMTP no disponible' };
    }

    if (!ceoEmails || ceoEmails.length === 0) {
      console.warn('⚠️ No hay correos de CEO para enviar notificación.');
      return { success: false, message: 'No hay destinatarios CEO' };
    }

    const transportador = crearTransportador();
    const nombreCompleto = `${usuario.nombre} ${usuario.apellidos}`;
    
    const mailOptions = {
      from: `"Sistema de Asistencia" <${process.env.SMTP_USER}>`,
      to: ceoEmails.join(', '),
      subject: `🔔 Ingreso registrado: ${nombreCompleto}`,
      html: plantillaIngresoHTML(nombreCompleto, usuario.area, fechaHora),
      text: `El usuario ${nombreCompleto} del área de ${usuario.area} ha iniciado sesión el ${fechaHora}.`
    };

    const info = await transportador.sendMail(mailOptions);
    
    console.log('✅ Correo enviado:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId,
      destinatarios: ceoEmails.length
    };
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

/**
 * Verificar configuración SMTP
 */
const verificarConfiguracionSMTP = async () => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return { 
        success: false, 
        message: 'Variables SMTP no configuradas' 
      };
    }

    const transportador = crearTransportador();
    await transportador.verify();
    
    return { 
      success: true, 
      message: 'Configuración SMTP válida' 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error.message 
    };
  }
};

module.exports = {
  enviarNotificacionIngreso,
  verificarConfiguracionSMTP
};
