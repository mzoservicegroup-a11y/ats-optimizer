---
name: data-catalog-entry
description: Create standardized metadata for data assets. Use when documenting new datasets, building data catalogs, improving data discoverability, or creating data dictionaries for teams.
---

# Data Catalog Entry

## Quick Start

Create comprehensive, standardized metadata entries for data assets to improve discoverability, understanding, and proper usage across the organization.

## Context Requirements

Before cataloging a data asset, I need:

1. **Data Asset Details**: What data exists and where
2. **Business Context**: What it represents and why it matters
3. **Technical Specifications**: Schema, format, size
4. **Access & Governance**: Who can use it and how
5. **Quality Metrics**: Reliability and completeness

## Context Gathering

### For Data Asset:
"What data asset are we cataloging?

**Asset Types:**
- Database table
- View
- Dataset (CSV, Parquet)
- API endpoint
- Dashboard
- Report

**Basic Info:**
- Name: `orders_fact`
- Location: `postgres://prod/analytics.orders_fact`
- Owner: Data Engineering team
- Created: 2024-01-15"

### For Business Context:
"Help me understand the business purpose:

**Purpose:**
- What business process does this data represent?
- Who uses it and for what decisions?
- How critical is it? (mission-critical, important, nice-to-have)

**Examples:**
- '`orders_fact` contains all customer orders. Used by finance for revenue reporting, product for conversion analysis. Mission-critical.'
- '`user_sessions` tracks website visits. Used by growth team for engagement analysis. Important but not blocking.'"

### For Schema:
"What's in this dataset?

**Need:**
- Column names and data types
- Description of each field
- Relationships to other tables
- Sample values
- Business rules

Can you provide `DESCRIBE TABLE` output or schema documentation?"

### For Quality:
"How reliable is this data?

**Quality Dimensions:**
- **Completeness:** % of fields populated
- **Accuracy:** Known data quality issues?
- **Freshness:** How often updated? Any lag?
- **Consistency:** Matches other sources?

**Example:** 'orders_fact is 99.9% complete, updates real-time, matches Stripe within $10 daily'"

### For Access:
"Who should be able to use this?

**Access Control:**
- Public (all employees)
- Restricted (specific teams)
- Confidential (special approval)
- PII/sensitive data included?

**Usage Guidelines:**
- Any restrictions on use?
- Required approvals?
- Compliance requirements?"

## Workflow

### Step 1: Extract Technical Metadata

```python
import pandas as pd
import sqlalchemy
from datetime import datetime

def extract_table_metadata(connection_string, schema, table_name):
    """
    Extract technical metadata from database table
    """
    
    engine = sqlalchemy.create_engine(connection_string)
    inspector = sqlalchemy.inspect(engine)
    
    metadata = {
        'name': table_name,
        'schema': schema,
        'type': 'table',
        'location': f"{schema}.{table_name}",
        'extracted_at': datetime.now().isoformat()
    }
    
    # Get columns
    columns = inspector.get_columns(table_name, schema=schema)
    metadata['columns'] = []
    
    for col in columns:
        metadata['columns'].append({
            'name': col['name'],
            'type': str(col['type']),
            'nullable': col['nullable'],
            'default': col.get('default'),
            'primary_key': False,  # Will update below
            'foreign_key': False
        })
    
    # Get primary keys
    pk = inspector.get_pk_constraint(table_name, schema=schema)
    pk_columns = pk.get('constrained_columns', [])
    
    for col in metadata['columns']:
        if col['name'] in pk_columns:
            col['primary_key'] = True
    
    # Get foreign keys
    fks = inspector.get_foreign_keys(table_name, schema=schema)
    fk_columns = []
    for fk in fks:
        fk_columns.extend(fk['constrained_columns'])
    
    for col in metadata['columns']:
        if col['name'] in fk_columns:
            col['foreign_key'] = True
    
    # Get row count
    query = f"SELECT COUNT(*) as row_count FROM {schema}.{table_name}"
    result = pd.read_sql(query, engine)
    metadata['row_count'] = int(result['row_count'].iloc[0])
    
    # Get sample data
    query = f"SELECT * FROM {schema}.{table_name} LIMIT 5"
    sample = pd.read_sql(query, engine)
    metadata['sample_data'] = sample.to_dict('records')
    
    return metadata

# Extract metadata
metadata = extract_table_metadata(
    connection_string='postgresql://user:pass@host:5432/db',
    schema='analytics',
    table_name='orders_fact'
)

print(f"✅ Extracted metadata for {metadata['name']}")
print(f"   Columns: {len(metadata['columns'])}")
print(f"   Rows: {metadata['row_count']:,}")
```

### Step 2: Add Business Context

```python
def add_business_context(metadata, business_info):
    """
    Enrich technical metadata with business context
    """
    
    metadata.update({
        'display_name': business_info.get('display_name', metadata['name']),
        'description': business_info['description'],
        'business_owner': business_info['business_owner'],
        'technical_owner': business_info['technical_owner'],
        'domain': business_info['domain'],  # e.g., 'Sales', 'Marketing', 'Finance'
        'criticality': business_info['criticality'],  # critical, high, medium, low
        'use_cases': business_info['use_cases'],
        'stakeholders': business_info['stakeholders']
    })
    
    return metadata

# Add business context
business_info = {
    'display_name': 'Orders Fact Table',
    'description': 'Complete history of all customer orders including order details, pricing, and fulfillment status. Single source of truth for order data.',
    'business_owner': 'Head of Finance',
    'technical_owner': 'Data Engineering Team',
    'domain': 'Sales & Revenue',
    'criticality': 'critical',
    'use_cases': [
        'Revenue reporting and forecasting',
        'Customer analytics and segmentation',
        'Product performance analysis',
        'Inventory planning'
    ],
    'stakeholders': [
        'Finance team (daily revenue reports)',
        'Product team (conversion analysis)',
        'Operations team (fulfillment tracking)'
    ]
}

metadata = add_business_context(metadata, business_info)
print("✅ Business context added")
```

### Step 3: Document Column Definitions

```python
def add_column_business_definitions(metadata, column_definitions):
    """
    Add business-friendly descriptions to columns
    """
    
    for col in metadata['columns']:
        col_name = col['name']
        
        if col_name in column_definitions:
            col.update({
                'business_name': column_definitions[col_name].get('business_name', col_name),
                'description': column_definitions[col_name]['description'],
                'example_values': column_definitions[col_name].get('examples'),
                'business_rules': column_definitions[col_name].get('rules'),
                'common_values': column_definitions[col_name].get('common_values')
            })
    
    return metadata

# Define columns
column_definitions = {
    'order_id': {
        'business_name': 'Order ID',
        'description': 'Unique identifier for each order',
        'examples': ['ORD-2024-00001', 'ORD-2024-00002'],
        'rules': ['Format: ORD-YYYY-NNNNN', 'Sequential by year', 'Never null']
    },
    'customer_id': {
        'business_name': 'Customer ID',
        'description': 'Reference to customer who placed the order',
        'examples': ['CUST-12345', 'CUST-67890'],
        'rules': ['Foreign key to customers table', 'Required field']
    },
    'order_date': {
        'business_name': 'Order Date',
        'description': 'Date and time when order was placed',
        'examples': ['2024-12-15 10:30:00'],
        'rules': ['UTC timezone', 'Never in future', 'Cannot be before customer signup date']
    },
    'total_amount': {
        'business_name': 'Order Total',
        'description': 'Total order value in USD including tax and shipping',
        'examples': ['49.99', '129.50'],
        'rules': ['Always positive', 'Includes tax and shipping', 'Excludes refunds']
    },
    'status': {
        'business_name': 'Order Status',
        'description': 'Current fulfillment status of the order',
        'examples': ['pending', 'shipped', 'delivered', 'cancelled'],
        'common_values': {
            'pending': 'Order placed, payment confirmed, awaiting fulfillment',
            'shipped': 'Order dispatched to customer',
            'delivered': 'Order received by customer',
            'cancelled': 'Order cancelled (pre or post-shipment)'
        },
        'rules': ['Status transitions: pending → shipped → delivered', 'Cannot move backwards except to cancelled']
    }
}

metadata = add_column_business_definitions(metadata, column_definitions)
print("✅ Column definitions documented")
```

### Step 4: Add Data Quality Metrics

```python
def assess_data_quality(connection_string, schema, table_name):
    """
    Calculate data quality metrics
    """
    
    engine = sqlalchemy.create_engine(connection_string)
    
    quality_metrics = {
        'assessed_date': datetime.now().isoformat()
    }
    
    # Completeness by column
    query = f"""
    SELECT 
        column_name,
        COUNT(*) as total_rows,
        COUNT(column_name) as non_null_rows,
        ROUND(COUNT(column_name)::numeric / COUNT(*) * 100, 2) as completeness_pct
    FROM {schema}.{table_name}
    CROSS JOIN (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = '{schema}' AND table_name = '{table_name}'
    ) cols
    GROUP BY column_name
    """
    
    completeness = pd.read_sql(query, engine)
    quality_metrics['completeness'] = completeness.to_dict('records')
    
    # Overall completeness score
    quality_metrics['overall_completeness'] = completeness['completeness_pct'].mean()
    
    # Freshness
    query = f"""
    SELECT MAX(updated_at) as last_updated
    FROM {schema}.{table_name}
    """
    
    freshness = pd.read_sql(query, engine)
    last_updated = pd.to_datetime(freshness['last_updated'].iloc[0])
    hours_old = (datetime.now() - last_updated).total_seconds() / 3600
    
    quality_metrics['freshness'] = {
        'last_updated': last_updated.isoformat(),
        'hours_since_update': hours_old,
        'status': 'fresh' if hours_old < 24 else 'stale'
    }
    
    # Duplicate check
    query = f"""
    SELECT COUNT(*) as duplicates
    FROM (
        SELECT order_id, COUNT(*) 
        FROM {schema}.{table_name}
        GROUP BY order_id
        HAVING COUNT(*) > 1
    ) dups
    """
    
    duplicates = pd.read_sql(query, engine)
    quality_metrics['duplicates'] = int(duplicates['duplicates'].iloc[0])
    
    # Quality score (0-100)
    quality_score = (
        quality_metrics['overall_completeness'] * 0.4 +
        (100 if hours_old < 24 else max(0, 100 - hours_old)) * 0.3 +
        (100 if quality_metrics['duplicates'] == 0 else 90) * 0.3
    )
    
    quality_metrics['quality_score'] = round(quality_score, 1)
    
    return quality_metrics

quality = assess_data_quality('postgresql://...', 'analytics', 'orders_fact')
metadata['quality_metrics'] = quality

print(f"✅ Quality assessed: {quality['quality_score']}/100")
```

### Step 5: Document Data Lineage

```python
def document_lineage(upstream_sources, downstream_consumers):
    """
    Document where data comes from and where it goes
    """
    
    lineage = {
        'upstream': [],
        'downstream': []
    }
    
    # Upstream sources
    for source in upstream_sources:
        lineage['upstream'].append({
            'source': source['name'],
            'type': source['type'],
            'refresh_frequency': source.get('refresh', 'unknown'),
            'transformation': source.get('transformation', 'none')
        })
    
    # Downstream consumers
    for consumer in downstream_consumers:
        lineage['downstream'].append({
            'consumer': consumer['name'],
            'type': consumer['type'],
            'use_case': consumer['use_case']
        })
    
    return lineage

# Document lineage
upstream = [
    {
        'name': 'production.orders (Postgres)',
        'type': 'database_table',
        'refresh': 'real-time replication',
        'transformation': 'dbt model with business logic'
    },
    {
        'name': 'stripe_api',
        'type': 'api',
        'refresh': 'daily sync',
        'transformation': 'enrichment with payment details'
    }
]

downstream = [
    {
        'name': 'Revenue Dashboard',
        'type': 'dashboard',
        'use_case': 'Daily revenue monitoring'
    },
    {
        'name': 'customer_lifetime_value model',
        'type': 'ml_model',
        'use_case': 'LTV prediction'
    },
    {
        'name': 'monthly_revenue_report',
        'type': 'scheduled_report',
        'use_case': 'Board reporting'
    }
]

metadata['lineage'] = document_lineage(upstream, downstream)
print("✅ Lineage documented")
```

### Step 6: Add Access & Governance

```python
def add_governance_info(metadata, governance):
    """
    Add access control and compliance information
    """
    
    metadata['governance'] = {
        'access_level': governance['access_level'],  # public, restricted, confidential
        'sensitivity': governance['sensitivity'],  # none, pii, financial, health
        'compliance_tags': governance.get('compliance_tags', []),
        'retention_policy': governance.get('retention_policy'),
        'access_instructions': governance['access_instructions'],
        'approved_use_cases': governance.get('approved_uses'),
        'restricted_use_cases': governance.get('restricted_uses')
    }
    
    return metadata

governance = {
    'access_level': 'restricted',
    'sensitivity': 'financial',
    'compliance_tags': ['SOX', 'GDPR'],
    'retention_policy': '7 years per regulatory requirement',
    'access_instructions': 'Request access via ServiceNow ticket. Requires manager approval.',
    'approved_uses': [
        'Financial reporting and analysis',
        'Product analytics',
        'Customer segmentation'
    ],
    'restricted_uses': [
        'Individual customer targeting without consent',
        'External sharing without legal review'
    ]
}

metadata = add_governance_info(metadata, governance)
print("✅ Governance policies documented")
```

### Step 7: Generate Catalog Entry

```python
def generate_catalog_entry_markdown(metadata):
    """
    Generate human-readable catalog entry
    """
    
    doc = f"# {metadata['display_name']}\n\n"
    
    # Overview
    doc += "## Overview\n\n"
    doc += f"**Name:** `{metadata['location']}`\n"
    doc += f"**Type:** {metadata['type']}\n"
    doc += f"**Domain:** {metadata['domain']}\n"
    doc += f"**Criticality:** {metadata['criticality'].upper()}\n\n"
    doc += f"**Description:**\n{metadata['description']}\n\n"
    
    # Ownership
    doc += "## Ownership\n\n"
    doc += f"- **Business Owner:** {metadata['business_owner']}\n"
    doc += f"- **Technical Owner:** {metadata['technical_owner']}\n\n"
    
    # Quality
    doc += "## Data Quality\n\n"
    quality = metadata['quality_metrics']
    doc += f"**Quality Score:** {quality['quality_score']}/100\n\n"
    doc += f"- **Completeness:** {quality['overall_completeness']:.1f}%\n"
    doc += f"- **Freshness:** Last updated {quality['freshness']['hours_since_update']:.1f} hours ago\n"
    doc += f"- **Duplicates:** {quality['duplicates']} found\n\n"
    
    # Schema
    doc += "## Schema\n\n"
    doc += f"**Row Count:** {metadata['row_count']:,}\n"
    doc += f"**Columns:** {len(metadata['columns'])}\n\n"
    
    doc += "| Column | Type | Description | Nullable | Keys |\n"
    doc += "|--------|------|-------------|----------|------|\n"
    
    for col in metadata['columns']:
        keys = []
        if col.get('primary_key'):
            keys.append('PK')
        if col.get('foreign_key'):
            keys.append('FK')
        keys_str = ', '.join(keys) if keys else '-'
        
        desc = col.get('description', '-')[:50]
        doc += f"| {col['name']} | {col['type']} | {desc} | {'Yes' if col['nullable'] else 'No'} | {keys_str} |\n"
    
    doc += "\n"
    
    # Use Cases
    doc += "## Use Cases\n\n"
    for use_case in metadata['use_cases']:
        doc += f"- {use_case}\n"
    doc += "\n"
    
    # Lineage
    doc += "## Data Lineage\n\n"
    doc += "**Upstream Sources:**\n"
    for source in metadata['lineage']['upstream']:
        doc += f"- {source['source']} ({source['type']})\n"
    
    doc += "\n**Downstream Consumers:**\n"
    for consumer in metadata['lineage']['downstream']:
        doc += f"- {consumer['consumer']} - {consumer['use_case']}\n"
    
    doc += "\n"
    
    # Access
    doc += "## Access & Governance\n\n"
    gov = metadata['governance']
    doc += f"**Access Level:** {gov['access_level'].upper()}\n"
    doc += f"**Sensitivity:** {gov['sensitivity'].upper()}\n"
    doc += f"**Compliance:** {', '.join(gov['compliance_tags'])}\n\n"
    doc += f"**Access Instructions:**\n{gov['access_instructions']}\n\n"
    
    # Footer
    doc += "---\n\n"
    doc += f"*Last updated: {metadata['extracted_at']}*\n"
    
    return doc

catalog_entry = generate_catalog_entry_markdown(metadata)

# Save
with open(f"{metadata['name']}_catalog_entry.md", 'w') as f:
    f.write(catalog_entry)

print(f"✅ Catalog entry generated: {metadata['name']}_catalog_entry.md")

# Also save as JSON for programmatic access
import json
with open(f"{metadata['name']}_metadata.json", 'w') as f:
    json.dump(metadata, f, indent=2, default=str)

print(f"✅ Metadata JSON saved: {metadata['name']}_metadata.json")
```

## Context Validation

Before publishing catalog entry, verify:
- [ ] Technical metadata extracted accurately
- [ ] Business context reviewed by data owner
- [ ] Column descriptions clear to non-technical users
- [ ] Quality metrics current and accurate
- [ ] Access policies correctly documented
- [ ] Lineage complete and up-to-date

## Output Template

```
# Orders Fact Table

## Overview

**Name:** `analytics.orders_fact`
**Type:** table
**Domain:** Sales & Revenue
**Criticality:** CRITICAL

**Description:**
Complete history of all customer orders including order details, pricing,
and fulfillment status. Single source of truth for order data.

## Ownership

- **Business Owner:** Head of Finance
- **Technical Owner:** Data Engineering Team

## Data Quality

**Quality Score:** 98.5/100

- **Completeness:** 99.8%
- **Freshness:** Last updated 0.5 hours ago
- **Duplicates:** 0 found

## Schema

**Row Count:** 1,250,000
**Columns:** 12

| Column | Type | Description | Nullable | Keys |
|--------|------|-------------|----------|------|
| order_id | VARCHAR | Unique identifier for each order | No | PK |
| customer_id | INTEGER | Reference to customer | No | FK |
| order_date | TIMESTAMP | Date/time order placed | No | - |
| total_amount | DECIMAL | Order total in USD | No | - |
| status | VARCHAR | Current fulfillment status | No | - |

## Use Cases

- Revenue reporting and forecasting
- Customer analytics and segmentation
- Product performance analysis
- Inventory planning

## Data Lineage

**Upstream Sources:**
- production.orders (Postgres) - real-time replication
- stripe_api - daily payment data sync

**Downstream Consumers:**
- Revenue Dashboard - Daily revenue monitoring
- customer_lifetime_value model - LTV prediction
- monthly_revenue_report - Board reporting

## Access & Governance

**Access Level:** RESTRICTED
**Sensitivity:** FINANCIAL
**Compliance:** SOX, GDPR

**Access Instructions:**
Request access via ServiceNow ticket. Requires manager approval.

**Approved Uses:**
- Financial reporting and analysis
- Product analytics
- Customer segmentation

**Restricted Uses:**
- Individual customer targeting without consent
- External sharing without legal review

---

*Last updated: 2025-01-11T15:30:00*
```

## Common Scenarios

### Scenario 1: "New table created, need catalog entry"
→ Extract technical metadata automatically
→ Interview table owner for business context
→ Document column definitions
→ Assess initial data quality
→ Publish to catalog

### Scenario 2: "Audit data catalog completeness"
→ List all tables in database
→ Identify tables missing catalog entries
→ Prioritize by usage/criticality
→ Create entries systematically
→ Set up automated updates

### Scenario 3: "Users can't find data they need"
→ Improve search with better descriptions
→ Add business-friendly names
→ Tag with relevant domains
→ Document common use cases
→ Link related datasets

### Scenario 4: "Compliance audit requires documentation"
→ Document all sensitive data
→ Add compliance tags
→ Record retention policies
→ Document access controls
→ Generate audit reports

### Scenario 5: "Onboarding new analysts"
→ Create guided tours of key datasets
→ Document how-to examples
→ Link to related resources
→ Provide sample queries
→ Set up training paths

## Handling Missing Context

**User only has table name:**
"I can extract technical metadata automatically. But I need your help with:
- What does this data represent?
- Who uses it and for what?
- Who owns it?
- Any special considerations?

5-minute conversation will make this 10x more useful."

**User unsure about quality metrics:**
"I can calculate basic quality (completeness, freshness, duplicates). Want me to add:
- Specific validation rules you know about?
- Known data quality issues?
- Acceptance criteria?

These help users trust the data."

**User doesn't know lineage:**
"Let's trace it together:
- Where does this data come from originally?
- What transformations happen?
- What downstream uses do you know about?

Document what we know now, add more later."

**User unclear on access policies:**
"Default to 'restricted' until we clarify:
- Does it contain PII or sensitive data?
- Are there compliance requirements?
- Who currently has access?

Better safe than accidentally exposing sensitive data."

## Advanced Options

After basic catalog entry, offer:

**Automated Metadata Extraction**:
"Set up pipeline to automatically refresh metadata nightly - keeps catalog current."

**Data Profiling**:
"Generate statistical profiles (distributions, correlations) for each column."

**Sample Data Preview**:
"Add interactive preview with sample rows (first 100) for quick exploration."

**Query Examples**:
"Include common SQL patterns for this table - helps users get started."

**Schema Change Tracking**:
"Alert when schema changes (columns added/removed/renamed)."

**Usage Analytics**:
"Track who queries this table and how often - identifies popular datasets."
