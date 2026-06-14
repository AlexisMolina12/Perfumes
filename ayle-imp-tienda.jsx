import { useState, useMemo, useEffect } from "react";

/* ============================================================
   AYLE.IMP · DISTRIBUIDORA — Perfumes árabes & Decants
   ------------------------------------------------------------
   ✦ Precio mayorista por TOTAL del carrito:
     5 perfumes distintos (1 c/u) ya pagan el precio de "5 u."
     Lo mismo con desodorantes (1/30/100/300) y splash (1/10/50/100).
   ✦ Decants 5ml con precio fijo.
   ✦ Pedido resumido por WhatsApp + botón Mercado Pago listo
     para conectar (ver función payMP).
   ------------------------------------------------------------
   FOTOS: en cada producto, reemplazá  img: null  por la URL
   de tu foto →  img: "https://..."
   ============================================================ */

const WHATSAPP = "5493487332074"; // WhatsApp de Ayle.imp
const INSTAGRAM = "ayle.imp";

const TIERS = {
  perfume: [1, 5, 12, 30],
  deo: [1, 30, 100, 300],
  splash: [1, 10, 50, 100],
};

const FAM = {
  ambar:    { c1: "#C98A3B", c2: "#7A4A18", label: "Ámbar especiado" },
  gourmand: { c1: "#B5651D", c2: "#6B3A12", label: "Dulce · Gourmand" },
  fresco:   { c1: "#5E8F8B", c2: "#2E544F", label: "Fresco · Aromático" },
  floral:   { c1: "#C27A8E", c2: "#7A3A4A", label: "Floral" },
  oud:      { c1: "#8A6A45", c2: "#3E2B16", label: "Oud · Amaderado" },
  citrico:  { c1: "#C0A93B", c2: "#6E611A", label: "Cítrico frutal" },
};

const PERFUMES = [
  // ARMAF
  { id:"cdni", marca:"Armaf", nombre:"Club de Nuit Intense Man", ml:105, gen:"H", fam:"fresco", notas:["Piña","Bergamota","Abedul","Ámbar gris"], p:[64000,62600,60900,59600], d:6500, star:true },
  { id:"cdnu", marca:"Armaf", nombre:"Club de Nuit Untold", ml:105, gen:"U", fam:"ambar", notas:["Azafrán","Jazmín","Ámbar gris","Cedro"], p:[72000,70400,68500,67000], d:7300, star:true },
  { id:"cdnurb", marca:"Armaf", nombre:"Club de Nuit Urban Man Elixir", ml:105, gen:"H", fam:"gourmand", notas:["Manzana","Lavanda","Tonka","Vainilla"], p:[75000,73200,72000,70500], d:7500 },
  { id:"cdnprec", marca:"Armaf", nombre:"Club de Nuit Precieux Extrait", ml:55, gen:"U", fam:"oud", notas:["Azafrán","Rosa","Oud","Ámbar"], p:[92000,90000,88500,87000], d:null },
  { id:"cdnw", marca:"Armaf", nombre:"Club de Nuit Woman Elixir", ml:105, gen:"M", fam:"floral", notas:["Frutas rojas","Flores blancas","Vainilla","Almizcle"], p:[65000,63600,62000,60700], d:6700 },
  { id:"odyaoud", marca:"Armaf", nombre:"Odyssey AOUD", ml:100, gen:"H", fam:"oud", notas:["Oud","Especias","Ámbar","Maderas"], p:[46000,44700,43700,42600], d:5500 },
  { id:"odychoc", marca:"Armaf", nombre:"Odyssey Dubai Chocolate", ml:100, gen:"U", fam:"gourmand", notas:["Chocolate","Pistacho","Vainilla","Almizcle"], p:[46000,44700,43700,42600], d:5500 },
  { id:"odyman", marca:"Armaf", nombre:"Odyssey Mandarin Sky", ml:100, gen:"H", fam:"citrico", notas:["Mandarina","Jengibre","Ámbar","Almizcle"], p:[54000,53600,52100,51000], d:6000 },
  { id:"odyaqua", marca:"Armaf", nombre:"Odyssey Aqua", ml:100, gen:"H", fam:"fresco", notas:["Notas marinas","Cítricos","Almizcle","Maderas"], p:[64000,62600,60900,59600], d:6800 },
  { id:"odycandee", marca:"Armaf", nombre:"Odyssey Candee", ml:100, gen:"M", fam:"gourmand", notas:["Algodón de azúcar","Frutas","Vainilla","Caramelo"], p:[46000,44700,43700,42600], d:5500 },
  { id:"odyblack", marca:"Armaf", nombre:"Odyssey Homme Black", ml:100, gen:"H", fam:"ambar", notas:["Especias","Cuero","Ámbar","Vainilla"], p:[46000,44700,43700,42600], d:5500 },
  { id:"odywhite", marca:"Armaf", nombre:"Odyssey Homme White", ml:100, gen:"H", fam:"fresco", notas:["Cítricos","Jengibre","Almizcle blanco","Maderas claras"], p:[46000,44700,43700,42600], d:5500 },
  // AL WATANIAH
  { id:"sabah", marca:"Al Wataniah", nombre:"Sabah Al Ward", ml:100, gen:"M", fam:"floral", notas:["Rosa","Peonía","Vainilla","Almizcle"], p:[36000,35000,34000,32500], d:4500 },
  { id:"durrat", marca:"Al Wataniah", nombre:"Durrat Al Aroos", ml:85, gen:"M", fam:"gourmand", notas:["Caramelo","Flores","Vainilla","Ámbar"], p:[36000,35000,34000,32500], d:5000 },
  { id:"watint", marca:"Al Wataniah", nombre:"Intense EDP", ml:100, gen:"H", fam:"ambar", notas:["Especias","Ámbar","Maderas","Almizcle"], p:[36000,35000,34000,32500], d:4500 },
  // RAYHAAN
  { id:"rayelix", marca:"Rayhaan", nombre:"Elixir", ml:100, gen:"H", fam:"ambar", notas:["Canela","Manzana","Tonka","Vainilla"], p:[71000,70000,68800,67000], d:7300 },
  // MAISON ALHAMBRA
  { id:"salvo", marca:"Maison Alhambra", nombre:"Salvo EDP", ml:100, gen:"H", fam:"ambar", notas:["Manzana","Canela","Tabaco","Vainilla"], p:[40000,39000,38000,37200], d:5000 },
  { id:"salvoelix", marca:"Maison Alhambra", nombre:"Salvo Elixir", ml:60, gen:"H", fam:"gourmand", notas:["Canela","Frutas","Cuero","Vainilla"], p:[46000,45000,44000,43000], d:null },
  { id:"victnero", marca:"Maison Alhambra", nombre:"Victorioso Nero", ml:100, gen:"H", fam:"fresco", notas:["Bergamota","Lavanda","Pachulí","Ámbar gris"], p:[42000,41000,40200,39200], d:5000 },
  { id:"yourtouch", marca:"Maison Alhambra", nombre:"Your Touch Amber", ml:100, gen:"U", fam:"ambar", notas:["Ámbar","Vainilla","Almizcle","Maderas"], p:[35000,33000,31500,30000], d:4000 },
  // RASASI
  { id:"hawasfire", marca:"Rasasi", nombre:"Hawas Fire", ml:100, gen:"H", fam:"ambar", notas:["Piña","Canela","Cardamomo","Ámbar"], p:[64000,62600,60900,59600], d:7000, star:true },
  { id:"hawasblack", marca:"Rasasi", nombre:"Hawas Black", ml:100, gen:"H", fam:"oud", notas:["Cítricos","Especias oscuras","Cuero","Ámbar gris"], p:[64000,62600,60900,59600], d:7000 },
  { id:"hawaselix", marca:"Rasasi", nombre:"Hawas Elixir", ml:100, gen:"H", fam:"fresco", notas:["Manzana","Bergamota","Notas acuáticas","Almizcle"], p:[64000,62600,60900,59600], d:7000 },
  // AFNAN
  { id:"9pm", marca:"Afnan", nombre:"9PM EDP", ml:100, gen:"H", fam:"gourmand", notas:["Manzana","Canela","Lavanda","Vainilla"], p:[53000,51400,50000,49000], d:6000, star:true },
  { id:"9pmelix", marca:"Afnan", nombre:"9PM Elixir", ml:100, gen:"H", fam:"gourmand", notas:["Frutas","Canela","Tonka","Vainilla intensa"], p:[67000,66000,64200,62800], d:7000 },
  // FRENCH AVENUE
  { id:"brum100", marca:"French Avenue", nombre:"Liquid Brum", ml:100, gen:"H", fam:"ambar", notas:["Lavanda","Especias dulces","Caramelo","Ámbar"], p:[84000,81000,77800,76000], d:8300 },
  { id:"brum150", marca:"French Avenue", nombre:"Liquid Brum", ml:150, gen:"H", fam:"ambar", notas:["Lavanda","Especias dulces","Caramelo","Ámbar"], p:[110000,104000,101000,98700], d:null },
  // XERJOFF
  { id:"erba", marca:"Xerjoff", nombre:"Erba Pura", ml:100, gen:"U", fam:"citrico", notas:["Cítricos de Sicilia","Frutas dulces","Almizcle blanco","Vainilla"], p:[330000,324000,317000,310000], d:24000, star:true },
  // AL HARAMAIN
  { id:"aoaqua", marca:"Al Haramain", nombre:"Amber Oud Aqua Dubai", ml:100, gen:"U", fam:"fresco", notas:["Cítricos","Notas verdes","Almizcle","Maderas"], p:[107000,105000,103000,100000], d:10500 },
  { id:"aogold", marca:"Al Haramain", nombre:"Amber Oud Gold Edition", ml:120, gen:"U", fam:"ambar", notas:["Bergamota","Melón","Ámbar","Vainilla"], p:[100000,98000,95000,93500], d:8600, star:true },
  { id:"aonight", marca:"Al Haramain", nombre:"Amber Oud Dubai Night", ml:100, gen:"U", fam:"gourmand", notas:["Frutas","Caramelo","Ámbar","Pachulí"], p:[90000,88000,86000,84000], d:8600 },
  // LATTAFA
  { id:"qaedm", marca:"Lattafa", nombre:"Qaed Al Fursan Untamed (Marrón)", ml:90, gen:"H", fam:"ambar", notas:["Piña","Especias","Ámbar","Maderas"], p:[35000,34000,32500,31500], d:null },
  { id:"qaedn", marca:"Lattafa", nombre:"Qaed Al Fursan Untamed (Negro)", ml:90, gen:"H", fam:"oud", notas:["Especias","Humo","Ámbar","Maderas oscuras"], p:[35000,34000,32500,31500], d:null },
  { id:"anaab", marca:"Lattafa", nombre:"Ana Abiyedh", ml:60, gen:"U", fam:"ambar", notas:["Azafrán","Ámbar gris","Vainilla","Maderas"], p:[38000,36000,35000,34000], d:null },
  { id:"analeather", marca:"Lattafa", nombre:"Ana Abiyedh Leather", ml:60, gen:"U", fam:"oud", notas:["Cuero","Azafrán","Ámbar","Maderas"], p:[38000,36000,35000,34000], d:null },
  { id:"anascarlet", marca:"Lattafa", nombre:"Ana Abiyedh Scarlet", ml:60, gen:"M", fam:"floral", notas:["Frutas rojas","Rosa","Vainilla","Almizcle"], p:[38000,36000,35000,34000], d:null },
  { id:"anarouge", marca:"Lattafa", nombre:"Ana Abiyedh Rouge", ml:60, gen:"U", fam:"ambar", notas:["Azafrán","Jazmín","Ámbar gris","Cedro"], p:[38000,36000,35000,34000], d:null },
  { id:"hisconf", marca:"Lattafa", nombre:"His Confession", ml:100, gen:"H", fam:"gourmand", notas:["Caramelo","Lavanda","Tonka","Vainilla"], p:[62000,60400,58800,57500], d:6400 },
  { id:"kingdom", marca:"Lattafa", nombre:"The Kingdom", ml:100, gen:"U", fam:"ambar", notas:["Especias","Frutas","Ámbar","Vainilla"], p:[56000,55300,54500,53000], d:6000 },
  { id:"confgold", marca:"Lattafa", nombre:"Confidencial Gold", ml:100, gen:"U", fam:"ambar", notas:["Miel","Especias","Ámbar","Maderas"], p:[40000,39000,38000,37000], d:null },
  { id:"angham", marca:"Lattafa", nombre:"Angham", ml:100, gen:"M", fam:"floral", notas:["Flores blancas","Frutas","Vainilla","Almizcle"], p:[50000,48000,46700,45700], d:6000 },
  { id:"secondsong", marca:"Lattafa", nombre:"Second Song", ml:100, gen:"M", fam:"gourmand", notas:["Frutas","Caramelo","Vainilla","Almizcle"], p:[57000,55800,54400,53200], d:6400 },
  { id:"asadbourbon", marca:"Lattafa", nombre:"Asad Bourbon", ml:100, gen:"H", fam:"gourmand", notas:["Bourbon","Especias","Cuero","Vainilla"], p:[61000,60400,58800,57500], d:6500 },
  { id:"asadelix", marca:"Lattafa", nombre:"Asad Elixir", ml:100, gen:"H", fam:"ambar", notas:["Canela","Tabaco","Benjuí","Vainilla"], p:[58000,57000,56000,55000], d:6300 },
  { id:"asad", marca:"Lattafa", nombre:"Asad", ml:100, gen:"H", fam:"ambar", notas:["Pimienta negra","Café","Tabaco","Vainilla"], p:[55000,53700,52500,51200], d:6000, star:true },
  { id:"yarapink", marca:"Lattafa", nombre:"Yara Pink", ml:100, gen:"M", fam:"floral", notas:["Orquídea","Heliotropo","Coco","Vainilla"], p:[48000,45900,44600,43700], d:5500, star:true },
  { id:"yaraelix", marca:"Lattafa", nombre:"Yara Elixir", ml:100, gen:"M", fam:"gourmand", notas:["Frutas tropicales","Flores","Caramelo","Vainilla"], p:[59000,57000,55500,54300], d:6500 },
  { id:"yaramoi", marca:"Lattafa", nombre:"Yara Moi", ml:100, gen:"M", fam:"floral", notas:["Frambuesa","Flores cremosas","Vainilla","Almizcle"], p:[45000,44000,42500,41500], d:5500 },
  { id:"yaracandy", marca:"Lattafa", nombre:"Yara Candy", ml:100, gen:"M", fam:"gourmand", notas:["Caramelo","Frutas","Vainilla","Azúcar"], p:[45000,44000,42500,41500], d:5500 },
  { id:"mayar", marca:"Lattafa", nombre:"Mayar Cherry Intense", ml:100, gen:"M", fam:"gourmand", notas:["Cereza","Almendra","Vainilla","Tonka"], p:[45000,44000,42500,41500], d:5500 },
  { id:"badeehonor", marca:"Lattafa", nombre:"Badee Al Oud Honor & Glory", ml:100, gen:"U", fam:"gourmand", notas:["Piña","Pera","Crema","Maderas"], p:[46000,44700,43700,42600], d:5500 },
  { id:"badeeblush", marca:"Lattafa", nombre:"Badee Al Oud Noble Blush", ml:100, gen:"M", fam:"floral", notas:["Rosa","Frutas","Oud suave","Vainilla"], p:[46000,44700,43700,42600], d:5500 },
  { id:"badeesub", marca:"Lattafa", nombre:"Badee Al Oud Sublime", ml:100, gen:"U", fam:"oud", notas:["Oud","Azafrán","Ámbar","Maderas"], p:[46000,44700,43700,42600], d:5500 },
  { id:"eclaire", marca:"Lattafa", nombre:"Eclaire", ml:100, gen:"M", fam:"gourmand", notas:["Caramelo","Leche","Avellana","Vainilla"], p:[54000,52600,51100,50100], d:6000 },
  { id:"khamqahwa", marca:"Lattafa", nombre:"Khamrah Qahwa", ml:100, gen:"U", fam:"gourmand", notas:["Café","Cardamomo","Canela","Dulce de leche"], p:[46000,44700,43700,42600], d:5500 },
  { id:"khamrah", marca:"Lattafa", nombre:"Khamrah", ml:100, gen:"U", fam:"gourmand", notas:["Canela","Dátiles","Whisky","Vainilla"], p:[46000,44700,43700,42600], d:5500, star:true },
  { id:"khamdukhan", marca:"Lattafa", nombre:"Khamrah Dukhan", ml:100, gen:"U", fam:"oud", notas:["Humo","Incienso","Especias","Vainilla"], p:[46000,44700,43700,42600], d:5500 },
].map(x => ({ ...x, cat: "perfume", img: null }));

const OTROS = [
  { id:"deoalhambra", marca:"Maison Alhambra", nombre:"Desodorante Árabe", ml:200, cat:"deo", fam:"ambar", notas:["Larga duración","Aroma intenso"], p:[8000,7500,7000,6000], d:null, img:null },
  { id:"deolattafa", marca:"Lattafa", nombre:"Desodorante Árabe", ml:200, cat:"deo", fam:"ambar", notas:["Larga duración","Aroma intenso"], p:[8000,7500,7000,6000], d:null, img:null },
  { id:"deoarmaf", marca:"Armaf", nombre:"Desodorante Árabe", ml:200, cat:"deo", fam:"fresco", notas:["Larga duración","Aroma intenso"], p:[9000,8500,8000,7000], d:null, img:null },
  { id:"vsplash", marca:"Victoria's Secret", nombre:"Body Splash", ml:250, cat:"splash", fam:"floral", notas:["Varias fragancias","Consultar stock"], p:[31000,29000,26000,23500], d:null, img:null },
  { id:"vsplashsh", marca:"Victoria's Secret", nombre:"Body Splash Shimmer", ml:250, cat:"splash", fam:"floral", notas:["Con brillos","Varias fragancias"], p:[32000,30000,27000,24800], d:null, img:null },
];

const ALL = [...PERFUMES, ...OTROS];
const MARCAS = ["Todas", ...new Set(PERFUMES.map(p => p.marca))];

const fmt = n => "$" + n.toLocaleString("es-AR");

/* ---- PRECIO MAYORISTA POR TOTAL DEL CARRITO ----
   El tier se decide con la suma de unidades (frascos) de TODA
   la categoría en el carrito, no por producto individual. */
function tierIndex(cat, totalUnits) {
  const tiers = TIERS[cat];
  let idx = 0;
  tiers.forEach((t, i) => { if (totalUnits >= t) idx = i; });
  return idx;
}

function Bottle({ fam, size = 120 }) {
  const f = FAM[fam] || FAM.ambar;
  const gid = "g" + fam + size;
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 100 125" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={f.c1} />
          <stop offset="100%" stopColor={f.c2} />
        </linearGradient>
      </defs>
      <rect x="42" y="8" width="16" height="12" rx="2" fill="#2E2A24" />
      <rect x="40" y="18" width="20" height="6" rx="2" fill="#C2A368" />
      <path d="M30 32 Q30 24 38 24 L62 24 Q70 24 70 32 L74 96 Q74 112 50 112 Q26 112 26 96 Z" fill={`url(#${gid})`} stroke="#00000022" strokeWidth="1" />
      <path d="M34 36 Q35 30 40 29 L44 29 Q38 34 38 44 L36 84 Q33 60 34 36 Z" fill="#ffffff44" />
      <ellipse cx="50" cy="70" rx="15" ry="19" fill="#00000018" />
      <ellipse cx="50" cy="70" rx="14" ry="18" fill="none" stroke="#FFFFFF66" strokeWidth="1" />
    </svg>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');
:root{
  --bg:#FAF8F4; --surface:#FFFFFF; --surface2:#F2EEE6; --line:#E4DFD3;
  --ink:#161513; --muted:#8B8576; --gold:#A8853B; --gold2:#C7A45C; --ok:#3D7A50;
}
*{box-sizing:border-box;margin:0;padding:0}
.ay{background:var(--bg);min-height:100vh;color:var(--ink);font-family:'Jost',sans-serif;font-weight:300;letter-spacing:.01em}
.serif{font-family:'Playfair Display',serif}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px}
/* header */
.hdr{position:sticky;top:0;z-index:40;backdrop-filter:blur(14px);background:#FAF8F4E6;border-bottom:1px solid var(--line)}
.hdr-in{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;max-width:1180px;margin:0 auto}
.logo{font-family:'Playfair Display',serif;font-size:27px;font-weight:600;letter-spacing:.01em;color:var(--ink);line-height:1}
.logo em{font-style:normal;font-weight:400}
.logo small{display:block;font-family:'Jost';font-weight:400;font-size:9.5px;letter-spacing:.55em;color:var(--muted);text-transform:lowercase;margin-top:3px}
.cartbtn{position:relative;background:var(--ink);border:1px solid var(--ink);color:#FAF8F4;padding:10px 20px;border-radius:99px;cursor:pointer;font-family:'Jost';letter-spacing:.08em;font-size:13px;transition:.25s}
.cartbtn:hover{background:#000}
.badge{position:absolute;top:-7px;right:-7px;background:var(--gold);color:#fff;font-size:11px;font-weight:600;border-radius:99px;min-width:19px;height:19px;display:grid;place-items:center;padding:0 4px}
/* hero */
.hero{text-align:center;padding:62px 20px 36px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#FFFFFF 0%,var(--bg) 100%)}
.hero .eyebrow{letter-spacing:.5em;font-size:11px;color:var(--gold);text-transform:uppercase}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(38px,6.5vw,68px);font-weight:500;line-height:1.08;margin:14px 0 10px}
.hero h1 em{font-style:italic;color:var(--gold)}
.hero p{color:var(--muted);max-width:540px;margin:0 auto;font-size:15px}
.ship{display:inline-flex;gap:8px;align-items:center;margin-top:20px;border:1px solid var(--line);background:#fff;border-radius:99px;padding:8px 18px;font-size:12.5px;color:var(--ink);letter-spacing:.04em}
.ship b{color:var(--gold);font-weight:500}
/* tools */
.tools{display:flex;flex-direction:column;gap:14px;padding:26px 0 22px}
.search{width:100%;max-width:440px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:99px;color:var(--ink);padding:12px 22px;font-family:'Jost';font-size:14px;outline:none;transition:.25s}
.search:focus{border-color:var(--gold)}
.chips{display:flex;gap:8px;overflow-x:auto;padding:4px 2px;scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.chip{flex:0 0 auto;border:1px solid var(--line);background:#fff;color:var(--muted);padding:7px 16px;border-radius:99px;cursor:pointer;font-family:'Jost';font-size:12.5px;letter-spacing:.06em;transition:.25s}
.chip.on{background:var(--ink);color:#FAF8F4;border-color:var(--ink);font-weight:400}
.chip:hover:not(.on){border-color:var(--gold);color:var(--ink)}
/* sections */
.sect{padding:8px 0 38px}
.sect h2{font-family:'Playfair Display',serif;font-size:28px;font-weight:500;letter-spacing:.03em;display:flex;align-items:center;gap:16px;margin-bottom:20px}
.sect h2::after{content:"";flex:1;height:1px;background:var(--line)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(225px,1fr));gap:16px}
/* card */
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px 16px 16px;cursor:pointer;transition:transform .3s,box-shadow .3s,border-color .3s;position:relative;display:flex;flex-direction:column;align-items:center;text-align:center}
.card:hover{transform:translateY(-5px);border-color:var(--gold2);box-shadow:0 14px 30px #00000012}
.card .star{position:absolute;top:12px;left:12px;font-size:10px;letter-spacing:.2em;color:var(--gold);border:1px solid var(--gold2);border-radius:99px;padding:3px 9px;text-transform:uppercase;background:#fff}
.card .gen{position:absolute;top:12px;right:12px;font-size:11px;color:var(--muted)}
.card .imgbox{height:128px;display:grid;place-items:center;margin:8px 0 6px}
.card .imgbox img{max-height:128px;max-width:100%;object-fit:contain;filter:drop-shadow(0 8px 14px #00000022)}
.card .brand{font-size:10.5px;letter-spacing:.32em;color:var(--gold);text-transform:uppercase}
.card h3{font-family:'Playfair Display',serif;font-size:18px;font-weight:600;margin:5px 0 2px;line-height:1.18}
.card .ml{font-size:12px;color:var(--muted)}
.card .notes{font-size:11.5px;color:var(--muted);margin-top:7px;line-height:1.5;min-height:34px}
.card .price{font-size:19px;color:var(--ink);margin-top:8px;font-weight:400}
.card .decant{font-size:11.5px;color:var(--muted);margin-top:2px}
/* modal */
.ovl{position:fixed;inset:0;background:#1F1B14B3;z-index:60;display:grid;place-items:center;padding:18px;animation:fade .25s}
@keyframes fade{from{opacity:0}to{opacity:1}}
.modal{background:var(--bg);border:1px solid var(--line);border-radius:18px;max-width:680px;width:100%;max-height:92vh;overflow-y:auto;padding:30px;position:relative;animation:up .3s}
@keyframes up{from{transform:translateY(18px);opacity:0}to{transform:none;opacity:1}}
.x{position:absolute;top:14px;right:16px;background:none;border:none;color:var(--muted);font-size:24px;cursor:pointer}
.m-head{display:flex;gap:24px;align-items:center;flex-wrap:wrap}
.m-head .imgbox img{max-height:170px;filter:drop-shadow(0 12px 20px #00000022)}
.m-info .brand{font-size:11px;letter-spacing:.34em;color:var(--gold);text-transform:uppercase}
.m-info h2{font-family:'Playfair Display',serif;font-size:32px;font-weight:500;line-height:1.08;margin:6px 0 4px}
.fam-tag{display:inline-block;font-size:11.5px;color:var(--gold);border:1px solid var(--gold2);background:#fff;border-radius:99px;padding:4px 12px;margin-top:8px;letter-spacing:.08em}
/* pyramid */
.pyr{margin:24px 0 8px}
.pyr h4{font-size:11px;letter-spacing:.34em;color:var(--muted);text-transform:uppercase;margin-bottom:12px}
.pyr .row{display:flex;flex-wrap:wrap;gap:8px}
.note{background:#fff;border:1px solid var(--line);border-radius:99px;padding:6px 14px;font-size:13px}
/* tiers */
.mayhint{font-size:12.5px;color:var(--ok);background:#3D7A5012;border:1px solid #3D7A5033;border-radius:10px;padding:9px 14px;margin:18px 0 10px;line-height:1.5}
.tiers{margin:0 0 20px;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}
.tiers .tr{display:grid;grid-template-columns:1fr 1fr;padding:11px 18px;font-size:14px;border-bottom:1px solid var(--surface2)}
.tiers .tr:last-child{border:none}
.tiers .tr span:last-child{text-align:right}
.tiers .tr.head{background:var(--surface2);color:var(--muted);font-size:11px;letter-spacing:.2em;text-transform:uppercase}
.tiers .tr.hit{background:#A8853B14;font-weight:500}
.tiers .tr.hit span:last-child{color:var(--gold)}
/* buy */
.buy{display:flex;gap:10px;flex-wrap:wrap;align-items:stretch;margin-top:6px}
.qty{display:flex;border:1px solid var(--line);border-radius:99px;overflow:hidden;background:#fff}
.qty button{background:none;border:none;color:var(--ink);width:42px;font-size:18px;cursor:pointer}
.qty span{display:grid;place-items:center;min-width:44px;font-size:15px}
.btn{border:none;border-radius:99px;padding:13px 26px;font-family:'Jost';font-size:13.5px;letter-spacing:.1em;cursor:pointer;transition:.25s;text-transform:uppercase}
.btn:disabled{opacity:.45;cursor:default}
.btn.dark{background:var(--ink);color:#FAF8F4;font-weight:500;flex:1}
.btn.dark:hover{background:#000}
.btn.ghost{background:#fff;border:1px solid var(--line);color:var(--ink)}
.btn.ghost.on{border-color:var(--ink);font-weight:500}
.btn.mp{background:#009EE3;color:#fff;font-weight:600;width:100%}
.btn.wa{background:#1FA855;color:#fff;width:100%}
/* drawer */
.drawer{position:fixed;top:0;right:0;height:100vh;width:min(430px,100vw);background:var(--bg);border-left:1px solid var(--line);z-index:70;display:flex;flex-direction:column;animation:slide .3s;box-shadow:-20px 0 50px #00000022}
@keyframes slide{from{transform:translateX(60px);opacity:0}to{transform:none;opacity:1}}
.d-head{padding:20px 22px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center}
.d-head h3{font-family:'Playfair Display',serif;font-size:24px;font-weight:500}
.d-body{flex:1;overflow-y:auto;padding:14px 22px}
.d-item{display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--surface2)}
.d-item .t{flex:1}
.d-item .t b{font-weight:500;font-size:14px;display:block}
.d-item .t small{color:var(--muted);font-size:12px}
.d-item .p{font-size:14px;white-space:nowrap}
.d-foot{padding:18px 22px;border-top:1px solid var(--line);background:#fff}
.shipbar{margin-bottom:14px}
.shipbar .lbl{font-size:12px;color:var(--muted);margin-bottom:6px}
.shipbar .bar{height:5px;background:var(--surface2);border-radius:99px;overflow:hidden}
.shipbar .fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));transition:width .4s}
.tierline{font-size:12.5px;color:var(--ok);margin-bottom:10px}
.total{display:flex;justify-content:space-between;font-size:18px;margin:8px 0 6px}
.total span:last-child{font-weight:600}
.savings{font-size:12.5px;color:var(--ok);text-align:right;margin-bottom:12px}
.empty{text-align:center;color:var(--muted);padding:60px 10px;font-size:14px}
.foot{border-top:1px solid var(--line);margin-top:30px;padding:34px 20px;text-align:center;color:var(--muted);font-size:12.5px;letter-spacing:.06em;background:#fff}
.foot .flogo{font-family:'Playfair Display',serif;font-size:22px;font-weight:600;color:var(--ink);letter-spacing:.01em}
.foot .flogo span{font-weight:400}
@media(max-width:540px){
  .grid{grid-template-columns:repeat(2,1fr)}
  .modal{padding:22px}
  .m-head{gap:14px}
}
`;

export default function App() {
  const [marca, setMarca] = useState("Todas");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [qty, setQty] = useState(1);
  const [pres, setPres] = useState("full");
  const [cart, setCart] = useState([]);
  const [openCart, setOpenCart] = useState(false);

  useEffect(() => { setQty(1); setPres("full"); }, [sel]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return ALL.filter(p =>
      (!t || (p.nombre + " " + p.marca + " " + p.notas.join(" ")).toLowerCase().includes(t))
    );
  }, [q]);

  const perf = filtered.filter(p => p.cat === "perfume" && (marca === "Todas" || p.marca === marca));
  const deos = filtered.filter(p => p.cat === "deo");
  const splash = filtered.filter(p => p.cat === "splash");

  /* --- totales por categoría (solo frascos, no decants) --- */
  const catTotal = cat => cart.filter(l => l.pres === "full" && l.item.cat === cat).reduce((s, l) => s + l.qty, 0);
  const totPerf = catTotal("perfume"), totDeo = catTotal("deo"), totSplash = catTotal("splash");
  const idxFor = cat => tierIndex(cat, cat === "perfume" ? totPerf : cat === "deo" ? totDeo : totSplash);

  const unitPrice = l => l.pres === "decant" ? l.item.d : l.item.p[idxFor(l.item.cat)];
  const lineTotal = l => unitPrice(l) * l.qty;
  const lineBase  = l => (l.pres === "decant" ? l.item.d : l.item.p[0]) * l.qty;
  const total = cart.reduce((s, l) => s + lineTotal(l), 0);
  const saved = cart.reduce((s, l) => s + (lineBase(l) - lineTotal(l)), 0);

  const nDec = cart.filter(l => l.pres === "decant").reduce((s, l) => s + l.qty, 0);
  const freeShip = totPerf >= 12 || (totPerf >= 5 && totDeo >= 30) || nDec >= 10;
  const shipProg = Math.min(100, Math.max(totPerf / 12, nDec / 10) * 100);

  const addToCart = (item, presKind, n) => {
    setCart(c => {
      const i = c.findIndex(l => l.item.id === item.id && l.pres === presKind);
      if (i >= 0) { const nc = [...c]; nc[i] = { ...nc[i], qty: nc[i].qty + n }; return nc; }
      return [...c, { item, pres: presKind, qty: n }];
    });
    setSel(null); setOpenCart(true);
  };
  const setLineQty = (i, q2) => setCart(c => q2 <= 0 ? c.filter((_, j) => j !== i) : c.map((l, j) => j === i ? { ...l, qty: q2 } : l));

  const waMsg = () => {
    const lines = ["Hola Ayle.imp! Quiero hacer este pedido:", ""];
    cart.forEach(l => {
      const det = l.pres === "decant" ? "DECANT 5ml" : `Frasco ${l.item.ml}ml`;
      lines.push(`- ${l.qty}x ${l.item.nombre} (${det}): ${fmt(unitPrice(l))} c/u = ${fmt(lineTotal(l))}`);
    });
    if (totPerf >= 5) lines.push("", `(${totPerf} perfumes en total: precio mayorista aplicado)`);
    lines.push("", `*Total: ${fmt(total)}*`);
    if (freeShip) lines.push("Envio gratis incluido ✔");
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const payMP = async () => {
    /* ====== INTEGRACIÓN MERCADO PAGO (Checkout Pro) ======
       Necesita un backend mínimo que cree la preferencia con tu
       Access Token y devuelva el init_point:

       const r = await fetch("https://TU-BACKEND/crear-preferencia", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ items: cart.map(l => ({
           title: l.item.nombre + (l.pres === "decant" ? " Decant 5ml" : ""),
           quantity: l.qty,
           unit_price: unitPrice(l),
           currency_id: "ARS",
         })) }),
       });
       const { init_point } = await r.json();
       window.location.href = init_point;
    ====================================================== */
    alert("Para cobrar con Mercado Pago hay que conectar tu cuenta (Checkout Pro) con un backend mínimo. El código ya está preparado en la función payMP(). Mientras tanto, podés cerrar la venta por WhatsApp.");
  };

  /* tier que se mostraría si agrego qty unidades de sel al carrito */
  const projTotal = sel && sel.cat ? (sel.cat === "perfume" ? totPerf : sel.cat === "deo" ? totDeo : totSplash) + (pres === "full" ? qty : 0) : 0;
  const projIdx = sel ? tierIndex(sel.cat, Math.max(1, projTotal)) : 0;
  const unitNow = sel ? (pres === "decant" ? sel.d : sel.p[projIdx]) : 0;
  const tiers = sel ? TIERS[sel.cat] : [];
  const catName = sel ? (sel.cat === "perfume" ? "perfumes" : sel.cat === "deo" ? "desodorantes" : "body splash") : "";

  const Card = ({ p }) => (
    <article className="card" onClick={() => setSel(p)}>
      {p.star && <span className="star">Top</span>}
      {p.gen && <span className="gen">{p.gen === "H" ? "♂" : p.gen === "M" ? "♀" : "⚥"}</span>}
      <div className="imgbox">
        {p.img ? <img src={p.img} alt={p.nombre} /> : <Bottle fam={p.fam} size={90} />}
      </div>
      <span className="brand">{p.marca}</span>
      <h3>{p.nombre}</h3>
      <span className="ml">{p.ml} ml{p.cat === "perfume" ? " · EDP" : ""}</span>
      <p className="notes">{p.notas.slice(0, 3).join(" · ")}</p>
      <span className="price">{fmt(p.p[0])}</span>
      {p.d && <span className="decant">Decant 5ml · {fmt(p.d)}</span>}
    </article>
  );

  return (
    <div className="ay">
      <style>{css}</style>

      <header className="hdr">
        <div className="hdr-in">
          <div className="logo">Ayle<em>.imp</em><small>d i s t r i b u i d o r a</small></div>
          <button className="cartbtn" onClick={() => setOpenCart(true)}>
            Carrito {cart.length > 0 && <span className="badge">{cart.reduce((s, l) => s + l.qty, 0)}</span>}
          </button>
        </div>
      </header>

      <section className="hero">
        <span className="eyebrow">Perfumería árabe importada</span>
        <h1>El aroma que te <em>define</em></h1>
        <p>Fragancias originales de Lattafa, Armaf, Rasasi, Afnan y más. Frascos sellados, decants de 5 ml y precios mayoristas combinando productos.</p>
        <div className="ship">✦ <b>Mayorista combinando:</b>&nbsp;5+ perfumes distintos ya pagan precio de 5 · Envío gratis a Bs. As. con 12 perfumes o 10 decants</div>
      </section>

      <main className="wrap">
        <div className="tools">
          <input className="search" placeholder="Buscar por nombre, marca o nota (vainilla, oud, cereza...)" value={q} onChange={e => setQ(e.target.value)} />
          <div className="chips">
            {MARCAS.map(m => (
              <button key={m} className={"chip" + (marca === m ? " on" : "")} onClick={() => setMarca(m)}>{m}</button>
            ))}
          </div>
        </div>

        {perf.length > 0 && (
          <section className="sect"><h2>Perfumes</h2><div className="grid">{perf.map(p => <Card key={p.id} p={p} />)}</div></section>
        )}
        {deos.length > 0 && (
          <section className="sect"><h2>Desodorantes árabes</h2><div className="grid">{deos.map(p => <Card key={p.id} p={p} />)}</div></section>
        )}
        {splash.length > 0 && (
          <section className="sect"><h2>Body Splash</h2><div className="grid">{splash.map(p => <Card key={p.id} p={p} />)}</div></section>
        )}
        {perf.length + deos.length + splash.length === 0 && (
          <p className="empty">No encontramos productos con esa búsqueda. Probá con otra nota o marca.</p>
        )}
      </main>

      {/* ===== MODAL PRODUCTO ===== */}
      {sel && (
        <div className="ovl" onClick={() => setSel(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="x" onClick={() => setSel(null)}>×</button>
            <div className="m-head">
              <div className="imgbox">
                {sel.img ? <img src={sel.img} alt={sel.nombre} /> : <Bottle fam={sel.fam} size={128} />}
              </div>
              <div className="m-info">
                <span className="brand">{sel.marca}</span>
                <h2>{sel.nombre}</h2>
                <span style={{ color: "var(--muted)", fontSize: 13 }}>{sel.ml} ml{sel.cat === "perfume" ? " · Eau de Parfum" : ""}</span>
                <div><span className="fam-tag">{FAM[sel.fam].label}</span></div>
              </div>
            </div>

            <div className="pyr">
              <h4>Notas destacadas</h4>
              <div className="row">{sel.notas.map(n => <span className="note" key={n}>{n}</span>)}</div>
            </div>

            <div className="mayhint">
              ✦ El precio mayorista se aplica <b>sumando todos los {catName} del carrito</b>, aunque sean distintos.
              {pres === "full" && projTotal > 0 && ` Con este agregado llevás ${projTotal} en total → pagás la columna de "${TIERS[sel.cat][projIdx]}${projIdx < 3 ? "+" : "+"} u."`}
            </div>

            <div className="tiers">
              <div className="tr head"><span>Total de {catName} en el carrito</span><span>Precio por unidad</span></div>
              {tiers.map((t, i) => {
                const next = tiers[i + 1];
                const hit = pres === "full" && projIdx === i;
                return (
                  <div className={"tr" + (hit ? " hit" : "")} key={t}>
                    <span>{next ? `${t} a ${next - 1} u.` : `${t}+ u.`}</span>
                    <span>{fmt(sel.p[i])}</span>
                  </div>
                );
              })}
              {sel.d && (
                <div className={"tr" + (pres === "decant" ? " hit" : "")}>
                  <span>Decant 5 ml (precio fijo)</span><span>{fmt(sel.d)}</span>
                </div>
              )}
            </div>

            {sel.d && (
              <div className="buy" style={{ marginBottom: 12 }}>
                <button className={"btn ghost" + (pres === "full" ? " on" : "")} onClick={() => setPres("full")}>Frasco {sel.ml}ml</button>
                <button className={"btn ghost" + (pres === "decant" ? " on" : "")} onClick={() => setPres("decant")}>Decant 5ml</button>
              </div>
            )}

            <div className="buy">
              <div className="qty">
                <button onClick={() => setQty(x => Math.max(1, x - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(x => x + 1)}>+</button>
              </div>
              <button className="btn dark" onClick={() => addToCart(sel, pres, qty)}>
                Agregar · {fmt(unitNow * qty)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CARRITO ===== */}
      {openCart && (
        <>
          <div className="ovl" style={{ animation: "none" }} onClick={() => setOpenCart(false)} />
          <aside className="drawer">
            <div className="d-head">
              <h3>Tu pedido</h3>
              <button className="x" style={{ position: "static" }} onClick={() => setOpenCart(false)}>×</button>
            </div>
            <div className="d-body">
              {cart.length === 0 && <p className="empty">Tu carrito está vacío.<br />Elegí una fragancia para empezar.</p>}
              {cart.map((l, i) => (
                <div className="d-item" key={l.item.id + l.pres}>
                  <Bottle fam={l.item.fam} size={34} />
                  <div className="t">
                    <b>{l.item.nombre}</b>
                    <small>{l.pres === "decant" ? "Decant 5ml" : l.item.ml + "ml"} · {fmt(unitPrice(l))} c/u</small>
                  </div>
                  <div className="qty" style={{ transform: "scale(.82)" }}>
                    <button onClick={() => setLineQty(i, l.qty - 1)}>−</button>
                    <span>{l.qty}</span>
                    <button onClick={() => setLineQty(i, l.qty + 1)}>+</button>
                  </div>
                  <span className="p">{fmt(lineTotal(l))}</span>
                </div>
              ))}
            </div>
            <div className="d-foot">
              {totPerf > 0 && (
                <div className="tierline">
                  {totPerf >= 5
                    ? `✓ ${totPerf} perfumes en el carrito → precio mayorista de "${TIERS.perfume[idxFor("perfume")]}+ u." aplicado a todos`
                    : `Llevás ${totPerf} perfume${totPerf > 1 ? "s" : ""} — sumá ${5 - totPerf} más (de cualquier fragancia) y todos bajan a precio mayorista`}
                </div>
              )}
              <div className="shipbar">
                <div className="lbl">
                  {freeShip ? "✓ ¡Tenés envío gratis a Bs. As.!" :
                    `Envío gratis con 12 perfumes (llevás ${totPerf}) o 10 decants (llevás ${nDec})`}
                </div>
                <div className="bar"><div className="fill" style={{ width: (freeShip ? 100 : shipProg) + "%" }} /></div>
              </div>
              <div className="total"><span>Total</span><span>{fmt(total)}</span></div>
              {saved > 0 && <div className="savings">Estás ahorrando {fmt(saved)} con el precio mayorista ✦</div>}
              <button className="btn mp" disabled={cart.length === 0} onClick={payMP}>Pagar con Mercado Pago</button>
              <div style={{ height: 8 }} />
              <a href={cart.length ? waMsg() : undefined} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <button className="btn wa" disabled={cart.length === 0}>Finalizar por WhatsApp</button>
              </a>
            </div>
          </aside>
        </>
      )}

      <footer className="foot">
        <div className="flogo">Ayle<span>.imp</span></div>
        <div style={{ letterSpacing: ".45em", fontSize: 10, margin: "4px 0 14px" }}>D I S T R I B U I D O R A</div>
        Perfumería árabe importada · Zárate, Buenos Aires<br />
        Instagram: @{INSTAGRAM} · Gracias por elegirnos ✦
      </footer>
    </div>
  );
}
