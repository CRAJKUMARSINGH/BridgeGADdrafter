import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { inputData } = req.body || {};
    if (!inputData || typeof inputData !== 'string') {
      return res.status(400).json({ error: 'Input data is required and must be a string' });
    }
    if (inputData.length > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'Input file is too large (max 10MB)' });
    }

    const lines = inputData.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 10) return res.status(400).json({ error: 'Input file must contain at least 10 parameters' });

    const parseNum = (v: string, name: string, isInt = false) => {
      const n = isInt ? parseInt(v, 10) : parseFloat(v);
      if (Number.isNaN(n) || (isInt && !Number.isInteger(n))) throw new Error(`Invalid ${name}: ${v}`);
      return n;
    };

    const parameters = {
      scale1: parseNum(lines[0], 'scale1'),
      scale2: parseNum(lines[1], 'scale2'),
      skew: parseNum(lines[2], 'skew'),
      datum: parseNum(lines[3], 'datum'),
      toprl: parseNum(lines[4], 'toprl'),
      left: parseNum(lines[5], 'left'),
      right: parseNum(lines[6], 'right'),
      xincr: parseNum(lines[7], 'xincr'),
      yincr: parseNum(lines[8], 'yincr'),
      noch: parseNum(lines[9], 'noch', true)
    };

    if (parameters.scale1 <= 0 || parameters.scale2 <= 0) throw new Error('Scale values must be positive');
    if (parameters.xincr <= 0 || parameters.yincr <= 0) throw new Error('Increment values must be positive');
    if (parameters.noch <= 0 || !Number.isInteger(parameters.noch)) throw new Error('Number of chainages must be a positive integer');
    if (parameters.right <= parameters.left) throw new Error('Right chainage must be greater than left chainage');
    if (parameters.toprl <= parameters.datum) throw new Error('Top level must be greater than datum level');

    const crossSections: Array<{ chainage: number; level: number }> = [];
    for (let i = 10; i + 1 < lines.length; i += 2) {
      const chainage = parseNum(lines[i], 'chainage');
      const level = parseNum(lines[i + 1], 'level');
      crossSections.push({ chainage, level });
    }
    crossSections.sort((a, b) => a.chainage - b.chainage);

    res.status(200).json({ success: true, parameters, crossSections });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Failed to parse input data' });
  }
}

