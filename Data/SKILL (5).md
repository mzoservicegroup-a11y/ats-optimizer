---
name: analysis-assumptions-log
description: Track and document analytical assumptions and decisions. Use when making analytical choices, documenting trade-offs, ensuring transparency, or creating audit trails for analytical work.
---

# Analysis Assumptions Log

## Quick Start

Systematically document all assumptions, decisions, and trade-offs made during analysis to ensure transparency, reproducibility, and informed decision-making.

## Context Requirements

Before logging assumptions, I need:

1. **Analysis Context**: What analysis is being performed
2. **Assumptions Made**: Explicit and implicit assumptions
3. **Decision Points**: Where choices were made
4. **Rationale**: Why each assumption/decision was made
5. **Impact Assessment**: What changes if assumption is wrong

## Context Gathering

### For Analysis Context:
"What analysis are we documenting assumptions for?

**Context needed:**
- Analysis objective
- Key stakeholders
- Decision being informed
- Time sensitivity
- Risk tolerance

Example: 'Customer churn prediction model for retention team. High stakes - informs $2M retention budget.'"

### For Assumptions:
"What assumptions are you making? Let's categorize:

**Data Assumptions:**
- Data quality/completeness
- Sample representativeness
- Missing value handling
- Outlier treatment

**Business Logic Assumptions:**
- Metric definitions
- Customer segmentation rules
- Time windows
- Causality vs correlation

**Statistical Assumptions:**
- Distribution assumptions
- Independence of observations
- Stationarity
- Model assumptions

**Technical Assumptions:**
- System performance
- Data freshness
- Processing limitations"

### For Decision Points:
"Where did you make consequential choices?

**Common Decision Points:**
- Which data to include/exclude
- How to handle edge cases
- Statistical methods chosen
- Threshold values set
- Segments defined
- Time periods selected

Document the **alternative you didn't choose** and why."

### For Rationale:
"Why did you make each assumption/decision?

**Good Rationales:**
- 'Industry standard approach'
- 'Previous analysis validated this'
- 'Stakeholder requirement'
- 'Data quality constraint'
- 'Computational limitation'
- 'Time constraint'

**Bad Rationales:**
- 'Seemed reasonable'
- 'Default setting'
- 'Always done this way'

Be honest and specific!"

### For Impact:
"What happens if assumption is wrong?

**Impact Assessment:**
- Best case if wrong
- Most likely case if wrong
- Worst case if wrong
- Probability of being wrong
- Cost to validate
- Cost if wrong

This helps prioritize which assumptions to validate."

## Workflow

### Step 1: Create Assumptions Log Structure

```python
import pandas as pd
from datetime import datetime
import json

class AssumptionLog:
    """
    Structured logging of analytical assumptions and decisions
    """
    
    def __init__(self, analysis_name, analyst):
        self.analysis_name = analysis_name
        self.analyst = analyst
        self.created_date = datetime.now()
        self.assumptions = []
        self.decisions = []
        self.validations = []
    
    def log_assumption(self, 
                      category,
                      assumption,
                      rationale,
                      confidence,
                      impact_if_wrong,
                      validation_plan=None):
        """
        Log a new assumption
        """
        
        entry = {
            'id': len(self.assumptions) + 1,
            'timestamp': datetime.now().isoformat(),
            'category': category,
            'assumption': assumption,
            'rationale': rationale,
            'confidence': confidence,  # high, medium, low
            'impact_if_wrong': impact_if_wrong,
            'validation_plan': validation_plan,
            'status': 'active',
            'validated': False
        }
        
        self.assumptions.append(entry)
        
        return entry['id']
    
    def log_decision(self,
                    decision_point,
                    chosen_option,
                    alternatives_considered,
                    rationale,
                    trade_offs):
        """
        Log an analytical decision
        """
        
        entry = {
            'id': len(self.decisions) + 1,
            'timestamp': datetime.now().isoformat(),
            'decision_point': decision_point,
            'chosen': chosen_option,
            'alternatives': alternatives_considered,
            'rationale': rationale,
            'trade_offs': trade_offs
        }
        
        self.decisions.append(entry)
        
        return entry['id']
    
    def validate_assumption(self, assumption_id, validation_result, notes):
        """
        Record validation of an assumption
        """
        
        # Find assumption
        assumption = next((a for a in self.assumptions if a['id'] == assumption_id), None)
        
        if assumption:
            assumption['validated'] = True
            assumption['validation_result'] = validation_result
            assumption['validation_notes'] = notes
            assumption['validation_date'] = datetime.now().isoformat()
            
            self.validations.append({
                'assumption_id': assumption_id,
                'result': validation_result,
                'date': datetime.now().isoformat(),
                'notes': notes
            })
    
    def get_critical_assumptions(self):
        """
        Identify high-impact, low-confidence assumptions
        """
        
        critical = [
            a for a in self.assumptions
            if a['confidence'] == 'low' and 
            a['impact_if_wrong'] in ['high', 'critical']
            and not a['validated']
        ]
        
        return critical
    
    def export_to_markdown(self):
        """
        Generate markdown documentation
        """
        
        doc = f"# Assumptions Log: {self.analysis_name}\n\n"
        doc += f"**Analyst:** {self.analyst}\n"
        doc += f"**Created:** {self.created_date.strftime('%Y-%m-%d')}\n"
        doc += f"**Last Updated:** {datetime.now().strftime('%Y-%m-%d')}\n\n"
        doc += "---\n\n"
        
        # Summary stats
        doc += "## Summary\n\n"
        doc += f"- Total Assumptions: {len(self.assumptions)}\n"
        doc += f"- Total Decisions: {len(self.decisions)}\n"
        
        validated = sum(1 for a in self.assumptions if a['validated'])
        doc += f"- Validated: {validated}/{len(self.assumptions)}\n"
        
        critical = len(self.get_critical_assumptions())
        if critical > 0:
            doc += f"- ⚠️  Critical Unvalidated: {critical}\n"
        
        doc += "\n---\n\n"
        
        # Assumptions
        doc += "## Assumptions\n\n"
        
        for category in ['data', 'business_logic', 'statistical', 'technical']:
            cat_assumptions = [a for a in self.assumptions if a['category'] == category]
            
            if cat_assumptions:
                doc += f"### {category.replace('_', ' ').title()}\n\n"
                
                for assum in cat_assumptions:
                    doc += f"**#{assum['id']}: {assum['assumption']}**\n\n"
                    doc += f"- **Rationale:** {assum['rationale']}\n"
                    doc += f"- **Confidence:** {assum['confidence'].upper()}\n"
                    doc += f"- **Impact if wrong:** {assum['impact_if_wrong']}\n"
                    
                    if assum['validated']:
                        doc += f"- **Validated:** ✅ {assum['validation_result']}\n"
                    else:
                        doc += f"- **Validated:** ❌ Not yet validated\n"
                    
                    if assum.get('validation_plan'):
                        doc += f"- **Validation plan:** {assum['validation_plan']}\n"
                    
                    doc += "\n"
        
        # Decisions
        doc += "## Key Decisions\n\n"
        
        for decision in self.decisions:
            doc += f"**Decision #{decision['id']}: {decision['decision_point']}**\n\n"
            doc += f"- **Chosen:** {decision['chosen']}\n"
            doc += f"- **Alternatives considered:**\n"
            for alt in decision['alternatives']:
                doc += f"  - {alt}\n"
            doc += f"- **Rationale:** {decision['rationale']}\n"
            doc += f"- **Trade-offs:** {decision['trade_offs']}\n\n"
        
        return doc
    
    def save(self, filepath):
        """
        Save log to file
        """
        
        data = {
            'analysis_name': self.analysis_name,
            'analyst': self.analyst,
            'created_date': self.created_date.isoformat(),
            'assumptions': self.assumptions,
            'decisions': self.decisions,
            'validations': self.validations
        }
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

# Initialize log
log = AssumptionLog(
    analysis_name="Customer Churn Prediction Model",
    analyst="Data Science Team"
)

print("✅ Assumptions log initialized")
```

### Step 2: Log Data Assumptions

```python
# Example: Log data-related assumptions

# Assumption 1: Sample representativeness
log.log_assumption(
    category='data',
    assumption='Last 90 days of data is representative of future behavior',
    rationale='90 days captures recent product changes and seasonal patterns',
    confidence='medium',
    impact_if_wrong='Model may not generalize to future periods. Could overfit to recent anomalies.',
    validation_plan='Test model on holdout data from different time period'
)

# Assumption 2: Missing data
log.log_assumption(
    category='data',
    assumption='Users with missing engagement data are inactive (not data quality issue)',
    rationale='Manual inspection of 100 samples confirmed pattern',
    confidence='high',
    impact_if_wrong='Would misclassify engaged users as inactive. Estimated <1% of users affected.',
    validation_plan='Spot check with product team on specific user IDs'
)

# Assumption 3: Churned definition
log.log_assumption(
    category='business_logic',
    assumption='User is "churned" if no activity for 30 days',
    rationale='Stakeholder requirement. Aligns with subscription billing cycle.',
    confidence='high',
    impact_if_wrong='Low - this is the business definition we must use',
    validation_plan='Not applicable - this is a requirement, not an assumption'
)

print(f"✅ Logged {len(log.assumptions)} assumptions")
```

### Step 3: Log Decision Points

```python
# Example: Log key decisions made during analysis

# Decision 1: Feature selection
log.log_decision(
    decision_point='Which features to include in churn model',
    chosen_option='Use all engagement features (sessions, events, feature usage)',
    alternatives_considered=[
        'Only core features (sessions, last active)',
        'Include demographic features (age, location)',
        'Add external data (economic indicators)'
    ],
    rationale='Engagement features most predictive in EDA. Demographics had privacy concerns. External data not readily available.',
    trade_offs='More features = more complexity. Risk of overfitting. But better predictive power.'
)

# Decision 2: Model choice
log.log_decision(
    decision_point='Which model algorithm to use',
    chosen_option='Gradient Boosting (XGBoost)',
    alternatives_considered=[
        'Logistic Regression (interpretable)',
        'Random Forest (robust)',
        'Neural Network (flexible)'
    ],
    rationale='XGBoost showed best performance in cross-validation (AUC 0.87 vs 0.82 for LR). Stakeholders prioritize accuracy over interpretability.',
    trade_offs='Less interpretable than logistic regression. Longer training time. But worth it for 5% accuracy gain.'
)

# Decision 3: Threshold setting
log.log_decision(
    decision_point='At what probability threshold to predict churn',
    chosen_option='0.35 probability threshold',
    alternatives_considered=[
        '0.5 (balanced)',
        '0.25 (more aggressive)',
        'Dynamic threshold by segment'
    ],
    rationale='Optimized for business cost function: $50 retention cost vs $500 churn cost. 0.35 maximizes expected value.',
    trade_offs='More false positives (wasted retention efforts) but catch more true churners. Net positive EV.'
)

print(f"✅ Logged {len(log.decisions)} decisions")
```

### Step 4: Identify Critical Assumptions

```python
# Find assumptions that need validation most urgently
critical = log.get_critical_assumptions()

if critical:
    print(f"\n⚠️  {len(critical)} CRITICAL ASSUMPTIONS NEED VALIDATION:\n")
    
    for assum in critical:
        print(f"#{assum['id']}: {assum['assumption']}")
        print(f"  Confidence: {assum['confidence']}")
        print(f"  Impact: {assum['impact_if_wrong']}")
        if assum['validation_plan']:
            print(f"  Plan: {assum['validation_plan']}")
        print()
else:
    print("✅ No critical unvalidated assumptions")
```

### Step 5: Validate Assumptions

```python
# As analysis progresses, validate assumptions

# Validate assumption #1
log.validate_assumption(
    assumption_id=1,
    validation_result='Confirmed',
    notes='Tested model on Nov 2024 data (outside training window). Performance held (AUC 0.86 vs 0.87 on training).'
)

# Validate assumption #2  
log.validate_assumption(
    assumption_id=2,
    validation_result='Partially confirmed',
    notes='Product team confirmed most missing data is true inactivity. Found 2% edge case of mobile users with tracking issues. Added filter to exclude.'
)

print("✅ Assumptions validated and logged")
```

### Step 6: Generate Risk Assessment

```python
def assess_assumption_risk(log):
    """
    Quantify overall risk from assumptions
    """
    
    risk_scores = {
        ('high', 'critical'): 9,
        ('high', 'high'): 8,
        ('high', 'medium'): 6,
        ('medium', 'critical'): 7,
        ('medium', 'high'): 6,
        ('medium', 'medium'): 4,
        ('low', 'critical'): 5,
        ('low', 'high'): 4,
        ('low', 'medium'): 2
    }
    
    total_risk = 0
    risk_breakdown = []
    
    for assum in log.assumptions:
        if not assum['validated']:
            # Parse confidence and impact
            conf = assum['confidence']
            
            # Parse impact (extract first word)
            impact = assum['impact_if_wrong'].split()[0].lower()
            if 'high' in impact or 'severe' in impact or 'critical' in impact:
                impact_level = 'high'
            elif 'medium' in impact or 'moderate' in impact:
                impact_level = 'medium'
            else:
                impact_level = 'medium'  # default
            
            # Calculate risk
            risk = risk_scores.get((conf, impact_level), 3)
            total_risk += risk
            
            risk_breakdown.append({
                'assumption_id': assum['id'],
                'assumption': assum['assumption'][:50] + '...',
                'risk_score': risk,
                'confidence': conf,
                'impact': impact_level
            })
    
    # Overall risk assessment
    avg_risk = total_risk / len(log.assumptions) if log.assumptions else 0
    
    print(f"\n📊 Risk Assessment:")
    print(f"  Total Risk Score: {total_risk}")
    print(f"  Average per Assumption: {avg_risk:.1f}")
    
    if avg_risk < 3:
        print(f"  Overall Risk: ✅ LOW")
    elif avg_risk < 6:
        print(f"  Overall Risk: ⚠️  MEDIUM")
    else:
        print(f"  Overall Risk: 🔴 HIGH")
    
    # Top risks
    print(f"\n  Top Risk Contributors:")
    for item in sorted(risk_breakdown, key=lambda x: x['risk_score'], reverse=True)[:3]:
        print(f"    #{item['assumption_id']}: {item['assumption']} (score: {item['risk_score']})")
    
    return total_risk, avg_risk, risk_breakdown

risk_total, risk_avg, risk_details = assess_assumption_risk(log)
```

### Step 7: Generate Documentation

```python
# Export complete assumptions log

# Markdown format
markdown_doc = log.export_to_markdown()

# Save to file
with open('assumptions_log.md', 'w') as f:
    f.write(markdown_doc)

# Also save structured data
log.save('assumptions_log.json')

print("\n✅ Documentation generated:")
print("   📄 assumptions_log.md")
print("   📄 assumptions_log.json")

# Print summary section
print("\n" + "="*60)
print(markdown_doc.split('---')[0])  # Print summary section
```

### Step 8: Create Assumption Review Checklist

```python
def generate_review_checklist(log):
    """
    Create checklist for peer review
    """
    
    checklist = []
    
    # Check for missing categories
    categories_found = set(a['category'] for a in log.assumptions)
    expected_categories = ['data', 'business_logic', 'statistical', 'technical']
    
    missing = set(expected_categories) - categories_found
    if missing:
        checklist.append({
            'type': 'missing_category',
            'item': f'No {", ".join(missing)} assumptions documented',
            'action': 'Review if any assumptions in these categories exist'
        })
    
    # Check for low confidence, high impact assumptions
    critical = log.get_critical_assumptions()
    if critical:
        for assum in critical:
            checklist.append({
                'type': 'critical_unvalidated',
                'item': f'Assumption #{assum["id"]} not validated',
                'action': f'Validate: {assum["assumption"][:50]}'
            })
    
    # Check for vague rationales
    vague_keywords = ['reasonable', 'standard', 'typical', 'usually']
    for assum in log.assumptions:
        rationale_lower = assum['rationale'].lower()
        if any(word in rationale_lower for word in vague_keywords):
            checklist.append({
                'type': 'vague_rationale',
                'item': f'Assumption #{assum["id"]} has vague rationale',
                'action': 'Provide more specific justification'
            })
    
    # Check validation status
    unvalidated_pct = (len([a for a in log.assumptions if not a['validated']]) / 
                      len(log.assumptions) * 100) if log.assumptions else 0
    
    if unvalidated_pct > 50:
        checklist.append({
            'type': 'low_validation',
            'item': f'{unvalidated_pct:.0f}% of assumptions unvalidated',
            'action': 'Prioritize validation before finalizing analysis'
        })
    
    # Print checklist
    if checklist:
        print("\n📋 Review Checklist:")
        for i, item in enumerate(checklist, 1):
            print(f"\n{i}. {item['item']}")
            print(f"   Action: {item['action']}")
    else:
        print("\n✅ All checks passed!")
    
    return checklist

review_items = generate_review_checklist(log)
```

## Context Validation

Before finalizing assumptions log, verify:
- [ ] All major assumption categories covered
- [ ] Rationales are specific and defensible
- [ ] Impact assessments are realistic
- [ ] Critical assumptions have validation plans
- [ ] Decisions document alternatives considered
- [ ] Log is peer-reviewed

## Output Template

```
# Assumptions Log: Customer Churn Prediction Model

**Analyst:** Data Science Team
**Created:** 2025-01-11
**Last Updated:** 2025-01-11

---

## Summary

- Total Assumptions: 8
- Total Decisions: 3
- Validated: 6/8
- ⚠️  Critical Unvalidated: 1

---

## Assumptions

### Data

**#1: Last 90 days of data is representative**

- **Rationale:** Captures recent product changes and seasonal patterns
- **Confidence:** MEDIUM
- **Impact if wrong:** Model may not generalize to future periods
- **Validated:** ✅ Confirmed - tested on holdout period
- **Validation plan:** Test on data from different time period

**#2: Missing engagement data indicates inactivity**

- **Rationale:** Manual inspection of 100 samples confirmed
- **Confidence:** HIGH
- **Impact if wrong:** Would misclassify 1% of users
- **Validated:** ✅ Partially confirmed - added filter for edge cases
- **Validation plan:** Spot check with product team

### Business Logic

**#3: Churned = no activity for 30 days**

- **Rationale:** Stakeholder requirement, aligns with billing
- **Confidence:** HIGH
- **Impact if wrong:** Low - this is required definition
- **Validated:** ✅ Confirmed by stakeholders

### Statistical

**#4: Features are independent**

- **Rationale:** Checked correlation matrix, max correlation 0.45
- **Confidence:** MEDIUM
- **Impact if wrong:** Model may over-weight correlated features
- **Validated:** ❌ Not yet validated
- **Validation plan:** Test with PCA to see if performance changes

---

## Key Decisions

**Decision #1: Feature selection**

- **Chosen:** All engagement features
- **Alternatives considered:**
  - Only core features
  - Include demographics
  - Add external data
- **Rationale:** Engagement most predictive. Privacy concerns with demographics.
- **Trade-offs:** More complexity but better accuracy

**Decision #2: Model algorithm**

- **Chosen:** XGBoost
- **Alternatives considered:**
  - Logistic Regression
  - Random Forest
  - Neural Network
- **Rationale:** Best cross-validation performance (AUC 0.87)
- **Trade-offs:** Less interpretable but 5% accuracy gain

---

## Risk Assessment

Total Risk Score: 24
Overall Risk: ⚠️  MEDIUM

Top Risks:
1. #4: Features independence assumption (score: 7)
2. #5: Stationarity assumption (score: 6)

---

## Validation Status

✅ 75% validated (6/8)
⚠️  1 critical assumption pending validation
📅 Next review: Before model deployment
```

## Common Scenarios

### Scenario 1: "Starting new analysis - set up assumptions tracking"
→ Initialize assumption log
→ Document initial hypotheses
→ Set up validation framework
→ Share with stakeholders
→ Update as analysis progresses

### Scenario 2: "Peer review of analysis"
→ Review assumptions log
→ Challenge vague rationales
→ Identify missing assumptions
→ Validate critical assumptions
→ Sign off on log

### Scenario 3: "Analysis results unexpected"
→ Review assumptions
→ Identify which might be wrong
→ Validate suspicious assumptions
→ Update analysis if needed
→ Document learnings

### Scenario 4: "Regulatory/audit requirement"
→ Generate complete audit trail
→ Document all decisions
→ Show validation evidence
→ Demonstrate rigor
→ Maintain records

### Scenario 5: "Replicating analysis later"
→ Reference original assumptions
→ Check if still valid
→ Update for new context
→ Compare results
→ Document differences

## Handling Missing Context

**User hasn't thought about assumptions:**
"Let me help identify assumptions you might be making:
- Data: Is your sample representative?
- Business: How are you defining key concepts?
- Statistical: What distributions are you assuming?
- Technical: Any system limitations?

Let's walk through systematically."

**User says 'no assumptions made':**
"Every analysis has assumptions! Some common ones:
- Your data is complete and accurate
- Past patterns predict future
- Your sample represents the population
- Correlation implies something meaningful

Let's make them explicit."

**User only lists obvious assumptions:**
"Good start! Let's also document:
- The choices you made (why this method vs others?)
- Edge cases you're handling
- What you're NOT including
- Time/resource constraints

These are assumptions too!"

**User unsure about confidence levels:**
"Let's assess:
- Have you validated it? (High confidence)
- Based on domain knowledge? (Medium)
- Just seems reasonable? (Low)

Being honest helps prioritize validation."

## Advanced Options

After basic log, offer:

**Automated Assumption Detection**:
"I can scan your code/queries to identify implicit assumptions you might have missed."

**Assumption Testing Framework**:
"Set up automated tests that alert when assumptions become invalid (e.g., data distribution shifts)."

**Sensitivity Analysis**:
"Quantify how much results change if each assumption is violated."

**Assumption Dependencies**:
"Map which assumptions depend on others - helps understand cascading risks."

**Historical Assumption Tracking**:
"Track assumptions across multiple analyses to identify patterns and improve future work."

**Assumption Review Templates**:
"Create templates for peer review focused on assumption validation."
