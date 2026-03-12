import React, { useState, useCallback, useRef, useEffect, useContext } from "react";

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
    title: "CALCULADORA DE DAÑO  v1.1",
    tabAtk: "⚔ ATACANTE", tabDef: "🛡 DEFENSOR", tabCh: "⚡ HEAVY ATK", tabCA: "🔋 ATK CARGADO",
    conditions: "CONDICIONES DEL GOLPE",
    flagCrit: "💥 Crítico", flagDebuff: "☠ Debuff", flagPvP: "⚔ PvP",
    flagMagic: "✦ Mágico", flagPhys: "🗡 Físico", flagPartner: "🤝 Olivia", flagClass: "🎯 vs Clase",
    flagCharged: "🔋 Atk Cargado",
    tabPartners: "👥 PARTNERS",
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
    oliviaPreRed: "Pre-reducción artefacto",
    oliviaArtRed: "Red. artefacto Olivia (−25%)",
    oliviaLabels: {
      ataque:"Ataque Base", penetracion:"Penetración", escaladohabilidad:"Escalado Habilidad",
      bonoDano:"Bono de Daño", bonoDanoFisico:"Bono Daño Físico", bonoDanoMagico:"Bono Daño Mágico",
      danoCritico:"Mult. Crítico", debuffDmg:"Daño por Debuff", trueDmg:"True Damage",
    },
    changelogBtn: "📋 Changelog",
    changelogTitle: "CHANGELOG",
    changelog: [
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
      { label: "Versión", value: "v1.1" },
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
    negModWarning: "⚠ Los modificadores netos están reduciendo tu daño",
    calcBtn: "CALCULAR DAÑO",
    mobileShowResults: "VER RESULTADOS ▼",
    mobileShowInputs: "◀ VOLVER",
    emptyHint: "Configura los parámetros\ny pulsa CALCULAR DAÑO",
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
    title: "DAMAGE CALCULATOR  v1.1",
    tabAtk: "⚔ ATTACKER", tabDef: "🛡 DEFENDER", tabCh: "⚡ HEAVY ATK", tabCA: "🔋 CHARGED ATK",
    conditions: "HIT CONDITIONS",
    flagCrit: "💥 Critical", flagDebuff: "☠ Debuff", flagPvP: "⚔ PvP",
    flagMagic: "✦ Magic", flagPhys: "🗡 Physical", flagPartner: "🤝 Olivia", flagClass: "🎯 vs Class",
    flagCharged: "🔋 Charged Atk",
    tabPartners: "👥 PARTNERS",
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
    oliviaPreRed: "Pre-artifact reduction",
    oliviaArtRed: "Olivia artifact red. (−25%)",
    oliviaLabels: {
      ataque:"Base Attack", penetracion:"Penetration", escaladohabilidad:"Skill Scaling",
      bonoDano:"Damage Bonus", bonoDanoFisico:"Physical DMG Bonus", bonoDanoMagico:"Magic DMG Bonus",
      danoCritico:"Crit Multiplier", debuffDmg:"Debuff Damage", trueDmg:"True Damage",
    },
    changelogBtn: "📋 Changelog",
    changelogTitle: "CHANGELOG",
    changelog: [
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
      { label: "Version", value: "v1.1" },
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
  const heavy_raw        = Math.abs(danofinal_base - danofinal_base * 1.30);
  const total_hd         = isDebuff ? danofinal_base * (1 + debuff_mod) : danofinal_base;
  const heavy_calc       = heavy_raw + total_hd;

  const prob_no      = 1 - charged.ataque_fuerte_porcentaje;
  const prob_acierto = charged.ataque_fuerte_porcentaje * charged.hit_rate + prob_no * charged.evacion;
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


// ── Changelog Popup ───────────────────────────────────────────────────────
function ChangelogPopup({ t, onClose }) {
  const versionColors = {
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
            <span style={{fontSize:10, color:"#6a5030", letterSpacing:"0.15em"}}>{lang==="es"?"IDIOMA":"LANGUAGE"}</span>
            <div style={{display:"flex", gap:5}}>
              {["es","en"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding:"5px 11px", background: lang===l ? "rgba(202,138,4,0.22)" : "#0d0a06",
                  border: lang===l ? "1px solid #ca8a04" : "1px solid #3a2510",
                  color: lang===l ? "#fcd34d" : "#6a5030",
                  cursor:"pointer", borderRadius:2, fontFamily:"inherit", fontSize:12, fontWeight:700,
                }}>
                  {l==="es" ? "🇪🇸 ES" : "🇺🇸 EN"}
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
            Guardians of Cloudia — Damage Calculator v1.1
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
  const heavy_raw        = Math.abs(danofinal_base - danofinal_base * 1.30);
  const total_hd         = isDebuff ? danofinal_base * (1 + debuff_mod) : danofinal_base;
  const heavy_calc       = heavy_raw + total_hd;

  return { defensafinal, ataquefinal, danobase, dmg_bonus, dano_magico, dano_critico, debuff_mod, multiplicador, danofinal_nocrit, danofinal_pre, danofinal_base, danofinal_debuff, heavy_calc, OLIVIA_ARTIFACT_REDUCTION };
}

function OliviaPanel({ t, def, stats, setStats }) {
  const [isCrit,   setIsCrit]   = useState(true);
  const [isDebuff, setIsDebuff] = useState(false);
  const [res,      setRes]      = useState(null);
  const us = (f, v) => setStats(p => ({...p, [f]: v}));

  const calc = () => setRes(calcOliviaDamage({ atk: stats, def, isCrit, isDebuff }));

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

      <button style={{...S.btn, margin:"12px 0"}} onClick={calc}>{t.calcBtn}</button>

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
function HeavyAtkPanel({ t, ch, uc }) {
  const [infoOpen, setInfoOpen] = useState(false);

  // Compute heavy atk stats live from ch values
  const prob_no      = 1 - ch.ataque_fuerte_porcentaje;
  const prob_acierto = ch.ataque_fuerte_porcentaje * ch.hit_rate + prob_no * ch.evacion;
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
  const [oliviaStats,  setOliviaStats]  = useState(() => {
    try { const s = localStorage.getItem("goc_olivia"); return s ? {...initialOlivia,...JSON.parse(s)} : initialOlivia; } catch { return initialOlivia; }
  });
  const [flags, setFlags] = useState({ isCrit:true, isDebuff:false, isPvP:true, isMagic:true, isPartner:false, isIsabel:false, isMina:false, isClass:true });
  const [res,   setRes]   = useState(null);
  const [tab,   setTab]   = useState("atk");
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

  const go = () => setRes(calcDamage({ atk, def, flags, charged:ch, chargedAtkVal, chargedAtkActive, chargedStacks }));
  const t  = T[lang];

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
            <span style={S.langLabel}>{lang==="es" ? "Idioma" : "Language"}</span>
            {["es","en"].map(l=>(
              <button key={l} onClick={()=>setLang(l)}
                style={{ ...M('langBtn'), ...(lang===l?S.langOn:{}) }}>
                {l==="es"?"🇪🇸 ES":"🇺🇸 EN"}
              </button>
            ))}
          </div>
          {/* Bottom row: action buttons */}
          <div style={{display:"flex", alignItems:"center", gap:5, flexWrap:"wrap", justifyContent:"flex-end"}}>
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
            <div style={{...S.tabBar, overflowX: isMobile ? "auto" : "visible", scrollbarWidth:"none"}}>
              {[["atk",t.tabAtk],["def",t.tabDef],["ch",t.tabCh],["ca",t.tabCA],["pt",t.tabPartners]].map(([k,l])=>(
                <button key={k} style={{
                  ...M("tab"),
                  ...(tab===k?S.tabOn:{}),
                  ...(k==="ca"&&chargedAtkActive?S.tabCharged:{}),
                }} onClick={()=>handleTabChange(k)}>{l}</button>
              ))}
            </div>

            <div ref={scrollRef} style={{...M("scroll"), ...(tab==="pt" ? {maxHeight:"none", overflowY:"visible"} : {})}}>
              {tab==="atk" && Object.keys(initialAttacker).map(f=><StatInput key={f} label={t.labels[f]} field={f} value={atk[f]} onChange={ua} isPercent={PCT_FIELDS.has(f)}/>)}
              {tab==="def" && Object.keys(initialDefender).filter(f => f !== "reduccionPenetracion").map(f=><StatInput key={f} label={t.labels[f]} field={f} value={def[f]} onChange={ud} isPercent={PCT_FIELDS.has(f)}/>)}
              {tab==="ch"  && <HeavyAtkPanel t={t} ch={ch} uc={uc} />}
              {tab==="pt"  && <PartnersPanel t={t} flags={flags} tg={tg} isabelOpen={isabelOpen} setIsabelOpen={setIsabelOpen} oliviaOpen={oliviaOpen} setOliviaOpen={setOliviaOpen} onOliviaClick={handleOliviaClick} onIsabelClick={handleIsabelClick} />}
              {tab==="ca"  && (
                <ChargedAtkPanel t={t}
                  chargedAtkVal={chargedAtkVal} setChargedAtkVal={setChargedAtkVal}
                  chargedAtkActive={chargedAtkActive} onToggle={handleChargedToggle}
                  chargedStacks={chargedStacks} setChargedStacks={setChargedStacks}
                />
              )}
            </div>

            {/* FLAGS + CALC — hidden on partners tab */}
            {tab !== "pt" && <>
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
              <button style={{...M("btn"),margin:0,flex:1}} onClick={() => { go(); if(isMobile) setMobileView("results"); }}>{t.calcBtn}</button>
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
              <OliviaPanel t={t} def={def} stats={oliviaStats} setStats={setOliviaStats} />
            </div>
          )}

        </div>{/* end left+partner row */}

        {/* RIGHT — results panel */}
        <div style={{...M("right"), display: (tab==="pt" && (isMobile || isabelOpen || oliviaOpen)) || (isMobile && mobileView==="inputs") ? "none" : "flex"}}>
          {isMobile && (
            <button onClick={() => setMobileView("inputs")}
              style={{padding:"10px 16px", background:"transparent", border:"none", borderBottom:"1px solid #1e1408", color:"#f0a060", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, letterSpacing:"0.1em", textAlign:"left", width:"100%"}}>
              {t.mobileShowInputs}
            </button>
          )}
          {!res && (
            <div style={S.empty}>
              <div style={{fontSize:56,opacity:0.12}}>⚔</div>
              <p style={{color:"#5a4a2a",fontSize:14,textAlign:"center",lineHeight:2,whiteSpace:"pre-line"}}>
                {t.emptyHint}
              </p>
            </div>
          )}
          {res && (
            <div style={M("rBody")}>
              <SecTitle>{t.secBase}</SecTitle>
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
  root:{minHeight:"100vh",background:"#09090b",color:"#d6cfc4",fontFamily:"'Courier New',monospace",position:"relative",overflow:"hidden"},
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
  body:{position:"relative",zIndex:1,display:"flex",flexDirection:"row",alignItems:"stretch",minHeight:"calc(100vh - 96px)"},
  left:{width:370,flexShrink:0,display:"flex",flexDirection:"column",borderRight:"1px solid #1e1408"},
  right:{flex:1,display:"flex",flexDirection:"column",minWidth:0},
  tabBar:{display:"flex",borderBottom:"1px solid #1e1408"},
  tab:{flex:1,padding:"12px 2px",background:"transparent",border:"none",color:"#6a5030",cursor:"pointer",fontSize:10,letterSpacing:"0.06em",fontFamily:"inherit",borderBottom:"2px solid transparent",transition:"all 0.14s"},
  tabOn:{color:"#f0c060",borderBottomColor:"#e05520",background:"rgba(220,84,24,0.07)"},
  tabCharged:{color:"#c4b5fd",borderBottomColor:"#9d6ef8",background:"rgba(124,58,237,0.07)"},
  scroll:{flex:1,overflowY:"auto",padding:"12px 18px",maxHeight:"40vh",scrollbarWidth:"thin",scrollbarColor:"#3a2010 transparent"},
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
  rBody:{padding:"18px 28px 36px",overflowY:"auto",flex:1},
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
