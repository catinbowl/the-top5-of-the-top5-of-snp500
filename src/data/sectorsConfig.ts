export interface SectorConfig {
  name: string;
  category: 'Durables' | 'Non-Durables' | 'Services' | 'Infrastructure' | 'Minerals' | 'Manufacturing' | 'Other';
  color: string;
  accentColor: string;
  gradient: string;
  icon: string;
  description: string;
}

export const TRADINGVIEW_19_SECTORS: Record<string, SectorConfig> = {
  'Electronic Technology': {
    name: 'Electronic Technology',
    category: 'Durables',
    color: '#06b6d4', // cyan-500
    accentColor: 'rgba(6, 182, 212, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(14, 165, 233, 0.05) 100%)',
    icon: 'Cpu',
    description: 'Semiconductors, telecommunications equipment, computer hardware, electronics, and precision scientific instruments.',
  },
  'Technology Services': {
    name: 'Technology Services',
    category: 'Services',
    color: '#8b5cf6', // violet-500
    accentColor: 'rgba(139, 92, 246, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.05) 100%)',
    icon: 'Terminal',
    description: 'Cloud software, enterprise applications, internet software & services, IT consulting, and data processing.',
  },
  'Finance': {
    name: 'Finance',
    category: 'Infrastructure',
    color: '#10b981', // emerald-500
    accentColor: 'rgba(16, 185, 129, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.05) 100%)',
    icon: 'Landmark',
    description: 'Major global banks, investment brokerages, multi-line insurance, payment networks, asset management, and financial conglomerates.',
  },
  'Health Technology': {
    name: 'Health Technology',
    category: 'Durables',
    color: '#f43f5e', // rose-500
    accentColor: 'rgba(244, 63, 94, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(225, 29, 72, 0.05) 100%)',
    icon: 'Activity',
    description: 'Pharmaceuticals, biotechnology therapeutics, medical devices, diagnostics, and surgical instrumentation.',
  },
  'Retail Trade': {
    name: 'Retail Trade',
    category: 'Services',
    color: '#f59e0b', // amber-500
    accentColor: 'rgba(245, 158, 11, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.05) 100%)',
    icon: 'ShoppingBag',
    description: 'Internet retail giants, warehouse clubs, department stores, home improvement retailers, and specialty apparel chains.',
  },
  'Producer Manufacturing': {
    name: 'Producer Manufacturing',
    category: 'Manufacturing',
    color: '#3b82f6', // blue-500
    accentColor: 'rgba(59, 130, 246, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.05) 100%)',
    icon: 'Factory',
    description: 'Industrial machinery, heavy equipment, aerospace & defense, electrical equipment, and capital goods.',
  },
  'Consumer Non-Durables': {
    name: 'Consumer Non-Durables',
    category: 'Non-Durables',
    color: '#ec4899', // pink-500
    accentColor: 'rgba(236, 72, 153, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(219, 39, 119, 0.05) 100%)',
    icon: 'Coffee',
    description: 'Beverages, packaged foods, household & personal care items, tobacco, and everyday consumable staples.',
  },
  'Energy Minerals': {
    name: 'Energy Minerals',
    category: 'Minerals',
    color: '#ea580c', // orange-600
    accentColor: 'rgba(234, 88, 12, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(234, 88, 12, 0.25) 0%, rgba(194, 65, 12, 0.05) 100%)',
    icon: 'Flame',
    description: 'Integrated oil and gas exploration, crude petroleum extraction, refining, and marketing.',
  },
  'Consumer Durables': {
    name: 'Consumer Durables',
    category: 'Durables',
    color: '#14b8a6', // teal-500
    accentColor: 'rgba(20, 184, 166, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(13, 148, 136, 0.05) 100%)',
    icon: 'Car',
    description: 'Electric vehicles, automobiles, homebuilding, household appliances, and long-lasting consumer goods.',
  },
  'Utilities': {
    name: 'Utilities',
    category: 'Infrastructure',
    color: '#0284c7', // sky-600
    accentColor: 'rgba(2, 132, 199, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(3, 105, 161, 0.05) 100%)',
    icon: 'Zap',
    description: 'Electric power generation, regulated gas distribution, renewable clean energy, and multi-utilities.',
  },
  'Consumer Services': {
    name: 'Consumer Services',
    category: 'Services',
    color: '#a855f7', // purple-500
    accentColor: 'rgba(168, 85, 247, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(147, 51, 234, 0.05) 100%)',
    icon: 'Film',
    description: 'Entertainment media, streaming platforms, hotels, resorts, cruise lines, restaurants, and consumer leisure.',
  },
  'Transportation': {
    name: 'Transportation',
    category: 'Infrastructure',
    color: '#6366f1', // indigo-500
    accentColor: 'rgba(99, 102, 241, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.05) 100%)',
    icon: 'Truck',
    description: 'Railroads, air freight & logistics, passenger airlines, ridesharing, and commercial shipping.',
  },
  'Health Services': {
    name: 'Health Services',
    category: 'Services',
    color: '#10b981', // emerald-500
    accentColor: 'rgba(16, 185, 129, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.05) 100%)',
    icon: 'Cross',
    description: 'Managed healthcare organizations, health insurance providers, hospital networks, and medical clinics.',
  },
  'Process Industries': {
    name: 'Process Industries',
    category: 'Manufacturing',
    color: '#84cc16', // lime-500
    accentColor: 'rgba(132, 204, 22, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(132, 204, 22, 0.25) 0%, rgba(101, 163, 13, 0.05) 100%)',
    icon: 'FlaskConical',
    description: 'Industrial gases, specialty chemicals, coatings, agriculture science, packaging, and paper products.',
  },
  'Industrial Services': {
    name: 'Industrial Services',
    category: 'Services',
    color: '#0ea5e9', // sky-500
    accentColor: 'rgba(14, 165, 233, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(2, 132, 199, 0.05) 100%)',
    icon: 'Wrench',
    description: 'Waste management, environmental services, energy pipelines, oilfield equipment services, and industrial construction.',
  },
  'Commercial Services': {
    name: 'Commercial Services',
    category: 'Services',
    color: '#eab308', // yellow-500
    accentColor: 'rgba(234, 179, 8, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25) 0%, rgba(202, 138, 4, 0.05) 100%)',
    icon: 'Briefcase',
    description: 'Financial rating agencies, market data analytics, corporate consulting, uniform rental, and payment processing.',
  },
  'Communications': {
    name: 'Communications',
    category: 'Infrastructure',
    color: '#06b6d4', // cyan-500
    accentColor: 'rgba(6, 182, 212, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(8, 145, 178, 0.05) 100%)',
    icon: 'Radio',
    description: 'Wireless mobile carriers, telecommunication cable operators, and fiber transmission networks.',
  },
  'Distribution Services': {
    name: 'Distribution Services',
    category: 'Services',
    color: '#f97316', // orange-500
    accentColor: 'rgba(249, 115, 22, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(234, 88, 12, 0.05) 100%)',
    icon: 'Boxes',
    description: 'Pharmaceutical distribution, healthcare logistics, and wholesale industrial supply distribution.',
  },
  'Non-Energy Minerals': {
    name: 'Non-Energy Minerals',
    category: 'Minerals',
    color: '#d97706', // amber-600
    accentColor: 'rgba(217, 119, 6, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(217, 119, 6, 0.25) 0%, rgba(180, 83, 9, 0.05) 100%)',
    icon: 'Gem',
    description: 'Gold, copper, steel manufacturing, aggregates, cement, and non-precious mineral mining.',
  },
  'Miscellaneous': {
    name: 'Miscellaneous',
    category: 'Other',
    color: '#94a3b8', // slate-400
    accentColor: 'rgba(148, 163, 184, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(148, 163, 184, 0.25) 0%, rgba(100, 116, 139, 0.05) 100%)',
    icon: 'HelpCircle',
    description: 'Diversified resource management, land trusts, and multi-industry holding enterprises.',
  },
};
