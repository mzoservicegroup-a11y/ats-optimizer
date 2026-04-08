---
name: semantic-model-builder
description: Create comprehensive semantic layer documentation for analytics assets. Use when documenting data models, defining business metrics, creating data dictionaries, or building context for AI-assisted analysis.
---

# Semantic Model Builder

## Quick Start

Build structured documentation that defines business metrics, data models, and relationships in a format optimized for AI-assisted analysis.

## Context Requirements

1. **Metric/Entity to Document**: What needs documentation
2. **Calculation Logic**: How it's computed (SQL, formula, or plain English)
3. **Business Context**: Why it matters, how it's used
4. **Data Sources**: Where the data comes from

## Context Gathering

### Initial Prompt:
"Let's build semantic documentation. What would you like to document?
- A specific metric (e.g., MRR, DAU, Conversion Rate)
- A data model/table (e.g., users table, transactions)
- A business concept (e.g., 'Active Customer')
- Multiple related items"

### For Metrics:
"For [metric name], I need:

1. **Definition**: What is this metric in plain English?
   Example: 'Monthly Recurring Revenue (MRR) is the predictable revenue generated each month from active subscriptions'

2. **Calculation**: How is it calculated?
   - Provide SQL query, OR
   - Formula (e.g., 'SUM(subscription_amount) WHERE status = active'), OR
   - Plain English steps

3. **Business Context**:
   - Why does this metric matter?
   - Who uses it?
   - What decisions does it inform?
   - What's a 'good' value?

4. **Edge Cases** (optional but helpful):
   - What should be included/excluded?
   - How to handle special situations?
   - Known calculation gotchas?"

### For Data Models:
"For [table/model name], I need:

1. **Purpose**: What does this table represent?
   Example: 'One row per user signup'

2. **Key Columns**: Most important fields
   - Which are IDs/keys?
   - Which are metrics?
   - Which are attributes?

3. **Relationships**: How does this connect to other tables?
   Example: 'users.id → orders.user_id'

4. **Grain**: What is one row?
   Example: 'One row per transaction' or 'One row per user per day'"

### For Business Concepts:
"For [concept], help me understand:

1. **Definition**: What is this?
2. **How to Identify**: How do you know something is/isn't this?
3. **Related Data**: Where is this captured in data?
4. **Why It Matters**: Business significance?"

## Workflow

### 1. Gather Information

**Start with what's provided, probe for gaps:**

If user provides SQL: