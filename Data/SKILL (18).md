---
name: data-narrative-builder
description: Build compelling data-driven narratives and stories. Use when presenting analysis results, creating reports, or communicating data insights through storytelling frameworks.
---

# Data Narrative Builder

## Quick Start

Transform data analysis into compelling narratives that engage audiences, build understanding, and drive action using proven storytelling frameworks.

## Context Requirements

1. **Data/Analysis**: Core findings to communicate
2. **Audience**: Who you're speaking to and their context
3. **Goal**: What action or understanding you want
4. **Format**: Presentation, report, email, dashboard
5. **Constraints**: Time, length, formality level

## Context Gathering

"To build your data narrative:
- What's the central insight/message?
- Who's the audience and what do they care about?
- What do you want them to do/understand?
- How will you deliver it?
- Any sensitive topics to navigate?"

## Workflow

### Step 1: Choose Narrative Structure

```python
class DataNarrative:
    """Build data-driven stories using proven frameworks"""
    
    FRAMEWORKS = {
        'situation_complication_resolution': {
            'structure': ['Situation', 'Complication', 'Resolution'],
            'use_when': 'Presenting problem and solution'
        },
        'hero_journey': {
            'structure': ['Status Quo', 'Incident', 'Quest', 'Discovery', 'Transformation'],
            'use_when': 'Change management, transformation stories'
        },
        'before_after_bridge': {
            'structure': ['Before', 'After', 'Bridge'],
            'use_when': 'Demonstrating impact of change'
        },
        'sparklines': {
            'structure': ['What Is', 'What Could Be', 'Contrast', 'Call to Action'],
            'use_when': 'Inspiring vision, motivating action'
        }
    }
    
    def __init__(self, framework='situation_complication_resolution'):
        self.framework = framework
        self.structure = self.FRAMEWORKS[framework]['structure']
        self.sections = {section: '' for section in self.structure}
        self.data_points = []
    
    def add_section(self, section_name, content):
        if section_name in self.sections:
            self.sections[section_name] = content
    
    def add_data_point(self, value, context, emotional_hook=None):
        self.data_points.append({
            'value': value,
            'context': context,
            'hook': emotional_hook
        })
    
    def build(self):
        narrative = f"# Data Narrative\n\n"
        narrative += f"**Framework:** {self.framework.replace('_', ' ').title()}\n\n"
        narrative += "---\n\n"
        
        for section in self.structure:
            if self.sections[section]:
                narrative += f"## {section}\n\n"
                narrative += f"{self.sections[section]}\n\n"
        
        return narrative

# Example: Situation-Complication-Resolution
narrative = DataNarrative('situation_complication_resolution')

narrative.add_section('Situation', 
    "For the past 3 years, our customer retention has been steady at 85%, meeting industry benchmarks and supporting predictable revenue growth."
)

narrative.add_section('Complication',
    "In Q4, retention dropped to 70% - a 15 percentage point decline. This puts $2M ARR at risk and threatens our growth trajectory. Analysis shows mobile users are churning at twice the rate of desktop users, correlating with our recent app update."
)

narrative.add_section('Resolution',
    "We can recover by rolling back the problematic app update (immediate), launching targeted win-back campaigns (week 1), and investing in mobile UX improvements (month 1). This three-phase approach can restore retention to 82% and save $1.6M ARR within 90 days."
)

story = narrative.build()
print(story)
```

### Step 2: Apply Emotional Arc

```python
def add_emotional_journey(narrative_sections):
    """Layer emotional progression onto data narrative"""
    
    emotional_arc = {
        'Situation': {
            'emotion': 'Stability/Comfort',
            'tone': 'Neutral, establishing context',
            'data_role': 'Baseline, historical performance'
        },
        'Complication': {
            'emotion': 'Tension/Concern',
            'tone': 'Urgent, problem-focused',
            'data_role': 'The surprise, the deviation, the gap'
        },
        'Resolution': {
            'emotion': 'Hope/Confidence',
            'tone': 'Solution-oriented, forward-looking',
            'data_role': 'Projected outcomes, success metrics'
        }
    }
    
    enhanced = {}
    for section, content in narrative_sections.items():
        arc = emotional_arc.get(section, {})
        enhanced[section] = {
            'content': content,
            'emotion': arc.get('emotion'),
            'delivery_notes': arc.get('tone')
        }
    
    return enhanced

enhanced_story = add_emotional_journey(narrative.sections)
print("\n✅ Emotional arc applied")
```

### Step 3: Weave in Data Points

```python
def integrate_data_strategically(narrative, data_points):
    """Place data where it maximizes impact"""
    
    # Principles:
    # 1. Lead with most compelling stat
    # 2. Use round numbers for easy recall
    # 3. Compare to familiar benchmarks
    # 4. Show trend, not just point-in-time
    # 5. Humanize big numbers
    
    enhanced = narrative
    
    # Example transformations
    transformations = {
        'raw': '$2,000,000',
        'rounded': '$2M',
        'contextualized': '$2M (20% of annual revenue)',
        'humanized': '$2M affecting 500 customer relationships',
        'visualized': '⬇️ 15% decline = $2M at risk'
    }
    
    print("\n📊 Data Integration Techniques:")
    for style, example in transformations.items():
        print(f"  {style.title()}: {example}")
    
    return enhanced

enhanced_narrative = integrate_data_strategically(story, narrative.data_points)
```

### Step 4: Build Momentum and Pacing

```python
def structure_pacing(sections):
    """Control information flow and build momentum"""
    
    pacing_guide = {
        'opening': {
            'length': 'short',
            'content': 'hook + context',
            'purpose': 'grab attention, set stage'
        },
        'development': {
            'length': 'medium',
            'content': 'build tension, explore problem',
            'purpose': 'create urgency, show impact'
        },
        'climax': {
            'length': 'short',
            'content': 'key insight or turning point',
            'purpose': 'aha moment'
        },
        'resolution': {
            'length': 'medium',
            'content': 'solution and path forward',
            'purpose': 'inspire confidence, enable action'
        },
        'closing': {
            'length': 'short',
            'content': 'call to action',
            'purpose': 'clear next steps'
        }
    }
    
    print("\n⚡ Pacing Structure:")
    for phase, guide in pacing_guide.items():
        print(f"  {phase.title()}: {guide['length']} - {guide['purpose']}")
    
    return pacing_guide

pacing = structure_pacing(narrative.sections)
```

### Step 5: Add Visual Storytelling

```python
def plan_visual_narrative(narrative_structure):
    """Map visualizations to narrative flow"""
    
    visual_plan = {
        'Situation': [
            {'type': 'line_chart', 'data': '3-year retention trend', 'message': 'Historical stability'},
            {'type': 'benchmark', 'data': 'vs industry average', 'message': 'Meeting standards'}
        ],
        'Complication': [
            {'type': 'before_after', 'data': 'Q3 vs Q4 retention', 'message': 'Dramatic drop'},
            {'type': 'comparison', 'data': 'mobile vs desktop churn', 'message': 'Mobile crisis'},
            {'type': 'timeline', 'data': 'app update correlation', 'message': 'Root cause'}
        ],
        'Resolution': [
            {'type': 'roadmap', 'data': 'three-phase plan', 'message': 'Clear path forward'},
            {'type': 'projection', 'data': 'recovery trajectory', 'message': 'Expected outcomes'}
        ]
    }
    
    print("\n🎨 Visual Narrative Plan:")
    for section, visuals in visual_plan.items():
        print(f"\n  {section}:")
        for v in visuals:
            print(f"    • {v['type']}: {v['message']}")
    
    return visual_plan

visual_plan = plan_visual_narrative(narrative.sections)
```

### Step 6: Craft Opening Hook

```python
def create_compelling_hook(main_insight, audience):
    """Start with attention-grabbing opening"""
    
    hook_techniques = {
        'surprising_stat': "85% retention for 3 years. Then suddenly: 70%. What happened?",
        'question': "What if I told you we lost $2M in 90 days - and almost no one noticed?",
        'bold_claim': "Our mobile app update just cost us $2 million.",
        'story': "Three months ago, Sarah in finance asked a routine question: 'Why are refunds up?' That question led us to discover...",
        'contrast': "While desktop users stayed loyal, mobile users were quietly walking away."
    }
    
    print("\n🎣 Hook Options:")
    for technique, example in hook_techniques.items():
        print(f"  {technique.replace('_', ' ').title()}:")
        print(f"    '{example}'")
    
    # For executives: surprising_stat or bold_claim
    # For technical: question or contrast
    # For general: story
    
    return hook_techniques

hooks = create_compelling_hook("Mobile churn crisis", "executives")
```

### Step 7: End with Clear Call to Action

```python
def craft_call_to_action(recommendations, urgency):
    """Create specific, actionable closing"""
    
    cta = {
        'decision_needed': "Approve immediate app rollback and $150K mobile UX investment",
        'timeline': "Decision needed by Friday (Jan 15) for Feb 1 implementation",
        'accountability': "Engineering: Rollback | Product: UX fixes | Sales: Win-back campaign",
        'follow_up': "Weekly check-ins on recovery metrics starting Jan 22",
        'success_criteria': "Return to >80% retention by March 31"
    }
    
    # Format CTA
    cta_text = f"""
## What We Need From You

**Decision:** {cta['decision_needed']}

**Timeline:** {cta['timeline']}

**Who Does What:**
- Engineering: App rollback (immediate)
- Product: UX improvements (30 days)
- Sales: Win-back campaign (ongoing)

**Success Metrics:** {cta['success_criteria']}

**Next Steps:** {cta['follow_up']}
    """
    
    print(cta_text)
    return cta

cta = craft_call_to_action([], 'high')
```

## Context Validation

- [ ] Narrative has clear beginning, middle, end
- [ ] Data supports (not overwhelms) story
- [ ] Audience perspective considered
- [ ] Emotional journey intentional
- [ ] Call to action is specific
- [ ] Visualizations enhance understanding

## Output Template

```
# [Compelling Title That Hints at Story]

## The Setup (30 seconds)

For 3 years, customer retention held steady at 85% - meeting industry benchmarks 
and supporting predictable $10M ARR growth.

[Visual: 3-year trend line showing stability]

## The Twist (60 seconds)

Then Q4 hit. Retention plummeted to 70% in just 90 days. 

$2M ARR now at risk. Growth projections in jeopardy.

[Visual: Before/after comparison]

But here's what we didn't see coming: It wasn't happening everywhere.

Desktop users? Still 85% loyal.
Mobile users? 35% churning - **2x the rate**.

[Visual: Mobile vs desktop split]

## The Discovery (45 seconds)

What changed? Our data tells a clear story:

• Nov 15: Mobile app update v3.2.0 released
• Nov 20: First spike in mobile churn
• Dec 31: Mobile churn reaches 35%

The timeline is undeniable. The correlation is strong.

[Visual: Timeline with app release and churn spike]

## The Path Forward (90 seconds)

We have a plan. Three phases, 90 days, high confidence.

**Phase 1 (Immediate):** Rollback app to stable version
- Expected impact: Halt churn spike within 2 weeks
- Risk: Low (reverting to proven stable code)

**Phase 2 (Week 1):** Launch mobile user win-back campaign
- Expected impact: Recover 15% of lost users = $300K ARR
- Risk: Medium (depends on offer attractiveness)

**Phase 3 (Month 1):** Invest $150K in mobile UX improvements
- Expected impact: Long-term mobile retention >80%
- Risk: Low (budget approved, team ready)

[Visual: 90-day roadmap with projected recovery curve]

## The Ask (30 seconds)

**We need your approval to move forward.**

Investment: $150K
Return: Save $1.6M of $2M at risk
Timeline: Decision by Friday for Monday rollback

Every week we wait costs $100K in lost revenue.

**Are we approved to proceed?**
```

## Common Scenarios

### Scenario 1: "Present analysis to skeptical audience"
→ Lead with their concern
→ Acknowledge counterarguments
→ Build credibility with data
→ Show you understand their perspective
→ End with low-risk next step

### Scenario 2: "Turn monthly metrics into story"
→ Find the narrative thread
→ What changed and why it matters
→ Connect metrics to business outcomes
→ Highlight wins and concerns
→ Forward-looking action items

### Scenario 3: "Explain complex analysis simply"
→ Start with the insight, not the method
→ Use analogies and metaphors
→ Progressive disclosure of complexity
→ Visual storytelling
→ "So what?" for each finding

### Scenario 4: "Rally team around data insights"
→ Hero's journey framework
→ Team as protagonist
→ Data as guide/mentor
→ Action as quest
→ Success as transformation

## Handling Missing Context

**Just has data, no story:**
"Every dataset has a story:
- What changed?
- Why does it matter?
- What should we do?
Let's find your narrative thread."

**Boring presentation of facts:**
"Facts alone don't move people. Add:
- Emotional connection (impact on customers)
- Tension (what's at stake)
- Resolution (path forward)
- Call to action (specific next step)"

**Too complex to follow:**
"Simplify the story:
- One main message
- Three supporting points
- Remove everything else
Details in appendix for interested."

## Advanced Options

**Story Templates**: Pre-built narrative structures for common scenarios

**Data Storytelling Workshops**: Train teams on narrative techniques

**Narrative Testing**: A/B test different story structures

**Automated Insights**: AI-generated narrative summaries

**Interactive Storytelling**: Scrollytelling, data-driven experiences
