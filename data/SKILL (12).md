---
name: cohort-analysis
description: Time-based cohort analysis with retention and behavior tracking. Use when analyzing user retention over time, comparing cohort performance, identifying lifecycle patterns, or measuring feature adoption by cohort.
---

# Cohort Analysis

## Quick Start

Analyze how groups of users/customers (cohorts) behave over time, typically measuring retention, revenue, or engagement patterns.

## Context Requirements

1. **Dataset**: User/customer event data
2. **Cohort Definition**: How to group users (by signup month, acquisition channel, etc.)
3. **Retention Metric**: What counts as "retained" (login, purchase, usage, etc.)
4. **Time Periods**: Analysis granularity (daily, weekly, monthly)

## Context Gathering

### Initial Questions:
"Let's set up cohort analysis. I need:

1. **What are we analyzing?**
   - User retention (returning users)
   - Revenue retention (recurring purchases)
   - Feature adoption (using specific features)
   - Other behavior

2. **How should we define cohorts?**
   - By signup date (most common)
   - By acquisition channel
   - By first purchase date
   - By product/plan tier
   - Other dimension

3. **What counts as 'active' or 'retained'?**
   Examples:
   - Logged in at least once
   - Made a purchase
   - Used feature X
   - Spent >10 minutes
   
4. **What time periods?**
   - Daily cohorts (for apps with daily usage)
   - Weekly cohorts
   - Monthly cohorts (most common for SaaS)
   - Quarterly cohorts"

### For Dataset:
"I need data with:
- **User ID** (to track individuals)
- **Cohort date** (e.g., signup_date)
- **Activity dates** (e.g., login_date, purchase_date)
- **Cohort attributes** (optional: channel, plan, etc.)

Can you provide:
- File upload (CSV/Excel), OR
- Database query to fetch this, OR
- Description of tables and I'll write the query?"

### Validation Questions:
"Before I proceed:
- What minimum cohort size should we analyze? (I recommend >100 users)
- How many periods should we track? (e.g., 12 months, 8 weeks)
- Any cohorts to exclude? (e.g., test users, employees)"

## Workflow

### 1. Data Preparation
