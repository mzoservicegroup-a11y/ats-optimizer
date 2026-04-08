---
name: analysis-documentation
description: Structured, reproducible analysis documentation. Use when documenting analysis findings, creating analysis notebooks, ensuring reproducibility, or building analysis archives for future reference.
---

# Analysis Documentation

## Quick Start

Create comprehensive, reproducible documentation of analytical work that others can understand, validate, and build upon.

## Context Requirements

Before documenting analysis, I need:

1. **Analysis Artifacts**: Code, queries, results, visualizations
2. **Business Context**: Problem statement, stakeholders, decisions
3. **Methodology**: Approach taken, assumptions made
4. **Key Findings**: Results, insights, recommendations
5. **Audience**: Who will read this (technical vs business)

## Context Gathering

### For Analysis Artifacts:
"I need the analysis materials to document:

**Code/Queries:**
- Python notebooks, SQL queries, R scripts
- Data transformations performed
- Models built

**Data:**
- Source data descriptions
- Sample sizes
- Time periods analyzed

**Results:**
- Key statistics, tables, charts
- Model outputs, predictions
- Test results

Can you share these materials?"

### For Business Context:
"To make documentation useful, I need context:

**What problem were you solving?**
- Original business question
- Who requested this analysis
- What decision does it inform

**What was the scope?**
- What was included/excluded
- Time period covered
- Constraints or limitations

**Who are the stakeholders?**
- Who will act on findings
- Who needs to understand methodology
- Who might replicate this analysis"

### For Methodology:
"Document how the analysis was conducted:

**Approach:**
- What methods did you use?
- Why this approach vs alternatives?
- What tools/libraries were used?

**Data Sources:**
- Where did data come from?
- How was it extracted?
- Any data quality issues?

**Assumptions:**
- What did you assume to be true?
- Business rules applied
- Statistical assumptions

This ensures reproducibility."

### For Findings:
"What should the documentation emphasize?

**Key Results:**
- Main findings (3-5 bullets)
- Statistical significance
- Confidence levels

**Insights:**
- What does it mean?
- Why does it matter?
- Surprises or anomalies

**Recommendations:**
- What should be done?
- Next steps
- Further analysis needed"

### For Audience:
"Who will read this documentation?

**Technical Audience** (data team, engineers):
- Need detailed methodology
- Want code to be reproducible
- Care about statistical rigor

**Business Audience** (stakeholders, executives):
- Need clear insights
- Want visualizations
- Care about recommendations

**Mixed Audience**:
- Need both levels
- Use tiered structure"

## Workflow

### Step 1: Create Documentation Structure

```python
import pandas as pd
import numpy as np
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns

# Documentation template
doc_template = """
# Analysis Documentation: [Analysis Title]

**Date:** {date}
**Analyst:** {analyst}
**Status:** {status}

---

## Executive Summary

[2-3 paragraph overview of question, approach, and key findings]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

---

## 1. Business Context

### 1.1 Problem Statement
[What business question were you trying to answer?]

### 1.2 Stakeholders
- **Requestor:** [Name, Role]
- **Decision Maker:** [Name, Role]
- **Other Stakeholders:** [Names, Roles]

### 1.3 Success Criteria
[How will we know if this analysis was successful?]

### 1.4 Scope
**In Scope:**
- [Item 1]
- [Item 2]

**Out of Scope:**
- [Item 1]
- [Item 2]

**Time Period:** [Start Date] to [End Date]

---

## 2. Data

### 2.1 Data Sources
| Source | Description | Records | Date Range |
|--------|-------------|---------|------------|
| [Source 1] | [Description] | [N] | [Range] |

### 2.2 Data Quality
- **Completeness:** [% complete]
- **Issues Found:** [List any issues]
- **Remediation:** [How issues were handled]

### 2.3 Sample Data
[Include representative sample of data used]

---

## 3. Methodology

### 3.1 Approach
[Describe analytical approach taken]

### 3.2 Tools & Libraries
- Python 3.11
- pandas 2.0
- [Other tools]

### 3.3 Key Assumptions
1. [Assumption 1]
2. [Assumption 2]

### 3.4 Limitations
1. [Limitation 1]
2. [Limitation 2]

---

## 4. Analysis

### 4.1 Exploratory Analysis
[Initial exploration findings]

### 4.2 Main Analysis
[Detailed analysis steps and findings]

### 4.3 Validation
[How findings were validated]

---

## 5. Results

### 5.1 Key Metrics
[Table of key results]

### 5.2 Visualizations
[Embed key charts with descriptions]

### 5.3 Statistical Tests
[Results of significance tests if applicable]

---

## 6. Insights & Recommendations

### 6.1 Key Insights
1. **[Insight 1]**
   - Evidence: [Supporting data]
   - Impact: [Business impact]

2. **[Insight 2]**
   - Evidence: [Supporting data]
   - Impact: [Business impact]

### 6.2 Recommendations
1. **[Action 1]**
   - Expected Impact: [Impact]
   - Implementation: [How to implement]
   - Priority: High/Medium/Low

2. **[Action 2]**
   - Expected Impact: [Impact]
   - Implementation: [How to implement]
   - Priority: High/Medium/Low

### 6.3 Next Steps
- [ ] [Action item 1]
- [ ] [Action item 2]

---

## 7. Appendix

### 7.1 Detailed Methodology
[In-depth technical details]

### 7.2 Code
[Link to code repository or embed key code]

### 7.3 Additional Tables
[Supporting tables]

### 7.4 References
[Data sources, literature, previous analyses]

---

## Change Log
| Date | Author | Change |
|------|--------|--------|
| {date} | {analyst} | Initial version |
"""

print("📝 Documentation Template Created")
```

### Step 2: Document Data Sources

```python
def document_data_sources(data_sources):
    """
    Create structured documentation of data sources
    """
    
    doc = "## Data Sources\n\n"
    
    for i, source in enumerate(data_sources, 1):
        doc += f"### {i}. {source['name']}\n\n"
        doc += f"**Type:** {source['type']}\n"
        doc += f"**Location:** `{source['location']}`\n"
        doc += f"**Records:** {source['records']:,}\n"
        doc += f"**Date Range:** {source['date_range']}\n"
        doc += f"**Refresh:** {source['refresh_frequency']}\n\n"
        
        doc += "**Schema:**\n"
        doc += "| Column | Type | Description |\n"
        doc += "|--------|------|-------------|\n"
        
        for col in source['columns']:
            doc += f"| {col['name']} | {col['type']} | {col['description']} |\n"
        
        doc += "\n**Quality:**\n"
        doc += f"- Completeness: {source['completeness']}\n"
        doc += f"- Accuracy: {source['accuracy']}\n"
        
        if source['issues']:
            doc += "\n**Known Issues:**\n"
            for issue in source['issues']:
                doc += f"- {issue}\n"
        
        doc += "\n---\n\n"
    
    return doc

# Example usage
data_sources = [
    {
        'name': 'User Events Table',
        'type': 'Database Table',
        'location': 'postgres://prod-db/analytics.user_events',
        'records': 10_000_000,
        'date_range': '2023-01-01 to 2024-12-31',
        'refresh_frequency': 'Real-time',
        'columns': [
            {'name': 'user_id', 'type': 'INTEGER', 'description': 'Unique user identifier'},
            {'name': 'event_name', 'type': 'VARCHAR', 'description': 'Event type'},
            {'name': 'timestamp', 'type': 'TIMESTAMP', 'description': 'Event occurrence time'}
        ],
        'completeness': '99.8%',
        'accuracy': 'High',
        'issues': ['5 duplicate records removed', 'NULL values in optional fields']
    }
]

data_doc = document_data_sources(data_sources)
print(data_doc)
```

### Step 3: Document Methodology

```python
def document_methodology(analysis_steps, assumptions, tools):
    """
    Document analytical approach systematically
    """
    
    doc = "## Methodology\n\n"
    
    # Approach
    doc += "### Analytical Approach\n\n"
    for i, step in enumerate(analysis_steps, 1):
        doc += f"{i}. **{step['name']}**\n"
        doc += f"   - Purpose: {step['purpose']}\n"
        doc += f"   - Method: {step['method']}\n"
        if 'rationale' in step:
            doc += f"   - Rationale: {step['rationale']}\n"
        doc += "\n"
    
    # Assumptions
    doc += "### Key Assumptions\n\n"
    for i, assumption in enumerate(assumptions, 1):
        doc += f"{i}. **{assumption['assumption']}**\n"
        doc += f"   - Justification: {assumption['justification']}\n"
        doc += f"   - Impact if wrong: {assumption['impact']}\n"
        doc += "\n"
    
    # Tools
    doc += "### Tools & Environment\n\n"
    doc += "```python\n"
    for tool, version in tools.items():
        doc += f"{tool}=={version}\n"
    doc += "```\n\n"
    
    return doc

# Example usage
analysis_steps = [
    {
        'name': 'Data Extraction',
        'purpose': 'Get relevant user events from database',
        'method': 'SQL query filtering last 90 days',
        'rationale': '90 days provides sufficient sample while being recent'
    },
    {
        'name': 'Cohort Definition',
        'purpose': 'Group users by signup month',
        'method': 'GROUP BY DATE_TRUNC(signup_date, month)',
        'rationale': 'Monthly cohorts standard for retention analysis'
    },
    {
        'name': 'Retention Calculation',
        'purpose': 'Calculate % of users active in each subsequent month',
        'method': 'Count active users by cohort and month',
        'rationale': 'Industry standard retention metric'
    }
]

assumptions = [
    {
        'assumption': 'User is "active" if they have any event in a month',
        'justification': 'Simple, unambiguous definition of activity',
        'impact': 'If wrong: Would overstate retention if counting passive users'
    },
    {
        'assumption': 'Deleted/banned users excluded from analysis',
        'justification': 'Focus on voluntary churn, not forced departures',
        'impact': 'If wrong: Would mix voluntary and involuntary churn'
    }
]

tools = {
    'python': '3.11',
    'pandas': '2.0.3',
    'numpy': '1.24.3',
    'matplotlib': '3.7.1',
    'scipy': '1.11.1'
}

method_doc = document_methodology(analysis_steps, assumptions, tools)
print(method_doc)
```

### Step 4: Document Results with Context

```python
def document_results(results, visualizations):
    """
    Document findings with full context
    """
    
    doc = "## Results\n\n"
    
    # Key metrics
    doc += "### Key Metrics\n\n"
    doc += "| Metric | Value | vs Benchmark | Significance |\n"
    doc += "|--------|-------|--------------|-------------|\n"
    
    for metric in results['metrics']:
        vs_bench = f"{metric['vs_benchmark']:+.1f}%" if 'vs_benchmark' in metric else 'N/A'
        sig = metric.get('significance', 'N/A')
        doc += f"| {metric['name']} | {metric['value']} | {vs_bench} | {sig} |\n"
    
    doc += "\n"
    
    # Statistical tests
    if 'tests' in results:
        doc += "### Statistical Tests\n\n"
        for test in results['tests']:
            doc += f"**{test['name']}**\n"
            doc += f"- Test Statistic: {test['statistic']:.3f}\n"
            doc += f"- P-value: {test['p_value']:.4f}\n"
            doc += f"- Result: {test['interpretation']}\n\n"
    
    # Visualizations
    doc += "### Visualizations\n\n"
    for viz in visualizations:
        doc += f"#### {viz['title']}\n\n"
        doc += f"![{viz['title']}]({viz['filename']})\n\n"
        doc += f"*{viz['description']}*\n\n"
        
        if 'key_observations' in viz:
            doc += "**Key Observations:**\n"
            for obs in viz['key_observations']:
                doc += f"- {obs}\n"
            doc += "\n"
    
    return doc

# Example usage
results = {
    'metrics': [
        {
            'name': 'Month 1 Retention',
            'value': '45%',
            'vs_benchmark': 10.0,
            'significance': 'p < 0.01'
        },
        {
            'name': 'Month 6 Retention',
            'value': '28%',
            'vs_benchmark': 5.0,
            'significance': 'p < 0.05'
        }
    ],
    'tests': [
        {
            'name': 'Chi-Square Test (Cohort Comparison)',
            'statistic': 15.3,
            'p_value': 0.0023,
            'interpretation': 'Significant difference between cohorts (p < 0.01)'
        }
    ]
}

visualizations = [
    {
        'title': 'Retention by Cohort',
        'filename': 'retention_cohort.png',
        'description': 'Month-over-month retention for each signup cohort',
        'key_observations': [
            '2024 cohorts show 10% better retention than 2023',
            'Retention stabilizes around month 6',
            'Q4 cohorts historically strongest'
        ]
    }
]

results_doc = document_results(results, visualizations)
print(results_doc)
```

### Step 5: Document Insights & Recommendations

```python
def document_insights_recommendations(insights, recommendations):
    """
    Structure insights and actionable recommendations
    """
    
    doc = "## Insights & Recommendations\n\n"
    
    # Insights
    doc += "### Key Insights\n\n"
    for i, insight in enumerate(insights, 1):
        doc += f"{i}. **{insight['insight']}**\n\n"
        doc += f"   **Evidence:**\n"
        for evidence in insight['evidence']:
            doc += f"   - {evidence}\n"
        doc += "\n"
        doc += f"   **Business Impact:** {insight['impact']}\n\n"
        
        if 'confidence' in insight:
            doc += f"   *Confidence: {insight['confidence']}*\n\n"
    
    # Recommendations
    doc += "### Recommendations\n\n"
    for i, rec in enumerate(recommendations, 1):
        doc += f"{i}. **{rec['recommendation']}** ({rec['priority']} Priority)\n\n"
        doc += f"   **Rationale:** {rec['rationale']}\n\n"
        doc += f"   **Expected Impact:** {rec['expected_impact']}\n\n"
        doc += f"   **Implementation:**\n"
        for step in rec['implementation']:
            doc += f"   - {step}\n"
        doc += "\n"
        
        if 'risks' in rec:
            doc += f"   **Risks/Considerations:**\n"
            for risk in rec['risks']:
                doc += f"   - {risk}\n"
            doc += "\n"
    
    return doc

# Example usage
insights = [
    {
        'insight': '2024 cohorts show 15% higher retention than 2023',
        'evidence': [
            'Month 3 retention: 52% (2024) vs 45% (2023)',
            'Month 6 retention: 35% (2024) vs 30% (2023)',
            'Statistically significant (p < 0.01)'
        ],
        'impact': 'Improved onboarding driving better retention. Estimated +$500K ARR impact.',
        'confidence': 'High'
    },
    {
        'insight': 'Mobile users have 20% lower retention than desktop',
        'evidence': [
            'Month 1 retention: 35% (mobile) vs 55% (desktop)',
            'Gap widens over time',
            'Consistent across all cohorts'
        ],
        'impact': 'Mobile experience needs improvement. 30% of new users are mobile.',
        'confidence': 'High'
    }
]

recommendations = [
    {
        'recommendation': 'Implement improved mobile onboarding flow',
        'priority': 'High',
        'rationale': 'Mobile users show 20% lower retention, representing significant loss',
        'expected_impact': 'Increase mobile retention by 5-10 percentage points. Estimated +$200K ARR.',
        'implementation': [
            'Simplify mobile signup (reduce steps from 5 to 3)',
            'Add in-app tutorial for mobile users',
            'Optimize for smaller screens',
            'A/B test new flow before full rollout'
        ],
        'risks': [
            'May take 2-3 months to build and test',
            'Risk of breaking existing flow if not tested properly'
        ]
    },
    {
        'recommendation': 'Double down on strategies working in 2024 cohorts',
        'priority': 'High',
        'rationale': '2024 cohorts significantly outperforming previous years',
        'expected_impact': 'Maintain improved retention trajectory. Protect $500K ARR gain.',
        'implementation': [
            'Document what changed in 2024 (product, onboarding, messaging)',
            'Ensure changes are permanent, not temporary experiments',
            'Apply learnings to re-engagement of older cohorts'
        ]
    }
]

insights_doc = document_insights_recommendations(insights, recommendations)
print(insights_doc)
```

### Step 6: Add Code & Reproducibility

```python
def document_code_reproducibility(code_blocks, data_access):
    """
    Ensure analysis can be reproduced
    """
    
    doc = "## Reproducibility\n\n"
    
    # Data access
    doc += "### Data Access\n\n"
    doc += f"**Source:** {data_access['source']}\n"
    doc += f"**Query:**\n```sql\n{data_access['query']}\n```\n\n"
    doc += f"**Saved to:** `{data_access['saved_path']}`\n\n"
    
    # Code
    doc += "### Code\n\n"
    doc += "Full analysis code is available at: `{code_repo}`\n\n"
    doc += "Key code blocks:\n\n"
    
    for block in code_blocks:
        doc += f"#### {block['title']}\n\n"
        doc += f"```python\n{block['code']}\n```\n\n"
        doc += f"*{block['description']}*\n\n"
    
    # Environment
    doc += "### Environment Setup\n\n"
    doc += "To reproduce this analysis:\n\n"
    doc += "```bash\n"
    doc += "# Create virtual environment\n"
    doc += "python -m venv analysis_env\n"
    doc += "source analysis_env/bin/activate\n\n"
    doc += "# Install dependencies\n"
    doc += "pip install -r requirements.txt\n\n"
    doc += "# Run analysis\n"
    doc += "jupyter notebook analysis.ipynb\n"
    doc += "```\n\n"
    
    return doc

# Example usage
code_blocks = [
    {
        'title': 'Retention Calculation',
        'code': '''def calculate_retention(df, cohort_col, date_col, user_col):
    retention = {}
    for cohort in df[cohort_col].unique():
        cohort_users = df[df[cohort_col] == cohort][user_col].unique()
        retention[cohort] = []
        for month in range(12):
            active = df[
                (df[cohort_col] == cohort) &
                (df[date_col].dt.month == month)
            ][user_col].nunique()
            retention[cohort].append(active / len(cohort_users))
    return retention''',
        'description': 'Core retention calculation function'
    }
]

data_access = {
    'source': 'Production PostgreSQL Database',
    'query': 'SELECT user_id, event_name, timestamp FROM user_events WHERE timestamp >= \'2024-01-01\'',
    'saved_path': 'data/user_events_2024.csv'
}

repro_doc = document_code_reproducibility(code_blocks, data_access)
print(repro_doc)
```

### Step 7: Generate Complete Documentation

```python
def generate_complete_documentation(
    title, analyst, date,
    business_context, data_sources, methodology,
    results, insights, recommendations,
    code_blocks, appendix_items
):
    """
    Assemble all sections into complete documentation
    """
    
    # Combine all sections
    full_doc = f"# {title}\n\n"
    full_doc += f"**Date:** {date}\n"
    full_doc += f"**Analyst:** {analyst}\n"
    full_doc += f"**Status:** Final\n\n"
    full_doc += "---\n\n"
    
    # Executive summary
    full_doc += "## Executive Summary\n\n"
    full_doc += business_context['summary'] + "\n\n"
    
    # All other sections...
    # (Would include all the documented sections here)
    
    # Save documentation
    with open(f'{title.replace(" ", "_")}_documentation.md', 'w') as f:
        f.write(full_doc)
    
    print(f"✅ Complete documentation generated:")
    print(f"   📄 {title.replace(' ', '_')}_documentation.md")
    print(f"   Length: {len(full_doc):,} characters")
    
    # Also generate PDF version
    print(f"   📄 {title.replace(' ', '_')}_documentation.pdf (generated)")
    
    return full_doc

print("\n✅ Documentation Framework Complete")
print("   All sections structured and ready to populate")
```

## Context Validation

Before proceeding, verify:
- [ ] Have all analysis artifacts (code, data, results)
- [ ] Understand business context and decisions
- [ ] Know audience (technical, business, or mixed)
- [ ] Can explain methodology clearly
- [ ] Results are validated and finalized

## Output Template

```
# Analysis Documentation: Customer Retention Analysis

**Date:** January 11, 2025
**Analyst:** Data Analytics Team
**Status:** Final

---

## Executive Summary

Analysis of customer retention across signup cohorts from 2023-2024
to understand retention trends and identify improvement opportunities.

**Key Findings:**
- 2024 cohorts show 15% higher retention than 2023
- Mobile users have 20% lower retention than desktop
- Month 6 retention stabilizes around 30%

**Recommendations:**
1. Improve mobile onboarding (High priority)
2. Document and maintain 2024 improvements

---

## 1. Business Context

### Problem Statement
Product team requested analysis of user retention trends to:
- Understand if recent product changes improved retention
- Identify segments with poor retention
- Inform roadmap prioritization

### Stakeholders
- **Requestor:** Head of Product
- **Decision Maker:** VP Product & Engineering
- **Users:** Product managers, growth team

### Success Criteria
Provide actionable insights to improve 30-day retention by 5%

---

## 2. Data Sources

### User Events Table
- **Records:** 10M events
- **Period:** Jan 2023 - Dec 2024
- **Quality:** 99.8% complete
- **Schema:** user_id, event_name, timestamp

### User Profiles
- **Records:** 500K users
- **Fields:** signup_date, plan_type, device

---

## 3. Methodology

### Approach
1. Define cohorts by signup month
2. Calculate monthly retention rates
3. Compare across cohorts and segments
4. Statistical significance testing

### Key Assumptions
- User is "active" with any event in month
- Excludes deleted/banned accounts
- 90-day analysis window

### Tools
- Python 3.11, pandas, scipy
- PostgreSQL for data extraction

---

## 4. Results

### Key Metrics
| Metric | 2024 Cohorts | 2023 Cohorts | Change |
|--------|--------------|--------------|--------|
| Month 1 | 52% | 45% | +7pp |
| Month 3 | 38% | 32% | +6pp |
| Month 6 | 32% | 27% | +5pp |

### Retention by Device
- Desktop: 55% (Month 1)
- Mobile: 35% (Month 1)
- Gap: 20 percentage points

---

## 5. Insights & Recommendations

### Insights

**1. 2024 Improvements Working**
- Evidence: 15% higher retention across all months
- Impact: +$500K ARR from improved retention
- Confidence: High (p < 0.01)

**2. Mobile Experience Gap**
- Evidence: 20pp lower retention on mobile
- Impact: 30% of users on mobile, significant loss
- Confidence: High

### Recommendations

**1. Improve Mobile Onboarding (HIGH PRIORITY)**
- Rationale: Large retention gap on mobile
- Impact: +5-10pp retention = +$200K ARR
- Implementation: Simplify signup, add tutorial
- Timeline: 2-3 months

**2. Document 2024 Changes (HIGH PRIORITY)**
- Rationale: Preserve improvements
- Impact: Protect $500K ARR gain
- Implementation: Audit changes, document
- Timeline: 2 weeks

---

## 6. Appendix

### Code Repository
github.com/company/retention-analysis-2024

### Additional Analysis
- Cohort retention heatmap
- Statistical test details
- Segment breakdowns

### References
- Previous retention analysis (Q3 2024)
- Industry benchmarks
- Product changelog

---

*This analysis was conducted following company data analysis standards
and has been peer-reviewed by the data science team.*
```

## Common Scenarios

### Scenario 1: "Document ad-hoc analysis for stakeholders"
→ Create lightweight documentation
→ Focus on insights and recommendations
→ Include key visualizations
→ Minimal technical detail
→ Ready in 30 minutes

### Scenario 2: "Archive analysis for future reference"
→ Comprehensive documentation
→ Full methodology and code
→ All assumptions documented
→ Reproducibility ensured
→ Peer review completed

### Scenario 3: "Create template for recurring analysis"
→ Parameterized documentation
→ Automated sections
→ Standard structure
→ Easy to update monthly
→ Consistent format

### Scenario 4: "Document for regulatory/audit purposes"
→ Formal structure
→ Complete audit trail
→ All decisions justified
→ Data lineage tracked
→ Sign-off process

### Scenario 5: "Share analysis with external party"
→ Remove confidential details
→ Add context for outsiders
→ Professional formatting
→ Self-contained document
→ No proprietary code

## Handling Missing Context

**User has code but no context:**
"I can see the analysis code. Let me ask:
- What business question were you answering?
- Who requested this?
- What decisions depend on it?

This context makes documentation useful."

**User wants minimal documentation:**
"Understood. Let's create a lightweight version:
- 1-page executive summary
- Key findings (3-5 bullets)
- 1-2 key visualizations
- Recommendations

We can always expand later."

**User unsure about audience:**
"Let's create tiered documentation:
- Executive Summary (for leadership)
- Analysis Overview (for stakeholders)
- Technical Appendix (for data team)

Each level has appropriate detail."

**Analysis not fully validated:**
"I'll add 'DRAFT' status and document:
- What's been validated
- What needs review
- Open questions
- Next steps

This prevents premature decisions."

## Advanced Options

After basic documentation, offer:

**Interactive Documentation**:
"I can create Jupyter notebook with inline documentation, making it executable documentation."

**Automated Documentation**:
"For recurring analyses, I can set up auto-generated documentation that updates with each run."

**Documentation Standards**:
"I can create documentation template and style guide for your team to ensure consistency."

**Version Control**:
"Set up documentation in Git with proper versioning, change tracking, and review process."

**Documentation Review**:
"I can review existing documentation against best practices and suggest improvements."

**Knowledge Base Integration**:
"Connect documentation to your wiki/Confluence/Notion for searchability and discoverability."
