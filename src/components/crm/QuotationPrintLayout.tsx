'use client';

import React from 'react';
import { QuotationLineItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  items: QuotationLineItem[];
  projectName: string;
  projectLocation: string;
  clientName: string;
  quotationNumber: string;
  quotationDate: string;
}

export const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  'Below Counter': 'Made of BWP Plywood provided with ample space for storage. Color options available for the ACRYLIC used outside, inside linear fabric laminate. Hardware fittings: EBCO',
  'Over Head': 'Made of BWP Plywood provided with ample space for storage. Color options available for the ACRYLIC used, linear fabric laminate inside. Hardware fittings: EBCO',
  'Kitchen Loft': 'Made of BWP Plywood provided with ample space for storage. Color options available for the ACRYLIC used, linear fabric laminate inside. Hardware fittings: EBCO',
  'Tandem Box': 'Tandem boxes included in kitchen accessories.',
  'Wardrobe': 'Wardrobe made with solid Plywood core finished with laminate. Multiple storage options provided. Color options available. Easy to maintain plywood laminate. Hardware fittings: EBCO',
  'Wardrobe Loft': 'Wardrobe Loft made with solid Plywood core finished with laminate. Hardware fittings: EBCO',
  'TV Unit': 'Made with solid Plywood core finished with laminate. Multiple storage options provided. Color options available. Easy to maintain. Hardware fittings: EBCO',
  'Shoe Rack': 'Made with solid Plywood core finished with laminate. Multiple storage options provided. Color options available. Easy to maintain. Hardware fittings: EBCO',
  'Dressing Table': 'Made with solid Plywood core finished with laminate. Color options available. Hardware fittings: EBCO',
  'Dining Cabinet': 'Made with solid Plywood core finished with laminate. Multiple storage options provided. Hardware fittings: EBCO',
  'Wood Paneling': 'Wood paneling work as per design specifications.',
  'POP': 'POP (Plaster of Paris) false ceiling and cornice work as per design.',
  'Bed - With Storage': 'Bed frame with built-in storage made of solid Plywood finished with laminate. Hardware fittings: EBCO',
  'Bed - Without Storage': 'Bed frame without storage made of solid Plywood finished with laminate.',
  'Bed - Side Drawer 1': 'Side table/drawer unit made of solid Plywood finished with laminate. Hardware fittings: EBCO',
  'Bed - Side Drawer 2': 'Side table/drawer unit made of solid Plywood finished with laminate. Hardware fittings: EBCO',
  'Study': 'Study table unit made of solid Plywood finished with laminate. Hardware fittings: EBCO',
  'Sitting': 'Sitting area unit/bench made of solid Plywood finished with laminate.',
};

function formatINR(val: number): string {
  return val.toLocaleString('en-IN');
}

const QuotationPrintLayout = React.forwardRef<HTMLDivElement, Props>(
  ({ items, projectName, projectLocation, clientName, quotationNumber, quotationDate }, ref) => {
    
    // Group items by floor and category
    const groupedItems: { groupKey: string; floor: string; category: string; subItems: QuotationLineItem[] }[] = [];
    const groupOrder: string[] = [];
    items.forEach(item => {
      const key = `${item.floor} - ${item.category}`;
      if (!groupOrder.includes(key)) {
        groupOrder.push(key);
        groupedItems.push({ groupKey: key, floor: item.floor, category: item.category, subItems: [] });
      }
      groupedItems.find(g => g.groupKey === key)!.subItems.push(item);
    });

    const grandTotal = items.reduce((s, i) => s + i.totalAmount, 0);
    const formattedDate = new Date(quotationDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
      <div ref={ref} className="quotation-print-root">
        <style>{`
          .quotation-print-root { font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; padding: 2px 4px; max-width: 210mm; margin: 0 auto; font-size: 13px; line-height: 1.45; }
          .quotation-print-root * { box-sizing: border-box; }
          .q-header { border-bottom: 3px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
          .q-header img { width: 100%; height: auto; display: block; }
          .q-meta { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 12.5px; }
          .q-meta-left div, .q-meta-right div { margin-bottom: 2px; }
          .q-meta-label { font-weight: bold; color: #1a2332; }
          .q-intro { background: #f8f6f0; border-left: 4px solid #C9A84C; padding: 8px 12px; margin-bottom: 16px; font-size: 12px; color: #333; }
          .q-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          .q-table tr { page-break-inside: avoid; }
          .q-table th { background: #1a2332; color: #C9A84C; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 8px 8px; text-align: left; border: 1px solid #1a2332; }
          .q-table th:nth-child(3), .q-table th:nth-child(4), .q-table th:nth-child(5) { text-align: right; }
          .q-table td { padding: 7px 8px; border: 1px solid #ddd; vertical-align: top; font-size: 12px; }
          .q-table td:nth-child(3), .q-table td:nth-child(4), .q-table td:nth-child(5) { text-align: right; white-space: nowrap; }
          .q-cat-row td { background: #f0ede4; font-weight: 800; font-size: 13px; color: #1a2332; padding: 7px 8px; }
          .q-sub-desc { font-size: 11px; color: #555; margin-top: 3px; line-height: 1.35; }
          .q-sub-title { font-weight: 700; color: #1a2332; }
          .q-total-row td { background: #1a2332; color: #C9A84C; font-weight: 800; font-size: 13.5px; padding: 8px 8px; border: 1px solid #1a2332; }
          .q-payment-section { margin-top: 16px; page-break-inside: avoid; }
          .q-payment-section h3 { font-size: 13px; font-weight: 800; color: #1a2332; border-bottom: 2px solid #C9A84C; padding-bottom: 4px; margin-bottom: 8px; }
          .q-pay-table { width: 100%; border-collapse: collapse; }
          .q-pay-table td { padding: 5px 8px; border: 1px solid #ddd; font-size: 11.5px; }
          .q-pay-table tr:last-child td { background: #1a2332; color: #C9A84C; font-weight: 800; }
          .q-note { margin-top: 14px; padding: 8px 12px; background: #fef9e7; border: 1px solid #f0d77b; border-radius: 4px; font-size: 11px; color: #665a1e; }
          .q-footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #ccc; text-align: center; font-size: 11px; color: #333; line-height: 1.4; font-weight: 600; page-break-inside: avoid; }
          @media print { 
            @page { margin: 8mm 10mm; size: A4; } 
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .quotation-print-root { padding: 0; max-width: none; }
          }
        `}</style>

        {/* Header */}
        <div className="q-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uploads/Screenshot 2026-06-25 115332.png" alt="Pentahouse Header" />
        </div>

        {/* Meta Info */}
        <div className="q-meta">
          <div className="q-meta-left">
            <div><span className="q-meta-label">Client:</span> {clientName}</div>
            <div><span className="q-meta-label">Project:</span> {projectName}</div>
            {projectLocation && <div><span className="q-meta-label">Location:</span> {projectLocation}</div>}
          </div>
          <div className="q-meta-right" style={{ textAlign: 'right' }}>
            <div><span className="q-meta-label">Date:</span> {formattedDate}</div>
            {quotationNumber && <div><span className="q-meta-label">Quote No:</span> {quotationNumber}</div>}
          </div>
        </div>

        {/* Introduction */}
        <div className="q-intro">
          Dear <strong>{clientName}</strong>, Thank you for giving us an opportunity at Pentahouse Interiors to help you build your dream home. Our best quotation for your requirements is mentioned below.
        </div>

        {/* Quotation Table */}
        <table className="q-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Sl. No</th>
              <th>Description</th>
              <th style={{ width: '120px' }}>Area</th>
              <th style={{ width: '90px' }}>Cost</th>
              <th style={{ width: '110px' }}>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {groupedItems.map((group, gi) => (
              <React.Fragment key={group.groupKey}>
                <tr className="q-cat-row">
                  <td>{gi + 1}</td>
                  <td colSpan={4}>{group.groupKey.toUpperCase()}</td>
                </tr>
                {group.subItems.map((item, si) => {
                  const desc = item.notes || '';
                  const m = item.measurement || '';
                  let areaDisplay = `[ x = ${item.area.toFixed(2)} ] Sqft`;
                  if (m) {
                    const parts = m.toLowerCase().split('x');
                    const w = parts[0]?.trim() || '';
                    const h = parts[1]?.trim() || '';
                    areaDisplay = `[ ${w} x ${h} = ${item.area.toFixed(2)} ] Sqft`;
                  }
                  return (
                    <tr key={si}>
                      <td style={{ textAlign: 'center', color: '#888' }}>{String.fromCharCode(97 + si)}.</td>
                      <td>
                        <span className="q-sub-title">{item.subCategory || item.category}</span>
                        {desc && <div className="q-sub-desc">{desc}</div>}
                      </td>
                      <td>{areaDisplay}</td>
                      <td>₹{formatINR(item.costPerSqft)}/-</td>
                      <td>₹{formatINR(item.totalAmount)}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
            <tr className="q-total-row">
              <td colSpan={4} style={{ textAlign: 'right' }}>TOTAL</td>
              <td>Rs {formatINR(grandTotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* Note */}
        <div className="q-note">
          <strong>Note:</strong> The plywood used comes with a 15-year warranty.
        </div>

        {/* Payment Terms */}
        <div className="q-payment-section">
          <h3>Payment Method</h3>
          <table className="q-pay-table">
            <tbody>
              <tr><td>Start with Workorder Sign in the Project</td><td style={{ textAlign: 'right', width: '80px' }}>50%</td></tr>
              <tr><td>Once Material Reach to Site on Installation</td><td style={{ textAlign: 'right' }}>20%</td></tr>
              <tr><td>Hardware Installation Time</td><td style={{ textAlign: 'right' }}>15%</td></tr>
              <tr><td>After Total Completion of the Project Final</td><td style={{ textAlign: 'right' }}>15%</td></tr>
              <tr><td>Grand Total Percentage</td><td style={{ textAlign: 'right' }}>100%</td></tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="q-footer">
          Jagan Arcade, 4th Floor, 1st main Road, Post, Anandanagar,<br />
          RT Nagar, Bengaluru, Karnataka 560032
        </div>
      </div>
    );
  }
);

QuotationPrintLayout.displayName = 'QuotationPrintLayout';
export default QuotationPrintLayout;
