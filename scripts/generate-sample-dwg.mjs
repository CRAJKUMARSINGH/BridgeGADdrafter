import fs from 'fs';
import path from 'path';

function parseInputData(inputData) {
  const lines = inputData.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 10) throw new Error('Input file must contain at least 10 parameters');

  const parseNum = (v, name, isInt = false) => {
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
    noch: parseNum(lines[9], 'noch', true),
  };

  if (parameters.scale1 <= 0 || parameters.scale2 <= 0) throw new Error('Scale values must be positive');
  if (parameters.xincr <= 0 || parameters.yincr <= 0) throw new Error('Increment values must be positive');
  if (parameters.noch <= 0 || !Number.isInteger(parameters.noch)) throw new Error('Number of chainages must be a positive integer');
  if (parameters.right <= parameters.left) throw new Error('Right chainage must be greater than left chainage');
  if (parameters.toprl <= parameters.datum) throw new Error('Top level must be greater than datum level');

  const crossSections = [];
  for (let i = 10; i + 1 < lines.length; i += 2) {
    const chainage = parseNum(lines[i], 'chainage');
    const level = parseNum(lines[i + 1], 'level');
    crossSections.push({ chainage, level });
  }
  crossSections.sort((a, b) => a.chainage - b.chainage);

  return { parameters, crossSections };
}

function generateDrawingCommands(parameters) {
  const commands = [];
  commands.push('NEW');
  commands.push('UNITS 4 2 1 4 0 N');
  commands.push('LIMITS 0,0 420,297');
  commands.push('LAYER N AXIS C 2 AXIS');
  commands.push('LAYER N BRIDGE C 1 BRIDGE');
  commands.push('LAYER N DIMENSIONS C 3 DIMENSIONS');

  const leftMM = parameters.left * 1000;
  const rightMM = parameters.right * 1000;
  const datumMM = parameters.datum * 10;
  commands.push(`LINE ${leftMM},${datumMM} ${rightMM},${datumMM}`);
  commands.push(`LINE ${leftMM},${datumMM} ${leftMM},${datumMM + (parameters.toprl - parameters.datum) * 10}`);

  // Simple deck line in meters for readability
  const deckLevel = parameters.toprl - 1.5;
  commands.push(`; BRIDGE DECK`);
  commands.push(`LINE ${parameters.left},${deckLevel} ${parameters.right},${deckLevel}`);

  // Simple grid (coarse)
  commands.push(`; GRID`);
  for (let x = Math.ceil(parameters.left / parameters.xincr) * parameters.xincr; x <= parameters.right; x += parameters.xincr) {
    commands.push(`LINE ${x},${parameters.datum - 2} ${x},${parameters.toprl + 1}`);
  }

  return commands;
}

function appendCrossSection(commands, parameters, crossSectionData) {
  if (!Array.isArray(crossSectionData) || crossSectionData.length < 2) return;
  commands.push('; CROSS-SECTION PROFILE');
  for (let i = 1; i < crossSectionData.length; i++) {
    const p0 = crossSectionData[i - 1];
    const p1 = crossSectionData[i];
    commands.push(`LINE ${p0.chainage},${p0.level} ${p1.chainage},${p1.level}`);
  }
}

async function main() {
  const inputPath = path.resolve(process.cwd(), 'windsurf_sample_bridge_input.txt');
  const outPath = path.resolve(process.cwd(), 'sample-bridge.dwg');
  const data = await fs.promises.readFile(inputPath, 'utf-8');
  const { parameters, crossSections } = parseInputData(data);
  const commands = generateDrawingCommands(parameters);
  appendCrossSection(commands, parameters, crossSections);
  await fs.promises.writeFile(outPath, commands.join('\n'));
  console.log(`Wrote DWG text commands to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

