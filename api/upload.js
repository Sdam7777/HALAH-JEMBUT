const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const form = new formidable.IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Form parse error' }));
      return;
    }

    const file = files.file;
    if (!file) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'No file uploaded' }));
      return;
    }

    try {
      const data = fs.readFileSync(file.filepath || file.path);
      const ext = path.extname(file.originalFilename || file.name) || '.jpg';
      const filename = `grup-${Date.now()}${ext}`;

      const blob = await put(filename, data, { access: 'public' });

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ url: blob.url }));
    } catch (e) {
      console.error('Upload error', e);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Upload failed', detail: String(e) }));
    }
  });
};
