import { motion } from 'framer-motion'
import type { VisualIllusionType } from '../store/gameStore'

interface VisualParams {
  sizeA: number
  sizeB: number
  illusionStrength: number
  seed: number
  illusionFavors: 'A' | 'B' // Which side the illusion makes LOOK bigger (the deception target)
}

interface OpticalIllusionQuizProps {
  illusionType: VisualIllusionType
  params: VisualParams
  mode: 'play' | 'reveal'
  correctChoice?: 'A' | 'B' | 'same'
  selectedChoice?: 'A' | 'B' | 'same' | null
  explanation?: string
}

const LABEL_A = '#3b82f6'
const LABEL_B = '#f97316'
const MEASURE = '#22c55e'
const LINE_COLOR = '#e2e8f0'     // bright white-ish for main elements
const CONTEXT_COLOR = '#7c3aed'  // purple for illusion context elements
const ACCENT = '#f472b6'         // pink for filled shapes

// ──────────────────────────────────────────
// Müller-Lyer: 矢羽の向きで線の長さが変わる
// favors側 → 外向き矢羽 <—> (looks LONGER)
// 反対側   → 内向き矢羽 >—< (looks SHORTER)
// ──────────────────────────────────────────
function renderMullerLyer(p: VisualParams, mode: 'play' | 'reveal') {
  const cx = 300, yA = 145, yB = 275
  const s = p.illusionStrength
  const finLen = 30 + s * 30       // 30-60px fins
  const finAngle = 25 + s * 20     // 25-45 degree angle

  const rad = (finAngle * Math.PI) / 180
  const halfA = p.sizeA / 2, halfB = p.sizeB / 2

  // Which side gets the "looks longer" treatment (outward fins)?
  const aOutward = p.illusionFavors === 'A' // A gets outward = looks longer
  const bOutward = p.illusionFavors === 'B'

  function fins(x: number, y: number, isLeft: boolean, outward: boolean) {
    const dir = isLeft ? -1 : 1
    if (outward) {
      // <—> fins: makes line look LONGER
      return (
        <>
          <line x1={x} y1={y} x2={x + dir * finLen * Math.cos(rad)} y2={y - finLen * Math.sin(rad)} stroke={LINE_COLOR} strokeWidth={3} />
          <line x1={x} y1={y} x2={x + dir * finLen * Math.cos(rad)} y2={y + finLen * Math.sin(rad)} stroke={LINE_COLOR} strokeWidth={3} />
        </>
      )
    } else {
      // >—< fins: makes line look SHORTER
      return (
        <>
          <line x1={x} y1={y} x2={x - dir * finLen * Math.cos(rad)} y2={y - finLen * Math.sin(rad)} stroke={LINE_COLOR} strokeWidth={3} />
          <line x1={x} y1={y} x2={x - dir * finLen * Math.cos(rad)} y2={y + finLen * Math.sin(rad)} stroke={LINE_COLOR} strokeWidth={3} />
        </>
      )
    }
  }

  return (
    <g>
      {/* Line A */}
      <line x1={cx - halfA} y1={yA} x2={cx + halfA} y2={yA} stroke={LINE_COLOR} strokeWidth={4} strokeLinecap="round" />
      {fins(cx - halfA, yA, true, aOutward)}
      {fins(cx + halfA, yA, false, aOutward)}

      {/* Line B */}
      <line x1={cx - halfB} y1={yB} x2={cx + halfB} y2={yB} stroke={LINE_COLOR} strokeWidth={4} strokeLinecap="round" />
      {fins(cx - halfB, yB, true, bOutward)}
      {fins(cx + halfB, yB, false, bOutward)}

      {labels(cx - halfA - 35, yA, cx - halfB - 35, yB)}

      {mode === 'reveal' && (
        <g>
          <line x1={cx - halfA} y1={yA + 25} x2={cx + halfA} y2={yA + 25} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          {measureEnd(cx - halfA, yA + 18, yA + 32)}
          {measureEnd(cx + halfA, yA + 18, yA + 32)}
          <text x={cx} y={yA + 45} textAnchor="middle" fill={MEASURE} fontSize={15} fontWeight="bold">{p.sizeA}</text>
          <line x1={cx - halfB} y1={yB + 25} x2={cx + halfB} y2={yB + 25} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          {measureEnd(cx - halfB, yB + 18, yB + 32)}
          {measureEnd(cx + halfB, yB + 18, yB + 32)}
          <text x={cx} y={yB + 45} textAnchor="middle" fill={MEASURE} fontSize={15} fontWeight="bold">{p.sizeB}</text>
        </g>
      )}
    </g>
  )
}

// ──────────────────────────────────────────
// Ebbinghaus: 周囲の円で中心が違うサイズに見える
// favors側 → 小さい周囲円（中心が大きく見える）
// 反対側   → 大きい周囲円（中心が小さく見える）
// ──────────────────────────────────────────
function renderEbbinghaus(p: VisualParams, mode: 'play' | 'reveal') {
  const cxA = 170, cxB = 430, cy = 200
  const s = p.illusionStrength
  const rA = p.sizeA * 0.25
  const rB = p.sizeB * 0.25

  // Small surrounding = center looks bigger; Large = center looks smaller
  const aFavored = p.illusionFavors === 'A'

  const bigR = 32 + s * 22    // large surrounding circles
  const smallR = 7 + s * 3    // small surrounding circles
  const bigCount = 5
  const smallCount = 10

  function surrounds(centerX: number, centerR: number, favored: boolean) {
    const surrR = favored ? smallR : bigR
    const count = favored ? smallCount : bigCount
    const orbit = centerR + surrR + 8 + (favored ? s * 4 : s * 12)
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2
      return (
        <circle
          key={i}
          cx={centerX + orbit * Math.cos(angle)}
          cy={cy + orbit * Math.sin(angle)}
          r={surrR}
          fill={favored ? CONTEXT_COLOR : `${CONTEXT_COLOR}cc`}
          stroke={favored ? '#a78bfa' : '#6d28d9'}
          strokeWidth={1.5}
        />
      )
    })
  }

  return (
    <g>
      {surrounds(cxA, rA, aFavored)}
      <circle cx={cxA} cy={cy} r={rA} fill={ACCENT} />
      {surrounds(cxB, rB, !aFavored)}
      <circle cx={cxB} cy={cy} r={rB} fill={ACCENT} />

      {labels(cxA, cy - rA - (aFavored ? 35 : 60), cxB, cy - rB - (aFavored ? 60 : 35))}

      {mode === 'reveal' && (
        <g>
          <line x1={cxA - rA} y1={cy + rA + 20} x2={cxA + rA} y2={cy + rA + 20} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          <text x={cxA} y={cy + rA + 38} textAnchor="middle" fill={MEASURE} fontSize={14} fontWeight="bold">{p.sizeA}</text>
          <line x1={cxB - rB} y1={cy + rB + 20} x2={cxB + rB} y2={cy + rB + 20} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          <text x={cxB} y={cy + rB + 38} textAnchor="middle" fill={MEASURE} fontSize={14} fontWeight="bold">{p.sizeB}</text>
        </g>
      )}
    </g>
  )
}

// ──────────────────────────────────────────
// Ponzo: 収束する線で奥の線が大きく見える
// favors側 → 上（奥）に配置（大きく見える）
// 反対側   → 下（手前）に配置（小さく見える）
// ──────────────────────────────────────────
function renderPonzo(p: VisualParams, mode: 'play' | 'reveal') {
  const cx = 300
  const s = p.illusionStrength
  const topSpread = 30 + (1 - s) * 50
  const bottomSpread = 160 + s * 60
  const yTop = 40, yBottom = 380

  // Upper line looks longer (Ponzo effect). favors → upper
  const yUpper = 110 + (1 - s) * 20
  const yLower = 300 - (1 - s) * 10

  const aIsUpper = p.illusionFavors === 'A'
  const yA = aIsUpper ? yUpper : yLower
  const yBPos = aIsUpper ? yLower : yUpper
  const halfA = p.sizeA / 2, halfB = p.sizeB / 2

  // Railroad cross-ties for stronger depth illusion
  const ties = [0.08, 0.22, 0.36, 0.50, 0.64, 0.78, 0.92]

  return (
    <g>
      {/* Converging lines */}
      <line x1={cx - bottomSpread} y1={yBottom} x2={cx - topSpread} y2={yTop} stroke="#4b5563" strokeWidth={3.5} />
      <line x1={cx + bottomSpread} y1={yBottom} x2={cx + topSpread} y2={yTop} stroke="#4b5563" strokeWidth={3.5} />
      {/* Cross-ties */}
      {ties.map((t, i) => {
        const y = yTop + t * (yBottom - yTop)
        const spread = topSpread + t * (bottomSpread - topSpread)
        return <line key={i} x1={cx - spread} y1={y} x2={cx + spread} y2={y} stroke="#374151" strokeWidth={2} />
      })}
      {/* Center vanishing line */}
      <line x1={cx} y1={yBottom} x2={cx} y2={yTop} stroke="#374151" strokeWidth={1} strokeDasharray="4 6" />

      {/* Target lines */}
      <line x1={cx - halfA} y1={yA} x2={cx + halfA} y2={yA} stroke={ACCENT} strokeWidth={5} strokeLinecap="round" />
      <line x1={cx - halfB} y1={yBPos} x2={cx + halfB} y2={yBPos} stroke={ACCENT} strokeWidth={5} strokeLinecap="round" />

      {labels(cx - halfA - 30, yA, cx - halfB - 30, yBPos)}

      {mode === 'reveal' && (
        <g>
          <line x1={cx - halfA} y1={yA + 18} x2={cx + halfA} y2={yA + 18} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          <text x={cx} y={yA + 36} textAnchor="middle" fill={MEASURE} fontSize={14} fontWeight="bold">{p.sizeA}</text>
          <line x1={cx - halfB} y1={yBPos + 18} x2={cx + halfB} y2={yBPos + 18} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          <text x={cx} y={yBPos + 36} textAnchor="middle" fill={MEASURE} fontSize={14} fontWeight="bold">{p.sizeB}</text>
        </g>
      )}
    </g>
  )
}

// ──────────────────────────────────────────
// Jastrow: 2つの扇形を並べると下が大きく見える
// favors側 → 下に配置（大きく見える）
// ──────────────────────────────────────────
function renderJastrow(p: VisualParams, mode: 'play' | 'reveal') {
  const cx = 300
  const s = p.illusionStrength
  const widthA = p.sizeA * 1.0
  const widthB = p.sizeB * 1.0
  const arcDepth = 35 + s * 35     // how much the arc curves
  const thickness = 45 + s * 20

  // Lower shape looks bigger → favors side goes to bottom
  const aIsBottom = p.illusionFavors === 'A'
  const yTop = 130, yBot = yTop + thickness + 8 + s * 15 // gap tightens with strength

  const makeArc = (w: number, y: number, color: string) => {
    const x1 = cx - w / 2, x2 = cx + w / 2
    // Outer arc (bottom edge)
    const outerCpY = y + arcDepth
    // Inner arc (top edge)
    const innerCpY = y + arcDepth - thickness
    return (
      <path
        d={`M ${x1} ${y} Q ${cx} ${outerCpY} ${x2} ${y} L ${x2} ${y - thickness * 0.2} Q ${cx} ${innerCpY} ${x1} ${y - thickness * 0.2} Z`}
        fill={color}
        stroke={color === '#a78bfa' ? '#c4b5fd' : '#818cf8'}
        strokeWidth={2}
      />
    )
  }

  const topW = aIsBottom ? widthB : widthA
  const botW = aIsBottom ? widthA : widthB

  return (
    <g>
      {makeArc(topW, yTop, '#a78bfa')}
      {makeArc(botW, yBot, '#818cf8')}

      {/* Top shape label */}
      <circle cx={cx + topW / 2 + 25} cy={yTop - thickness * 0.1} r={14} fill={aIsBottom ? LABEL_B : LABEL_A} />
      <text x={cx + topW / 2 + 25} y={yTop - thickness * 0.1 + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">{aIsBottom ? 'B' : 'A'}</text>
      {/* Bottom shape label */}
      <circle cx={cx + botW / 2 + 25} cy={yBot - thickness * 0.1} r={14} fill={aIsBottom ? LABEL_A : LABEL_B} />
      <text x={cx + botW / 2 + 25} y={yBot - thickness * 0.1 + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">{aIsBottom ? 'A' : 'B'}</text>

      {mode === 'reveal' && (
        <g>
          <line x1={cx - topW / 2} y1={yTop + arcDepth + 10} x2={cx + topW / 2} y2={yTop + arcDepth + 10} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          <text x={cx} y={yTop + arcDepth + 28} textAnchor="middle" fill={MEASURE} fontSize={14} fontWeight="bold">{aIsBottom ? p.sizeB : p.sizeA}</text>
          <line x1={cx - botW / 2} y1={yBot + arcDepth + 10} x2={cx + botW / 2} y2={yBot + arcDepth + 10} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          <text x={cx} y={yBot + arcDepth + 28} textAnchor="middle" fill={MEASURE} fontSize={14} fontWeight="bold">{aIsBottom ? p.sizeA : p.sizeB}</text>
        </g>
      )}
    </g>
  )
}

// ──────────────────────────────────────────
// Vertical-Horizontal: 垂直線が水平線より長く見える
// favors側 → 垂直に配置（長く見える）
// 反対側   → 水平に配置（短く見える）
// ──────────────────────────────────────────
function renderVerticalHorizontal(p: VisualParams, mode: 'play' | 'reveal') {
  const cx = 300, cy = 210
  const s = p.illusionStrength
  const aIsVertical = p.illusionFavors === 'A'
  const lenA = p.sizeA, lenB = p.sizeB

  // Draw an inverted-T where vertical is one side and horizontal is another
  const vLen = aIsVertical ? lenA : lenB
  const hLen = aIsVertical ? lenB : lenA

  // Use illusionStrength to shift the T-junction off-center (makes horizontal look shorter)
  const junctionOffset = s * 20  // shift horizontal line off-center up to 20px
  const hCy = cy + junctionOffset  // horizontal goes lower

  // Vertical frame lines that emphasize height (stronger = tighter frame)
  const frameW = 40 + (1 - s) * 40  // 40-80px from center
  const frameTop = cy - vLen - 15
  const frameBot = hCy + 10

  return (
    <g>
      {/* Subtle vertical frame lines — makes vertical direction feel longer */}
      <line x1={cx - frameW} y1={frameTop} x2={cx - frameW} y2={frameBot} stroke="#374151" strokeWidth={1.5} />
      <line x1={cx + frameW} y1={frameTop} x2={cx + frameW} y2={frameBot} stroke="#374151" strokeWidth={1.5} />
      {/* Horizontal tick marks on the horizontal line — visually break it up */}
      {[0.25, 0.5, 0.75].map((t, i) => (
        <line key={i} x1={cx - hLen / 2 + hLen * t} y1={hCy - 4} x2={cx - hLen / 2 + hLen * t} y2={hCy + 4} stroke="#4b5563" strokeWidth={1.5} />
      ))}

      {/* Horizontal line */}
      <line x1={cx - hLen / 2} y1={hCy} x2={cx + hLen / 2} y2={hCy} stroke={LINE_COLOR} strokeWidth={4.5} strokeLinecap="round" />
      {/* Vertical line (from junction upward) */}
      <line x1={cx} y1={hCy} x2={cx} y2={hCy - vLen} stroke={LINE_COLOR} strokeWidth={4.5} strokeLinecap="round" />

      {/* Labels */}
      <circle cx={cx + 25} cy={hCy - vLen / 2} r={14} fill={aIsVertical ? LABEL_A : LABEL_B} />
      <text x={cx + 25} y={hCy - vLen / 2 + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">{aIsVertical ? 'A' : 'B'}</text>
      <circle cx={cx + hLen / 2 + 25} cy={hCy} r={14} fill={aIsVertical ? LABEL_B : LABEL_A} />
      <text x={cx + hLen / 2 + 25} y={hCy + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">{aIsVertical ? 'B' : 'A'}</text>

      {/* Sub-labels */}
      <text x={cx - 15} y={hCy - vLen - 6} textAnchor="middle" fill="#9ca3af" fontSize={11}>縦線</text>
      <text x={cx + hLen / 2} y={hCy + 25} textAnchor="end" fill="#9ca3af" fontSize={11}>横線</text>

      {mode === 'reveal' && (
        <g>
          {/* Vertical measurement */}
          <line x1={cx - 25} y1={hCy} x2={cx - 25} y2={hCy - vLen} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          {measureEnd(cx - 25, hCy - 7, hCy + 7)}
          {measureEnd(cx - 25, hCy - vLen - 7, hCy - vLen + 7)}
          <text x={cx - 42} y={hCy - vLen / 2 + 4} textAnchor="middle" fill={MEASURE} fontSize={13} fontWeight="bold">{aIsVertical ? p.sizeA : p.sizeB}</text>
          {/* Horizontal measurement */}
          <line x1={cx - hLen / 2} y1={hCy + 22} x2={cx + hLen / 2} y2={hCy + 22} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          {measureEnd(cx - hLen / 2, hCy + 15, hCy + 29)}
          {measureEnd(cx + hLen / 2, hCy + 15, hCy + 29)}
          <text x={cx} y={hCy + 42} textAnchor="middle" fill={MEASURE} fontSize={13} fontWeight="bold">{aIsVertical ? p.sizeB : p.sizeA}</text>
        </g>
      )}
    </g>
  )
}

// ──────────────────────────────────────────
// Delboeuf: タイトな輪が内円を大きく見せる
// favors側 → タイトな外輪（大きく見える）
// 反対側   → 広い外輪（小さく見える）
// ──────────────────────────────────────────
function renderDelboeuf(p: VisualParams, mode: 'play' | 'reveal') {
  const cxA = 170, cxB = 430, cy = 200
  const s = p.illusionStrength
  const rA = p.sizeA * 0.25
  const rB = p.sizeB * 0.25

  const aFavored = p.illusionFavors === 'A'
  // Tight ring = looks bigger; Wide ring = looks smaller
  const tightGap = 5 + (1 - s) * 8   // 5-13px gap
  const wideGap = 30 + s * 35        // 30-65px gap

  const ringA = rA + (aFavored ? tightGap : wideGap)
  const ringB = rB + (aFavored ? wideGap : tightGap)

  return (
    <g>
      {/* Ring A */}
      <circle cx={cxA} cy={cy} r={ringA} fill="none" stroke={CONTEXT_COLOR} strokeWidth={3} />
      {/* Inner A */}
      <circle cx={cxA} cy={cy} r={rA} fill={ACCENT} />

      {/* Ring B */}
      <circle cx={cxB} cy={cy} r={ringB} fill="none" stroke={CONTEXT_COLOR} strokeWidth={3} />
      {/* Inner B */}
      <circle cx={cxB} cy={cy} r={rB} fill={ACCENT} />

      {/* Labels above rings */}
      <circle cx={cxA} cy={cy - Math.max(ringA, ringB) - 22} r={14} fill={LABEL_A} />
      <text x={cxA} y={cy - Math.max(ringA, ringB) - 17} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">A</text>
      <circle cx={cxB} cy={cy - Math.max(ringA, ringB) - 22} r={14} fill={LABEL_B} />
      <text x={cxB} y={cy - Math.max(ringA, ringB) - 17} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">B</text>

      {mode === 'reveal' && (
        <g>
          {/* Diameter lines through center circles */}
          <line x1={cxA - rA} y1={cy + ringA + 15} x2={cxA + rA} y2={cy + ringA + 15} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          {measureEnd(cxA - rA, cy + ringA + 8, cy + ringA + 22)}
          {measureEnd(cxA + rA, cy + ringA + 8, cy + ringA + 22)}
          <text x={cxA} y={cy + ringA + 34} textAnchor="middle" fill={MEASURE} fontSize={13} fontWeight="bold">{p.sizeA}</text>
          <line x1={cxB - rB} y1={cy + ringB + 15} x2={cxB + rB} y2={cy + ringB + 15} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          {measureEnd(cxB - rB, cy + ringB + 8, cy + ringB + 22)}
          {measureEnd(cxB + rB, cy + ringB + 8, cy + ringB + 22)}
          <text x={cxB} y={cy + ringB + 34} textAnchor="middle" fill={MEASURE} fontSize={13} fontWeight="bold">{p.sizeB}</text>
        </g>
      )}
    </g>
  )
}

// ──────────────────────────────────────────
// Sander: 大きい平行四辺形の対角線は短く見える
// favors側 → 小さい平行四辺形内（長く見える）
// 反対側   → 大きい平行四辺形内（短く見える）
// ──────────────────────────────────────────
function renderSander(p: VisualParams, mode: 'play' | 'reveal') {
  const s = p.illusionStrength
  const h = 90 + s * 20      // parallelogram height
  const skew = 50 + s * 30   // horizontal skew

  const aFavored = p.illusionFavors === 'A'
  // Favored = small parallelogram (diagonal looks longer)
  // Not favored = large parallelogram (diagonal looks shorter)
  const bigExtra = 50 + s * 40  // extra width for large parallelogram
  const smallExtra = 5

  const wA = p.sizeA + (aFavored ? smallExtra : bigExtra)
  const wB = p.sizeB + (aFavored ? bigExtra : smallExtra)

  const yCenter = 200
  // Position side by side
  const gapX = 20
  const totalW = wA + skew + gapX + wB + skew
  const startA = 300 - totalW / 2
  const startB = startA + wA + skew + gapX

  function parallelogram(x: number, w: number, diagLen: number, label: string, color: string) {
    const yT = yCenter - h / 2, yBt = yCenter + h / 2
    return (
      <g>
        <polygon
          points={`${x},${yBt} ${x + skew},${yT} ${x + skew + w},${yT} ${x + w},${yBt}`}
          fill="none" stroke={CONTEXT_COLOR} strokeWidth={2.5}
        />
        {/* Diagonal */}
        <line x1={x} y1={yBt} x2={x + skew + diagLen} y2={yT} stroke="#fbbf24" strokeWidth={4} strokeLinecap="round" />
        {/* Label */}
        <circle cx={x + skew / 2 + diagLen / 2} cy={yCenter} r={14} fill={color} />
        <text x={x + skew / 2 + diagLen / 2} y={yCenter + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">{label}</text>
      </g>
    )
  }

  return (
    <g>
      {parallelogram(startA, wA, p.sizeA, 'A', LABEL_A)}
      {parallelogram(startB, wB, p.sizeB, 'B', LABEL_B)}

      {mode === 'reveal' && (
        <g>
          {/* Show actual diagonal lengths */}
          <text x={startA + skew / 2 + p.sizeA / 2} y={yCenter + h / 2 + 25} textAnchor="middle" fill={MEASURE} fontSize={13} fontWeight="bold">
            A: {Math.round(Math.sqrt((skew + p.sizeA) ** 2 + h ** 2))}
          </text>
          <text x={startB + skew / 2 + p.sizeB / 2} y={yCenter + h / 2 + 25} textAnchor="middle" fill={MEASURE} fontSize={13} fontWeight="bold">
            B: {Math.round(Math.sqrt((skew + p.sizeB) ** 2 + h ** 2))}
          </text>
        </g>
      )}
    </g>
  )
}

// ──────────────────────────────────────────
// Baldwin: 大きな正方形で挟まれた線は短く見える
// favors側 → 小さな正方形（長く見える）
// 反対側   → 大きな正方形（短く見える）
// ──────────────────────────────────────────
function renderBaldwin(p: VisualParams, mode: 'play' | 'reveal') {
  const cx = 300, yA = 145, yB = 275
  const s = p.illusionStrength
  const halfA = p.sizeA / 2, halfB = p.sizeB / 2

  const aFavored = p.illusionFavors === 'A'
  const bigSq = 35 + s * 25   // big square half-size
  const smallSq = 5 + s * 3   // small square half-size

  const sqA = aFavored ? smallSq : bigSq
  const sqB = aFavored ? bigSq : smallSq

  return (
    <g>
      {/* Line A with squares */}
      <rect x={cx - halfA - sqA * 2} y={yA - sqA} width={sqA * 2} height={sqA * 2} fill="none" stroke={CONTEXT_COLOR} strokeWidth={2.5} rx={2} />
      <line x1={cx - halfA} y1={yA} x2={cx + halfA} y2={yA} stroke={LINE_COLOR} strokeWidth={4} strokeLinecap="round" />
      <rect x={cx + halfA} y={yA - sqA} width={sqA * 2} height={sqA * 2} fill="none" stroke={CONTEXT_COLOR} strokeWidth={2.5} rx={2} />

      {/* Line B with squares */}
      <rect x={cx - halfB - sqB * 2} y={yB - sqB} width={sqB * 2} height={sqB * 2} fill="none" stroke={CONTEXT_COLOR} strokeWidth={2.5} rx={2} />
      <line x1={cx - halfB} y1={yB} x2={cx + halfB} y2={yB} stroke={LINE_COLOR} strokeWidth={4} strokeLinecap="round" />
      <rect x={cx + halfB} y={yB - sqB} width={sqB * 2} height={sqB * 2} fill="none" stroke={CONTEXT_COLOR} strokeWidth={2.5} rx={2} />

      {/* Labels */}
      <circle cx={cx - halfA - sqA * 2 - 22} cy={yA} r={14} fill={LABEL_A} />
      <text x={cx - halfA - sqA * 2 - 22} y={yA + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">A</text>
      <circle cx={cx - halfB - sqB * 2 - 22} cy={yB} r={14} fill={LABEL_B} />
      <text x={cx - halfB - sqB * 2 - 22} y={yB + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">B</text>

      {mode === 'reveal' && (
        <g>
          <line x1={cx - halfA} y1={yA + sqA + 8} x2={cx + halfA} y2={yA + sqA + 8} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          {measureEnd(cx - halfA, yA + sqA + 1, yA + sqA + 15)}
          {measureEnd(cx + halfA, yA + sqA + 1, yA + sqA + 15)}
          <text x={cx} y={yA + sqA + 26} textAnchor="middle" fill={MEASURE} fontSize={13} fontWeight="bold">{p.sizeA}</text>
          <line x1={cx - halfB} y1={yB + sqB + 8} x2={cx + halfB} y2={yB + sqB + 8} stroke={MEASURE} strokeWidth={2} strokeDasharray="6 3" />
          {measureEnd(cx - halfB, yB + sqB + 1, yB + sqB + 15)}
          {measureEnd(cx + halfB, yB + sqB + 1, yB + sqB + 15)}
          <text x={cx} y={yB + sqB + 26} textAnchor="middle" fill={MEASURE} fontSize={13} fontWeight="bold">{p.sizeB}</text>
        </g>
      )}
    </g>
  )
}

// ──────────────────────────────────────────
// Shared SVG helpers
// ──────────────────────────────────────────
function labels(xA: number, yA: number, xB: number, yB: number) {
  return (
    <g>
      <circle cx={xA} cy={yA} r={14} fill={LABEL_A} />
      <text x={xA} y={yA + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">A</text>
      <circle cx={xB} cy={yB} r={14} fill={LABEL_B} />
      <text x={xB} y={yB + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">B</text>
    </g>
  )
}

function measureEnd(x: number, y1: number, y2: number) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke={MEASURE} strokeWidth={2} />
}

// ──────────────────────────────────────────
// Renderer dispatch
// ──────────────────────────────────────────
const RENDERERS: Record<VisualIllusionType, (p: VisualParams, mode: 'play' | 'reveal') => React.ReactNode> = {
  mullerLyer: renderMullerLyer,
  ebbinghaus: renderEbbinghaus,
  ponzo: renderPonzo,
  jastrow: renderJastrow,
  verticalHorizontal: renderVerticalHorizontal,
  delboeuf: renderDelboeuf,
  sander: renderSander,
  baldwin: renderBaldwin,
}

export default function OpticalIllusionQuiz({
  illusionType,
  params,
  mode,
  correctChoice,
  selectedChoice,
  explanation,
}: OpticalIllusionQuizProps) {
  const renderer = RENDERERS[illusionType]

  return (
    <div className="relative">
      <svg
        viewBox="0 0 600 400"
        className="w-full rounded-2xl border border-gray-700/50"
        style={{ background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%)' }}
      >
        {renderer(params, mode)}
      </svg>

      {/* Reveal overlay */}
      {mode === 'reveal' && correctChoice && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {selectedChoice === correctChoice ? (
              <span className="text-green-400 text-lg font-bold flex items-center gap-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                正解！錯覚を見破った！
              </span>
            ) : (
              <span className="text-red-400 text-lg font-bold flex items-center gap-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
                錯覚に騙された！
              </span>
            )}
          </div>

          <div className="text-center text-sm text-gray-300 mb-2">
            正解:
            {correctChoice === 'same' ? (
              <span className="text-purple-400 font-bold ml-1">同じ！（どちらも {params.sizeA}）</span>
            ) : correctChoice === 'A' ? (
              <span className="text-blue-400 font-bold ml-1">A の方が大きい（A: {params.sizeA} vs B: {params.sizeB}）</span>
            ) : (
              <span className="text-orange-400 font-bold ml-1">B の方が大きい（B: {params.sizeB} vs A: {params.sizeA}）</span>
            )}
          </div>

          {explanation && (
            <div className="bg-gray-800/80 rounded-xl p-3 text-sm text-gray-300 border border-gray-700">
              <p className="text-xs text-purple-400 font-bold mb-1">💡 なぜ騙される？</p>
              {explanation}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
