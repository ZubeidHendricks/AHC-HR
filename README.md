# AHC - HR Management Platform

> **AI-Powered Human Resources Management Platform**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-green.svg)](https://expressjs.com/)

## Overview

AHC is a comprehensive, multi-tenant HR management platform built for the South African market. It combines AI-powered analytics with practical HR workflows across the full employee lifecycle.

---

## Platform Menu Structure

### INTELLIGENCE
- **HRM-GPT** - AI-powered workforce intelligence and insights
- **Executive Dashboard** - High-level metrics and visualizations
- **Reports** - AI-generated recommendations and analytics
- **WhatsApp Monitor** - Employee communication tracking

### HR MANAGEMENT
- **KPI's** - KPI Templates, Review Cycles, Assignments, Reviews
- **OKR's** - Objectives Templates, Key Results Templates, Review Cycles, Assignments, Reviews
- **Leave** - Application, Approval, Payroll Sync
- **Claims** - Submission, Approval, Payroll Sync
- **Pulse Survey** - Net Promoter Score, Well-being Check, Relationship Check, Open-ended Feedback, Assessments, Recommendations
- **Compliance** - Legislation, Administration
- **Time & Attendance** - External integration
- **LMS** - Learning Management System

### SETUP
- **KPI Setup** - Configure KPI categories, measurement types, and scoring
- **Leave Setup** - Configure leave types, entitlements, and policies
- **Claims Setup** - Configure claim types, limits, and approval rules
- **Wellness Setup** - Mental & Emotional Health, Physical Wellness, Financial Wellbeing provider integrations
- **Document Automation** - AI-generated contracts, letters, and HR documents
- **Document Library** - Centralized document management

### ADMIN
- **System Admin** - Platform administration and tenant management
- **Platform Docs** - System documentation

---

## Key Features

### Performance Management

**KPI Management**
- Create and manage KPI templates with categories (Performance, Leadership, Communication, Technical, etc.)
- Configure review cycles (monthly, quarterly, semi-annual, annual)
- Assign KPIs to employees with custom targets and weights
- Self-assessment and manager review workflows
- 360-degree feedback with peer/direct report scoring
- WhatsApp notification integration for reviews

**OKR Management (Objectives & Key Results)**
- Define Objective templates linked to strategic goals
- Create Key Result templates with measurable outcomes
- Link Objectives to Key Results (many-to-many relationships)
- Link OKRs to specific projects
- Weekly monitoring frequency (in addition to monthly/quarterly/annually)
- Separate review cycles for OKR tracking

### Employee Wellness & Engagement

**Pulse Survey**
- **Employee Net Promoter Score (eNPS)**: Single question "How likely are you to recommend this company as a place to work?" scored 0-10
  - Promoters (9-10): Loyal brand ambassadors
  - Passives (7-8): Satisfied but flight risk
  - Detractors (0-6): Dissatisfied employees
  - eNPS = % Promoters - % Detractors
- **Well-being Check**: Workload manageability, mental health support surveys
- **Relationship Check**: Team dynamics, psychological safety assessment
- **Open-ended Feedback**: Qualitative feedback with AI sentiment analysis
- **AI Assessments**: Automated red flag identification for individuals and departments
- **AI Recommendations**: Intervention suggestions for wellness and employee relations

### Compliance & Legal

**Compliance Module**
- **Legislation Tab**: Links to South African labour legislation
  - Basic Conditions of Employment Act (BCEA)
  - Labour Relations Act (LRA)
  - Employment Equity Act (EEA)
  - Occupational Health and Safety Act (OHSA)
  - AI agents monitor Government Gazette for updates
  - RAG-powered Q&A for legislation queries
- **Administration Tab**:
  - Employment contract management with search and filtering
  - RAG-powered Q&A for contract queries
  - POPIA consent management (Received / Pending / Denied status tracking)
  - Consent request workflows for data processing, storage, and destruction

### Leave & Claims

**Leave Management**
- Leave application with type selection (Annual, Sick, Family Responsibility, Maternity, Paternity, Study, Unpaid, Compassionate)
- Manager approval workflow
- Payroll sync for salary calculations

**Claims Management**
- Expense claim submission with receipt upload
- Claim types: Travel, Accommodation, Meals, Communication, Training, Equipment, Medical
- Approval workflow with manager review
- Payroll sync for reimbursement processing

### Wellness Partner Integration

**Wellness Setup**
- Configure third-party wellness provider integrations across three categories:
  - Mental & Emotional Health providers
  - Physical Wellness providers
  - Financial Wellbeing providers
- API endpoint and key management per provider
- Connection status monitoring and testing
- Enable/disable providers per tenant

---

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** build tool
- **TailwindCSS 4** with Radix UI components
- **TanStack Query** for server state management
- **Wouter** for routing
- **React Hook Form** with Zod validation
- **Recharts** for data visualization

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **Passport.js** authentication with JWT
- **Groq SDK** for AI-powered features
- **WebSocket** support

### Database
- **PostgreSQL** with 65+ tables
- Multi-tenant data isolation
- Full audit trail with timestamps

---

## Database Schema (Key Tables)

| Module | Tables |
|--------|--------|
| **KPI** | `kpi_templates`, `review_cycles`, `kpi_assignments`, `kpi_scores`, `feedback_360_requests`, `feedback_360_responses`, `review_submissions` |
| **OKR** | `okr_objectives`, `okr_key_results`, `okr_objective_key_result_links`, `okr_review_cycles`, `okr_assignments`, `okr_scores`, `okr_review_submissions` |
| **Pulse Survey** | `pulse_surveys`, `pulse_survey_responses`, `pulse_survey_analysis` |
| **Compliance** | `employee_consent`, `compliance_documents`, `compliance_chat_history` |
| **Wellness** | `wellness_providers` |
| **Core HR** | `users`, `employees`, `departments`, `employee_skills` |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Groq API key

### Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

### Environment Variables

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/ahc
GROQ_API_KEY=gsk_...
SESSION_SECRET=your-random-secret-key
NODE_ENV=development
PORT=5000
```

---

## API Endpoints

### OKR Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/okr-objectives` | List all objectives |
| POST | `/api/okr-objectives` | Create objective |
| PATCH | `/api/okr-objectives/:id` | Update objective |
| DELETE | `/api/okr-objectives/:id` | Delete objective |
| GET | `/api/okr-key-results` | List key results |
| POST | `/api/okr-key-results` | Create key result |
| GET | `/api/okr-links` | List objective-key result links |
| POST | `/api/okr-links` | Create link |
| GET | `/api/okr-review-cycles` | List review cycles |
| POST | `/api/okr-review-cycles` | Create review cycle |
| GET | `/api/okr-assignments` | List assignments |
| POST | `/api/okr-assignments/batch` | Batch create assignments |

### Pulse Survey
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pulse-surveys` | List surveys |
| POST | `/api/pulse-surveys` | Create survey |
| GET | `/api/pulse-survey-responses` | List responses |
| POST | `/api/pulse-survey-responses` | Submit response |
| GET | `/api/pulse-survey-analysis` | Get AI analysis |

### Compliance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employee-consent` | List consent records |
| POST | `/api/employee-consent` | Create consent request |
| PATCH | `/api/employee-consent/:id` | Update consent status |
| GET | `/api/compliance-documents` | List compliance documents |
| POST | `/api/compliance-chat` | RAG Q&A for legislation/contracts |

### Wellness Providers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wellness-providers` | List providers |
| POST | `/api/wellness-providers` | Add provider |
| PATCH | `/api/wellness-providers/:id` | Update provider |
| DELETE | `/api/wellness-providers/:id` | Delete provider |

### KPI Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/kpi-templates` | List KPI templates |
| POST | `/api/kpi-templates` | Create template |
| GET | `/api/review-cycles` | List review cycles |
| POST | `/api/review-cycles` | Create cycle |
| GET | `/api/kpi-assignments` | List assignments |
| POST | `/api/kpi-assignments/batch` | Batch assign KPIs |
| GET | `/api/review-submissions` | List review submissions |

---

## Project Structure

```
AHC-HR/
├── client/src/
│   ├── pages/                    # Page components
│   │   ├── kpi-management.tsx    # KPI templates, cycles, assignments, reviews
│   │   ├── okr-management.tsx    # OKR objectives, key results, linking
│   │   ├── leave-management.tsx  # Leave application, approval, payroll sync
│   │   ├── claims-management.tsx # Claims submission, approval, payroll sync
│   │   ├── pulse-survey.tsx      # eNPS, well-being, AI assessments
│   │   ├── compliance.tsx        # Legislation, POPIA consent
│   │   ├── wellness-setup.tsx    # Wellness provider integrations
│   │   ├── leave-setup.tsx       # Leave type configuration
│   │   └── claims-setup.tsx      # Claims type configuration
│   ├── components/
│   │   ├── layout/               # Sidebar, AppLayout, TopHeader
│   │   └── ui/                   # Radix UI component library
│   ├── contexts/                 # TenantContext, ThemeContext
│   ├── hooks/                    # useTenant, useToast
│   └── App.tsx                   # Routing configuration
│
├── server/
│   ├── routes.ts                 # All API endpoints
│   ├── storage.ts                # Database query layer
│   ├── index.ts                  # Express server setup
│   └── auth-service.ts           # Authentication
│
├── shared/
│   └── schema.ts                 # Drizzle ORM schema (65+ tables)
│
└── package.json
```

---

## License

This project is proprietary software. All rights reserved.

---

**AHC - HR Management Platform**
Built for the future of HR in South Africa
