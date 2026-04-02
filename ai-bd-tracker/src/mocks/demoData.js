/** 
 * Static mock data and constants for the AI-BD Tracker.
 * Extracted from useStore.js to improve codebase clarity and enable toggling between Demo and Real modes.
 */

export const STAGES = [
  { id: 'Initial Contact', label: 'Initial Contact', color: 'bg-slate-400' },
  { id: 'CDA Signed', label: 'CDA Signed', color: 'bg-indigo-500' },
  { id: 'Due Diligence', label: 'DD', color: 'bg-orange-500' },
  { id: 'Term Sheet', label: 'Term Sheet', color: 'bg-blue-600' },
  { id: 'Negotiation', label: 'Negotiation', color: 'bg-blue-800' }
];

export const INITIAL_CATALYSTS = [
  { id: 1, competitor: 'Vertex Pharma', asset: 'VX-548 (Pain)', event: 'Phase III Top-line data release.', date: 'Oct 23', impact: 'High' },
  { id: 2, competitor: 'Merck & Co.', asset: 'Keytruda sBLA', event: 'FDA PDUFA Date: early-stage NSCLC.', date: 'Oct 25', impact: 'Medium' }
];

export const INITIAL_DYNAMICS = [
  { id: 1, type: 'email', title: 'Novartis Strategic Diligence', desc: 'Received Phase 1b interim results summary.', date: '2h ago' },
  { id: 2, type: 'call', title: 'Meeting: Pfizer Alliance', desc: 'Discussed ADC term sheet terms.', date: 'Yesterday' }
];
