# System Architecture - AI-Powered RFP Management System

## Technology Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Validation**: Zod
- **AI Provider**: OpenAI GPT-4
- **Email**: Nodemailer (SMTP) + node-imap (receiving)

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **UI Components**: Headless UI + custom components

### Development Tools
- **Package Manager**: npm
- **Type Checking**: TypeScript 5+
- **Linting**: ESLint
- **Formatting**: Prettier

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                    │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐   │
│  │ RFP Create │  │  Vendor    │  │  Proposal Comparison │   │
│  │   (Chat)   │  │ Management │  │    (AI Recommend)    │   │
│  └────────────┘  └────────────┘  └──────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API
┌────────────────────────────┼───────────────────────────────┐
│                    Backend (Express.js)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API Routes + Controllers               │   │
│  └────────────┬────────────────────────────┬───────────┘   │
│               │                            │               │
│  ┌────────────▼──────────┐    ┌────────────▼──────────┐    │
│  │   Business Services   │    │    AI Service Layer   │    │
│  │  - RFP Service        │    │  - RFP Parser         │    │
│  │  - Vendor Service     │    │  - Response Parser    │    │
│  │  - Proposal Service   │◄───┤  - Comparison Engine  │    │
│  │  - Email Service      │    │                       │    │
│  └────────────┬──────────┘    └────────────┬──────────┘    │
│               │                            │               │
│  ┌────────────▼─────────┐      ┌───────────▼──────────┐    │
│  │  Database (Prisma)   │      │   OpenAI GPT-4 API   │    │
│  │    PostgreSQL        │      │                      │    │
│  └──────────────────────┘      └──────────────────────┘    │
│               │                                            │
│  ┌────────────▼──────────┐                                 │
│  │   Email Integration   │                                 │
│  │  - SMTP (Nodemailer)  │                                 │
│  │  - IMAP (node-imap)   │                                 │
│  └───────────────────────┘                                 │
└────────────────────────────────────────────────────────────┘
```

## Database Schema Design

### Tables

#### **rfps**
```sql
id              UUID PRIMARY KEY
title           VARCHAR(255) NOT NULL
description     TEXT
items           JSONB NOT NULL          -- [{name, quantity, specifications}]
budget          DECIMAL(12,2)
delivery_deadline DATE
payment_terms   VARCHAR(100)
warranty_requirements VARCHAR(255)
other_requirements TEXT
status          ENUM('draft', 'sent', 'closed')
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

#### **vendors**
```sql
id              UUID PRIMARY KEY
name            VARCHAR(255) NOT NULL
email           VARCHAR(255) UNIQUE NOT NULL
contact_person  VARCHAR(255)
phone           VARCHAR(50)
address         TEXT
category        VARCHAR(100)
notes           TEXT
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

#### **proposals**
```sql
id              UUID PRIMARY KEY
rfp_id          UUID REFERENCES rfps(id) ON DELETE CASCADE
vendor_id       UUID REFERENCES vendors(id) ON DELETE CASCADE
items_pricing   JSONB                    -- [{item, unitPrice, quantity, total}]
total_price     DECIMAL(12,2)
delivery_time   VARCHAR(100)
payment_terms   VARCHAR(100)
warranty        VARCHAR(255)
additional_notes TEXT
raw_email_content TEXT
parsed_at       TIMESTAMP
status          ENUM('received', 'parsed', 'reviewed')
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()

UNIQUE(rfp_id, vendor_id)
```

#### **rfp_vendors** (junction table)
```sql
id              UUID PRIMARY KEY
rfp_id          UUID REFERENCES rfps(id) ON DELETE CASCADE
vendor_id       UUID REFERENCES vendors(id) ON DELETE CASCADE
sent_at         TIMESTAMP
email_status    VARCHAR(50)              -- 'pending', 'sent', 'failed'
created_at      TIMESTAMP DEFAULT NOW()

UNIQUE(rfp_id, vendor_id)
```

## API Design

### RFP Endpoints

**POST /api/rfps**
- Create RFP from natural language
- Request: `{ naturalLanguageInput: string }`
- Response: Structured RFP object

**GET /api/rfps**
- List all RFPs
- Query params: `?status=sent&limit=10&offset=0`
- Response: `{ rfps: RFP[], total: number }`

**GET /api/rfps/:id**
- Get single RFP details
- Response: RFP with related vendors and proposals

**POST /api/rfps/:id/send**
- Send RFP to selected vendors
- Request: `{ vendorIds: string[] }`
- Response: `{ sent: number, failed: string[] }`

### Vendor Endpoints

**POST /api/vendors**
- Create vendor
- Request: `{ name, email, contactPerson?, phone?, address?, category? }`

**GET /api/vendors**
- List all vendors
- Query params: `?category=electronics&search=dell`

**GET /api/vendors/:id**
- Get vendor details

**PUT /api/vendors/:id**
- Update vendor

**DELETE /api/vendors/:id**
- Delete vendor

### Proposal Endpoints

**GET /api/rfps/:rfpId/proposals**
- Get all proposals for an RFP
- Response: Array of proposals with vendor details

**GET /api/proposals/:id**
- Get single proposal details

**POST /api/proposals/parse**
- Manually trigger email parsing
- Request: `{ emailId: string }`

**GET /api/rfps/:rfpId/comparison**
- Get AI-powered comparison of proposals
- Response: `{ proposals: [], comparison: {}, recommendation: {} }`

### Email Endpoints

**POST /api/emails/check**
- Manually trigger email check (for demo)
- Response: `{ newEmails: number, parsed: number }`

## AI Integration Strategy

### 1. RFP Creation (Natural Language → Structured Data)

**Prompt Strategy:**
```
System: You are an RFP parser. Extract structured data from natural language.
User: [natural language input]
Response Format: JSON with strict schema
```

**Extraction Fields:**
- Items (name, quantity, specifications)
- Budget
- Delivery deadline
- Payment terms
- Warranty requirements
- Other requirements

### 2. Vendor Response Parsing

**Multi-step Approach:**
1. Extract email sections (pricing table, terms, notes)
2. Parse line-item pricing
3. Extract delivery and payment information
4. Identify warranty details
5. Capture additional notes/conditions

**Handling Attachments:**
- PDF: Extract text, parse tables
- Excel: Read directly, map columns
- Images: OCR if needed (optional)

### 3. Proposal Comparison & Recommendation

**Scoring Criteria:**
```typescript
{
  priceScore: 0-100,        // Weight: 40%
  deliveryScore: 0-100,     // Weight: 25%
  termsScore: 0-100,        // Weight: 20%
  completenessScore: 0-100  // Weight: 15%
}
```

**AI Tasks:**
- Calculate weighted scores
- Generate comparison summary
- Provide recommendation with reasoning
- Highlight risks/concerns

## Email Integration Design

### Outbound (SMTP)

**Configuration:**
- Use Gmail SMTP or SendGrid
- Template system for RFP emails
- Track send status in database

**Email Template:**
```
Subject: RFP: [Title] - [Your Company]
Body:
  - Introduction
  - RFP Details (formatted table)
  - Items with specifications
  - Requirements (budget, deadline, terms)
  - Response instructions
  - Contact information
```

### Inbound (IMAP)

**Polling Strategy:**
- Check inbox every 60 seconds
- Filter by subject line matching RFP IDs
- Mark processed emails as read
- Store raw email for debugging

**Processing Pipeline:**
1. Detect new emails
2. Match to RFP (subject line parsing)
3. Extract email body + attachments
4. Send to AI for parsing
5. Create/update proposal record
6. Mark email as processed

## Security Considerations

1. **Input Validation**: Zod schemas on all endpoints
2. **SQL Injection**: Prisma ORM prevents this
3. **Email Security**: Validate sender domains
4. **API Rate Limiting**: Prevent AI API abuse
5. **Environment Variables**: Never commit secrets
6. **Error Handling**: Don't expose sensitive info

## Error Handling Strategy

```typescript
// Standardized error response
{
  error: string,           // User-friendly message
  code: string,            // Error code (VALIDATION_ERROR, AI_ERROR, etc.)
  details?: any,           // Additional context
  timestamp: string
}
```

**Error Categories:**
- Validation errors (400)
- AI service errors (503)
- Email errors (500)
- Database errors (500)
- Not found errors (404)

## Assumptions & Limitations

### Assumptions
1. Single procurement manager user (no auth needed)
2. Vendors respond via email to a monitored inbox
3. Email responses are in English
4. Budget is in USD
5. All dates are in ISO format

### Known Limitations
1. No real-time email updates (polling-based)
2. Limited attachment support (text extraction only)
3. AI parsing may not be 100% accurate
4. No concurrent RFP editing support
5. Basic email template (no rich HTML)

## Future Enhancements
- Multi-user support with authentication
- Real-time WebSocket updates
- Advanced attachment parsing (OCR, complex PDFs)
- Email template customization
- Historical analytics and reporting
- Vendor performance tracking
- Contract generation
