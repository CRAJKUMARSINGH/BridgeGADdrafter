import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DWGGeneratorService } from '../../server/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { parameters, exportSettings } = req.body || {};
    if (!parameters) return res.status(400).json({ error: 'Parameters are required' });

    const dwgGenerator = new DWGGeneratorService(parameters);
    const dwgData = dwgGenerator.exportDWG({
      paperSize: exportSettings?.paperSize || 'A4',
      orientation: 'landscape',
      scale: parseFloat((exportSettings?.drawingScale || '1:100').replace('1:', '')) || 100,
      includeDimensions: exportSettings?.includeDimensions !== false,
      includeTitleBlock: exportSettings?.includeTitleBlock !== false,
      includeGrid: exportSettings?.includeGrid === true
    });

    const filename = `bridge_export_${new Date().toISOString().split('T')[0]}.dwg`;
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(dwgData.commands.join('\n'));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to generate DWG export' });
  }
}

