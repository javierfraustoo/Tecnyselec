const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);

// Parse JSON body
app.use(express.json());

// Seguridad: headers basicos
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// No cachear HTML (para que deploys se reflejen inmediato)
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Servir archivos estaticos desde /public (CSS/JS/imgs se cachean con ?v= busting)
const isDev = process.env.NODE_ENV !== 'production';
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: isDev ? 0 : '7d',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// API: Enviar formulario de contacto por correo
app.post('/api/contact', async (req, res) => {
  const { nombre, celular, empresa, correo, descripcion } = req.body;

  if (!nombre || !celular || !empresa || !correo || !descripcion) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    await resend.emails.send({
      from: 'Tecnyselec Web <onboarding@resend.dev>',
      to: 'administracion@tecnyselec.com',
      subject: `Nuevo contacto: ${nombre} - ${empresa}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0B1F5C; padding: 24px; text-align: center;">
            <h1 style="color: #F5D000; margin: 0; font-size: 22px;">Nuevo Contacto desde la Web</h1>
          </div>
          <div style="padding: 24px; background: #f8f9fb; border: 1px solid #e1e5eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 8px; font-weight: bold; color: #0B1F5C; border-bottom: 1px solid #e1e5eb; width: 140px;">Nombre:</td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e1e5eb;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 12px 8px; font-weight: bold; color: #0B1F5C; border-bottom: 1px solid #e1e5eb;">Celular:</td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e1e5eb;">${celular}</td>
              </tr>
              <tr>
                <td style="padding: 12px 8px; font-weight: bold; color: #0B1F5C; border-bottom: 1px solid #e1e5eb;">Empresa:</td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e1e5eb;">${empresa}</td>
              </tr>
              <tr>
                <td style="padding: 12px 8px; font-weight: bold; color: #0B1F5C; border-bottom: 1px solid #e1e5eb;">Correo:</td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e1e5eb;"><a href="mailto:${correo}">${correo}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px 8px; font-weight: bold; color: #0B1F5C; vertical-align: top;">Descripcion:</td>
                <td style="padding: 12px 8px;">${descripcion}</td>
              </tr>
            </table>
          </div>
          <div style="padding: 16px; text-align: center; color: #9aa0ad; font-size: 12px;">
            Enviado desde tecnyselec.com
          </div>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error enviando correo:', error);
    res.status(500).json({ error: 'No se pudo enviar el mensaje. Intenta de nuevo.' });
  }
});

// Cualquier ruta no encontrada redirige al index (SPA-friendly)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Tecnyselec website corriendo en http://localhost:${PORT}`);
});
