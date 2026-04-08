---
name: executive-summary-generator
description: Create concise executive summaries from detailed analysis. Use when preparing board decks, executive briefings, or condensing complex analysis into decision-ready formats.
---

# Executive Summary Generator

## Quick Start

Transform detailed analysis into concise, decision-focused executive summaries that communicate key insights and recommendations in minutes, not hours.

## Context Requirements

1. **Full Analysis**: Complete analysis to summarize
2. **Audience**: Specific executives and their priorities
3. **Decision**: What decision this informs
4. **Constraints**: Page limit, time to read, format
5. **Context**: What executives already know

## Context Gathering

"Share your detailed analysis and I'll create executive summary focused on:
- Top 3-5 insights only
- Clear business impact
- Specific recommendations
- What exec needs to decide/approve
Typically 1-2 pages maximum."

## Workflow

### Step 1: Extract Core Message

```python
class ExecutiveSummaryBuilder:
    def __init__(self, analysis_title, exec_audience):
        self.title = analysis_title
        self.audience = exec_audience
        self.situation = ""
        self.insights = []
        self.recommendations = []
        self.decision_needed = ""
        
    def set_situation(self, context):
        """One paragraph: Why this analysis, why now"""
        self.situation = context
    
    def add_insight(self, insight, impact, evidence):
        """Add key finding with business impact"""
        self.insights.append({
            'insight': insight,
            'impact': impact,
            'evidence': evidence
        })
    
    def add_recommendation(self, action, rationale, expected_outcome):
        """Add prioritized recommendation"""
        self.recommendations.append({
            'action': action,
            'rationale': rationale,
            'outcome': expected_outcome
        })
    
    def set_decision(self, decision):
        """What exec needs to decide"""
        self.decision_needed = decision
    
    def generate(self):
        """Create formatted executive summary"""
        
        summary = f"# Executive Summary: {self.title}\n\n"
        summary += f"**For:** {self.audience}\n"
        summary += f"**Date:** {datetime.now().strftime('%B %d, %Y')}\n\n"
        summary += "---\n\n"
        
        # Situation
        summary += "## Situation\n\n"
        summary += f"{self.situation}\n\n"
        
        # Key Insights
        summary += "## Key Insights\n\n"
        for i, insight in enumerate(self.insights, 1):
            summary += f"**{i}. {insight['insight']}**\n"
            summary += f"- Impact: {insight['impact']}\n"
            summary += f"- Evidence: {insight['evidence']}\n\n"
        
        # Recommendations
        summary += "## Recommendations\n\n"
        for i, rec in enumerate(self.recommendations, 1):
            summary += f"**{i}. {rec['action']}**\n"
            summary += f"- Why: {rec['rationale']}\n"
            summary += f"- Expected Outcome: {rec['outcome']}\n\n"
        
        # Decision
        summary += "## Decision Needed\n\n"
        summary += f"{self.decision_needed}\n\n"
        
        return summary

# Example usage
builder = ExecutiveSummaryBuilder(
    "Q4 Customer Churn Analysis",
    "VP Product, CFO"
)

builder.set_situation(
    "Customer churn increased 15% in Q4, putting $2M ARR at risk. Analysis identifies mobile app issues as primary driver. Immediate action required to prevent further losses."
)

builder.add_insight(
    "Mobile users churning at 2x rate of desktop users",
    "$800K ARR at risk from mobile-specific issues",
    "35% mobile churn vs 17% desktop churn. Spike correlates with app update v3.2.0"
)

builder.add_recommendation(
    "Rollback mobile app to previous stable version",
    "Update v3.2.0 introduced performance issues affecting 40% of mobile users",
    "Reduce mobile churn to <20% within 30 days, save $400K ARR"
)

builder.set_decision(
    "Approve immediate app rollback and $150K budget for mobile UX improvements"
)

summary = builder.generate()
print(summary)
```

### Step 2: Apply Pyramid Principle

```python
def apply_pyramid_structure(main_message, supporting_points):
    """Structure: Lead with conclusion, support with evidence"""
    
    structure = {
        'headline': main_message,  # Answer first
        'supporting': supporting_points,  # Then why
        'details': []  # Finally how (optional for execs)
    }
    
    # Format
    output = f"## {structure['headline']}\n\n"
    output += "**Why this matters:**\n"
    for point in structure['supporting']:
        output += f"- {point}\n"
    
    return output

headline = "Immediate mobile app rollback required to stop churn crisis"
support = [
    "$800K ARR at risk from mobile churn spike",
    "Issue traced to recent app update",
    "Rollback can recover 50% of at-risk revenue within 30 days"
]

pyramid = apply_pyramid_structure(headline, support)
print(pyramid)
```

### Step 3: Quantify Everything

```python
def add_business_metrics(summary_dict):
    """Ensure all insights have numbers"""
    
    enhanced = summary_dict.copy()
    
    # Add financial impact
    enhanced['financial_impact'] = {
        'revenue_at_risk': '$2M ARR',
        'recovery_potential': '$400K in 30 days',
        'investment_needed': '$150K'
    }
    
    # Add metrics
    enhanced['key_metrics'] = {
        'current_churn': '23%',
        'target_churn': '<10%',
        'timeline': '60 days'
    }
    
    # ROI calculation
    enhanced['roi'] = {
        'investment': 150_000,
        'return': 400_000,
        'ratio': '2.7x'
    }
    
    print("💰 Business Metrics:")
    print(f"  Revenue at Risk: {enhanced['financial_impact']['revenue_at_risk']}")
    print(f"  Investment: {enhanced['financial_impact']['investment_needed']}")
    print(f"  ROI: {enhanced['roi']['ratio']}")
    
    return enhanced

metrics = add_business_metrics({})
```

## Context Validation

- [ ] Decision is clearly stated
- [ ] Insights are fact-based
- [ ] Impact is quantified
- [ ] Recommendations are specific
- [ ] Fits on 1-2 pages
- [ ] No jargon or technical details

## Output Template

```
# Executive Summary: Q4 Customer Churn Analysis

**For:** VP Product, CFO
**Date:** January 11, 2025

---

## Situation

Customer churn increased 15% in Q4 (8% → 23%), putting $2M ARR at risk. 
Analysis identifies mobile app performance issues as primary driver. 
Immediate action required to prevent further losses.

## Key Insights

**1. Mobile users churning at 2x rate of desktop**
- Impact: $800K ARR at risk from mobile-specific issues
- Evidence: 35% mobile vs 17% desktop churn. Spike correlates with app update v3.2.0

**2. Churn accelerating, not stabilizing**
- Impact: If trend continues, $3M+ ARR at risk in 2025
- Evidence: Monthly churn increased every month in Q4 (5% → 8% → 12% → 23%)

**3. Win-back campaigns recovering only 15% of churned users**
- Impact: Prevention more effective than recovery
- Evidence: Historical win-back rate was 30%, dropped to 15% in Q4

## Recommendations

**1. IMMEDIATE: Rollback mobile app to v3.1.9 (Priority: CRITICAL)**
- Why: Update v3.2.0 introduced performance issues affecting 40% of users
- Expected Outcome: Reduce mobile churn to <20% within 30 days, save $400K ARR

**2. Week 1: Launch mobile user win-back campaign (Priority: HIGH)**
- Why: 15% recovery still meaningful for high-value customers
- Expected Outcome: Recover $120K ARR from churned mobile users

**3. Month 1: Invest in mobile UX improvements (Priority: HIGH)**
- Why: Long-term fix to prevent recurrence
- Expected Outcome: Competitive mobile experience, churn <10% sustained

## Decision Needed

**Approve:**
1. Immediate mobile app rollback (Engineering: 1 day)
2. $150K budget for mobile UX improvements
3. Dedicated mobile team for next quarter

**Timeline:** Decision by Jan 15 to execute in time for Feb 1 impact

---

**Bottom Line:** $150K investment can save $2M ARR. ROI: 13x. Every week delay costs $100K in lost revenue.
```

## Common Scenarios

### Scenario 1: "Condense 30-page analysis for board deck"
→ Extract top 3 insights only
→ Lead with business impact
→ One slide per insight
→ Clear asks/decisions
→ Appendix for details

### Scenario 2: "Weekly executive briefing"
→ Standard template
→ Situation, insights, actions
→ Metrics dashboard
→ Compare to previous week
→ Escalations highlighted

### Scenario 3: "Ad-hoc exec question"
→ Answer first (one sentence)
→ Support with 3 bullets
→ Link to full analysis
→ Offer to dive deeper
→ Respond in <1 hour

### Scenario 4: "Monthly business review"
→ Performance vs targets
→ Highlight wins and concerns
→ Forward-looking insights
→ Resource requests
→ Next month priorities

## Handling Missing Context

**Long, rambling analysis:**
"Let me help focus:
- What's the #1 insight?
- What decision does this inform?
- What's the ask?
Then I'll structure as exec summary."

**Too much technical detail:**
"I'll translate to business language:
- Replace technical terms
- Focus on 'so what'
- Quantify impact
- Make recommendations concrete"

**Unclear what exec cares about:**
"Let's align to their priorities:
- Revenue/growth?
- Cost/efficiency?
- Risk/compliance?
- Customer satisfaction?
Frame insights accordingly."

## Advanced Options

**Template Library**: Pre-built formats for different executive audiences

**Auto-summarization**: AI to extract key points from long documents

**Progressive Disclosure**: Summary → details on demand

**Exec Dashboard**: Always-updated summary of key metrics

**Decision Log**: Track executive decisions and outcomes
