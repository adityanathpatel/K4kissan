# K4kissan — AI-Powered Smart Agricultural Marketplace

**Khet se Bazaar tak** 🌾

Smart India Hackathon 2026 | Problem Statement ID: **SIH26033** | Theme: Agriculture, FoodTech & Rural Development | Category: Software
Team: **VAJRA**

---

## 📌 Problem Statement

> Multiple intermediaries reduce farmers' earnings and increase consumer prices.

Farmers today face:
- Heavy dependence on middlemen for selling produce
- Difficulty finding verified bulk buyers
- Inability to fulfil large orders individually
- High transportation and logistics costs
- Lack of timely demand and price information
- Limited bargaining power

## 💡 Our Solution

K4kissan is an AI-powered marketplace that connects farmers/FPOs directly with bulk buyers, eliminating unnecessary intermediaries while ensuring trust, transparency, and fair pricing.

Key features:
- Direct Farmer/FPO → Bulk Buyer connection
- Collective selling for large orders (with individual farmer accountability)
- AI-based demand forecasting
- Transparent price and demand insights
- Integrated transporter and logistics support (route optimization + live GPS tracking)
- Secure escrow-based digital transactions
- Quality verification and dispute resolution
- Batch-level traceability and quality accountability

## 🎯 Problems We Solve

| Problem | Our Fix |
|---|---|
| Too many intermediaries | Direct farmer–buyer connection |
| Price opacity | AI-driven price & demand intelligence |
| High logistics cost | Shared, route-optimized transport |
| Payment & quality risk | Escrow payments + quality verification |
| Lack of market insights | AI demand forecasting & data insights |

## 🏗️ System Architecture

1. Role-based login with authentication (Farmer / Buyer / Transporter)
2. Farmer KYC & ID verification (first-time onboarding)
3. Farmers list products; buyers post requirements
4. AI-based quality/data analysis and demand forecasting
5. Negotiation / counter-offer and price updation
6. 20% advance payment → transporter matching & booking
7. QR/OTP-based pickup verification with live GPS tracking
8. Delivery → quality & quantity verification
9. Dispute resolution (if needed) → payment released
10. Transaction history, ratings, and AI learning from past transactions

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Tailwind CSS, Flutter |
| Backend | Node.js, Express.js (REST API) |
| Database | MongoDB, Redis |
| Auth & Security | JWT |
| AI/ML | Scikit-learn, n8n |

## ✅ Feasibility & Viability

**Technical**
- Built on proven web, mobile, AI, and database tools
- Demand forecasts use available farm and market data

**Operational**
- Farmers/FPOs list crops, price, and verified field location
- Buyers confirm listings via phone/WhatsApp, then visit the field
- Small pilot region supports practical testing

**Financial**
- Open-source tools reduce initial development cost
- Payments leverage existing UPI infrastructure

**Core Risks & Mitigations**
- *Trust & verification* → Verified ID, mobile number, and Google Maps field location; buyers can inspect crops on-site
- *Digital access* → Local-language voice navigation with icon-led screens for low-literacy users
- *Payment & price risk* → Physical crop verification (primary) or 20% advance payment (secondary)
- *Quality & quantity assurance* → AI photo grading, pickup certification, refund protection, FPO aggregation for consistent bulk lots

## 🌟 Impact & Benefits

**Empowering Farmers**
- Direct access to multiple buyers
- Digital transaction records
- Secure & timely payments
- Better price negotiation
- Reduced crop loss
- AI guidance

**Empowering Buyers**
- Competitive bidding for top deals
- Digital history for easy reordering
- Live tracking & quality assurance
- Verified farmers & fresh crops
- AI-based quality/quantity matching
- No middlemen → cheaper crops

**AI-Driven Impact**
- Fair price indicator
- Shelf-life prediction
- Demand forecasting
- Smart farmer-buyer matching
- Fraud & anomaly detection
- Personalized alerts & suggestions

**Supply Chain Flow**
`Harvest → Quality Check → AI Match & Bid → Transport → Delivery & Verify → Payment Released`

## 📚 Research & References

**Key Research Areas**
- Bhulekh-Khatauni / Land Records — farmer/land record verification
- e-NAM (National Agriculture Market) — market research, pricing, buyer-seller connectivity
- ICAR (Indian Council of Agriculture Research) — crop info, farming practices, post-harvest management

**Technical Documentation**
- MDN Web Docs — HTML, CSS, JavaScript basics
- Google Firebase Documentation — Authentication, Database
- MDN Docs — Speech Synthesis API

## 👥 Team

**Team Name:** VAJRA
**Problem Statement:** SIH26033

---

*Submitted for Smart India Hackathon 2026*
