"use strict";
/**
 * BookLeaf Knowledge Base - used for context injection in AI prompts.
 * Each section is keyed for lightweight retrieval (only relevant chunks injected).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveRelevantContext = exports.knowledgeBase = void 0;
exports.knowledgeBase = {
    royalty: {
        keywords: ['royalt', 'payment', 'paid', 'money', 'earning', 'payout', 'income', 'revenue', 'quarter', 'bank transfer', 'threshold'],
        context: `
ROYALTY POLICY:
- BookLeaf operates on an 80/20 royalty split — 80% to the author, 20% to BookLeaf.
- Royalties are calculated quarterly (Jan–Mar, Apr–Jun, Jul–Sep, Oct–Dec).
- Payments are processed within 45 days after the quarter ends.
- Minimum payout threshold is ₹1,000. Amounts below this roll over to the next quarter.
- All payouts are made via direct bank transfer to the author's registered account.
- Authors can view their earnings breakdown (earned, paid, pending) in their Author Portal.
    `.trim(),
    },
    isbn: {
        keywords: ['isbn', 'metadata', 'barcode', 'book number', 'identifier', 'catalogue', 'catalog'],
        context: `
ISBN & METADATA POLICY:
- Every book published through BookLeaf receives a unique ISBN assigned by our production team.
- ISBN errors are treated as HIGH PRIORITY and escalated to the production team immediately.
- Corrections are typically completed within 48 business hours.
- If an incorrect ISBN is visible on Amazon or Flipkart, BookLeaf coordinates with the platform to update it.
- Authors are notified via email and portal message once the correction is live.
    `.trim(),
    },
    printing: {
        keywords: ['print', 'quality', 'defect', 'damage', 'reprint', 'copy', 'copies', 'physical', 'book quality', 'page'],
        context: `
PRINTING POLICY:
- Standard print turnaround is 5–7 business days after final approval.
- Defective or damaged copies qualify for a free reprint after verification.
- Authors must report defective copies within 30 days of delivery with photo evidence.
- Our quality team reviews all reprint requests within 48 hours.
    `.trim(),
    },
    distribution: {
        keywords: ['amazon', 'flipkart', 'distribution', 'listing', 'available', 'stock', 'out of stock', 'platform', 'online', 'marketplace', 'sold'],
        context: `
DISTRIBUTION POLICY:
- BookLeaf distributes to: Amazon India, Flipkart, Amazon US, Amazon UK.
- New listings go live within 7–10 business days after printing is complete.
- Stock sync issues (e.g., "out of stock" when stock is available) are resolved within 24–48 hours.
- Authors should report distribution issues with the book title and ISBN for faster resolution.
    `.trim(),
    },
    production: {
        keywords: ['status', 'stage', 'editing', 'cover', 'design', 'typeset', 'proofread', 'production', 'manuscript', 'publish', 'timeline', 'when will', 'how long'],
        context: `
PRODUCTION STAGES:
1. Manuscript Received → 2. Editing → 3. Cover Design → 4. Typesetting → 5. Proofreading
→ 6. ISBN Assignment → 7. Printing → 8. Distribution Setup → 9. Published & Live

Authors can track their book's current stage in the Author Portal under "My Books".
Typical full production timeline is 4–8 weeks depending on manuscript length and revision rounds.
    `.trim(),
    },
    general: {
        keywords: ['help', 'support', 'contact', 'issue', 'problem', 'complaint', 'feedback', 'question'],
        context: `
GENERAL SUPPORT:
- BookLeaf support operates Monday–Saturday, 9 AM–6 PM IST.
- Response to queries is typically within 1 business day.
- For urgent issues, authors can mark their ticket as high priority.
- Authors can view all their tickets and responses in real-time in the Author Portal.
    `.trim(),
    },
};
/**
 * Lightweight retrieval: returns only the relevant knowledge sections
 * based on keyword matching in the ticket subject + description.
 */
const retrieveRelevantContext = (text) => {
    const normalizedText = text.toLowerCase();
    const matchedSections = [];
    for (const [, section] of Object.entries(exports.knowledgeBase)) {
        const hasMatch = section.keywords.some((kw) => normalizedText.includes(kw));
        if (hasMatch) {
            matchedSections.push(section.context);
        }
    }
    // Always add general context if nothing matched
    if (matchedSections.length === 0) {
        matchedSections.push(exports.knowledgeBase.general.context);
    }
    return matchedSections.join('\n\n---\n\n');
};
exports.retrieveRelevantContext = retrieveRelevantContext;
//# sourceMappingURL=knowledgeBase.js.map