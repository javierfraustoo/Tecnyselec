const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Seguridad: headers básicos
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  etag: true
}));

// Cualquier ruta no encontrada redirige al index (SPA-friendly)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Tecnyselec website corriendo en http://localhost:${PORT}`);
});
