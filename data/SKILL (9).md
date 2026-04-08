---
name: sql-to-business-logic
description: Translate SQL queries into plain language business logic. Use when documenting queries, explaining analysis to non-technical stakeholders, code review, or creating user-friendly query descriptions.
---

# SQL to Business Logic Translator

## Quick Start

Convert complex SQL queries into clear, plain-language explanations that non-technical stakeholders can understand and validate.

## Context Requirements

Before translating SQL, I need:

1. **SQL Query**: The query to translate
2. **Context**: What business question does it answer
3. **Audience**: Who needs to understand this
4. **Schema Info**: Table/column business meanings
5. **Output Format**: Narrative, bullet points, or flowchart

## Context Gathering

### For SQL Query:
"Share the SQL query you want translated:

```sql
SELECT 
  DATE_TRUNC('month', order_date) as month,
  COUNT(DISTINCT customer_id) as customers,
  SUM(total_amount) as revenue
FROM orders
WHERE status = 'completed'
  AND order_date >= '2024-01-01'
GROUP BY 1
ORDER BY 1 DESC
```

I'll explain what it does in plain language."

### For Context:
"What's the business question this query answers?

Examples:
- 'Monthly revenue trend for exec dashboard'
- 'Customer count by product for pricing analysis'
- 'Churn rate calculation for retention team'

This helps me frame the translation appropriately."

### For Audience:
"Who needs to understand this query?

**Technical Audience** (analysts, engineers):
- More detail on logic
- Explain edge cases
- Mention performance considerations

**Business Audience** (stakeholders, executives):
- Focus on business meaning
- Avoid technical jargon
- Emphasize business rules

**Mixed Audience**:
- Start with business explanation
- Add technical appendix"

### For Schema:
"Do you have table/column descriptions?

**Helpful Info:**
- Business names for tables (orders = 'Customer Orders')
- What key columns represent
- Common status values
- Important business rules

Example:
- `status = 'completed'` means 'paid and fulfilled'
- `total_amount` includes tax and shipping
- `order_date` is when order was placed, not shipped"

### For Output Format:
"How should I present the translation?

**Narrative** (paragraph):
'This query calculates monthly revenue by...'

**Bullet Points** (structured):
• Step 1: Filter to completed orders
• Step 2: Group by month
• Step 3: Calculate totals

**Flowchart** (visual):
Data → Filter → Group → Aggregate → Sort

Which works best for your use case?"

## Workflow

### Step 1: Parse SQL Structure

```python
import sqlparse
from sqlparse.sql import IdentifierList, Identifier, Where, Comparison
from sqlparse.tokens import Keyword, DML

def parse_sql_structure(sql_query):
    """
    Extract key components of SQL query
    """
    
    parsed = sqlparse.parse(sql_query)[0]
    
    structure = {
        'type': None,
        'tables': [],
        'columns': [],
        'where_conditions': [],
        'group_by': [],
        'order_by': [],
        'having': [],
        'joins': []
    }
    
    # Identify query type
    for token in parsed.tokens:
        if token.ttype is DML:
            structure['type'] = token.value.upper()
    
    # Extract components (simplified)
    sql_upper = sql_query.upper()
    
    # Tables
    if 'FROM' in sql_upper:
        from_part = sql_query.split('FROM')[1].split('WHERE')[0] if 'WHERE' in sql_upper else sql_query.split('FROM')[1]
        from_part = from_part.split('GROUP BY')[0] if 'GROUP BY' in sql_upper else from_part
        structure['tables'] = [t.strip() for t in from_part.split('JOIN') if t.strip()]
    
    # WHERE conditions
    if 'WHERE' in sql_upper:
        where_part = sql_query.split('WHERE')[1].split('GROUP BY')[0] if 'GROUP BY' in sql_upper else sql_query.split('WHERE')[1]
        where_part = where_part.split('ORDER BY')[0] if 'ORDER BY' in sql_upper else where_part
        structure['where_conditions'] = [c.strip() for c in where_part.split('AND') if c.strip()]
    
    # GROUP BY
    if 'GROUP BY' in sql_upper:
        group_part = sql_query.split('GROUP BY')[1].split('ORDER BY')[0] if 'ORDER BY' in sql_upper else sql_query.split('GROUP BY')[1]
        structure['group_by'] = [g.strip() for g in group_part.split(',')]
    
    return structure

# Example
sql = """
SELECT 
  DATE_TRUNC('month', order_date) as month,
  COUNT(DISTINCT customer_id) as customers,
  SUM(total_amount) as revenue
FROM orders
WHERE status = 'completed'
  AND order_date >= '2024-01-01'
GROUP BY 1
ORDER BY 1 DESC
"""

structure = parse_sql_structure(sql)
print("✅ SQL parsed")
print(f"   Type: {structure['type']}")
print(f"   Tables: {structure['tables']}")
print(f"   Filters: {len(structure['where_conditions'])}")
```

### Step 2: Translate SELECT Clause

```python
def translate_select(select_clause, schema_info=None):
    """
    Translate SELECT into business language
    """
    
    translations = []
    
    # Common aggregations
    agg_patterns = {
        'COUNT(DISTINCT': 'Count unique',
        'COUNT(': 'Count total',
        'SUM(': 'Sum of',
        'AVG(': 'Average',
        'MAX(': 'Maximum',
        'MIN(': 'Minimum',
        'DATE_TRUNC': 'Group by'
    }
    
    # Split select clause
    for item in select_clause.split(','):
        item = item.strip()
        
        translation = item
        
        # Apply patterns
        for pattern, replacement in agg_patterns.items():
            if pattern in item:
                translation = replacement + ' ' + item.split(pattern)[1].split(')')[0]
                
                # Handle aliases
                if ' as ' in item.lower():
                    alias = item.split(' as ')[1].strip()
                    translation = f"{translation} (called '{alias}')"
                
                break
        
        # Add business context if available
        if schema_info:
            for col, meaning in schema_info.items():
                if col in item:
                    translation = translation.replace(col, meaning)
        
        translations.append(translation)
    
    return translations

# Example
schema_info = {
    'customer_id': 'customers',
    'order_date': 'order placement date',
    'total_amount': 'order value'
}

selects = translate_select(
    "DATE_TRUNC('month', order_date) as month, COUNT(DISTINCT customer_id) as customers, SUM(total_amount) as revenue",
    schema_info
)

print("\n📊 SELECT translates to:")
for s in selects:
    print(f"   • {s}")
```

### Step 3: Translate WHERE Clause

```python
def translate_where(where_conditions, schema_info=None):
    """
    Translate WHERE filters into business rules
    """
    
    translations = []
    
    operators = {
        '=': 'equals',
        '!=': 'does not equal',
        '<>': 'does not equal',
        '>': 'greater than',
        '<': 'less than',
        '>=': 'on or after',
        '<=': 'on or before',
        'LIKE': 'matches pattern',
        'IN': 'is one of',
        'BETWEEN': 'is between',
        'IS NULL': 'is empty',
        'IS NOT NULL': 'is not empty'
    }
    
    for condition in where_conditions:
        condition = condition.strip()
        
        # Find operator
        translation = condition
        for op, meaning in operators.items():
            if op in condition:
                parts = condition.split(op)
                field = parts[0].strip()
                value = parts[1].strip() if len(parts) > 1 else ''
                
                # Remove quotes
                value = value.replace("'", "")
                
                # Add business context
                if schema_info and field in schema_info:
                    field = schema_info[field]
                
                translation = f"{field} {meaning} {value}"
                break
        
        translations.append(translation)
    
    return translations

where_translates = translate_where(
    ["status = 'completed'", "order_date >= '2024-01-01'"],
    schema_info={'status': 'order status', 'order_date': 'order date'}
)

print("\n🔍 WHERE translates to:")
for w in where_translates:
    print(f"   • {w}")
```

### Step 4: Translate GROUP BY & Aggregations

```python
def translate_grouping(group_by_cols, schema_info=None):
    """
    Explain grouping logic
    """
    
    if not group_by_cols:
        return None
    
    translations = []
    
    for col in group_by_cols:
        col = col.strip()
        
        # Handle numeric references (GROUP BY 1)
        if col.isdigit():
            translations.append(f"the {col}st column in SELECT")
        else:
            col_name = col
            if schema_info and col in schema_info:
                col_name = schema_info[col]
            translations.append(col_name)
    
    if len(translations) == 1:
        return f"Calculate separately for each {translations[0]}"
    else:
        return f"Calculate separately for each combination of {', '.join(translations)}"

group_translate = translate_grouping(['1'], {})
print(f"\n📦 GROUP BY translates to:")
print(f"   {group_translate}")
```

### Step 5: Generate Business Logic Narrative

```python
def generate_business_narrative(sql, schema_info, business_context):
    """
    Create complete plain-language explanation
    """
    
    structure = parse_sql_structure(sql)
    
    narrative = []
    
    # Opening
    if business_context:
        narrative.append(f"**Purpose:** {business_context}\n")
    
    narrative.append("**How it works:**\n")
    
    # Step 1: Data source
    tables = structure['tables'][0] if structure['tables'] else 'unknown'
    table_name = schema_info.get('tables', {}).get(tables, tables)
    narrative.append(f"1. **Start with:** {table_name}")
    
    # Step 2: Filters
    if structure['where_conditions']:
        narrative.append(f"\n2. **Filter to:**")
        for condition in translate_where(structure['where_conditions'], schema_info.get('columns', {})):
            narrative.append(f"   • {condition}")
    
    # Step 3: Grouping
    if structure['group_by']:
        group_explain = translate_grouping(structure['group_by'], schema_info.get('columns', {}))
        narrative.append(f"\n3. **Calculate:** {group_explain}")
    
    # Step 4: Metrics
    narrative.append(f"\n4. **Show:**")
    # Would extract SELECT translations here
    narrative.append(f"   • Count of unique customers")
    narrative.append(f"   • Total revenue")
    narrative.append(f"   • Grouped by month")
    
    # Step 5: Sorting
    if 'ORDER BY' in sql.upper():
        narrative.append(f"\n5. **Sort:** By month (newest first)")
    
    # Result
    narrative.append(f"\n**Result:** Monthly customer count and revenue for completed orders in 2024")
    
    return "\n".join(narrative)

business_context = "Track monthly revenue and customer growth"
schema = {
    'tables': {'orders': 'Customer Orders Table'},
    'columns': {
        'order_date': 'date order was placed',
        'status': 'order status',
        'customer_id': 'customer',
        'total_amount': 'order value'
    }
}

narrative = generate_business_narrative(sql, schema, business_context)
print("\n" + "="*60)
print("BUSINESS LOGIC EXPLANATION")
print("="*60)
print(narrative)
```

### Step 6: Generate Bullet Point Summary

```python
def generate_bullet_summary(sql, schema_info):
    """
    Create concise bullet point explanation
    """
    
    summary = "## Query Summary\n\n"
    
    # What
    summary += "**What this query does:**\n"
    summary += "• Calculates monthly revenue and customer count\n"
    summary += "• For completed orders only\n"
    summary += "• Since January 2024\n\n"
    
    # Data
    summary += "**Data used:**\n"
    summary += "• Source: Customer Orders table\n"
    summary += "• Time period: 2024 onwards\n"
    summary += "• Status: Completed orders only\n\n"
    
    # Output
    summary += "**Output columns:**\n"
    summary += "• month: Month of the year\n"
    summary += "• customers: Number of unique customers\n"
    summary += "• revenue: Total order value\n\n"
    
    # Business rules
    summary += "**Business rules applied:**\n"
    summary += "• Each customer counted once per month\n"
    summary += "• Revenue is sum of all order values\n"
    summary += "• Only 'completed' orders (paid & fulfilled)\n"
    
    return summary

bullet_summary = generate_bullet_summary(sql, schema)
print("\n" + bullet_summary)
```

### Step 7: Generate Visual Flowchart

```python
def generate_flowchart_ascii(sql):
    """
    Create ASCII flowchart representation
    """
    
    flowchart = """
    ┌─────────────────────────┐
    │  Customer Orders Table  │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐
    │   Filter Conditions:    │
    │  • status = 'completed' │
    │  • order_date >= 2024   │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐
    │    Group by Month       │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐
    │  Calculate per month:   │
    │  • Unique customers     │
    │  • Total revenue        │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐
    │  Sort by Month (DESC)   │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐
    │    Final Results        │
    │  month | customers | $  │
    └─────────────────────────┘
    """
    
    return flowchart

flowchart = generate_flowchart_ascii(sql)
print("\n📊 Query Flow:")
print(flowchart)
```

### Step 8: Add Validation Questions

```python
def generate_validation_questions(sql, business_context):
    """
    Questions to validate query matches intent
    """
    
    questions = [
        "❓ Should we only include 'completed' orders, or also 'shipped'?",
        "❓ Is 2024 the right start date, or did you want all historical data?",
        "❓ Should revenue include tax and shipping, or just product value?",
        "❓ Do we count each customer once per month, or count repeat orders?",
        "❓ Should canceled orders be excluded?"
    ]
    
    print("\n🔍 Validation Questions:")
    print("\nTo confirm this query matches your intent:\n")
    for q in questions:
        print(q)
    
    print("\nPlease review and let me know if any logic needs adjustment.")

generate_validation_questions(sql, business_context)
```

## Context Validation

Before sharing translation, verify:
- [ ] SQL query is complete and syntactically correct
- [ ] Business context is clear
- [ ] Table/column meanings documented
- [ ] Audience level appropriate
- [ ] Key business rules explained
- [ ] Edge cases addressed

## Output Template

```
# SQL Query Translation

## Business Purpose

Track monthly revenue and customer growth for performance monitoring.

## What This Query Does

This query calculates two key metrics for each month in 2024:
1. How many unique customers placed orders
2. Total revenue generated

It only includes orders that have been fully completed (paid and fulfilled).

## Step-by-Step Logic

**Step 1: Start with Customer Orders**
- Table: orders (complete order history)

**Step 2: Apply Filters**
Only include orders that meet both conditions:
- Order status is 'completed' (paid and fulfilled)
- Order date is January 1, 2024 or later

**Step 3: Group by Month**
Calculate metrics separately for each calendar month

**Step 4: Calculate Metrics**
For each month:
- Count unique customers (each customer counted once)
- Sum total order values (includes tax and shipping)

**Step 5: Sort Results**
Show most recent month first

## Output Format

| Column | Description |
|--------|-------------|
| month | Calendar month (YYYY-MM format) |
| customers | Number of unique customers that month |
| revenue | Total $ value of all orders that month |

## Business Rules

✓ Each customer counted once per month (repeat orders don't inflate count)
✓ Revenue includes tax and shipping
✓ Only completed orders (excludes pending, cancelled, refunded)
✓ Order date is when placed, not when shipped

## Validation Questions

To confirm this matches your intent:

1. Should we only count 'completed' orders?
2. Is 2024 the right start date?
3. Should revenue include tax/shipping?
4. Any other order statuses to include/exclude?

## Technical Notes

**Performance:** Query uses index on (status, order_date) for efficiency

**Edge Cases Handled:**
- Orders with NULL customer_id excluded (shouldn't exist)
- Timezone: All dates in UTC

**Refresh Frequency:** Real-time (orders table updated continuously)
```

## Common Scenarios

### Scenario 1: "Explain this query to my manager"
→ Generate business narrative
→ Focus on what and why
→ Avoid technical jargon
→ Include validation questions
→ Emphasize business impact

### Scenario 2: "Document this query for future analysts"
→ Technical + business explanation
→ Document assumptions
→ Explain edge cases
→ Add performance notes
→ Include modification examples

### Scenario 3: "Validate query logic before running"
→ Generate step-by-step breakdown
→ Create validation checklist
→ Identify potential issues
→ Suggest test cases
→ Get stakeholder sign-off

### Scenario 4: "Create user-friendly query catalog"
→ Translate all common queries
→ Standardize format
→ Add search tags
→ Include use case examples
→ Make self-service

### Scenario 5: "Code review - is this query correct?"
→ Translate to business logic
→ Compare to requirements
→ Flag discrepancies
→ Suggest corrections
→ Document assumptions

## Handling Missing Context

**User only provides SQL:**
"I can translate the technical steps, but I need business context to make it useful:
- What question are you trying to answer?
- Who will use this explanation?
- Any important business rules?

5 minutes of context makes translation 10x better."

**Complex nested query:**
"This query has multiple layers. I'll explain:
1. Inner query first (what it does)
2. Outer query (how it uses inner result)
3. Overall business logic

Would you like me to simplify the SQL too?"

**User unsure if query is correct:**
"Let me translate it and we'll validate together:
1. I'll explain what it does
2. You tell me what it should do
3. We'll spot any discrepancies

Often seeing business logic reveals issues."

**Schema info not available:**
"I'll translate using technical names. Can you help map:
- What does 'orders' table represent?
- What is 'status' field?
- What does 'completed' mean?

Then I'll regenerate with business terms."

## Advanced Options

After basic translation, offer:

**SQL Optimization Review**:
"I can check if query could be faster - suggest index usage, rewrite patterns."

**Data Quality Checks**:
"Add validation: check for NULLs, duplicates, expected ranges before running query."

**Query Comparison**:
"If you have an old version, I can show what changed between versions."

**Generate Test Cases**:
"Create sample input/output to validate query works as expected."

**Auto-Documentation**:
"Set up automated translation for all saved queries in your catalog."

**Interactive Explainer**:
"Create clickable query where hovering over parts shows explanations."
