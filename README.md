# GigShield — AI-Powered Parametric Income Protection for India's Gig Economy

> **GigShield eliminates the claim form entirely.**
> When a parametric threshold is crossed, a claim is initiated, fraud-checked, and paid out automatically — within 60 seconds. No worker action required. Ever.

**Guidewire DEVTrails 2026 | University Hackathon | Team Failures**

---

## ⚡ The Wow Moment — Watch This First

> It is raining heavily in Hyderabad. 11:47 PM.
>
> Raju, a Swiggy delivery partner, has been offline for 2 hours — no orders are coming.
> He doesn't open any app. He doesn't call anyone. He doesn't know what a claim form is.
>
> At 11:48 PM, OpenWeatherMap reports 52mm rainfall in Kukatpally zone — threshold crossed.
>
> **GigShield's parametric engine fires automatically.**
>
> In the next 60 seconds:
> - ✅ Zone match confirmed — Raju's registered area overlaps the disruption polygon
> - ✅ Activity window validated — he was online 2 hours before the trigger
> - ✅ Fraud engine runs 11 behavioral signals — score: 14/100 → Auto-approved
> - ✅ Razorpay payout API called — ₹200 dispatched to Raju's UPI wallet
> - ✅ SMS delivered: *"GigShield: ₹200 credited. Rain disruption detected. Stay safe."*
>
> **Raju never knew a claim happened. He just got paid.**
>
> This is not a demo feature. This is the entire product thesis.

---

## Table of Contents

1. [The Problem](#the-problem)
2. [Who We Built This For](#who-we-built-this-for)
3. [What is GigShield?](#what-is-gigshield)
4. [System Architecture](#system-architecture)
5. [Parametric Trigger Engine](#parametric-trigger-engine)
6. [Financial Model](#financial-model)
7. [AI/ML Pipeline](#aiml-pipeline)
8. [Fraud Detection — Behavioral Digital Twin](#fraud-detection--behavioral-digital-twin)
9. [Insurance Domain Design](#insurance-domain-design)
10. [Tech Stack](#tech-stack)
11. [API Reference](#api-reference)
12. [Database Schema](#database-schema)
13. [End-to-End Demo Flow](#end-to-end-demo-flow)
14. [Team](#team)

---

## The Problem

In India today, over **5 million food delivery partners** lose an estimated **20–30% of their monthly income** to disruptions entirely outside their control — extreme rain, heat, air pollution, curfews, or platform outages.

> *Source: NITI Aayog Report on Gig Economy, 2022 — India's platform economy employs 7.7M workers; food delivery is the largest segment.*

**When disruption hits, there is no safety net. No insurance product exists for them.**

Traditional insurance fails this segment on every dimension:

| Traditional Insurance | GigShield |
|---|---|
| Annual/monthly premiums | Weekly premiums (aligned to gig pay cycles) |
| Manual claim submission required | Zero manual action — fully automated |
| 7–30 day claim settlement | < 60 second payout |
| Insurance literacy required | Zero literacy required |
| Formal employment required | Platform-based gig work is sufficient |
| Fixed premium regardless of risk | AI-dynamic pricing per worker per zone |

No incumbent insurer has solved this. GigShield is purpose-built for the gap.

---

## Who We Built This For

> *Most insurance products are built for people who understand insurance.
> We built GigShield for people who have never heard the word "claim."*

### Meet Raju — Our Primary Persona

| Attribute | Detail |
|---|---|
| Age | 24 years old |
| Platform | Swiggy delivery partner, Hyderabad |
| Device | Redmi 9 — no laptop, no savings buffer |
| Weekly earnings | ₹4,200 (good week) · ₹2,800 (bad week) |
| Working hours | 10 hours/day, 6 days/week |
| Existing safety net | None |
| Insurance literacy | Zero |
| Bank access | UPI only — no credit, no debit card |

**What happens when it rains heavily?**
Zero orders. Zero income. Fixed expenses don't pause — rent, EMI, groceries.
He has no insurance. No employer. No fallback.
He doesn't file claims — he doesn't know what a claim is.
He just loses the day and moves on.

**What GigShield means for Raju:**
He pays ₹59/week — less than a single meal skip.
He never opens an app during a crisis.
When rain crosses 50mm, GigShield pays him automatically.
He gets an SMS. Money is in his UPI wallet.
**He didn't file anything. He didn't call anyone. It just worked.**

### Field Validation

> During ideation, we spoke informally with **6 active Swiggy and Zomato delivery partners** in Hyderabad.
> Every single one reported losing **at least 1–2 full working days per month** to rain or heat.
> None had any insurance. None had ever been offered any.
>
> One said: *"Baarish mein koi order nahi aata, lekin rent toh aata hai."*
> *(In rain, no orders come — but rent still does.)*

### Target Segment

| Attribute | Detail |
|---|---|
| Age group | 20–35 years |
| Weekly earnings | ₹3,000–₹6,000 |
| Working hours | 8–12 hours/day, 6–7 days/week |
| Device | Low to mid-range Android smartphone |
| Platforms | Zomato, Swiggy, Amazon Flex, Blinkit, Zepto |
| Cities (Phase 1) | Hyderabad, Bengaluru, Mumbai, Delhi NCR, Chennai |
| Existing safety net | None |

---

## What is GigShield?

GigShield is an AI-enabled **parametric income protection platform** built exclusively for platform-based gig workers in India.

**Parametric insurance** means payouts are triggered by measurable real-world events (rainfall > 50mm), not by manual claim submissions. No adjuster. No paperwork. No waiting period.

### What GigShield covers (strictly)

> **Coverage is limited to loss of income only due to external environmental disruptions.**

- ✅ Extreme rainfall (> 50mm/3hr) preventing delivery activity
- ✅ Extreme heat (> 42°C sustained) making outdoor work unsafe
- ✅ Hazardous AQI (> 300) forcing workers off the road
- ✅ Flooding / IMD Red Alert in registered operating zone
- ✅ Local curfew or Section 144 blocking movement

### Explicit exclusions (standard insurance domain — production-ready)

> These exclusions align GigShield with IRDAI compliance requirements and standard parametric insurance industry norms.

| Exclusion Category | Reason |
|---|---|
| **War / armed conflict** | Force majeure — standard global exclusion |
| **Pandemic / epidemic** | Systemic risk too large for parametric product (COVID lesson) |
| **Voluntary non-working days** | No disruption signal — worker choice |
| **Accidents / health events** | Separate product category (health/accident insurance) |
| **Vehicle breakdown** | Third-party product (motor insurance) |
| **Platform policy changes** | Commercial risk, not environmental disruption |
| **Intentional fraud** | Detected and excluded via fraud engine (see Section 8) |

These exclusions are not omissions — they are deliberate design choices. A parametric product that pays for everything is not a parametric product; it is an open-ended liability.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GigShield Platform                          │
│                                                                     │
│  ┌──────────────┐    ┌──────────────────────────────────────────┐   │
│  │  React PWA   │───▶│         Spring Boot Backend              │   │
│  │  (Vite)      │    │         Java 17 | Port 8080              │   │
│  │  Worker UI   │    │                                          │   │
│  │  Admin UI    │    │  ┌─────────────┐  ┌──────────────────┐   │   │
│  └──────────────┘    │  │ Auth Module │  │  Worker/Policy   │   │   │
│                      │  │ JWT/Spring  │  │  Claims/Payments │   │   │
│  ┌──────────────┐    │  │  Security   │  │  Admin Module    │   │   │
│  │ External     │    │  └─────────────┘  └──────────────────┘   │   │
│  │ Trigger APIs │    │                                          │   │
│  │              │    │  ┌──────────────────────────────────┐    │   │
│  │ OpenWeather  │───▶│  │    Parametric Trigger Engine     │    │   │
│  │ WAQI / OpenAQ│    │  │    Zone Mapper | Threshold Check │    │   │
│  │ IMD (mocked) │    │  └──────────────────────────────────┘    │   │
│  │ Govt (mocked)│    │                                          │   │
│  └──────────────┘    │  ┌──────────────────────────────────┐    │   │
│                      │  │   Python FastAPI ML Microservice  │    │   │
│  ┌──────────────┐    │  │   Port 8000                       │    │   │
│  │  PostgreSQL  │◀───│  │   XGBoost (Dynamic Pricing)       │    │   │
│  │  Database    │    │  │   Isolation Forest (Fraud)        │    │   │
│  └──────────────┘    │  └──────────────────────────────────┘    │   │
│                      │                                          │   │
│  ┌──────────────┐    │  ┌──────────────────────────────────┐    │   │
│  │  Razorpay    │◀───│  │    Payout Engine                  │    │   │
│  │  Sandbox     │    │  │    UPI / Bank Transfer            │    │   │
│  └──────────────┘    │  └──────────────────────────────────┘    │   │
│                      └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Design Decisions Worth Noting

**Why two separate services (Spring Boot + FastAPI)?**
The ML models (XGBoost, Isolation Forest) are Python-native. Running them in a separate FastAPI microservice lets the Java backend stay stateless and horizontally scalable, while the ML service can be retrained and redeployed independently. This is standard MLOps architecture.

**Why PostgreSQL over MySQL?**
ACID compliance for financial transactions. PostgreSQL's `NUMERIC`/`DECIMAL` types map cleanly to Java's `BigDecimal` — critical for insurance premium and payout amounts where floating point errors are unacceptable.

**Why parametric over traditional?**
Traditional insurance requires loss assessment. For a ₹200 claim, the assessment cost alone exceeds the payout. Parametric removes the adjuster entirely — the threshold IS the proof of loss.

---

## Parametric Trigger Engine

GigShield monitors five real-time parameters. When any threshold is crossed, the trigger engine evaluates zone overlap and initiates the claim pipeline automatically.

| Trigger | Threshold | Data Source | Status |
|---|---|---|---|
| Extreme Rainfall | > 50mm in 3 hours | OpenWeatherMap API | ✅ Live |
| Extreme Heat | > 42°C sustained 4+ hours | OpenWeatherMap API | ✅ Live |
| Severe Air Pollution | AQI > 300 (Hazardous) | AQICN / OpenAQ API | ✅ Live |
| Flooding / Waterlogging | IMD Red Alert issued | IMD Alert Feed | 🔄 Mocked |
| Local Curfew / Strike | Section 144 / general strike | Government alert feed | 🔄 Mocked |

### Zone Matching Logic

Triggers are evaluated at **zone level**, not city level. Each worker has a registered operating zone (e.g., "Kukatpally", "Banjara Hills"). The trigger engine:

1. Receives weather/AQI data for GPS coordinates
2. Maps coordinates to delivery zone polygon
3. Checks if worker's registered zone overlaps disruption area
4. Only workers in the affected zone at the time of trigger are eligible

This prevents a worker in South Hyderabad claiming for a flood in North Hyderabad.

### Trigger-to-Payout Timeline

```
T+0s    → OpenWeatherMap reports 52mm rainfall in zone polygon
T+1s    → Trigger engine detects threshold breach
T+2s    → Zone mapper identifies affected workers (batch query)
T+3s    → Claim records created in DB for each eligible worker
T+5s    → ML fraud engine scores each claim (FastAPI call)
T+10s   → Claims with score < 30 → auto-approved
T+15s   → Razorpay payout API called per approved claim
T+45s   → UPI transfer confirmed
T+60s   → SMS notification dispatched to worker
```

---

## Financial Model

### Weekly Premium Structure

Pricing is weekly — aligned to how gig workers earn and think about money. Not monthly. Not annual. Weekly.

| Plan | Weekly Premium | Weekly Coverage Cap | Daily Equivalent | Best For |
|---|---|---|---|---|
| Basic | ₹29 | ₹500 | ₹4.14/day | Part-time workers (< 4 days/week) |
| Standard | ₹59 | ₹1,200 | ₹8.43/day | Regular workers (5–6 days/week) |
| Pro | ₹99 | ₹2,000 | ₹14.14/day | Full-time workers (6–7 days/week) |

### Payout Calculation Formula

```
payout = min(
    (worker_daily_avg_income × disruption_hours / working_hours_per_day),
    plan_weekly_cap / disruption_events_this_week
)
```

**Example — Raju, Standard Plan:**
- Daily average income: ₹600
- Working hours per day: 10
- Disruption window: 4 hours (rain event)
- Payout = ₹600 × (4/10) = **₹240** → capped at ₹1,200/week plan limit
- Weekly premium paid: ₹59
- Net benefit to Raju this week: **₹181 positive**

### Dynamic Premium Adjustment (AI-Powered)

Base premiums are adjusted weekly per worker by the XGBoost pricing model:

| Factor | Effect on Premium |
|---|---|
| Monsoon season (Jun–Sep) | +30% seasonal multiplier |
| Summer heat season (Apr–May) | +15% seasonal multiplier |
| Flood-prone zone (score > 7/10) | +10–25% zone surcharge |
| High worker activity consistency | –5% loyalty discount |
| Recent claim history (> 3 claims/month) | +20% risk loading |
| New worker (< 30 days on platform) | Standard pricing, no discount yet |

**Example adjusted premium:**
- Base Standard plan: ₹59
- July monsoon multiplier: ×1.30 → ₹76.70
- Kukatpally flood zone surcharge (+15%): ₹76.70 × 1.15 → **₹88.21/week**

This is not a flat surcharge table — the XGBoost model calculates it as a continuous function of all inputs simultaneously.

### Unit Economics (Illustrative — Phase 3 Validation)

| Metric | Estimate | Basis |
|---|---|---|
| Monthly Active Workers (MAW) | 10,000 (pilot city) | Addressable market estimate |
| Avg. weekly premium | ₹65 | Blended Standard/Pro mix |
| Monthly premium revenue | ₹26,00,000 | 10,000 × ₹65 × 4 |
| Expected claim rate | 15–20% of workers/week | Based on disruption frequency |
| Avg. claim payout | ₹280 | Historical disruption window avg. |
| Monthly claims expense | ₹33,60,000 – ₹44,80,000 | 1,500–2,000 claims × ₹280 |
| Loss ratio target | 55–65% | Standard parametric insurance norm |

> ⚠️ These are illustrative estimates for academic/hackathon purposes. Production actuarial pricing requires licensed actuary review and IRDAI regulatory approval.

---

## AI/ML Pipeline

### Model 1 — Dynamic Premium Pricing (XGBoost Regression)

**Purpose:** Calculate a personalised weekly premium per worker.

**Input features:**

| Feature | Description | Type |
|---|---|---|
| `zone_disruption_freq_90d` | Disruption events in worker's zone, past 90 days | Numeric |
| `seasonal_risk_multiplier` | Monsoon=1.30, Summer=1.15, Winter=1.0 | Numeric |
| `forecast_risk_score_7d` | 7-day weather risk index (0–1) | Numeric |
| `worker_activity_consistency` | Active days / 30 | Numeric |
| `zone_waterlogging_index` | Flood vulnerability score (0–10) | Numeric |
| `worker_claim_history_30d` | Claims filed in past 30 days | Numeric |
| `plan_tier` | Basic=0 / Standard=1 / Pro=2 | Categorical |
| `city_tier` | Tier-1=0 / Tier-2=1 | Categorical |

**Output:** Adjusted weekly premium (₹)

**Why XGBoost:**
- Handles mixed numerical/categorical features natively
- Interpretable feature importance output — critical for explaining premium to workers
- Fast inference (< 5ms per prediction) — supports weekly batch recalculation for all workers
- Robust to missing features — some workers won't have full history initially

**Target performance (Phase 3):**
- Premium prediction RMSE < ₹8
- Feature importance tracked per zone per season
- A/B tested against flat pricing baseline

---

### Model 2 — Fraud Detection (Isolation Forest)

**Purpose:** Score every claim for fraud risk before any approval decision.

**Why Isolation Forest:**
Supervised fraud detection requires labeled fraud data — which does not exist for this segment (no one has built this product before). Isolation Forest is unsupervised: it learns the normal distribution of claim behavior and flags anomalies as potential fraud. It is the correct algorithm when labeled fraud examples are unavailable.

See full details in [Section 8 — Behavioral Digital Twin](#fraud-detection--behavioral-digital-twin).

---

## Fraud Detection — Behavioral Digital Twin

> The core innovation of GigShield's fraud engine is not the algorithm — it is the **Behavioral Digital Twin** model.

For each registered worker, GigShield maintains a continuous behavioral profile — a digital twin of their normal work patterns. Every claim is scored against this baseline. Deviations from normal behavior trigger elevated fraud scores.

### The 11 Behavioral Signals

| # | Signal | What it measures | Fraud indicator |
|---|---|---|---|
| 1 | **GPS Zone Consistency** | Worker coordinates vs disruption zone polygon at trigger time | Claiming from unaffected area |
| 2 | **Activity Window Validation** | Was worker logged in / active on platform before trigger? | Claiming without any prior activity |
| 3 | **Duplicate Claim Detection** | Multiple claims from same worker for same event window | Double-claiming a single disruption |
| 4 | **Claim Frequency Anomaly** | Claims per month vs worker's 90-day baseline | Sudden spike in claim rate |
| 5 | **Trigger Timing Alignment** | Time between trigger event and claim initiation | Retroactive claim manipulation |
| 6 | **Platform Login Signal** | Cross-reference Zomato/Swiggy login logs during trigger window | Claims without platform presence |
| 7 | **Delivery History Correlation** | Delivery volume drop during disruption vs claimed disruption | Mismatch between behavior and claim |
| 8 | **Zone Claim Density** | Number of workers claiming from same zone simultaneously | Abnormally low or high cluster claims |
| 9 | **Device Fingerprint Consistency** | Same device, location, and session pattern across claims | Account sharing or synthetic claims |
| 10 | **Payout Pattern Analysis** | Payout amount and frequency vs cohort baseline | Systematic over-claiming |
| 11 | **Behavioral Drift Score** | Delta between this claim's feature vector and worker's historical profile | General anomaly from normal behavior |

### Scoring Thresholds

| Fraud Score | Action | SLA |
|---|---|---|
| 0–29 | ✅ Auto-approved — Razorpay payout triggered immediately | < 60 seconds |
| 30–60 | 🟡 Soft review queue — Admin reviews within 24 hours | < 24 hours |
| 61–100 | 🔴 Escalated — Manual fraud investigation, claim held | No SLA — investigation required |

### Sample Fraud Engine API Response

```json
{
  "claim_id": "CLM-20240715-00847",
  "worker_id": "WRK-4829",
  "trigger_event": "EXTREME_RAINFALL",
  "trigger_zone": "Kukatpally",
  "fraud_score": 14,
  "decision": "AUTO_APPROVED",
  "signals_evaluated": [
    { "signal": "GPS_ZONE_CONSISTENCY", "score": 2, "status": "PASS" },
    { "signal": "ACTIVITY_WINDOW_VALIDATION", "score": 0, "status": "PASS" },
    { "signal": "DUPLICATE_CLAIM_DETECTION", "score": 0, "status": "PASS" },
    { "signal": "CLAIM_FREQUENCY_ANOMALY", "score": 5, "status": "ELEVATED" },
    { "signal": "PLATFORM_LOGIN_SIGNAL", "score": 3, "status": "PASS" },
    { "signal": "BEHAVIORAL_DRIFT_SCORE", "score": 4, "status": "PASS" }
  ],
  "payout_amount": 240.00,
  "payout_currency": "INR",
  "payout_initiated_at": "2024-07-15T23:49:02Z",
  "processing_time_ms": 847
}
```

---

## Insurance Domain Design

> This section demonstrates that GigShield is not just a technical system — it is a correctly designed insurance product.

### Policy Lifecycle

```
QUOTE → ACTIVE → SUSPENDED → EXPIRED
                    ↓
                CANCELLED (non-payment)
```

### Claim Lifecycle

```
INITIATED (trigger fires)
    ↓
FRAUD_CHECK (ML scoring)
    ↓
AUTO_APPROVED / SOFT_REVIEW / ESCALATED
    ↓
PAID / REJECTED / UNDER_INVESTIGATION
```

### Standard Insurance Exclusions (IRDAI-aligned)

GigShield explicitly excludes the following in policy terms — this is what separates a production-ready insurance product from a hackathon prototype:

```java
public enum ExclusionType {
    WAR,                    // Armed conflict — global standard exclusion
    PANDEMIC,               // Systemic risk exceeds parametric model capacity
    NATURAL_DISASTER,       // Earthquake, tsunami — beyond weather parametrics
    INTENTIONAL_FRAUD,      // Detected by fraud engine — auto-excluded
    GOVERNMENT_RESTRICTION, // Policy-driven shutdowns (distinct from curfew)
    VOLUNTARY_INACTIVITY,   // Worker chose not to work
    PRE_EXISTING_INELIGIBILITY // Worker not in active zone at policy start
}
```

**Why exclusions matter:** An insurance product without exclusions is not an insurance product — it is an open-ended financial liability. Defining exclusions demonstrates actuarial understanding, not legal caution.

### Regulatory Positioning

| Dimension | GigShield Position |
|---|---|
| IRDAI Category | Micro-insurance product (< ₹200/week premium) |
| Distribution model | Embedded insurance via platform (B2B2C) |
| Target regulation | IRDAI Sandbox regulatory framework (Innovation Sandbox) |
| KYC requirement | Aadhaar + PAN (AES-256 encrypted at rest) |
| Payout channel | UPI — instant, no bank account required |

---

## Tech Stack

### Backend

| Component | Technology | Version |
|---|---|---|
| Language | Java | 17 |
| Framework | Spring Boot | 3.x |
| Security | Spring Security + JWT | — |
| ORM | Spring Data JPA / Hibernate | — |
| Database | PostgreSQL | 15 |
| Encryption | AES-256/CBC via JPA AttributeConverter | — |
| Build | Maven | — |
| Utilities | Lombok | — |

### ML Microservice

| Component | Technology |
|---|---|
| Language | Python 3.11 |
| Framework | FastAPI |
| Dynamic Pricing | XGBoost |
| Fraud Detection | Isolation Forest (scikit-learn) |
| Serving | Uvicorn |

### Frontend

| Component | Technology |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| Design System | Custom "Neon Trust" palette — electric teal + warm amber |
| Type | Progressive Web App (PWA) |
| API Proxy | Vite dev proxy → localhost:8080 |

### External Integrations

| Service | Purpose | Status |
|---|---|---|
| OpenWeatherMap API | Rainfall, temperature triggers | ✅ Live |
| AQICN / OpenAQ API | AQI disruption triggers | ✅ Live |
| IMD Alert Feed | Flood / Red Alert triggers | 🔄 Mocked |
| Razorpay Sandbox | UPI payout processing | ✅ Integrated |
| Twilio / SMS gateway | Worker notifications | 🔄 Mocked |

---

## API Reference

All endpoints follow versioned REST conventions: `/api/v1/{resource}`

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, returns JWT |

### Workers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/workers` | ADMIN | Onboard worker with KYC |
| GET | `/api/v1/workers/{id}` | WORKER/ADMIN | Get worker profile |
| GET | `/api/v1/workers` | ADMIN | List all workers |
| PUT | `/api/v1/workers/{id}` | ADMIN | Update worker profile |

### Policies

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/policies` | ADMIN | Create policy for worker |
| GET | `/api/v1/policies/{id}` | WORKER/ADMIN | Get policy details |
| GET | `/api/v1/policies/worker/{workerId}` | WORKER/ADMIN | Worker's active policy |
| PUT | `/api/v1/policies/{id}/status` | ADMIN | Update policy status |

### Claims

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/claims/trigger` | SYSTEM | Parametric trigger fires claim |
| GET | `/api/v1/claims/{id}` | WORKER/ADMIN | Get claim details |
| GET | `/api/v1/claims/worker/{workerId}` | WORKER/ADMIN | Worker's claim history |
| PUT | `/api/v1/claims/{id}/review` | ADMIN | Manual review decision |

### Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/payments` | SYSTEM | Initiate payout |
| GET | `/api/v1/payments/{id}` | ADMIN | Payment details |
| GET | `/api/v1/payments/claim/{claimId}` | ADMIN | Payment for claim |

### ML Microservice (FastAPI — Port 8000)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/ml/fraud/score` | Score claim for fraud (returns 0–100) |
| POST | `/ml/pricing/calculate` | Calculate dynamic premium for worker |
| GET | `/ml/health` | Service health check |

---

## Database Schema

### Core Tables

```sql
-- Users (authentication only)
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,           -- BCrypt hashed
    role        VARCHAR(20) NOT NULL,             -- 'WORKER' or 'ADMIN'
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Workers (insurance profile, separate from auth)
CREATE TABLE workers (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id),  -- FK to auth user
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(15) NOT NULL,          -- Indian format
    platform        VARCHAR(50) NOT NULL,           -- ZOMATO/SWIGGY/etc.
    city            VARCHAR(100) NOT NULL,
    zone            VARCHAR(100) NOT NULL,          -- Operating zone
    aadhaar_number  TEXT,                           -- AES-256 encrypted
    pan_number      TEXT,                           -- AES-256 encrypted
    bank_account    TEXT,                           -- AES-256 encrypted
    upi_id          VARCHAR(255),
    kyc_status      VARCHAR(20) DEFAULT 'PENDING',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Policies
CREATE TABLE policies (
    id              BIGSERIAL PRIMARY KEY,
    worker_id       BIGINT REFERENCES workers(id),
    plan_type       VARCHAR(20) NOT NULL,          -- BASIC/STANDARD/PRO
    weekly_premium  NUMERIC(10,2) NOT NULL,        -- BigDecimal precision
    coverage_cap    NUMERIC(10,2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE/SUSPENDED/EXPIRED
    start_date      DATE NOT NULL,
    end_date        DATE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Claims
CREATE TABLE claims (
    id              BIGSERIAL PRIMARY KEY,
    worker_id       BIGINT REFERENCES workers(id),
    policy_id       BIGINT REFERENCES policies(id),
    trigger_type    VARCHAR(50) NOT NULL,          -- EXTREME_RAINFALL/etc.
    trigger_zone    VARCHAR(100) NOT NULL,
    claimed_amount  NUMERIC(10,2) NOT NULL,
    fraud_score     INTEGER,                       -- 0-100
    status          VARCHAR(30) DEFAULT 'INITIATED',
    initiated_at    TIMESTAMP DEFAULT NOW(),
    resolved_at     TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id              BIGSERIAL PRIMARY KEY,
    claim_id        BIGINT REFERENCES claims(id),
    worker_id       BIGINT REFERENCES workers(id),
    amount          NUMERIC(10,2) NOT NULL,
    payment_method  VARCHAR(50),                   -- UPI/BANK_TRANSFER
    razorpay_id     VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'PENDING', -- PENDING/SUCCESS/FAILED
    initiated_at    TIMESTAMP DEFAULT NOW(),
    completed_at    TIMESTAMP
);
```

### Design Principles

- **`User` ≠ `Worker`:** `User` handles auth/identity only. `Worker` handles insurance profile. Two separate tables, linked by FK. Worker creation looks up existing user by email — never creates a duplicate user.
- **`NUMERIC(10,2)` for all financial fields:** Never `DOUBLE` or `FLOAT`. Insurance amounts require exact decimal precision.
- **AES-256/CBC encryption:** Applied to `aadhaar_number`, `pan_number`, `bank_account` via JPA `AttributeConverter`. Encrypted at rest, decrypted only in service layer.

---

## End-to-End Demo Flow

> This is what we demo to judges. Reproducible from cold start in under 5 minutes.

### Setup

```bash
# 1. Clone
git clone https://github.com/thanmay0718/Gig-Sheild-AI
cd Gig-Sheild-AI

# 2. Start PostgreSQL (Docker)
docker run --name gigshield-db -e POSTGRES_PASSWORD=gigshield \
  -e POSTGRES_DB=gigshield -p 5432:5432 -d postgres:15

# 3. Start Spring Boot backend
./mvnw spring-boot:run

# 4. Start FastAPI ML service
cd ml-service && uvicorn main:app --port 8000

# 5. Start React frontend
cd frontend && npm install && npm run dev
```

### Demo Script — The 60-Second Payout

```bash
# Step 1: Register and login as admin
POST /api/v1/auth/register
{ "email": "admin@gigshield.in", "password": "admin123", "role": "ADMIN" }

# Step 2: Onboard worker Raju
POST /api/v1/workers
{ "fullName": "Raju K", "phone": "9876543210", "platform": "SWIGGY",
  "city": "Hyderabad", "zone": "Kukatpally", "planType": "STANDARD" }

# Step 3: Fire parametric trigger manually (simulates OpenWeatherMap breach)
POST /api/v1/claims/trigger
{ "triggerType": "EXTREME_RAINFALL", "zone": "Kukatpally",
  "rainfallMm": 52.3, "durationHours": 3.2 }

# Step 4: Watch auto-claim → fraud score → payout happen in real time
GET /api/v1/claims?zone=Kukatpally&status=AUTO_APPROVED
→ Shows Raju's claim: fraud_score=14, status=PAID, amount=₹240

# Step 5: Check payment record
GET /api/v1/payments/claim/{claimId}
→ razorpay_id populated, status=SUCCESS, completed_at=T+45s
```

### Pre-seeded Demo Data

The database is pre-seeded with:
- 5 workers across 3 Hyderabad zones (Kukatpally, Banjara Hills, Gachibowli)
- 2 existing claims (1 paid, 1 in soft review) to show full lifecycle
- 1 rejected claim (fraud score: 78) to show fraud detection
- Zone disruption history (90 days) for dynamic pricing to compute

---

## Team

**Team Thanmay | Guidewire DEVTrails 2026**

| Name | Role |
|---|---|
| **Tanmay Sri Vardhan (Bunny)** | Team Lead · Backend · Database Architecture |
| **Rakesh Reddy** | Backend Services · Integration |
| **Manikanta** | AI/ML · Python FastAPI · XGBoost · Isolation Forest |
| **Vinay** | Frontend · React PWA · UI/UX |
| **Rohit Sri Sai** | Integration · QA · Postman Testing |

**GitHub:** [https://github.com/thanmay0718/Gig-Sheild-AI](https://github.com/thanmay0718/Gig-Sheild-AI)

> *Note: Repository name contains a typo ("Sheild") — will be corrected to "GigShield" post-submission.*

---

## What Makes GigShield Different

> A 30-second pitch for any judge who skims to the bottom.

1. **Real problem, real users.** We talked to actual Zomato/Swiggy workers in Hyderabad before writing a single line of code. The ₹59/week premium is not a random number — it is 1% of a bad week's income.

2. **Correct insurance architecture.** Most teams build claim-processing apps. We built a parametric insurance product — with exclusions, policy lifecycle, fraud thresholds, and actuarial-informed premium structure.

3. **Behavioral Digital Twin is genuinely novel.** Evaluating 11 simultaneous behavioral signals to construct a per-worker fraud baseline is not a standard hackathon fraud detection pattern. It addresses a real gap: no labeled fraud data exists for this market segment.

4. **The 60-second payout is not a demo trick.** It is the product. The entire architecture — parametric triggers, ML fraud scoring, Razorpay integration — exists to deliver that moment. For Raju, who doesn't know what insurance is, that moment is the product.

5. **Production-aware from Day 1.** AES-256 KYC encryption. `BigDecimal` for all financial amounts. Versioned REST APIs. IRDAI exclusion categories. JWT auth with role-based access. These are not polish — they are the baseline for a financial product.

---

*Built in Hyderabad. For Hyderabad. For the 5 million Rajus who just want one less thing to worry about.*
