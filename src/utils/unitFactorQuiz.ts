export interface UnitFactorQuestion {
  prompt: string
  subject: string
  choices: string[]
  answer: string
  explain: string
}

interface Template {
  prompt: (v: number) => string
  subject: (v: number) => string
  values: number[]
  solve: (v: number) => number
  uf: (v: number) => string
  fmt: (n: number) => string
  wrongs: ((ans: number, v: number) => number)[]
}

function fmtDec(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const s = n.toPrecision(4)
  return parseFloat(s).toString()
}

function fmtSci(n: number): string {
  if (n === 0) return '0'
  const exp = Math.floor(Math.log10(Math.abs(n)))
  const coeff = n / 10 ** exp
  return `${fmtDec(coeff)}×10^${exp}`
}

const SUBSTANCES: { name: string; formula: string; M: number }[] = [
  { name: '水', formula: 'H₂O', M: 18 },
  { name: '二氧化碳', formula: 'CO₂', M: 44 },
  { name: '氧氣', formula: 'O₂', M: 32 },
  { name: '氯化鈉', formula: 'NaCl', M: 58.5 },
  { name: '葡萄糖', formula: 'C₆H₁₂O₆', M: 180 },
  { name: '硫酸', formula: 'H₂SO₄', M: 98 },
]

const TEMPLATES: Template[] = [
  // ── 壓力 ──
  {
    prompt: (v) => `將 ${v} atm 換成 mmHg`,
    subject: (v) => `${v} atm`,
    values: [0.5, 1.5, 2.0, 2.5, 3.0, 0.25],
    solve: (v) => v * 760,
    uf: (v) => `${v} atm × (760 mmHg / 1 atm)`,
    fmt: fmtDec,
    wrongs: [(a) => a / 10, (_a, v) => v / 760, (a) => a * 2],
  },
  {
    prompt: (v) => `將 ${v} mmHg 換成 atm`,
    subject: (v) => `${v} mmHg`,
    values: [380, 570, 760, 1520, 190],
    solve: (v) => v / 760,
    uf: (v) => `${v} mmHg × (1 atm / 760 mmHg)`,
    fmt: fmtDec,
    wrongs: [(_a, v) => v * 760, (a) => a * 10, (a) => a / 2],
  },
  {
    prompt: (v) => `將 ${v} atm 換成 kPa`,
    subject: (v) => `${v} atm`,
    values: [1.0, 2.0, 0.5, 3.0, 1.5],
    solve: (v) => v * 101.325,
    uf: (v) => `${v} atm × (101.325 kPa / 1 atm)`,
    fmt: fmtDec,
    wrongs: [(a) => a * 10, (_a, v) => v * 760, (a) => a / 2],
  },
  // ── 溫度 ──
  {
    prompt: (v) => `將 ${v}°C 換成 K`,
    subject: (v) => `${v}°C`,
    values: [0, 25, 27, 37, 100, -40],
    solve: (v) => v + 273,
    uf: (v) => `${v} + 273`,
    fmt: fmtDec,
    wrongs: [(_a, v) => v - 273, (_a, v) => v * 273, (_a, v) => v + 373],
  },
  {
    prompt: (v) => `將 ${v} K 換成 °C`,
    subject: (v) => `${v} K`,
    values: [273, 300, 310, 373, 500, 233],
    solve: (v) => v - 273,
    uf: (v) => `${v} - 273`,
    fmt: fmtDec,
    wrongs: [(_a, v) => v + 273, (_a, v) => v * 2, (_a, v) => v - 373],
  },
  // ── 能量 ──
  {
    prompt: (v) => `將 ${v} cal 換成 J`,
    subject: (v) => `${v} cal`,
    values: [100, 250, 500, 1000, 50],
    solve: (v) => v * 4.184,
    uf: (v) => `${v} cal × (4.184 J / 1 cal)`,
    fmt: fmtDec,
    wrongs: [(_a, v) => v / 4.184, (a) => a * 10, (a) => a / 4.184],
  },
  {
    prompt: (v) => `將 ${v} kcal 換成 kJ`,
    subject: (v) => `${v} kcal`,
    values: [1.0, 1.5, 2.0, 2.5, 5.0, 10],
    solve: (v) => v * 4.184,
    uf: (v) => `${v} kcal × (4.184 kJ / 1 kcal)`,
    fmt: fmtDec,
    wrongs: [(_a, v) => v / 4.184, (a) => a / 10, (_a, v) => v * 1000],
  },
  // ── 體積 ──
  {
    prompt: (v) => `將 ${v} mL 換成 L`,
    subject: (v) => `${v} mL`,
    values: [250, 500, 820, 1500, 50, 100],
    solve: (v) => v / 1000,
    uf: (v) => `${v} mL × (1 L / 1000 mL)`,
    fmt: fmtDec,
    wrongs: [(_a, v) => v * 1000, (_a, v) => v / 100, (_a, v) => v / 10],
  },
  {
    prompt: (v) => `將 ${v} L 換成 mL`,
    subject: (v) => `${v} L`,
    values: [0.25, 0.5, 1.5, 2.0, 0.1],
    solve: (v) => v * 1000,
    uf: (v) => `${v} L × (1000 mL / 1 L)`,
    fmt: fmtDec,
    wrongs: [(_a, v) => v / 1000, (a) => a / 10, (a) => a * 10],
  },
  // ── 長度 ──
  {
    prompt: (v) => `將 ${v} Å 換成 pm`,
    subject: (v) => `${v} Å`,
    values: [1.2, 1.54, 2.0, 3.5, 0.97],
    solve: (v) => v * 100,
    uf: (v) => `${v} Å × (100 pm / 1 Å)`,
    fmt: fmtDec,
    wrongs: [(a) => a / 100, (a) => a * 10, (_a, v) => v / 100],
  },
  {
    prompt: (v) => `將 ${v} nm 換成 Å`,
    subject: (v) => `${v} nm`,
    values: [0.154, 0.5, 1.0, 2.0, 0.1],
    solve: (v) => v * 10,
    uf: (v) => `${v} nm × (10 Å / 1 nm)`,
    fmt: fmtDec,
    wrongs: [(_a, v) => v / 10, (a) => a * 100, (_a, v) => v * 100],
  },
  // ── STP 氣體 ──
  {
    prompt: (v) => `STP 下 ${v} L 氣體 = ? mol`,
    subject: (v) => `${v} L (STP)`,
    values: [11.2, 22.4, 5.6, 44.8, 2.24],
    solve: (v) => v / 22.4,
    uf: (v) => `${v} L × (1 mol / 22.4 L)`,
    fmt: fmtDec,
    wrongs: [(_a, v) => v * 22.4, (a) => a * 10, (a) => a / 10],
  },
  // ── 質量 ↔ 莫耳（隨機物質） ──
  // handled by makeSubstanceQuestion below
  // ── ppm ──
  {
    prompt: (v) => `水中 ${v} ppm 汙染物，取 2 L 水樣含多少 mg？`,
    subject: (v) => `${v} ppm × 2 L`,
    values: [1.5, 5, 10, 25, 50],
    solve: (v) => v * 2,
    uf: (v) => `${v} mg/L × (2 L) = ${v * 2} mg`,
    fmt: fmtDec,
    wrongs: [(_a, v) => v, (_a, v) => v / 2, (a) => a * 10],
  },
]

function makeSubstanceQuestion(rand: () => number): UnitFactorQuestion {
  const sub = SUBSTANCES[Math.floor(rand() * SUBSTANCES.length)]
  const gToMol = rand() > 0.5
  if (gToMol) {
    const multipliers = [0.5, 1, 2, 3, 5]
    const mult = multipliers[Math.floor(rand() * multipliers.length)]
    const grams = mult * sub.M
    const answer = mult
    const explain = `${grams} g × (1 mol / ${sub.M} g) = ${fmtDec(answer)} mol`
    const wrongs = [answer * sub.M, answer * 10, answer / 10].map(fmtDec)
    return buildQuestion(
      `將 ${grams} g ${sub.formula} 換成 mol（M = ${sub.M} g/mol）`,
      `${grams} g ${sub.formula}`,
      answer,
      fmtDec,
      wrongs,
      explain,
      rand,
    )
  }
  const mols = [0.25, 0.5, 1, 2, 3][Math.floor(rand() * 5)]
  const answer = mols * sub.M
  const explain = `${mols} mol × (${sub.M} g / 1 mol) = ${fmtDec(answer)} g`
  const wrongs = [answer / sub.M, answer * 10, answer / 10].map(fmtDec)
  return buildQuestion(
    `將 ${mols} mol ${sub.formula} 換成 g（M = ${sub.M} g/mol）`,
    `${mols} mol ${sub.formula}`,
    answer,
    fmtDec,
    wrongs,
    explain,
    rand,
  )
}

function buildQuestion(
  prompt: string,
  subject: string,
  answer: number,
  fmt: (n: number) => string,
  wrongStrs: string[],
  explain: string,
  rand: () => number,
): UnitFactorQuestion {
  const answerStr = fmt(answer)
  const uniq = [...new Set(wrongStrs)].filter((w) => w !== answerStr).slice(0, 3)
  while (uniq.length < 3) {
    const noise = answer * (0.3 + rand() * 3)
    const s = fmt(noise)
    if (s !== answerStr && !uniq.includes(s)) uniq.push(s)
  }
  const choices = [answerStr, ...uniq.slice(0, 3)]
  for (let k = choices.length - 1; k > 0; k--) {
    const j = Math.floor(rand() * (k + 1))
    ;[choices[k], choices[j]] = [choices[j], choices[k]]
  }
  return { prompt, subject, choices, answer: answerStr, explain }
}

export function makeQuestions(count: number): UnitFactorQuestion[] {
  let seed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const indices = Array.from({ length: TEMPLATES.length + 2 }, (_, k) => k)
  for (let k = indices.length - 1; k > 0; k--) {
    const j = Math.floor(rand() * (k + 1))
    ;[indices[k], indices[j]] = [indices[j], indices[k]]
  }

  const questions: UnitFactorQuestion[] = []
  for (const idx of indices.slice(0, count)) {
    if (idx >= TEMPLATES.length) {
      questions.push(makeSubstanceQuestion(rand))
      continue
    }
    const t = TEMPLATES[idx]
    const v = t.values[Math.floor(rand() * t.values.length)]
    const answer = t.solve(v)
    const wrongs = t.wrongs.map((fn) => t.fmt(fn(answer, v)))
    const explain = `${t.uf(v)} = ${t.fmt(answer)}`
    questions.push(buildQuestion(t.prompt(v), t.subject(v), answer, t.fmt, wrongs, explain, rand))
  }
  return questions
}

export function checkAnswer(q: UnitFactorQuestion, chosen: string): boolean {
  return chosen === q.answer
}
