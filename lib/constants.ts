// ─── SAP Constants — Shilpi Architects & Planners ───

export interface LabStat {
  v: string;
  l: string;
}

export interface LabRecentItem {
  title: string;
  type?: string; // italic suffix e.g. "/ residential"
  year: string;
}

export type GlyphType = "building" | "graph" | "target" | "grid";

export interface Lab {
  id: string;
  title: string;         // JSX-safe: may contain markup hints
  titleMain: string;
  titleItalic?: string;
  titleBlue?: string;
  titleSuffix?: string;
  badge: string;
  badgeActive: boolean;
  desc: string;
  stats: LabStat[];
  recent: LabRecentItem[];
  enterLabel: string;
  glyphType: GlyphType;
}

export const LABS: Lab[] = [
  {
    id: "SAP · 01",
    title: "The Atelier",
    titleMain: "The ",
    titleItalic: "Atelier",
    titleSuffix: undefined,
    badge: "▌ Active · 18",
    badgeActive: true,
    desc: "The architectural consultancy at the centre of the studio — civic buildings, courtyards, master plans, adaptive reuse. Where commissions land first, and where most cross-lab work returns to be built.",
    stats: [
      { v: "18", l: "Active" },
      { v: "42", l: "Built" },
      { v: "7", l: "Architects" },
    ],
    recent: [
      { title: "The Sky Pavilion", type: "/ residential", year: "2024" },
      { title: "Geometric Courtyard", year: "2023" },
      { title: "Minimalist Atrium Residence", year: "2022" },
    ],
    enterLabel: "Enter Atelier",
    glyphType: "building",
  },
  {
    id: "SAP · 02",
    title: "Urban Futures Lab",
    titleMain: "Urban ",
    titleItalic: "Futures",
    titleSuffix: " Lab",
    badge: "▌ Active · 7",
    badgeActive: true,
    desc: "A speculative research arm studying the Indian city in transition — corridor urbanism, climate adaptation, heritage futures. Outputs: atlases, exhibitions, white papers, occasional buildings.",
    stats: [
      { v: "07", l: "Studies" },
      { v: "14", l: "Published" },
      { v: "3", l: "Fellows" },
    ],
    recent: [
      { title: "Thiruvananthapuram Peace Index 2023", type: "/ Publications", year: "2023" },
    ],
    enterLabel: "Enter Lab",
    glyphType: "graph",
  },
  {
    id: "SAP · 03",
    title: "AI & Computation",
    titleMain: "AI & ",
    titleBlue: "Computation",
    titleSuffix: undefined,
    badge: "▌ Active · 5",
    badgeActive: true,
    desc: "Generative design, ML-aided masterplanning, computational typology. We build internal tools that learn from regional vernaculars and reason about land, climate, and policy together.",
    stats: [
      { v: "05", l: "Tools" },
      { v: "11", l: "Models" },
      { v: "2", l: "Researchers" },
    ],
    recent: [
      { title: "Intelligence Aggregation Architecture", type: "/ Pedagogy", year: "2023" },
      { title: "Antithesys Labs", type: "/ Tools", year: "2024" },
      { title: "Exploring Artificial Intelligence...", type: "/ Tools", year: "2024" },
    ],
    enterLabel: "Enter Lab",
    glyphType: "target",
  },
  {
    id: "SAP · 04",
    title: "Civic Reform Studio",
    titleMain: "Civic ",
    titleItalic: "Reform",
    titleSuffix: " Studio",
    badge: "▌ Active · 9",
    badgeActive: true,
    desc: "Embedded engagements with municipalities and planning authorities. We design instruments — TDR frameworks, FSI bonuses, reform pilots — and teach the cadres who use them.",
    stats: [
      { v: "09", l: "Engagements" },
      { v: "22", l: "Officials" },
      { v: "4", l: "States" },
    ],
    recent: [
      { title: "Certificates & Recognition", type: "/ Recognition", year: "2024" },
      { title: "Bridging Academia and Practice...", type: "/ Academia", year: "2024" },
      { title: "Empowering Future Architects...", type: "/ Academia", year: "2024" },
    ],
    enterLabel: "Enter Studio",
    glyphType: "grid",
  },
];

export interface NewsItem {
  id: number;
  imgSrc: string;
  imgAlt: string;
  headline: string;
  date: string;
}

export const NEWS: NewsItem[] = [
  {
    id: 1,
    imgSrc: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
    imgAlt: "Greenery Space",
    headline: "SAP transforms a parking structure into an ecological civic ecosystem hub space",
    date: "04.11",
  },
  {
    id: 2,
    imgSrc: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    imgAlt: "Award",
    headline: "SAP Named to Global Creative Indices for Forward-Thinking Architectural Blueprinting 2026",
    date: "03.18",
  },
  {
    id: 3,
    imgSrc: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    imgAlt: "Development",
    headline: "Strategic development projects mapped for luxury resort complexes in regional high terrains",
    date: "12.10",
  },
  {
    id: 4,
    imgSrc: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80",
    imgAlt: "Interior",
    headline: "First internal walk-through parameters verified inside completed clock factory conversions",
    date: "10.11",
  },
];

export interface Category {
  id: number;
  label: string;
  count: number;
  imgSrc: string;
  imgAlt: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 1,
    label: "Architecture",
    count: 57,
    imgSrc: "/projects/Krushnakunja/Picture1.jpg",
    imgAlt: "Architecture",
  },
  {
    id: 2,
    label: "Interiors",
    count: 29,
    imgSrc: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
    imgAlt: "Interiors",
  },
  {
    id: 3,
    label: "Landscape",
    count: 20,
    imgSrc: "/projects/ashokkamthe/picture1.jpg",
    imgAlt: "Landscape",
  },
  {
    id: 4,
    label: "Urban Design",
    count: 6,
    imgSrc: "/projects/ramalalake/Picture1.jpg",
    imgAlt: "Urban Design",
  },
];

export interface MetricItem {
  target: number;
  label: string;
}

export const METRICS: MetricItem[] = [
  { target: 9, label: "Million Sqft Built" },
  { target: 150, label: "Buildings Designed" },
  { target: 70, label: "Awards Received" },
];
