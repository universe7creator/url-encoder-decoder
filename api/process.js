module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-License-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { action, text, options = {} } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!action || !['encode', 'decode', 'encodeComponent', 'decodeComponent'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use: encode, decode, encodeComponent, decodeComponent' });
    }

    let result;
    let stats = {
      originalLength: text.length,
      processedAt: new Date().toISOString()
    };

    switch (action) {
      case 'encode':
        result = encodeURI(text);
        break;
      case 'decode':
        try {
          result = decodeURI(text);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid URL format for decode' });
        }
        break;
      case 'encodeComponent':
        result = encodeURIComponent(text);
        break;
      case 'decodeComponent':
        try {
          result = decodeURIComponent(text);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid encoded component format' });
        }
        break;
    }

    stats.resultLength = result.length;
    stats.changePercent = ((result.length - text.length) / text.length * 100).toFixed(2);

    return res.status(200).json({
      success: true,
      action,
      original: text,
      result,
      stats,
      options: {
        preserveLineBreaks: options.preserveLineBreaks || false,
        encoding: options.encoding || 'utf-8'
      }
    });

  } catch (error) {
    console.error('Process error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
