/**
 * PATTY MVP — UK Focus · Accuracy-first · Glossary + Plain-English build
 *
 * All products shown by default are BOTH:
 * PFIC-safe (won't trigger IRS punitive tax treatment)
 * HMRC-compliant (won't trigger UK offshore income tax penalty)
 *
 * PFIC products are only shown behind an explicit "I want to see what to avoid" toggle.
 *
 * VERIFIED FACTS (UK-US focus):
 * VTI / VXUS — Confirmed HMRC reporting fund status; PFIC-safe (US-domiciled)
 * SIPP — Treaty-deferred under Art. 17(1)(b) US-UK Treaty 2001; Form 8833 req'd
 * ISA — No US tax benefit; IRS does not recognise it; UCITS inside = PFIC
 * UCITS ETFs — PFICs under IRC §1291-1298 (e.g. VWRL, SWDA, any UK-domiciled fund)
 * FBAR — $10K aggregate foreign accounts; FinCEN 114
 * FATCA — Single: $200K year-end / $300K any point; MFJ: $400K/$600K (expat thresholds); Form 8938
 * PRIIPs — Blocks UK retail brokers from offering US-listed ETFs
 * Schwab Intl — Commission-free US ETFs; no minimum deposit (waived 2025); accepts UK residents
 * IBKR — Pro investor status req'd for US ETFs; US ETFs generally not available in ISA wrappers due to PRIIPs
 */

import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── Mobile Detection ────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < breakpoint : false);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

// ─── Design System Colors (Mercury/Wise/Pilot inspired) ──────────────────────
const C = {
  // Primary brand purple - used sparingly as accent
  primary: "#6d28d9",
  accent: "#7c3aed",
  accentDark: "#5b21b6",
  accentLight: "#8b5cf6",
  
  // Semantic colors
  success: "#059669",
  warning: "#d97706",
  danger: "#dc2626", // Only for PFIC cost
  
  // Neutral palette - the foundation
  bg: "#fafaf9", // Warm off-white
  bgSubtle: "#f5f5f4", // Slightly darker for cards
  card: "#ffffff",
  border: "#e7e5e4",
  borderLight: "#f5f5f4",
  
  // Text hierarchy
  text: "#1c1917", // Near black
  textSecondary: "#57534e", // Medium gray
  textMuted: "#a8a29e", // Light gray
};

// ─── Shared Styles ──────────────────────────────────────────────────────────
const styles = {
  // Typography
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  
  // Layout
  maxWidth: 1200,
  containerPadding: "0 24px",
  
  // Borders and shadows
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.04)",
    md: "0 4px 12px rgba(0,0,0,0.05)",
    lg: "0 8px 24px rgba(0,0,0,0.06)",
  },
};

// ─── Glossary ─────────────────────────────────────────────────────────────────
const GLOSSARY = [
  {
  id: "pfic",
  term: "PFIC",
  full: "Passive Foreign Investment Company",
  emoji: "",
  plain: "A US tax trap that catches most UK/European funds and ETFs.",
  detail: "The IRS classifies almost any non-US fund as a PFIC. If you hold one, your gains are taxed at the highest income rate (up to 37%) PLUS an interest charge — often meaning you lose more than you made. You must also file Form 8621 annually for every PFIC you own. Patty only recommends products that are not PFICs.",
  implication: "Avoid any UK-domiciled fund, UCITS ETF, or offshore investment vehicle. The funds on Hargreaves Lansdown, AJ Bell, and Vanguard UK are almost all PFICs for US citizens — even if they look identical to safe US equivalents.",
  severity: "danger",
  },
  {
  id: "hmrc_reporting",
  term: "HMRC Reporting Fund",
  full: "HMRC Approved Offshore Reporting Fund Status",
  emoji: "",
  plain: "A UK tax status that means you pay capital gains tax on profits — not the higher income tax rate.",
  detail: "When a fund has HMRC reporting fund status, UK residents pay Capital Gains Tax (18–24%) when they sell. Without it, HMRC treats all gains as income — meaning you could pay 40–45% income tax instead. For US expats, you want funds that are both PFIC-safe (for the IRS) AND HMRC reporting funds (for HMRC).",
  implication: "VTI and VXUS (Vanguard US ETFs) are confirmed HMRC reporting funds. This is the sweet spot — they satisfy both the IRS and HMRC simultaneously. Very few products achieve this combination.",
  severity: "good",
  },
  {
  id: "ucits",
  term: "UCITS Fund",
  full: "Undertakings for Collective Investment in Transferable Securities",
  emoji: "",
  plain: "The European fund format sold on HL, AJ Bell, Vanguard UK. Almost always a PFIC for US citizens.",
  detail: "UCITS is the regulatory structure for funds sold across Europe and the UK. Nearly every fund or ETF on a UK retail platform is UCITS-domiciled (registered in Ireland or Luxembourg). From the IRS's perspective, these are foreign passive companies — PFICs — subject to punitive tax treatment.",
  implication: "If someone tells you to invest in a 'global tracker' on Hargreaves Lansdown, they almost certainly mean a UCITS ETF. For US citizens, this is the wrong choice — even if the fund holds identical underlying stocks to a safe US equivalent.",
  severity: "danger",
  },
  {
  id: "fbar",
  term: "FBAR",
  full: "Foreign Bank Account Report (FinCEN 114)",
  emoji: "",
  plain: "A mandatory annual filing if you have more than $10,000 in foreign accounts at any point during the year.",
  detail: "If the combined balance of all your foreign financial accounts exceeds $10,000 at any point during the calendar year, you must file FinCEN 114. The deadline is April 15, with an automatic extension to October 15 — no request needed. This includes bank accounts, brokerage accounts, and pensions (including SIPPs) held outside the US. Failure to file can result in penalties of $10,000+ per violation — even if you owed no tax.",
  implication: "Most UK-resident US expats need to file FBAR. It's separate from your tax return and filed online at BSA E-Filing System. Patty flags every product that triggers this requirement.",
  severity: "info",
  },
  {
  id: "fatca",
  term: "FATCA / Form 8938",
  full: "Foreign Account Tax Compliance Act",
  emoji: "",
  plain: "A separate IRS filing for larger foreign asset holdings. Expat thresholds are much higher than domestic ones — $200K year-end for single filers, $400K for married filing jointly.",
  detail: "If your total foreign financial assets exceed the threshold, you must file Form 8938 with your US tax return (not separately like FBAR). Thresholds for expats living abroad: Single filer — $200,000 at year-end or $300,000 at any point. Married filing jointly — $400,000 at year-end or $600,000 at any point. The lower domestic thresholds ($50K/$75K single, $100K/$150K MFJ) do not apply when living abroad.",
  implication: "Both FBAR and FATCA may apply simultaneously — they are not alternatives. Check your filing status: if you're married filing jointly, your FATCA threshold is $400K at year-end, not $200K. If your portfolio abroad is above your threshold, you likely need both FinCEN 114 and Form 8938.",
  severity: "info",
  },
  {
  id: "sipp",
  term: "SIPP",
  full: "Self-Invested Personal Pension",
  emoji: "",
  plain: "A UK pension where you control the investments. Protected by the US-UK tax treaty — growth is tax-deferred in the US.",
  detail: "Under Article 17(1)(b) of the 2001 US-UK Tax Treaty, SIPP growth is tax-deferred in the US — you don't pay US tax on gains until you take distributions (like a 401k). The 25% lump sum (called PCLS) at retirement is tax-free in both countries. You must file Form 8833 annually to actively claim this treaty benefit.",
  implication: "A SIPP is a legitimate long-term vehicle for UK-based US expats. Watch-out: what you hold inside the SIPP also matters — UCITS funds inside a SIPP are still PFICs. Ask your provider to confirm PFIC-safe holdings.",
  severity: "good",
  },
  {
  id: "isa",
  term: "ISA",
  full: "Individual Savings Account",
  emoji: "",
  plain: "A UK tax-free account — but the IRS doesn't recognise the tax-free status. Gains are fully taxable in the US.",
  detail: "ISAs are popular in the UK because growth and withdrawals are tax-free for UK purposes. For US citizens, the IRS does not recognise this benefit — all growth and income inside an ISA is fully taxable in the US as normal. If your ISA holds UCITS funds, those are also PFICs.",
  implication: "ISAs are largely irrelevant for US expats from a US tax perspective. If you already have one, make sure it holds individual shares only — not UCITS funds or ETFs.",
  severity: "warning",
  },
  {
  id: "etf",
  term: "ETF",
  full: "Exchange-Traded Fund",
  emoji: "",
  plain: "A fund that trades like a share. PFIC-safe if US-domiciled; a PFIC trap if UK or European-domiciled.",
  detail: "An ETF pools money to track an index. The critical thing for US expats is WHERE it is domiciled — not what it holds. A US-domiciled ETF (like VTI, listed on NYSE) is PFIC-safe. A UK or Irish-domiciled ETF (like VWRL, listed on the London Stock Exchange) is a PFIC — even if both hold identical underlying stocks.",
  implication: "Two ETFs can track the same index with the same holdings and look identical — but one is PFIC-safe and one is a tax trap. The domicile is everything. Patty only recommends US-domiciled ETFs that also carry HMRC reporting fund status.",
  severity: "info",
  },
  {
  id: "priips",
  term: "PRIIPs / KID Rules",
  full: "Packaged Retail and Insurance-based Investment Products Regulation",
  emoji: "",
  plain: "The UK regulation that blocks most brokers from selling US ETFs to retail investors.",
  detail: "UK law requires any fund sold to retail investors to have a Key Information Document (KID). US ETF providers don't produce KIDs for their US-listed products. This means UK retail brokers legally cannot offer US ETFs to their customers — creating the PFIC/PRIIPs catch-22 that US expats face.",
  implication: "This is why you can't buy VTI on Hargreaves Lansdown. The main workaround is Charles Schwab International (a US brokerage that accepts UK residents), or Elective Professional Investor status at Interactive Brokers.",
  severity: "warning",
  },
  {
  id: "form_8833",
  term: "Form 8833",
  full: "Treaty-Based Return Position Disclosure",
  emoji: "",
  plain: "The form you file annually to claim your UK-US tax treaty benefits — required if you have a SIPP.",
  detail: "If you want to use any provision of the US-UK tax treaty — like deferring US tax on SIPP growth — you must actively claim it by filing Form 8833 with your annual US tax return. The benefit is not automatic. If you miss this, the IRS can treat the full SIPP as taxable as if no treaty existed.",
  implication: "Any US expat with a SIPP must file Form 8833 every year. This is typically handled by a US-qualified CPA. It's a manageable step but easy to overlook without proper guidance.",
  severity: "info",
  },
  {
  id: "form_8621",
  term: "Form 8621",
  full: "Information Return — Shareholder of a Passive Foreign Investment Company",
  emoji: "",
  plain: "A complex annual IRS form required for every PFIC you own. One form per fund, every year.",
  detail: "If you own a PFIC, you must file Form 8621 for each one annually. The form is long and complex. The tax treatment itself is often punitive — gains are taxed at the highest ordinary rate plus an interest charge that accrues over time. Many expat tax professionals describe Form 8621 as one of the most damaging requirements in the US tax code.",
  implication: "This is the core reason Patty exists — to route you away from products requiring Form 8621. If you already own UCITS funds, speak to a CPA before selling — certain elections (QEF, mark-to-market) may reduce the damage.",
  severity: "danger",
  },
  {
  id: "tax_treaty",
  term: "US-UK Tax Treaty",
  full: "US-UK Tax Convention (2001)",
  emoji: "",
  plain: "A bilateral agreement that prevents some double taxation. Key provision: SIPP growth is US tax-deferred; the 25% pension lump sum is tax-free in both countries.",
  detail: "The treaty sets rules for who taxes which income. Key investor provisions: Article 17(1)(b) — SIPP growth is US tax-deferred; the 25% PCLS (Pension Commencement Lump Sum) is tax-free in both countries. The savings clause means the US reserves the right to tax its citizens on most income — so treaty benefits must always be actively claimed via Form 8833.",
  implication: "The treaty helps but doesn't eliminate your US tax obligation. It primarily gives pension deferral and prevents double-taxation. Always claim treaty benefits via Form 8833 — they are not automatic.",
  severity: "good",
  },
  {
  id: "cgt",
  term: "CGT",
  full: "Capital Gains Tax (UK)",
  emoji: "",
  plain: "UK tax on investment profits when you sell. Lower than income tax — but only applies if your fund has HMRC reporting status.",
  detail: "When you sell an investment at a profit, HMRC taxes the gain. The rate depends on your income: 18% for basic rate taxpayers, 24% for higher rate taxpayers (rates for investment assets increased from 10%/20% to 18%/24% from 30 October 2024, following the Autumn Budget). Without HMRC reporting fund status, all gains are reclassified as income — taxed at 20–45% instead.",
  implication: "HMRC reporting status can cut your UK tax bill roughly in half on gains. Combined with PFIC safety for the US, it's why VTI and VXUS are the preferred option for most US expats in the UK.",
  severity: "info",
  },
];

// ─── Platforms ────────────────────────────────────────────────────────────────
const PLATFORMS = {
  schwab: {
  name: "Charles Schwab International",
  url: "https://international.schwab.com",
  badge: "Best for most expats",
  color: "#1a6fb5",
  pficSafe: true,
  minDeposit: 0,
  note: "No minimum deposit (previously $25,000 — waived in 2025). Commission-free US ETFs. Clean 1099 reporting. Specifically designed for US citizens living abroad. UK residents accepted. Account approval typically takes 3 days to 2 weeks.",
  },
  ibkr: {
  name: "Interactive Brokers",
  url: "https://www.interactivebrokers.co.uk",
  badge: "Pro investors",
  color: "#e63946",
  pficSafe: true,
  minDeposit: 0,
  note: "No minimum deposit. Requires Elective Professional Investor (EPI) status to access US ETFs. Criteria: 2 of 3 — (1) financial instrument portfolio over £500,000; (2) at least 1 year's professional experience in financial services; (3) 10+ significant transactions per quarter over the past year. US ETFs are generally not available in ISA wrappers at UK brokers due to PRIIPs/KID requirements.",
  },
  hl: {
  name: "Hargreaves Lansdown",
  url: "https://www.hl.co.uk",
  badge: "Shares + SIPP only",
  color: "#6b7280",
  pficSafe: false,
  minDeposit: 0,
  note: "No minimum deposit. US citizens restricted to individual shares only — no US ETFs due to PRIIPs. SIPP available with treaty-deferred treatment. The UCITS funds and ETFs on the platform are PFICs for US citizens.",
  },
  treasurydirect: {
  name: "TreasuryDirect.gov",
  url: "https://www.treasurydirect.gov",
  badge: "US Gov't direct",
  color: "#1a3c5e",
  pficSafe: true,
  minDeposit: 100,
  note: "$100 minimum per purchase. Buy US Treasuries directly from the government. No broker. Requires US bank account and Social Security Number.",
  },
  existing_us: {
  name: "Your existing US brokerage",
  url: "https://www.fidelity.com",
  badge: "Use what you have",
  color: "#7c3aed",
  pficSafe: true,
  minDeposit: 0,
  note: "If you already have a Fidelity, Vanguard US, or Schwab account from before you moved, you can usually keep using it to buy US-domiciled ETFs like VTI and VXUS. Most US brokers won't force you to close an existing account when you move abroad.",
  },
};

// ─── Products ─────────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
  id: "VTI_VXUS",
  name: "VTI + VXUS",
  fullName: "Vanguard Total Market ETFs (US-domiciled)",
  ticker: "VTI / VXUS",
  icon: "",
  tag: "Global equity — the sweet spot",
  asset: "US Equity",
  riskLevel: "high",
  liquidity: "daily",
  minUSD: 100,
  currency: "USD",
  pficSafe: true,
  hmrcCompliant: true,
  pficLikely: false,
  taxComplexity: 2,
  usDocsGood: true,
  fbarRequired: false,
  badges: ["PFIC-safe ", "HMRC reporting "],
  platforms: ["schwab", "ibkr"],
  plainEnglish: "Two US stock market index funds you can hold as a US citizen in the UK without triggering a tax problem in either country. VTI tracks the entire US stock market (about 4,000 companies). VXUS tracks the rest of the world. Together they give full global equity exposure in a single, simple combination.",
  benefit: "Confirmed PFIC-safe (US-domiciled, produces 1099) AND confirmed HMRC reporting funds — the only combination that satisfies both tax systems cleanly.",
  risk: "Cannot be bought on mainstream UK platforms (HL, AJ Bell, Vanguard UK) due to PRIIPs rules. Available via Charles Schwab International (no minimum deposit) or Interactive Brokers with professional investor status.",
  note: "VTI and VXUS are confirmed on HMRC's approved offshore reporting funds list — gains taxed at UK CGT rates, not offshore income rates. US-domiciled, so not classified as PFICs by IRS. Verify current HMRC status at advisors.vanguard.com/tax-center/uk-reporting-status before investing.",
  accessWarning: "Not available via Hargreaves Lansdown, AJ Bell, or Vanguard UK due to PRIIPs/KID regulations.",
  glossaryLinks: ["pfic", "hmrc_reporting", "etf", "priips"],
  ctas: [
  { text: "Open Charles Schwab International & buy VTI + VXUS", url: "https://international.schwab.com", platform: "schwab", note: "Search VTI and VXUS once your account is open. Commission-free. No minimum deposit. UK residents accepted.", primary: true },
  { text: "Invest via Interactive Brokers (EPI status required)", url: "https://www.interactivebrokers.co.uk", platform: "ibkr", note: "Requires Elective Professional Investor (EPI) status: 2 of 3 — portfolio >£500K, 1yr finance experience, or 10+ significant trades/quarter.", primary: false },
  ],
  },
  {
  id: "US_TREASURY",
  name: "US Treasuries",
  fullName: "US Treasury Bonds, Notes & T-Bills",
  ticker: "T-Bills / T-Notes / T-Bonds",
  icon: "",
  tag: "Capital preservation — lowest friction",
  asset: "US Government Debt",
  riskLevel: "low",
  liquidity: "daily",
  minUSD: 100,
  currency: "USD",
  pficSafe: true,
  hmrcCompliant: true,
  pficLikely: false,
  taxComplexity: 1,
  usDocsGood: true,
  fbarRequired: false,
  badges: ["PFIC-safe ", "State tax exempt", "Lowest friction"],
  platforms: ["treasurydirect", "schwab"],
  plainEnglish: "Loans you make directly to the US government. In exchange you receive regular interest payments and your money back at the end of the term. T-Bills are short (4 weeks–1 year), T-Notes are medium (2–10 years), T-Bonds are long (20–30 years). Backed by the US government — the safest USD investment that exists.",
  benefit: "Simplest possible tax situation: PFIC-safe by definition, produces a standard 1099-INT, exempt from US state income tax. No FBAR if held in a US-custodied account.",
  risk: "Returns are lower than equities over the long run. In high-inflation periods, real (inflation-adjusted) returns can be negative. Interest is taxable in both the US and UK.",
  note: "Buy directly at TreasuryDirect.gov (requires US bank account and SSN) or through a Schwab International brokerage account. BND (Vanguard Total Bond Market ETF) is a fund alternative — verify its HMRC reporting status separately.",
  accessWarning: null,
  glossaryLinks: ["pfic", "fbar"],
  ctas: [
  { text: "Buy T-Bills directly at TreasuryDirect.gov", url: "https://www.treasurydirect.gov/marketable-securities/treasury-bills/", platform: "treasurydirect", note: "US government portal. Requires a US bank account and Social Security Number.", primary: true },
  { text: "Buy Treasuries via Charles Schwab International", url: "https://international.schwab.com", platform: "schwab", note: "Search 'Treasury' in the Fixed Income section. Easier if you already have a Schwab account.", primary: false },
  ],
  },
  {
  id: "UK_SIPP",
  name: "UK SIPP",
  fullName: "Self-Invested Personal Pension",
  ticker: "N/A",
  icon: "",
  tag: "Long-term pension — US-UK treaty protected",
  asset: "Diversified (depends on your holdings)",
  riskLevel: "medium",
  liquidity: "locked",
  minUSD: 1000,
  currency: "GBP",
  pficSafe: true,
  hmrcCompliant: true,
  pficLikely: false,
  taxComplexity: 4,
  usDocsGood: true,
  fbarRequired: true,
  badges: ["PFIC-safe ", "Treaty-deferred (Art. 17)", "FBAR required"],
  platforms: ["hl"],
  plainEnglish: "A UK pension pot where you choose your own investments. You get UK tax relief on contributions (the government tops up what you put in). Under the US-UK tax treaty, the IRS won't tax your pension growth until you actually start taking money out — similar to how a 401(k) works.",
  benefit: "US tax-deferred growth under Article 17(1)(b) of the treaty. The 25% lump sum at retirement (PCLS) is tax-free in both countries. UK tax relief on contributions reduces your UK tax bill today.",
  risk: "Money is locked until minimum pension age (currently 55 in the UK, rising to 57 in April 2028). Contributions are NOT deductible on your US return. You must file Form 8833 annually — miss it and the IRS can tax the whole pension. What you hold inside matters: UCITS funds inside a SIPP are still PFICs.",
  note: "Treaty protection under Article 17(1)(b) of the 2001 US-UK Convention. Must file Form 8833 with annual US tax return. Ask your SIPP provider to confirm that default investments are PFIC-safe — most UK SIPP providers default to UCITS funds which are PFICs.",
  accessWarning: "Form 8833 must be filed every year to maintain treaty deferral. Confirm with your SIPP provider that your holdings are PFIC-safe.",
  sippCaveat: true,
  requiresCountry: ["gb"],
  glossaryLinks: ["sipp", "tax_treaty", "form_8833", "fbar"],
  ctas: [
  { text: "Open a SIPP via Hargreaves Lansdown", url: "https://www.hl.co.uk/pensions/self-invested-personal-pensions", platform: "hl", note: "Once open, hold individual shares only — not UCITS funds or US ETFs (HL cannot offer US ETFs to retail clients due to PRIIPs). File Form 8833 every year to claim treaty deferral.", primary: true },
  ],
  },
  {
  id: "INDIVIDUAL_SHARES",
  name: "Individual Shares",
  fullName: "Direct company shares — UK or US listed",
  ticker: "e.g. AAPL, MSFT, HSBA.L",
  icon: "",
  tag: "Fully compliant — open to US citizens at UK brokers today",
  asset: "Equities",
  riskLevel: "high",
  liquidity: "daily",
  minUSD: 100,
  currency: "GBP/USD",
  pficSafe: true,
  hmrcCompliant: true,
  pficLikely: false,
  taxComplexity: 2,
  usDocsGood: true,
  fbarRequired: true,
  badges: ["PFIC-safe ", "HMRC compliant ", "Available at HL today"],
  platforms: ["hl", "ibkr", "schwab"],
  plainEnglish: "Buying a direct stake in individual companies — like Apple, Microsoft, or HSBC. This is fully PFIC-safe and HMRC-compliant, and it's available to US citizens at UK brokers right now with no minimum deposit and no professional investor status required. It's a legitimate, accessible strategy for any amount.",
  benefit: "Genuinely accessible to US citizens at UK retail brokers today — no minimum deposit, no professional status, no special account type. Hargreaves Lansdown and Interactive Brokers both accept US citizens for individual share trading. Fully PFIC-safe (individual companies are never PFICs) and HMRC-compliant.",
  risk: "More concentrated than a broad index fund — you're picking individual companies rather than owning the whole market. Requires more research and active management. Gains and dividends are fully taxable in the US. UK-held account is FBAR-reportable if balance exceeds $10K.",
  note: "Individual company shares are categorically outside PFIC rules — PFICs only apply to pooled vehicles (funds and ETFs), never to direct equity stakes in operating companies. This means HL Fund & Share Account and IBKR standard accounts are both fully accessible to US citizens. W-8BEN form required at HL (renewed every 3 years — not a barrier). This is a fully viable long-term strategy, not a consolation prize; many professional investors build concentrated equity portfolios by choice.",
  accessWarning: null,
  glossaryLinks: ["pfic", "fbar", "hmrc_reporting"],
  ctas: [
  { text: "Open a Hargreaves Lansdown Fund & Share Account", url: "https://www.hl.co.uk/shares", platform: "hl", note: "No minimum deposit. US citizens accepted. Complete a W-8BEN form when opening (simple, renewed every 3 years). Individual shares only — no ETFs or UCITS funds.", primary: true },
  { text: "Buy shares via Interactive Brokers", url: "https://www.interactivebrokers.co.uk/en/trading/stocks.php", platform: "ibkr", note: "Standard retail account works for individual shares — no professional investor status needed. Wider selection and lower trading costs than HL.", primary: false },
  { text: "Buy shares via Charles Schwab International", url: "https://international.schwab.com", platform: "schwab", note: "Best option if you also want to hold US ETFs (VTI/VXUS) in the same account alongside individual shares.", primary: false },
  ],
  },
  // PFIC products — shown only with toggle
  {
  id: "UK_ISA_UCITS",
  name: "UK ISA (with UCITS funds)",
  fullName: "Stocks & Shares ISA — standard UK platform setup",
  ticker: "e.g. Vanguard LifeStrategy, VWRL, SWDA",
  icon: "",
  tag: " What most UK platforms will offer you — avoid",
  asset: "Multi-Asset",
  riskLevel: "medium",
  liquidity: "daily",
  minUSD: 500,
  currency: "GBP",
  pficSafe: false,
  hmrcCompliant: false,
  pficLikely: true,
  taxComplexity: 5,
  usDocsGood: false,
  fbarRequired: true,
  badges: [" PFIC", "Form 8621 required", "No US tax benefit"],
  platforms: [],
  pficOnly: true,
  plainEnglish: "A standard UK ISA holding typical UCITS tracker funds — like a Vanguard LifeStrategy, a global index fund, or any fund from HL's recommended list. This is what most UK financial advisors will suggest. For a US citizen, it is the wrong choice despite looking perfectly sensible on the surface.",
  benefit: "UK tax-free growth and withdrawals (irrelevant to US citizens). Simple to open. Wide fund choice. What a UK-only person would rightly choose.",
  risk: "The UCITS funds inside are PFICs — punitive US tax, annual Form 8621 per fund, potential to owe more in tax than you made in gains. The IRS does not recognise the ISA tax-free status. FBAR required on the account.",
  note: "Shown here only so you can understand what to avoid. This is the default product on most UK platforms. If you already hold a UCITS-based ISA, consult a US-qualified CPA before selling — QEF or mark-to-market elections may reduce the damage.",
  accessWarning: " This is what Patty routes you away from. The ISA wrapper itself is fine; the UCITS funds inside are the problem.",
  glossaryLinks: ["isa", "ucits", "form_8621", "pfic"],
  },
  {
  id: "UCITS_ETF",
  name: "UCITS ETF",
  fullName: "Any UK or Ireland-domiciled fund or ETF",
  ticker: "e.g. VWRL, SWDA, IWDA",
  icon: "",
  tag: " Default on UK platforms — a PFIC trap for US citizens",
  asset: "Multi-Asset",
  riskLevel: "medium",
  liquidity: "daily",
  minUSD: 500,
  currency: "GBP",
  pficSafe: false,
  hmrcCompliant: false,
  pficLikely: true,
  taxComplexity: 5,
  usDocsGood: false,
  fbarRequired: true,
  badges: [" PFIC", "Form 8621 required"],
  platforms: [],
  pficOnly: true,
  plainEnglish: "Any fund or ETF that's registered in the UK, Ireland, or Europe — which covers virtually everything sold on Hargreaves Lansdown, AJ Bell, Vanguard UK, or any other UK retail platform. Despite holding the same underlying stocks as US ETFs, the country of registration makes them PFICs for US citizens.",
  benefit: "Excellent products for UK citizens — low cost, diversified, regulated. Just wrong for US citizens due to PFIC rules.",
  risk: "Classified as a PFIC regardless of underlying holdings. Gains taxed at highest ordinary income rate plus interest charge. Form 8621 required annually for each fund held. Can result in a larger tax bill than your actual investment gain.",
  note: "Examples: Vanguard FTSE All-World UCITS ETF (VWRL), iShares Core MSCI World UCITS ETF (SWDA/IWDA). These are excellent for UK citizens. For US citizens they are toxic. Do not confuse with VTI/VXUS which are US-domiciled and PFIC-safe.",
  accessWarning: null,
  glossaryLinks: ["ucits", "pfic", "form_8621", "etf"],
  },
];

// ─── Scoring Engine ────────────────────────────────────────────────────────────
function clamp(x) { return Math.max(0, Math.min(100, x)); }
function deriveRisk(r) { return r === "panic" || r === "uncomfortable" ? "low" : r === "hold" ? "medium" : "high"; }
function deriveLiquidity(a) { return a === "yes" ? "daily" : a === "maybe" ? "moderate" : "locked"; }

function scoreProduct(p, profile, showPfic) {
  if (p.pficLikely && !showPfic) return null;
  if (p.pficOnly && !showPfic) return null;
  if (profile.amount < p.minUSD) return null;
  if (deriveLiquidity(profile.accessNeed) === "daily" && p.liquidity === "locked") return null;
  if (p.requiresCountry && !p.requiresCountry.includes(profile.country)) return null;
  const userRisk = deriveRisk(profile.marketReaction);
  const userLiq = deriveLiquidity(profile.accessNeed);
  let fit = 50; const fitB = [];
  if (p.riskLevel === userRisk) { fit += 25; fitB.push({ l: "Risk match", d: 25 }); }
  else if ((userRisk === "high" && p.riskLevel === "medium") || (userRisk === "low" && p.riskLevel === "medium")) { fit += 8; fitB.push({ l: "Risk close", d: 8 }); }
  else { fit -= 10; fitB.push({ l: "Risk mismatch", d: -10 }); }
  if (["long", "verylong"].includes(profile.horizon) && p.riskLevel !== "low") { fit += 10; fitB.push({ l: "Long horizon bonus", d: 10 }); }
  if (profile.horizon === "short" && p.riskLevel === "low") { fit += 12; fitB.push({ l: "Short horizon match", d: 12 }); }
  if (userLiq === "daily" && p.liquidity === "daily") { fit += 8; fitB.push({ l: "Liquidity match", d: 8 }); }
  if (userLiq === "locked" && p.liquidity === "locked") { fit += 10; fitB.push({ l: "OK locking up capital", d: 10 }); }
  if (profile.goal === "income" && p.asset === "US Government Debt") { fit += 10; fitB.push({ l: "Income preference", d: 10 }); }
  if (profile.goal === "growth" && p.riskLevel === "high") { fit += 8; fitB.push({ l: "Growth preference", d: 8 }); }
  if (p.requiresCountry?.includes(profile.country)) { fit += 12; fitB.push({ l: "Country-specific account", d: 12 }); }
  fit = clamp(fit);
  let friction = 8; const frictionB = [];
  if (p.pficLikely) { friction += 45; frictionB.push({ l: "PFIC (Form 8621 + punitive tax)", d: 45 }); }
  if (!p.usDocsGood) { friction += 12; frictionB.push({ l: "Weak US tax docs", d: 12 }); }
  if (p.taxComplexity > 2) { const a = (p.taxComplexity - 2) * 8; friction += a; frictionB.push({ l: "Reporting complexity", d: a }); }
  if (p.fbarRequired) { friction += 5; frictionB.push({ l: "FBAR required", d: 5 }); }
  if (p.sippCaveat) { friction += 10; frictionB.push({ l: "Form 8833 required annually", d: 10 }); }
  if (p.accessWarning && !p.pficLikely) { friction += 8; frictionB.push({ l: "Platform access challenge", d: 8 }); }
  friction = clamp(friction);
  return { product: p, fit, friction, fitBreakdown: fitB, frictionBreakdown: frictionB };
}

function runEngine(profile, showPfic) {
  return PRODUCTS.map(p => scoreProduct(p, profile, showPfic)).filter(Boolean).sort((a, b) => a.friction - b.friction || b.fit - a.fit);
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ 
      background: C.card, 
      borderRadius: styles.radius.lg, 
      padding: "32px", 
      boxShadow: styles.shadow.sm,
      border: `1px solid ${C.border}`,
      ...style 
    }}>
      {children}
    </div>
  );
}

function ScoreBar({ value, color, label }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary, letterSpacing: "-0.01em" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}<span style={{ fontSize: 11, color: C.textMuted }}>/100</span></span>
      </div>
      <div style={{ background: C.bgSubtle, borderRadius: 4, height: 6 }}>
        <div style={{ width: `${value}%`, background: color, height: "100%", borderRadius: 4, transition: "width 0.8s ease-out" }} />
      </div>
    </div>
  );
}

function StepDot({ n, active, done }) {
  return (
    <div style={{ 
      width: 36, 
      height: 36, 
      borderRadius: "50%", 
      background: done ? C.primary : active ? C.card : C.bgSubtle, 
      border: active ? `2px solid ${C.primary}` : done ? "none" : `1px solid ${C.border}`,
      color: done ? "#fff" : active ? C.primary : C.textMuted, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      fontWeight: 600, 
      fontSize: 14, 
      flexShrink: 0, 
      transition: "all 0.2s ease" 
    }}>
      {done ? "✓" : n}
    </div>
  );
}

function Opt({ selected, onClick, children, style = {} }) {
  return (
    <button 
      onClick={onClick} 
      style={{ 
        padding: "16px 20px", 
        borderRadius: styles.radius.md, 
        border: `1.5px solid ${selected ? C.primary : C.border}`, 
        background: selected ? `${C.primary}08` : C.card, 
        cursor: "pointer", 
        textAlign: "left", 
        transition: "all 0.15s ease", 
        color: C.text,
        fontFamily: styles.fontFamily,
        fontSize: 15,
        fontWeight: 500,
        ...style 
      }}
    >
      {children}
    </button>
  );
}

function GlossaryChip({ termId, openGlossary }) {
  const entry = GLOSSARY.find(g => g.id === termId);
  if (!entry) return null;
  return (
    <button 
      onClick={() => openGlossary(termId)} 
      style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        gap: 4, 
        background: C.bgSubtle, 
        color: C.textSecondary, 
        border: `1px solid ${C.border}`, 
        borderRadius: 6, 
        padding: "4px 10px", 
        fontSize: 12, 
        fontWeight: 500, 
        cursor: "pointer",
        transition: "all 0.15s ease",
        fontFamily: styles.fontFamily,
      }}
    >
      {entry.term} <span style={{ opacity: 0.5, fontSize: 10 }}>?</span>
    </button>
  );
}

function PlatformChip({ platformId }) {
  const p = PLATFORMS[platformId];
  if (!p) return null;
  return (
    <a 
      href={p.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        gap: 4, 
        background: C.bgSubtle, 
        color: C.textSecondary, 
        border: `1px solid ${C.border}`, 
        borderRadius: 8, 
        padding: "6px 12px", 
        fontSize: 12, 
        fontWeight: 500, 
        textDecoration: "none", 
        whiteSpace: "nowrap",
        transition: "all 0.15s ease",
      }}
    >
      {p.name} ↗
    </a>
  );
}

function ComplianceStamps({ pficSafe, hmrcCompliant }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
      <span style={{ 
        background: pficSafe ? "#ecfdf5" : "#fef2f2", 
        color: pficSafe ? C.success : C.danger, 
        border: `1px solid ${pficSafe ? "#a7f3d0" : "#fecaca"}`, 
        borderRadius: 6, 
        padding: "4px 10px", 
        fontSize: 12, 
        fontWeight: 600,
        letterSpacing: "-0.01em"
      }}>
        {pficSafe ? "PFIC-safe" : "PFIC risk"}
      </span>
      <span style={{ 
        background: hmrcCompliant ? "#eff6ff" : "#fffbeb", 
        color: hmrcCompliant ? "#1d4ed8" : C.warning, 
        border: `1px solid ${hmrcCompliant ? "#bfdbfe" : "#fde68a"}`, 
        borderRadius: 6, 
        padding: "4px 10px", 
        fontSize: 12, 
        fontWeight: 600,
        letterSpacing: "-0.01em"
      }}>
        {hmrcCompliant ? "HMRC compliant" : "HMRC non-reporting"}
      </span>
    </div>
  );
}

// ─── Glossary Modal ───────────────────────────────────────────────────────────
function GlossaryModal({ open, initialTerm, onClose }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(() => GLOSSARY.filter(g => !search || g.term.toLowerCase().includes(search.toLowerCase()) || g.plain.toLowerCase().includes(search.toLowerCase())), [search]);
  const activeTerm = selected || initialTerm || filtered[0]?.id;
  const active = GLOSSARY.find(g => g.id === activeTerm);
  const sColor = { danger: C.danger, warning: C.warning, good: C.success, info: C.primary };
  if (!open) return null;
  return (
    <div 
      style={{ 
        position: "fixed", 
        inset: 0, 
        zIndex: 1000, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        background: "rgba(28,25,23,0.5)", 
        backdropFilter: "blur(4px)", 
        padding: 24 
      }} 
      onClick={onClose}
    >
      <div 
        style={{ 
          background: C.card, 
          borderRadius: styles.radius.lg, 
          width: "100%", 
          maxWidth: 920, 
          maxHeight: "85vh", 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden", 
          boxShadow: "0 24px 48px rgba(0,0,0,0.12)" 
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: C.text, letterSpacing: "-0.02em" }}>Expat Investing Glossary</div>
            <div style={{ fontSize: 14, color: C.textSecondary, marginTop: 4 }}>Plain-English definitions — no assumptions, no jargon</div>
          </div>
          <button onClick={onClose} style={{ background: C.bgSubtle, border: `1px solid ${C.border}`, borderRadius: styles.radius.md, width: 40, height: 40, cursor: "pointer", fontSize: 18, color: C.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: typeof window !== "undefined" && window.innerWidth < 640 ? "column" : "row", flex: 1, overflow: "hidden", minHeight: 0 }}>
          {/* Sidebar */}
          <div style={{ width: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 240, borderRight: typeof window !== "undefined" && window.innerWidth < 640 ? "none" : `1px solid ${C.border}`, borderBottom: typeof window !== "undefined" && window.innerWidth < 640 ? `1px solid ${C.border}` : "none", display: "flex", flexDirection: "column", flexShrink: 0, maxHeight: typeof window !== "undefined" && window.innerWidth < 640 ? 180 : "none" }}>
            <div style={{ padding: "16px", borderBottom: `1px solid ${C.borderLight}` }}>
              <input 
                value={search} 
                onChange={e => { setSearch(e.target.value); setSelected(null); }} 
                placeholder="Search terms..." 
                style={{ 
                  width: "100%", 
                  padding: "10px 14px", 
                  borderRadius: styles.radius.md, 
                  border: `1px solid ${C.border}`, 
                  fontSize: 14, 
                  outline: "none", 
                  color: C.text, 
                  boxSizing: "border-box",
                  fontFamily: styles.fontFamily,
                }} 
              />
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filtered.map(g => (
                <button 
                  key={g.id} 
                  onClick={() => setSelected(g.id)} 
                  style={{ 
                    width: "100%", 
                    textAlign: "left", 
                    padding: "14px 16px", 
                    border: "none", 
                    background: activeTerm === g.id ? C.bgSubtle : "transparent", 
                    borderLeft: `3px solid ${activeTerm === g.id ? sColor[g.severity] : "transparent"}`, 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 8,
                    fontFamily: styles.fontFamily,
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: activeTerm === g.id ? C.text : C.textSecondary }}>{g.term}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.full}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Detail */}
          {active && (
            <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
              <div style={{ display: "flex", gap: 14, marginBottom: 28, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{active.term}</div>
                  <div style={{ fontSize: 14, color: C.textSecondary, marginTop: 6 }}>{active.full}</div>
                  <div style={{ marginTop: 14 }}>
                    <span style={{ 
                      background: `${sColor[active.severity]}10`, 
                      color: sColor[active.severity], 
                      border: `1px solid ${sColor[active.severity]}30`, 
                      borderRadius: 6, 
                      padding: "5px 14px", 
                      fontSize: 12, 
                      fontWeight: 600 
                    }}>
                      {active.severity === "danger" ? "High risk if ignored" : active.severity === "warning" ? "Important to know" : active.severity === "good" ? "Works in your favour" : "Need to know"}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ background: C.bgSubtle, borderRadius: styles.radius.md, padding: "20px 22px", marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>In Plain English</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: C.text, lineHeight: 1.6 }}>{active.plain}</div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>The Full Picture</div>
                <div style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.75 }}>{active.detail}</div>
              </div>
              <div style={{ background: `${sColor[active.severity]}08`, border: `1px solid ${sColor[active.severity]}20`, borderRadius: styles.radius.md, padding: "20px 22px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: sColor[active.severity], marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>What This Means For You</div>
                <div style={{ fontSize: 15, color: C.text, lineHeight: 1.7, fontWeight: 500 }}>{active.implication}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PFIC Cost Calculator ─────────────────────────────────────────────────────
function PficCalculator() {
  const [amount, setAmount] = useState(100000);
  const [years, setYears] = useState(10);
  const growth = 0.07;
  const finalValue = amount * Math.pow(1 + growth, years);
  const gain = finalValue - amount;
  const pficTax = gain * 0.42;
  const pficNet = finalValue - pficTax;
  const cleanTax = gain * 0.20;
  const cleanNet = finalValue - cleanTax;
  const saving = cleanNet - pficNet;
  const fmt = n => "$" + Math.round(n).toLocaleString();
  const pcts = [
    { label: "Amount invested", pfic: amount, clean: amount, neutral: true },
    { label: `Gross value after ${years} yrs at 7%`, pfic: finalValue, clean: finalValue, neutral: true },
    { label: "Estimated tax drag", pfic: -pficTax, clean: -cleanTax, negative: true },
    { label: "Estimated net value", pfic: pficNet, clean: cleanNet, highlight: true },
  ];
  
  return (
    <div style={{ 
      background: C.card, 
      borderRadius: styles.radius.lg, 
      border: `1px solid ${C.border}`, 
      padding: "36px", 
      marginBottom: 24, 
      boxShadow: styles.shadow.md 
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Illustrative Tax Drag Comparison</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", marginBottom: 8 }}>What does the PFIC trap actually cost?</div>
          <div style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.6, maxWidth: 480 }}>Adjust the inputs to see the estimated difference in after-tax value between a PFIC product and a PFIC-safe US-domiciled ETF.</div>
        </div>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: styles.radius.md, padding: "20px 28px", textAlign: "center", minWidth: 160 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Estimated Extra Loss</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: C.danger, lineHeight: 1, letterSpacing: "-0.02em" }}>{fmt(saving)}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>to PFIC tax treatment</div>
        </div>
      </div>
      
      {/* Sliders */}
      <div style={{ display: "grid", gridTemplateColumns: typeof window !== "undefined" && window.innerWidth < 640 ? "1fr" : "1fr 1fr", gap: 28, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>Amount invested</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{fmt(amount)}</span>
          </div>
          <input 
            type="range" 
            min={10000} 
            max={500000} 
            step={10000} 
            value={amount} 
            onChange={e => setAmount(+e.target.value)}
            style={{ width: "100%", accentColor: C.primary, height: 6 }} 
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted, marginTop: 6 }}><span>$10K</span><span>$500K</span></div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>Time horizon</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{years} years</span>
          </div>
          <input 
            type="range" 
            min={5} 
            max={30} 
            step={1} 
            value={years} 
            onChange={e => setYears(+e.target.value)}
            style={{ width: "100%", accentColor: C.primary, height: 6 }} 
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted, marginTop: 6 }}><span>5 yrs</span><span>30 yrs</span></div>
        </div>
      </div>
      
      {/* Comparison table */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: 0, borderRadius: styles.radius.md, overflow: "hidden", border: `1px solid ${C.border}` }}>
        <div style={{ background: C.bgSubtle, padding: "12px 16px", fontSize: 12, fontWeight: 600, color: C.textMuted }} />
        <div style={{ background: `${C.danger}08`, padding: "12px 16px", fontSize: 12, fontWeight: 600, color: C.danger, textAlign: "center" }}>
          PFIC product<br /><span style={{ fontWeight: 500, fontSize: 11, opacity: 0.8 }}>(e.g. VWRL / LifeStrategy)</span>
        </div>
        <div style={{ background: `${C.success}08`, padding: "12px 16px", fontSize: 12, fontWeight: 600, color: C.success, textAlign: "center" }}>
          PFIC-safe ETF<br /><span style={{ fontWeight: 500, fontSize: 11, opacity: 0.8 }}>(e.g. VTI + VXUS)</span>
        </div>
        {pcts.map((row, i) => (
          <>
            <div key={`l${i}`} style={{ background: i % 2 === 0 ? C.bgSubtle : C.card, padding: "14px 16px", fontSize: 14, fontWeight: row.highlight ? 600 : 500, color: C.text, borderTop: `1px solid ${C.borderLight}` }}>{row.label}</div>
            <div key={`p${i}`} style={{ background: i % 2 === 0 ? `${C.danger}06` : `${C.danger}03`, padding: "14px 16px", fontSize: 14, fontWeight: 600, color: row.highlight ? C.danger : row.negative ? C.danger : C.text, textAlign: "center", borderTop: `1px solid ${C.borderLight}` }}>{row.negative ? `-${fmt(Math.abs(row.pfic))}` : fmt(row.pfic)}</div>
            <div key={`c${i}`} style={{ background: i % 2 === 0 ? `${C.success}06` : `${C.success}03`, padding: "14px 16px", fontSize: 14, fontWeight: 600, color: row.highlight ? C.success : row.negative ? C.warning : C.text, textAlign: "center", borderTop: `1px solid ${C.borderLight}` }}>{row.negative ? `-${fmt(Math.abs(row.clean))}` : fmt(row.clean)}</div>
          </>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: "14px 18px", background: "#fffbeb", borderRadius: styles.radius.sm, border: "1px solid #fde68a", fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
        Note: Illustrative only — assumes 7% annual growth, 37% US ordinary income rate + estimated PFIC interest charge vs. 20% long-term CGT. Actual tax depends on your specific situation. This is not tax advice. Consult a US-qualified CPA.
      </div>
    </div>
  );
}

// ─── Portfolio Diagnostic ────────────────────────────────────────────────────
const DIAG_PLATFORMS = [
  { id: "hl", label: "Hargreaves Lansdown", risk: "high" },
  { id: "ajbell", label: "AJ Bell", risk: "high" },
  { id: "vanguard_uk", label: "Vanguard UK", risk: "high" },
  { id: "ibkr", label: "Interactive Brokers", risk: "low" },
  { id: "schwab", label: "Charles Schwab International", risk: "none" },
  { id: "none", label: "I don't have a UK brokerage account yet", risk: "none" },
];
const DIAG_HOLDINGS = [
  { id: "ucits", label: "Index funds / trackers (e.g. LifeStrategy, global index, VWRL)", pfic: true },
  { id: "shares", label: "Individual company shares (e.g. Apple, HSBC, BP)", pfic: false },
  { id: "us_etf", label: "US-listed ETFs (e.g. VTI, VXUS, SPY)", pfic: false },
  { id: "unsure", label: "I'm not sure what I hold", pfic: null },
];

function DiagnosticResult({ platform, holding, onContinue, onReset }) {
  const plat = DIAG_PLATFORMS.find(p => p.id === platform);
  const hold = DIAG_HOLDINGS.find(h => h.id === holding);
  const isPficRisk = plat?.risk === "high" && (hold?.pfic === true || hold?.pfic === null);
  const isClean = plat?.risk === "none" || (plat?.risk === "low" && hold?.pfic === false) || hold?.pfic === false;
  const isUnsure = hold?.pfic === null;
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ 
        background: isPficRisk ? "#fef2f2" : isUnsure ? "#fffbeb" : "#f0fdf4", 
        border: `1px solid ${isPficRisk ? "#fecaca" : isUnsure ? "#fde68a" : "#a7f3d0"}`, 
        borderRadius: styles.radius.lg, 
        padding: "28px" 
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>{isPficRisk ? "⚠" : isUnsure ? "🔍" : "✓"}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: isPficRisk ? C.danger : isUnsure ? "#92400e" : C.success, marginBottom: 12, letterSpacing: "-0.02em" }}>
          {isPficRisk ? "PFIC Risk Detected" : isUnsure ? "Needs Review" : "Looks Compliant"}
        </div>
        <div style={{ fontSize: 15, color: C.text, lineHeight: 1.7, marginBottom: 16 }}>
          {isPficRisk && `Holdings like ${hold?.id === "ucits" ? "UCITS index funds and trackers" : "funds on this platform"} are classified as Passive Foreign Investment Companies (PFICs) by the IRS. US citizens holding these face punitive tax treatment under IRC §1291–1298 — gains taxed at the highest ordinary income rate plus an interest charge, not the lower capital gains rate.`}
          {isUnsure && `You'll need to confirm exactly what you hold. If your account contains any UK or Irish-domiciled funds, ETFs, or trackers, these are likely PFICs under IRS rules. Individual shares are generally safe.`}
          {isClean && !isUnsure && `Individual shares and US-domiciled ETFs held at a platform like ${plat?.label} are generally PFIC-safe. You're not invested in the typical PFIC trap products.`}
        </div>
        <div style={{ fontSize: 13, color: C.textSecondary, fontStyle: "italic" }}>This is an educational assessment based on publicly known IRS PFIC classification rules — not personalised tax advice. Please confirm with a US-qualified CPA.</div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button 
          onClick={onContinue} 
          style={{ 
            flex: 1, 
            background: C.primary, 
            color: "#fff", 
            border: "none", 
            borderRadius: styles.radius.md, 
            padding: "16px 24px", 
            fontSize: 15, 
            fontWeight: 600, 
            cursor: "pointer",
            fontFamily: styles.fontFamily,
          }}
        >
          See PFIC-safe, HMRC-compliant options →
        </button>
        <button 
          onClick={onReset} 
          style={{ 
            background: C.bgSubtle, 
            color: C.text, 
            border: `1px solid ${C.border}`, 
            borderRadius: styles.radius.md, 
            padding: "16px 20px", 
            fontSize: 14, 
            fontWeight: 600, 
            cursor: "pointer",
            fontFamily: styles.fontFamily,
          }}
        >
          Start over
        </button>
      </div>
    </div>
  );
}

function DiagnosticFlow({ onFinish, onBack }) {
  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState(null);
  const [holding, setHolding] = useState(null);
  const plat = DIAG_PLATFORMS.find(p => p.id === platform);
  const showHoldings = platform && plat?.risk === "high";
  
  if (step === 0) return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Step 1 of {showHoldings ? 2 : 1}</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: "-0.02em" }}>Which platform do you currently use?</h2>
      <p style={{ fontSize: 15, color: C.textSecondary, marginBottom: 28, lineHeight: 1.6 }}>Patty will check whether it's likely to expose US citizens to PFIC risk.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {DIAG_PLATFORMS.map(p => (
          <button 
            key={p.id} 
            onClick={() => setPlatform(p.id)} 
            style={{ 
              padding: "16px 20px", 
              borderRadius: styles.radius.md, 
              border: `1.5px solid ${platform === p.id ? C.primary : C.border}`, 
              background: platform === p.id ? `${C.primary}08` : C.card, 
              cursor: "pointer", 
              textAlign: "left", 
              fontWeight: 500, 
              fontSize: 15, 
              color: C.text, 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              fontFamily: styles.fontFamily,
              transition: "all 0.15s ease",
            }}
          >
            {p.label}
            {platform === p.id && <span style={{ color: C.primary, fontSize: 18 }}>✓</span>}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button 
          onClick={onBack} 
          style={{ 
            background: C.bgSubtle, 
            color: C.text, 
            border: `1px solid ${C.border}`, 
            borderRadius: styles.radius.md, 
            padding: "14px 24px", 
            fontWeight: 600, 
            fontSize: 14, 
            cursor: "pointer",
            fontFamily: styles.fontFamily,
          }}
        >
          ← Back
        </button>
        <button 
          onClick={() => { if (platform) { if (showHoldings) setStep(1); else setStep(2); } }} 
          disabled={!platform} 
          style={{ 
            background: platform ? C.primary : C.bgSubtle, 
            color: platform ? "#fff" : C.textMuted, 
            border: "none", 
            borderRadius: styles.radius.md, 
            padding: "14px 28px", 
            fontWeight: 600, 
            fontSize: 14, 
            cursor: platform ? "pointer" : "not-allowed",
            fontFamily: styles.fontFamily,
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
  
  if (step === 1) return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Step 2 of 2</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: "-0.02em" }}>What do you currently hold?</h2>
      <p style={{ fontSize: 15, color: C.textSecondary, marginBottom: 28, lineHeight: 1.6 }}>Select the option that best describes your holdings on {plat?.label}.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {DIAG_HOLDINGS.map(h => (
          <button 
            key={h.id} 
            onClick={() => setHolding(h.id)} 
            style={{ 
              padding: "16px 20px", 
              borderRadius: styles.radius.md, 
              border: `1.5px solid ${holding === h.id ? C.primary : C.border}`, 
              background: holding === h.id ? `${C.primary}08` : C.card, 
              cursor: "pointer", 
              textAlign: "left", 
              fontWeight: 500, 
              fontSize: 14, 
              color: C.text, 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              fontFamily: styles.fontFamily,
              transition: "all 0.15s ease",
            }}
          >
            {h.label}
            {holding === h.id && <span style={{ color: C.primary, fontSize: 18 }}>✓</span>}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button 
          onClick={() => setStep(0)} 
          style={{ 
            background: C.bgSubtle, 
            color: C.text, 
            border: `1px solid ${C.border}`, 
            borderRadius: styles.radius.md, 
            padding: "14px 24px", 
            fontWeight: 600, 
            fontSize: 14, 
            cursor: "pointer",
            fontFamily: styles.fontFamily,
          }}
        >
          ← Back
        </button>
        <button 
          onClick={() => { if (holding) setStep(2); }} 
          disabled={!holding} 
          style={{ 
            background: holding ? C.primary : C.bgSubtle, 
            color: holding ? "#fff" : C.textMuted, 
            border: "none", 
            borderRadius: styles.radius.md, 
            padding: "14px 28px", 
            fontWeight: 600, 
            fontSize: 14, 
            cursor: holding ? "pointer" : "not-allowed",
            fontFamily: styles.fontFamily,
          }}
        >
          Check my portfolio →
        </button>
      </div>
    </div>
  );
  
  return <DiagnosticResult platform={platform} holding={holding || "shares"} onContinue={onFinish} onReset={() => { setStep(0); setPlatform(null); setHolding(null); }} />;
}

// ─── Recommended Path Card ────────────────────────────────────────────────────
function RecommendedPathCard({ results, profile, openGlossary }) {
  const top = results.filter(r => !r.product.pficLikely)[0];
  if (!top) return null;
  const p = top.product;
  const countryLabel = COUNTRIES.find(c => c.value === profile.country)?.label || "";
  const availableCtas = (p.ctas || []).filter(cta => {
    const plat = PLATFORMS[cta.platform];
    return !plat || (plat.minDeposit ?? 0) <= profile.amount;
  });
  
  return (
    <div style={{ 
      background: C.card, 
      borderRadius: styles.radius.lg, 
      padding: "32px", 
      border: `1px solid ${C.primary}30`, 
      boxShadow: styles.shadow.md 
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.primary, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
            Top Compliant Option for US Citizens in {countryLabel.replace(/^.+? /, "")}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>{p.name}</div>
          <div style={{ fontSize: 15, color: C.textSecondary, marginTop: 8, lineHeight: 1.65, maxWidth: 480 }}>{p.plainEnglish}</div>
        </div>
        {/* Compliance proof stamps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          <span style={{ background: "#ecfdf5", color: C.success, border: "1px solid #a7f3d0", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Safe for IRS</span>
          <span style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Safe for HMRC</span>
        </div>
      </div>
      
      {/* Primary CTA */}
      {availableCtas.length > 0 ? (
        <>
          <a 
            href={availableCtas[0].url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              background: C.primary, 
              color: "#fff", 
              borderRadius: styles.radius.md, 
              padding: "18px 24px", 
              fontSize: 16, 
              fontWeight: 600, 
              textDecoration: "none", 
              boxShadow: styles.shadow.sm, 
              marginBottom: 8 
            }}
          >
            <span>{availableCtas[0].text}</span>
            <span style={{ fontSize: 20 }}>→</span>
          </a>
          {availableCtas[0].note && <div style={{ fontSize: 13, color: C.textSecondary, padding: "4px 2px 16px", lineHeight: 1.6 }}>{availableCtas[0].note}</div>}
          {availableCtas.length > 1 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500, alignSelf: "center" }}>Also available via:</span>
              {availableCtas.slice(1).map((cta, i) => (
                <a 
                  key={i} 
                  href={cta.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    background: C.bgSubtle, 
                    color: C.text, 
                    border: `1px solid ${C.border}`, 
                    borderRadius: styles.radius.sm, 
                    padding: "8px 14px", 
                    fontSize: 13, 
                    fontWeight: 500, 
                    textDecoration: "none" 
                  }}
                >
                  {PLATFORMS[cta.platform]?.name || cta.text} ↗
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: styles.radius.md, padding: "16px 18px", fontSize: 14, color: "#92400e", marginBottom: 16 }}>
          No platforms are available at your current investment amount for this option. Increase your investment to unlock access.
        </div>
      )}
      
      {/* Learn the terms */}
      {p.glossaryLinks && p.glossaryLinks.length > 0 && (
        <div style={{ paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>Understand the terms:</span>
          {p.glossaryLinks.map(id => <GlossaryChip key={id} termId={id} openGlossary={openGlossary} />)}
        </div>
      )}
      <div style={{ marginTop: 16, fontSize: 12, color: C.textMuted, fontStyle: "italic", lineHeight: 1.6 }}>
        Educational information only — not personalised investment advice. Consult a US-qualified CPA for your specific situation.
      </div>
    </div>
  );
}

// ─── Match Label Helper ───────────────────────────────────────────────────────
function matchLabel(fit, friction) {
  if (friction <= 20) return { label: "Simplest option", color: C.success, bg: "#ecfdf5", border: "#a7f3d0" };
  if (friction <= 40) return { label: "Low complexity", color: C.success, bg: "#ecfdf5", border: "#a7f3d0" };
  if (friction <= 60) return { label: "Moderate complexity", color: C.warning, bg: "#fffbeb", border: "#fde68a" };
  return { label: "Higher complexity", color: C.textSecondary, bg: C.bgSubtle, border: C.border };
}

function matchReason(fit, friction, p) {
  if (p.id === "VTI_VXUS") return "PFIC-safe and HMRC-compliant simultaneously. Dual-compliant across both tax systems.";
  if (p.id === "US_TREASURY") return "Simplest tax situation — produces a standard 1099, no PFIC risk at all.";
  if (p.id === "UK_SIPP") return "US tax-deferred under the US-UK treaty (Article 17(1)(b)). Requires annual Form 8833.";
  if (p.id === "INDIVIDUAL_SHARES") return "Available at UK brokers today. No minimum deposit or professional status required.";
  if (friction <= 20) return "Low tax complexity — straightforward to hold and report.";
  return "Review details below to assess whether this fits your circumstances.";
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ result, rank, openGlossary, amount }) {
  const [exp, setExp] = useState(false);
  const { product: p, fit, friction, fitBreakdown: fitB, frictionBreakdown: frictionB } = result;
  const availableCtas = p.ctas ? p.ctas.filter(cta => {
    const plat = PLATFORMS[cta.platform];
    return !plat || (plat.minDeposit ?? 0) <= (amount ?? 0);
  }) : [];
  const blockedCtas = p.ctas ? p.ctas.filter(cta => {
    const plat = PLATFORMS[cta.platform];
    return plat && (plat.minDeposit ?? 0) > (amount ?? 0);
  }) : [];
  const fc = friction <= 20 ? C.success : friction <= 40 ? C.success : friction <= 60 ? C.warning : C.danger;
  
  return (
    <div style={{ 
      background: C.card, 
      borderRadius: styles.radius.lg, 
      border: `1px solid ${p.pficLikely ? `${C.danger}40` : rank === 1 ? `${C.primary}30` : C.border}`, 
      overflow: "hidden", 
      boxShadow: rank === 1 && !p.pficLikely ? styles.shadow.md : styles.shadow.sm 
    }}>
      {rank === 1 && !p.pficLikely && (
        <div style={{ background: C.primary, padding: "8px 20px", fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>
          PFIC-Safe · HMRC-Compliant · Lowest Tax Complexity
        </div>
      )}
      {p.pficLikely && (
        <div style={{ background: C.danger, padding: "8px 20px", fontSize: 12, fontWeight: 600, color: "#fff" }}>
          Shown for Awareness — What to Avoid as a US Citizen
        </div>
      )}
      <div style={{ padding: "28px" }}>
        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: C.text, letterSpacing: "-0.01em" }}>{p.name}</div>
                <div style={{ fontSize: 14, color: C.textSecondary }}>{p.fullName}</div>
              </div>
            </div>
            {!p.pficLikely && (() => { 
              const m = matchLabel(fit, friction); 
              return (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 20, padding: "5px 14px", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: m.color }}>{m.label}</span>
                  <span style={{ fontSize: 12, color: m.color, opacity: 0.85 }}>· {matchReason(fit, friction, p)}</span>
                </div>
              ); 
            })()}
            {p.ticker && p.ticker !== "N/A" && (
              <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: C.primary, background: `${C.primary}10`, borderRadius: 6, padding: "4px 10px", display: "inline-block", marginBottom: 12 }}>
                {p.ticker}
              </div>
            )}
            <ComplianceStamps pficSafe={p.pficSafe} hmrcCompliant={p.hmrcCompliant} />
          </div>
        </div>
        
        {/* Plain English */}
        <div style={{ background: p.pficLikely ? "#fffbeb" : C.bgSubtle, borderRadius: styles.radius.md, padding: "18px 20px", marginBottom: 20, borderLeft: `3px solid ${p.pficLikely ? C.danger : C.primary}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>In Plain English</div>
          <div style={{ fontSize: 15, color: C.text, lineHeight: 1.65, fontWeight: 500 }}>{p.plainEnglish}</div>
        </div>
        
        {/* Benefit / Risk */}
        <div style={{ display: "grid", gridTemplateColumns: typeof window !== "undefined" && window.innerWidth < 640 ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "#ecfdf5", borderRadius: styles.radius.md, padding: "16px 18px", border: "1px solid #a7f3d0" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.success, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Key Benefit</div>
            <div style={{ fontSize: 14, color: "#065f46", lineHeight: 1.6 }}>{p.benefit}</div>
          </div>
          <div style={{ background: "#fffbeb", borderRadius: styles.radius.md, padding: "16px 18px", border: "1px solid #fde68a" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.warning, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Key Risk</div>
            <div style={{ fontSize: 14, color: "#92400e", lineHeight: 1.6 }}>{p.risk}</div>
          </div>
        </div>
        
        {/* Score bars */}
        {!p.pficLikely && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <ScoreBar value={100 - friction} color={friction <= 20 ? C.success : friction <= 40 ? C.success : C.warning} label="Compliance simplicity (higher = simpler)" />
            <ScoreBar value={friction} color={fc} label="Tax complexity (lower = simpler)" />
          </div>
        )}
        
        {/* Glossary chips */}
        {p.glossaryLinks && p.glossaryLinks.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>Learn:</span>
            {p.glossaryLinks.map(id => <GlossaryChip key={id} termId={id} openGlossary={openGlossary} />)}
          </div>
        )}
        
        {/* CTA Routing Buttons */}
        {p.ctas && p.ctas.length > 0 && !p.pficLikely && (
          <div style={{ marginTop: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>Platforms That Offer This</div>
            {availableCtas.length > 0 ? (
              <>
                <a 
                  href={availableCtas[0].url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    background: C.primary, 
                    color: "#fff", 
                    borderRadius: styles.radius.md, 
                    padding: "16px 20px", 
                    fontSize: 15, 
                    fontWeight: 600, 
                    textDecoration: "none", 
                    boxShadow: styles.shadow.sm, 
                    marginBottom: availableCtas[0].note ? 6 : 10 
                  }}
                >
                  <span>{availableCtas[0].text}</span>
                  <span style={{ fontSize: 18, marginLeft: 8 }}>→</span>
                </a>
                {availableCtas[0].note && <div style={{ fontSize: 13, color: C.textSecondary, padding: "4px 4px 12px", lineHeight: 1.5 }}>{availableCtas[0].note}</div>}
                {availableCtas.slice(1).map((cta, i) => (
                  <div key={i}>
                    <a 
                      href={cta.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between", 
                        background: C.bgSubtle, 
                        color: C.text, 
                        border: `1px solid ${C.border}`, 
                        borderRadius: styles.radius.md, 
                        padding: "12px 16px", 
                        fontSize: 14, 
                        fontWeight: 500, 
                        textDecoration: "none", 
                        marginBottom: cta.note ? 4 : 10 
                      }}
                    >
                      <span>{cta.text}</span>
                      <span style={{ opacity: 0.5, fontSize: 12 }}>↗</span>
                    </a>
                    {cta.note && <div style={{ fontSize: 13, color: C.textMuted, padding: "4px 4px 10px", lineHeight: 1.5 }}>{cta.note}</div>}
                  </div>
                ))}
              </>
            ) : (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: styles.radius.md, padding: "14px 16px", fontSize: 14, color: "#92400e" }}>
                No platforms are available at your current investment amount.
              </div>
            )}
            {blockedCtas.length > 0 && (
              <div style={{ marginTop: 12, padding: "14px 16px", background: C.bgSubtle, border: `1px solid ${C.border}`, borderRadius: styles.radius.md }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Available If You Invest More</div>
                {blockedCtas.map((cta, i) => {
                  const plat = PLATFORMS[cta.platform];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: C.textMuted, marginBottom: i < blockedCtas.length - 1 ? 6 : 0 }}>
                      <span>{plat?.name || cta.text}</span>
                      <span style={{ fontWeight: 600, color: C.warning }}>Requires ${(plat?.minDeposit ?? 0).toLocaleString()} min</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {p.accessWarning && (
          <div style={{ background: p.pficLikely ? "#fef2f2" : "#fffbeb", border: `1px solid ${p.pficLikely ? "#fecaca" : "#fde68a"}`, borderRadius: styles.radius.sm, padding: "12px 14px", fontSize: 13, color: p.pficLikely ? "#991b1b" : "#92400e", fontWeight: 500, marginBottom: 12 }}>
            {p.accessWarning}
          </div>
        )}
        
        <button 
          onClick={() => setExp(e => !e)} 
          style={{ 
            background: "none", 
            border: "none", 
            cursor: "pointer", 
            color: C.primary, 
            fontSize: 13, 
            fontWeight: 600, 
            padding: 0,
            fontFamily: styles.fontFamily,
          }}
        >
          {exp ? "▲ Hide technical notes" : "▼ Show technical notes"}
        </button>
        
        {exp && (
          <div style={{ marginTop: 16, padding: 20, background: C.bgSubtle, borderRadius: styles.radius.md, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>
            <p style={{ margin: "0 0 16px" }}>{p.note}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>Fit Factors</div>
                {fitB.map((b, i) => <div key={i} style={{ fontSize: 12, color: b.d > 0 ? C.success : C.danger, marginBottom: 4 }}>{b.d > 0 ? "+" : ""}{b.d} {b.l}</div>)}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>Friction Factors</div>
                {frictionB.map((b, i) => <div key={i} style={{ fontSize: 12, color: b.d > 10 ? C.danger : C.warning, marginBottom: 4 }}>+{b.d} {b.l}</div>)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { value: "gb", label: "United Kingdom", live: true },
  { value: "de", label: "Germany", live: false },
  { value: "sg", label: "Singapore", live: false },
  { value: "ae", label: "UAE / Dubai", live: false },
  { value: "ca", label: "Canada", live: false },
  { value: "au", label: "Australia", live: false },
  { value: "fr", label: "France", live: false },
  { value: "jp", label: "Japan", live: false },
  { value: "nl", label: "Netherlands", live: false },
  { value: "ch", label: "Switzerland", live: false },
];

function StepLocation({ data, set }) {
  return (
    <>
      <h2 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 10, letterSpacing: "-0.02em" }}>Where do you currently live?</h2>
      <p style={{ color: C.textSecondary, marginBottom: 24, fontSize: 15, lineHeight: 1.6 }}>Your country of residence determines which investment platforms will open an account for you and which products are available to US citizens there.</p>
      <div style={{ background: `${C.primary}08`, border: `1px solid ${C.primary}20`, borderRadius: styles.radius.md, padding: "14px 18px", marginBottom: 28, fontSize: 14, color: C.primary, fontWeight: 500 }}>
        Patty is launching in the UK first. More countries are coming soon.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: typeof window !== "undefined" && window.innerWidth < 640 ? "1fr" : "1fr 1fr", gap: 12 }}>
        {COUNTRIES.map(c => c.live ? (
          <Opt key={c.value} selected={data.country === c.value} onClick={() => set("country", c.value)} style={{ fontWeight: 500, fontSize: 15 }}>{c.label}</Opt>
        ) : (
          <div key={c.value} style={{ padding: "16px 20px", borderRadius: styles.radius.md, border: `1px solid ${C.border}`, background: C.bgSubtle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "default", opacity: 0.6 }}>
            <span style={{ fontWeight: 500, fontSize: 15, color: C.textSecondary }}>{c.label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", whiteSpace: "nowrap" }}>Coming soon</span>
          </div>
        ))}
      </div>
    </>
  );
}

function StepAmount({ data, set }) {
  const fmt = n => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;
  return (
    <>
      <h2 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 10, letterSpacing: "-0.02em" }}>How much are you investing?</h2>
      <div style={{ background: "#eff6ff", borderRadius: styles.radius.md, padding: "14px 18px", marginBottom: 28, fontSize: 14, color: "#1d4ed8", lineHeight: 1.6 }}>
        <strong>Key thresholds:</strong> FBAR applies above <strong>$10K</strong> in foreign accounts · FATCA Form 8938 applies above <strong>$200K</strong> (expat threshold)
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {[10000, 50000, 100000, 250000].map(p => (
          <button 
            key={p} 
            onClick={() => set("amount", p)} 
            style={{ 
              padding: "12px 22px", 
              borderRadius: styles.radius.md, 
              border: `1.5px solid ${data.amount === p ? C.primary : C.border}`, 
              background: data.amount === p ? `${C.primary}08` : C.card, 
              fontWeight: 600, 
              fontSize: 15, 
              cursor: "pointer", 
              color: C.text,
              fontFamily: styles.fontFamily,
            }}
          >
            {fmt(p)}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: C.text }}>$</span>
        <input 
          type="number" 
          value={data.amount || ""} 
          onChange={e => set("amount", parseInt(e.target.value) || 0)} 
          placeholder="Custom amount" 
          style={{ 
            flex: 1, 
            padding: "14px 18px", 
            borderRadius: styles.radius.md, 
            border: `1.5px solid ${C.border}`, 
            fontSize: 17, 
            fontWeight: 500, 
            outline: "none", 
            color: C.text,
            fontFamily: styles.fontFamily,
          }} 
        />
      </div>
    </>
  );
}

function StepBehaviour({ data, set }) {
  const qs = [
    { key: "hasUSAccount", label: "Do you already have a US brokerage account?", sublabel: "e.g. Fidelity, Vanguard US, an old Schwab or TD Ameritrade account from before you moved", opts: [{ v: "yes", l: "Yes — I have an existing US account" }, { v: "no", l: "No — I'll need to open a new one" }], row: true },
    { key: "marketReaction", label: "If your investments dropped 20% overnight, what would you do?", opts: [{ v: "panic", l: "Sell everything — I can't handle the stress" }, { v: "uncomfortable", l: "Very uncomfortable, but I'd probably hold" }, { v: "hold", l: "Stay the course — it'll recover" }, { v: "buymore", l: "Buy more — it's a discount" }], row: false },
    { key: "accessNeed", label: "Might you need this money within the next 2 years?", opts: [{ v: "yes", l: "Yes, possibly" }, { v: "maybe", l: "Maybe" }, { v: "no", l: "No — long-term" }], row: true },
    { key: "goal", label: "What's your main goal?", opts: [{ v: "growth", l: "Grow my wealth" }, { v: "income", l: "Regular income" }, { v: "preserve", l: "Protect capital" }], row: true },
    { key: "horizon", label: "How long can you leave this money invested?", opts: [{ v: "short", l: "Under 3 years" }, { v: "medium", l: "3–7 years" }, { v: "long", l: "7–15 years" }, { v: "verylong", l: "15+ years" }], row: true },
    { key: "spendCurrency", label: "What currency do you mostly spend in?", opts: [{ v: "usd", l: "Mostly USD" }, { v: "local", l: "Mostly GBP / local" }, { v: "mix", l: "A mix" }], row: true },
  ];
  
  return (
    <>
      <h2 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 10, letterSpacing: "-0.02em" }}>A few quick questions</h2>
      <p style={{ color: C.textSecondary, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>No jargon — Patty handles the technical side.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {qs.map(q => (
          <div key={q.key}>
            <div style={{ fontWeight: 600, fontSize: 16, color: C.text, marginBottom: q.sublabel ? 6 : 14 }}>{q.label}</div>
            {q.sublabel && <div style={{ fontSize: 14, color: C.textSecondary, marginBottom: 14 }}>{q.sublabel}</div>}
            <div style={{ display: "flex", flexDirection: q.row ? "row" : "column", gap: 10, flexWrap: "wrap" }}>
              {q.opts.map(o => <Opt key={o.v} selected={data[q.key] === o.v} onClick={() => set(q.key, o.v)} style={{ fontSize: 14, fontWeight: 500, flex: q.row ? 1 : undefined }}>{o.l}</Opt>)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Existing US Account Card ─────────────────────────────────────────────────
function ExistingUSAccountCard({ openGlossary }) {
  return (
    <div style={{ 
      background: C.card, 
      borderRadius: styles.radius.lg, 
      padding: "32px", 
      border: `1px solid ${C.primary}30`, 
      boxShadow: styles.shadow.md 
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.primary, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>You Already Have What You Need</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>Use your existing US account</div>
          <div style={{ fontSize: 15, color: C.textSecondary, marginTop: 10, lineHeight: 1.7, maxWidth: 480 }}>
            You have a US brokerage account from before you moved. Most US brokers — Fidelity, Vanguard US, Schwab — allow existing customers to keep their accounts and continue investing while living abroad. This is your most direct path to VTI and VXUS.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          <span style={{ background: "#ecfdf5", color: C.success, border: "1px solid #a7f3d0", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Safe for IRS</span>
          <span style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Safe for HMRC</span>
        </div>
      </div>
      
      <div style={{ background: `${C.primary}06`, borderRadius: styles.radius.md, padding: "20px 22px", marginBottom: 24, border: `1px solid ${C.primary}15` }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.primary, marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>What To Do</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { n: "1", text: "Log into your existing Fidelity, Vanguard US, or Schwab account" },
            { n: "2", text: "Search for VTI (Vanguard Total Market ETF) and VXUS (Vanguard Total International)" },
            { n: "3", text: "Buy both — VTI for US market exposure, VXUS for international. Together they cover the global market." },
            { n: "4", text: "Keep your UK address updated in the account — most brokers require this for compliance" },
          ].map(s => (
            <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ background: C.primary, color: "#fff", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{s.n}</span>
              <span style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>{s.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: styles.radius.md, padding: "14px 18px", fontSize: 14, color: "#92400e", marginBottom: 20, lineHeight: 1.6 }}>
        Note: Some brokers restrict certain transactions (especially mutual funds) for non-US residents, even on existing accounts. ETFs like VTI and VXUS are generally available. If your broker restricts you, Charles Schwab International (no minimum deposit, commission-free) is the best formal alternative.
      </div>
      
      {["pfic", "hmrc_reporting", "etf"].length > 0 && (
        <div style={{ paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>Understand the terms:</span>
          {["pfic", "hmrc_reporting", "etf"].map(id => <GlossaryChip key={id} termId={id} openGlossary={openGlossary} />)}
        </div>
      )}
      <div style={{ marginTop: 16, fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>
        Educational information only — not personalised investment advice. Confirm your broker's current policy on accounts held by non-US residents before investing.
      </div>
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────
function Results({ profile, showPfic, setShowPfic, openGlossary }) {
  const hasExistingUSAccount = profile.hasUSAccount === "yes";
  const results = runEngine(profile, showPfic);
  const safeR = results.filter(r => !r.product.pficLikely);
  const pficR = results.filter(r => r.product.pficLikely);
  const countryLabel = COUNTRIES.find(c => c.value === profile.country)?.label || profile.country;
  const fmt = n => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
  const compliance = [
    { label: "FBAR (FinCEN 114)", status: profile.amount >= 10000 ? "Required — total foreign accounts ≥ $10K at any point" : "Not required at this portfolio size", ok: true, tid: "fbar", src: "31 CFR § 1010.350" },
    { label: "FATCA Form 8938", status: profile.amount >= 200000 ? "May be required — threshold is $200K year-end (single) or $400K (married filing jointly). Confirm your filing status." : "Likely not required at this portfolio size — verify against your filing status.", ok: true, tid: "fatca", src: "IRC § 6038D" },
    { label: "PFIC Form 8621", status: showPfic ? "Potentially required if PFIC product selected" : "Not required — PFIC products filtered out", ok: !showPfic, tid: "form_8621", src: "IRC § 1291–1298" },
    { label: "Form 8833 (Treaty claim)", status: safeR.some(r => r.product.sippCaveat) ? "Required if SIPP treaty deferral is claimed" : "Not applicable to current selection", ok: true, tid: "form_8833", src: "Art. 17(1)(b), US-UK Treaty 2001" },
  ];
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Disclaimer banner */}
      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: styles.radius.md, padding: "14px 20px", fontSize: 14, color: "#92400e", display: "flex", alignItems: "center", gap: 12, lineHeight: 1.6 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ</span>
        <span><strong>Not personal advice.</strong> Patty describes general product categories based on publicly available IRS and HMRC rules. This is educational information — not a personal recommendation. Your situation may differ. <strong>Always consult a US-qualified CPA or tax attorney before acting.</strong></span>
      </div>
      
      {/* Banner */}
      <div style={{ background: C.card, borderRadius: styles.radius.lg, padding: "28px 32px", border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Where You Can Invest · US Citizen in {countryLabel.replace(/^.+? /, "")}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>{countryLabel} · {fmt(profile.amount)}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <span style={{ background: `${C.success}10`, color: C.success, border: `1px solid ${C.success}30`, borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 600 }}>{safeR.length} PFIC-safe options</span>
            <span style={{ background: C.bgSubtle, color: C.textSecondary, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 600 }}>All HMRC-compliant</span>
          </div>
        </div>
      </div>
      
      {/* Threshold alerts */}
      {profile.amount >= 10000 && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: styles.radius.md, padding: "16px 20px", fontSize: 14, color: "#1d4ed8", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span><strong>FBAR triggered:</strong> You must file FinCEN 114 annually for any foreign financial accounts.</span>
          <button onClick={() => openGlossary("fbar")} style={{ background: "#dbeafe", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 12, fontWeight: 600, color: "#1d4ed8", cursor: "pointer", fontFamily: styles.fontFamily }}>What's FBAR?</button>
        </div>
      )}
      {profile.amount >= 200000 && (
        <div style={{ background: `${C.primary}08`, border: `1px solid ${C.primary}20`, borderRadius: styles.radius.md, padding: "16px 20px", fontSize: 14, color: C.primary, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span><strong>Possible FATCA threshold:</strong> Foreign assets ≥ $200K (single filer) or $400K (married filing jointly). Form 8938 may be required — check your filing status.</span>
          <button onClick={() => openGlossary("fatca")} style={{ background: `${C.primary}15`, border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 12, fontWeight: 600, color: C.primary, cursor: "pointer", fontFamily: styles.fontFamily }}>What's FATCA?</button>
        </div>
      )}
      
      {/* Existing US account — show above all else if they have one */}
      {hasExistingUSAccount && <ExistingUSAccountCard openGlossary={openGlossary} />}
      
      {/* Recommended Path — only show if not surfacing the existing account card */}
      {!hasExistingUSAccount && safeR.length > 0 && <RecommendedPathCard results={safeR} profile={profile} openGlossary={openGlossary} />}
      
      {/* Safe products */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 20, color: C.text, marginBottom: 8, letterSpacing: "-0.01em" }}>Compliant investment categories</div>
        <div style={{ fontSize: 15, color: C.textSecondary, marginBottom: 20, lineHeight: 1.6 }}>Every option below is available to US citizens in your country and verified safe under both IRS and HMRC rules. Listed by tax compliance simplicity — not as a personal recommendation.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {safeR.map((r, i) => <ProductCard key={r.product.id} result={r} rank={i + 1} openGlossary={openGlossary} amount={profile.amount} />)}
        </div>
      </div>
      
      {/* Platforms */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 8, letterSpacing: "-0.01em" }}>Which platforms accept US citizens</div>
        <div style={{ fontSize: 15, color: C.textSecondary, marginBottom: 20, lineHeight: 1.6 }}>Showing platforms you can access at your investment amount. Most UK brokers can't legally sell US ETFs to retail clients.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.entries(PLATFORMS).map(([id, p]) => {
            const affordable = (p.minDeposit ?? 0) <= profile.amount;
            return (
              <div key={id} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "18px 20px", background: affordable ? C.card : C.bgSubtle, borderRadius: styles.radius.md, border: `1px solid ${!affordable ? C.border : p.pficSafe ? C.border : `${C.warning}40`}`, opacity: affordable ? 1 : 0.55 }}>
                <div style={{ background: C.bgSubtle, borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: C.textSecondary, whiteSpace: "nowrap", flexShrink: 0 }}>{p.badge}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, fontSize: 15, color: affordable ? C.text : C.textMuted, textDecoration: "none" }}>{p.name} ↗</a>
                    {!affordable && <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px" }}>Requires ${(p.minDeposit ?? 0).toLocaleString()} min</span>}
                    {affordable && !p.pficSafe && <span style={{ fontSize: 12, color: C.warning, fontWeight: 600 }}>Limited for US citizens</span>}
                  </div>
                  <div style={{ fontSize: 14, color: C.textSecondary, marginTop: 6, lineHeight: 1.6 }}>{p.note}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 20, padding: "14px 18px", background: "#fffbeb", borderRadius: styles.radius.sm, border: "1px solid #fde68a", fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>Note: Platform policies change. Verify current terms directly before opening an account.</div>
      </Card>
      
      {/* PFIC toggle */}
      <Card style={{ borderColor: showPfic ? `${C.danger}40` : C.border }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: showPfic && pficR.length ? 24 : 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>See what to avoid — PFIC products</div>
            <div style={{ fontSize: 14, color: C.textSecondary, marginTop: 6, lineHeight: 1.6 }}>
              These are what most UK platforms will offer you. Understanding why they're wrong for US citizens is half the battle.{" "}
              <button onClick={() => openGlossary("pfic")} style={{ background: "none", border: "none", cursor: "pointer", color: C.primary, fontWeight: 600, fontSize: 14, padding: 0, fontFamily: styles.fontFamily }}>What's a PFIC?</button>
            </div>
          </div>
          <button 
            onClick={() => setShowPfic(v => !v)} 
            style={{ 
              padding: "12px 20px", 
              borderRadius: styles.radius.md, 
              cursor: "pointer", 
              fontWeight: 600, 
              fontSize: 14, 
              border: `1.5px solid ${showPfic ? C.danger : C.border}`, 
              background: showPfic ? `${C.danger}10` : C.bgSubtle, 
              color: showPfic ? C.danger : C.text, 
              transition: "all 0.2s ease", 
              flexShrink: 0,
              fontFamily: styles.fontFamily,
            }}
          >
            {showPfic ? "Hide PFIC products" : "Show what to avoid"}
          </button>
        </div>
        {showPfic && pficR.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{pficR.map((r, i) => <ProductCard key={r.product.id} result={r} rank={i + 1} openGlossary={openGlossary} amount={profile.amount} />)}</div>}
      </Card>
      
      {/* Compliance */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 8, letterSpacing: "-0.01em" }}>Your US Reporting Requirements</div>
        <div style={{ fontSize: 15, color: C.textSecondary, marginBottom: 20, lineHeight: 1.6 }}>Based on IRS guidance and the US-UK treaty. Click any term to learn more.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {compliance.map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", background: C.bgSubtle, borderRadius: styles.radius.md, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 18, marginTop: 2 }}>{item.ok ? "✓" : "!"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{item.label}</span>
                  <GlossaryChip termId={item.tid} openGlossary={openGlossary} />
                </div>
                <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.5 }}>{item.status}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4, fontStyle: "italic" }}>Source: {item.src}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, padding: "18px 20px", background: "#fffbeb", borderRadius: styles.radius.md, border: "1px solid #fde68a", fontSize: 13, color: "#92400e", lineHeight: 1.7 }}>
          <strong>Important — not personal advice:</strong> Patty is an educational information service, not a regulated financial advisor. It describes general product categories that are typically compliant for U.S. citizens in the UK, based on publicly available IRS and HMRC rules. Nothing shown here constitutes a personal recommendation to buy, sell, or hold any specific investment. The ordering reflects general tax compliance simplicity — not suitability for your individual circumstances. You are solely responsible for your own investment decisions. Tax rules are complex and change frequently; while we endeavour to keep information current, Patty does not warrant the accuracy, completeness, or timeliness of any information presented and accepts no liability for losses or damages arising from reliance on this content. Always verify current rules with a US-qualified CPA or tax attorney before acting on any information shown here. Patty is not registered with the U.S. Securities and Exchange Commission (SEC) as an investment adviser. Patty is not authorised or regulated by the Financial Conduct Authority (FCA) and does not carry out any regulated activities under the Financial Services and Markets Act 2000.
        </div>
      </Card>
      
      {/* Email capture */}
      <EmailCapture country={profile.country} />
    </div>
  );
}

// ─── Email Capture ───────────────────────────────────────────────────────────
function EmailCapture({ country }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const countryLabel = COUNTRIES.find(c => c.value === country)?.label || country;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    console.log("Email captured:", { email, country });
    setSubmitted(true);
  };
  
  if (submitted) {
    return (
      <div style={{ background: "#ecfdf5", borderRadius: styles.radius.lg, padding: "32px", border: "1px solid #a7f3d0", textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.success, marginBottom: 8 }}>You're on the list</div>
        <div style={{ fontSize: 15, color: "#065f46", lineHeight: 1.6 }}>We'll notify you when rules change in {countryLabel}, new compliant platforms become available, or key tax deadlines approach.</div>
      </div>
    );
  }
  
  return (
    <div style={{ background: C.card, borderRadius: styles.radius.lg, padding: "36px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.primary, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Stay Compliant</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 10, letterSpacing: "-0.02em" }}>Tax rules change. Get notified when they do.</div>
      <div style={{ fontSize: 15, color: C.textSecondary, marginBottom: 28, lineHeight: 1.65, maxWidth: 520 }}>
        Get alerts when compliance rules change in {countryLabel}, new PFIC-safe platforms open up, and FBAR/FATCA deadlines approach. Free — no spam.
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{ 
            flex: 1, 
            minWidth: 240, 
            padding: "16px 20px", 
            borderRadius: styles.radius.md, 
            border: `1.5px solid ${C.border}`, 
            fontSize: 15, 
            outline: "none", 
            color: C.text, 
            background: C.card,
            fontFamily: styles.fontFamily,
          }}
        />
        <button 
          type="submit" 
          style={{ 
            background: C.primary, 
            color: "#fff", 
            border: "none", 
            borderRadius: styles.radius.md, 
            padding: "16px 32px", 
            fontSize: 15, 
            fontWeight: 600, 
            cursor: "pointer", 
            whiteSpace: "nowrap",
            fontFamily: styles.fontFamily,
          }}
        >
          Keep me informed
        </button>
      </form>
      <div style={{ fontSize: 13, color: C.textMuted, marginTop: 16 }}>We'll only email you about rule changes and deadlines. Unsubscribe anytime. Your email and country are stored solely for this purpose and will not be shared with third parties.</div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ onReset, showReset, openGlossary }) {
  return (
    <nav style={{ 
      background: C.card, 
      borderBottom: `1px solid ${C.border}`, 
      height: 72, 
      display: "flex", 
      alignItems: "center", 
      padding: "0 32px", 
      position: "sticky", 
      top: 0, 
      zIndex: 10, 
      gap: 12 
    }}>
      <button 
        onClick={onReset} 
        style={{ 
          fontWeight: 700, 
          fontSize: 22, 
          color: C.text, 
          background: "none", 
          border: "none", 
          cursor: "pointer", 
          letterSpacing: "-0.02em",
          fontFamily: styles.fontFamily,
        }}
      >
        <span style={{ color: C.primary }}>P</span>atty
      </button>
      <div style={{ flex: 1 }} />
      <button 
        onClick={() => openGlossary(null)} 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 6, 
          background: C.bgSubtle, 
          color: C.text, 
          border: `1px solid ${C.border}`, 
          borderRadius: styles.radius.md, 
          padding: "10px 18px", 
          fontSize: 14, 
          fontWeight: 600, 
          cursor: "pointer",
          fontFamily: styles.fontFamily,
        }}
      >
        Glossary
      </button>
      {showReset && (
        <button 
          onClick={onReset} 
          style={{ 
            background: C.bgSubtle, 
            color: C.text, 
            border: `1px solid ${C.border}`, 
            borderRadius: styles.radius.md, 
            padding: "10px 18px", 
            fontSize: 14, 
            fontWeight: 600, 
            cursor: "pointer",
            fontFamily: styles.fontFamily,
          }}
        >
          ← Start Over
        </button>
      )}
    </nav>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Location", canProceed: d => !!d.country },
  { label: "Amount", canProceed: d => d.amount > 0 },
  { label: "Profile", canProceed: d => !!(d.hasUSAccount && d.marketReaction && d.accessNeed && d.goal && d.horizon && d.spendCurrency) },
];

export default function PattyApp() {
  const [page, setPage] = useState("landing");
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ country: "", amount: 0, marketReaction: "", accessNeed: "", goal: "", horizon: "", spendCurrency: "", hasUSAccount: "" });
  const [showPfic, setShowPfic] = useState(false);
  const [anim, setAnim] = useState(true);
  const [gOpen, setGOpen] = useState(false);
  const [gTerm, setGTerm] = useState(null);
  const mobile = useIsMobile();
  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const go = cb => { setAnim(false); setTimeout(() => { cb(); setAnim(true); }, 160); };
  const next = () => go(() => step < STEPS.length - 1 ? setStep(s => s + 1) : setPage("results"));
  const back = () => go(() => step > 0 ? setStep(s => s - 1) : setPage("landing"));
  const reset = () => go(() => { setPage("landing"); setStep(0); setProfile({ country: "", amount: 0, marketReaction: "", accessNeed: "", goal: "", horizon: "", spendCurrency: "", hasUSAccount: "" }); setShowPfic(false); });
  const openG = id => { setGTerm(id); setGOpen(true); };
  const Shared = () => <GlossaryModal open={gOpen} initialTerm={gTerm} onClose={() => setGOpen(false)} />;
  
  if (page === "landing") return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: styles.fontFamily, display: "flex", flexDirection: "column" }}>
      <Nav onReset={reset} showReset={false} openGlossary={openG} /><Shared />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 32px" }}>
        <div style={{ width: "100%", maxWidth: 760, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.primary}10`, color: C.primary, borderRadius: 999, padding: "8px 20px", fontSize: 13, fontWeight: 600, marginBottom: 32 }}>For US Citizens Living Abroad</div>
          <h1 style={{ fontSize: mobile ? 36 : 56, fontWeight: 700, color: C.text, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 28 }}>
            Where can you invest?<br /><span style={{ color: C.primary }}>Patty shows you exactly.</span>
          </h1>
          <p style={{ fontSize: 19, color: C.textSecondary, lineHeight: 1.7, maxWidth: 560, margin: "0 auto 44px" }}>Investing abroad as a U.S. citizen is full of hidden tax traps. Patty uses your location to filter safe investment options and direct you to platforms where you can execute.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
            <button 
              onClick={() => setPage("onboard")} 
              style={{ 
                background: C.primary, 
                color: "#fff", 
                border: "none", 
                borderRadius: styles.radius.md, 
                padding: "20px 44px", 
                fontSize: 17, 
                fontWeight: 600, 
                cursor: "pointer", 
                boxShadow: styles.shadow.md,
                fontFamily: styles.fontFamily,
              }}
            >
              Find out where I can invest →
            </button>
            <button 
              onClick={() => setPage("diagnostic")} 
              style={{ 
                background: C.card, 
                color: C.text, 
                border: `1.5px solid ${C.border}`, 
                borderRadius: styles.radius.md, 
                padding: "20px 28px", 
                fontSize: 16, 
                fontWeight: 600, 
                cursor: "pointer",
                fontFamily: styles.fontFamily,
              }}
            >
              Check my existing portfolio
            </button>
          </div>
          
          {/* PFIC calculator */}
          <div style={{ marginBottom: 48 }}><PficCalculator /></div>
          
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 20, textAlign: "left", marginBottom: 32 }}>
            {[
              { title: "Why your HL account may not work", body: "Most UK ETFs are classified as tax traps (PFICs) by the IRS. Most UK advisors don't know this applies to US citizens.", tid: "pfic" }, 
              { title: "Why you can't just buy VTI on HL", body: "UK regulations (PRIIPs) block retail brokers from selling US ETFs. HL limits US citizens to individual shares only.", tid: "priips" }, 
              { title: "What actually works", body: "VTI and VXUS via Charles Schwab International — US-domiciled and HMRC-compliant. The one setup that satisfies both tax systems.", tid: "hmrc_reporting" }
            ].map(c => (
              <div key={c.title} style={{ background: C.card, borderRadius: styles.radius.md, padding: "24px", border: `1px solid ${C.border}` }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 10 }}>{c.title}</div>
                <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>{c.body}</div>
                <button onClick={() => openG(c.tid)} style={{ background: "none", border: "none", cursor: "pointer", color: C.primary, fontWeight: 600, fontSize: 13, padding: 0, fontFamily: styles.fontFamily }}>Learn more →</button>
              </div>
            ))}
          </div>
          
          <div style={{ padding: "20px 24px", background: "#fffbeb", borderRadius: styles.radius.md, border: "1px solid #fde68a", fontSize: 13, color: "#92400e", lineHeight: 1.7, textAlign: "left" }}>
            <strong>Important — please read:</strong> Patty is an educational information service. It maps publicly available IRS and HMRC rules onto general product categories to help US citizens living abroad understand their options. <strong>Patty does not provide personalised financial, tax, or investment advice.</strong> Nothing on this site constitutes a personal recommendation to buy, sell, or hold any specific investment. The information shown describes general product characteristics — not suitability for your specific circumstances. You are solely responsible for your own investment decisions. Tax rules are complex and change frequently; while we endeavour to keep information current, Patty does not warrant the accuracy, completeness, or timeliness of any information presented and accepts no liability for losses or damages arising from reliance on this content. Always consult a US-qualified CPA or tax attorney before making any investment decisions. Patty is not registered with the U.S. Securities and Exchange Commission (SEC) as an investment adviser. Patty is not authorised or regulated by the Financial Conduct Authority (FCA) and does not carry out any regulated activities under the Financial Services and Markets Act 2000. By using this site, you acknowledge and accept these limitations.
          </div>
        </div>
      </div>
      
      <div style={{ background: C.text, padding: "28px 48px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24 }}>
          {[{ l: "PFIC-Safe Only" }, { l: "HMRC Compliant" }, { l: "US-UK Treaty Grounded" }, { l: "Full Glossary Built-In" }].map(f => (
            <div key={f.l} style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{f.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  if (page === "diagnostic") return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: styles.fontFamily }}>
      <Nav onReset={reset} showReset={false} openGlossary={openG} /><Shared />
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "60px 32px" }}>
        <div style={{ background: C.card, borderRadius: styles.radius.lg, padding: 36, boxShadow: styles.shadow.md, border: `1px solid ${C.border}` }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.warning}15`, color: "#92400e", borderRadius: 999, padding: "6px 16px", fontSize: 12, fontWeight: 600, marginBottom: 24 }}>Portfolio PFIC Check — Educational</div>
          <DiagnosticFlow onFinish={() => setPage("onboard")} onBack={() => setPage("landing")} />
        </div>
      </div>
    </div>
  );
  
  if (page === "onboard") {
    const Comp = [StepLocation, StepAmount, StepBehaviour][step];
    const ok = STEPS[step].canProceed(profile);
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: styles.fontFamily }}>
        <Nav onReset={reset} showReset={false} openGlossary={openG} /><Shared />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 48 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <StepDot n={i + 1} active={step === i} done={step > i} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: step === i ? C.text : C.textMuted }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: step > i ? C.primary : C.border, margin: "0 12px", marginBottom: 24, transition: "background 0.3s" }} />}
              </div>
            ))}
          </div>
          <div style={{ opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(8px)", transition: "all 0.2s ease" }}>
            <div style={{ background: C.card, borderRadius: styles.radius.lg, padding: 36, boxShadow: styles.shadow.md, border: `1px solid ${C.border}` }}>
              <Comp data={profile} set={set} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
                <button 
                  onClick={back} 
                  style={{ 
                    background: C.bgSubtle, 
                    color: C.text, 
                    border: `1px solid ${C.border}`, 
                    borderRadius: styles.radius.md, 
                    padding: "14px 28px", 
                    fontWeight: 600, 
                    fontSize: 15, 
                    cursor: "pointer",
                    fontFamily: styles.fontFamily,
                  }}
                >
                  ← Back
                </button>
                <button 
                  onClick={next} 
                  disabled={!ok} 
                  style={{ 
                    background: ok ? C.primary : C.bgSubtle, 
                    color: ok ? "#fff" : C.textMuted, 
                    border: "none", 
                    borderRadius: styles.radius.md, 
                    padding: "14px 32px", 
                    fontWeight: 600, 
                    fontSize: 15, 
                    cursor: ok ? "pointer" : "not-allowed",
                    fontFamily: styles.fontFamily,
                  }}
                >
                  {step === STEPS.length - 1 ? "See My Options →" : "Continue →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: styles.fontFamily }}>
      <Nav onReset={reset} showReset={true} openGlossary={openG} /><Shared />
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 32px" }}>
        <Results profile={profile} showPfic={showPfic} setShowPfic={setShowPfic} openGlossary={openG} />
      </div>
    </div>
  );
}
