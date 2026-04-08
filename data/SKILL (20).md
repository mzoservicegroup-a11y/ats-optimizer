---
name: insight-synthesis
description: Transform data findings into compelling insights. Use when converting analysis results into actionable insights, connecting findings to business impact, or preparing insights for stakeholder communication.
---

# Insight Synthesis

## Quick Start

Convert raw analysis findings into clear, actionable insights that drive business decisions by connecting data patterns to business impact.

## Context Requirements

1. **Analysis Findings**: Raw results, statistics, patterns discovered
2. **Business Context**: What the business cares about, current priorities
3. **Audience**: Who needs these insights and what they'll do with them
4. **Decision Framework**: What decisions these insights should inform
5. **Constraints**: Limitations, caveats, confidence levels

## Context Gathering

### For Findings:
"Share your analysis results:
- Key statistics and metrics
- Patterns or trends found
- Correlations discovered
- Anomalies identified
- Hypothesis test results

Example: 'Churn rate increased 15% in Q4. Mobile users churning 2x more than desktop. Correlation with recent app update.'"

### For Business Context:
"Help me understand business priorities:
- Current goals/OKRs
- Pain points being addressed
- Strategic initiatives
- Budget/resources available
- Timeline for action

This helps frame insights as actionable, not just interesting."

### For Audience:
"Who will act on these insights?
- **Executives**: High-level strategic implications
- **Product team**: Feature/UX implications  
- **Marketing**: Campaign/targeting implications
- **Operations**: Process improvement implications

Different audiences need different framing."

## Workflow

### Step 1: Structure Findings

```python
import pandas as pd
import numpy as np

class InsightSynthesizer:
    def __init__(self, analysis_name):
        self.analysis_name = analysis_name
        self.findings = []
        self.insights = []
    
    def add_finding(self, finding_type, metric, value, context):
        """Log an analysis finding"""
        self.findings.append({
            'type': finding_type,  # trend, comparison, correlation, anomaly
            'metric': metric,
            'value': value,
            'context': context,
            'business_impact': None,
            'recommendation': None
        })
    
    def convert_to_insight(self, finding_idx, impact, recommendation, confidence):
        """Convert finding to actionable insight"""
        finding = self.findings[finding_idx]
        
        insight = {
            'finding': finding,
            'impact': impact,
            'recommendation': recommendation,
            'confidence': confidence,
            'priority': self._assess_priority(impact, confidence)
        }
        
        self.insights.append(insight)
        return insight
    
    def _assess_priority(self, impact, confidence):
        """Determine insight priority"""
        if 'high' in impact.lower() and confidence == 'high':
            return 'critical'
        elif 'high' in impact.lower() or confidence == 'high':
            return 'high'
        elif 'medium' in impact.lower():
            return 'medium'
        else:
            return 'low'

# Initialize
synthesizer = InsightSynthesizer("Q4 Churn Analysis")

# Add findings
synthesizer.add_finding(
    finding_type='trend',
    metric='Churn Rate',
    value='15% increase in Q4',
    context='Previous quarter was 8%, now 23%'
)

synthesizer.add_finding(
    finding_type='comparison',
    metric='Mobile vs Desktop Churn',
    value='2x higher on mobile',
    context='Mobile: 35% churn, Desktop: 17% churn'
)

print("✅ Findings structured")
```

### Step 2: Connect to Business Impact

```python
# Convert finding to insight with business context

insight_1 = synthesizer.convert_to_insight(
    finding_idx=0,
    impact="High revenue risk: 15% churn increase = $2M ARR at risk. Accelerating trend suggests worsening if unaddressed.",
    recommendation="Immediate win-back campaign for at-risk customers. Investigate root cause (recent product changes, competitor moves).",
    confidence='high'
)

insight_2 = synthesizer.convert_to_insight(
    finding_idx=1,
    impact="Mobile represents 40% of user base. 2x churn rate means disproportionate loss of mobile users. Mobile-first strategy at risk.",
    recommendation="Audit mobile app experience. Recent app update (v3.2.0) correlated with spike - consider rollback or hotfix.",
    confidence='high'
)

print(f"✅ Created {len(synthesizer.insights)} actionable insights")
```

### Step 3: Apply Insight Framework

```python
def apply_insight_framework(finding, business_context):
    """
    Use So What? - Why? - Now What? framework
    """
    
    insight = {}
    
    # SO WHAT? (Why it matters)
    insight['so_what'] = f"This means {finding['value']} which affects {business_context['impact_area']}"
    
    # WHY? (Root cause hypothesis)
    insight['why'] = f"Likely driven by {business_context['hypothesis']}"
    
    # NOW WHAT? (Action)
    insight['now_what'] = f"We should {business_context['action']}"
    
    # Expected outcome
    insight['expected_outcome'] = business_context.get('expected_outcome')
    
    return insight

# Example
finding = synthesizer.findings[0]
context = {
    'impact_area': 'monthly recurring revenue and growth targets',
    'hypothesis': 'recent app update degrading mobile UX, competitor launched similar product',
    'action': 'immediately investigate app update, run win-back campaign, monitor competitor',
    'expected_outcome': 'Reduce churn to <10% within 60 days, recover $500K ARR'
}

structured_insight = apply_insight_framework(finding, context)

print("\n📊 Structured Insight:")
print(f"  SO WHAT: {structured_insight['so_what']}")
print(f"  WHY: {structured_insight['why']}")
print(f"  NOW WHAT: {structured_insight['now_what']}")
```

### Step 4: Prioritize Insights

```python
def prioritize_insights(insights):
    """Rank insights by impact and urgency"""
    
    priority_map = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
    
    # Sort by priority
    sorted_insights = sorted(
        insights,
        key=lambda x: priority_map[x['priority']],
        reverse=True
    )
    
    print("\n🎯 Prioritized Insights:\n")
    for i, insight in enumerate(sorted_insights, 1):
        print(f"{i}. [{insight['priority'].upper()}] {insight['finding']['metric']}")
        print(f"   Impact: {insight['impact'][:80]}...")
        print(f"   Action: {insight['recommendation'][:80]}...")
        print()
    
    return sorted_insights

prioritized = prioritize_insights(synthesizer.insights)
```

### Step 5: Generate Executive Summary

```python
def generate_executive_summary(insights, analysis_name):
    """Create concise executive summary"""
    
    summary = f"# Executive Summary: {analysis_name}\n\n"
    
    # Top 3 insights
    summary += "## Key Insights\n\n"
    for i, insight in enumerate(insights[:3], 1):
        summary += f"**{i}. {insight['finding']['metric']}**\n"
        summary += f"- Finding: {insight['finding']['value']}\n"
        summary += f"- Impact: {insight['impact']}\n"
        summary += f"- Action: {insight['recommendation']}\n\n"
    
    # Bottom line
    summary += "## Bottom Line\n\n"
    summary += f"Immediate action required on {len([i for i in insights if i['priority'] in ['critical', 'high']])} high-priority issues. "
    summary += f"Estimated business impact: $2M+ ARR at risk if unaddressed.\n"
    
    return summary

exec_summary = generate_executive_summary(prioritized, "Q4 Churn Analysis")
print(exec_summary)
```

## Context Validation

- [ ] Findings are factually accurate
- [ ] Business impact is realistic
- [ ] Recommendations are actionable
- [ ] Confidence levels are honest
- [ ] Audience needs considered

## Output Template

```
# Key Insights: Q4 Churn Analysis

## Critical Insight #1: Mobile Churn Crisis

**Finding:** Mobile users churning at 2x rate of desktop (35% vs 17%)

**So What:**
- Mobile = 40% of user base, disproportionate loss
- Threatens mobile-first strategy
- Concentrated in recent cohorts (post-app update)

**Why:**
- App update v3.2.0 introduced performance issues
- Competitors launched improved mobile apps
- Mobile onboarding less effective

**Now What:**
1. IMMEDIATE: Rollback app to v3.1.9 (stable version)
2. Week 1: Emergency UX audit of mobile experience
3. Week 2: Launch mobile win-back campaign
4. Month 1: Redesign mobile onboarding

**Expected Outcome:**
Reduce mobile churn to <20% within 60 days, save $500K ARR

**Confidence:** HIGH (validated with user feedback, correlates with app release)

---

## High Priority Insight #2: Churn Accelerating

**Finding:** 15% increase in churn (8% → 23% in one quarter)

**Impact:** $2M ARR at risk, undermines growth targets

**Action:** Root cause investigation + retention programs

**Confidence:** HIGH
```

## Common Scenarios

### Scenario 1: "Turn analysis into exec presentation"
→ Extract top 3-5 insights
→ Frame with business impact
→ Lead with recommendations
→ Support with data
→ Include next steps

### Scenario 2: "Why should stakeholders care?"
→ Connect to OKRs/goals
→ Quantify business impact ($, customers, time)
→ Show urgency (what happens if we don't act)
→ Make recommendations concrete
→ Provide confidence levels

### Scenario 3: "Too many findings to present"
→ Prioritize by impact
→ Group related findings
→ Focus on actionable insights
→ Save rest for appendix
→ Tailor to audience

### Scenario 4: "Findings conflict or unclear"
→ Acknowledge uncertainty
→ Present alternative interpretations
→ Recommend validation approach
→ Provide provisional insights
→ Set up next analysis

### Scenario 5: "Create insight library"
→ Document insight patterns
→ Template common insight types
→ Build metrics → insights mapping
→ Enable self-service insights
→ Track insight outcomes

## Handling Missing Context

**Just raw numbers, no context:**
"I can see the data changed, but need business context:
- Why do we care about this metric?
- What's an acceptable range?
- What can we actually do about it?
Let's connect findings to business impact."

**Unclear what action to take:**
"Let's work backwards:
- Who has the power to act?
- What levers can they pull?
- What's a realistic timeline?
Then frame insights as actionable recommendations."

**Low confidence in findings:**
"Be transparent about uncertainty:
- State what we know vs. suspect
- Provide confidence levels
- Recommend validation
- Avoid overconfident claims"

## Advanced Options

**Insight Scoring Model**: Weight insights by impact × confidence × actionability

**Insight Templates**: Pre-built frameworks for common analysis types

**Automated Insights**: Scan for statistical significance, anomalies, patterns

**Insight Tracking**: Monitor which insights led to action and outcomes

**Competitive Insights**: Compare to industry benchmarks, competitors
