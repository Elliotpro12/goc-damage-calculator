import React, { useState, useCallback, useRef, useEffect, useContext, useMemo } from "react";

/*
 * ══════════════════════════════════════════════════════════════════
 * DRAFT CHANGELOG — v2.3 (✅ PUBLICADO — Abril 2026)
 * ══════════════════════════════════════════════════════════════════
 *
 * [SESSION 2 — Fixes aplicados]
 *
 * LIMPIEZA DE TRADUCCIONES (T.es)
 *   · Eliminadas ~40 keys EN duplicadas en T.es que se sobreescribían
 *     (skillBurnBoat, skillTruthShield, buffsTitle, classes, etc.)
 *   · Corregido bug: skillDeityMarkClass mostraba "Oracle" en lugar de "Oráculo"
 *   · skillAngelicShieldClass y skillAngelicShieldActive corregidos a ES
 *
 * BOTÓN CALCULAR EN MÓVIL (go)
 *   · go() era un stub vacío () => {} — ahora navega a vista de resultados
 *   · Añadido resultsRef para hacer scroll suave al top de resultados tras calcular
 *   · Botón CALCULAR DAÑO en móvil ya funcional
 *
 * BADGE DE BUFFS ACTIVOS EN PESTAÑA
 *   · totalActiveBuffs calculado en App (buffs manuales + skills activas)
 *   · Pestaña ✦ BUFFS muestra contador: "✦ BUFFS (N)" cuando N > 0
 *   · Badge desaparece cuando no hay buffs activos
 *
 * COMPARTIR BUILD (URL-based)
 *   · Botón 📤 Compartir / Share en el header junto a Changelog y Créditos
 *   · Serializa todo el estado (atk, def, heavy, cargado, stacks, flags,
 *     buffs, olivia, skills activas, idioma) a base64 en el hash de la URL
 *   · Al copiar muestra feedback visual "✓ Copiado" / "✓ Copied" por 2.2s
 *   · Fallback a window.prompt si el clipboard no está disponible
 *   · Al cargar la app detecta #build= en el hash y restaura todo el estado
 *   · Hash limpiado de la URL tras la carga (history.replaceState)
 *   · Strings bilingues: shareBtn / shareCopied en T.es y T.en
 *
 * BUG FIX — PANEL OLIVIA
 *   · skill_flat_bonus no tenía label en oliviaLabels (ES ni EN) — campo aparecía vacío
 *   · Añadido: "Bonus Plano de Skill" (ES) / "Skill Flat Bonus" (EN) — es la parte fija de la skill (ej: ATK×1500% + 1300)
 *
 * BOTÓN CALCULAR DAÑO
 *   · Eliminado en PC — el cálculo en tiempo real hace el botón innecesario
 *   · En móvil se mantiene pero renombrado a "VER RESULTADOS ▼" / "SEE RESULTS ▼"
 *     para reflejar que es navegación, no cálculo
 *
 * HABILIDADES CONOCIDAS — PISTOLERO
 *   · Dron de la Paz / Drone of Peace — toggle ON/OFF, +5% bonoDano mientras activo
 *   · Torreta Cargadora / Charger Turret — toggle ON/OFF, +30% bonoDano ([Adrenalina])
 *   · Punto naranja ● añadido a Pistolero en el acordeón
 *   · Ambas habilidades incluidas en el contador de buffs activos y en el build share
 *
 * BUFFS DE ALIADOS EN OLIVIA (Fase 1)
 *   · Sección "BUFFS DE ALIADOS" en el panel de Olivia
 *   · Muestra solo las skills que pueden afectar aliados y están activas en BUFFS
 *   · Marca de Deidad — selector de stacks independiente (0 al máximo activo en BUFFS)
 *   · Dron de la Paz — toggle ON/OFF independiente, +5% bonoDano
 *   · Torreta Cargadora — toggle ON/OFF independiente, +30% bonoDano
 *   · Escudo Angelical — toggle ON/OFF, muestra daño ×0.50 en resultados de Olivia
 *   · Si ninguna skill de aliado está activa, sección muestra mensaje informativo
 *   · buffedOliviaStats calculado con useMemo, independiente del personaje principal
 *   · Estado incluido en build share (serialize + deserialize)
 *
 * TAB BAR EN MÓVIL
 *   · Las 6 pestañas se dividenen 2 filas de 3 en móvil (ATK/DEF/HEAVY arriba, CARGADO/BUFFS/PARTNERS abajo)
 *   · En PC se mantiene la fila única horizontal sin cambios
 *
 * EFECTO HEAVY ATK APLICADO AL DAÑO
 *   · Toggle "Aplicar efecto al daño" en el panel de Heavy ATK
 *   · Cuando activo, muestra bloque en resultados con daño × (1 + dmg_recibido/100)
 *   · Se aplica como multiplicador final sobre todo el daño calculado
 *   · Muestra daño base+crít, con debuff y heavy con el efecto aplicado
 *   · Incluido en build share
 *
 * EFECTO HEAVY ATK EN OLIVIA
 *   · Toggle independiente en el panel de Olivia (usa las stats de la pestaña ⚡ HEAVY)
 *   · Muestra el multiplicador activo: ×(1 + dmg_recibido/100)
 *   · Bloque de resultados dorado al final con daño base, debuff y heavy con el efecto
 *
 * IDIOMA CHINO (ZH)
 *   · Añadido T.zh con traducción completa al chino simplificado
 *   · Botón 🇨🇳 ZH en el toggle de idioma del header y popup de Tenacidad
 *   · Terminología aproximada basada en ES/EN — pendiente de verificación por jugadores nativos
 *
 * FIX — FÓRMULA PROBABILIDAD DE GOLPE (HEAVY ATK)
 *   · Fórmula anterior incorrecta: activacion*hit_rate + (1-activacion)*evacion → podía superar 100%
 *   · Nueva fórmula: prob = clamp(0, activacion + (1-activacion) * max(0, hit_rate - evacion), 1)
 *   · Heavy siempre golpea (inevitable) → cuando activa cuenta como 100% de acierto
 *   · Ataques normales (cuando heavy no activa): hit efectivo = max(0, hit_rate - evacion)
 *   · Si hit_rate >= evacion los golpes normales siempre conectan → prob total = 100%
 *   · Si hit_rate = evacion los normales siempre fallan → prob = solo % activación heavy
 *   · Resultado siempre clampeado a [0%, 100%]
 *
 * FIX — BUFFS DE PORCENTAJE EN STATS PLANOS (ataque)
 *   · Bug: buff pct en ataque sumaba value/100 como decimal (ej: +10% sumaba 0.1 a 56400)
 *   · Fix: stats planos (no en PCT_FIELDS) ahora se multiplican: ataque × (1 + value/100)
 *   · Mismo fix aplicado a buffedDef para stats planos en el defensor
 *   · Indicador visual en cadena de cálculo base cuando hay buffs activos en ataque:
 *     muestra valor base ▲ +delta = valor buffado antes de calcular Ataque Efectivo
 *
 * PESTAÑA BUFFS / DEBUFFS
 * - Nueva pestaña ✦ BUFFS entre ATK Cargado y Partners
 * - Formulario para agregar buffs/debuffs manuales con nombre opcional
 * - Stats disponibles: ATK (plano), Bono Daño (%), Mult. Crítico (%), Red. Daño (%), Red. Crítico (%)
 * - Tipo forzado a % para stats que solo pueden ser porcentaje
 * - Panel derecho muestra buffs activos agrupados por stat con valor base, cambios y valor final
 * - Buffs y debuffs separados en secciones distintas (⬆/⬇)
 * - Botón ↺ Limpiar todo
 * - Botón CALCULAR CON BUFFS → redirige a pestaña ATK con resultados
 * - Buffs persistidos en localStorage
 *
 * HABILIDADES CONOCIDAS (pestaña BUFFS)
 * - Acordeón de 9 clases: Espadachín, Asesino, Arquero, Pistolero, Martillo,
 *   Mago, Oráculo, Combatiente, Segador
 * - Punto naranja ● indica clases con habilidades disponibles
 * - ORÁCULO:
 *   · Marca de Deidad — selector stacks 0-5, +2.5% bonoDano por stack, aplicado automáticamente
 *   · Escudo Angelical — toggle ON/OFF, ×0.50 al daño final (multiplicador separado, inmune a reducciones)
 * - MARTILLO:
 *   · Quemar las Naves — toggle ON/OFF, selector de nivel (Base/Base+/Avanzado/Avanzado+)
 *   · Bono de daño: +3% / +8% / +13% / +13% según nivel, aplicado automáticamente
 *   · Calculadora de escudo: HP máximo + barra deslizable HP actual (1%-99%)
 *   · Fórmula: escudo = (hpPerdido × 20% + 994), clamp(shieldMin, shieldMax)
 *   · Escudo mínimo = HP actual × 10% (HP sacrificado)
 *   · Escudo máximo = ATK × 360% (base) / ATK × 630% (avanzado)
 *   · Indicador ⚠ CAP cuando toca el tope de ATK
 *   · Escudo de Impulso: inmune a reducciones (PvP, maldición, etc.)
 *   · Avanzado/Avanzado+ marcados como exclusivos de subclase Conquistador
 * - COMBATIENTE:
 *   · Escudo de Verdad — toggle ON/OFF, selector nivel (Base/Base+/Avanzado/Avanzado+)
 *   · Fórmula: escudo = ATK×366% + HP_max×10% (base) / ATK×475.8% + HP_max×13% (avanzado)
 *   · Avanzado requiere subclase Maestro Qi
 *   · Base+/Avanzado/Avanzado+: +5% bonoDano mientras activo
 *   · Toggle PvP: escudo × 0.50
 * - Panel derecho muestra resumen de habilidades activas con escudo en azul
 *
 * CÁLCULO EN TIEMPO REAL
 * - Calculadora principal y Olivia calculan con useMemo — sin necesidad de presionar botón
 * - Botón CALCULAR solo queda en móvil (para navegar a resultados)
 *
 * OPTIMIZACIONES DE CÓDIGO
 * - PCT_STATS_BUFF eliminado, unificado con PCT_FIELDS
 * - calcHeavy() extraído como función compartida entre calcDamage y calcOliviaDamage
 * - allLabels spread eliminado, uso directo de t.labels
 * - buffedAtk y buffedDef con useMemo y dependencias correctas
 *
 * FÓRMULA
 * - Clamps corregidos: dano_critico, debuff_mod, class_mod no pueden ser negativos
 * - Popup de precisión actualizado: ~80%, menciona stats en tiempo real
 * - Debuff desactivado por defecto en calculadora principal y Olivia
 * - Isabel PvP formula corregida — healing bonus aplicado directamente sin escalar
 * - Olivia: campo Bonus plano de skill (flat, después de reducción artefacto, antes de crit/debuff)
 *
 * RESULTADOS / GRÁFICA
 * - Daño base siempre visible, independiente de crit/debuff
 * - Labels de heavy dinámicos según toggles activos
 * - Gráfica reestructurada: 4 barras base + sección DEBUFF DMG separada
 * - Nuevas barras: Sin crít. + Heavy, Base + Debuff, Base + Debuff + Heavy
 * - Escudo Angelical muestra daño reducido ×0.50 en resultados
 *
 * BUG FIXES
 * - Línea blanca en pestañas corregida (borderBottom recalculado en cada render)
 * - Idioma EN: todas las keys de buffs/skills/clases añadidas al objeto EN
 * - burnBoatLevel prop chain corregida (no definido en BuffsPanel)
 * - useMemo importado en React imports
 * - res useState duplicado eliminado
 *
 * ══════════════════════════════════════════════════════════════════
 */


const MobileCtx = React.createContext(false);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

const T = {
  es: {
    tagline: "// GUARDIANS OF CLOUDIA — SIMULACIÓN TÁCTICA",
    title: "CALCULADORA DE DAÑO  v2.3",
    tabAtk: "⚔ ATK", tabDef: "🛡 DEF", tabCh: "⚡ HEAVY", tabCA: "🔋 CARGADO",
    conditions: "CONDICIONES DEL GOLPE",
    flagCrit: "💥 Crítico", flagDebuff: "☠ Debuff", flagPvP: "⚔ PvP",
    flagMagic: "✦ Mágico", flagPhys: "🗡 Físico", flagPartner: "🤝 Olivia", flagClass: "🎯 vs Clase",
    flagCharged: "🔋 Atk Cargado",
    tabPartners: "👥 PARTNERS",

    skillBurnBoat: "Último Recurso",
    skillBurnBoatDesc: "Sacrifica 10% del HP actual → genera un escudo (Último Recurso). Mientras activo: Bono de Daño.",
    skillBurnBoatLevel: "Nivel de habilidad",
    skillBurnBoatLvBase: "Base (+3%)", skillBurnBoatLvPlus: "Base+ (+8%)", skillBurnBoatLvAdv: "Avanzado (+13%)", skillBurnBoatLvAdvPlus: "Avanzado+ (+13%)",
    skillBurnBoatHp: "HP máximo",
    skillBurnBoatHpPct: "HP actual %",
    skillBurnBoatHpLost: "HP perdido",
    skillBurnBoatShield: "Escudo estimado",
    skillBurnBoatShieldMax: "Escudo máx (ATK×360%)",
    skillBurnBoatShieldFinal: "Escudo final",
    skillBurnBoatShieldAdv: "Escudo máx avanzado (ATK×630%)",
    skillBurnBoatDmgBonus: "Bono de Daño aplicado",
    skillBurnBoatSubclassNote: "⚠ Avanzado y Avanzado+ requieren subclase Conquistador",
    skillDroneOfPeace: "Dron de la Paz",
    skillDroneOfPeaceDesc: "Sigue a todos los aliados durante 10s otorgando +5% Bono de Daño. Solo un dron por aliado.",
    skillDroneOfPeaceClass: "Pistolero / Comandante",
    skillChargerTurret: "Torreta Cargadora",
    skillChargerTurretDesc: "Los aliados curados por la Torrета Cargadora reciben [Adrenalina]: +30% Bono de Daño temporalmente.",
    skillChargerTurretClass: "Pistolero / Comandante",
    skillTruthShield: "Escudo de Mantra",
    skillTruthShieldDesc: "Genera un escudo: ATK×366% + HP_max×10%. Mientras activo: +5% Bono de Daño.",
    skillTruthShieldLevel: "Nivel de habilidad",
    skillTruthShieldLvBase: "Base", skillTruthShieldLvPlus: "Base+ (+5% DMG)", skillTruthShieldLvAdv: "Avanzado (Maestro Qi)", skillTruthShieldLvAdvPlus: "Avanzado+ (Maestro Qi)",
    skillTruthShieldHp: "HP máximo",
    skillTruthShieldShield: "Escudo estimado",
    skillTruthShieldShieldFinal: "Escudo final",
    skillTruthShieldShieldPvP: "Escudo final PvP (×0.50)",
    skillTruthShieldDmgBonus: "Bono de Daño aplicado",
    skillTruthShieldPvP: "PvP (×0.50)",
    skillTruthShieldSubclassNote: "⚠ Avanzado requiere subclase Maestro Qi",

    tabBuffs: "✦ BUFFS",
    buffsTitle: "BUFFS / DEBUFFS TEMPORALES",
    buffsAddBtn: "+ Agregar",
    buffsTabAdd: "➕ Agregar",
    buffsTabActive: "✦ Activos",
    skillsTitle: "HABILIDADES CONOCIDAS",
    skillsComingSoon: "Próximamente",
    classes: {
      swordsman: "Espadachín", rogue: "Asesino", bow: "Arquero", gunner: "Pistolero", ironbreaker: "Martillo",
      mage: "Mago", oracle: "Oráculo", combatant: "Combatiente", reaper: "Segador",
    },
    skillAngelicShield: "Escudo Angelical",
    skillAngelicShieldDesc: "Reduce todo el daño recibido un 50% (PvP). Se aplica como multiplicador final.",
    skillDeityMark: "Marca de Deidad",
    skillDeityMarkDesc: "+2.5% Bono de Daño por stack (máx 5 stacks).",
    skillDeityMarkStacks: "Stacks",
    skillAngelicShieldActive: "⚔ Escudo Angelical activo — daño final ×0.50",
    skillAngelicShieldClass: "Oráculo / Sabio Blanco",
    skillDeityMarkClass: "Oráculo",
    buffsName: "Nombre (opcional)",
    buffsEmpty: "Sin buffs activos",
    buffsTarget: "Objetivo", buffsTargetAtk: "Atacante", buffsTargetDef: "Defensor",
    buffsStat: "Stat", buffsValue: "Valor",
    buffsTypeFlat: "Plano", buffsTypePct: "Porcentaje (%)",
    buffsActiveTitle: "ACTIVOS",
    buffsListBuffs: "⬆ BUFFS",
    buffsListDebuffs: "⬇ DEBUFFS",
    buffsResetBtn: "↺ Limpiar todo",
    buffsCalcBtn: "CALCULAR DAÑO CON BUFFS",
    buffsViewList: "◀ Ver buffs",
    claseLabel: "Clase activa:", claseMagic: "Mágica", claseFisica: "Física",
    modoOlivia: "— Modo Olivia",
    partnerOlivia: "❄️ Olivia", partnerIsabel: "🌿 Isabel",
    partnerOliviaDesc: "Calculadora de daño de Olivia — stats propios, sin PvP ni clase.",
    partnerIsabelDesc: "Calculadora de curación — Skill 1.",
    isabelPopupTitle: "🌿 ISABEL — SKILL 1: PUNTO DE BENDICIÓN DEL BOSQUE",
    isabelPopupBody: "Esta calculadora solo contempla la curación de la Skill 1: <strong>Punto de Bendición del Bosque</strong>.<br/><br/>Las demás habilidades de Isabel no están incluidas aún.",
    isabelPopupBtn: "ENTENDIDO",
    partnerActive: "Activo", partnerInactive: "Inactivo",
    partnerLabel: "Partner activo:",
    oliviaPopupTitle: "⚠ AVISO — CÁLCULO DE OLIVIA",
    oliviaPopupBody: [
      "La fórmula de daño para <strong>Olivia</strong> aún está siendo descifrada.",
      "Los resultados que muestra esta calculadora pueden ser <strong>incorrectos o inexactos</strong>.",
      "Úsala como referencia aproximada, no como un valor definitivo.",
    ],
    oliviaPopupConfirm: "ENTENDIDO, CONTINUAR",
    oliviaPopupCancel: "CANCELAR",
    tenacityPopupTitle: "⚠ AVISO — PRECISIÓN DEL CÁLCULO",
    tenacityPopupBody: [
      "El funcionamiento de <strong>Tenacidad</strong> sigue siendo un misterio — aún se desconoce cómo convierte sus stats en <strong>Reducción de Penetración</strong> y/o <strong>Bono de Daño</strong>.",
      "Esta calculadora tiene una precisión aproximada del <strong>~80%</strong>. Los resultados pueden diferir del juego real debido a <strong>Tenacidad</strong> y/o <strong>aumentos o disminuciones de stats en tiempo real</strong> durante el combate.",
      "Úsala como referencia orientativa — no como valor exacto.",
    ],
    tenacityPopupConfirm: "ENTENDIDO",
    tenacityPopupBtn: "⚠ Precisión",
    isabelTitle: "🌿 ISABEL — SKILL 1: PUNTO DE BENDICIÓN DEL BOSQUE",
    isabelHpHint: "Introduce el HP de los 4 compañeros de tu equipo. Isabel es uno de ellos — es la única que se despliega en batalla, los otros 3 solo aportan stats.",
    isabelSumHp: "Suma total de HP (partners)",
    isabelBaseHeal: "Curación base",
    isabelPveTitle: "PvE — Curación por tick (×3)",
    isabelPvpTitle: "PvP — Curación por tick (×3)",
    isabelTotalPve: "Total PvE (3 ticks)",
    isabelTotalPvp: "Total PvP (3 ticks)",
    isabelHealReduction: "Red. curación total PvP (PvP only)",
    oliviaCalcTitle: "❄️ OLIVIA — CALCULADORA DE DAÑO",
    oliviaFlagCrit: "💥 Crítico", oliviaFlagDebuff: "☠ Debuff",
    oliviaFlagMagic: "✦ Mágico", oliviaFlagPhys: "🗡 Físico",
    oliviaClaseLabel: "Tipo de daño:",
    oliviaAccPopupTitle: "⚠ PRECISIÓN — CÁLCULO DE OLIVIA",
    oliviaAccPopupBody: [
      "Olivia <strong>no usa Tenacidad</strong>, lo que la hace más fácil de calcular que el personaje principal.",
      "Sin embargo, el cálculo <strong>sigue sin ser 100% exacto</strong> — pueden existir variables o interacciones aún no descifradas.",
      "Úsalo como referencia aproximada.",
    ],
    oliviaAccConfirm: "ENTENDIDO",
    partnerMina: "🛡 Mina",
    partnerMinaDesc: "Funcionalidad próximamente.",
    oliviaFlatBonus: "Bonus plano de skill",
    oliviaAllyBuffs: "BUFFS DE ALIADOS",
    oliviaAllyBuffsNone: "No hay skills de aliados activas en la pestaña BUFFS",
    oliviaPreRed: "Pre-reducción artefacto",
    oliviaArtRed: "Red. artefacto Olivia (−25%)",
    oliviaLabels: {
      skill_flat_bonus:"Bonus Plano de Skill",
      ataque:"Ataque Base", penetracion:"Penetración", escaladohabilidad:"Escalado Habilidad",
      bonoDano:"Bono de Daño", bonoDanoFisico:"Bono Daño Físico", bonoDanoMagico:"Bono Daño Mágico",
      danoCritico:"Mult. Crítico", debuffDmg:"Daño por Debuff", trueDmg:"True Damage",
    },
    changelogBtn: "📋 Changelog",
    changelogTitle: "CHANGELOG",
    changelog: [
      { version:"v2.3", date:"Abril 2026", label:"Bug Fixes de Fórmula",
        changes:[
          "Bug fix: fórmula de probabilidad de golpe (Heavy ATK) era incorrecta — podía superar 100%",
          "Nueva fórmula: prob = activación + (1−activación) × max(0, hit_rate − evasión), clampeado a [0%,100%]",
          "Heavy siempre golpea (inevitable) — cuando activa cuenta como 100% de acierto",
          "Ataques normales: hit efectivo = max(0, hit_rate − evasión)",
          "Bug fix: buffs de porcentaje en stats planos (ATK) sumaban el decimal directamente en lugar de multiplicar",
          "Fix: ATK buffado con % ahora calcula correctamente: ataque × (1 + valor%/100)",
          "Mismo fix aplicado al defensor para stats planos",
        ]
      },
      { version:"v2.2", date:"Abril 2026", label:"Idioma Chino & Bug Fixes",
        changes:[
          "Nuevo idioma: 🇨🇳 Chino simplificado (ZH) — traducción completa de todos los textos",
          "Botón 🇨🇳 ZH en el toggle de idioma del header y popup de Tenacidad",
          "Bug fix: campo 'initialAttacker' quedó dentro del objeto T al insertar T.zh",
          "Bug fix: comillas dobles tipográficas chinas causaban error de sintaxis en el changelog ZH",
        ]
      },
      { version:"v2.1", date:"Abril 2026", label:"Efecto Heavy ATK",
        changes:[
          "Efecto Heavy ATK aplicable al daño — toggle en pestaña ⚡ HEAVY",
          "Multiplica el daño final por ×(1 + dmg_recibido/100) como multiplicador separado al final",
          "Muestra daño base, con debuff y heavy con el efecto aplicado en el panel de resultados",
          "Olivia: toggle independiente 'Aplicar efecto Heavy ATK' en su propio panel",
          "Olivia usa las stats de la pestaña ⚡ HEAVY — el multiplicador se actualiza en tiempo real",
          "Ambos toggles incluidos en build share (📤 Compartir)",
        ]
      },
      { version:"v2.0", date:"Abril 2026", label:"Gran Actualización",
        changes:[
          "Pestaña ✦ BUFFS — buffs/debuffs manuales con nombre, agrupados por stat con valor base y final",
          "Habilidades conocidas: acordeón de 9 clases con Oráculo, Martillo, Combatiente y Pistolero implementados",
          "Oráculo: Marca de Deidad (+2.5% bonoDano por stack) y Escudo Angelical (×0.50 daño final)",
          "Martillo: Último Recurso con calculadora de escudo, niveles Base/Base+/Avanzado/Avanzado+",
          "Combatiente: Escudo de Mantra con calculadora de escudo y toggle PvP",
          "Pistolero: Dron de la Paz (+5% bonoDano) y Torreta Cargadora (+30% bonoDano / Adrenalina)",
          "Badge en pestaña BUFFS mostrando total de buffs y skills activos",
          "Cálculo en tiempo real con useMemo — botón CALCULAR eliminado en PC",
          "Botón VER RESULTADOS ▼ en móvil sustituye al botón CALCULAR",
          "Botón 📤 Compartir — genera URL con build completo en base64 para compartir",
          "Al abrir la URL el estado se restaura automáticamente",
          "Buffs de aliados en Olivia — sección independiente con Marca de Deidad, Dron, Torreta y Escudo Angelical",
          "Escudo Angelical muestra daño ×0.50 en resultados de Olivia",
          "Corrección: skill_flat_bonus de Olivia mostraba campo sin etiqueta",
          "Corrección: skillDeityMarkClass mostraba 'Oracle' en lugar de 'Oráculo' en ES",
          "Corrección: ~40 keys EN duplicadas eliminadas de T.es",
          "Corrección interna: buffedAtk y buffedDef con useMemo y dependencias correctas",
          "Tab bar en móvil dividido en 2 filas de 3 — ATK/DEF/HEAVY arriba, CARGADO/BUFFS/PARTNERS abajo",
        ]
      },
      { version:"v1.1", date:"Marzo 2026", label:"Versión Completa",
        changes:[
          "Daño base sin crítico añadido al display de resultados (panel principal y Olivia)",
          "Etiquetas de resultados actualizadas con crítico y debuff donde corresponde",
          "Barra Heavy actualizada: Heavy + Crít. + Debuff",
          "Popup informativo al abrir el panel de Isabel (Skill 1: Punto de Bendición del Bosque)",
          "Botón ? en el header de Isabel con explicación del HP a introducir",
          "Indicador visual cuando los modificadores netos reducen el daño (multiplicador en rojo)",
          "Stats guardados en localStorage — persisten entre sesiones",
          "Botón ↺ Reset por pestaña para restaurar valores por defecto",
          "Versión subida a v1.0 — primera versión completa",
        ]
      },
      {
        version: "v0.9.1", date: "Marzo 2026", label: "Hotfix Defensor",
        changes: [
          "Red. Penetración eliminada del panel Defensor — depende de Tenacidad (mecánica aún sin descifrar)",
          "El valor sigue activo internamente en la fórmula con el default hardcodeado",
        ]
      },
      {
        version: "v0.9", date: "Marzo 2026", label: "Pulido de Partners & UI",
        changes: [
          "Pestaña Partners: scroll eliminado — las 3 tarjetas siempre visibles sin cortes",
          "Paneles de Olivia e Isabel siempre abren a la derecha en PC",
          "En móvil los paneles de partner ocupan pantalla completa con botón ◀ Volver",
          "Flechas de partners: ▼/▲ en móvil, ▶/◀ en PC según dirección real",
          "Condiciones del golpe y botón Calcular ocultos en pestaña Partners",
          "Dropdown de Créditos se cierra automáticamente tras 5 segundos",
          "Popup informativo al entrar a la pestaña Atacante (stats ofensivos)",
          "Popup informativo al entrar a la pestaña Defensor (stats del enemigo)",
          "Fechas actualizadas a 2026 en todo el changelog",
        ]
      },
      {
        version: "v0.8", date: "2026", label: "Changelog & Header",
        changes: [
          "Changelog integrado en la app — botón 📋 en el header",
          "Historial completo documentado desde v0.1 hasta v0.8",
          "Botones del header reorganizados: idioma arriba, acciones abajo",
          "Créditos y Changelog alineados junto a botón de Precisión",
          "Nombre del autor actualizado a xDarKz en créditos",
        ]
      },
      {
        version: "v0.7", date: "2026", label: "Deploy & Responsive",
        changes: [
          "Diseño adaptado para móvil y PC (responsive completo)",
          "En móvil: vista de inputs y resultados separadas con navegación",
          "Publicado en Vercel — accesible desde cualquier dispositivo",
          "Créditos añadidos al header (dropdown)",
          "Popup de aviso de precisión (Tenacidad) al iniciar la app",
          "Botón ⚠ Precisión permanente en el header",
        ]
      },
      {
        version: "v0.6", date: "2026", label: "Partners — Olivia & Isabel",
        changes: [
          "Nueva pestaña 👥 Partners separada de las condiciones",
          "❄️ Olivia — panel de daño propio con stats independientes",
          "Olivia: solo mágico, sin PvP ni clase, reducción artefacto −25%",
          "Popup de advertencia al activar Olivia (fórmula en descifrado)",
          "Popup de precisión específico al abrir el panel de Olivia",
          "🌿 Isabel — calculadora de curación Skill 1 completa",
          "Isabel: PvE y PvP (×3 ticks), healing bonus, reducciones fijas",
          "🛡 Mina añadida como placeholder (funcionalidad próximamente)",
          "Panels de partner se abren a la derecha en PC",
          "Memoria de stats de Olivia (no se resetean al cerrar)",
        ]
      },
      {
        version: "v0.5", date: "2026", label: "Heavy ATK & Popups",
        changes: [
          "'Ataque Fuerte' renombrado a 'Heavy ATK' en toda la app",
          "Pestaña ⚡ Heavy ATK con panel propio: stats, resultados en vivo",
          "Botón ❓ informativo sobre mecánica de Heavy ATK (colapsable)",
          "Heavy ATK movido fuera del panel de resultados principales",
          "Popup de aviso al activar Ataque Cargado (se muestra una sola vez)",
          "Popup de aviso al activar modo Olivia (se muestra una sola vez)",
          "Etiqueta 'DMG recibido' aclarada como efecto dejado por Heavy ATK",
        ]
      },
      {
        version: "v0.4", date: "2026", label: "Ataque Cargado & Partners",
        changes: [
          "Nueva pestaña 🔋 ATK Cargado con valor editable y barra visual",
          "Selector de stacks ×1 / ×2 / ×3 (afectan True DMG y True DMG Red.)",
          "Fórmulas: bono dmg, red. dmg, true dmg y true dmg red. por stack",
          "Badge en el header mostrando valor y stacks activos",
          "Flag rápido de Cargado en Condiciones del Golpe",
          "Modo Olivia (partner): desactiva modificadores de clase",
          "Toggle clase Mágica / Física para el tipo de daño",
          "Indicador de clase activa y modo Olivia en panel de flags",
        ]
      },
      {
        version: "v0.3", date: "2026", label: "Idiomas & Alineación",
        changes: [
          "Toggle de idioma 🇪🇸 ES / 🇺🇸 EN en el header",
          "Traducción completa de todos los textos al inglés",
          "Label 'Idioma / Language' sobre los botones de idioma",
          "Alineación corregida en todos los inputs (ancho fijo por columna)",
          "True DMG y campos sin % alineados correctamente con los demás",
          "Scroll independiente por pestaña con memoria de posición",
          "Campo charged_atk eliminado de la pestaña Atacante",
        ]
      },
      {
        version: "v0.2", date: "2026", label: "Clases & Mejoras UI",
        changes: [
          "Soporte para clase Física y Mágica en el multiplicador de daño",
          "Stats separados: bonoDanoFisico / bonoDanoMagico y sus reducciones",
          "Modificadores con indicadores ▲ verde / ▼ rojo por dirección",
          "Sección de comparativa visual con barras de daño",
          "Tamaños de fuente aumentados en toda la interfaz",
          "Colores más brillantes y mayor contraste en el tema oscuro",
          "Panel de resultados con cadena de cálculo base visible",
        ]
      },
      {
        version: "v0.1", date: "2026", label: "Versión Inicial",
        changes: [
          "Traducción de la fórmula de daño C++ a React",
          "Pestañas de Atacante, Defensor y Heavy ATK con stats editables",
          "Condiciones del golpe: Crítico, Debuff, PvP, vs Clase",
          "Cálculo en vivo: defensa post-pen, ataque efectivo, daño base",
          "Multiplicador total con todos los modificadores netos",
          "Daño sin debuff, con debuff y Heavy hit (×1.30)",
          "Heavy ATK: probabilidad de acierto y efecto DMG recibido",
        ]
      },
    ],
    creditsTitle: "CRÉDITOS",
    creditsLines: [
      { label: "Fórmulas y mecánicas", value: "xDarKz" },
      { label: "Desarrollo UI / React", value: "Claude (Anthropic)" },
      { label: "Juego", value: "Guardians of Cloudia" },
      { label: "Versión", value: "v2.3" },
    ],
    isabelLabels: {
      isabel_skill_scaling_flat_bonus: "Bonus plano de skill",
      isabel_skill_scaling: "Escalado de skill",
      partner_1_max_hp: "HP Máximo Partner 1",
      partner_2_max_hp: "HP Máximo Partner 2",
      partner_3_max_hp: "HP Máximo Partner 3",
      partner_4_max_hp: "HP Máximo Partner 4",
      pvp_healing_reducion: "Red. curación PvP (fija, solo PvP)",
      partners_healing_reduction: "Red. curación artefacto (fija, solo PvP)",
      healing_bonus: "Bono de curación",
    },
    atkTabPopupTitle: "⚔ PESTAÑA — ATACANTE",
    atkTabPopupBody: "Aquí van <strong>tus stats ofensivos</strong>. Ingresa los valores de tu personaje: ataque, penetración, escalado de habilidad, bonos de daño, crítico, etc.",
    atkTabPopupBtn: "ENTENDIDO",
    defTabPopupTitle: "🛡 PESTAÑA — DEFENSOR",
    defTabPopupBody: "Aquí van las <strong>stats defensivas de tu enemigo</strong>. Ingresa los valores del oponente: defensa, reducción de penetración, reducciones de daño, etc.",
    defTabPopupBtn: "ENTENDIDO",
    resetBtn: "↺ Reset",
    shareBtn: "📤 Compartir",
    shareCopied: "✓ Copiado",
    negModWarning: "⚠ Los modificadores netos están reduciendo tu daño",
    calcBtn: "CALCULAR DAÑO",
    mobileShowResults: "VER RESULTADOS ▼",
    mobileShowInputs: "◀ VOLVER",
    emptyHint: "Configura los parámetros\npara ver los resultados",
    secBase: "CADENA DE CÁLCULO BASE",
    secMods: "MODIFICADORES NETOS",
    secChargedMods: "MODIFICADORES DE ATK CARGADO",
    secFinal: "DAÑO FINAL",
    secChart: "COMPARATIVA VISUAL",
    secChargedAtk: "HEAVY ATK — Calculo_ataque_fuerte()",
    defPost: "Defensa post-penetración", atkEff: "Ataque efectivo", danoBase: "Daño base (× escalado)",
    modGeneral: "Bono/Red. Daño General", modMagic: "Bono/Red. Daño Mágico", modPhys: "Bono/Red. Daño Físico",
    modCrit: "Crítico neto", modDebuff: "Debuff neto", debuffCancelled: "☠ Debuff cancelado — resist. enemigo ≥ tu Debuff DMG", modPvP: "PvP neto", modClass: "vs Clase enemiga",
    modChargedDmg: "Bono daño (cargado)", modChargedRed: "Red. daño (cargado)",
    multTotal: "Multiplicador Total",
    danoNoCrit: "Daño base",
    danoSinDebuff: "Daño base + crítico (sin debuff, sin heavy)", danoConDebuff: "Daño + crítico + debuff",
    heavyOnly: "Heavy hit ×1.30", heavyNormal: "Heavy hit ×1.30 + crít.", heavyDebuff: "Heavy hit ×1.30 + crít. + debuff",
    barNormal: "Base + Crít.", barNoCritHeavy: "Sin crít. + Heavy", barCritHeavy: "Crít. + Heavy", barBaseDebuff: "Base + Debuff", barBaseDebuffHeavy: "Base + Debuff + Heavy", barDebuff: "Crít. + Debuff", barDebuffHeavy: "Crít. + Debuff + Heavy", secChartDebuff: "DEBUFF DMG",
    probAcierto: "Probabilidad total de acierto", dmgRecibido: "Efecto 'DMG recibido aumentado' dejado por Heavy ATK (debuff)",
    heavyEffectToggle: "Aplicar efecto Heavy ATK",
    heavyEffectActive: "⚡ Efecto Heavy activo",
    secHeavyEffect: "EFECTO HEAVY ATK (DMG RECIBIDO +%)",
    heavyEffectNote: "Multiplicador final aplicado después de todo",
    heavyInfoBtn: "❓ ¿Cómo funciona Heavy ATK?",
    heavyInfoTitle: "MECÁNICA — HEAVY ATK",
    heavyInfoLines: [
      "⚡ <strong>Heavy ATK siempre aumenta el daño final en un 30%.</strong>",
      "🚫 Este 30% <strong>no se aplica</strong> al bono de Debuff DMG Boost — Heavy y Debuff son multiplicadores independientes.",
      "🛡 <strong>Heavy es inevitable</strong> — el ataque no puede ser evadido ni bloqueado.",
      "☠ Cada <strong>20 de Heavy ATK</strong> aplicados al enemigo activa un efecto de daño recibido aumentado de <strong>+0.13% por cada 20 Heavy ATK</strong>.",
      "⏱ Este efecto dura <strong>3 segundos</strong>, tiene un CD de aprox. <strong>3–5 seg.</strong> y <strong>cuenta como Debuff</strong> para el Debuff DMG Boost.",
    ],
    footer: "Simulación táctica — valores estimados",
    caTitle: "ATAQUE CARGADO",
    caInput: "Valor Ataque Cargado",
    caActive: "Activo", caInactive: "Inactivo",
    caBonusDmg: "Bono de daño", caRedDmg: "Reducción de daño",
    caTrueDmg: "True Damage adicional", caTrueDmgRed: "True DMG Reduction",
    caFormula: "× 100 cargado = 1% bono dmg  •  × 100 cargado = 0.5% red. dmg\n× 1 cargado = 1.5 true dmg (por stack)  •  × 1 cargado = 1 true dmg red. (por stack)",
    caStacks: "STACKS DE CARGADO",
    caStacksNote: "Los stacks solo afectan True DMG y True DMG Reduction",
    caStackTotal: "True DMG total (stacks)",
    caStackRedTotal: "True DMG Red. total (stacks)",
    // Popup
    popupTitle: "⚠ AVISO — ATAQUE CARGADO",
    popupBody: [
      "El <strong>Bono de Daño</strong> y la <strong>Reducción de Daño</strong> que otorga el Ataque Cargado <strong>solo se activan</strong> bajo las siguientes condiciones:",
      "① Debes tener <strong>3 stacks de Ataque Cargado</strong> acumulados.",
      "② Al atacar con 3 stacks existe una <strong>probabilidad de activar Charged Burst</strong>.",
      "③ Una vez activado, el efecto de bono/reducción de daño <strong>solo dura 3 segundos</strong>.",
      "Fuera de ese ventana, el Ataque Cargado <strong>únicamente</strong> aporta True DMG y True DMG Reduction por stack.",
    ],
    popupNote: "Esta calculadora asume que el Charged Burst está activo al momento del golpe. Ajusta el valor de Ataque Cargado según corresponda.",
    popupConfirm: "ENTENDIDO, CONTINUAR",
    popupCancel: "CANCELAR",
    labels: {
      ataque:"Ataque Base", penetracion:"Penetración", escaladohabilidad:"Escalado Habilidad",
      bonoDano:"Bono de Daño", bonoDanoFisico:"Bono Daño Físico", bonoDanoMagico:"Bono Daño Mágico",
      danoCritico:"Mult. Crítico", debuffDmg:"Daño por Debuff", trueDmg:"True Damage",
      pvpDmgBonus:"Bono PvP", allClassesDmgBonus:"Bono Todas Clases",
      dmgToEnemyClass:"Bono vs Clase Enemiga", charged_atk:"Charged ATK",
      defensa:"Defensa Base", reduccionPenetracion:"Red. Penetración",
      reduccionDano:"Red. Daño General", reduccionDanoFisico:"Red. Daño Físico",
      reduccionDanoMagico:"Red. Daño Mágico", reduccionDanoCritico:"Red. Daño Crítico",
      reduccionDebuff:"Red. Debuff", reduccionTrueDmg:"Red. True Damage",
      pvpDmgReduccion:"Red. PvP", reduccionAllClassesDmg:"Red. Todas Clases",
      reduccionDmgFromClass:"Red. vs Clase Específica",
      ataque_fuerte:"Poder Heavy ATK", ataque_fuerte_porcentaje:"% Activación",
      hit_rate:"Hit Rate (activo)", evacion:"Evasión enemigo",
    },
  },
  en: {
    tagline: "// GUARDIANS OF CLOUDIA — TACTICAL SIMULATION",
    title: "DAMAGE CALCULATOR  v2.3",
    tabAtk: "⚔ ATK", tabDef: "🛡 DEF", tabCh: "⚡ HEAVY", tabCA: "🔋 CHARGED",
    conditions: "HIT CONDITIONS",
    flagCrit: "💥 Critical", flagDebuff: "☠ Debuff", flagPvP: "⚔ PvP",
    flagMagic: "✦ Magic", flagPhys: "🗡 Physical", flagPartner: "🤝 Olivia", flagClass: "🎯 vs Class",
    flagCharged: "🔋 Charged Atk",
    tabPartners: "👥 PARTNERS",
    tabBuffs: "✦ BUFFS",
    buffsTitle: "TEMPORARY BUFFS / DEBUFFS",
    buffsAddBtn: "+ Add",
    buffsName: "Name (optional)",
    buffsTarget: "Target", buffsTargetAtk: "Attacker", buffsTargetDef: "Defender",
    buffsStat: "Stat", buffsValue: "Value",
    buffsTypeFlat: "Flat", buffsTypePct: "Percentage (%)",
    buffsActiveTitle: "ACTIVE",
    buffsResetBtn: "↺ Clear all",
    buffsEmpty: "No active buffs",
    buffsCalcBtn: "CALCULATE DAMAGE WITH BUFFS",
    buffsViewList: "◀ View buffs",
    buffsListBuffs: "⬆ BUFFS",
    buffsListDebuffs: "⬇ DEBUFFS",
    skillsTitle: "KNOWN SKILLS",
    skillsComingSoon: "Coming soon",
    classes: {
      swordsman: "Swordsman", rogue: "Rogue", bow: "Bow", gunner: "Gunner", ironbreaker: "Ironbreaker",
      mage: "Mage", oracle: "Oracle", combatant: "Combatant", reaper: "Reaper",
    },
    skillAngelicShield: "Angelic Shield",
    skillAngelicShieldDesc: "Reduces all incoming damage by 50% (PvP). Applied as final multiplier.",
    skillAngelicShieldActive: "⚔ Angelic Shield active — final dmg ×0.50",
    skillAngelicShieldClass: "Oracle / White Sage",
    skillDeityMark: "Deity Mark",
    skillDeityMarkDesc: "+2.5% DMG Bonus per stack (max 5 stacks).",
    skillDeityMarkStacks: "Stacks",
    skillDeityMarkClass: "Oracle",
    skillBurnBoat: "Last Resort",
    skillBurnBoatDesc: "Sacrifices 10% current HP → generates a shield (Last Resort). While active: DMG Bonus.",
    skillBurnBoatLevel: "Skill level",
    skillBurnBoatLvBase: "Base (+3%)", skillBurnBoatLvPlus: "Base+ (+8%)", skillBurnBoatLvAdv: "Advanced (+13%)", skillBurnBoatLvAdvPlus: "Advanced+ (+13%)",
    skillBurnBoatHp: "Max HP",
    skillBurnBoatHpPct: "Current HP %",
    skillBurnBoatHpLost: "HP lost",
    skillBurnBoatShield: "Estimated shield",
    skillBurnBoatShieldMax: "Shield max (ATK×360%)",
    skillBurnBoatShieldFinal: "Final shield",
    skillBurnBoatShieldAdv: "Advanced shield max (ATK×630%)",
    skillBurnBoatDmgBonus: "DMG Bonus applied",
    skillBurnBoatSubclassNote: "⚠ Advanced and Advanced+ require Conqueror subclass",
    skillDroneOfPeace: "Drone of Peace",
    skillDroneOfPeaceDesc: "Follows all allies for 10s granting +5% DMG Bonus. Only one drone per ally.",
    skillDroneOfPeaceClass: "Gunner / Commander",
    skillChargerTurret: "Charger Turret",
    skillChargerTurretDesc: "Allies healed by Charger Turret receive [Adrenaline]: +30% DMG Bonus temporarily.",
    skillChargerTurretClass: "Gunner / Commander",
    skillTruthShield: "Mantra Shield",
    skillTruthShieldDesc: "Generates a shield: ATK×366% + HP_max×10%. While active: +5% DMG Bonus.",
    skillTruthShieldLevel: "Skill level",
    skillTruthShieldLvBase: "Base", skillTruthShieldLvPlus: "Base+ (+5% DMG)", skillTruthShieldLvAdv: "Advanced (Qi Master)", skillTruthShieldLvAdvPlus: "Advanced+ (Qi Master)",
    skillTruthShieldHp: "Max HP",
    skillTruthShieldShield: "Estimated shield",
    skillTruthShieldShieldFinal: "Final shield",
    skillTruthShieldShieldPvP: "Final shield (PvP ×0.50)",
    skillTruthShieldDmgBonus: "DMG Bonus applied",
    skillTruthShieldPvP: "PvP (×0.50)",
    skillTruthShieldSubclassNote: "⚠ Advanced requires Qi Master subclass",
    claseLabel: "Active class:", claseMagic: "Magic", claseFisica: "Physical",
    modoOlivia: "— Olivia Mode",
    partnerOlivia: "❄️ Olivia", partnerIsabel: "🌿 Isabel",
    partnerOliviaDesc: "Olivia damage calculator — own stats, no PvP or class mods.",
    partnerIsabelDesc: "Healing calculator — Skill 1.",
    isabelPopupTitle: "🌿 ISABEL — SKILL 1: FOREST BLESSING",
    isabelPopupBody: "This calculator only covers the healing from Skill 1: <strong>Forest Blessing</strong>.<br/><br/>Isabel's other skills are not included yet.",
    isabelPopupBtn: "GOT IT",
    partnerActive: "Active", partnerInactive: "Inactive",
    partnerLabel: "Active partner:",
    oliviaPopupTitle: "⚠ WARNING — OLIVIA CALCULATION",
    oliviaPopupBody: [
      "The damage formula for <strong>Olivia</strong> is still being figured out.",
      "The results shown by this calculator may be <strong>incorrect or inaccurate</strong>.",
      "Use it as a rough reference, not as a definitive value.",
    ],
    oliviaPopupConfirm: "UNDERSTOOD, CONTINUE",
    oliviaPopupCancel: "CANCEL",
    tenacityPopupTitle: "⚠ NOTICE — CALCULATION ACCURACY",
    tenacityPopupBody: [
      "<strong>Tenacity</strong> mechanics are still a mystery — it is unknown how it converts its stats into <strong>Penetration Reduction</strong> and/or <strong>Damage Bonus</strong>.",
      "This calculator is <strong>accurate but not 100%</strong>. It currently assumes you have <strong>maximum Tenacity</strong>, which may not reflect your actual situation.",
      "This will change in a <strong>future version</strong> as the mechanic is figured out. There is a <strong>margin of error</strong> in the results.",
    ],
    tenacityPopupConfirm: "UNDERSTOOD",
    tenacityPopupBtn: "⚠ Accuracy",
    isabelTitle: "🌿 ISABEL — SKILL 1: FOREST BLESSING",
    isabelHpHint: "Enter the HP of your 4 team partners. Isabel is one of them — she's the only one deployed in battle, the other 3 only contribute stats.",
    isabelSumHp: "Total HP sum (partners)",
    isabelBaseHeal: "Base healing",
    isabelPveTitle: "PvE — Healing per tick (×3)",
    isabelPvpTitle: "PvP — Healing per tick (×3)",
    isabelTotalPve: "Total PvE (3 ticks)",
    isabelTotalPvp: "Total PvP (3 ticks)",
    isabelHealReduction: "Total healing reduction (PvP only)",
    oliviaCalcTitle: "❄️ OLIVIA — DAMAGE CALCULATOR",
    oliviaFlagCrit: "💥 Critical", oliviaFlagDebuff: "☠ Debuff",
    oliviaFlagMagic: "✦ Magic", oliviaFlagPhys: "🗡 Physical",
    oliviaClaseLabel: "Damage type:",
    oliviaAccPopupTitle: "⚠ ACCURACY — OLIVIA CALCULATION",
    oliviaAccPopupBody: [
      "Olivia <strong>does not use Tenacity</strong>, making her easier to calculate than the main character.",
      "However, the calculation is <strong>still not 100% accurate</strong> — there may be variables or interactions not yet figured out.",
      "Use it as a rough reference.",
    ],
    oliviaAccConfirm: "UNDERSTOOD",
    partnerMina: "🛡 Mina",
    partnerMinaDesc: "Functionality coming soon.",
    oliviaFlatBonus: "Skill flat bonus",
    oliviaAllyBuffs: "ALLY BUFFS",
    oliviaAllyBuffsNone: "No ally skills active in the BUFFS tab",
    oliviaPreRed: "Pre-artifact reduction",
    oliviaArtRed: "Olivia artifact red. (−25%)",
    oliviaLabels: {
      skill_flat_bonus:"Skill Flat Bonus",
      ataque:"Base Attack", penetracion:"Penetration", escaladohabilidad:"Skill Scaling",
      bonoDano:"Damage Bonus", bonoDanoFisico:"Physical DMG Bonus", bonoDanoMagico:"Magic DMG Bonus",
      danoCritico:"Crit Multiplier", debuffDmg:"Debuff Damage", trueDmg:"True Damage",
    },
    changelogBtn: "📋 Changelog",
    changelogTitle: "CHANGELOG",
    changelog: [
      { version:"v2.3", date:"April 2026", label:"Formula Bug Fixes",
        changes:[
          "Bug fix: Heavy ATK hit probability formula was incorrect — could exceed 100%",
          "New formula: prob = activation + (1−activation) × max(0, hit_rate − evasion), clamped to [0%,100%]",
          "Heavy always hits (unavoidable) — when triggered counts as 100% hit",
          "Normal attacks: effective hit = max(0, hit_rate − evasion)",
          "Bug fix: percentage buffs on flat stats (ATK) were adding the decimal directly instead of multiplying",
          "Fix: ATK buffed with % now calculates correctly: attack × (1 + value%/100)",
          "Same fix applied to defender flat stats",
        ]
      },
      { version:"v2.2", date:"April 2026", label:"Chinese Language & Bug Fixes",
        changes:[
          "New language: 🇨🇳 Simplified Chinese (ZH) — full translation of all texts",
          "🇨🇳 ZH button added to language toggle in header and Tenacity popup",
          "Bug fix: initialAttacker definition got absorbed into T object when inserting T.zh",
          "Bug fix: Chinese typographic double quotes caused syntax error in ZH changelog",
        ]
      },
      { version:"v2.1", date:"April 2026", label:"Heavy ATK Effect",
        changes:[
          "Heavy ATK effect applicable to damage — toggle in ⚡ HEAVY tab",
          "Multiplies final damage by ×(1 + dmg_received/100) as a separate final multiplier",
          "Shows base, debuff and heavy damage with the effect applied in the results panel",
          "Olivia: independent 'Apply Heavy ATK effect' toggle in her own panel",
          "Olivia uses stats from the ⚡ HEAVY tab — multiplier updates in real time",
          "Both toggles included in build share (📤 Share)",
        ]
      },
      { version:"v2.0", date:"April 2026", label:"Major Update",
        changes:[
          "✦ BUFFS tab — manual buffs/debuffs with optional name, grouped by stat with base and final values",
          "Known skills accordion for 9 classes — Oracle, Ironbreaker, Combatant and Gunner implemented",
          "Oracle: Deity Mark (+2.5% DMG Bonus per stack) and Angelic Shield (×0.50 final dmg)",
          "Ironbreaker: Last Resort with shield calculator, Base/Base+/Advanced/Advanced+ levels",
          "Combatant: Mantra Shield with shield calculator and PvP toggle",
          "Gunner: Drone of Peace (+5% DMG Bonus) and Charger Turret (+30% DMG Bonus / Adrenaline)",
          "Badge on BUFFS tab showing total active buffs and skills",
          "Real-time calculation with useMemo — CALCULATE button removed on PC",
          "SEE RESULTS ▼ button on mobile replaces CALCULATE button",
          "📤 Share button — generates URL with full build encoded in base64",
          "Opening the URL automatically restores the full state",
          "Ally buffs for Olivia — independent section with Deity Mark, Drone, Charger Turret and Angelic Shield",
          "Angelic Shield shows ×0.50 damage in Olivia results",
          "Fix: Olivia skill_flat_bonus field had no label",
          "Fix: skillDeityMarkClass showed 'Oracle' instead of 'Oráculo' in ES",
          "Fix: ~40 duplicate EN keys removed from T.es",
          "Internal fix: buffedAtk and buffedDef with useMemo and correct dependencies",
          "Mobile tab bar split into 2 rows of 3 — ATK/DEF/HEAVY on top, CHARGED/BUFFS/PARTNERS below",
        ]
      },
      { version:"v1.1", date:"March 2026", label:"Full Release",
        changes:[
          "Base damage without crit added to results display (main panel and Olivia)",
          "Result labels updated with crit and debuff where applicable",
          "Heavy bar updated: Heavy + Crit. + Debuff",
          "Info popup when opening Isabel panel (Skill 1: Forest Blessing)",
          "? button in Isabel header explaining which HP values to enter",
          "Visual indicator when net modifiers reduce damage (multiplier turns red)",
          "Stats saved to localStorage — persist between sessions",
          "↺ Reset button per tab to restore default values",
          "Version bumped to v1.0 — first complete release",
        ]
      },
      {
        version: "v0.9.1", date: "March 2026", label: "Defender Hotfix",
        changes: [
          "Pen. Reduction removed from Defender panel — depends on Tenacity (mechanic not yet figured out)",
          "Value remains active internally in the formula with the hardcoded default",
        ]
      },
      {
        version: "v0.9", date: "March 2026", label: "Partners Polish & UI",
        changes: [
          "Partners tab: scroll removed — all 3 cards always visible without clipping",
          "Olivia and Isabel panels always open to the right on PC",
          "On mobile, partner panels take full screen with ◀ Back button",
          "Partner arrows: ▼/▲ on mobile, ▶/◀ on PC matching actual open direction",
          "Hit conditions and Calc button hidden while on Partners tab",
          "Credits dropdown auto-closes after 5 seconds",
          "Info popup when entering the Attacker tab (offensive stats)",
          "Info popup when entering the Defender tab (enemy defensive stats)",
          "Dates updated to 2026 across all changelog entries",
        ]
      },
      {
        version: "v0.8", date: "2026", label: "Changelog & Header",
        changes: [
          "Changelog integrated into the app — 📋 button in header",
          "Full history documented from v0.1 to v0.8",
          "Header buttons reorganized: language on top, actions below",
          "Credits and Changelog aligned next to Accuracy button",
          "Author name updated to xDarKz in credits",
        ]
      },
      {
        version: "v0.7", date: "2026", label: "Deploy & Responsive",
        changes: [
          "Full responsive design for mobile and PC",
          "Mobile: separate input/results views with navigation",
          "Published on Vercel — accessible from any device",
          "Credits added to header (dropdown)",
          "Tenacity accuracy warning popup on app load",
          "Permanent ⚠ Accuracy button in header",
        ]
      },
      {
        version: "v0.6", date: "2026", label: "Partners — Olivia & Isabel",
        changes: [
          "New 👥 Partners tab separated from hit conditions",
          "❄️ Olivia — own damage panel with independent stats",
          "Olivia: magic only, no PvP or class mods, −25% artifact reduction",
          "Warning popup when activating Olivia (formula being figured out)",
          "Accuracy popup specific to opening Olivia's panel",
          "🌿 Isabel — full Skill 1 healing calculator",
          "Isabel: PvE and PvP (×3 ticks), healing bonus, fixed reductions",
          "🛡 Mina added as placeholder (functionality coming soon)",
          "Partner panels open to the right on PC",
          "Olivia stats persist when closing and reopening the panel",
        ]
      },
      {
        version: "v0.5", date: "2026", label: "Heavy ATK & Popups",
        changes: [
          "'Ataque Fuerte' renamed to 'Heavy ATK' throughout the app",
          "⚡ Heavy ATK tab with own panel: stats and live results",
          "❓ Info button explaining Heavy ATK mechanics (collapsible)",
          "Heavy ATK results moved out of the main damage results panel",
          "Warning popup when activating Charged Attack (shown once only)",
          "Warning popup when activating Olivia mode (shown once only)",
          "'DMG received' label clarified as effect left by Heavy ATK",
        ]
      },
      {
        version: "v0.4", date: "2026", label: "Charged Attack & Partners",
        changes: [
          "New 🔋 Charged ATK tab with editable value and visual bar",
          "Stack selector ×1 / ×2 / ×3 (affect True DMG and True DMG Red.)",
          "Formulas: dmg bonus, dmg red., true dmg and true dmg red. per stack",
          "Header badge showing active value and stacks",
          "Quick Charged flag in Hit Conditions",
          "Olivia mode (partner): disables class modifiers",
          "Magic / Physical class toggle for damage type",
          "Active class and Olivia mode indicator in flags panel",
        ]
      },
      {
        version: "v0.3", date: "2026", label: "Languages & Alignment",
        changes: [
          "Language toggle 🇪🇸 ES / 🇺🇸 EN in header",
          "Full English translation of all texts",
          "'Idioma / Language' label above language buttons",
          "Input alignment fixed across all tabs (fixed column width)",
          "True DMG and non-% fields correctly aligned with others",
          "Independent scroll per tab with position memory",
          "charged_atk field removed from Attacker tab",
        ]
      },
      {
        version: "v0.2", date: "2026", label: "Classes & UI Improvements",
        changes: [
          "Support for Physical and Magic class in damage multiplier",
          "Separate stats: bonoDanoFisico / bonoDanoMagico and reductions",
          "Modifiers with ▲ green / ▼ red directional indicators",
          "Visual comparison section with damage bars",
          "Font sizes increased throughout the interface",
          "Brighter colors and higher contrast on dark theme",
          "Results panel showing full base calculation chain",
        ]
      },
      {
        version: "v0.1", date: "2026", label: "Initial Version",
        changes: [
          "C++ damage formula translated to React",
          "Attacker, Defender and Heavy ATK tabs with editable stats",
          "Hit conditions: Critical, Debuff, PvP, vs Class",
          "Live calculation: post-pen defense, effective attack, base damage",
          "Total multiplier with all net modifiers",
          "Damage without debuff, with debuff and Heavy hit (×1.30)",
          "Heavy ATK: hit probability and DMG received effect",
        ]
      },
    ],
    creditsTitle: "CREDITS",
    creditsLines: [
      { label: "Formulas & mechanics", value: "xDarKz" },
      { label: "UI / React development", value: "Claude (Anthropic)" },
      { label: "Game", value: "Guardians of Cloudia" },
      { label: "Version", value: "v2.3" },
    ],
    isabelLabels: {
      isabel_skill_scaling_flat_bonus: "Skill flat bonus",
      isabel_skill_scaling: "Skill scaling",
      partner_1_max_hp: "Partner 1 Max HP",
      partner_2_max_hp: "Partner 2 Max HP",
      partner_3_max_hp: "Partner 3 Max HP",
      partner_4_max_hp: "Partner 4 Max HP",
      pvp_healing_reducion: "PvP healing reduction (fixed, PvP only)",
      partners_healing_reduction: "Artifact healing reduction (fixed, PvP only)",
      healing_bonus: "Healing bonus",
    },
    atkTabPopupTitle: "⚔ TAB — ATTACKER",
    atkTabPopupBody: "This is where your <strong>offensive stats</strong> go. Enter your character's values: attack, penetration, skill scaling, damage bonuses, critical, etc.",
    atkTabPopupBtn: "GOT IT",
    defTabPopupTitle: "🛡 TAB — DEFENDER",
    defTabPopupBody: "This is where your <strong>enemy's defensive stats</strong> go. Enter the opponent's values: defense, penetration reduction, damage reductions, etc.",
    defTabPopupBtn: "GOT IT",
    resetBtn: "↺ Reset",
    shareBtn: "📤 Share",
    shareCopied: "✓ Copied",
    negModWarning: "⚠ Net modifiers are reducing your damage",
    calcBtn: "CALCULATE DAMAGE",
    mobileShowResults: "SEE RESULTS ▼",
    mobileShowInputs: "◀ BACK",
    emptyHint: "Set the parameters\nand press CALCULATE DAMAGE",
    secBase: "BASE CALCULATION CHAIN",
    secMods: "NET MODIFIERS",
    secChargedMods: "CHARGED ATK MODIFIERS",
    secFinal: "FINAL DAMAGE",
    secChart: "VISUAL COMPARISON",
    secChargedAtk: "HEAVY ATK — Calculo_ataque_fuerte()",
    defPost: "Defense post-penetration", atkEff: "Effective attack", danoBase: "Base damage (× scaling)",
    modGeneral: "DMG Bonus/Red. General", modMagic: "Magic DMG Bonus/Red.", modPhys: "Physical DMG Bonus/Red.",
    modCrit: "Net critical", modDebuff: "Net debuff", debuffCancelled: "☠ Debuff cancelled — enemy resist. ≥ your Debuff DMG", modPvP: "Net PvP", modClass: "vs Enemy class",
    modChargedDmg: "DMG bonus (charged)", modChargedRed: "DMG red. (charged)",
    multTotal: "Total Multiplier",
    danoNoCrit: "Base damage",
    danoSinDebuff: "Base + crit damage (no debuff, no heavy)", danoConDebuff: "Dmg + crit + debuff",
    heavyOnly: "Heavy hit ×1.30", heavyNormal: "Heavy hit ×1.30 + crit", heavyDebuff: "Heavy hit ×1.30 + crit + debuff",
    barNormal: "Base + Crit.", barNoCritHeavy: "No crit + Heavy", barCritHeavy: "Crit. + Heavy", barBaseDebuff: "Base + Debuff", barBaseDebuffHeavy: "Base + Debuff + Heavy", barDebuff: "Crit. + Debuff", barDebuffHeavy: "Crit. + Debuff + Heavy", secChartDebuff: "DEBUFF DMG",
    probAcierto: "Total hit probability", dmgRecibido: "'Damage received increase' effect left by Heavy ATK (debuff)",
    heavyEffectToggle: "Apply Heavy ATK effect",
    heavyEffectActive: "⚡ Heavy effect active",
    secHeavyEffect: "HEAVY ATK EFFECT (DMG RECEIVED +%)",
    heavyEffectNote: "Final multiplier applied after everything",
    heavyInfoBtn: "❓ How does Heavy ATK work?",
    heavyInfoTitle: "MECHANICS — HEAVY ATK",
    heavyInfoLines: [
      "⚡ <strong>Heavy ATK always increases final damage by 30%.</strong>",
      "🚫 This 30% <strong>does NOT apply</strong> to Debuff DMG Boost — Heavy and Debuff are independent multipliers.",
      "🛡 <strong>Heavy is unavoidable</strong> — the attack cannot be evaded or blocked.",
      "☠ Every <strong>20 Heavy ATK</strong> applied to the enemy triggers a damage received increase of <strong>+0.13% per 20 Heavy ATK</strong>.",
      "⏱ This effect lasts <strong>3 seconds</strong>, has a CD of approx. <strong>3–5 sec.</strong> and <strong>counts as a Debuff</strong> for Debuff DMG Boost.",
    ],
    footer: "Tactical simulation — estimated values",
    caTitle: "CHARGED ATTACK",
    caInput: "Charged Attack Value",
    caActive: "Active", caInactive: "Inactive",
    caBonusDmg: "Damage bonus", caRedDmg: "Damage reduction",
    caTrueDmg: "Additional True Damage", caTrueDmgRed: "True DMG Reduction",
    caFormula: "× 100 charged = 1% dmg bonus  •  × 100 charged = 0.5% dmg red.\n× 1 charged = 1.5 true dmg (per stack)  •  × 1 charged = 1 true dmg red. (per stack)",
    caStacks: "CHARGED STACKS",
    caStacksNote: "Stacks only affect True DMG and True DMG Reduction",
    caStackTotal: "True DMG total (stacks)",
    caStackRedTotal: "True DMG Red. total (stacks)",
    // Popup
    popupTitle: "⚠ WARNING — CHARGED ATTACK",
    popupBody: [
      "The <strong>Damage Bonus</strong> and <strong>Damage Reduction</strong> granted by Charged Attack <strong>only activate</strong> under the following conditions:",
      "① You must have <strong>3 Charged Attack stacks</strong> accumulated.",
      "② Attacking with 3 stacks gives you a <strong>chance to trigger Charged Burst</strong>.",
      "③ Once triggered, the damage bonus/reduction effect <strong>only lasts 3 seconds</strong>.",
      "Outside that window, Charged Attack <strong>only</strong> contributes True DMG and True DMG Reduction per stack.",
    ],
    popupNote: "This calculator assumes Charged Burst is active at the moment of the hit. Adjust the Charged Attack value accordingly.",
    popupConfirm: "UNDERSTOOD, CONTINUE",
    popupCancel: "CANCEL",
    labels: {
      ataque:"Base Attack", penetracion:"Penetration", escaladohabilidad:"Skill Scaling",
      bonoDano:"Damage Bonus", bonoDanoFisico:"Physical DMG Bonus", bonoDanoMagico:"Magic DMG Bonus",
      danoCritico:"Crit Multiplier", debuffDmg:"Debuff Damage", trueDmg:"True Damage",
      pvpDmgBonus:"PvP Bonus", allClassesDmgBonus:"All Classes Bonus",
      dmgToEnemyClass:"vs Enemy Class Bonus", charged_atk:"Charged ATK",
      defensa:"Base Defense", reduccionPenetracion:"Pen. Reduction",
      reduccionDano:"General DMG Red.", reduccionDanoFisico:"Physical DMG Red.",
      reduccionDanoMagico:"Magic DMG Red.", reduccionDanoCritico:"Crit DMG Red.",
      reduccionDebuff:"Debuff Red.", reduccionTrueDmg:"True DMG Red.",
      pvpDmgReduccion:"PvP Red.", reduccionAllClassesDmg:"All Classes Red.",
      reduccionDmgFromClass:"vs Specific Class Red.",
      ataque_fuerte:"Heavy ATK Power", ataque_fuerte_porcentaje:"% Activation",
      hit_rate:"Hit Rate (active)", evacion:"Enemy Evasion",
    },
  },
  zh: {
    tagline: "// 云上城之歌 — 战斗模拟器",
    title: "伤害计算器  v2.3",
    tabAtk: "⚔ 攻击", tabDef: "🛡 防御", tabCh: "⚡ 重击", tabCA: "🔋 蓄力",
    conditions: "命中条件",
    flagCrit: "💥 暴击", flagDebuff: "☠ 减益", flagPvP: "⚔ PvP",
    flagMagic: "✦ 魔法", flagPhys: "🗡 物理", flagPartner: "🤝 Olivia", flagClass: "🎯 克制职业",
    flagCharged: "🔋 蓄力攻击",
    tabPartners: "👥 伙伴",
    tabBuffs: "✦ 增益",
    buffsTitle: "临时增益 / 减益",
    buffsAddBtn: "+ 添加",
    buffsTabAdd: "➕ 添加",
    buffsTabActive: "✦ 已激活",
    buffsName: "名称（可选）",
    buffsTarget: "目标", buffsTargetAtk: "攻击方", buffsTargetDef: "防御方",
    buffsStat: "属性", buffsValue: "数值",
    buffsTypeFlat: "固定值", buffsTypePct: "百分比 (%)",
    buffsActiveTitle: "已激活",
    buffsResetBtn: "↺ 全部清除",
    buffsEmpty: "无已激活增益",
    buffsCalcBtn: "计算附带增益的伤害",
    buffsViewList: "◀ 查看增益",
    buffsListBuffs: "⬆ 增益",
    buffsListDebuffs: "⬇ 减益",
    skillsTitle: "已知技能",
    skillsComingSoon: "即将推出",
    classes: {
      swordsman: "剑士", rogue: "刺客", bow: "弓手", gunner: "枪手", ironbreaker: "铁锤者",
      mage: "法师", oracle: "神谕者", combatant: "格斗士", reaper: "死神",
    },
    skillAngelicShield: "天使之盾",
    skillAngelicShieldDesc: "减少所有受到的伤害50%（PvP）。作为最终乘数生效。",
    skillAngelicShieldActive: "⚔ 天使之盾已激活 — 最终伤害 ×0.50",
    skillAngelicShieldClass: "神谕者 / 白贤者",
    skillDeityMark: "神明印记",
    skillDeityMarkDesc: "每层+2.5%伤害加成（最多5层）。",
    skillDeityMarkStacks: "层数",
    skillDeityMarkClass: "神谕者",
    skillBurnBoat: "背水一战",
    skillBurnBoatDesc: "牺牲当前10%生命值 → 生成护盾（背水一战）。激活期间：伤害加成。",
    skillBurnBoatLevel: "技能等级",
    skillBurnBoatLvBase: "基础 (+3%)", skillBurnBoatLvPlus: "基础+ (+8%)", skillBurnBoatLvAdv: "进阶 (+13%)", skillBurnBoatLvAdvPlus: "进阶+ (+13%)",
    skillBurnBoatHp: "最大生命值",
    skillBurnBoatHpPct: "当前生命值 %",
    skillBurnBoatHpLost: "损失生命值",
    skillBurnBoatShield: "预计护盾值",
    skillBurnBoatShieldMax: "护盾上限 (ATK×360%)",
    skillBurnBoatShieldFinal: "最终护盾值",
    skillBurnBoatShieldAdv: "进阶护盾上限 (ATK×630%)",
    skillBurnBoatDmgBonus: "已应用伤害加成",
    skillBurnBoatSubclassNote: "⚠ 进阶和进阶+需要征服者转职",
    skillDroneOfPeace: "和平无人机",
    skillDroneOfPeaceDesc: "跟随所有友方10秒，提供+5%伤害加成。每位友方只能被一架无人机跟随。",
    skillDroneOfPeaceClass: "枪手 / 指挥官",
    skillChargerTurret: "充能炮台",
    skillChargerTurretDesc: "被充能炮台治疗的友方获得【肾上腺素】：暂时提升+30%伤害加成。",
    skillChargerTurretClass: "枪手 / 指挥官",
    skillTruthShield: "真言护盾",
    skillTruthShieldDesc: "生成护盾：ATK×366% + 最大生命值×10%。激活期间：+5%伤害加成。",
    skillTruthShieldLevel: "技能等级",
    skillTruthShieldLvBase: "基础", skillTruthShieldLvPlus: "基础+ (+5% 伤害加成)", skillTruthShieldLvAdv: "进阶（气功大师）", skillTruthShieldLvAdvPlus: "进阶+（气功大师）",
    skillTruthShieldHp: "最大生命值",
    skillTruthShieldShield: "预计护盾值",
    skillTruthShieldShieldFinal: "最终护盾值",
    skillTruthShieldShieldPvP: "最终护盾值（PvP ×0.50）",
    skillTruthShieldDmgBonus: "已应用伤害加成",
    skillTruthShieldPvP: "PvP (×0.50)",
    skillTruthShieldSubclassNote: "⚠ 进阶需要气功大师转职",
    claseLabel: "当前职业：", claseMagic: "魔法", claseFisica: "物理",
    modoOlivia: "— Olivia模式",
    partnerOlivia: "❄️ Olivia", partnerIsabel: "🌿 Isabel",
    partnerOliviaDesc: "Olivia伤害计算器 — 独立属性，无PvP或职业加成。",
    partnerIsabelDesc: "治疗计算器 — 技能1。",
    isabelPopupTitle: "🌿 ISABEL — 技能1：森林祝福之地",
    isabelPopupBody: "此计算器仅涵盖技能1的治疗：<strong>森林祝福之地</strong>。<br/><br/>Isabel的其他技能暂未包含。",
    isabelPopupBtn: "明白了",
    partnerActive: "已激活", partnerInactive: "未激活",
    partnerLabel: "当前伙伴：",
    oliviaPopupTitle: "⚠ 警告 — OLIVIA伤害计算",
    oliviaPopupBody: [
      "<strong>Olivia</strong>的伤害公式仍在研究中。",
      "此计算器显示的结果可能<strong>不准确</strong>。",
      "仅供参考，请勿作为精确数值使用。",
    ],
    oliviaPopupConfirm: "明白，继续",
    oliviaPopupCancel: "取消",
    tenacityPopupTitle: "⚠ 提示 — 计算精度",
    tenacityPopupBody: [
      "<strong>坚韧</strong>的机制仍是个谜 — 目前尚不清楚它如何将属性转化为<strong>穿透减免</strong>和/或<strong>伤害加成</strong>。",
      "此计算器<strong>精度约为80%</strong>。结果可能因<strong>坚韧</strong>和/或战斗中<strong>实时属性变化</strong>而有所偏差。",
      "仅供参考，请勿作为精确数值使用。",
    ],
    tenacityPopupConfirm: "明白了",
    tenacityPopupBtn: "⚠ 精度说明",
    isabelTitle: "🌿 ISABEL — 技能1：森林祝福之地",
    isabelHpHint: "输入4位队友的生命值。Isabel是其中之一 — 她是唯一出战的，其他3位只提供属性。",
    isabelSumHp: "生命值总和（伙伴）",
    isabelBaseHeal: "基础治疗量",
    isabelPveTitle: "PvE — 每次治疗量（×3）",
    isabelPvpTitle: "PvP — 每次治疗量（×3）",
    isabelTotalPve: "PvE总计（3次）",
    isabelTotalPvp: "PvP总计（3次）",
    isabelHealReduction: "治疗减免总计（仅PvP）",
    oliviaCalcTitle: "❄️ OLIVIA — 伤害计算器",
    oliviaFlagCrit: "💥 暴击", oliviaFlagDebuff: "☠ 减益",
    oliviaFlagMagic: "✦ 魔法", oliviaFlagPhys: "🗡 物理",
    oliviaClaseLabel: "伤害类型：",
    oliviaAccPopupTitle: "⚠ 精度 — OLIVIA伤害计算",
    oliviaAccPopupBody: [
      "Olivia<strong>不使用坚韧</strong>，因此比主角更容易计算。",
      "然而，计算结果<strong>仍非100%准确</strong> — 可能存在尚未发现的变量或交互。",
      "仅供参考。",
    ],
    oliviaAccConfirm: "明白了",
    partnerMina: "🛡 Mina",
    partnerMinaDesc: "功能即将推出。",
    oliviaFlatBonus: "技能固定加成",
    oliviaAllyBuffs: "友方增益",
    oliviaAllyBuffsNone: "增益标签中没有激活的友方技能",
    oliviaPreRed: "神器减免前",
    oliviaArtRed: "Olivia神器减免（−25%）",
    oliviaLabels: {
      skill_flat_bonus:"技能固定加成",
      ataque:"基础攻击力", penetracion:"穿透", escaladohabilidad:"技能倍率",
      bonoDano:"伤害加成", bonoDanoFisico:"物理伤害加成", bonoDanoMagico:"魔法伤害加成",
      danoCritico:"暴击倍率", debuffDmg:"减益伤害", trueDmg:"真实伤害",
    },
    changelogBtn: "📋 更新日志",
    changelogTitle: "更新日志",
    changelog: [
      { version:"v2.3", date:"2026年4月", label:"公式错误修复",
        changes:[
          "错误修复：重击ATK命中概率公式不正确 — 可能超过100%",
          "新公式：概率 = 激活率 + (1−激活率) × max(0, 命中率−闪避率)，限制在[0%,100%]",
          "重击始终命中（不可避免）— 激活时计为100%命中",
          "普通攻击：有效命中 = max(0, 命中率−闪避率)",
          "错误修复：平坦属性（ATK）的百分比增益直接加了小数而非相乘",
          "修复：ATK的百分比增益现在正确计算：攻击力 × (1 + 数值%/100)",
          "同样的修复应用于防御方的平坦属性",
        ]
      },
      { version:"v2.2", date:"2026年4月", label:"中文语言与错误修复",
        changes:[
          "新增语言：🇨🇳 简体中文（ZH）— 所有文本完整翻译",
          "标题和韧性弹窗的语言切换中新增🇨🇳 ZH按钮",
          "错误修复：插入T.zh时initialAttacker定义被吸收进T对象",
          "错误修复：中文排版双引号导致ZH更新日志语法错误",
        ]
      },
      { version:"v2.1", date:"2026年4月", label:"重击效果",
        changes:[
          "重击ATK效果可应用于伤害 — ⚡重击标签中的开关",
          "将最终伤害乘以×(1 + 受到伤害增加/100)作为独立的最终乘数",
          "在结果面板中显示应用效果后的基础、减益和重击伤害",
          "Olivia：在其面板中独立的'应用重击ATK效果'开关",
          "Olivia使用⚡重击标签的属性 — 乘数实时更新",
          "两个开关均包含在构建分享（📤 分享）中",
        ]
      },
      { version:"v2.0", date:"2026年4月", label:"重大更新",
        changes:[
          "✦增益标签 — 手动增益/减益，按属性分组显示基础值和最终值",
          "9个职业技能手风琴 — 神谕者、铁锤者、格斗士和枪手已实现",
          "神谕者：神明印记（每层+2.5%伤害加成）和天使之盾（×0.50最终伤害）",
          "铁锤者：背水一战护盾计算器，基础/基础+/进阶/进阶+等级",
          "格斗士：真言护盾护盾计算器和PvP开关",
          "枪手：和平无人机（+5%伤害加成）和充能炮台（+30%伤害加成/肾上腺素）",
          "增益标签徽章显示激活的增益和技能总数",
          "实时计算 — PC端移除计算按钮，手机端显示查看结果按钮",
          "📤 分享按钮 — 生成包含完整配置的base64 URL",
          "Olivia的友方增益 — 包含神明印记、无人机、炮台和天使之盾的独立部分",
          "手机端标签栏分为两行各3个",
        ]
      },
      { version:"v1.1", date:"2026年3月", label:"完整版本",
        changes:[
          "结果显示中新增无暴击基础伤害",
          "根据情况更新暴击和减益的结果标签",
          "重击条更新：重击+暴击+减益",
          "打开Isabel面板时的信息弹窗",
          "Isabel标题中的?按钮说明需要输入的生命值",
          "净修正降低伤害时的视觉指示器",
          "属性保存到本地存储 — 会话间持久保存",
          "每个标签的↺重置按钮",
        ]
      },
    ],
    creditsTitle: "制作人员",
    creditsLines: [
      { label: "公式与机制", value: "xDarKz" },
      { label: "界面/React开发", value: "Claude (Anthropic)" },
      { label: "游戏", value: "云上城之歌" },
      { label: "版本", value: "v2.3" },
    ],
    isabelLabels: {
      isabel_skill_scaling_flat_bonus: "技能固定加成",
      isabel_skill_scaling: "技能倍率",
      partner_1_max_hp: "伙伴1最大生命值",
      partner_2_max_hp: "伙伴2最大生命值",
      partner_3_max_hp: "伙伴3最大生命值",
      partner_4_max_hp: "伙伴4最大生命值",
      pvp_healing_reducion: "PvP治疗减免（固定，仅PvP）",
      partners_healing_reduction: "神器治疗减免（固定，仅PvP）",
      healing_bonus: "治疗加成",
    },
    atkTabPopupTitle: "⚔ 标签 — 攻击方",
    atkTabPopupBody: "这里填入<strong>你的进攻属性</strong>。输入角色数值：攻击力、穿透、技能倍率、伤害加成、暴击等。",
    atkTabPopupBtn: "明白了",
    defTabPopupTitle: "🛡 标签 — 防御方",
    defTabPopupBody: "这里填入<strong>敌方的防御属性</strong>。输入对手数值：防御、穿透减免、伤害减免等。",
    defTabPopupBtn: "明白了",
    resetBtn: "↺ 重置",
    shareBtn: "📤 分享",
    shareCopied: "✓ 已复制",
    negModWarning: "⚠ 净修正正在降低你的伤害",
    calcBtn: "计算伤害",
    mobileShowResults: "查看结果 ▼",
    mobileShowInputs: "◀ 返回",
    emptyHint: "配置参数\n以查看结果",
    secBase: "基础计算链",
    secMods: "净修正",
    secChargedMods: "蓄力攻击修正",
    secFinal: "最终伤害",
    secChart: "可视化对比",
    secChargedAtk: "重击ATK — 强力攻击计算()",
    defPost: "穿透后防御", atkEff: "有效攻击力", danoBase: "基础伤害（×倍率）",
    modGeneral: "伤害加成/减免 总计", modMagic: "魔法伤害加成/减免", modPhys: "物理伤害加成/减免",
    modCrit: "净暴击", modDebuff: "净减益", debuffCancelled: "☠ 减益被抵消 — 敌方抵抗 ≥ 你的减益伤害", modPvP: "净PvP", modClass: "克制职业",
    modChargedDmg: "伤害加成（蓄力）", modChargedRed: "伤害减免（蓄力）",
    multTotal: "总乘数",
    danoNoCrit: "基础伤害",
    danoSinDebuff: "基础+暴击伤害（无减益，无重击）", danoConDebuff: "伤害+暴击+减益",
    heavyOnly: "重击 ×1.30", heavyNormal: "重击 ×1.30 + 暴击", heavyDebuff: "重击 ×1.30 + 暴击 + 减益",
    barNormal: "基础+暴击", barNoCritHeavy: "无暴击+重击", barCritHeavy: "暴击+重击",
    barBaseDebuff: "基础+减益", barBaseDebuffHeavy: "基础+减益+重击",
    barDebuff: "暴击+减益", barDebuffHeavy: "暴击+减益+重击", secChartDebuff: "减益伤害",
    probAcierto: "总命中概率", dmgRecibido: "重击ATK留下的'受到伤害增加'效果（减益）",
    heavyEffectToggle: "应用重击ATK效果",
    heavyEffectActive: "⚡ 重击效果已激活",
    secHeavyEffect: "重击ATK效果（受到伤害+%）",
    heavyEffectNote: "最终乘数，在所有计算之后应用",
    heavyInfoBtn: "❓ 重击ATK如何运作？",
    heavyInfoTitle: "机制 — 重击ATK",
    heavyInfoLines: [
      "⚡ <strong>重击ATK总是将最终伤害提升30%。</strong>",
      "🚫 这30%<strong>不适用</strong>于减益伤害加成 — 重击和减益是独立乘数。",
      "🛡 <strong>重击无法避免</strong> — 攻击不能被闪避或格挡。",
      "☠ 每对敌人施加<strong>20点重击ATK</strong>会触发<strong>每20点重击ATK +0.13%</strong>的受到伤害增加效果。",
      "⏱ 此效果持续<strong>3秒</strong>，CD约为<strong>3-5秒</strong>，并<strong>计为减益</strong>用于减益伤害加成。",
    ],
    footer: "战斗模拟 — 估算数值",
    caTitle: "蓄力攻击",
    caInput: "蓄力攻击数值",
    caActive: "已激活", caInactive: "未激活",
    caBonusDmg: "伤害加成", caRedDmg: "伤害减免",
    caTrueDmg: "额外真实伤害", caTrueDmgRed: "真实伤害减免",
    caFormula: "× 100蓄力 = 1%伤害加成  •  × 100蓄力 = 0.5%伤害减免\n× 1蓄力 = 1.5真实伤害（每层）  •  × 1蓄力 = 1真实伤害减免（每层）",
    caStacks: "蓄力层数",
    caStacksNote: "层数只影响真实伤害和真实伤害减免",
    caStackTotal: "真实伤害总计（层数）",
    caStackRedTotal: "真实伤害减免总计（层数）",
    popupTitle: "⚠ 警告 — 蓄力攻击",
    popupBody: [
      "蓄力攻击提供的<strong>伤害加成</strong>和<strong>伤害减免</strong><strong>仅在以下条件下激活</strong>：",
      "① 你必须累积<strong>3层蓄力攻击</strong>。",
      "② 以3层攻击有<strong>触发蓄力爆发的概率</strong>。",
      "③ 触发后，伤害加成/减免效果<strong>仅持续3秒</strong>。",
      "在此窗口之外，蓄力攻击<strong>仅</strong>提供每层真实伤害和真实伤害减免。",
    ],
    popupNote: "此计算器假设蓄力爆发在命中时处于激活状态。请相应调整蓄力攻击数值。",
    popupConfirm: "明白，继续",
    popupCancel: "取消",
    labels: {
      ataque:"基础攻击力", penetracion:"穿透", escaladohabilidad:"技能倍率",
      bonoDano:"伤害加成", bonoDanoFisico:"物理伤害加成", bonoDanoMagico:"魔法伤害加成",
      danoCritico:"暴击倍率", debuffDmg:"减益伤害", trueDmg:"真实伤害",
      pvpDmgBonus:"PvP加成", allClassesDmgBonus:"全职业加成",
      dmgToEnemyClass:"克制职业加成", charged_atk:"蓄力ATK",
      defensa:"基础防御力", reduccionPenetracion:"穿透减免",
      reduccionDano:"伤害减免（总）", reduccionDanoFisico:"物理伤害减免",
      reduccionDanoMagico:"魔法伤害减免", reduccionDanoCritico:"暴击伤害减免",
      reduccionDebuff:"减益抵抗", reduccionTrueDmg:"真实伤害减免",
      pvpDmgReduccion:"PvP减免", reduccionAllClassesDmg:"全职业减免",
      reduccionDmgFromClass:"特定职业减免",
      ataque_fuerte:"重击ATK强度", ataque_fuerte_porcentaje:"激活概率 %",
      hit_rate:"命中率（激活时）", evacion:"敌方闪避",
    },
  },
};

const initialAttacker = {
  ataque:56400, penetracion:0.884, escaladohabilidad:5.01,
  bonoDano:0.662+0.0990, bonoDanoFisico:0.40, bonoDanoMagico:0.40,
  danoCritico:0.620+0.50, debuffDmg:1.250, trueDmg:374,
  pvpDmgBonus:0.38, allClassesDmgBonus:0.35, dmgToEnemyClass:0.250,
};
const initialDefender = {
  defensa:70209, reduccionPenetracion:0.10, reduccionDano:0.681,
  reduccionDanoFisico:0.40, reduccionDanoMagico:0.402,
  reduccionDanoCritico:0.950, reduccionDebuff:0.507,
  reduccionTrueDmg:0.0, pvpDmgReduccion:0.38,
  reduccionAllClassesDmg:0.36, reduccionDmgFromClass:0.220,
};
const initialCharged = {
  ataque_fuerte:3500, ataque_fuerte_porcentaje:0.70, hit_rate:1.0, evacion:0.50,
};

const PCT_FIELDS = new Set([
  "penetracion","escaladohabilidad","bonoDano","bonoDanoFisico","bonoDanoMagico",
  "danoCritico","debuffDmg","pvpDmgBonus","allClassesDmgBonus","dmgToEnemyClass",
  "reduccionDano","reduccionDanoFisico","reduccionDanoMagico",
  "reduccionDanoCritico","reduccionDebuff","reduccionTrueDmg","pvpDmgReduccion",
  "reduccionAllClassesDmg","reduccionDmgFromClass",
  "ataque_fuerte_porcentaje","hit_rate","evacion",
]);

function calcChargedStats(val, stacks) {
  const bonusDmg           = (val / 100) * 0.01;
  const redDmg             = (val / 100) * 0.005;
  const trueDmgPerStack    = val * 1.5;
  const trueDmgRedPerStack = val * 1.0;
  return {
    bonusDmg, redDmg,
    trueDmgPerStack, trueDmgRedPerStack,
    trueDmgTotal:    trueDmgPerStack    * stacks,
    trueDmgRedTotal: trueDmgRedPerStack * stacks,
  };
}

function calcHeavy(danofinal_base, danofinal_with_debuff) {
  const heavy_raw = Math.abs(danofinal_base - danofinal_base * 1.30);
  return heavy_raw + danofinal_with_debuff;
}

function calcDamage({ atk, def, flags, charged, chargedAtkVal, chargedAtkActive, chargedStacks }) {
  const { isCrit, isDebuff, isPvP, isMagic, isPartner, isClass } = flags;
  const ca = chargedAtkActive
    ? calcChargedStats(chargedAtkVal, chargedStacks)
    : { bonusDmg:0, redDmg:0, trueDmgTotal:0, trueDmgRedTotal:0, trueDmgPerStack:0, trueDmgRedPerStack:0 };

  const effectiveBonoDano  = atk.bonoDano  + ca.bonusDmg;
  const effectiveReduccion = def.reduccionDano + ca.redDmg;

  const defensafinal = def.defensa * (1.0 - atk.penetracion);
  const ataquefinal  = atk.ataque - defensafinal;
  const danobase     = ataquefinal * atk.escaladohabilidad;

  const dmg_bonus    = effectiveBonoDano - effectiveReduccion;
  const dano_magico  = atk.bonoDanoMagico - def.reduccionDanoMagico;
  const dano_fisico  = atk.bonoDanoFisico - def.reduccionDanoFisico;
  const dano_tipo    = isMagic ? dano_magico : dano_fisico;
  const dano_critico = isCrit ? Math.max(0, atk.danoCritico - def.reduccionDanoCritico) : 0;
  const debuff_mod   = isDebuff ? Math.max(0, atk.debuffDmg - def.reduccionDebuff) : 0;
  const pvp_mod      = isPvP    ? atk.pvpDmgBonus - def.pvpDmgReduccion : 0;
  const class_mod    = (isPvP && isClass && !isPartner)
    ? Math.max(0, atk.dmgToEnemyClass - def.reduccionDmgFromClass) : 0;

  const multiplicador = isPartner
    ? dmg_bonus + dano_tipo
    : dmg_bonus + dano_tipo + dano_critico + pvp_mod + class_mod;

  const danofinal_nocrit = Math.max(0, danobase * (dmg_bonus + dano_tipo));
  const danofinal_base   = Math.max(0, danobase * multiplicador);
  const danofinal_debuff = isDebuff ? danofinal_base * (1 + debuff_mod) : danofinal_base;
  const heavy_calc       = calcHeavy(danofinal_base, isDebuff ? danofinal_base * (1 + debuff_mod) : danofinal_base);

  const prob_heavy   = Math.min(1, charged.ataque_fuerte_porcentaje);
  const hit_efectivo = Math.min(1, Math.max(0, charged.hit_rate - charged.evacion));
  const prob_acierto = Math.min(1, prob_heavy + (1 - prob_heavy) * hit_efectivo);
  const dmg_recibido = (charged.ataque_fuerte / 20) * 0.13;

  return {
    defensafinal, ataquefinal, danobase,
    dmg_bonus, dano_tipo, dano_critico, debuff_mod, pvp_mod, class_mod,
    multiplicador, danofinal_nocrit, danofinal_base, danofinal_debuff, heavy_calc,
    heavy_nocrit: danofinal_nocrit * 1.30,
    danofinal_base_debuff: isDebuff ? danofinal_nocrit * (1 + debuff_mod) : danofinal_nocrit,
    heavy_base_debuff: isDebuff ? danofinal_nocrit * (1 + debuff_mod) * 1.30 : danofinal_nocrit * 1.30,
    heavy_base: danofinal_base * 1.30,
    prob_acierto, dmg_recibido,
    ca, effectiveBonoDano, effectiveReduccion,
  };
}

// ── Popup component ────────────────────────────────────────────────────────
function ChargedWarningPopup({ t, onConfirm, onCancel }) {
  return (
    <div style={P.overlay}>
      <div style={P.modal}>
        {/* Decorative corner accents */}
        <div style={{...P.corner, top:0, left:0, borderTop:"2px solid #e05520", borderLeft:"2px solid #e05520"}}/>
        <div style={{...P.corner, top:0, right:0, borderTop:"2px solid #e05520", borderRight:"2px solid #e05520"}}/>
        <div style={{...P.corner, bottom:0, left:0, borderBottom:"2px solid #e05520", borderLeft:"2px solid #e05520"}}/>
        <div style={{...P.corner, bottom:0, right:0, borderBottom:"2px solid #e05520", borderRight:"2px solid #e05520"}}/>

        {/* Icon + Title */}
        <div style={P.titleRow}>
          <span style={P.warningIcon}>⚡</span>
          <span style={P.title}>{t.popupTitle}</span>
        </div>

        <div style={P.divider}/>

        {/* Body lines */}
        <div style={P.body}>
          {t.popupBody.map((line, i) => (
            <p key={i} style={{ ...P.line, ...(i === 0 ? P.lineFirst : {}) }}
              dangerouslySetInnerHTML={{ __html: line }}
            />
          ))}
        </div>

        {/* Note box */}
        <div style={P.noteBox}>
          <span style={P.noteIcon}>📋</span>
          <span style={P.noteText}>{t.popupNote}</span>
        </div>

        {/* Buttons */}
        <div style={P.btnRow}>
          <button style={P.cancelBtn} onClick={onCancel}>{t.popupCancel}</button>
          <button style={P.confirmBtn} onClick={onConfirm}>{t.popupConfirm}</button>
        </div>
      </div>
    </div>
  );
}

const P = {
  overlay:{
    position:"fixed", inset:0, zIndex:1000,
    background:"rgba(0,0,0,0.82)",
    display:"flex", alignItems:"center", justifyContent:"center",
    backdropFilter:"blur(3px)",
  },
  modal:{
    position:"relative",
    background:"#0f0d09",
    border:"1px solid #3a2510",
    borderRadius:4,
    padding:"24px 20px",
    maxWidth:520,
    width:"92%",
    maxHeight:"90vh",
    overflowY:"auto",
    boxShadow:"0 0 60px rgba(220,84,24,0.2), 0 0 120px rgba(0,0,0,0.8)",
  },
  corner:{ position:"absolute", width:16, height:16 },
  titleRow:{ display:"flex", alignItems:"center", gap:14, marginBottom:18 },
  warningIcon:{ fontSize:28, filter:"drop-shadow(0 0 8px rgba(220,84,24,0.8))" },
  title:{ fontSize:16, fontWeight:900, letterSpacing:"0.12em", color:"#f0c060", fontFamily:"'Courier New',monospace" },
  divider:{ height:1, background:"linear-gradient(90deg,#e05520,transparent)", marginBottom:20 },
  body:{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 },
  line:{ margin:0, fontSize:13, color:"#c0b090", lineHeight:1.75, fontFamily:"'Courier New',monospace" },
  lineFirst:{ color:"#d6cfc4", fontSize:14 },
  noteBox:{
    background:"rgba(124,58,237,0.1)",
    border:"1px solid #4a2a7a",
    borderRadius:3,
    padding:"12px 16px",
    display:"flex", gap:10, alignItems:"flex-start",
    marginBottom:26,
  },
  noteIcon:{ fontSize:16, flexShrink:0, marginTop:1 },
  noteText:{ fontSize:12, color:"#a090c0", lineHeight:1.7, fontFamily:"'Courier New',monospace" },
  btnRow:{ display:"flex", gap:10, justifyContent:"flex-end" },
  cancelBtn:{
    padding:"10px 22px",
    background:"transparent",
    border:"1px solid #3a2510",
    color:"#7a6030",
    cursor:"pointer",
    borderRadius:2,
    fontFamily:"'Courier New',monospace",
    fontSize:12,
    fontWeight:700,
    letterSpacing:"0.1em",
    transition:"all 0.15s",
  },
  confirmBtn:{
    padding:"10px 22px",
    background:"linear-gradient(135deg,#7a1212,#e05520)",
    border:"none",
    color:"#fff",
    cursor:"pointer",
    borderRadius:2,
    fontFamily:"'Courier New',monospace",
    fontSize:12,
    fontWeight:900,
    letterSpacing:"0.12em",
    boxShadow:"0 0 16px rgba(220,84,24,0.35)",
    transition:"all 0.15s",
  },
};

// ── StatInput ──────────────────────────────────────────────────────────────
function StatInput({ label, field, value, onChange, isPercent }) {
  const mob = useContext(MobileCtx);
  const disp = isPercent ? +(value * 100).toFixed(4) : value;
  return (
    <div style={S.sRow}>
      <span style={{...S.sLbl, width: mob ? 150 : 180, fontSize: mob ? 11 : 12}}>{label}</span>
      <div style={S.sWrap}>
        <input type="number" style={{...S.sInput, width: mob ? 82 : 95, fontSize: mob ? 13 : 14}} value={disp}
          step={isPercent ? "0.1" : "100"}
          onChange={e => { const v = parseFloat(e.target.value)||0; onChange(field, isPercent ? v/100 : v); }}
        />
        {isPercent && <span style={S.sPct}>%</span>}
      </div>
    </div>
  );
}

function Mod({ label, val }) {
  const c = val > 0 ? "#6ee7a0" : val < 0 ? "#fca5a5" : "#7a7a7a";
  return (
    <div style={S.mRow}>
      <span style={S.mLbl}>{label}</span>
      <span style={{ color:c, fontFamily:"monospace", fontSize:14, fontWeight:600 }}>
        {val>0?"▲":val<0?"▼":"●"} {(Math.abs(val)*100).toFixed(2)}%
      </span>
    </div>
  );
}

function RRow({ label, value, color, size, bold }) {
  return (
    <div style={S.rRow}>
      <span style={{ ...S.rLbl, fontWeight:bold?700:400 }}>{label}</span>
      <span style={{ color:color||"#d6cfc4", fontSize:size||15, fontWeight:bold?700:400, fontFamily:"monospace" }}>
        {typeof value==="number" ? Math.round(value).toLocaleString("es-ES") : value}
      </span>
    </div>
  );
}

function SecTitle({ children }) {
  return <div style={S.secTitle}>{children}</div>;
}

function StackSelector({ stacks, setStacks }) {
  return (
    <div style={S.stackRow}>
      {[1,2,3].map(n => (
        <button key={n} onClick={() => setStacks(n)}
          style={{ ...S.stackBtn, ...(stacks===n ? S.stackOn : {}) }}>
          {"🔋".repeat(n)}
          <span style={{ display:"block", fontSize:12, marginTop:3 }}>×{n}</span>
        </button>
      ))}
    </div>
  );
}

function ChargedAtkPanel({ t, chargedAtkVal, setChargedAtkVal, chargedAtkActive, onToggle, chargedStacks, setChargedStacks }) {
  const ca = calcChargedStats(chargedAtkVal, chargedStacks);
  return (
    <div style={S.caPanel}>
      <div style={S.caToggleRow}>
        <span style={S.caToggleLbl}>{t.caTitle}</span>
        <button onClick={onToggle}
          style={{ ...S.caToggleBtn, ...(chargedAtkActive ? S.caToggleOn : {}) }}>
          {chargedAtkActive ? `⚡ ${t.caActive}` : `○ ${t.caInactive}`}
        </button>
      </div>

      <div style={{ ...S.sRow, marginTop:14 }}>
        <span style={S.sLbl}>{t.caInput}</span>
        <input type="number" min="0" step="10"
          style={{ ...S.sInput, width:110, opacity:chargedAtkActive?1:0.4 }}
          disabled={!chargedAtkActive}
          value={chargedAtkVal}
          onChange={e => setChargedAtkVal(Math.max(0, parseFloat(e.target.value)||0))}
        />
      </div>

      <div style={S.caFormula}>{t.caFormula}</div>

      <div style={{ ...S.caStackSection, opacity:chargedAtkActive?1:0.4 }}>
        <div style={S.caStackHeader}>
          <span style={S.caStackTitle}>{t.caStacks}</span>
          <span style={S.caStackNote}>{t.caStacksNote}</span>
        </div>
        <StackSelector stacks={chargedStacks} setStacks={chargedAtkActive ? setChargedStacks : ()=>{}} />
      </div>

      <div style={{ ...S.caPreview, opacity:chargedAtkActive?1:0.35 }}>
        <div style={S.caStatRow}>
          <span style={S.caStatLbl}>{t.caBonusDmg}</span>
          <span style={{ color:"#6ee7a0", fontFamily:"monospace", fontSize:14, fontWeight:700 }}>
            +{(ca.bonusDmg*100).toFixed(2)}%
          </span>
        </div>
        <div style={S.caStatRow}>
          <span style={S.caStatLbl}>{t.caRedDmg}</span>
          <span style={{ color:"#fca5a5", fontFamily:"monospace", fontSize:14, fontWeight:700 }}>
            +{(ca.redDmg*100).toFixed(2)}%
          </span>
        </div>
        <div style={{ ...S.caStatRow, borderTop:"1px solid #2a1a4a", marginTop:4, paddingTop:6 }}>
          <span style={S.caStatLbl}>{t.caTrueDmg} (×{chargedStacks})</span>
          <span style={{ color:"#c4b5fd", fontFamily:"monospace", fontSize:14, fontWeight:700 }}>
            +{ca.trueDmgTotal.toFixed(1)}
          </span>
        </div>
        <div style={S.caStatRow}>
          <span style={S.caStatLbl}>{t.caTrueDmgRed} (×{chargedStacks})</span>
          <span style={{ color:"#93c5fd", fontFamily:"monospace", fontSize:14, fontWeight:700 }}>
            +{ca.trueDmgRedTotal.toFixed(1)}
          </span>
        </div>
      </div>

      <div style={S.caBarWrap}>
        <div style={S.caBarTrack}>
          <div style={{
            ...S.caBarFill,
            width:`${Math.min(100,(chargedAtkVal/1000)*100)}%`,
            background: chargedAtkActive ? "linear-gradient(90deg,#1d4ed8,#7c3aed,#c84a18)" : "#222",
          }}/>
        </div>
        <span style={S.caBarLabel}>{chargedAtkVal} / 1000</span>
      </div>
    </div>
  );
}


// ── Buffs Panel ────────────────────────────────────────────────────────────
const ATK_STATS = ["ataque","bonoDano","danoCritico"];
const PCT_ONLY_STATS = new Set(["bonoDano","danoCritico","reduccionDano","reduccionDanoCritico"]);
const DEF_STATS = ["reduccionDano","reduccionDanoCritico"];

function BuffsPanel({ t, buffs, setBuffs, atk, def, onCalc, angelicShieldActive, setAngelicShieldActive, deityMarkStacks, setDeityMarkStacks, burnBoatLevel, setBurnBoatLevel, burnBoatMaxHp, setBurnBoatMaxHp, burnBoatHpPct, setBurnBoatHpPct, burnBoatActive, setBurnBoatActive, truthShieldActive, setTruthShieldActive, truthShieldLevel, setTruthShieldLevel, truthShieldMaxHp, setTruthShieldMaxHp, truthShieldPvP, setTruthShieldPvP, droneOfPeaceActive, setDroneOfPeaceActive, chargerTurretActive, setChargerTurretActive }) {
  const isMobile = useContext(MobileCtx);
  const [mobileBuffsView, setMobileBuffsView] = useState("add");
  const totalActive = buffs.length + (deityMarkStacks>0?1:0) + (angelicShieldActive?1:0) + (burnBoatActive?1:0) + (truthShieldActive?1:0);
  const [target, setTarget] = useState("atk");
  const [stat,   setStat]   = useState("ataque");
  const [type,   setType]   = useState("flat");
  const [value,  setValue]  = useState("");
  const [buffName, setBuffName] = useState("");

  const statOptions = target === "atk" ? ATK_STATS : DEF_STATS;
  const isPctOnly = PCT_ONLY_STATS.has(stat);
  useEffect(() => { if (PCT_ONLY_STATS.has(stat)) setType("pct"); }, [stat]);

  const addBuff = () => {
    if(!value || isNaN(Number(value))) return;
    setBuffs(p => [...p, { id: Date.now(), target, stat, type, value: Number(value), name: buffName.trim() }]);
    setValue("");
    setBuffName("");
  };

  const removeBuff = (id) => setBuffs(p => p.filter(b => b.id !== id));

  const buffColor = (v) => Number(v) >= 0 ? "#6ee7a0" : "#fca5a5";
  const buffSign  = (v) => Number(v) >= 0 ? "▲" : "▼";

  return (
    <div style={{padding:"0"}}>
      {/* MOBILE SUB-TABS */}
      {isMobile && (
        <div style={{display:"flex",borderBottom:"1px solid #1e1408"}}>
          {[["add",t.buffsTabAdd],["active",t.buffsTabActive+(totalActive>0?` (${totalActive})`:"")] ].map(([k,l])=>(
            <button key={k} onClick={()=>setMobileBuffsView(k)} style={{
              flex:1, padding:"10px 4px", background:"transparent", border:"none", outline:"none",
              cursor:"pointer", fontFamily:"inherit", fontSize:11, letterSpacing:"0.04em",
              borderBottom: mobileBuffsView===k ? "2px solid #c08840" : "2px solid transparent",
              color: mobileBuffsView===k ? "#f0c060" : "#6a5030",
              background: mobileBuffsView===k ? "rgba(200,160,40,0.06)" : "transparent",
            }}>{l}</button>
          ))}
        </div>
      )}

      {/* ADD VIEW — always on PC, toggle on mobile */}
      {(!isMobile || mobileBuffsView==="add") && <div style={{padding:"14px 18px"}}>
      {/* KNOWN SKILLS ACCORDION */}
      <div style={{fontSize:11,color:"#c08840",letterSpacing:"0.2em",borderLeft:"3px solid #c08840",paddingLeft:9,marginBottom:12}}>{t.skillsTitle}</div>
      <SkillsAccordion t={t} angelicShieldActive={angelicShieldActive} setAngelicShieldActive={setAngelicShieldActive} deityMarkStacks={deityMarkStacks} setDeityMarkStacks={setDeityMarkStacks} burnBoatLevel={burnBoatLevel} setBurnBoatLevel={setBurnBoatLevel} burnBoatMaxHp={burnBoatMaxHp} setBurnBoatMaxHp={setBurnBoatMaxHp} burnBoatHpPct={burnBoatHpPct} setBurnBoatHpPct={setBurnBoatHpPct} burnBoatActive={burnBoatActive} setBurnBoatActive={setBurnBoatActive} truthShieldActive={truthShieldActive} setTruthShieldActive={setTruthShieldActive} truthShieldLevel={truthShieldLevel} setTruthShieldLevel={setTruthShieldLevel} truthShieldMaxHp={truthShieldMaxHp} setTruthShieldMaxHp={setTruthShieldMaxHp} truthShieldPvP={truthShieldPvP} setTruthShieldPvP={setTruthShieldPvP} droneOfPeaceActive={droneOfPeaceActive} setDroneOfPeaceActive={setDroneOfPeaceActive} chargerTurretActive={chargerTurretActive} setChargerTurretActive={setChargerTurretActive} atk={atk} />

      <div style={{fontSize:11,color:"#c08840",letterSpacing:"0.2em",borderLeft:"3px solid #c08840",paddingLeft:9,marginBottom:16}}>{t.buffsTitle}</div>

      {/* Add form */}
      <div style={{background:"rgba(200,160,40,0.05)",border:"1px solid #2a1e08",borderRadius:3,padding:"12px 14px",marginBottom:16,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {/* Target */}
          <div style={{display:"flex",flexDirection:"column",gap:4,flex:1,minWidth:100}}>
            <span style={{fontSize:10,color:"#7a6030",letterSpacing:"0.1em"}}>{t.buffsTarget}</span>
            <select value={target} onChange={e=>{setTarget(e.target.value);setStat(e.target.value==="atk"?"ataque":"defensa");}}
              style={{background:"#0d0a06",border:"1px solid #3a2510",color:"#f0c060",fontFamily:"inherit",fontSize:12,padding:"5px 8px",borderRadius:2,outline:"none"}}>
              <option value="atk">{t.buffsTargetAtk}</option>
              <option value="def">{t.buffsTargetDef}</option>
            </select>
          </div>
          {/* Stat */}
          <div style={{display:"flex",flexDirection:"column",gap:4,flex:2,minWidth:140}}>
            <span style={{fontSize:10,color:"#7a6030",letterSpacing:"0.1em"}}>{t.buffsStat}</span>
            <select value={stat} onChange={e=>setStat(e.target.value)}
              style={{background:"#0d0a06",border:"1px solid #3a2510",color:"#f0c060",fontFamily:"inherit",fontSize:12,padding:"5px 8px",borderRadius:2,outline:"none"}}>
              {statOptions.map(s=>(
                <option key={s} value={s}>{t.labels[s]||s}</option>
              ))}
            </select>
          </div>
          {/* Type */}
          <div style={{display:"flex",flexDirection:"column",gap:4,flex:1,minWidth:100}}>
            <span style={{fontSize:10,color:"#7a6030",letterSpacing:"0.1em"}}>Tipo</span>
            <select value={type} onChange={e=>setType(e.target.value)} disabled={isPctOnly}
              style={{background:"#0d0a06",border:"1px solid #3a2510",color:isPctOnly?"#6a5030":"#f0c060",fontFamily:"inherit",fontSize:12,padding:"5px 8px",borderRadius:2,outline:"none",cursor:isPctOnly?"not-allowed":"pointer"}}>
              <option value="flat" disabled={isPctOnly}>{t.buffsTypeFlat}</option>
              <option value="pct">{t.buffsTypePct}</option>
            </select>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          <span style={{fontSize:10,color:"#7a6030",letterSpacing:"0.1em"}}>{t.buffsName}</span>
          <input type="text" value={buffName} onChange={e=>setBuffName(e.target.value)}
            placeholder="ej: Buff de Isabel / debuff torre..."
            style={{background:"#0d0a06",border:"1px solid #3a2510",color:"#f0c060",fontFamily:"inherit",fontSize:12,padding:"5px 9px",borderRadius:2,outline:"none",width:"100%"}}/>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <div style={{display:"flex",flexDirection:"column",gap:4,flex:1}}>
            <span style={{fontSize:10,color:"#7a6030",letterSpacing:"0.1em"}}>{t.buffsValue} {type==="pct"?"(%)":"(plano)"}</span>
            <input type="number" value={value} onChange={e=>setValue(e.target.value)}
              placeholder={type==="pct"?"+10 / -10":"+5000 / -5000"}
              style={{background:"#0d0a06",border:"1px solid #3a2510",color:"#f0c060",fontFamily:"inherit",fontSize:14,padding:"6px 9px",borderRadius:2,outline:"none",width:"100%"}}/>
          </div>
          <button onClick={addBuff}
            style={{padding:"8px 18px",background:"linear-gradient(135deg,#7a1212,#e05520)",border:"none",borderRadius:2,color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:700,letterSpacing:"0.1em",cursor:"pointer",flexShrink:0}}>
            {t.buffsAddBtn}
          </button>
        </div>
      </div>

      <button onClick={onCalc}
        style={{margin:"12px 0 0",padding:"15px",background:"linear-gradient(135deg,#7a1212,#e05520)",border:"none",borderRadius:2,cursor:"pointer",color:"#fff",fontSize:13,fontWeight:900,letterSpacing:"0.18em",fontFamily:"inherit",width:"100%"}}>
        {t.buffsCalcBtn}
      </button>

      </div>}

      {/* ACTIVE VIEW — mobile only */}
      {isMobile && mobileBuffsView==="active" && (
        <BuffsActivePanel t={t} buffs={buffs} setBuffs={setBuffs} atk={atk} def={def}
          deityMarkStacks={deityMarkStacks} angelicShieldActive={angelicShieldActive}
          burnBoatLevel={burnBoatLevel} burnBoatMaxHp={burnBoatMaxHp} burnBoatHpPct={burnBoatHpPct}
          buffedAtk={null} burnBoatActive={burnBoatActive}
          truthShieldActive={truthShieldActive} truthShieldLevel={truthShieldLevel}
          truthShieldMaxHp={truthShieldMaxHp} truthShieldPvP={truthShieldPvP}
          droneOfPeaceActive={droneOfPeaceActive} chargerTurretActive={chargerTurretActive} />
      )}

    </div>
  );
}


// ── Buffs Active Panel (right side) ───────────────────────────────────────
function BuffsActivePanel({ t, buffs, setBuffs, atk, def, deityMarkStacks, angelicShieldActive, burnBoatLevel, burnBoatMaxHp, burnBoatHpPct, buffedAtk, burnBoatActive, truthShieldActive, truthShieldLevel, truthShieldMaxHp, truthShieldPvP, droneOfPeaceActive, chargerTurretActive }) {
  const removeBuff = (id) => setBuffs(p => p.filter(b => b.id !== id));

  // Group buffs by target+stat
  const grouped = {};
  buffs.forEach(b => {
    const key = b.target + ":" + b.stat;
    if (!grouped[key]) grouped[key] = { target: b.target, stat: b.stat, items: [] };
    grouped[key].items.push(b);
  });

  const getBase = (target, stat) => {
    const src = target === "atk" ? atk : def;
    return src[stat] ?? 0;
  };

  const calcFinal = (base, items) => {
    const sumFlat = items.filter(b=>b.type==="flat").reduce((s,b)=>s+Number(b.value),0);
    const sumPct  = items.filter(b=>b.type==="pct").reduce((s,b)=>s+Number(b.value)/100,0);
    return (base + sumFlat) * (1 + sumPct);
  };

  const isPct = (stat) => PCT_FIELDS.has(stat);

  const fmtVal = (v, pct) => pct
    ? (v*100).toFixed(2)+"%"
    : Math.round(v).toLocaleString("es-ES");

  const renderGroup = (key) => {
    const g = grouped[key];
    const base = getBase(g.target, g.stat);
    const final = calcFinal(base, g.items);
    const hasChange = Math.abs(final - base) > 0.001;
    const isPositive = final >= base;

    return (
      <div key={key} style={{marginBottom:12,background:"rgba(255,255,255,0.02)",border:"1px solid #1e1408",borderRadius:3,padding:"10px 12px"}}>
        {/* Stat header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:10,padding:"2px 6px",borderRadius:2,
              background:g.target==="atk"?"rgba(220,84,24,0.15)":"rgba(59,130,246,0.15)",
              color:g.target==="atk"?"#f0a060":"#60a5fa",letterSpacing:"0.08em"}}>
              {g.target==="atk"?t.buffsTargetAtk:t.buffsTargetDef}
            </span>
            <span style={{fontSize:12,color:"#c0a070",fontWeight:700,letterSpacing:"0.08em"}}>
              {t.labels[g.stat]||g.stat}
            </span>
          </div>
          <span style={{fontSize:11,color:"#5a4020",fontFamily:"monospace"}}>
            BASE: {fmtVal(base, isPct(g.stat))}
          </span>
        </div>
        {/* Individual buff lines */}
        {g.items.map(b => (
          <div key={b.id} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0 3px 12px",borderLeft:"2px solid "+(Number(b.value)>=0?"#3a5a30":"#5a2020")}}>
            <span style={{fontFamily:"monospace",fontSize:12,color:Number(b.value)>=0?"#6ee7a0":"#fca5a5",flexShrink:0}}>
              {Number(b.value)>=0?"▲":"▼"} {Math.abs(b.value)}{b.type==="pct"?"%":""}
            </span>
            {b.name && <span style={{fontSize:11,color:"#fcd34d",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.name}</span>}
            <button onClick={()=>removeBuff(b.id)}
              style={{background:"transparent",border:"none",color:"#5a3020",cursor:"pointer",fontSize:14,padding:"0 2px",lineHeight:1,marginLeft:"auto",flexShrink:0}}>
              ✕
            </button>
          </div>
        ))}
        {/* Divider + Final */}
        {hasChange && (
          <div style={{borderTop:"1px solid #2a1e08",marginTop:8,paddingTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:10,color:"#7a6030",letterSpacing:"0.1em"}}>FINAL</span>
            <span style={{fontFamily:"monospace",fontSize:14,fontWeight:900,color:isPositive?"#6ee7a0":"#fca5a5"}}>
              {fmtVal(final, isPct(g.stat))}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{padding:"18px 20px",flex:1,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:11,color:"#c08840",letterSpacing:"0.2em",borderLeft:"3px solid #c08840",paddingLeft:9}}>{t.buffsActiveTitle} ({buffs.length})</div>
        {buffs.length > 0 && (
          <button onClick={()=>setBuffs([])}
            style={{background:"transparent",border:"1px solid #3a2510",color:"#a08040",cursor:"pointer",fontFamily:"inherit",fontSize:11,padding:"3px 10px",borderRadius:2}}>
            {t.buffsResetBtn}
          </button>
        )}
      </div>
      {/* Active skills summary */}
      {(deityMarkStacks > 0 || angelicShieldActive || burnBoatActive || truthShieldActive || droneOfPeaceActive || chargerTurretActive) && (
        <div style={{marginBottom:12,display:"flex",flexDirection:"column",gap:6}}>
          <div style={{fontSize:10,color:"#c08840",letterSpacing:"0.15em",borderLeft:"3px solid #c08840",paddingLeft:9,marginBottom:4}}>{t.skillsTitle}</div>

          {/* Deity Mark */}
          {deityMarkStacks > 0 && (
            <div style={{background:"rgba(200,160,40,0.05)",border:"1px solid #2a1e08",borderRadius:3,padding:"7px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#fcd34d"}}>{t.skillDeityMark} ×{deityMarkStacks}</span>
              <span style={{fontFamily:"monospace",fontSize:12,color:"#6ee7a0",fontWeight:700}}>▲ +{(deityMarkStacks*2.5).toFixed(1)}% bonoDano</span>
            </div>
          )}

          {/* Burn the Boats */}
          {burnBoatActive && (() => {
            const BURN = {"base":3,"base+":8,"advanced":13,"advanced+":13};
            const isAdv = burnBoatLevel==="advanced"||burnBoatLevel==="advanced+";
            const atkVal = atk?.ataque||0;
            const hpAct = burnBoatMaxHp*(burnBoatHpPct/100);
            const hpLostAct = burnBoatMaxHp - hpAct;
            const shieldC = hpLostAct*0.20+994;
            const shieldMx = atkVal*(isAdv?6.30:3.60);
            const shield = burnBoatMaxHp>0 ? Math.min(Math.max(shieldC, hpAct*0.10), shieldMx) : null;
            return (
              <div style={{background:"rgba(200,160,40,0.05)",border:"1px solid #2a1e08",borderRadius:3,padding:"7px 10px",display:"flex",flexDirection:"column",gap:5}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#fcd34d",fontWeight:700}}>{t.skillBurnBoat} ({burnBoatLevel})</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingLeft:8,borderLeft:"2px solid #3a5a30"}}>
                  <span style={{fontSize:11,color:"#8a7045"}}>bonoDano</span>
                  <span style={{fontFamily:"monospace",fontSize:12,color:"#6ee7a0",fontWeight:700}}>▲ +{BURN[burnBoatLevel]}%</span>
                </div>
                {shield !== null
                  ? <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingLeft:8,borderLeft:"2px solid #1e3a5a"}}>
                      <span style={{fontSize:11,color:"#8a7045"}}>{t.skillBurnBoatShieldFinal}</span>
                      <span style={{fontFamily:"monospace",fontSize:12,color:"#60a5fa",fontWeight:700}}>{Math.round(shield).toLocaleString("es-ES")}</span>
                    </div>
                  : <div style={{fontSize:10,color:"#4a3820",fontStyle:"italic",paddingLeft:8}}>{t.skillBurnBoatHp} →</div>
                }
              </div>
            );
          })()}

          {/* Truth Shield */}
          {truthShieldActive && (() => {
            const isAdv = truthShieldLevel==="advanced"||truthShieldLevel==="advanced+";
            const atkVal = atk?.ataque||0;
            const shield = Math.round(atkVal*(isAdv?4.758:3.66) + truthShieldMaxHp*(isAdv?0.13:0.10));
            return (
              <div style={{background:"rgba(200,160,40,0.05)",border:"1px solid #2a1e08",borderRadius:3,padding:"7px 10px",display:"flex",flexDirection:"column",gap:4}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#fcd34d",fontWeight:700}}>{t.skillTruthShield} ({truthShieldLevel})</span>
                </div>
                {(truthShieldLevel!=="base") && (
                  <div style={{display:"flex",justifyContent:"space-between",paddingLeft:8,borderLeft:"2px solid #3a5a30"}}>
                    <span style={{fontSize:11,color:"#8a7045"}}>bonoDano</span>
                    <span style={{fontFamily:"monospace",fontSize:12,color:"#6ee7a0",fontWeight:700}}>▲ +5%</span>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",paddingLeft:8,borderLeft:"2px solid #1e3a5a"}}>
                  <span style={{fontSize:11,color:"#8a7045"}}>{t.skillTruthShieldShieldFinal}</span>
                  <span style={{fontFamily:"monospace",fontSize:12,color:"#60a5fa",fontWeight:700}}>{shield.toLocaleString("es-ES")}</span>
                </div>
                {truthShieldPvP && (
                  <div style={{display:"flex",justifyContent:"space-between",paddingLeft:8,borderLeft:"2px solid #5a1a1a"}}>
                    <span style={{fontSize:11,color:"#8a7045"}}>PvP</span>
                    <span style={{fontFamily:"monospace",fontSize:12,color:"#f87171",fontWeight:700}}>{Math.round(shield*0.5).toLocaleString("es-ES")}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Angelic Shield */}
          {angelicShieldActive && (
            <div style={{background:"rgba(248,113,113,0.06)",border:"1px solid #7f1d1d",borderRadius:3,padding:"7px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#f87171"}}>{t.skillAngelicShield}</span>
              <span style={{fontFamily:"monospace",fontSize:12,color:"#f87171",fontWeight:700}}>×0.50 daño final</span>
            </div>
          )}

          {/* Drone of Peace */}
          {droneOfPeaceActive && (
            <div style={{background:"rgba(200,160,40,0.05)",border:"1px solid #2a1e08",borderRadius:3,padding:"7px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#fcd34d"}}>{t.skillDroneOfPeace}</span>
              <span style={{fontFamily:"monospace",fontSize:12,color:"#6ee7a0",fontWeight:700}}>▲ +5% bonoDano</span>
            </div>
          )}

          {/* Charger Turret */}
          {chargerTurretActive && (
            <div style={{background:"rgba(200,160,40,0.05)",border:"1px solid #2a1e08",borderRadius:3,padding:"7px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#fcd34d"}}>{t.skillChargerTurret}</span>
              <span style={{fontFamily:"monospace",fontSize:12,color:"#6ee7a0",fontWeight:700}}>▲ +30% bonoDano</span>
            </div>
          )}
        </div>
      )}

      {buffs.length === 0 && !(deityMarkStacks > 0 || angelicShieldActive || burnBoatActive || truthShieldActive) && (
        <div style={{textAlign:"center",color:"#3a2e18",fontSize:13,padding:"40px 0",fontStyle:"italic"}}>{t.buffsEmpty}</div>
      )}
      {Object.keys(grouped).map(renderGroup)}
    </div>
  );
}


// ── Skills Accordion ──────────────────────────────────────────────────────
const CLASS_ORDER = ["swordsman","rogue","bow","gunner","ironbreaker","mage","oracle","combatant","reaper"];

function SkillsAccordion({ t, angelicShieldActive, setAngelicShieldActive, deityMarkStacks, setDeityMarkStacks, burnBoatLevel, setBurnBoatLevel, burnBoatMaxHp, setBurnBoatMaxHp, burnBoatHpPct, setBurnBoatHpPct, burnBoatActive, setBurnBoatActive, truthShieldActive, setTruthShieldActive, truthShieldLevel, setTruthShieldLevel, truthShieldMaxHp, setTruthShieldMaxHp, truthShieldPvP, setTruthShieldPvP, droneOfPeaceActive, setDroneOfPeaceActive, chargerTurretActive, setChargerTurretActive, atk }) {
  const [openClass, setOpenClass] = useState(null);

  const toggle = (cls) => setOpenClass(p => p === cls ? null : cls);

  const hasSkills = (cls) => cls === "oracle" || cls === "ironbreaker" || cls === "combatant" || cls === "gunner";

  const renderSkills = (cls) => {
    if (cls === "gunner") {
      const skillStyle = {background:"rgba(200,160,40,0.04)",border:"1px solid #2a1e08",borderRadius:3,padding:"10px 12px"};
      const toggleBtn = (active, onClick) => ({
        padding:"4px 12px", borderRadius:2,
        border:`1px solid ${active?"#6ee7a0":"#3a2510"}`,
        background: active?"rgba(110,231,160,0.12)":"transparent",
        color: active?"#6ee7a0":"#6a5030",
        cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:700, outline:"none",
      });
      return (
        <div style={{padding:"10px 14px 8px",display:"flex",flexDirection:"column",gap:10}}>
          {/* Drone of Peace */}
          <div style={skillStyle}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontSize:12,color:"#fcd34d",fontWeight:700}}>{t.skillDroneOfPeace}</div>
              <button onClick={()=>setDroneOfPeaceActive(p=>!p)} style={toggleBtn(droneOfPeaceActive)}>
                {droneOfPeaceActive?"✓ ON":"OFF"}
              </button>
            </div>
            <div style={{fontSize:10,color:"#6a5030",marginBottom:6}}>{t.skillDroneOfPeaceDesc}</div>
            <div style={{fontSize:10,color:"#5a4828",fontStyle:"italic",marginBottom:droneOfPeaceActive?8:0}}>{t.skillDroneOfPeaceClass}</div>
            {droneOfPeaceActive && (
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6ee7a0",borderTop:"1px solid #2a1e08",paddingTop:6}}>
                <span>Bono de Daño aplicado</span>
                <span style={{fontFamily:"monospace",fontWeight:700}}>▲ +5% bonoDano</span>
              </div>
            )}
          </div>
          {/* Charger Turret */}
          <div style={skillStyle}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontSize:12,color:"#fcd34d",fontWeight:700}}>{t.skillChargerTurret}</div>
              <button onClick={()=>setChargerTurretActive(p=>!p)} style={toggleBtn(chargerTurretActive)}>
                {chargerTurretActive?"✓ ON":"OFF"}
              </button>
            </div>
            <div style={{fontSize:10,color:"#6a5030",marginBottom:6}}>{t.skillChargerTurretDesc}</div>
            <div style={{fontSize:10,color:"#5a4828",fontStyle:"italic",marginBottom:chargerTurretActive?8:0}}>{t.skillChargerTurretClass}</div>
            {chargerTurretActive && (
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6ee7a0",borderTop:"1px solid #2a1e08",paddingTop:6}}>
                <span>Bono de Daño aplicado</span>
                <span style={{fontFamily:"monospace",fontWeight:700}}>▲ +30% bonoDano</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    if (cls === "ironbreaker") {
      const BONUS = {base:0.03, "base+":0.08, advanced:0.13, "advanced+":0.13};
      const isAdv = burnBoatLevel === "advanced" || burnBoatLevel === "advanced+";
      const atkVal = atk?.ataque || 0;
      const hpActual = burnBoatMaxHp * (burnBoatHpPct / 100);
      const hpLost = burnBoatMaxHp - hpActual;
      const shieldCalc = hpLost * 0.20 + 994;
      const shieldMin = hpActual * 0.10;
      const shieldMax = atkVal * (isAdv ? 6.30 : 3.60);
      const shieldFinal = Math.min(Math.max(shieldCalc, shieldMin), shieldMax);
      const dmgBonus = BONUS[burnBoatLevel] || 0;
      const levels = [
        {key:"base", label:t.skillBurnBoatLvBase},
        {key:"base+", label:t.skillBurnBoatLvPlus},
        {key:"advanced", label:t.skillBurnBoatLvAdv},
        {key:"advanced+", label:t.skillBurnBoatLvAdvPlus},
      ];
      return (
        <div style={{padding:"10px 14px 8px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:"rgba(200,160,40,0.04)",border:"1px solid #2a1e08",borderRadius:3,padding:"10px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontSize:12,color:"#fcd34d",fontWeight:700}}>{t.skillBurnBoat}</div>
              <button onClick={()=>setBurnBoatActive(p=>!p)}
                style={{padding:"4px 12px",borderRadius:2,border:"1px solid "+(burnBoatActive?"#6ee7a0":"#3a2510"),background:burnBoatActive?"rgba(110,231,160,0.12)":"transparent",color:burnBoatActive?"#6ee7a0":"#6a5030",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,outline:"none"}}>
                {burnBoatActive?"✓ ON":"OFF"}
              </button>
            </div>
            <div style={{fontSize:10,color:"#6a5030",marginBottom:10}}>{t.skillBurnBoatDesc}</div>

            {/* Level selector */}
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:"#7a6030",letterSpacing:"0.1em",marginBottom:6}}>{t.skillBurnBoatLevel}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {levels.map(lv=>(
                  <button key={lv.key} onClick={()=>setBurnBoatLevel(lv.key)}
                    style={{padding:"4px 8px",borderRadius:2,border:"1px solid "+(burnBoatLevel===lv.key?"#fcd34d":"#3a2510"),background:burnBoatLevel===lv.key?"rgba(252,211,77,0.12)":"transparent",color:burnBoatLevel===lv.key?"#fcd34d":"#6a5030",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,outline:"none"}}>
                    {lv.label}
                  </button>
                ))}
              </div>
              {isAdv && <div style={{fontSize:9,color:"#f87171",marginTop:4,fontStyle:"italic"}}>{t.skillBurnBoatSubclassNote}</div>}
            </div>

            {/* HP inputs */}
            <div style={{marginBottom:10,display:"flex",flexDirection:"column",gap:8}}>
              <div>
                <div style={{fontSize:10,color:"#7a6030",letterSpacing:"0.1em",marginBottom:4}}>{t.skillBurnBoatHp}</div>
                <input type="number" value={burnBoatMaxHp||""} onChange={e=>setBurnBoatMaxHp(parseFloat(e.target.value)||0)}
                  placeholder="ej: 2500000"
                  style={{background:"#0d0a06",border:"1px solid #3a2510",color:"#f0c060",fontFamily:"inherit",fontSize:13,padding:"5px 9px",borderRadius:2,outline:"none",width:"100%",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#7a6030",letterSpacing:"0.1em",marginBottom:4}}>
                  <span>{t.skillBurnBoatHpPct}</span>
                  <span style={{color:"#f0c060",fontFamily:"monospace"}}>{burnBoatHpPct}%</span>
                </div>
                <input type="range" min="1" max="99" value={burnBoatHpPct} onChange={e=>setBurnBoatHpPct(Number(e.target.value))}
                  style={{width:"100%",accentColor:"#e05520",cursor:"pointer"}}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#4a3820",marginTop:2}}>
                  <span>1% ← más escudo</span>
                  <span>menos escudo → 100%</span>
                </div>
              </div>
            </div>

            {/* Shield results */}
            {burnBoatMaxHp > 0 && (
              <div style={{borderTop:"1px solid #2a1e08",paddingTop:8,display:"flex",flexDirection:"column",gap:4}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#8a7045"}}>
                  <span>{t.skillBurnBoatHpLost}</span>
                  <span style={{fontFamily:"monospace",color:"#fca5a5"}}>{Math.round(hpLost).toLocaleString("es-ES")}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#8a7045"}}>
                  <span>{t.skillBurnBoatShield}</span>
                  <span style={{fontFamily:"monospace",color:"#94a3b8"}}>{Math.round(shieldCalc).toLocaleString("es-ES")}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#8a7045"}}>
                  <span>{isAdv ? t.skillBurnBoatShieldAdv : t.skillBurnBoatShieldMax}</span>
                  <span style={{fontFamily:"monospace",color:"#94a3b8"}}>{Math.round(shieldMax).toLocaleString("es-ES")}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#60a5fa",borderTop:"1px solid #2a1e08",paddingTop:6,marginTop:2}}>
                  <span style={{fontWeight:700}}>{t.skillBurnBoatShieldFinal}{shieldFinal>=shieldMax&&burnBoatMaxHp>0?" ⚠ CAP":""}</span>
                  <span style={{fontFamily:"monospace",fontWeight:900}}>{Math.round(shieldFinal).toLocaleString("es-ES")}</span>
                </div>
                {shieldFinal>=shieldMax&&burnBoatMaxHp>0&&<div style={{fontSize:9,color:"#fcd34d",fontStyle:"italic"}}>Tope de ATK×{isAdv?"630":"360"}% alcanzado</div>}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6ee7a0",marginTop:2}}>
                  <span>{t.skillBurnBoatDmgBonus}</span>
                  <span style={{fontFamily:"monospace",fontWeight:700}}>▲ +{(dmgBonus*100).toFixed(0)}% bonoDano</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (cls === "combatant") {
      const isAdv = truthShieldLevel === "advanced" || truthShieldLevel === "advanced+";
      const hasBonus = truthShieldLevel !== "base";
      const atkVal = atk?.ataque || 0;
      const atkMult = isAdv ? 4.758 : 3.66;
      const hpMult = isAdv ? 0.13 : 0.10;
      const shieldCalc = atkVal * atkMult + truthShieldMaxHp * hpMult;
      const shieldPvP = shieldCalc * 0.50;
      const levels = [
        {key:"base", label:t.skillTruthShieldLvBase},
        {key:"base+", label:t.skillTruthShieldLvPlus},
        {key:"advanced", label:t.skillTruthShieldLvAdv},
        {key:"advanced+", label:t.skillTruthShieldLvAdvPlus},
      ];
      return (
        <div style={{padding:"10px 14px 8px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:"rgba(200,160,40,0.04)",border:"1px solid #2a1e08",borderRadius:3,padding:"10px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontSize:12,color:"#fcd34d",fontWeight:700}}>{t.skillTruthShield}</div>
              <button onClick={()=>setTruthShieldActive(p=>!p)}
                style={{padding:"4px 12px",borderRadius:2,border:"1px solid "+(truthShieldActive?"#6ee7a0":"#3a2510"),background:truthShieldActive?"rgba(110,231,160,0.12)":"transparent",color:truthShieldActive?"#6ee7a0":"#6a5030",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,outline:"none"}}>
                {truthShieldActive?"✓ ON":"OFF"}
              </button>
            </div>
            <div style={{fontSize:10,color:"#6a5030",marginBottom:10}}>{t.skillTruthShieldDesc}</div>

            {/* Level */}
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:"#7a6030",letterSpacing:"0.1em",marginBottom:6}}>{t.skillTruthShieldLevel}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {levels.map(lv=>(
                  <button key={lv.key} onClick={()=>setTruthShieldLevel(lv.key)}
                    style={{padding:"4px 8px",borderRadius:2,border:"1px solid "+(truthShieldLevel===lv.key?"#fcd34d":"#3a2510"),background:truthShieldLevel===lv.key?"rgba(252,211,77,0.12)":"transparent",color:truthShieldLevel===lv.key?"#fcd34d":"#6a5030",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,outline:"none"}}>
                    {lv.label}
                  </button>
                ))}
              </div>
              {isAdv && <div style={{fontSize:9,color:"#f87171",marginTop:4,fontStyle:"italic"}}>{t.skillTruthShieldSubclassNote}</div>}
            </div>

            {/* Max HP input */}
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:"#7a6030",letterSpacing:"0.1em",marginBottom:4}}>{t.skillTruthShieldHp}</div>
              <input type="number" value={truthShieldMaxHp||""} onChange={e=>setTruthShieldMaxHp(parseFloat(e.target.value)||0)}
                placeholder="ej: 2500000"
                style={{background:"#0d0a06",border:"1px solid #3a2510",color:"#f0c060",fontFamily:"inherit",fontSize:13,padding:"5px 9px",borderRadius:2,outline:"none",width:"100%",boxSizing:"border-box"}}/>
            </div>

            {/* Results */}
            {(truthShieldMaxHp > 0 || atkVal > 0) && (
              <div style={{borderTop:"1px solid #2a1e08",paddingTop:8,display:"flex",flexDirection:"column",gap:4}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#8a7045"}}>
                  <span>{t.skillTruthShieldShield}</span>
                  <span style={{fontFamily:"monospace",color:"#94a3b8"}}>{Math.round(shieldCalc).toLocaleString("es-ES")}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#60a5fa",borderTop:"1px solid #2a1e08",paddingTop:6,marginTop:2}}>
                  <span style={{fontWeight:700}}>{t.skillTruthShieldShieldFinal}</span>
                  <span style={{fontFamily:"monospace",fontWeight:900}}>{Math.round(shieldCalc).toLocaleString("es-ES")}</span>
                </div>
                {/* PvP toggle */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
                  <span style={{fontSize:10,color:"#7a6030",letterSpacing:"0.1em"}}>{t.skillTruthShieldPvP}</span>
                  <button onClick={()=>setTruthShieldPvP(p=>!p)}
                    style={{padding:"3px 10px",borderRadius:2,border:"1px solid "+(truthShieldPvP?"#f87171":"#3a2510"),background:truthShieldPvP?"rgba(248,113,113,0.12)":"transparent",color:truthShieldPvP?"#f87171":"#6a5030",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,outline:"none"}}>
                    {truthShieldPvP?"✓ ON":"OFF"}
                  </button>
                </div>
                {truthShieldPvP && (
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#f87171",borderTop:"1px solid #2a1e08",paddingTop:6,marginTop:2}}>
                    <span style={{fontWeight:700}}>{t.skillTruthShieldShieldPvP}</span>
                    <span style={{fontFamily:"monospace",fontWeight:900}}>{Math.round(shieldPvP).toLocaleString("es-ES")}</span>
                  </div>
                )}
                {hasBonus && truthShieldActive && (
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6ee7a0",marginTop:2}}>
                    <span>{t.skillTruthShieldDmgBonus}</span>
                    <span style={{fontFamily:"monospace",fontWeight:700}}>▲ +5% bonoDano</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (cls === "oracle") return (
      <div style={{padding:"10px 14px 4px",display:"flex",flexDirection:"column",gap:10}}>

        {/* Deity Mark */}
        <div style={{background:"rgba(200,160,40,0.04)",border:"1px solid #2a1e08",borderRadius:3,padding:"10px 12px"}}>
          <div style={{fontSize:12,color:"#fcd34d",fontWeight:700,marginBottom:4}}>{t.skillDeityMark}</div>
          <div style={{fontSize:10,color:"#6a5030",marginBottom:8}}>{t.skillDeityMarkDesc}</div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:"#7a6030",letterSpacing:"0.1em"}}>{t.skillDeityMarkStacks}</span>
            {[0,1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>setDeityMarkStacks(n)}
                style={{width:26,height:26,borderRadius:2,border:"1px solid "+(deityMarkStacks===n?"#fcd34d":"#3a2510"),background:deityMarkStacks===n?"rgba(252,211,77,0.15)":"transparent",color:deityMarkStacks===n?"#fcd34d":"#6a5030",cursor:"pointer",fontFamily:"monospace",fontSize:12,fontWeight:700,outline:"none"}}>
                {n}
              </button>
            ))}
            {deityMarkStacks>0 && <span style={{fontSize:11,color:"#6ee7a0",fontFamily:"monospace"}}>▲ +{(deityMarkStacks*2.5).toFixed(1)}%</span>}
          </div>
        </div>

        {/* Angelic Shield */}
        <div style={{background:"rgba(200,160,40,0.04)",border:"1px solid #2a1e08",borderRadius:3,padding:"10px 12px",marginBottom:4}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:12,color:"#fcd34d",fontWeight:700}}>{t.skillAngelicShield}</div>
            <button onClick={()=>setAngelicShieldActive(p=>!p)}
              style={{padding:"4px 12px",borderRadius:2,border:"1px solid "+(angelicShieldActive?"#f87171":"#3a2510"),background:angelicShieldActive?"rgba(248,113,113,0.15)":"transparent",color:angelicShieldActive?"#f87171":"#6a5030",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,outline:"none"}}>
              {angelicShieldActive?"✓ ON":"OFF"}
            </button>
          </div>
          <div style={{fontSize:10,color:"#6a5030"}}>{t.skillAngelicShieldDesc}</div>
          {angelicShieldActive && <div style={{fontSize:10,color:"#f87171",marginTop:5,fontStyle:"italic"}}>{t.skillAngelicShieldActive}</div>}
        </div>

      </div>
    );
    return (
      <div style={{padding:"10px 14px",fontSize:11,color:"#3a2e18",fontStyle:"italic"}}>{t.skillsComingSoon}</div>
    );
  };

  return (
    <div style={{marginBottom:16,display:"flex",flexDirection:"column",gap:4}}>
      {CLASS_ORDER.map(cls => (
        <div key={cls} style={{border:"1px solid "+(openClass===cls?"#3a2e18":"#1e1408"),borderRadius:3,overflow:"hidden"}}>
          <button onClick={()=>toggle(cls)} style={{
            width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"8px 12px",background:openClass===cls?"rgba(200,160,40,0.06)":"transparent",
            border:"none",cursor:"pointer",fontFamily:"inherit",outline:"none",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:openClass===cls?"#f0c060":"#8a7045",fontWeight:700,letterSpacing:"0.06em"}}>
                {t.classes[cls]}
              </span>
              {hasSkills(cls) && <span style={{fontSize:9,padding:"1px 5px",borderRadius:10,background:"rgba(220,84,24,0.2)",color:"#e05520",letterSpacing:"0.08em"}}>●</span>}
            </div>
            <span style={{fontSize:10,color:"#5a4020"}}>{openClass===cls?"▲":"▼"}</span>
          </button>
          {openClass===cls && renderSkills(cls)}
        </div>
      ))}
    </div>
  );
}


// ── Changelog Popup ───────────────────────────────────────────────────────
function ChangelogPopup({ t, onClose }) {
  const versionColors = {
    "v2.3":"#f0c060", "v2.2":"#e0b050", "v2.1":"#c89838", "v2.0":"#b08030",
    "v0.9.1":"#86efac", "v0.9":"#fcd34d", "v0.8":"#fb923c", "v0.6":"#a78bfa", "v0.5":"#f87171",
    "v0.4":"#60a5fa", "v0.3":"#34d399", "v0.2":"#fb923c", "v0.1":"#94a3b8",
  };
  return (
    <div style={P.overlay} onClick={onClose}>
      <div style={{...P.modal, maxWidth:600, padding:"24px 28px", maxHeight:"85vh", overflowY:"auto"}}
        onClick={e => e.stopPropagation()}>
        <div style={{...P.corner, top:0, left:0, borderTop:"2px solid #ca8a04", borderLeft:"2px solid #ca8a04"}}/>
        <div style={{...P.corner, top:0, right:0, borderTop:"2px solid #ca8a04", borderRight:"2px solid #ca8a04"}}/>
        <div style={{...P.corner, bottom:0, left:0, borderBottom:"2px solid #ca8a04", borderLeft:"2px solid #ca8a04"}}/>
        <div style={{...P.corner, bottom:0, right:0, borderBottom:"2px solid #ca8a04", borderRight:"2px solid #ca8a04"}}/>

        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18}}>
          <div style={P.titleRow}>
            <span style={{...P.warningIcon, filter:"drop-shadow(0 0 8px rgba(202,138,4,0.6))"}}>📋</span>
            <span style={{...P.title, color:"#fcd34d"}}>{t.changelogTitle}</span>
          </div>
          <button onClick={onClose} style={{background:"transparent", border:"none", color:"#6a5030", cursor:"pointer", fontSize:20, fontFamily:"inherit"}}>✕</button>
        </div>
        <div style={{...P.divider, background:"linear-gradient(90deg,#ca8a04,transparent)", marginBottom:20}}/>

        {t.changelog.map((v, vi) => (
          <div key={v.version} style={{marginBottom: vi < t.changelog.length-1 ? 22 : 0}}>
            {/* Version header */}
            <div style={{display:"flex", alignItems:"baseline", gap:10, marginBottom:10}}>
              <span style={{
                fontFamily:"monospace", fontSize:15, fontWeight:900,
                color: versionColors[v.version] || "#fcd34d",
                textShadow:`0 0 12px ${versionColors[v.version]}44`,
              }}>{v.version}</span>
              <span style={{fontSize:12, color:"#7a6030", fontWeight:700, letterSpacing:"0.1em"}}>{v.label}</span>
              <span style={{fontSize:11, color:"#4a3820", marginLeft:"auto"}}>{v.date}</span>
            </div>
            {/* Changes list */}
            <div style={{borderLeft:"2px solid #2a1e08", paddingLeft:14, display:"flex", flexDirection:"column", gap:5}}>
              {v.changes.map((c, ci) => (
                <div key={ci} style={{display:"flex", gap:8, alignItems:"flex-start"}}>
                  <span style={{color: versionColors[v.version] || "#fcd34d", fontSize:10, marginTop:3, flexShrink:0}}>◆</span>
                  <span style={{fontSize:12, color:"#b0a080", lineHeight:1.6, fontFamily:"'Courier New',monospace"}}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{...P.btnRow, justifyContent:"center", marginTop:24}}>
          <button style={{...P.confirmBtn, background:"linear-gradient(135deg,#78350f,#ca8a04)", padding:"10px 36px"}} onClick={onClose}>
            {t.oliviaAccConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tenacity Warning Popup ────────────────────────────────────────────────
function TenacityPopup({ t, lang, setLang, onClose }) {
  return (
    <div style={P.overlay}>
      <div style={P.modal}>
        <div style={{...P.corner, top:0, left:0, borderTop:"2px solid #ca8a04", borderLeft:"2px solid #ca8a04"}}/>
        <div style={{...P.corner, top:0, right:0, borderTop:"2px solid #ca8a04", borderRight:"2px solid #ca8a04"}}/>
        <div style={{...P.corner, bottom:0, left:0, borderBottom:"2px solid #ca8a04", borderLeft:"2px solid #ca8a04"}}/>
        <div style={{...P.corner, bottom:0, right:0, borderBottom:"2px solid #ca8a04", borderRight:"2px solid #ca8a04"}}/>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18}}>
          <div style={P.titleRow}>
            <span style={{...P.warningIcon, filter:"drop-shadow(0 0 8px rgba(202,138,4,0.8))"}}>⚠</span>
            <span style={{...P.title, color:"#fcd34d"}}>{t.tenacityPopupTitle}</span>
          </div>
          <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4}}>
            <span style={{fontSize:10, color:"#6a5030", letterSpacing:"0.15em"}}>{lang==="es"?"IDIOMA": lang==="zh"?"语言" :"LANGUAGE"}</span>
            <div style={{display:"flex", gap:5}}>
              {["es","en","zh"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding:"5px 11px", background: lang===l ? "rgba(202,138,4,0.22)" : "#0d0a06",
                  border: lang===l ? "1px solid #ca8a04" : "1px solid #3a2510",
                  color: lang===l ? "#fcd34d" : "#6a5030",
                  cursor:"pointer", borderRadius:2, fontFamily:"inherit", fontSize:12, fontWeight:700,
                }}>
                  {l==="es" ? "🇪🇸 ES" : l==="zh" ? "🇨🇳 ZH" : "🇺🇸 EN"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{...P.divider, background:"linear-gradient(90deg,#ca8a04,transparent)"}}/>
        <div style={P.body}>
          {t.tenacityPopupBody.map((line, i) => (
            <p key={i} style={{ ...P.line, ...(i === 0 ? P.lineFirst : {}) }}
              dangerouslySetInnerHTML={{ __html: line }}
            />
          ))}
        </div>
        <div style={{...P.noteBox, background:"rgba(202,138,4,0.08)", border:"1px solid #4a3800"}}>
          <span style={P.noteIcon}>🔍</span>
          <span style={{...P.noteText, color:"#fbbf24"}}>
            Guardians of Cloudia — Damage Calculator v2.3
          </span>
        </div>
        <div style={{...P.btnRow, justifyContent:"center"}}>
          <button style={{...P.confirmBtn, background:"linear-gradient(135deg,#78350f,#ca8a04)", boxShadow:"0 0 16px rgba(202,138,4,0.35)", padding:"11px 40px"}} onClick={onClose}>
            {t.tenacityPopupConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Olivia Warning Popup ───────────────────────────────────────────────────
function OliviaWarningPopup({ t, onConfirm, onCancel }) {
  return (
    <div style={P.overlay}>
      <div style={P.modal}>
        <div style={{...P.corner, top:0, left:0, borderTop:"2px solid #2563eb", borderLeft:"2px solid #2563eb"}}/>
        <div style={{...P.corner, top:0, right:0, borderTop:"2px solid #2563eb", borderRight:"2px solid #2563eb"}}/>
        <div style={{...P.corner, bottom:0, left:0, borderBottom:"2px solid #2563eb", borderLeft:"2px solid #2563eb"}}/>
        <div style={{...P.corner, bottom:0, right:0, borderBottom:"2px solid #2563eb", borderRight:"2px solid #2563eb"}}/>
        <div style={P.titleRow}>
          <span style={{...P.warningIcon, filter:"drop-shadow(0 0 8px rgba(96,165,250,0.8))"}}>🤝</span>
          <span style={{...P.title, color:"#93c5fd"}}>{t.oliviaPopupTitle}</span>
        </div>
        <div style={{...P.divider, background:"linear-gradient(90deg,#2563eb,transparent)"}}/>
        <div style={P.body}>
          {t.oliviaPopupBody.map((line, i) => (
            <p key={i} style={{ ...P.line, ...(i === 0 ? P.lineFirst : {}) }}
              dangerouslySetInnerHTML={{ __html: line }}
            />
          ))}
        </div>
        <div style={{...P.noteBox, background:"rgba(37,99,235,0.08)", border:"1px solid #1d3a6a"}}>
          <span style={P.noteIcon}>🔬</span>
          <span style={{...P.noteText, color:"#93c5fd"}}>
            {t.oliviaPopupBody[2]}
          </span>
        </div>
        <div style={P.btnRow}>
          <button style={P.cancelBtn} onClick={onCancel}>{t.oliviaPopupCancel}</button>
          <button style={{...P.confirmBtn, background:"linear-gradient(135deg,#1e3a8a,#2563eb)", boxShadow:"0 0 16px rgba(37,99,235,0.35)"}} onClick={onConfirm}>{t.oliviaPopupConfirm}</button>
        </div>
      </div>
    </div>
  );
}


// ── Info Tab Popup ────────────────────────────────────────────────────────
function InfoTabPopup({ title, body, btnLabel, accentColor, onClose }) {
  return (
    <div style={{...P.overlay, background:"rgba(0,0,0,0.55)"}} onClick={onClose}>
      <div style={{...P.modal, maxWidth:420, padding:"26px 28px"}} onClick={e=>e.stopPropagation()}>
        <div style={{...P.corner, top:0, left:0, borderTop:`2px solid ${accentColor}`, borderLeft:`2px solid ${accentColor}`}}/>
        <div style={{...P.corner, top:0, right:0, borderTop:`2px solid ${accentColor}`, borderRight:`2px solid ${accentColor}`}}/>
        <div style={{...P.corner, bottom:0, left:0, borderBottom:`2px solid ${accentColor}`, borderLeft:`2px solid ${accentColor}`}}/>
        <div style={{...P.corner, bottom:0, right:0, borderBottom:`2px solid ${accentColor}`, borderRight:`2px solid ${accentColor}`}}/>
        <div style={P.titleRow}>
          <span style={{...P.title, color:accentColor, fontSize:15}}>{title}</span>
        </div>
        <div style={{...P.divider, background:`linear-gradient(90deg,${accentColor},transparent)`, marginBottom:16}}/>
        <p style={{fontSize:13, color:"#b0a080", lineHeight:1.8, fontFamily:"'Courier New',monospace", margin:"0 0 22px"}}
          dangerouslySetInnerHTML={{__html: body}} />
        <div style={{...P.btnRow, justifyContent:"center"}}>
          <button style={{...P.confirmBtn, background:`linear-gradient(135deg,#3a1a08,${accentColor})`, padding:"10px 36px", boxShadow:`0 0 14px ${accentColor}44`}} onClick={onClose}>
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Olivia Accuracy Popup ─────────────────────────────────────────────────
function OliviaAccuracyPopup({ t, onClose }) {
  return (
    <div style={P.overlay}>
      <div style={P.modal}>
        <div style={{...P.corner, top:0, left:0, borderTop:"2px solid #60a5fa", borderLeft:"2px solid #60a5fa"}}/>
        <div style={{...P.corner, top:0, right:0, borderTop:"2px solid #60a5fa", borderRight:"2px solid #60a5fa"}}/>
        <div style={{...P.corner, bottom:0, left:0, borderBottom:"2px solid #60a5fa", borderLeft:"2px solid #60a5fa"}}/>
        <div style={{...P.corner, bottom:0, right:0, borderBottom:"2px solid #60a5fa", borderRight:"2px solid #60a5fa"}}/>
        <div style={P.titleRow}>
          <span style={{...P.warningIcon, filter:"drop-shadow(0 0 8px rgba(96,165,250,0.8))"}}>❄️</span>
          <span style={{...P.title, color:"#93c5fd"}}>{t.oliviaAccPopupTitle}</span>
        </div>
        <div style={{...P.divider, background:"linear-gradient(90deg,#2563eb,transparent)"}}/>
        <div style={P.body}>
          {t.oliviaAccPopupBody.map((line, i) => (
            <p key={i} style={{...P.line, ...(i===0 ? P.lineFirst : {})}}
              dangerouslySetInnerHTML={{ __html: line }} />
          ))}
        </div>
        <div style={{...P.btnRow, justifyContent:"center"}}>
          <button style={{...P.confirmBtn, background:"linear-gradient(135deg,#1e3a8a,#2563eb)", boxShadow:"0 0 16px rgba(37,99,235,0.35)", padding:"11px 40px"}} onClick={onClose}>
            {t.oliviaAccConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Olivia Damage Panel ───────────────────────────────────────────────────
const initialOlivia = {
  skill_flat_bonus: 0,
  ataque: 56400,
  penetracion: 0.884,
  escaladohabilidad: 5.01,
  bonoDano: 0.662 + 0.0990,
  bonoDanoMagico: 0.40,
  danoCritico: 0.620 + 0.50,
  debuffDmg: 1.250,
  trueDmg: 374,
};

const OLIVIA_PCT = new Set([
  "penetracion","escaladohabilidad","bonoDano","bonoDanoMagico",
  "danoCritico","debuffDmg",
]);

function calcOliviaDamage({ atk, def, isCrit, isDebuff }) {
  const OLIVIA_ARTIFACT_REDUCTION = 0.25;
  const defensafinal = def.defensa * (1.0 - atk.penetracion);
  const ataquefinal  = atk.ataque - defensafinal;
  const danobase     = ataquefinal * atk.escaladohabilidad;

  const dmg_bonus    = atk.bonoDano - def.reduccionDano;
  const dano_magico  = atk.bonoDanoMagico - def.reduccionDanoMagico;
  const dano_critico = isCrit   ? (atk.danoCritico - def.reduccionDanoCritico) : 0;
  const debuff_mod   = isDebuff ? (atk.debuffDmg   - def.reduccionDebuff)       : 0;

  const multiplicador    = dmg_bonus + dano_magico + dano_critico;
  const danofinal_nocrit = danobase * (dmg_bonus + dano_magico) * (1 - OLIVIA_ARTIFACT_REDUCTION) + (atk.skill_flat_bonus || 0);
  const danofinal_pre    = danobase * multiplicador;
  const danofinal_base   = danofinal_pre * (1 - OLIVIA_ARTIFACT_REDUCTION) + (atk.skill_flat_bonus || 0);
  const danofinal_debuff = isDebuff ? danofinal_base * (1 + debuff_mod) : danofinal_base;
  const heavy_calc       = calcHeavy(danofinal_base, isDebuff ? danofinal_base * (1 + debuff_mod) : danofinal_base);

  return {
    defensafinal, ataquefinal, danobase, dmg_bonus, dano_magico, dano_critico, debuff_mod, multiplicador,
    danofinal_nocrit, danofinal_pre, danofinal_base, danofinal_debuff, heavy_calc, OLIVIA_ARTIFACT_REDUCTION,
    heavy_nocrit: danofinal_nocrit * 1.30,
    heavy_base: danofinal_base * 1.30,
    danofinal_base_debuff: isDebuff ? danofinal_nocrit * (1 + debuff_mod) : danofinal_nocrit,
    heavy_base_debuff: isDebuff ? danofinal_nocrit * (1 + debuff_mod) * 1.30 : danofinal_nocrit * 1.30,
  };
}

function OliviaPanel({ t, def, stats, setStats, deityMarkStacks, setDeityMarkStacks, angelicShieldActive, setAngelicShieldActive, droneActive, setDroneActive, chargerTurretActive, setChargerTurretActive, globalDeityMarkStacks, globalAngelicShieldActive, globalDroneActive, globalChargerTurretActive, heavyEffectActive, setHeavyEffectActive, dmgRecibido }) {
  const [isCrit,   setIsCrit]   = useState(true);
  const [isDebuff, setIsDebuff] = useState(false);
  const res = useMemo(() => calcOliviaDamage({ atk: stats, def, isCrit, isDebuff }), [stats, def, isCrit, isDebuff]);
  const us = (f, v) => setStats(p => ({...p, [f]: v}));

  const anyGlobalAllyBuff = globalDeityMarkStacks > 0 || globalAngelicShieldActive || globalDroneActive || globalChargerTurretActive;

  const toggleBtn = (active, onClick) => ({
    padding:"3px 10px", borderRadius:2, cursor:"pointer", fontFamily:"inherit",
    fontSize:11, fontWeight:700, outline:"none",
    border:`1px solid ${active?"#6ee7a0":"#3a2510"}`,
    background: active?"rgba(110,231,160,0.12)":"transparent",
    color: active?"#6ee7a0":"#6a5030",
  });


  return (
    <div style={{ padding:"14px 20px" }}>
      <div style={S.isabelHeader}>{t.oliviaCalcTitle}</div>

      {/* Stat inputs */}
      {Object.keys(initialOlivia).map(f => {
        const isPct = OLIVIA_PCT.has(f);
        const disp  = isPct ? +(stats[f] * 100).toFixed(4) : stats[f];
        return (
          <div key={f} style={S.sRow}>
            <span style={S.sLbl}>{t.oliviaLabels[f]}</span>
            <div style={S.sWrap}>
              <input type="number" style={S.sInput} value={disp}
                step={isPct ? "0.1" : "100"}
                onChange={e => { const v = parseFloat(e.target.value)||0; us(f, isPct ? v/100 : v); }}
              />
              {isPct && <span style={S.sPct}>%</span>}
            </div>
          </div>
        );
      })}

      {/* Toggles */}
      <div style={{ marginTop:14, marginBottom:4 }}>
        <div style={S.flagTitle}>{t.conditions}</div>
        <div style={S.flagGrid}>
          <button style={{...S.flag,...(isCrit?S.flagOn:{})}} onClick={()=>setIsCrit(p=>!p)}>{t.oliviaFlagCrit}</button>
          <button style={{...S.flag,...(isDebuff?S.flagOn:{})}} onClick={()=>setIsDebuff(p=>!p)}>{t.oliviaFlagDebuff}</button>
          <span style={{fontSize:12,color:"#c4b5fd",padding:"4px 10px",border:"1px solid #3a1a5a",borderRadius:2}}>✦ {t.claseMagic}</span>
        </div>
      </div>

      {/* Ally buffs section */}
      <div style={{marginTop:14,marginBottom:4}}>
        <div style={{fontSize:11,color:"#c08840",letterSpacing:"0.15em",borderLeft:"3px solid #c08840",paddingLeft:9,marginBottom:10}}>{t.oliviaAllyBuffs}</div>
        {!anyGlobalAllyBuff ? (
          <div style={{fontSize:11,color:"#3a2e18",fontStyle:"italic",padding:"6px 10px"}}>{t.oliviaAllyBuffsNone}</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:6}}>

            {/* Deity Mark */}
            {globalDeityMarkStacks > 0 && (
              <div style={{background:"rgba(200,160,40,0.05)",border:"1px solid #2a1e08",borderRadius:3,padding:"8px 10px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom: deityMarkStacks>0?6:0}}>
                  <span style={{fontSize:11,color:"#fcd34d",fontWeight:700}}>{t.skillDeityMark}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {[0,1,2,3,4,5].filter(n=>n<=globalDeityMarkStacks).map(n=>(
                      <button key={n} onClick={()=>setDeityMarkStacks(n)}
                        style={{width:22,height:22,borderRadius:2,border:`1px solid ${deityMarkStacks===n?"#fcd34d":"#3a2510"}`,background:deityMarkStacks===n?"rgba(252,211,77,0.15)":"transparent",color:deityMarkStacks===n?"#fcd34d":"#6a5030",cursor:"pointer",fontFamily:"monospace",fontSize:11,fontWeight:700,outline:"none"}}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                {deityMarkStacks > 0 && (
                  <div style={{fontSize:11,color:"#6ee7a0",fontFamily:"monospace"}}>▲ +{(deityMarkStacks*2.5).toFixed(1)}% bonoDano</div>
                )}
              </div>
            )}

            {/* Drone of Peace */}
            {globalDroneActive && (
              <div style={{background:"rgba(200,160,40,0.05)",border:"1px solid #2a1e08",borderRadius:3,padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:11,color:"#fcd34d",fontWeight:700,marginBottom:2}}>{t.skillDroneOfPeace}</div>
                  {droneActive && <div style={{fontSize:11,color:"#6ee7a0",fontFamily:"monospace"}}>▲ +5% bonoDano</div>}
                </div>
                <button onClick={()=>setDroneActive(p=>!p)} style={toggleBtn(droneActive)}>
                  {droneActive?"✓ ON":"OFF"}
                </button>
              </div>
            )}

            {/* Charger Turret */}
            {globalChargerTurretActive && (
              <div style={{background:"rgba(200,160,40,0.05)",border:"1px solid #2a1e08",borderRadius:3,padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:11,color:"#fcd34d",fontWeight:700,marginBottom:2}}>{t.skillChargerTurret}</div>
                  {chargerTurretActive && <div style={{fontSize:11,color:"#6ee7a0",fontFamily:"monospace"}}>▲ +30% bonoDano</div>}
                </div>
                <button onClick={()=>setChargerTurretActive(p=>!p)} style={toggleBtn(chargerTurretActive)}>
                  {chargerTurretActive?"✓ ON":"OFF"}
                </button>
              </div>
            )}

            {/* Angelic Shield */}
            {globalAngelicShieldActive && (
              <div style={{background:"rgba(248,113,113,0.06)",border:"1px solid #7f1d1d",borderRadius:3,padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:11,color:"#f87171",fontWeight:700,marginBottom:2}}>{t.skillAngelicShield}</div>
                  {angelicShieldActive && <div style={{fontSize:11,color:"#f87171",fontFamily:"monospace"}}>×0.50 daño final</div>}
                </div>
                <button onClick={()=>setAngelicShieldActive(p=>!p)} style={{...toggleBtn(angelicShieldActive), border:`1px solid ${angelicShieldActive?"#f87171":"#3a2510"}`, color:angelicShieldActive?"#f87171":"#6a5030", background:angelicShieldActive?"rgba(248,113,113,0.12)":"transparent"}}>
                  {angelicShieldActive?"✓ ON":"OFF"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Heavy Effect toggle */}
      {dmgRecibido > 0 && (
        <div style={{marginTop:10,padding:"8px 12px",background:"rgba(252,211,77,0.05)",border:"1px solid #3a2510",borderRadius:3,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color: heavyEffectActive?"#fcd34d":"#6a5030",fontWeight:700,marginBottom:2}}>{t.heavyEffectToggle}</div>
            <div style={{fontSize:10,color: heavyEffectActive?"#fcd34d":"#4a3820",fontStyle:"italic",fontWeight: heavyEffectActive?700:400}}>
              ⚡ Heavy ATK — ×{(1 + dmgRecibido/100).toFixed(4)} (+{dmgRecibido.toFixed(2)}%)
            </div>
          </div>
          <button onClick={()=>setHeavyEffectActive(p=>!p)} style={{
            padding:"5px 14px", borderRadius:2, cursor:"pointer", fontFamily:"inherit",
            fontSize:12, fontWeight:700, outline:"none",
            border:`1px solid ${heavyEffectActive?"#fcd34d":"#3a2510"}`,
            background: heavyEffectActive?"rgba(252,211,77,0.12)":"transparent",
            color: heavyEffectActive?"#fcd34d":"#6a5030",
          }}>
            {heavyEffectActive?"✓ ON":"OFF"}
          </button>
        </div>
      )}

      {/* Results */}
      {res && (
        <div style={S.isabelResultBox}>
          <div style={S.isabelResultDivider}>{t.secBase}</div>
          <div style={S.isabelResultRow}>
            <span style={S.isabelResultLbl}>{t.defPost}</span>
            <span style={S.isabelResultVal}>{Math.round(res.defensafinal).toLocaleString("es-ES")}</span>
          </div>
          <div style={S.isabelResultRow}>
            <span style={S.isabelResultLbl}>{t.atkEff}</span>
            <span style={S.isabelResultVal}>{Math.round(res.ataquefinal).toLocaleString("es-ES")}</span>
          </div>
          <div style={S.isabelResultRow}>
            <span style={S.isabelResultLbl}>{t.danoBase}</span>
            <span style={{...S.isabelResultVal, color:"#fcd34d"}}>{Math.round(res.danobase).toLocaleString("es-ES")}</span>
          </div>

          <div style={{...S.isabelResultDivider, marginTop:10}}>{t.secMods}</div>
          {[
            [t.modGeneral,  res.dmg_bonus],
            [t.modMagic, res.dano_magico],
            ...(isCrit   ? [[t.modCrit,   res.dano_critico]] : []),
            ...(isDebuff && res.debuff_mod !== 0 ? [[t.modDebuff, res.debuff_mod]] : []),
          ].map(([lbl, val]) => {
            const c = val > 0 ? "#6ee7a0" : val < 0 ? "#fca5a5" : "#7a7a7a";
            return (
              <div key={lbl} style={S.isabelResultRow}>
                <span style={S.isabelResultLbl}>{lbl}</span>
                <span style={{fontFamily:"monospace",fontSize:13,color:c,fontWeight:600}}>
                  {val>0?"▲":val<0?"▼":"●"} {(Math.abs(val)*100).toFixed(2)}%
                </span>
              </div>
            );
          })}
          {isDebuff && res.debuff_mod === 0 && (
            <div style={{...S.isabelResultRow, padding:"4px 0"}}>
              <span style={{fontSize:11,color:"#f87171",fontStyle:"italic",fontFamily:"'Courier New',monospace"}}>{t.debuffCancelled}</span>
            </div>
          )}
          <div style={S.isabelResultRow}>
            <span style={S.isabelResultLbl}>{t.multTotal}</span>
            <span style={{...S.isabelResultVal,color:"#fcd34d"}}>×{res.multiplicador.toFixed(5)}</span>
          </div>

          <div style={{...S.isabelResultDivider, marginTop:10}}>{t.secFinal}</div>
          <div style={S.isabelResultRow}>
            <span style={S.isabelResultLbl}>{t.danoNoCrit}</span>
            <span style={{...S.isabelResultVal,color:"#6a7a60"}}>{Math.round(res.danofinal_nocrit).toLocaleString("es-ES")}</span>
          </div>
          <div style={S.isabelResultRow}>
            <span style={S.isabelResultLbl}>{t.oliviaPreRed}</span>
            <span style={{...S.isabelResultVal,color:"#94a3b8"}}>{Math.round(res.danofinal_pre).toLocaleString("es-ES")}</span>
          </div>
          <div style={S.isabelResultRow}>
            <span style={S.isabelResultLbl}>{t.oliviaArtRed}</span>
            <span style={{...S.isabelResultVal,color:"#fca5a5",fontSize:12}}>−{(res.OLIVIA_ARTIFACT_REDUCTION*100).toFixed(0)}%</span>
          </div>
          <div style={S.isabelResultRow}>
            <span style={S.isabelResultLbl}>{t.danoSinDebuff}</span>
            <span style={{...S.isabelResultVal,color:"#94a3b8"}}>{Math.round(res.danofinal_base).toLocaleString("es-ES")}</span>
          </div>
          {isDebuff && (
            <div style={S.isabelResultRow}>
              <span style={S.isabelResultLbl}>{t.danoConDebuff}</span>
              <span style={{...S.isabelResultVal,color:"#fb923c",fontSize:16,fontWeight:700}}>{Math.round(res.danofinal_debuff).toLocaleString("es-ES")}</span>
            </div>
          )}
          <div style={S.isabelResultRow}>
            <span style={S.isabelResultLbl}>{isDebuff ? t.heavyDebuff : isCrit ? t.heavyNormal : t.heavyOnly}</span>
            <span style={{...S.isabelResultVal,color:"#f87171",fontSize:20,fontWeight:700}}>{Math.round(res.heavy_calc).toLocaleString("es-ES")}</span>
          </div>
          {angelicShieldActive && (
            <div style={{marginTop:8,padding:"8px 12px",background:"rgba(248,113,113,0.08)",border:"1px solid #7f1d1d",borderRadius:2}}>
              <div style={{fontSize:10,color:"#f87171",letterSpacing:"0.15em",marginBottom:6}}>⚔ ANGELIC SHIELD ×0.50</div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#f87171",fontFamily:"monospace"}}>
                <span>{isDebuff?t.danoConDebuff:t.danoSinDebuff}</span>
                <span style={{fontWeight:700}}>{Math.round((res.danofinal_debuff||res.danofinal_base)*0.5).toLocaleString("es-ES")}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:15,color:"#f87171",fontFamily:"monospace",marginTop:4}}>
                <span>{isDebuff?t.heavyDebuff:isCrit?t.heavyNormal:t.heavyOnly}</span>
                <span style={{fontWeight:900}}>{Math.round(res.heavy_calc*0.5).toLocaleString("es-ES")}</span>
              </div>
            </div>
          )}

          <div style={{...S.isabelResultDivider, marginTop:14}}>{t.secChart}</div>
          {(() => {
            const maxVal = isDebuff ? res.heavy_calc : res.heavy_calc;
            const renderBar = (lbl, val, grad) => {
              const pct = Math.min(100,(val/(maxVal||1))*100);
              return (
                <div key={lbl} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{width:120,fontSize:11,color:"#8a7045",flexShrink:0,overflow:"visible",whiteSpace:"nowrap"}}>{lbl}</span>
                  <div style={{flex:1,height:8,background:"#181008",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${grad})`,borderRadius:2}}/>
                  </div>
                  <span style={{fontSize:11,color:"#a08855",width:85,textAlign:"right",fontFamily:"monospace",flexShrink:0}}>
                    {Math.round(val).toLocaleString("es-ES")}
                  </span>
                </div>
              );
            };
            const baseRows = [
              [t.danoNoCrit,   res.danofinal_nocrit, "#6a7a60,#4a5a40"],
              [t.barNormal,    res.danofinal_base,   "#60a5fa,#2563eb"],
              ...(isCrit ? [[t.barNoCritHeavy, res.heavy_nocrit, "#7a9a60,#4a6a30"]] : []),
              [t.barCritHeavy, res.heavy_base,       "#f87171,#dc2626"],
            ];
            const debuffRows = isDebuff ? [
              [t.barBaseDebuff,      res.danofinal_base_debuff, "#f59e0b,#d97706"],
              [t.barBaseDebuffHeavy, res.heavy_base_debuff,     "#fbbf24,#b45309"],
              [t.barDebuff,          res.danofinal_debuff,      "#fb923c,#ea580c"],
              [t.barDebuffHeavy,     res.heavy_calc,            "#ef4444,#b91c1c"],
            ] : [];
            return (
              <>
                {baseRows.map(([l,v,g]) => renderBar(l,v,g))}
                {isDebuff && (
                  <>
                    <div style={{...S.isabelResultDivider, marginTop:10}}>{t.secChartDebuff}</div>
                    {debuffRows.map(([l,v,g]) => renderBar(l,v,g))}
                  </>
                )}
              </>
            );
          })()}
          {heavyEffectActive && dmgRecibido > 0 && (() => {
            const mult = 1 + dmgRecibido / 100;
            return (
              <div style={{marginTop:10,padding:"10px 12px",background:"rgba(252,211,77,0.06)",border:"1px solid #78350f",borderRadius:2}}>
                <div style={{fontSize:10,color:"#fcd34d",letterSpacing:"0.15em",marginBottom:4}}>
                  {t.secHeavyEffect} ×{mult.toFixed(4)}
                </div>
                <div style={{fontSize:10,color:"#5a4020",fontStyle:"italic",marginBottom:8}}>{t.heavyEffectNote}</div>
                {isCrit && (
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#a08855",fontFamily:"monospace",marginBottom:4}}>
                    <span>{t.danoSinDebuff}</span>
                    <span style={{fontWeight:700,color:"#fcd34d"}}>{Math.round(res.danofinal_base * mult).toLocaleString("es-ES")}</span>
                  </div>
                )}
                {isDebuff && (
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#a08855",fontFamily:"monospace",marginBottom:4}}>
                    <span>{t.danoConDebuff}</span>
                    <span style={{fontWeight:700,color:"#fb923c"}}>{Math.round(res.danofinal_debuff * mult).toLocaleString("es-ES")}</span>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:16,color:"#fcd34d",fontFamily:"monospace",borderTop:"1px solid #3a2010",paddingTop:6,marginTop:4}}>
                  <span style={{fontWeight:700}}>{isDebuff?t.heavyDebuff:isCrit?t.heavyNormal:t.heavyOnly}</span>
                  <span style={{fontWeight:900,fontSize:20}}>{Math.round(res.heavy_calc * mult).toLocaleString("es-ES")}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ── Isabel Healing Panel ──────────────────────────────────────────────────
const ISABEL_PVP_HEALING_REDUCION    = 0.50;
const ISABEL_PARTNERS_HEALING_REDUCTION = 0.25;

const initialIsabel = {
  isabel_skill_scaling_flat_bonus: 11876,
  isabel_skill_scaling: 0.22,
  partner_1_max_hp: 1014831,
  partner_2_max_hp: 870465,
  partner_3_max_hp: 819215,
  partner_4_max_hp: 618254,
  healing_bonus: 0.139,
};

const ISABEL_PCT = new Set(["isabel_skill_scaling","healing_bonus"]);

function calcIsabelHeal(s) {
  const total_healing_reduction = 1 - (ISABEL_PARTNERS_HEALING_REDUCTION + ISABEL_PVP_HEALING_REDUCION);
  const partners_sum_total_hp   = s.partner_1_max_hp + s.partner_2_max_hp + s.partner_3_max_hp + s.partner_4_max_hp;
  const base_healing            = partners_sum_total_hp * s.isabel_skill_scaling;
  const pve_per_tick            = ((1 + s.healing_bonus) * base_healing) / 3;
  let pvp                       = base_healing * 0.25;
  pvp                           = pvp / 3;
  pvp                           = pvp * (1 + s.healing_bonus);
  pvp                           = pvp + (s.isabel_skill_scaling_flat_bonus / 3);
  return {
    partners_sum_total_hp,
    base_healing,
    total_healing_reduction,
    pve_per_tick,
    pve_total: pve_per_tick * 3,
    pvp_per_tick: pvp,
    pvp_total: pvp * 3,
  };
}

function IsabelPanel({ t }) {
  const [showHpHint, setShowHpHint] = useState(false);
  const hpHintTimer = useRef(null);
  const [stats, setStats] = useState(initialIsabel);
  const res = calcIsabelHeal(stats);
  const us  = (f, v) => setStats(p => ({...p, [f]: v}));

  return (
    <div style={{ padding:"14px 18px" }}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14,position:"relative"}}>
        <div style={S.isabelHeader}>{t.isabelTitle}</div>
        <div style={{position:"relative",flexShrink:0}}>
          <button
            onClick={()=>setShowHpHint(p=>{ if(!p){ clearTimeout(hpHintTimer.current); hpHintTimer.current=setTimeout(()=>setShowHpHint(false),5000); } return !p; })}
            style={{width:22,height:22,borderRadius:"50%",background:"rgba(167,139,250,0.15)",border:"1px solid #7c3aed",color:"#a78bfa",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
            ?
          </button>
          {showHpHint && (
            <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:9999,background:"#0f0d09",border:"1px solid #3a1a5a",borderRadius:3,padding:"10px 14px",minWidth:240,maxWidth:280,boxShadow:"0 8px 24px rgba(0,0,0,0.8)",fontSize:12,color:"#b0a080",lineHeight:1.7,fontFamily:"'Courier New',monospace"}}>
              <div style={{fontSize:10,color:"#a78bfa",letterSpacing:"0.15em",marginBottom:6,borderLeft:"2px solid #7c3aed",paddingLeft:6}}>HP DE PARTNERS</div>
              {t.isabelHpHint}
            </div>
          )}
        </div>
      </div>

      {/* Inputs */}
      {Object.keys(initialIsabel).map(f => {
        const isPct = ISABEL_PCT.has(f);
        const disp  = isPct ? +(stats[f] * 100).toFixed(4) : stats[f];
        return (
          <div key={f} style={S.sRow}>
            <span style={S.sLbl}>{t.isabelLabels[f]}</span>
            <div style={S.sWrap}>
              <input type="number" style={S.sInput}
                value={disp}
                step={isPct ? "0.1" : "1000"}
                onChange={e => { const v = parseFloat(e.target.value)||0; us(f, isPct ? v/100 : v); }}
              />
              {isPct && <span style={S.sPct}>%</span>}
            </div>
          </div>
        );
      })}

      {/* Results */}
      <div style={S.isabelResultBox}>
        <div style={S.isabelResultDivider}>{t.isabelSumHp}</div>
        <div style={S.isabelResultRow}>
          <span style={S.isabelResultLbl}>{t.isabelSumHp}</span>
          <span style={S.isabelResultVal}>{Math.round(res.partners_sum_total_hp).toLocaleString("es-ES")}</span>
        </div>
        <div style={S.isabelResultRow}>
          <span style={S.isabelResultLbl}>{t.isabelBaseHeal}</span>
          <span style={S.isabelResultVal}>{Math.round(res.base_healing).toLocaleString("es-ES")}</span>
        </div>
        <div style={S.isabelResultRow}>
          <span style={S.isabelResultLbl}>{t.isabelHealReduction}</span>
          <span style={{ ...S.isabelResultVal, color:"#fca5a5" }}>{((1 - res.total_healing_reduction) * 100).toFixed(1)}%</span>
        </div>

        <div style={{...S.isabelResultDivider, marginTop:12}}>{t.isabelPveTitle}</div>
        <div style={S.isabelResultRow}>
          <span style={S.isabelResultLbl}>{t.isabelPveTitle}</span>
          <span style={{ ...S.isabelResultVal, color:"#86efac", fontSize:16 }}>{Math.round(res.pve_per_tick).toLocaleString("es-ES")} ×3</span>
        </div>
        <div style={S.isabelResultRow}>
          <span style={S.isabelResultLbl}>{t.isabelTotalPve}</span>
          <span style={{ ...S.isabelResultVal, color:"#4ade80", fontSize:18, fontWeight:700 }}>{Math.round(res.pve_total).toLocaleString("es-ES")}</span>
        </div>

        <div style={{...S.isabelResultDivider, marginTop:12}}>{t.isabelPvpTitle}</div>
        <div style={S.isabelResultRow}>
          <span style={S.isabelResultLbl}>{t.isabelPvpTitle}</span>
          <span style={{ ...S.isabelResultVal, color:"#fbbf24", fontSize:16 }}>{Math.round(res.pvp_per_tick).toLocaleString("es-ES")} ×3</span>
        </div>
        <div style={S.isabelResultRow}>
          <span style={S.isabelResultLbl}>{t.isabelTotalPvp}</span>
          <span style={{ ...S.isabelResultVal, color:"#f59e0b", fontSize:18, fontWeight:700 }}>{Math.round(res.pvp_total).toLocaleString("es-ES")}</span>
        </div>
      </div>

      {/* Fixed PvP reductions info */}
      <div style={S.isabelFixedBox}>
        <span style={S.isabelFixedLabel}>{t.isabelLabels.pvp_healing_reducion}</span>
        <span style={S.isabelFixedVal}>50% (fija)</span>
      </div>
      <div style={S.isabelFixedBox}>
        <span style={S.isabelFixedLabel}>{t.isabelLabels.partners_healing_reduction}</span>
        <span style={S.isabelFixedVal}>25% (fija)</span>
      </div>
    </div>
  );
}

// ── Partners Panel ────────────────────────────────────────────────────────
function PartnersPanel({ t, flags, tg, isabelOpen, setIsabelOpen, oliviaOpen, setOliviaOpen, onOliviaClick, onIsabelClick }) {
  const mob = useContext(MobileCtx);

  const partners = [
    {
      key: "isPartner",
      name: t.partnerOlivia,
      desc: t.partnerOliviaDesc,
      color: "#60a5fa",
      borderColor: "#2563eb",
      available: true,
      isIsabel: false,
      isOlivia: true,
    },
    {
      key: "isIsabel",
      name: t.partnerIsabel,
      desc: t.partnerIsabelDesc,
      color: "#a78bfa",
      borderColor: "#7c3aed",
      available: true,
      isIsabel: true,
      isOlivia: false,
    },
    {
      key: "isMina",
      name: t.partnerMina,
      desc: t.partnerMinaDesc,
      color: "#94a3b8",
      borderColor: "#475569",
      available: false,
      isIsabel: false,
      isOlivia: false,
    },
  ];

  return (
    <div style={{ padding: "16px 18px" }}>
      {partners.map(p => {
        const isExpanded = p.isOlivia ? oliviaOpen : (p.isIsabel ? isabelOpen : false);
        const rgb        = p.isIsabel ? "124,58,237" : "37,99,235";
        const expandable = p.isOlivia || p.isIsabel;
        return (
          <div key={p.key}>
            <div style={{
              ...S.partnerCard,
              borderColor: isExpanded ? p.borderColor : "#2a1e10",
              background: isExpanded ? `rgba(${rgb},0.1)` : "#0d0a06",
              cursor: expandable ? "pointer" : "default",
            }}
              onClick={() => {
                if (p.isOlivia) { onOliviaClick(); }
                if (p.isIsabel) { onIsabelClick(); }
              }}
            >
              <div style={S.partnerCardTop}>
                <div style={S.partnerCardLeft}>
                  <span style={{ ...S.partnerName, color: isExpanded ? p.color : "#8a7045" }}>{p.name}</span>
                  <span style={S.partnerDesc}>{p.desc}</span>
                </div>
                <span style={{ color: isExpanded ? p.color : "#5a4a2a", fontSize:18 }}>
                  {isExpanded ? (mob ? "▲" : "◀") : (mob ? "▼" : "▶")}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Heavy ATK Panel ───────────────────────────────────────────────────────
function HeavyAtkPanel({ t, ch, uc, heavyEffectActive, setHeavyEffectActive }) {
  const [infoOpen, setInfoOpen] = useState(false);

  const prob_heavy   = Math.min(1, ch.ataque_fuerte_porcentaje);
  const hit_efectivo = Math.min(1, Math.max(0, ch.hit_rate - ch.evacion));
  const prob_acierto = Math.min(1, prob_heavy + (1 - prob_heavy) * hit_efectivo);
  const dmg_recibido = (ch.ataque_fuerte / 20) * 0.13;

  return (
    <div style={{ padding: "14px 18px" }}>
      {/* Info toggle — top */}
      <button onClick={() => setInfoOpen(p => !p)} style={S.hvInfoBtn}>
        {t.heavyInfoBtn} <span style={{ marginLeft:6 }}>{infoOpen ? "▲" : "▼"}</span>
      </button>

      {infoOpen && (
        <div style={S.hvInfoBox}>
          <div style={S.hvInfoTitle}>{t.heavyInfoTitle}</div>
          {t.heavyInfoLines.map((line, i) => (
            <p key={i} style={S.hvInfoLine} dangerouslySetInnerHTML={{ __html: line }} />
          ))}
        </div>
      )}

      {/* Stats */}
      {Object.keys(ch).map(f => (
        <div key={f} style={S.sRow}>
          <span style={S.sLbl}>{t.labels[f]}</span>
          <div style={S.sWrap}>
            <input type="number" style={S.sInput}
              value={PCT_FIELDS.has(f) ? +(ch[f] * 100).toFixed(4) : ch[f]}
              step={PCT_FIELDS.has(f) ? "0.1" : "100"}
              onChange={e => { const v = parseFloat(e.target.value)||0; uc(f, PCT_FIELDS.has(f) ? v/100 : v); }}
            />
            {PCT_FIELDS.has(f) && <span style={S.sPct}>%</span>}
          </div>
        </div>
      ))}

      {/* Live results */}
      <div style={S.hvResultBox}>
        <div style={S.hvResultRow}>
          <span style={S.hvResultLbl}>{t.probAcierto}</span>
          <span style={{ color:"#6ee7a0", fontFamily:"monospace", fontSize:16, fontWeight:700 }}>
            {(prob_acierto * 100).toFixed(2)}%
          </span>
        </div>
        <div style={S.hvResultRow}>
          <span style={S.hvResultLbl}>{t.dmgRecibido}</span>
          <span style={{ color:"#fcd34d", fontFamily:"monospace", fontSize:15, fontWeight:700 }}>
            {dmg_recibido.toFixed(2)}%
          </span>
        </div>
        <div style={{...S.hvResultRow, borderTop:"1px solid #2a1e08", marginTop:6, paddingTop:10}}>
          <span style={{...S.hvResultLbl, color: heavyEffectActive?"#fcd34d":"#6a5030"}}>{t.heavyEffectToggle}</span>
          <button onClick={()=>setHeavyEffectActive(p=>!p)} style={{
            padding:"5px 14px", borderRadius:2, cursor:"pointer", fontFamily:"inherit",
            fontSize:12, fontWeight:700, outline:"none",
            border:`1px solid ${heavyEffectActive?"#fcd34d":"#3a2510"}`,
            background: heavyEffectActive?"rgba(252,211,77,0.12)":"transparent",
            color: heavyEffectActive?"#fcd34d":"#6a5030",
          }}>
            {heavyEffectActive?"✓ ON":"OFF"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function App() {
  const isMobile = useIsMobile();
  const [lang, setLang]   = useState("es");
  const [atk,  setAtk]   = useState(() => {
    try { const s = localStorage.getItem("goc_atk"); return s ? {...initialAttacker,...JSON.parse(s)} : initialAttacker; } catch { return initialAttacker; }
  });
  const [def,  setDef]   = useState(() => {
    try { const s = localStorage.getItem("goc_def"); return s ? {...initialDefender,...JSON.parse(s)} : initialDefender; } catch { return initialDefender; }
  });
  const [ch,   setCh]    = useState(initialCharged);
  const [chargedAtkVal,    setChargedAtkVal]    = useState(0);
  const [chargedAtkActive, setChargedAtkActive] = useState(false);
  const [chargedStacks,    setChargedStacks]    = useState(1);
  const [heavyEffectActive, setHeavyEffectActive] = useState(false);
  const [oliviaHeavyEffectActive, setOliviaHeavyEffectActive] = useState(false);
  const [showPopup,        setShowPopup]        = useState(false);
  const [popupSeen,        setPopupSeen]        = useState(false);
  const [showOliviaPopup,  setShowOliviaPopup]  = useState(false);
  const [oliviaPopupSeen,  setOliviaPopupSeen]  = useState(false);
  const [showTenacityPopup, setShowTenacityPopup] = useState(true);
  const [showCredits,       setShowCredits]       = useState(false);
  const [showChangelog,     setShowChangelog]     = useState(false);
  const creditsTimerRef = useRef(null);
  const [isabelOpen,  setIsabelOpen]  = useState(false);
  const [oliviaOpen,      setOliviaOpen]      = useState(false);
  const [oliviaAccSeen,   setOliviaAccSeen]   = useState(false);
  const [showOliviaAcc,   setShowOliviaAcc]   = useState(false);
  const [isabelPopupSeen, setIsabelPopupSeen] = useState(false);
  const [showIsabelPopup, setShowIsabelPopup] = useState(false);
  const [atkPopupSeen,    setAtkPopupSeen]    = useState(false);
  const [showAtkPopup,    setShowAtkPopup]    = useState(false);
  const [defPopupSeen,    setDefPopupSeen]    = useState(false);
  const [showDefPopup,    setShowDefPopup]    = useState(false);

  const handleIsabelClick = () => {
    if (isabelOpen) { setIsabelOpen(false); return; }
    setOliviaOpen(false);
    if (!isabelPopupSeen) { setShowIsabelPopup(true); }
    else { setIsabelOpen(true); }
  };

  const handleOliviaClick = () => {
    if (oliviaOpen) { setOliviaOpen(false); return; }
    setIsabelOpen(false);
    if (!oliviaAccSeen) { setShowOliviaAcc(true); }
    else { setOliviaOpen(true); }
  };
  const [angelicShieldActive, setAngelicShieldActive] = useState(false);
  const [deityMarkStacks, setDeityMarkStacks] = useState(0);
  const [burnBoatActive, setBurnBoatActive] = useState(false);
  const [truthShieldActive, setTruthShieldActive] = useState(false);
  const [truthShieldLevel, setTruthShieldLevel] = useState("base");
  const [truthShieldMaxHp, setTruthShieldMaxHp] = useState(0);
  const [truthShieldPvP, setTruthShieldPvP] = useState(false);
  const [burnBoatLevel, setBurnBoatLevel] = useState("base");
  const [burnBoatMaxHp, setBurnBoatMaxHp] = useState(0);
  const [burnBoatHpPct, setBurnBoatHpPct] = useState(100);
  const [droneOfPeaceActive, setDroneOfPeaceActive] = useState(false);
  const [chargerTurretActive, setChargerTurretActive] = useState(false);
  const [oliviaDeityMarkStacks,    setOliviaDeityMarkStacks]    = useState(0);
  const [oliviaAngelicShieldActive,setOliviaAngelicShieldActive] = useState(false);
  const [oliviaDroneActive,        setOliviaDroneActive]         = useState(false);
  const [oliviaChargerTurretActive,setOliviaChargerTurretActive] = useState(false);
  const [buffs, setBuffs] = useState(() => {
    try { const s = localStorage.getItem("goc_buffs"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem("goc_buffs", JSON.stringify(buffs)); } catch {} }, [buffs]);

  const [oliviaStats,  setOliviaStats]  = useState(() => {
    try { const s = localStorage.getItem("goc_olivia"); return s ? {...initialOlivia,...JSON.parse(s)} : initialOlivia; } catch { return initialOlivia; }
  });
  const [flags, setFlags] = useState({ isCrit:true, isDebuff:false, isPvP:true, isMagic:true, isPartner:false, isIsabel:false, isMina:false, isClass:true });
  const [tab,   setTab]   = useState("atk");
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `* { outline: none !important; box-shadow: none !important; } button::-moz-focus-inner { border: 0 !important; }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  useEffect(() => { setShowAtkPopup(true); setAtkPopupSeen(true); }, []);
  const [mobileView, setMobileView] = useState("inputs"); // "inputs" | "results"

  const ua = useCallback((f,v)=>setAtk(p=>({...p,[f]:v})),[]);
  const ud = useCallback((f,v)=>setDef(p=>({...p,[f]:v})),[]);

  useEffect(() => { try { localStorage.setItem("goc_atk", JSON.stringify(atk)); } catch {} }, [atk]);
  useEffect(() => { try { localStorage.setItem("goc_def", JSON.stringify(def)); } catch {} }, [def]);
  useEffect(() => { try { localStorage.setItem("goc_olivia", JSON.stringify(oliviaStats)); } catch {} }, [oliviaStats]);
  const uc = useCallback((f,v)=>setCh(p=>({...p,[f]:v})),[]);
  const tgRaw = useCallback(f=>setFlags(p=>({...p,[f]:!p[f]})),[]);
  const tg = useCallback(f => {
    if (f === "isPartner" && !flags.isPartner) {
      if (oliviaPopupSeen) { setFlags(p=>({...p,isPartner:true})); }
      else { setShowOliviaPopup(true); }
    } else {
      setFlags(p=>({...p,[f]:!p[f]}));
    }
  }, [flags.isPartner, oliviaPopupSeen]);

  // Toggling charged: if turning ON → show popup first; if turning OFF → just toggle
  const handleChargedToggle = () => {
    if (!chargedAtkActive) {
      if (popupSeen) {
        setChargedAtkActive(true);
      } else {
        setShowPopup(true);
      }
    } else {
      setChargedAtkActive(false);
    }
  };

  const handlePopupConfirm = () => {
    setShowPopup(false);
    setPopupSeen(true);
    setChargedAtkActive(true);
  };

  const handlePopupCancel = () => {
    setShowPopup(false);
  };

  const scrollRef = useRef(null);
  const resultsRef = useRef(null);
  const scrollPositions = useRef({ atk:0, def:0, ch:0, ca:0, pt:0 });

  const handleTabChange = (newTab) => {
    if (scrollRef.current) {
      scrollPositions.current[tab] = scrollRef.current.scrollTop;
    }
    setTab(newTab);
    if (newTab === "def" && !defPopupSeen) { setShowDefPopup(true); setDefPopupSeen(true); }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPositions.current[tab] || 0;
    }
  }, [tab]);

  const BURN_BONUS_MAP = {"base":0.03,"base+":0.08,"advanced":0.13,"advanced+":0.13};
  const buffedAtk = useMemo(() => {
    let a = {...atk};
    buffs.filter(b=>b.target==="atk").forEach(b=>{
      if(b.type==="flat") {
        a[b.stat] = (a[b.stat]||0) + Number(b.value);
      } else {
        // PCT_FIELDS stores values as decimals (0.66 = 66%) → add value/100
        // Flat stats like ataque store as absolute numbers → multiply by (1 + value/100)
        if(PCT_FIELDS.has(b.stat)) a[b.stat] = (a[b.stat]||0) + Number(b.value)/100;
        else a[b.stat] = (a[b.stat]||0) * (1 + Number(b.value)/100);
      }
    });
    if (deityMarkStacks > 0) a.bonoDano = (a.bonoDano||0) + deityMarkStacks * 0.025;
    if (burnBoatActive) a.bonoDano = (a.bonoDano||0) + (BURN_BONUS_MAP[burnBoatLevel] || 0);
    if (truthShieldActive && (truthShieldLevel==="base+"||truthShieldLevel==="advanced"||truthShieldLevel==="advanced+")) a.bonoDano = (a.bonoDano||0) + 0.05;
    if (droneOfPeaceActive) a.bonoDano = (a.bonoDano||0) + 0.05;
    if (chargerTurretActive) a.bonoDano = (a.bonoDano||0) + 0.30;
    return a;
  }, [atk, buffs, deityMarkStacks, burnBoatLevel, burnBoatActive, truthShieldActive, truthShieldLevel, droneOfPeaceActive, chargerTurretActive]);
  const buffedDef = useMemo(() => {
    let d = {...def};
    buffs.filter(b=>b.target==="def").forEach(b=>{
      if(b.type==="flat") {
        d[b.stat] = (d[b.stat]||0) + Number(b.value);
      } else {
        if(PCT_FIELDS.has(b.stat)) d[b.stat] = (d[b.stat]||0) + Number(b.value)/100;
        else d[b.stat] = (d[b.stat]||0) * (1 + Number(b.value)/100);
      }
    });
    return d;
  }, [def, buffs]);

  const buffedOliviaStats = useMemo(() => {
    let o = {...oliviaStats};
    if (oliviaDeityMarkStacks > 0) o.bonoDano = (o.bonoDano||0) + oliviaDeityMarkStacks * 0.025;
    if (oliviaDroneActive)         o.bonoDano = (o.bonoDano||0) + 0.05;
    if (oliviaChargerTurretActive) o.bonoDano = (o.bonoDano||0) + 0.30;
    return o;
  }, [oliviaStats, oliviaDeityMarkStacks, oliviaDroneActive, oliviaChargerTurretActive]);

  const res = useMemo(() =>
    calcDamage({ atk: buffedAtk, def: buffedDef, flags, charged:ch, chargedAtkVal, chargedAtkActive, chargedStacks }),
    [buffedAtk, buffedDef, flags, ch, chargedAtkVal, chargedAtkActive, chargedStacks]
  );
  const dmg_recibido = (ch.ataque_fuerte / 20) * 0.13;
  const go = useCallback(() => {
    if (isMobile) {
      setMobileView("results");
      setTimeout(() => { if (resultsRef.current) resultsRef.current.scrollTo({ top: 0, behavior: "smooth" }); }, 60);
    }
  }, [isMobile]);

  // ── Build share ──────────────────────────────────────────────────────────
  const [buildCopied, setBuildCopied] = useState(false);

  const serializeBuild = useCallback(() => {
    const payload = {
      atk, def, ch, chargedAtkVal, chargedAtkActive, chargedStacks,
      flags, buffs, oliviaStats,
      angelicShieldActive, deityMarkStacks,
      burnBoatActive, burnBoatLevel, burnBoatMaxHp, burnBoatHpPct,
      truthShieldActive, truthShieldLevel, truthShieldMaxHp, truthShieldPvP,
      droneOfPeaceActive, chargerTurretActive, heavyEffectActive,
      oliviaDeityMarkStacks, oliviaAngelicShieldActive, oliviaDroneActive, oliviaChargerTurretActive,
      oliviaHeavyEffectActive,
      lang,
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }, [atk, def, ch, chargedAtkVal, chargedAtkActive, chargedStacks, flags, buffs, oliviaStats,
      angelicShieldActive, deityMarkStacks, burnBoatActive, burnBoatLevel, burnBoatMaxHp, burnBoatHpPct,
      truthShieldActive, truthShieldLevel, truthShieldMaxHp, truthShieldPvP, lang]);

  const handleShareBuild = useCallback(() => {
    const code = serializeBuild();
    const url = `${window.location.origin}${window.location.pathname}#build=${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setBuildCopied(true);
      setTimeout(() => setBuildCopied(false), 2200);
    }).catch(() => {
      window.prompt(lang === "es" ? "Copia esta URL:" : "Copy this URL:", url);
    });
  }, [serializeBuild, lang]);

  // Load build from URL hash on mount (runs once)
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (!hash.startsWith("#build=")) return;
      const code = hash.slice(7);
      const p = JSON.parse(decodeURIComponent(escape(atob(code))));
      if (p.atk)    setAtk(prev => ({...prev, ...p.atk}));
      if (p.def)    setDef(prev => ({...prev, ...p.def}));
      if (p.ch)     setCh(prev => ({...prev, ...p.ch}));
      if (p.chargedAtkVal    !== undefined) setChargedAtkVal(p.chargedAtkVal);
      if (p.chargedAtkActive !== undefined) setChargedAtkActive(p.chargedAtkActive);
      if (p.chargedStacks    !== undefined) setChargedStacks(p.chargedStacks);
      if (p.flags)  setFlags(prev => ({...prev, ...p.flags}));
      if (p.buffs)  setBuffs(p.buffs);
      if (p.oliviaStats) setOliviaStats(prev => ({...prev, ...p.oliviaStats}));
      if (p.angelicShieldActive !== undefined) setAngelicShieldActive(p.angelicShieldActive);
      if (p.deityMarkStacks     !== undefined) setDeityMarkStacks(p.deityMarkStacks);
      if (p.burnBoatActive      !== undefined) setBurnBoatActive(p.burnBoatActive);
      if (p.burnBoatLevel)  setBurnBoatLevel(p.burnBoatLevel);
      if (p.burnBoatMaxHp   !== undefined) setBurnBoatMaxHp(p.burnBoatMaxHp);
      if (p.burnBoatHpPct   !== undefined) setBurnBoatHpPct(p.burnBoatHpPct);
      if (p.truthShieldActive !== undefined) setTruthShieldActive(p.truthShieldActive);
      if (p.truthShieldLevel)  setTruthShieldLevel(p.truthShieldLevel);
      if (p.truthShieldMaxHp !== undefined) setTruthShieldMaxHp(p.truthShieldMaxHp);
      if (p.truthShieldPvP   !== undefined) setTruthShieldPvP(p.truthShieldPvP);
      if (p.droneOfPeaceActive  !== undefined) setDroneOfPeaceActive(p.droneOfPeaceActive);
      if (p.chargerTurretActive !== undefined) setChargerTurretActive(p.chargerTurretActive);
      if (p.heavyEffectActive   !== undefined) setHeavyEffectActive(p.heavyEffectActive);
      if (p.oliviaDeityMarkStacks     !== undefined) setOliviaDeityMarkStacks(p.oliviaDeityMarkStacks);
      if (p.oliviaAngelicShieldActive !== undefined) setOliviaAngelicShieldActive(p.oliviaAngelicShieldActive);
      if (p.oliviaDroneActive         !== undefined) setOliviaDroneActive(p.oliviaDroneActive);
      if (p.oliviaChargerTurretActive !== undefined) setOliviaChargerTurretActive(p.oliviaChargerTurretActive);
      if (p.oliviaHeavyEffectActive   !== undefined) setOliviaHeavyEffectActive(p.oliviaHeavyEffectActive);
      if (p.lang) setLang(p.lang);
      window.history.replaceState(null, "", window.location.pathname);
    } catch { /* build code inválido, ignorar */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t  = T[lang];
  const totalActiveBuffs = buffs.length + (deityMarkStacks > 0 ? 1 : 0) + (angelicShieldActive ? 1 : 0) + (burnBoatActive ? 1 : 0) + (truthShieldActive ? 1 : 0) + (droneOfPeaceActive ? 1 : 0) + (chargerTurretActive ? 1 : 0);

  const FLAG_BTNS = [
    ["isCrit",    t.flagCrit],
    ["isDebuff",  t.flagDebuff],
    ["isPvP",     t.flagPvP],
    ["isMagic",   flags.isMagic ? t.flagMagic : t.flagPhys],
    ["isClass",   t.flagClass],
  ];

  // Responsive style overrides
  const R = isMobile ? {
    hdr: {...S.hdr, padding:"12px 14px 10px", gap:8},
    hTag: {...S.hTag, fontSize:10, letterSpacing:"0.08em"},
    hTitle: {...S.hTitle, fontSize:17, letterSpacing:"0.06em"},
    body: {...S.body, flexDirection:"column", minHeight:"auto"},
    left: {...S.left, width:"100%", borderRight:"none", borderBottom:"1px solid #1e1408"},
    right: {...S.right},
    scroll: {...S.scroll, maxHeight:"38vh"},
    tab: {...S.tab, fontSize:9, padding:"10px 1px", letterSpacing:"0.02em"},
    btn: {...S.btn, margin:"10px 14px 14px", padding:"14px", fontSize:13},
    flagBox: {...S.flagBox, padding:"10px 14px"},
    sLbl: {...S.sLbl, fontSize:11, width:155},
    sInput: {...S.sInput, width:85, fontSize:13},
    rBody: {...S.rBody, padding:"14px 16px 28px"},
    isabelRightPanel: {...S.isabelRightPanel, borderLeft:"none", borderTop:"1px solid #3a1a5a"},
    langBtn: {...S.langBtn, padding:"6px 10px", fontSize:12},
    creditsBtn: {...S.creditsBtn, fontSize:11, padding:"6px 10px"},
    tenacityBtn: {...S.tenacityBtn, fontSize:11, padding:"6px 10px"},
  } : {};
  const M = (key) => R[key] || S[key];

  return (
    <MobileCtx.Provider value={isMobile}>
    <div style={S.root}>
      <div style={S.bgGrid}/><div style={S.bgGlow}/>

      {/* ATK / DEF TAB POPUPS */}
      {showAtkPopup && (
        <InfoTabPopup title={t.atkTabPopupTitle} body={t.atkTabPopupBody} btnLabel={t.atkTabPopupBtn} accentColor="#e05520" onClose={() => setShowAtkPopup(false)} />
      )}
      {showDefPopup && (
        <InfoTabPopup title={t.defTabPopupTitle} body={t.defTabPopupBody} btnLabel={t.defTabPopupBtn} accentColor="#3b82f6" onClose={() => setShowDefPopup(false)} />
      )}
      {/* OLIVIA ACCURACY POPUP */}
      {showIsabelPopup && (
        <InfoTabPopup
          title={t.isabelPopupTitle}
          body={t.isabelPopupBody}
          btnLabel={t.isabelPopupBtn}
          accentColor="#a78bfa"
          onClose={() => { setShowIsabelPopup(false); setIsabelPopupSeen(true); setIsabelOpen(true); }}
        />
      )}
      {showOliviaAcc && (
        <OliviaAccuracyPopup t={t} onClose={() => { setShowOliviaAcc(false); setOliviaAccSeen(true); setOliviaOpen(true); }} />
      )}
      {/* CHANGELOG POPUP */}
      {showChangelog && (
        <ChangelogPopup t={t} onClose={() => setShowChangelog(false)} />
      )}
      {/* TENACITY POPUP */}
      {showTenacityPopup && (
        <TenacityPopup t={t} lang={lang} setLang={setLang} onClose={() => setShowTenacityPopup(false)} />
      )}
      {/* POPUP */}
      {showOliviaPopup && (
        <OliviaWarningPopup
          t={t}
          onConfirm={() => { setShowOliviaPopup(false); setOliviaPopupSeen(true); setFlags(p=>({...p,isPartner:true})); }}
          onCancel={() => setShowOliviaPopup(false)}
        />
      )}
      {showPopup && (
        <ChargedWarningPopup
          t={t}
          onConfirm={handlePopupConfirm}
          onCancel={handlePopupCancel}
        />
      )}

      {/* HEADER */}
      <header style={M("hdr")}>
        <div style={S.hAccent}/>
        <div>
          <div style={M("hTag")}>{t.tagline}</div>
          <h1 style={M("hTitle")}>{t.title}</h1>
        </div>
        {/* Header right controls — all in one aligned row */}
        <div style={{marginLeft:"auto", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6}}>
          {/* Top row: lang label + buttons */}
          <div style={{display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", justifyContent:"flex-end"}}>
            <span style={S.langLabel}>{lang==="es" ? "Idioma" : lang==="zh" ? "语言" : "Language"}</span>
            {["es","en","zh"].map(l=>(
              <button key={l} onClick={()=>setLang(l)}
                style={{ ...M('langBtn'), ...(lang===l?S.langOn:{}) }}>
                {l==="es"?"🇪🇸 ES": l==="zh"?"🇨🇳 ZH" :"🇺🇸 EN"}
              </button>
            ))}
          </div>
          {/* Bottom row: action buttons */}
          <div style={{display:"flex", alignItems:"center", gap:5, flexWrap:"wrap", justifyContent:"flex-end"}}>
            <button onClick={handleShareBuild} style={{
              ...M("creditsBtn"),
              color: buildCopied ? "#6ee7a0" : "#c08840",
              borderColor: buildCopied ? "#166534" : "#4a3010",
              background: buildCopied ? "rgba(110,231,160,0.10)" : "rgba(200,160,40,0.08)",
              transition:"all 0.2s",
            }}>
              {buildCopied ? t.shareCopied : t.shareBtn}
            </button>
            <button onClick={() => setShowChangelog(true)} style={{...M("creditsBtn"), color:"#c08840", borderColor:"#4a3010"}}>
              {t.changelogBtn}
            </button>
            <div style={{position:"relative"}}>
              <button onClick={() => {
                setShowCredits(p => {
                  if (!p) {
                    clearTimeout(creditsTimerRef.current);
                    creditsTimerRef.current = setTimeout(() => setShowCredits(false), 5000);
                  }
                  return !p;
                });
              }} style={M("creditsBtn")}>
                {lang==="es" ? "ℹ Créditos" : "ℹ Credits"}
              </button>
              {showCredits && (
                <div style={S.creditsDropdown}>
                  <div style={S.creditsDropTitle}>{t.creditsTitle}</div>
                  {t.creditsLines.map((c,i) => (
                    <div key={i} style={S.creditsDropRow}>
                      <span style={S.creditsDropLbl}>{c.label}</span>
                      <span style={S.creditsDropVal}>{c.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setShowTenacityPopup(true)} style={M("tenacityBtn")}>
              {t.tenacityPopupBtn}
            </button>
          </div>
        </div>
        {chargedAtkActive && (
          <div style={S.caHeaderBadge}>
            ⚡ {lang==="es"?"Cargado":"Charged"}: {chargedAtkVal} &nbsp;|&nbsp; {"🔋".repeat(chargedStacks)}
          </div>
        )}
        <span style={S.hSword}>⚔</span>
      </header>

      <div style={M("body")}>

        {/* ── LEFT COLUMN + PARTNER SIDE PANEL (always a row on PC) ── */}
        <div style={{display:"flex", flexDirection:"row", flex:1, minWidth:0, alignItems:"stretch"}}>

          {/* LEFT */}
          <div style={{...M("left"), display: (isMobile && mobileView==="results") || (isMobile && tab==="pt" && (oliviaOpen || isabelOpen)) ? "none" : "flex"}}>
            {(() => {
              const TABS = [["atk",t.tabAtk],["def",t.tabDef],["ch",t.tabCh],["ca",t.tabCA],["bf", totalActiveBuffs > 0 ? `${t.tabBuffs} (${totalActiveBuffs})` : t.tabBuffs],["pt",t.tabPartners]];
              const tabStyle = (k) => ({
                ...M("tab"),
                borderBottom: tab===k ? (k==="ca"&&chargedAtkActive ? "2px solid #9d6ef8" : "2px solid #e05520") : "2px solid transparent",
                color: tab===k ? (k==="ca"&&chargedAtkActive ? "#c4b5fd" : "#f0c060") : "#6a5030",
                background: tab===k ? (k==="ca"&&chargedAtkActive ? "rgba(124,58,237,0.07)" : "rgba(220,84,24,0.07)") : "transparent",
              });
              if (isMobile) {
                const row1 = TABS.slice(0,3);
                const row2 = TABS.slice(3);
                return (
                  <div style={{borderBottom:"1px solid #1e1408"}}>
                    <div style={{display:"flex",width:"100%"}}>
                      {row1.map(([k,l]) => <button key={k} style={{...tabStyle(k),flex:1,borderBottom: tab===k?(k==="ca"&&chargedAtkActive?"2px solid #9d6ef8":"2px solid #e05520"):"2px solid transparent"}} onClick={()=>handleTabChange(k)}>{l}</button>)}
                    </div>
                    <div style={{display:"flex",width:"100%",borderTop:"1px solid #1e1408"}}>
                      {row2.map(([k,l]) => <button key={k} style={{...tabStyle(k),flex:1,borderBottom: tab===k?(k==="ca"&&chargedAtkActive?"2px solid #9d6ef8":"2px solid #e05520"):"2px solid transparent"}} onClick={()=>handleTabChange(k)}>{l}</button>)}
                    </div>
                  </div>
                );
              }
              return (
                <div style={{...S.tabBar, overflowX:"auto", scrollbarWidth:"none", scrollbarColor:"transparent transparent"}}>
                  {TABS.map(([k,l]) => <button key={k} style={tabStyle(k)} onClick={()=>handleTabChange(k)}>{l}</button>)}
                </div>
              );
            })()}

            <div ref={scrollRef} style={{...M("scroll"), ...((tab==="pt" || tab==="bf") ? {maxHeight:"none", overflowY:"visible"} : {})}}>
              {tab==="atk" && Object.keys(initialAttacker).map(f=><StatInput key={f} label={t.labels[f]} field={f} value={atk[f]} onChange={ua} isPercent={PCT_FIELDS.has(f)}/>)}
              {tab==="def" && Object.keys(initialDefender).filter(f => f !== "reduccionPenetracion").map(f=><StatInput key={f} label={t.labels[f]} field={f} value={def[f]} onChange={ud} isPercent={PCT_FIELDS.has(f)}/>)}
              {tab==="ch"  && <HeavyAtkPanel t={t} ch={ch} uc={uc} heavyEffectActive={heavyEffectActive} setHeavyEffectActive={setHeavyEffectActive} />}
              {tab==="pt"  && <PartnersPanel t={t} flags={flags} tg={tg} isabelOpen={isabelOpen} setIsabelOpen={setIsabelOpen} oliviaOpen={oliviaOpen} setOliviaOpen={setOliviaOpen} onOliviaClick={handleOliviaClick} onIsabelClick={handleIsabelClick} />}
              {tab==="bf"  && <BuffsPanel t={t} buffs={buffs} setBuffs={setBuffs} atk={atk} def={def} angelicShieldActive={angelicShieldActive} setAngelicShieldActive={setAngelicShieldActive} deityMarkStacks={deityMarkStacks} setDeityMarkStacks={setDeityMarkStacks} burnBoatLevel={burnBoatLevel} setBurnBoatLevel={setBurnBoatLevel} burnBoatMaxHp={burnBoatMaxHp} setBurnBoatMaxHp={setBurnBoatMaxHp} burnBoatHpPct={burnBoatHpPct} setBurnBoatHpPct={setBurnBoatHpPct} burnBoatActive={burnBoatActive} setBurnBoatActive={setBurnBoatActive} truthShieldActive={truthShieldActive} setTruthShieldActive={setTruthShieldActive} truthShieldLevel={truthShieldLevel} setTruthShieldLevel={setTruthShieldLevel} truthShieldMaxHp={truthShieldMaxHp} setTruthShieldMaxHp={setTruthShieldMaxHp} truthShieldPvP={truthShieldPvP} setTruthShieldPvP={setTruthShieldPvP} droneOfPeaceActive={droneOfPeaceActive} setDroneOfPeaceActive={setDroneOfPeaceActive} chargerTurretActive={chargerTurretActive} setChargerTurretActive={setChargerTurretActive} onCalc={()=>{ setMobileView("results"); handleTabChange("atk"); }} />}
              {tab==="ca"  && (
                <ChargedAtkPanel t={t}
                  chargedAtkVal={chargedAtkVal} setChargedAtkVal={setChargedAtkVal}
                  chargedAtkActive={chargedAtkActive} onToggle={handleChargedToggle}
                  chargedStacks={chargedStacks} setChargedStacks={setChargedStacks}
                />
              )}
            </div>

            {/* FLAGS + CALC — hidden on partners tab */}
            {tab !== "pt" && tab !== "bf" && <>
              <div style={M("flagBox")}>
                <div style={S.flagTitle}>{t.conditions}</div>
                <div style={S.flagGrid}>
                  {FLAG_BTNS.map(([k,l])=>(
                    <button key={k} style={{...S.flag,...(flags[k]?S.flagOn:{})}} onClick={()=>tg(k)}>{l}</button>
                  ))}
                  <button style={{...S.flag,...(chargedAtkActive?S.flagCharged:{})}} onClick={handleChargedToggle}>
                    {t.flagCharged}
                  </button>
                </div>
                <div style={{marginTop:10,fontSize:13,color:"#a08855"}}>
                  {t.claseLabel} <span style={{color:flags.isMagic?"#c4b5fd":"#fdba74",fontWeight:700}}>
                    {flags.isMagic?t.claseMagic:t.claseFisica}
                  </span>
                  {flags.isPartner&&<span style={{color:"#60a5fa",marginLeft:10}}>{t.modoOlivia}</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:8,margin:"14px 18px 18px"}}>
              {isMobile && <button style={{...M("btn"),margin:0,flex:1}} onClick={go}>{t.mobileShowResults}</button>}
              <button style={{padding:"15px 14px",background:"rgba(200,160,40,0.08)",border:"1px solid #3a2510",borderRadius:2,color:"#a08040",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:"0.08em",flexShrink:0}}
                onClick={() => {
                  if(tab==="atk") { setAtk(initialAttacker); localStorage.removeItem("goc_atk"); }
                  if(tab==="def") { setDef(initialDefender); localStorage.removeItem("goc_def"); }
                }}>
                {t.resetBtn}
              </button>
            </div>
              {isMobile && mobileView==="inputs" && (
                <button style={{...S.btn, margin:"0 14px 14px", padding:"11px", fontSize:12, background:"#1a1a1a", border:"1px solid #3a2510"}}
                  onClick={() => setMobileView("results")}>
                  {t.mobileShowResults}
                </button>
              )}
            </>}
          </div>

          {/* PARTNER PANELS — always to the RIGHT of left on PC, below on mobile */}
          {tab==="pt" && isabelOpen && (
            <div style={{...S.isabelRightPanel, ...(isMobile ? {borderLeft:"none", borderTop:"1px solid #3a1a5a"} : {})}}>
              {isMobile && (
                <button onClick={() => setIsabelOpen(false)}
                  style={{padding:"10px 16px", background:"transparent", border:"none", borderBottom:"1px solid #1e1408", color:"#a78bfa", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, letterSpacing:"0.1em", textAlign:"left", width:"100%"}}>
                  ◀ {t.mobileShowInputs}
                </button>
              )}
              <IsabelPanel t={t} />
            </div>
          )}
          {tab==="pt" && oliviaOpen && (
            <div style={{...S.isabelRightPanel, ...(isMobile ? {borderLeft:"none", borderTop:"1px solid #3a1a5a"} : {})}}>
              {isMobile && (
                <button onClick={() => setOliviaOpen(false)}
                  style={{padding:"10px 16px", background:"transparent", border:"none", borderBottom:"1px solid #1e1408", color:"#60a5fa", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, letterSpacing:"0.1em", textAlign:"left", width:"100%"}}>
                  ◀ {t.mobileShowInputs}
                </button>
              )}
              <OliviaPanel t={t} def={def} stats={buffedOliviaStats} setStats={setOliviaStats}
                deityMarkStacks={oliviaDeityMarkStacks} setDeityMarkStacks={setOliviaDeityMarkStacks}
                angelicShieldActive={oliviaAngelicShieldActive} setAngelicShieldActive={setOliviaAngelicShieldActive}
                droneActive={oliviaDroneActive} setDroneActive={setOliviaDroneActive}
                chargerTurretActive={oliviaChargerTurretActive} setChargerTurretActive={setOliviaChargerTurretActive}
                globalDeityMarkStacks={deityMarkStacks} globalAngelicShieldActive={angelicShieldActive}
                globalDroneActive={droneOfPeaceActive} globalChargerTurretActive={chargerTurretActive}
                heavyEffectActive={oliviaHeavyEffectActive} setHeavyEffectActive={setOliviaHeavyEffectActive}
                dmgRecibido={dmg_recibido}
              />
            </div>
          )}

        </div>{/* end left+partner row */}

        {/* RIGHT — results panel */}
        <div style={{...M("right"), display: (tab==="pt" && (isMobile || isabelOpen || oliviaOpen)) || (isMobile && mobileView==="inputs") ? "none" : "flex", ...(tab==="bf" ? {borderLeft:"1px solid #2a1e08"} : {})}}>
          {isMobile && (
            <button onClick={() => setMobileView("inputs")}
              style={{padding:"10px 16px", background:"transparent", border:"none", borderBottom:"1px solid #1e1408", color:"#f0a060", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, letterSpacing:"0.1em", textAlign:"left", width:"100%"}}>
              {t.mobileShowInputs}
            </button>
          )}
          {tab==="bf" && (
            <BuffsActivePanel t={t} buffs={buffs} setBuffs={setBuffs} atk={atk} def={def} deityMarkStacks={deityMarkStacks} angelicShieldActive={angelicShieldActive} burnBoatLevel={burnBoatLevel} burnBoatMaxHp={burnBoatMaxHp} burnBoatHpPct={burnBoatHpPct} buffedAtk={buffedAtk} burnBoatActive={burnBoatActive} truthShieldActive={truthShieldActive} truthShieldLevel={truthShieldLevel} truthShieldMaxHp={truthShieldMaxHp} truthShieldPvP={truthShieldPvP} droneOfPeaceActive={droneOfPeaceActive} chargerTurretActive={chargerTurretActive} />
          )}
          {tab!=="bf" && !res && (
            <div style={S.empty}>
              <div style={{fontSize:56,opacity:0.12}}>⚔</div>
              <p style={{color:"#5a4a2a",fontSize:14,textAlign:"center",lineHeight:2,whiteSpace:"pre-line"}}>
                {t.emptyHint}
              </p>
            </div>
          )}
          {tab!=="bf" && res && (
            <div ref={resultsRef} style={M("rBody")}>
              <SecTitle>{t.secBase}</SecTitle>
              {(() => {
                const atkBuffs = buffs.filter(b => b.target==="atk" && b.stat==="ataque");
                const hasAtkBuff = atkBuffs.length > 0;
                const baseAtk = atk.ataque;
                const buffedAtkVal = buffedAtk.ataque;
                const delta = buffedAtkVal - baseAtk;
                return hasAtkBuff ? (
                  <div style={{...S.rRow, flexDirection:"column", alignItems:"flex-start", gap:2}}>
                    <div style={{display:"flex",justifyContent:"space-between",width:"100%"}}>
                      <span style={{...S.rLbl}}>{t.labels.ataque}</span>
                      <span style={{fontFamily:"monospace",fontSize:13,color:"#8a7045"}}>
                        {Math.round(baseAtk).toLocaleString("es-ES")}
                        <span style={{color: delta>=0?"#6ee7a0":"#fca5a5", marginLeft:6}}>
                          {delta>=0?"▲ +":"▼ "}{Math.abs(Math.round(delta)).toLocaleString("es-ES")}
                        </span>
                        <span style={{color:"#f0c060", marginLeft:6, fontWeight:700}}>
                          = {Math.round(buffedAtkVal).toLocaleString("es-ES")}
                        </span>
                      </span>
                    </div>
                  </div>
                ) : null;
              })()}
              <RRow label={t.defPost}  value={res.defensafinal}/>
              <RRow label={t.atkEff}   value={res.ataquefinal}/>
              <RRow label={t.danoBase} value={res.danobase} color="#fcd34d" bold/>

              <SecTitle>{t.secMods}</SecTitle>
              <Mod label={t.modGeneral}                              val={res.dmg_bonus}/>
              <Mod label={flags.isMagic?t.modMagic:t.modPhys}       val={res.dano_tipo}/>
              {flags.isCrit   && <Mod label={t.modCrit}   val={res.dano_critico}/>}
              {flags.isDebuff && (
                res.debuff_mod === 0
                  ? <div style={{...S.mRow, padding:"6px 0"}}>
                      <span style={{...S.mLbl, color:"#f87171", fontSize:12, fontStyle:"italic"}}>{t.debuffCancelled}</span>
                    </div>
                  : <Mod label={t.modDebuff} val={res.debuff_mod}/>
              )}
              {flags.isPvP    && <Mod label={t.modPvP}    val={res.pvp_mod}/>}
              {flags.isPvP&&flags.isClass&&!flags.isPartner && <Mod label={t.modClass} val={res.class_mod}/>}

              {chargedAtkActive && chargedAtkVal > 0 && (
                <>
                  <SecTitle>{t.secChargedMods}</SecTitle>
                  <div style={S.caResultBox}>
                    <div style={S.caResultRow}>
                      <span style={S.caResultLbl}>{t.modChargedDmg}</span>
                      <span style={{color:"#6ee7a0",fontFamily:"monospace",fontSize:14}}>
                        ▲ +{(res.ca.bonusDmg*100).toFixed(2)}% → {(res.effectiveBonoDano*100).toFixed(2)}%
                      </span>
                    </div>
                    <div style={S.caResultRow}>
                      <span style={S.caResultLbl}>{t.modChargedRed}</span>
                      <span style={{color:"#fca5a5",fontFamily:"monospace",fontSize:14}}>
                        ▲ +{(res.ca.redDmg*100).toFixed(2)}% → {(res.effectiveReduccion*100).toFixed(2)}%
                      </span>
                    </div>
                    <div style={{...S.caResultRow, borderTop:"1px solid #2a1a4a", marginTop:4, paddingTop:6}}>
                      <span style={S.caResultLbl}>{t.caStackTotal} (×{chargedStacks})</span>
                      <span style={{color:"#c4b5fd",fontFamily:"monospace",fontSize:14,fontWeight:700}}>
                        +{res.ca.trueDmgTotal.toFixed(1)}
                      </span>
                    </div>
                    <div style={S.caResultRow}>
                      <span style={S.caResultLbl}>{t.caStackRedTotal} (×{chargedStacks})</span>
                      <span style={{color:"#93c5fd",fontFamily:"monospace",fontSize:14,fontWeight:700}}>
                        +{res.ca.trueDmgRedTotal.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div style={{...S.multRow, ...(res.multiplicador < 0 ? {borderTop:"1px solid #7f1d1d"} : {})}}>
                <span style={{color:"#a08855",fontSize:14}}>{t.multTotal}</span>
                <span style={{color: res.multiplicador < 0 ? "#f87171" : "#fcd34d", fontFamily:"monospace",fontSize:17,fontWeight:700}}>
                  ×{res.multiplicador.toFixed(5)}
                </span>
              </div>
              {res.multiplicador < 0 && (
                <div style={{padding:"8px 12px",marginTop:6,background:"rgba(127,29,29,0.3)",border:"1px solid #7f1d1d",borderRadius:2,fontSize:12,color:"#fca5a5",letterSpacing:"0.05em"}}>
                  {t.negModWarning}
                </div>
              )}

              <SecTitle>{t.secFinal}</SecTitle>
              <RRow label={t.danoNoCrit} value={res.danofinal_nocrit} color="#6a7a60"/>
              <RRow label={t.danoSinDebuff} value={res.danofinal_base}   color="#94a3b8"/>
              {flags.isDebuff&&<RRow label={t.danoConDebuff} value={res.danofinal_debuff} color="#fb923c" bold size={17}/>}
              <RRow label={flags.isDebuff ? t.heavyDebuff : flags.isCrit ? t.heavyNormal : t.heavyOnly} value={res.heavy_calc} color="#f87171" bold size={22}/>
              {angelicShieldActive && (
                <div style={{marginTop:10,padding:"8px 12px",background:"rgba(248,113,113,0.08)",border:"1px solid #7f1d1d",borderRadius:2}}>
                  <div style={{fontSize:10,color:"#f87171",letterSpacing:"0.15em",marginBottom:6}}>⚔ ANGELIC SHIELD ×0.50</div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#f87171",fontFamily:"monospace"}}>
                    <span>{flags.isDebuff?t.danoConDebuff:t.danoSinDebuff}</span>
                    <span style={{fontWeight:700}}>{Math.round((res.danofinal_debuff||res.danofinal_base)*0.5).toLocaleString("es-ES")}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:15,color:"#f87171",fontFamily:"monospace",marginTop:4}}>
                    <span>{flags.isDebuff?t.heavyDebuff:flags.isCrit?t.heavyNormal:t.heavyOnly}</span>
                    <span style={{fontWeight:900}}>{Math.round(res.heavy_calc*0.5).toLocaleString("es-ES")}</span>
                  </div>
                </div>
              )}
              {heavyEffectActive && res.dmg_recibido > 0 && (() => {
                const mult = 1 + res.dmg_recibido / 100;
                const base    = res.danofinal_base;
                const debuff  = res.danofinal_debuff;
                const heavy   = res.heavy_calc;
                return (
                  <div style={{marginTop:10,padding:"10px 12px",background:"rgba(252,211,77,0.06)",border:"1px solid #78350f",borderRadius:2}}>
                    <div style={{fontSize:10,color:"#fcd34d",letterSpacing:"0.15em",marginBottom:6}}>
                      {t.secHeavyEffect} ×{mult.toFixed(4)}
                    </div>
                    <div style={{fontSize:10,color:"#5a4020",fontStyle:"italic",marginBottom:8}}>{t.heavyEffectNote}</div>
                    {flags.isCrit && (
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#a08855",fontFamily:"monospace",marginBottom:4}}>
                        <span>{t.danoSinDebuff}</span>
                        <span style={{fontWeight:700,color:"#fcd34d"}}>{Math.round(base * mult).toLocaleString("es-ES")}</span>
                      </div>
                    )}
                    {flags.isDebuff && (
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#a08855",fontFamily:"monospace",marginBottom:4}}>
                        <span>{t.danoConDebuff}</span>
                        <span style={{fontWeight:700,color:"#fb923c"}}>{Math.round(debuff * mult).toLocaleString("es-ES")}</span>
                      </div>
                    )}
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:16,color:"#fcd34d",fontFamily:"monospace",borderTop:"1px solid #3a2010",paddingTop:6,marginTop:4}}>
                      <span style={{fontWeight:700}}>{flags.isDebuff?t.heavyDebuff:flags.isCrit?t.heavyNormal:t.heavyOnly}</span>
                      <span style={{fontWeight:900,fontSize:20}}>{Math.round(heavy * mult).toLocaleString("es-ES")}</span>
                    </div>
                    {angelicShieldActive && (
                      <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #5a1a1a"}}>
                        <div style={{fontSize:10,color:"#f87171",letterSpacing:"0.12em",marginBottom:6}}>⚔ ANGELIC SHIELD ×0.50</div>
                        {flags.isDebuff && (
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#f87171",fontFamily:"monospace",marginBottom:4}}>
                            <span>{t.danoConDebuff}</span>
                            <span style={{fontWeight:700}}>{Math.round(debuff * mult * 0.5).toLocaleString("es-ES")}</span>
                          </div>
                        )}
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#f87171",fontFamily:"monospace"}}>
                          <span style={{fontWeight:700}}>{flags.isDebuff?t.heavyDebuff:flags.isCrit?t.heavyNormal:t.heavyOnly}</span>
                          <span style={{fontWeight:900}}>{Math.round(heavy * mult * 0.5).toLocaleString("es-ES")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <SecTitle>{t.secChart}</SecTitle>
              {(() => {
                const maxVal = flags.isDebuff ? res.heavy_calc : res.heavy_base;
                const baseRows = [
                  ...(flags.isCrit ? [[t.danoNoCrit,       res.danofinal_nocrit, "#6a7a60,#4a5a40"]] : []),
                  ...(flags.isCrit ? [[t.barNoCritHeavy,   res.heavy_nocrit,     "#7a9a60,#4a6a30"]] : []),
                  [t.barNormal,                             res.danofinal_base,   "#fcd34d,#d97706"],
                  [t.barCritHeavy,                          res.heavy_base,       "#f87171,#dc2626"],
                ];
                const debuffRows = flags.isDebuff ? [
                  [t.barBaseDebuff,      res.danofinal_base_debuff, "#f59e0b,#d97706"],
                  [t.barBaseDebuffHeavy, res.heavy_base_debuff,     "#fbbf24,#b45309"],
                  [t.barDebuff,          res.danofinal_debuff,      "#fb923c,#ea580c"],
                  [t.barDebuffHeavy,     res.heavy_calc,            "#ef4444,#b91c1c"],
                ] : [];
                const renderBar = (lbl, val, grad) => {
                  const pct = Math.min(100,(val/(maxVal||1))*100);
                  return (
                    <div key={lbl} style={S.barRow}>
                      <span style={{...S.barLbl, width:130, overflow:"visible", whiteSpace:"nowrap"}}>{lbl}</span>
                      <div style={S.barTrack}>
                        <div style={{...S.barFill,width:`${pct}%`,background:`linear-gradient(90deg,${grad})`}}/>
                      </div>
                      <span style={{fontSize:12,color:"#a08855",width:90,textAlign:"right",fontFamily:"monospace"}}>
                        {Math.round(val).toLocaleString("es-ES")}
                      </span>
                    </div>
                  );
                };
                return (
                  <>
                    {baseRows.map(([l,v,g]) => renderBar(l,v,g))}
                    {flags.isDebuff && (
                      <>
                        <div style={{...S.secTitle, marginTop:14, marginBottom:8}}>{t.secChartDebuff}</div>
                        {debuffRows.map(([l,v,g]) => renderBar(l,v,g))}
                      </>
                    )}
                  </>
                );
              })()}

            </div>
          )}
        </div>
      </div>

      <footer style={S.footer}>
        <span>{lang==="es"?"MOTOR DE COMBATE":"COMBAT ENGINE"}</span>
        <span style={{color:"#3a2e18"}}>///</span>
        <span>{t.footer}</span>
      </footer>
    </div>
    </MobileCtx.Provider>
  );
}

const S = {
  root:{minHeight:"100vh",background:"#09090b",color:"#d6cfc4",fontFamily:"'Courier New',monospace",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column"},
  bgGrid:{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(200,160,60,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,160,60,0.04) 1px,transparent 1px)",backgroundSize:"44px 44px"},
  bgGlow:{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse at 15% 45%,rgba(180,40,10,0.09) 0%,transparent 55%),radial-gradient(ellipse at 85% 20%,rgba(60,40,160,0.07) 0%,transparent 50%)"},
  hdr:{position:"relative",zIndex:100,display:"flex",alignItems:"center",gap:14,padding:"20px 28px 16px",borderBottom:"1px solid #2a1f10",background:"linear-gradient(180deg,#0f0d08,transparent)",flexWrap:"wrap"},
  hAccent:{width:4,height:54,borderRadius:2,background:"linear-gradient(180deg,#e05520,#7a1010)",flexShrink:0},
  hTag:{fontSize:12,color:"#8a6030",letterSpacing:"0.15em"},
  hTitle:{margin:"2px 0 0",fontSize:26,fontWeight:900,letterSpacing:"0.12em",color:"#f0e0a0",textShadow:"0 0 28px rgba(220,160,40,0.35)"},
  langToggle:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5},
  langLabel:{fontSize:10,color:"#6a5030",letterSpacing:"0.15em",textTransform:"uppercase"},
  langBtn:{padding:"7px 14px",background:"#0d0a06",border:"1px solid #3a2510",color:"#7a6030",cursor:"pointer",borderRadius:2,fontFamily:"inherit",fontSize:13,transition:"all 0.14s"},
  langOn:{background:"rgba(220,84,24,0.22)",borderColor:"#e05520",color:"#f0c060",fontWeight:700},
  caHeaderBadge:{padding:"6px 14px",background:"rgba(124,58,237,0.22)",border:"1px solid #9d6ef8",borderRadius:2,fontSize:13,color:"#c4b5fd",fontFamily:"monospace"},
  hSword:{fontSize:30,opacity:0.12,color:"#e05520"},
  creditsBtn:{padding:"7px 13px",background:"rgba(200,160,40,0.08)",border:"1px solid #3a2810",borderRadius:2,color:"#a08040",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:"0.08em",transition:"all 0.15s",flexShrink:0},
  creditsDropdown:{position:"fixed",top:80,right:16,zIndex:9999,background:"#0f0d09",border:"1px solid #3a2810",borderRadius:3,padding:"12px 16px",minWidth:280,boxShadow:"0 8px 32px rgba(0,0,0,0.9)"},
  creditsDropTitle:{fontSize:10,color:"#c08840",letterSpacing:"0.2em",borderLeft:"3px solid #e05520",paddingLeft:8,marginBottom:10},
  creditsDropRow:{display:"flex",justifyContent:"space-between",gap:16,padding:"5px 0",borderBottom:"1px solid #1a1408"},
  creditsDropLbl:{fontSize:11,color:"#5a4020"},
  creditsDropVal:{fontSize:11,color:"#a08040",fontFamily:"monospace",textAlign:"right"},
  tenacityBtn:{padding:"7px 13px",background:"rgba(202,138,4,0.12)",border:"1px solid #78350f",borderRadius:2,color:"#fbbf24",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:"0.08em",transition:"all 0.15s",flexShrink:0},
  body:{position:"relative",zIndex:1,display:"flex",flexDirection:"row",alignItems:"stretch",minHeight:"calc(100vh - 96px)",maxWidth:1100,width:"100%",minWidth:700},
  left:{width:360,flexShrink:0,display:"flex",flexDirection:"column",borderRight:"1px solid #1e1408",overflowX:"hidden",position:"relative"},
  right:{flex:1,display:"flex",flexDirection:"column",minWidth:0},
  tabBar:{display:"flex",borderBottom:"1px solid #1e1408",overflowX:"auto",scrollbarWidth:"none",width:"100%"},
  tab:{flex:1,padding:"10px 2px",background:"transparent",border:"none",outline:"none",color:"#6a5030",cursor:"pointer",fontSize:9,letterSpacing:"0.02em",fontFamily:"inherit",borderBottom:"2px solid transparent",transition:"all 0.14s",whiteSpace:"nowrap"},
  tabOn:{color:"#f0c060",borderBottomColor:"#e05520",background:"rgba(220,84,24,0.07)"},
  tabCharged:{color:"#c4b5fd",borderBottomColor:"#9d6ef8",background:"rgba(124,58,237,0.07)"},
  scroll:{flex:1,overflowY:"auto",overflowX:"hidden",padding:"12px 18px",maxHeight:"40vh",scrollbarWidth:"thin",scrollbarColor:"#3a2010 transparent"},
  sRow:{display:"flex",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #181008"},
  sLbl:{fontSize:12,color:"#8a7045",width:180,flexShrink:0,paddingRight:10,lineHeight:1.3}, // overridden by M()
  sWrap:{display:"flex",alignItems:"center",gap:4,marginLeft:"auto",width:116},
  sInput:{width:95,padding:"5px 9px",background:"#0d0a06",border:"1px solid #3a2510",color:"#f0c060",fontFamily:"inherit",fontSize:14,borderRadius:2,textAlign:"right",outline:"none"},
  sPct:{fontSize:12,color:"#6a5030",width:16,textAlign:"left",flexShrink:0},
  flagBox:{padding:"14px 18px",borderTop:"1px solid #1e1408"}, // overridden by M()
  flagTitle:{fontSize:11,color:"#7a6030",letterSpacing:"0.18em",marginBottom:10},
  flagGrid:{display:"flex",flexWrap:"wrap",gap:7},
  flag:{padding:"6px 13px",fontSize:12,background:"#0d0a06",border:"1px solid #3a2510",color:"#8a7045",cursor:"pointer",borderRadius:2,fontFamily:"inherit",transition:"all 0.12s"},
  flagOn:{background:"rgba(220,84,24,0.18)",borderColor:"#e05520",color:"#f0a060"},
  flagCharged:{background:"rgba(124,58,237,0.22)",borderColor:"#9d6ef8",color:"#c4b5fd"},
  btn:{margin:"14px 18px 18px",padding:"15px",background:"linear-gradient(135deg,#7a1212,#e05520)",border:"none",borderRadius:2,cursor:"pointer",color:"#fff",fontSize:14,fontWeight:900,letterSpacing:"0.22em",fontFamily:"inherit",textShadow:"0 1px 3px rgba(0,0,0,0.4)"},
  empty:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12},
  rBody:{padding:"18px 18px 36px 16px",overflowY:"auto",flex:1},
  secTitle:{fontSize:11,color:"#c08840",letterSpacing:"0.2em",borderLeft:"3px solid #e05520",paddingLeft:9,marginBottom:10,marginTop:22},
  rRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #181008"},
  rLbl:{fontSize:13,color:"#8a7850"},
  mRow:{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #141008"},
  mLbl:{fontSize:13,color:"#7a6840"},
  multRow:{display:"flex",justifyContent:"space-between",padding:"9px 0 3px",borderTop:"1px solid #2a1e08",marginTop:5},
  barRow:{display:"flex",alignItems:"center",gap:10,marginBottom:7},
  barLbl:{width:80,fontSize:12,color:"#8a7045",flexShrink:0},
  barTrack:{flex:1,height:9,background:"#181008",borderRadius:2,overflow:"hidden"},
  barFill:{height:"100%",borderRadius:2,transition:"width 0.5s ease"},
  chBox:{background:"rgba(200,160,40,0.06)",border:"1px solid #3a2810",borderRadius:3,padding:"14px 18px",marginTop:8},
  chRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0"},
  chLbl:{fontSize:13,color:"#8a7045"},
  partnerCard:{border:"1px solid",borderRadius:4,padding:"14px 16px",marginBottom:12,transition:"all 0.2s"},
  isabelRightPanel:{flex:1,overflowY:"auto",borderLeft:"1px solid #3a1a5a",background:"rgba(124,58,237,0.03)"},
  isabelHeader:{fontSize:11,color:"#a78bfa",letterSpacing:"0.18em",fontWeight:700,borderLeft:"3px solid #7c3aed",paddingLeft:9,marginBottom:14},
  isabelResultBox:{background:"rgba(124,58,237,0.06)",border:"1px solid #2a1840",borderRadius:3,padding:"12px 14px",marginTop:14},
  isabelResultDivider:{fontSize:10,color:"#7c3aed",letterSpacing:"0.15em",marginBottom:8,paddingBottom:4,borderBottom:"1px solid #2a1840"},
  isabelResultRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0"},
  isabelResultLbl:{fontSize:12,color:"#7a6888"},
  isabelFixedBox:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",marginTop:6,background:"rgba(0,0,0,0.3)",border:"1px solid #1a1020",borderRadius:3,opacity:0.7},
  isabelFixedLabel:{fontSize:11,color:"#5a4868",fontStyle:"italic"},
  isabelFixedVal:{fontSize:11,color:"#7a6888",fontFamily:"monospace",fontStyle:"italic"},
  isabelResultVal:{fontFamily:"monospace",fontSize:14,fontWeight:600,color:"#c4b5fd"},
  partnerCardTop:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12},
  partnerCardLeft:{display:"flex",flexDirection:"column",gap:4,flex:1},
  partnerName:{fontSize:15,fontWeight:700,letterSpacing:"0.08em"},
  partnerDesc:{fontSize:11,color:"#6a5535",lineHeight:1.5},
  partnerToggle:{padding:"7px 14px",border:"1px solid",borderRadius:2,fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:"0.1em",transition:"all 0.15s",flexShrink:0},
  hvResultBox:{background:"rgba(200,160,40,0.06)",border:"1px solid #3a2810",borderRadius:3,padding:"14px 16px",marginTop:14,marginBottom:14},
  hvResultRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0"},
  hvResultLbl:{fontSize:13,color:"#8a7045"},
  hvInfoBtn:{width:"100%",padding:"10px 14px",background:"rgba(220,84,24,0.1)",border:"1px solid #3a2510",borderRadius:2,color:"#f0a060",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,letterSpacing:"0.08em",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.15s"},
  hvInfoBox:{marginTop:8,background:"rgba(220,84,24,0.05)",border:"1px solid #2a1810",borderRadius:3,padding:"14px 16px"},
  hvInfoTitle:{fontSize:10,color:"#c08840",letterSpacing:"0.2em",borderLeft:"3px solid #e05520",paddingLeft:8,marginBottom:12},
  hvInfoLine:{margin:"0 0 10px 0",fontSize:12,color:"#b0a080",lineHeight:1.8,fontFamily:"'Courier New',monospace"},
  footer:{position:"relative",zIndex:1,display:"flex",gap:16,justifyContent:"center",padding:"12px",borderTop:"1px solid #181008",fontSize:12,color:"#4a3820",letterSpacing:"0.1em"},
  caPanel:{padding:"16px 18px"},
  caToggleRow:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4},
  caToggleLbl:{fontSize:12,color:"#c08840",letterSpacing:"0.18em",fontWeight:700},
  caToggleBtn:{padding:"8px 18px",background:"#0d0a06",border:"1px solid #3a2510",color:"#7a6030",cursor:"pointer",borderRadius:2,fontFamily:"inherit",fontSize:13,fontWeight:700,letterSpacing:"0.1em",transition:"all 0.15s"},
  caToggleOn:{background:"rgba(124,58,237,0.22)",borderColor:"#9d6ef8",color:"#c4b5fd"},
  caFormula:{fontSize:11,color:"#7a6840",marginTop:14,marginBottom:16,lineHeight:1.9,borderLeft:"2px solid #3a2060",paddingLeft:10,whiteSpace:"pre-line"},
  caStackSection:{marginBottom:14},
  caStackHeader:{marginBottom:11},
  caStackTitle:{fontSize:11,color:"#c08840",letterSpacing:"0.18em",fontWeight:700,display:"block",marginBottom:4},
  caStackNote:{fontSize:11,color:"#6a5878",fontStyle:"italic"},
  stackRow:{display:"flex",gap:9},
  stackBtn:{flex:1,padding:"11px 4px",background:"#0d0a06",border:"1px solid #3a2510",color:"#7a6030",cursor:"pointer",borderRadius:3,fontFamily:"inherit",fontSize:15,textAlign:"center",transition:"all 0.15s",lineHeight:1.3},
  stackOn:{background:"rgba(124,58,237,0.25)",borderColor:"#9d6ef8",color:"#c4b5fd",boxShadow:"0 0 14px rgba(124,58,237,0.3)"},
  caPreview:{background:"rgba(124,58,237,0.06)",border:"1px solid #2a1840",borderRadius:3,padding:"12px 14px",marginTop:4},
  caStatRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #1e1230"},
  caStatLbl:{fontSize:12,color:"#7a6888"},
  caBarWrap:{marginTop:16,display:"flex",alignItems:"center",gap:10},
  caBarTrack:{flex:1,height:7,background:"#141008",borderRadius:3,overflow:"hidden"},
  caBarFill:{height:"100%",borderRadius:3,transition:"width 0.4s ease"},
  caBarLabel:{fontSize:12,color:"#7a6888",fontFamily:"monospace",flexShrink:0},
  caResultBox:{background:"rgba(124,58,237,0.07)",border:"1px solid #2a1840",borderRadius:3,padding:"10px 14px",marginBottom:10},
  caResultRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #1e1230"},
  caResultLbl:{fontSize:12,color:"#7a6888"},
};
