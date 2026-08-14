# 🤖 DigiPlus — AI Service Desk

DigiPlus is an AI-powered IT Service Desk application designed to help organizations manage IT support incidents efficiently.

The system allows users to create and manage support tickets, track ticket status and priority, and use AI-powered analysis to understand the possible cause of an incident and receive suggested troubleshooting actions.

---

## 🚀 Features

### 🎫 Ticket Management
- Create new IT support tickets
- Automatically generate unique incident IDs
- View all submitted tickets
- Search tickets
- Track ticket category and priority
- Track ticket status
- View complete ticket details

### 🤖 AI-Powered Ticket Analysis
DigiPlus integrates an AI service to analyze support tickets.

For each selected ticket, the AI analyzes:

- Ticket title
- Ticket description
- Category
- Priority

It generates:

- **AI Summary**
- **Possible Cause**
- **Suggested Troubleshooting Actions**

The generated analysis is stored in MongoDB and displayed directly inside the ticket details modal.

### 📊 Dashboard
The dashboard provides an overview of the service desk, including:

- Total tickets
- Open incidents
- High-priority incidents
- Resolved incidents
- Recent tickets
- Ticket activity

### 🎨 Modern UI
- Responsive React interface
- Tailwind CSS styling
- Lucide icons
- Modal-based ticket interaction
- Responsive layout for desktop and smaller screens

---

# 🏗️ System Architecture

```text
                         ┌───────────────────────────┐
                         │        USER / AGENT        │
                         │                           │
                         │  Create / View / Analyze  │
                         │          Tickets          │
                         └─────────────┬─────────────┘
                                       │
                                       │ HTTP Requests
                                       ▼
                         ┌───────────────────────────┐
                         │       REACT FRONTEND      │
                         │                           │
                         │  • Dashboard              │
                         │  • Tickets                │
                         │  • Search                 │
                         │  • Ticket Modal           │
                         │  • AI Analysis UI         │
                         └─────────────┬─────────────┘
                                       │
                                       │ REST API
                                       ▼
                         ┌───────────────────────────┐
                         │      NODE.JS + EXPRESS    │
                         │          BACKEND          │
                         │                           │
                         │  • Ticket Routes          │
                         │  • Validation             │
                         │  • Ticket Processing      │
                         │  • AI Service Integration │
                         └──────────┬───────┬────────┘
                                    │       │
                       Database     │       │ AI Request
                       Operations   │       │
                                    ▼       ▼
                         ┌──────────────┐  ┌─────────────────┐
                         │   MongoDB    │  │   GROQ AI API   │
                         │              │  │                 │
                         │ • Tickets    │  │ • Analysis      │
                         │ • Status     │  │ • Summary       │
                         │ • Priority   │  │ • Cause         │
                         │ • AI Result  │  │ • Actions       │
                         └──────────────┘  └─────────────────┘
                                    ▲
                                    │
                                    │ AI Analysis
                                    │ stored with ticket
                                    │
                         ┌──────────┴──────────┐
                         │     MongoDB Ticket  │
                         │      Document       │
                         │                     │
                         │ aiAnalysis:         │
                         │  ├─ summary         │
                         │  ├─ possibleCause   │
                         │  └─ actions[]       │
                         └─────────────────────┘
