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

const C = {
  primary: "#4c1d95", // deep purple
  accent: "#7c3aed", // vibrant purple — CTAs, highlights
  accentDark: "#6d28d9", // darker purple — gradients, hover
  warning: "#f59e0b",
  danger: "#ef4444",
  muted: "#94a3b8",
  bg: "#faf5ff", // lightest lavender background
  card: "#ffffff",
  text: "#1e293b",
  light: "#64748b",
  purple: "#a78bfa", // lighter purple — secondary highlights
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

// ─── Products ─────────────────────�����───────────────────────────────────────────
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
  return <div style={{ background: C.card, borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", ...style }}>{children}</div>;
}
function ScoreBar({ value, color, label }) {
  return (
  <div>
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
  <span style={{ fontSize: 11, fontWeight: 700, color: C.light }}>{label}</span>
  <span style={{ fontSize: 12, fontWeight: 900, color }}>{value}<span style={{ fontSize: 10, color: C.muted }}>/100</span></span>
  </div>
  <div style={{ background: "#e2e8f0", borderRadius: 999, height: 7 }}>
  <div style={{ width: `${value}%`, background: color, height: "100%", borderRadius: 999, transition: "width 0.8s" }} />
  </div>
  </div>
  );
}
function StepDot({ n, active, done }) {
  return <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? C.accent : active ? C.primary : "#e2e8f0", color: done || active ? "#fff" : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0, boxShadow: active ? `0 0 0 4px ${C.primary}25` : "none", transition: "all 0.3s" }}>{done ? "" : n}</div>;
}
function Opt({ selected, onClick, children, style = {} }) {
  return <button onClick={onClick} style={{ padding: "13px 16px", borderRadius: 12, border: `2px solid ${selected ? C.accent : "#e2e8f0"}`, background: selected ? C.accent + "18" : "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.15s", color: C.text, ...style }}>{children}</button>;
}
function GlossaryChip({ termId, openGlossary }) {
  const entry = GLOSSARY.find(g => g.id === termId);
  if (!entry) return null;
  return (
  <button onClick={() => openGlossary(termId)} style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#f1f5f9", color: C.primary, border: "1px solid #cbd5e1", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
  {entry.term} <span style={{ opacity: 0.5, fontSize: 10 }}>?</span>
  </button>
  );
}
function PlatformChip({ platformId }) {
  const p = PLATFORMS[platformId];
  if (!p) return null;
  return <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, background: p.color + "15", color: p.color, border: `1px solid ${p.color}40`, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>{p.name} ↗</a>;
}
function ComplianceStamps({ pficSafe, hmrcCompliant }) {
  return (
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
  <span style={{ background: pficSafe ? "#d1fae5" : "#fee2e2", color: pficSafe ? "#065f46" : "#991b1b", border: `1px solid ${pficSafe ? "#6ee7b7" : "#fca5a5"}`, borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 800 }}>
  {pficSafe ? "PFIC-safe" : "PFIC risk"}
  </span>
  <span style={{ background: hmrcCompliant ? "#dbeafe" : "#fef3c7", color: hmrcCompliant ? "#1e40af" : "#92400e", border: `1px solid ${hmrcCompliant ? "#93c5fd" : "#fde68a"}`, borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 800 }}>
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
  const sColor = { danger: C.danger, warning: C.warning, good: C.accent, info: C.primary };
  if (!open) return null;
  return (
  <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", padding: 16 }} onClick={onClose}>
  <div style={{ background: C.card, borderRadius: 20, width: "100%", maxWidth: 880, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
  {/* Header */}
  <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
  <div>
  <div style={{ fontWeight: 900, fontSize: 20, color: C.primary }}>Expat Investing Glossary</div>
  <div style={{ fontSize: 13, color: C.light, marginTop: 2 }}>Plain-English definitions — no assumptions, no jargon</div>
  </div>
  <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 18, color: C.text }}></button>
  </div>
  <div style={{ display: "flex", flexDirection: typeof window !== "undefined" && window.innerWidth < 640 ? "column" : "row", flex: 1, overflow: "hidden", minHeight: 0 }}>
  {/* Sidebar */}
  <div style={{ width: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 230, borderRight: typeof window !== "undefined" && window.innerWidth < 640 ? "none" : "1px solid #e2e8f0", borderBottom: typeof window !== "undefined" && window.innerWidth < 640 ? "1px solid #e2e8f0" : "none", display: "flex", flexDirection: "column", flexShrink: 0, maxHeight: typeof window !== "undefined" && window.innerWidth < 640 ? 180 : "none" }}>
  <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
  <input value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }} placeholder="Search terms..." style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", color: C.text, boxSizing: "border-box" }} />
  </div>
  <div style={{ overflowY: "auto", flex: 1 }}>
  {filtered.map(g => (
  <button key={g.id} onClick={() => setSelected(g.id)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: activeTerm === g.id ? C.primary + "10" : "transparent", borderLeft: `3px solid ${activeTerm === g.id ? sColor[g.severity] : "transparent"}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
  <div style={{ overflow: "hidden" }}>
  <div style={{ fontSize: 13, fontWeight: 700, color: activeTerm === g.id ? C.primary : C.text }}>{g.term}</div>
  <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.full}</div>
  </div>
  </button>
  ))}
  </div>
  </div>
  {/* Detail */}
  {active && (
  <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
  <div style={{ display: "flex", gap: 14, marginBottom: 20, alignItems: "flex-start" }}>
  <div>
  <div style={{ fontSize: 24, fontWeight: 900, color: C.primary, lineHeight: 1.1 }}>{active.term}</div>
  <div style={{ fontSize: 13, color: C.light, marginTop: 4 }}>{active.full}</div>
  <div style={{ marginTop: 10 }}>
  <span style={{ background: sColor[active.severity] + "20", color: sColor[active.severity], border: `1px solid ${sColor[active.severity]}40`, borderRadius: 8, padding: "3px 12px", fontSize: 11, fontWeight: 800 }}>
  {active.severity === "danger" ? "High risk if ignored" : active.severity === "warning" ? "Important to know" : active.severity === "good" ? "Works in your favour" : "Need to know"}
  </span>
  </div>
  </div>
  </div>
  <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px 18px", marginBottom: 18 }}>
  <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>IN PLAIN ENGLISH</div>
  <div style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.55 }}>{active.plain}</div>
  </div>
  <div style={{ marginBottom: 18 }}>
  <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, marginBottom: 10, letterSpacing: 1 }}>THE FULL PICTURE</div>
  <div style={{ fontSize: 14, color: C.light, lineHeight: 1.75 }}>{active.detail}</div>
  </div>
  <div style={{ background: sColor[active.severity] + "12", border: `1px solid ${sColor[active.severity]}30`, borderRadius: 12, padding: "16px 18px" }}>
  <div style={{ fontSize: 10, fontWeight: 800, color: sColor[active.severity], marginBottom: 8, letterSpacing: 1 }}>WHAT THIS MEANS FOR YOU</div>
  <div style={{ fontSize: 14, color: C.text, lineHeight: 1.65, fontWeight: 500 }}>{active.implication}</div>
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
  // PFIC: IRS taxes at highest ordinary income rate (37%) + estimated interest charge
  // This is a simplified illustration; actual charge depends on IRC §1291 calculations
  const pficTax = gain * 0.42;
  const pficNet = finalValue - pficTax;
  // PFIC-safe (US-domiciled ETF): long-term capital gains rate
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
  <div style={{ background: "#fff", borderRadius: 20, border: `2px solid ${C.danger}30`, padding: "28px 28px 20px", marginBottom: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
  <div>
  <div style={{ fontSize: 11, fontWeight: 800, color: C.danger, letterSpacing: 1, marginBottom: 4 }}>ILLUSTRATIVE TAX DRAG COMPARISON</div>
  <div style={{ fontSize: 20, fontWeight: 900, color: C.primary }}>What does the PFIC trap actually cost?</div>
  <div style={{ fontSize: 13, color: C.light, marginTop: 4, maxWidth: 460 }}>Adjust the inputs to see the estimated difference in after-tax value between a PFIC product (e.g. a standard UK UCITS fund) and a PFIC-safe US-domiciled ETF.</div>
  </div>
  <div style={{ background: C.danger + "12", border: `1px solid ${C.danger}30`, borderRadius: 14, padding: "14px 20px", textAlign: "center", minWidth: 140 }}>
  <div style={{ fontSize: 11, fontWeight: 800, color: C.danger, marginBottom: 4 }}>ESTIMATED EXTRA LOSS</div>
  <div style={{ fontSize: 34, fontWeight: 900, color: C.danger, lineHeight: 1 }}>{fmt(saving)}</div>
  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>to PFIC tax treatment</div>
  </div>
  </div>
  {/* Sliders */}
  <div style={{ display: "grid", gridTemplateColumns: typeof window !== "undefined" && window.innerWidth < 640 ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 22 }}>
  <div>
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Amount invested</span>
  <span style={{ fontSize: 13, fontWeight: 900, color: C.primary }}>{fmt(amount)}</span>
  </div>
  <input type="range" min={10000} max={500000} step={10000} value={amount} onChange={e => setAmount(+e.target.value)}
  style={{ width: "100%", accentColor: C.primary }} />
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, marginTop: 2 }}><span>$10K</span><span>$500K</span></div>
  </div>
  <div>
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Time horizon</span>
  <span style={{ fontSize: 13, fontWeight: 900, color: C.primary }}>{years} years</span>
  </div>
  <input type="range" min={5} max={30} step={1} value={years} onChange={e => setYears(+e.target.value)}
  style={{ width: "100%", accentColor: C.primary }} />
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, marginTop: 2 }}><span>5 yrs</span><span>30 yrs</span></div>
  </div>
  </div>
  {/* Comparison table */}
  <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: 0, borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
  <div style={{ background: "#f8fafc", padding: "8px 12px", fontSize: 11, fontWeight: 800, color: C.muted }} />
  <div style={{ background: C.danger + "15", padding: "8px 12px", fontSize: 11, fontWeight: 800, color: C.danger, textAlign: "center" }}>PFIC product<br /><span style={{ fontWeight: 600, fontSize: 10 }}>(e.g. VWRL / LifeStrategy)</span></div>
  <div style={{ background: C.accent + "15", padding: "8px 12px", fontSize: 11, fontWeight: 800, color: C.accentDark, textAlign: "center" }}>PFIC-safe ETF<br /><span style={{ fontWeight: 600, fontSize: 10 }}>(e.g. VTI + VXUS)</span></div>
  {pcts.map((row, i) => (
  <>
  <div key={`l${i}`} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", padding: "9px 12px", fontSize: 12, fontWeight: row.highlight ? 800 : 500, color: C.text, borderTop: "1px solid #f1f5f9" }}>{row.label}</div>
  <div key={`p${i}`} style={{ background: i % 2 === 0 ? C.danger + "08" : C.danger + "04", padding: "9px 12px", fontSize: 13, fontWeight: 800, color: row.highlight ? C.danger : row.negative ? C.danger : C.text, textAlign: "center", borderTop: "1px solid #f1f5f9" }}>{row.negative ? `-${fmt(Math.abs(row.pfic))}` : fmt(row.pfic)}</div>
  <div key={`c${i}`} style={{ background: i % 2 === 0 ? C.accent + "08" : C.accent + "04", padding: "9px 12px", fontSize: 13, fontWeight: 800, color: row.highlight ? C.accentDark : row.negative ? C.warning : C.text, textAlign: "center", borderTop: "1px solid #f1f5f9" }}>{row.negative ? `-${fmt(Math.abs(row.clean))}` : fmt(row.clean)}</div>
  </>
  ))}
  </div>
  <div style={{ marginTop: 12, padding: "8px 12px", background: "#fef9ec", borderRadius: 8, border: "1px solid #fde68a", fontSize: 11, color: "#92400e" }}>
  Note: Illustrative only ��� assumes 7% annual growth, 37% US ordinary income rate + estimated PFIC interest charge vs. 20% long-term CGT. Actual tax depends on your specific situation. This is not tax advice. Consult a US-qualified CPA.
  </div>
  </div>
  );
}

// ─── Portfolio Diagnostic ────────────────────────────────────────��───��────────
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
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
  <div style={{ background: isPficRisk ? "#fef2f2" : isUnsure ? "#fffbeb" : "#f0fdf4", border: `2px solid ${isPficRisk ? C.danger : isUnsure ? C.warning : C.accent}`, borderRadius: 16, padding: "20px 22px" }}>
  <div style={{ fontSize: 28, marginBottom: 8 }}>{isPficRisk ? "" : isUnsure ? "" : ""}</div>
  <div style={{ fontSize: 18, fontWeight: 900, color: isPficRisk ? C.danger : isUnsure ? "#92400e" : C.accentDark, marginBottom: 8 }}>
  {isPficRisk ? "PFIC Risk Detected" : isUnsure ? "Needs Review" : "Looks Compliant"}
  </div>
  <div style={{ fontSize: 14, color: C.text, lineHeight: 1.65, marginBottom: 12 }}>
  {isPficRisk && `Holdings like ${hold?.id === "ucits" ? "UCITS index funds and trackers" : "funds on this platform"} are classified as Passive Foreign Investment Companies (PFICs) by the IRS. US citizens holding these face punitive tax treatment under IRC §1291–1298 — gains taxed at the highest ordinary income rate plus an interest charge, not the lower capital gains rate.`}
  {isUnsure && `You'll need to confirm exactly what you hold. If your account contains any UK or Irish-domiciled funds, ETFs, or trackers, these are likely PFICs under IRS rules. Individual shares are generally safe.`}
  {isClean && !isUnsure && `Individual shares and US-domiciled ETFs held at a platform like ${plat?.label} are generally PFIC-safe. You're not invested in the typical PFIC trap products.`}
  </div>
  <div style={{ fontSize: 12, color: C.light, fontStyle: "italic" }}>This is an educational assessment based on publicly known IRS PFIC classification rules — not personalised tax advice. Please confirm with a US-qualified CPA.</div>
  </div>
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
  <button onClick={onContinue} style={{ flex: 1, background: `linear-gradient(135deg,${C.accent},${C.accentDark})`, color: "#fff", border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
  See PFIC-safe, HMRC-compliant options →
  </button>
  <button onClick={onReset} style={{ background: "#f1f5f9", color: C.text, border: "none", borderRadius: 12, padding: "14px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Start over</button>
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
  <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 6 }}>STEP 1 OF {showHoldings ? 2 : 1}</div>
  <h2 style={{ fontSize: 22, fontWeight: 900, color: C.primary, marginBottom: 6 }}>Which platform do you currently use?</h2>
  <p style={{ fontSize: 13, color: C.light, marginBottom: 20 }}>Patty will check whether it's likely to expose US citizens to PFIC risk.</p>
  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
  {DIAG_PLATFORMS.map(p => (
  <button key={p.id} onClick={() => setPlatform(p.id)} style={{ padding: "13px 16px", borderRadius: 12, border: `2px solid ${platform === p.id ? C.accent : "#e2e8f0"}`, background: platform === p.id ? C.accent + "18" : "#fff", cursor: "pointer", textAlign: "left", fontWeight: 600, fontSize: 14, color: C.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  {p.label}
  {platform === p.id && <span style={{ color: C.accent, fontSize: 16 }}></span>}
  </button>
  ))}
  </div>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
  <button onClick={onBack} style={{ background: "#f1f5f9", color: C.text, border: "none", borderRadius: 10, padding: "12px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
  <button onClick={() => { if (platform) { if (showHoldings) setStep(1); else setStep(2); } }} disabled={!platform} style={{ background: platform ? `linear-gradient(135deg,${C.accent},${C.accentDark})` : "#e2e8f0", color: platform ? "#fff" : C.muted, border: "none", borderRadius: 10, padding: "12px 26px", fontWeight: 700, fontSize: 14, cursor: platform ? "pointer" : "not-allowed" }}>Continue →</button>
  </div>
  </div>
  );
  if (step === 1) return (
  <div>
  <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 6 }}>STEP 2 OF 2</div>
  <h2 style={{ fontSize: 22, fontWeight: 900, color: C.primary, marginBottom: 6 }}>What do you currently hold?</h2>
  <p style={{ fontSize: 13, color: C.light, marginBottom: 20 }}>Select the option that best describes your holdings on {plat?.label}.</p>
  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
  {DIAG_HOLDINGS.map(h => (
  <button key={h.id} onClick={() => setHolding(h.id)} style={{ padding: "13px 16px", borderRadius: 12, border: `2px solid ${holding === h.id ? C.accent : "#e2e8f0"}`, background: holding === h.id ? C.accent + "18" : "#fff", cursor: "pointer", textAlign: "left", fontWeight: 600, fontSize: 13, color: C.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  {h.label}
  {holding === h.id && <span style={{ color: C.accent, fontSize: 16 }}></span>}
  </button>
  ))}
  </div>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
  <button onClick={() => setStep(0)} style={{ background: "#f1f5f9", color: C.text, border: "none", borderRadius: 10, padding: "12px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
  <button onClick={() => { if (holding) setStep(2); }} disabled={!holding} style={{ background: holding ? `linear-gradient(135deg,${C.accent},${C.accentDark})` : "#e2e8f0", color: holding ? "#fff" : C.muted, border: "none", borderRadius: 10, padding: "12px 26px", fontWeight: 700, fontSize: 14, cursor: holding ? "pointer" : "not-allowed" }}>Check my portfolio →</button>
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
  <div style={{ background: "#fff", borderRadius: 18, padding: "24px 26px", border: `2px solid ${C.accent}`, boxShadow: `0 8px 32px ${C.accent}18` }}>
  {/* Header */}
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
  <div>
  <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, letterSpacing: 1, marginBottom: 5 }}>
  TOP COMPLIANT OPTION FOR US CITIZENS IN {countryLabel.replace(/^.+? /, "").toUpperCase()}
  </div>
  <div style={{ fontSize: 24, fontWeight: 900, color: C.primary }}>{p.icon} {p.name}</div>
  <div style={{ fontSize: 13, color: C.light, marginTop: 4, lineHeight: 1.55, maxWidth: 460 }}>{p.plainEnglish}</div>
  </div>
  {/* Compliance proof stamps */}
  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
  <span style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7", borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>Safe for IRS</span>
  <span style={{ background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd", borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>Safe for HMRC</span>
  </div>
  </div>
  {/* Primary CTA — only show if affordable */}
  {availableCtas.length > 0 ? (
  <>
  <a href={availableCtas[0].url} target="_blank" rel="noopener noreferrer"
  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(135deg,${C.accent},${C.accentDark})`, color: "#fff", borderRadius: 12, padding: "16px 20px", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: `0 4px 20px ${C.accent}40`, marginBottom: 6 }}>
  <span>{availableCtas[0].text}</span>
  <span style={{ fontSize: 20 }}>→</span>
  </a>
  {availableCtas[0].note && <div style={{ fontSize: 11, color: C.light, padding: "2px 2px 10px", lineHeight: 1.5 }}>{availableCtas[0].note}</div>}
  {availableCtas.length > 1 && (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, alignSelf: "center" }}>Also available via:</span>
  {availableCtas.slice(1).map((cta, i) => (
  <a key={i} href={cta.url} target="_blank" rel="noopener noreferrer"
  style={{ background: "#f1f5f9", color: C.primary, border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
  {PLATFORMS[cta.platform]?.name || cta.text} ↗
  </a>
  ))}
  </div>
  )}
  </>
  ) : (
  <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#92400e", marginBottom: 12 }}>
  No platforms are available at your current investment amount for this option. Increase your investment to unlock access.
  </div>
  )}
  {/* Learn the terms */}
  {p.glossaryLinks && p.glossaryLinks.length > 0 && (
  <div style={{ paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Understand the terms:</span>
  {p.glossaryLinks.map(id => <GlossaryChip key={id} termId={id} openGlossary={openGlossary} />)}
  </div>
  )}
  <div style={{ marginTop: 10, fontSize: 11, color: C.muted, fontStyle: "italic", lineHeight: 1.5 }}>
  Educational information only — not personalised investment advice. Consult a US-qualified CPA for your specific situation.
  </div>
  </div>
  );
}

// ─── Match Label Helper ───────────────────────────────────────────────────────
function matchLabel(fit, friction) {
  if (friction <= 20) return { label: "Simplest option", color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" };
  if (friction <= 40) return { label: "Low complexity", color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" };
  if (friction <= 60) return { label: "Moderate complexity", color: "#92400e", bg: "#fef3c7", border: "#fde68a" };
  return { label: "Higher complexity", color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" };
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
  const fc = friction <= 20 ? C.accent : friction <= 40 ? "#22c55e" : friction <= 60 ? C.warning : C.danger;
  return (
  <div style={{ background: C.card, borderRadius: 14, border: `2px solid ${p.pficLikely ? C.danger + "50" : rank === 1 ? C.accent : "#e2e8f0"}`, overflow: "hidden", boxShadow: rank === 1 && !p.pficLikely ? `0 4px 20px ${C.accent}25` : "none" }}>
  {rank === 1 && !p.pficLikely && <div style={{ background: `linear-gradient(90deg,${C.accent},${C.accentDark})`, padding: "5px 16px", fontSize: 11, fontWeight: 800, color: "#fff" }}>PFIC-SAFE · HMRC-COMPLIANT · LOWEST TAX COMPLEXITY</div>}
  {p.pficLikely && <div style={{ background: C.danger, padding: "5px 16px", fontSize: 11, fontWeight: 800, color: "#fff" }}>SHOWN FOR AWARENESS — what to avoid as a US citizen</div>}
  <div style={{ padding: "18px 20px" }}>
  {/* Title row */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
  <div style={{ flex: 1 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
  <div>
  <div style={{ fontWeight: 900, fontSize: 16, color: C.text }}>{p.name}</div>
  <div style={{ fontSize: 12, color: C.light }}>{p.fullName}</div>
  </div>
  </div>
  {!p.pficLikely && (() => { const m = matchLabel(fit, friction); return (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 20, padding: "3px 10px", marginBottom: 8 }}>
  <span style={{ fontSize: 11, fontWeight: 800, color: m.color }}>{m.label}</span>
  <span style={{ fontSize: 11, color: m.color, opacity: 0.8 }}>· {matchReason(fit, friction, p)}</span>
  </div>
  ); })()}
  {p.ticker && p.ticker !== "N/A" && <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: C.primary, background: "#eff6ff", borderRadius: 6, padding: "2px 8px", display: "inline-block", marginBottom: 8 }}>{p.ticker}</div>}
  <ComplianceStamps pficSafe={p.pficSafe} hmrcCompliant={p.hmrcCompliant} />
  </div>
  </div>
  {/* Plain English */}
  <div style={{ background: p.pficLikely ? "#fff7ed" : "#f8fafc", borderRadius: 10, padding: "12px 14px", marginBottom: 12, borderLeft: `3px solid ${p.pficLikely ? C.danger : C.accent}` }}>
  <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, marginBottom: 5, letterSpacing: 0.8 }}>IN PLAIN ENGLISH</div>
  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55, fontWeight: 500 }}>{p.plainEnglish}</div>
  </div>
  {/* Benefit / Risk */}
  <div style={{ display: "grid", gridTemplateColumns: typeof window !== "undefined" && window.innerWidth < 640 ? "1fr" : "1fr 1fr", gap: 8, marginBottom: 12 }}>
  <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 12px", border: "1px solid #bbf7d0" }}>
  <div style={{ fontSize: 10, fontWeight: 800, color: "#166534", marginBottom: 4 }}>KEY BENEFIT</div>
  <div style={{ fontSize: 12, color: "#166534", lineHeight: 1.5 }}>{p.benefit}</div>
  </div>
  <div style={{ background: "#fff7ed", borderRadius: 8, padding: "10px 12px", border: "1px solid #fed7aa" }}>
  <div style={{ fontSize: 10, fontWeight: 800, color: "#92400e", marginBottom: 4 }}>KEY RISK</div>
  <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>{p.risk}</div>
  </div>
  </div>
  {/* Score bars */}
  {!p.pficLikely && (
  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
  <ScoreBar value={100 - friction} color={friction <= 20 ? C.accent : friction <= 40 ? "#22c55e" : C.warning} label="Compliance simplicity (higher = simpler)" />
  <ScoreBar value={friction} color={fc} label="Tax complexity (lower = simpler)" />
  </div>
  )}
  {/* Glossary chips */}
  {p.glossaryLinks && p.glossaryLinks.length > 0 && (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, alignItems: "center" }}>
  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Learn:</span>
  {p.glossaryLinks.map(id => <GlossaryChip key={id} termId={id} openGlossary={openGlossary} />)}
  </div>
  )}
  {/* CTA Routing Buttons */}
  {p.ctas && p.ctas.length > 0 && !p.pficLikely && (
  <div style={{ marginTop: 14, marginBottom: 10 }}>
  <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 0.8, marginBottom: 8 }}>PLATFORMS THAT OFFER THIS</div>
  {availableCtas.length > 0 ? (
  <>
  <a href={availableCtas[0].url} target="_blank" rel="noopener noreferrer"
  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(135deg,${C.accent},${C.accentDark})`, color: "#fff", borderRadius: 12, padding: "14px 18px", fontSize: 14, fontWeight: 800, textDecoration: "none", boxShadow: `0 4px 16px ${C.accent}40`, marginBottom: availableCtas[0].note ? 4 : 6 }}>
  <span>{availableCtas[0].text}</span>
  <span style={{ fontSize: 18, marginLeft: 8 }}>→</span>
  </a>
  {availableCtas[0].note && <div style={{ fontSize: 11, color: C.light, padding: "2px 4px 8px", lineHeight: 1.4 }}>{availableCtas[0].note}</div>}
  {availableCtas.slice(1).map((cta, i) => (
  <div key={i}>
  <a href={cta.url} target="_blank" rel="noopener noreferrer"
  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", color: C.primary, border: `1px solid ${C.primary}25`, borderRadius: 10, padding: "10px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none", marginBottom: cta.note ? 2 : 6 }}>
  <span>{cta.text}</span>
  <span style={{ opacity: 0.5, fontSize: 12 }}>↗</span>
  </a>
  {cta.note && <div style={{ fontSize: 11, color: C.muted, padding: "2px 4px 6px", lineHeight: 1.4 }}>{cta.note}</div>}
  </div>
  ))}
  </>
  ) : (
  <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#92400e" }}>
  No platforms are available at your current investment amount.
  </div>
  )}
  {blockedCtas.length > 0 && (
  <div style={{ marginTop: 8, padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10 }}>
  <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, marginBottom: 6, letterSpacing: 0.5 }}>AVAILABLE IF YOU INVEST MORE</div>
  {blockedCtas.map((cta, i) => {
  const plat = PLATFORMS[cta.platform];
  return (
  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: i < blockedCtas.length - 1 ? 4 : 0 }}>
  <span>{plat?.name || cta.text}</span>
  <span style={{ fontWeight: 700, color: C.warning }}>Requires ${(plat?.minDeposit ?? 0).toLocaleString()} min</span>
  </div>
  );
  })}
  </div>
  )}
  </div>
  )}
  {p.accessWarning && (
  <div style={{ background: p.pficLikely ? "#fef2f2" : "#fffbeb", border: `1px solid ${p.pficLikely ? "#fecaca" : "#fde68a"}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: p.pficLikely ? "#7f1d1d" : "#92400e", fontWeight: 600, marginBottom: 8 }}>
  {p.accessWarning}
  </div>
  )}
  <button onClick={() => setExp(e => !e)} style={{ background: "none", border: "none", cursor: "pointer", color: C.primary, fontSize: 12, fontWeight: 700, padding: 0 }}>
  {exp ? "▲ Hide technical notes" : "▼ Show technical notes"}
  </button>
  {exp && (
  <div style={{ marginTop: 10, padding: 14, background: "#f8fafc", borderRadius: 10, fontSize: 12, color: C.light, lineHeight: 1.6 }}>
  <p style={{ margin: "0 0 12px" }}>{p.note}</p>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
  <div>
  <div style={{ fontSize: 11, fontWeight: 800, color: C.text, marginBottom: 6 }}>FIT FACTORS</div>
  {fitB.map((b, i) => <div key={i} style={{ fontSize: 11, color: b.d > 0 ? "#22c55e" : C.danger, marginBottom: 2 }}>{b.d > 0 ? "+" : ""}{b.d} {b.l}</div>)}
  </div>
  <div>
  <div style={{ fontSize: 11, fontWeight: 800, color: C.text, marginBottom: 6 }}>FRICTION FACTORS</div>
  {frictionB.map((b, i) => <div key={i} style={{ fontSize: 11, color: b.d > 10 ? C.danger : C.warning, marginBottom: 2 }}>+{b.d} {b.l}</div>)}
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
  return (<>
  <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>Where do you currently live?</h2>
  <p style={{ color: C.light, marginBottom: 16, fontSize: 14 }}>Your country of residence determines which investment platforms will open an account for you and which products are available to US citizens there.</p>
  <div style={{ background: C.accent + "15", border: `1px solid ${C.accent}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 12, color: C.accentDark, fontWeight: 600 }}>
  Patty is launching in the UK first. More countries are coming soon.
  </div>
  <div style={{ display: "grid", gridTemplateColumns: typeof window !== "undefined" && window.innerWidth < 640 ? "1fr" : "1fr 1fr", gap: 10 }}>
  {COUNTRIES.map(c => c.live ? (
  <Opt key={c.value} selected={data.country === c.value} onClick={() => set("country", c.value)} style={{ fontWeight: 600, fontSize: 14 }}>{c.label}</Opt>
  ) : (
  <div key={c.value} style={{ padding: "13px 16px", borderRadius: 12, border: "2px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "default", opacity: 0.65 }}>
  <span style={{ fontWeight: 600, fontSize: 14, color: C.light }}>{c.label}</span>
  <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, background: "#e2e8f0", borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap" }}>Coming soon</span>
  </div>
  ))}
  </div>
  </>);
}
function StepAmount({ data, set }) {
  const fmt = n => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;
  return (<>
  <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>How much are you investing?</h2>
  <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 12, color: "#1e40af" }}>
  <strong>Key thresholds:</strong> FBAR applies above <strong>$10K</strong> in foreign accounts · FATCA Form 8938 applies above <strong>$200K</strong> (expat threshold)
  </div>
  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
  {[10000, 50000, 100000, 250000].map(p => <button key={p} onClick={() => set("amount", p)} style={{ padding: "10px 18px", borderRadius: 10, border: `2px solid ${data.amount === p ? C.accent : "#e2e8f0"}`, background: data.amount === p ? C.accent + "18" : "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", color: C.text }}>{fmt(p)}</button>)}
  </div>
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
  <span style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>$</span>
  <input type="number" value={data.amount || ""} onChange={e => set("amount", parseInt(e.target.value) || 0)} placeholder="Custom amount" style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "2px solid #e2e8f0", fontSize: 16, fontWeight: 600, outline: "none", color: C.text }} />
  </div>
  </>);
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
  return (<>
  <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>A few quick questions</h2>
  <p style={{ color: C.light, marginBottom: 22, fontSize: 14 }}>No jargon — Patty handles the technical side.</p>
  <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
  {qs.map(q => (
  <div key={q.key}>
  <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: q.sublabel ? 3 : 10 }}>{q.label}</div>
  {q.sublabel && <div style={{ fontSize: 12, color: C.light, marginBottom: 10 }}>{q.sublabel}</div>}
  <div style={{ display: "flex", flexDirection: q.row ? "row" : "column", gap: 8, flexWrap: "wrap" }}>
  {q.opts.map(o => <Opt key={o.v} selected={data[q.key] === o.v} onClick={() => set(q.key, o.v)} style={{ fontSize: 13, fontWeight: 600, flex: q.row ? 1 : undefined }}>{o.l}</Opt>)}
  </div>
  </div>
  ))}
  </div>
  </>);
}

// ─── Existing US Account Card ─────────────────────────────────────────────────
function ExistingUSAccountCard({ openGlossary }) {
  return (
  <div style={{ background: "#fff", borderRadius: 18, padding: "22px 24px", border: `2px solid ${C.accent}`, boxShadow: `0 8px 32px ${C.accent}18` }}>
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
  <div>
  <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, letterSpacing: 1, marginBottom: 5 }}>YOU ALREADY HAVE WHAT YOU NEED</div>
  <div style={{ fontSize: 22, fontWeight: 900, color: C.primary }}>Use your existing US account</div>
  <div style={{ fontSize: 13, color: C.light, marginTop: 5, lineHeight: 1.55, maxWidth: 440 }}>
  You have a US brokerage account from before you moved. Most US brokers — Fidelity, Vanguard US, Schwab — allow existing customers to keep their accounts and continue investing while living abroad. This is your most direct path to VTI and VXUS.
  </div>
  </div>
  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
  <span style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7", borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>Safe for IRS</span>
  <span style={{ background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd", borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>Safe for HMRC</span>
  </div>
  </div>
  <div style={{ background: "#f5f3ff", borderRadius: 12, padding: "14px 16px", marginBottom: 16, border: `1px solid ${C.accent}25` }}>
  <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 8, letterSpacing: 0.8 }}>WHAT TO DO</div>
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
  {[
  { n: "1", text: "Log into your existing Fidelity, Vanguard US, or Schwab account" },
  { n: "2", text: "Search for VTI (Vanguard Total Market ETF) and VXUS (Vanguard Total International)" },
  { n: "3", text: "Buy both — VTI for US market exposure, VXUS for international. Together they cover the global market." },
  { n: "4", text: "Keep your UK address updated in the account — most brokers require this for compliance" },
  ].map(s => (
  <div key={s.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
  <span style={{ background: C.accent, color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{s.n}</span>
  <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{s.text}</span>
  </div>
  ))}
  </div>
  </div>
  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 12 }}>
  Note: Some brokers restrict certain transactions (especially mutual funds) for non-US residents, even on existing accounts. ETFs like VTI and VXUS are generally available. If your broker restricts you, Charles Schwab International (no minimum deposit, commission-free) is the best formal alternative.
  </div>
  {["pfic", "hmrc_reporting", "etf"].length > 0 && (
  <div style={{ paddingTop: 10, borderTop: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Understand the terms:</span>
  {["pfic", "hmrc_reporting", "etf"].map(id => <GlossaryChip key={id} termId={id} openGlossary={openGlossary} />)}
  </div>
  )}
  <div style={{ marginTop: 10, fontSize: 11, color: C.muted, fontStyle: "italic" }}>
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
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
  {/* Disclaimer banner */}
  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "10px 16px", fontSize: 12, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
  <span style={{ fontSize: 14, flexShrink: 0 }}>&#9432;</span>
  <span><strong>Not personal advice.</strong> Patty describes general product categories based on publicly available IRS and HMRC rules. This is educational information — not a personal recommendation. Your situation may differ. <strong>Always consult a US-qualified CPA or tax attorney before acting.</strong></span>
  </div>
  {/* Banner */}
  <div style={{ background: `linear-gradient(135deg,${C.primary},${C.accentDark})`, borderRadius: 16, padding: "24px 28px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
  <div>
  <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>WHERE YOU CAN INVEST · US CITIZEN IN {countryLabel.replace(/^.+? /, "").toUpperCase()}</div>
  <div style={{ fontSize: 20, fontWeight: 800 }}>{countryLabel} · {fmt(profile.amount)}</div>
  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
  <span style={{ background: C.accent + "30", color: C.accent, border: `1px solid ${C.accent}50`, borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>{safeR.length} PFIC-safe options</span>
  <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>All HMRC-compliant</span>
  </div>
  </div>

  </div>
  {/* Threshold alerts */}
  {profile.amount >= 10000 && (
  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#1e40af", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
  <span><strong>FBAR triggered:</strong> You must file FinCEN 114 annually for any foreign financial accounts.</span>
  <button onClick={() => openGlossary("fbar")} style={{ background: "#dbeafe", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#1d4ed8", cursor: "pointer" }}>What's FBAR?</button>
  </div>
  )}
  {profile.amount >= 200000 && (
  <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#4c1d95", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
  <span><strong>Possible FATCA threshold:</strong> Foreign assets ≥ $200K (single filer) or $400K (married filing jointly). Form 8938 may be required — check your filing status.</span>
  <button onClick={() => openGlossary("fatca")} style={{ background: "#ede9fe", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#4c1d95", cursor: "pointer" }}>What's FATCA?</button>
  </div>
  )}
  {/* Existing US account — show above all else if they have one */}
  {hasExistingUSAccount && <ExistingUSAccountCard openGlossary={openGlossary} />}
  {/* Recommended Path — only show if not surfacing the existing account card */}
  {!hasExistingUSAccount && safeR.length > 0 && <RecommendedPathCard results={safeR} profile={profile} openGlossary={openGlossary} />}
  {/* Safe products */}
  <div>
  <div style={{ fontWeight: 800, fontSize: 17, color: C.text, marginBottom: 4 }}>Compliant investment categories</div>
  <div style={{ fontSize: 13, color: C.light, marginBottom: 14 }}>Every option below is available to US citizens in your country and verified safe under both IRS and HMRC rules. Listed by tax compliance simplicity — not as a personal recommendation.</div>
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
  {safeR.map((r, i) => <ProductCard key={r.product.id} result={r} rank={i + 1} openGlossary={openGlossary} amount={profile.amount} />)}
  </div>
  </div>
  {/* Platforms */}
  <Card>
  <div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 6 }}>Which platforms accept US citizens</div>
  <div style={{ fontSize: 13, color: C.light, marginBottom: 14 }}>Showing platforms you can access at your investment amount. Most UK brokers can't legally sell US ETFs to retail clients.</div>
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
  {Object.entries(PLATFORMS).map(([id, p]) => {
  const affordable = (p.minDeposit ?? 0) <= profile.amount;
  return (
  <div key={id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: affordable ? "#f8fafc" : "#f1f5f9", borderRadius: 12, border: `1px solid ${!affordable ? "#e2e8f0" : p.pficSafe ? "#e2e8f0" : C.warning + "60"}`, opacity: affordable ? 1 : 0.55 }}>
  <div style={{ background: p.color + "20", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 800, color: p.color, whiteSpace: "nowrap", flexShrink: 0 }}>{p.badge}</div>
  <div style={{ flex: 1 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
  <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 800, fontSize: 13, color: affordable ? C.primary : C.muted, textDecoration: "none" }}>{p.name} ↗</a>
  {!affordable && <span style={{ fontSize: 11, color: C.muted, fontWeight: 700, background: "#e2e8f0", borderRadius: 6, padding: "2px 8px" }}>Requires ${(p.minDeposit ?? 0).toLocaleString()} min</span>}
  {affordable && !p.pficSafe && <span style={{ fontSize: 11, color: C.warning, fontWeight: 700 }}>Limited for US citizens</span>}
  </div>
  <div style={{ fontSize: 12, color: C.light, marginTop: 3, lineHeight: 1.5 }}>{p.note}</div>
  </div>
  </div>
  );
  })}
  </div>
  <div style={{ marginTop: 12, padding: "10px 14px", background: "#fef9ec", borderRadius: 10, border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>Note: Platform policies change. Verify current terms directly before opening an account.</div>
  </Card>
  {/* PFIC toggle */}
  <Card style={{ borderColor: showPfic ? C.danger + "60" : "#e2e8f0" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: showPfic && pficR.length ? 16 : 0 }}>
  <div>
  <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>See what to avoid — PFIC products</div>
  <div style={{ fontSize: 12, color: C.light, marginTop: 3 }}>
  These are what most UK platforms will offer you. Understanding why they're wrong for US citizens is half the battle.{" "}
  <button onClick={() => openGlossary("pfic")} style={{ background: "none", border: "none", cursor: "pointer", color: C.primary, fontWeight: 700, fontSize: 12, padding: 0 }}>What's a PFIC?</button>
  </div>
  </div>
  <button onClick={() => setShowPfic(v => !v)} style={{ padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, border: `2px solid ${showPfic ? C.danger : "#e2e8f0"}`, background: showPfic ? C.danger + "15" : "#f8fafc", color: showPfic ? C.danger : C.text, transition: "all 0.2s", flexShrink: 0 }}>
  {showPfic ? "Hide PFIC products" : "Show what to avoid"}
  </button>
  </div>
  {showPfic && pficR.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{pficR.map((r, i) => <ProductCard key={r.product.id} result={r} rank={i + 1} openGlossary={openGlossary} amount={profile.amount} />)}</div>}
  </Card>
  {/* Compliance */}
  <Card>
  <div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 4 }}>Your US Reporting Requirements</div>
  <div style={{ fontSize: 13, color: C.light, marginBottom: 14 }}>Based on IRS guidance and the US-UK treaty. Click any term to learn more.</div>
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
  {compliance.map(item => (
  <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
  <span style={{ fontSize: 16, marginTop: 1 }}>{item.ok ? "" : "!"}</span>
  <div style={{ flex: 1 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.label}</span>
  <GlossaryChip termId={item.tid} openGlossary={openGlossary} />
  </div>
  <div style={{ fontSize: 12, color: C.light }}>{item.status}</div>
  <div style={{ fontSize: 10, color: C.muted, marginTop: 2, fontStyle: "italic" }}>Source: {item.src}</div>
  </div>
  </div>
  ))}
  </div>
  <div style={{ marginTop: 12, padding: "12px 14px", background: "#fef9ec", borderRadius: 10, border: "1px solid #fde68a", fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
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
  // In production, this would POST to your backend or email service (e.g. Mailchimp, Buttondown)
  console.log("Email captured:", { email, country });
  setSubmitted(true);
  };
  if (submitted) {
  return (
  <div style={{ background: "#f0fdf4", borderRadius: 16, padding: "24px 28px", border: "2px solid #86efac", textAlign: "center" }}>
  <div style={{ fontSize: 22, marginBottom: 8 }}>&#10003;</div>
  <div style={{ fontSize: 17, fontWeight: 800, color: "#065f46", marginBottom: 4 }}>You're on the list</div>
  <div style={{ fontSize: 13, color: "#047857", lineHeight: 1.5 }}>We'll notify you when rules change in {countryLabel}, new compliant platforms become available, or key tax deadlines approach.</div>
  </div>
  );
  }
  return (
  <div style={{ background: `linear-gradient(135deg, ${C.primary}08, ${C.accent}12)`, borderRadius: 16, padding: "28px", border: `2px solid ${C.accent}30` }}>
  <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, letterSpacing: 1, marginBottom: 6 }}>STAY COMPLIANT</div>
  <div style={{ fontSize: 18, fontWeight: 900, color: C.primary, marginBottom: 6 }}>Tax rules change. Get notified when they do.</div>
  <div style={{ fontSize: 13, color: C.light, marginBottom: 18, lineHeight: 1.55, maxWidth: 480 }}>
  Get alerts when compliance rules change in {countryLabel}, new PFIC-safe platforms open up, and FBAR/FATCA deadlines approach. Free — no spam.
  </div>
  <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
  <input
  type="email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  placeholder="your@email.com"
  required
  style={{ flex: 1, minWidth: 220, padding: "14px 16px", borderRadius: 12, border: "2px solid #e2e8f0", fontSize: 14, outline: "none", color: C.text, background: "#fff" }}
  />
  <button type="submit" style={{ background: `linear-gradient(135deg,${C.accent},${C.accentDark})`, color: "#fff", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 16px ${C.accent}40`, whiteSpace: "nowrap" }}>
  Keep me informed
  </button>
  </form>
  <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>We'll only email you about rule changes and deadlines. Unsubscribe anytime. Your email and country are stored solely for this purpose and will not be shared with third parties.</div>
  </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ onReset, showReset, openGlossary }) {
  return (
  <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", height: 64, display: "flex", alignItems: "center", padding: "0 24px", position: "sticky", top: 0, zIndex: 10, gap: 10 }}>
  <button onClick={onReset} style={{ fontWeight: 900, fontSize: 20, color: C.primary, background: "none", border: "none", cursor: "pointer", letterSpacing: -0.5 }}><span style={{ color: C.accent }}>P</span>atty</button>
  <div style={{ flex: 1 }} />
  <button onClick={() => openGlossary(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.primary + "10", color: C.primary, border: `1px solid ${C.primary}20`, borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
  Glossary
  </button>
  {showReset && <button onClick={onReset} style={{ background: C.accent + "20", color: C.accentDark, border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>← Start Over</button>}
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
  <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "'Inter',-apple-system,sans-serif", display: "flex", flexDirection: "column" }}>
  <Nav onReset={reset} showReset={false} openGlossary={openG} /><Shared />
  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: mobile ? "40px 20px" : "48px 24px" }}>
  <div style={{ width: "100%", maxWidth: 640, textAlign: "center" }}>
  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.primary, color: "#fff", borderRadius: 4, padding: "6px 12px", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 20 }}>For US citizens abroad</div>
  <h1 style={{ fontSize: mobile ? 36 : 56, fontWeight: 700, color: C.primary, lineHeight: 1.1, letterSpacing: -1, marginBottom: 16 }}>Where can you invest?</h1>
  <p style={{ fontSize: mobile ? 18 : 20, color: C.accent, fontWeight: 600, marginBottom: 12 }}>Patty shows you exactly.</p>
  <p style={{ fontSize: 15, color: C.light, lineHeight: 1.5, maxWidth: 460, margin: "0 auto 28px" }}>Skip the tax traps. Find PFIC-safe investments in seconds.</p>
  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
  <button onClick={() => setPage("onboard")} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}>Find where I can invest</button>
  <button onClick={() => setPage("diagnostic")} style={{ background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}`, borderRadius: 8, padding: "14px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Check my portfolio</button>
  </div>
  {/* PFIC calculator — surface early so visitors immediately feel the cost */}
  <div style={{ marginBottom: 28 }}><PficCalculator /></div>
  <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr", gap: 12, textAlign: "left", marginBottom: 20 }}>
  {[{ title: "Why your HL account may not work", body: "Most UK ETFs are classified as tax traps (PFICs) by the IRS. Most UK advisors don't know this applies to US citizens.", tid: "pfic" }, { title: "Why you can't just buy VTI on HL", body: "UK regulations (PRIIPs) block retail brokers from selling US ETFs. HL limits US citizens to individual shares only.", tid: "priips" }, { title: "What actually works", body: "VTI and VXUS via Charles Schwab International — US-domiciled and HMRC-compliant. The one setup that satisfies both tax systems.", tid: "hmrc_reporting" }].map(c => (
  <div key={c.title} style={{ background: "#faf5ff", borderRadius: 8, padding: "14px 16px", border: "1px solid #e9d5ff" }}>
  <div style={{ fontWeight: 600, fontSize: 13, color: C.primary, marginBottom: 6 }}>{c.title}</div>
  <div style={{ fontSize: 12, color: C.light, lineHeight: 1.5, marginBottom: 8 }}>{c.body}</div>
  <button onClick={() => openG(c.tid)} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontWeight: 600, fontSize: 12, padding: 0 }}>Learn more</button>
  </div>
  ))}
  </div>
  <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
  <strong style={{ color: "#475569" }}>Important:</strong> Patty is an educational information service. It maps publicly available IRS and HMRC rules onto general product categories to help US citizens living abroad understand their options. <strong>Patty does not provide personalised financial, tax, or investment advice.</strong> Nothing on this site constitutes a personal recommendation to buy, sell, or hold any specific investment. The information shown describes general product characteristics — not suitability for your specific circumstances. You are solely responsible for your own investment decisions. Tax rules are complex and change frequently; while we endeavour to keep information current, Patty does not warrant the accuracy, completeness, or timeliness of any information presented and accepts no liability for losses or damages arising from reliance on this content. Always consult a US-qualified CPA or tax attorney before making any investment decisions. Patty is not registered with the U.S. Securities and Exchange Commission (SEC) as an investment adviser. Patty is not authorised or regulated by the Financial Conduct Authority (FCA) and does not carry out any regulated activities under the Financial Services and Markets Act 2000. By using this site, you acknowledge and accept these limitations.
  </div>
  </div>
  </div>
  <div style={{ background: C.primary, padding: "16px 32px" }}>
  <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: mobile ? 16 : 32 }}>
  {[{ l: "PFIC-Safe" }, { l: "HMRC Compliant" }, { l: "US-UK Treaty" }, { l: "Built-In Glossary" }].map(f => <div key={f.l} style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff" }}><span style={{ fontWeight: 500, fontSize: 13 }}>{f.l}</span></div>)}
  </div>
  </div>
  </div>
  );
  if (page === "diagnostic") return (
  <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',-apple-system,sans-serif" }}>
  <Nav onReset={reset} showReset={false} openGlossary={openG} /><Shared />
  <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 24px" }}>
  <div style={{ background: C.card, borderRadius: 16, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0" }}>
  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.warning + "20", color: "#92400e", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>PORTFOLIO PFIC CHECK — EDUCATIONAL</div>
  <DiagnosticFlow onFinish={() => setPage("onboard")} onBack={() => setPage("landing")} />
  </div>
  </div>
  </div>
  );
  if (page === "onboard") {
  const Comp = [StepLocation, StepAmount, StepBehaviour][step];
  const ok = STEPS[step].canProceed(profile);
  return (
  <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',-apple-system,sans-serif" }}>
  <Nav onReset={reset} showReset={false} openGlossary={openG} /><Shared />
  <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 24px" }}>
  <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
  {STEPS.map((s, i) => (
  <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
  <StepDot n={i + 1} active={step === i} done={step > i} />
  <span style={{ fontSize: 10, fontWeight: 700, color: step === i ? C.primary : C.muted }}>{s.label}</span>
  </div>
  {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: step > i ? C.accent : "#e2e8f0", margin: "0 8px", marginBottom: 16, transition: "background 0.3s" }} />}
  </div>
  ))}
  </div>
  <div style={{ opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(8px)", transition: "all 0.2s" }}>
  <div style={{ background: C.card, borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0" }}>
  <Comp data={profile} set={set} />
  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
  <button onClick={back} style={{ background: "#f1f5f9", color: C.text, border: "none", borderRadius: 10, padding: "12px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
  <button onClick={next} disabled={!ok} style={{ background: ok ? `linear-gradient(135deg,${C.accent},${C.accentDark})` : "#e2e8f0", color: ok ? "#fff" : C.muted, border: "none", borderRadius: 10, padding: "12px 26px", fontWeight: 700, fontSize: 14, cursor: ok ? "pointer" : "not-allowed" }}>
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
  <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',-apple-system,sans-serif" }}>
  <Nav onReset={reset} showReset={true} openGlossary={openG} /><Shared />
  <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>
  <Results profile={profile} showPfic={showPfic} setShowPfic={setShowPfic} openGlossary={openG} />
  </div>
  </div>
  );
}
