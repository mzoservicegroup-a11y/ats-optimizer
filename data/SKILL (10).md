---
name: ab-test-analysis
description: Rigorous A/B test statistical analysis. Use when analyzing experiment results, calculating statistical significance, checking for sample ratio mismatch, or validating test design before launch.
---

# A/B Test Analysis

## Quick Start

Analyze experiment results with statistical rigor, including significance testing, power analysis, sample ratio checks, and actionable recommendations for rolling out changes.

## Context Requirements

Before analyzing the test, I need:

1. **Test Design**: What was tested (variants, hypothesis, metric)
2. **Test Data**: Results from each variant
3. **Randomization Unit**: User, session, page view, etc.
4. **Primary Metric**: Success metric for decision-making
5. **Guardrail Metrics** (optional): Metrics that shouldn't degrade
6. **Test Duration**: When test started/ended

## Context Gathering

### For Test Design:
"Tell me about the experiment:

**What did you test?**
- Control (baseline): Current experience
- Treatment (variant): What changed?
- Example: 'Control: Blue button' vs 'Treatment: Green button'

**What's your hypothesis?**
- Example: 'Green button will increase conversions by 10%'

**Randomization level:**
- User-level (recommended): Each user always sees same variant
- Session-level: User might see different variants across sessions
- Page-view level: Randomize every page load

Which did you use?"

### For Test Data:
"I need the results data. Provide:

**Option 1 - Summary Stats:**
```
Control:  Users: 10,000 | Conversions: 1,200 (12.0%)
Treatment: Users: 10,000 | Conversions: 1,350 (13.5%)
```

**Option 2 - User-Level Data:**
```
user_id | variant | converted | revenue | ...
123     | control | TRUE      | 50.00   | ...
456     | treatment | FALSE   | 0       | ...
```

**Option 3 - Daily Aggregates:**
```
date       | variant   | users | conversions
2024-12-01 | control   | 500   | 60
2024-12-01 | treatment | 500   | 68
```

Which format works for you?"

### For Metrics:
"What metrics are you tracking?

**Primary Metric** (decision metric):
- Conversion rate, revenue per user, time on site, etc.
- This determines success/failure

**Secondary Metrics** (nice to know):
- Supporting metrics that provide context

**Guardrail Metrics** (must not degrade):
- Page load time, error rate, support tickets
- Treatment must not worsen these

What's your primary metric?"

### For Test Parameters:
"To calculate statistical significance, I need:

**Minimum Detectable Effect (MDE):**
- What % improvement would make it worth rolling out?
- Industry standard: 2-5% for conversion rates

**Significance Level (α):**
- Standard: 0.05 (5% false positive rate)
- Use default unless you have specific requirements

**Power (1-β):**
- Standard: 0.80 (80% chance to detect real effect)
- Use default unless you have specific requirements

Should we use standard parameters (5% significance, 80% power, 2% MDE)?"

### For Sample Ratio:
"How were users split between variants?

**Target Allocation:**
- 50/50 (most common)
- 90/10 (if testing risky change)
- 33/33/34 (three variants)

**Actual Allocation:**
- I'll check if actual split matches target
- Sample Ratio Mismatch (SRM) indicates technical issues"

## Workflow

### Step 1: Load and Validate Test Data

```python
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

# Load test data
test_data = pd.read_csv('ab_test_results.csv')

print(f"📊 Test Data Loaded:")
print(f"  Total Users: {len(test_data):,}")
print(f"  Control: {(test_data['variant'] == 'control').sum():,}")
print(f"  Treatment: {(test_data['variant'] == 'treatment').sum():,}")
print(f"  Primary Metric: conversion_rate")
```

**Checkpoint**: "Data loaded. Sample sizes look reasonable?"

### Step 2: Sample Ratio Mismatch (SRM) Check

```python
def check_sample_ratio_mismatch(test_data, expected_ratio=0.5):
    """
    Check if actual variant split matches expected
    SRM indicates technical issues with randomization
    """
    
    control_count = (test_data['variant'] == 'control').sum()
    treatment_count = (test_data['variant'] == 'treatment').sum()
    total = len(test_data)
    
    # Expected counts
    expected_control = total * expected_ratio
    expected_treatment = total * (1 - expected_ratio)
    
    # Chi-square test
    chi2_stat = (
        (control_count - expected_control)**2 / expected_control +
        (treatment_count - expected_treatment)**2 / expected_treatment
    )
    
    # Critical value for 1 degree of freedom at α=0.001 (very strict)
    critical_value = 10.828  # chi2.ppf(0.999, df=1)
    
    p_value = 1 - stats.chi2.cdf(chi2_stat, df=1)
    
    srm_detected = chi2_stat > critical_value
    
    results = {
        'control_count': control_count,
        'treatment_count': treatment_count,
        'control_pct': control_count / total * 100,
        'treatment_pct': treatment_count / total * 100,
        'expected_ratio': f"{expected_ratio*100:.0f}/{(1-expected_ratio)*100:.0f}",
        'chi2_stat': chi2_stat,
        'p_value': p_value,
        'srm_detected': srm_detected
    }
    
    return results

srm = check_sample_ratio_mismatch(test_data, expected_ratio=0.5)

print(f"\n🔍 Sample Ratio Mismatch Check:")
print(f"  Expected: {srm['expected_ratio']}")
print(f"  Actual: {srm['control_pct']:.1f}% / {srm['treatment_pct']:.1f}%")
print(f"  Chi-square: {srm['chi2_stat']:.2f}")
print(f"  P-value: {srm['p_value']:.4f}")

if srm['srm_detected']:
    print(f"  ⚠️  SRM DETECTED - Investigate randomization issue!")
else:
    print(f"  ✅ No SRM - Randomization looks good")
```

### Step 3: Calculate Metrics by Variant

```python
def calculate_variant_metrics(test_data, metric_col='converted'):
    """Calculate key metrics for each variant"""
    
    variants = {}
    
    for variant_name in ['control', 'treatment']:
        variant_data = test_data[test_data['variant'] == variant_name]
        
        n = len(variant_data)
        successes = variant_data[metric_col].sum()
        success_rate = successes / n
        
        # Standard error for proportion
        se = np.sqrt(success_rate * (1 - success_rate) / n)
        
        # 95% confidence interval
        ci_lower = success_rate - 1.96 * se
        ci_upper = success_rate + 1.96 * se
        
        variants[variant_name] = {
            'n': n,
            'successes': successes,
            'rate': success_rate,
            'se': se,
            'ci_lower': ci_lower,
            'ci_upper': ci_upper
        }
    
    return variants

metrics = calculate_variant_metrics(test_data, 'converted')

print(f"\n📊 Variant Performance:")
for variant_name, stats in metrics.items():
    print(f"\n  {variant_name.upper()}:")
    print(f"    Sample Size: {stats['n']:,}")
    print(f"    Conversions: {stats['successes']:,}")
    print(f"    Rate: {stats['rate']:.3%}")
    print(f"    95% CI: [{stats['ci_lower']:.3%}, {stats['ci_upper']:.3%}]")
```

### Step 4: Statistical Significance Test

```python
def test_statistical_significance(control, treatment):
    """
    Two-proportion z-test for statistical significance
    """
    
    # Pool the proportions
    pooled_p = (control['successes'] + treatment['successes']) / (control['n'] + treatment['n'])
    pooled_se = np.sqrt(pooled_p * (1 - pooled_p) * (1/control['n'] + 1/treatment['n']))
    
    # Calculate z-score
    diff = treatment['rate'] - control['rate']
    z_score = diff / pooled_se
    
    # Two-tailed p-value
    p_value = 2 * (1 - stats.norm.cdf(abs(z_score)))
    
    # Effect size (relative uplift)
    relative_uplift = (treatment['rate'] - control['rate']) / control['rate']
    
    # Absolute uplift
    absolute_uplift = treatment['rate'] - control['rate']
    
    # Confidence interval for the difference
    se_diff = np.sqrt(
        control['rate'] * (1 - control['rate']) / control['n'] +
        treatment['rate'] * (1 - treatment['rate']) / treatment['n']
    )
    ci_lower = diff - 1.96 * se_diff
    ci_upper = diff + 1.96 * se_diff
    
    results = {
        'absolute_uplift': absolute_uplift,
        'relative_uplift': relative_uplift,
        'z_score': z_score,
        'p_value': p_value,
        'significant': p_value < 0.05,
        'ci_lower': ci_lower,
        'ci_upper': ci_upper
    }
    
    return results

sig_test = test_statistical_significance(metrics['control'], metrics['treatment'])

print(f"\n📈 Statistical Significance Test:")
print(f"  Absolute Uplift: {sig_test['absolute_uplift']:.3%}")
print(f"  Relative Uplift: {sig_test['relative_uplift']:+.1%}")
print(f"  95% CI: [{sig_test['ci_lower']:.3%}, {sig_test['ci_upper']:.3%}]")
print(f"  Z-score: {sig_test['z_score']:.2f}")
print(f"  P-value: {sig_test['p_value']:.4f}")

if sig_test['significant']:
    print(f"  ✅ STATISTICALLY SIGNIFICANT (p < 0.05)")
    if sig_test['relative_uplift'] > 0:
        print(f"  📈 Treatment WINS")
    else:
        print(f"  📉 Treatment LOSES")
else:
    print(f"  ❌ NOT SIGNIFICANT - No clear winner")
```

### Step 5: Power Analysis

```python
def calculate_achieved_power(control, treatment, alpha=0.05):
    """
    Calculate the statistical power achieved in the test
    """
    
    # Effect size (Cohen's h for proportions)
    p1 = control['rate']
    p2 = treatment['rate']
    
    effect_size = 2 * (np.arcsin(np.sqrt(p2)) - np.arcsin(np.sqrt(p1)))
    
    # Critical z-value for two-tailed test
    z_crit = stats.norm.ppf(1 - alpha/2)
    
    # Standard error under alternative hypothesis
    n = control['n']  # assuming equal sample sizes
    se_alt = np.sqrt(p1*(1-p1)/n + p2*(1-p2)/n)
    
    # Non-centrality parameter
    ncp = (p2 - p1) / se_alt
    
    # Power calculation
    power = 1 - stats.norm.cdf(z_crit - abs(ncp)) + stats.norm.cdf(-z_crit - abs(ncp))
    
    return {
        'effect_size': effect_size,
        'power': power,
        'sample_size_per_variant': n
    }

power_analysis = calculate_achieved_power(metrics['control'], metrics['treatment'])

print(f"\n⚡ Power Analysis:")
print(f"  Effect Size (Cohen's h): {power_analysis['effect_size']:.3f}")
print(f"  Achieved Power: {power_analysis['power']:.1%}")
print(f"  Sample Size per Variant: {power_analysis['sample_size_per_variant']:,}")

if power_analysis['power'] < 0.80:
    print(f"  ⚠️  UNDERPOWERED - Results less reliable")
else:
    print(f"  ✅ Well-powered test")
```

### Step 6: Guardrail Metrics Check

```python
def check_guardrail_metrics(test_data, guardrail_metrics=['page_load_time', 'error_rate']):
    """
    Ensure treatment doesn't degrade important guardrail metrics
    """
    
    print(f"\n🛡️  Guardrail Metrics Check:")
    
    guardrail_results = []
    
    for metric in guardrail_metrics:
        if metric not in test_data.columns:
            continue
        
        control_data = test_data[test_data['variant'] == 'control'][metric]
        treatment_data = test_data[test_data['variant'] == 'treatment'][metric]
        
        # T-test for continuous metrics
        t_stat, p_value = stats.ttest_ind(treatment_data, control_data)
        
        control_mean = control_data.mean()
        treatment_mean = treatment_data.mean()
        change = ((treatment_mean - control_mean) / control_mean) * 100
        
        # Check if treatment is worse (degraded)
        degraded = (change > 0 and 'time' in metric.lower()) or \
                   (change > 0 and 'error' in metric.lower()) or \
                   (change < 0 and 'score' in metric.lower())
        
        print(f"\n  {metric}:")
        print(f"    Control: {control_mean:.2f}")
        print(f"    Treatment: {treatment_mean:.2f}")
        print(f"    Change: {change:+.1f}%")
        
        if degraded and p_value < 0.05:
            print(f"    ⚠️  DEGRADED significantly (p={p_value:.4f})")
        elif degraded:
            print(f"    ⚠️  Degraded but not significant")
        else:
            print(f"    ✅ No degradation")
        
        guardrail_results.append({
            'metric': metric,
            'control_mean': control_mean,
            'treatment_mean': treatment_mean,
            'change_pct': change,
            'p_value': p_value,
            'degraded': degraded and p_value < 0.05
        })
    
    return guardrail_results

guardrails = check_guardrail_metrics(test_data, ['page_load_time', 'bounce_rate'])
```

### Step 7: Visualize Results

```python
def plot_ab_test_results(metrics, sig_test):
    """Create comprehensive visualization of test results"""
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # Plot 1: Conversion rates with confidence intervals
    variants = ['Control', 'Treatment']
    rates = [metrics['control']['rate'], metrics['treatment']['rate']]
    ci_lower = [metrics['control']['ci_lower'], metrics['treatment']['ci_lower']]
    ci_upper = [metrics['control']['ci_upper'], metrics['treatment']['ci_upper']]
    
    x = np.arange(len(variants))
    colors = ['#3498db', '#2ecc71' if sig_test['relative_uplift'] > 0 else '#e74c3c']
    
    bars = ax1.bar(x, rates, color=colors, alpha=0.7, width=0.6)
    ax1.errorbar(x, rates, 
                 yerr=[np.array(rates) - np.array(ci_lower), 
                       np.array(ci_upper) - np.array(rates)],
                 fmt='none', color='black', capsize=5, capthick=2)
    
    # Add value labels
    for i, (variant, rate) in enumerate(zip(variants, rates)):
        ax1.text(i, rate + 0.01, f'{rate:.2%}', ha='center', fontweight='bold')
    
    ax1.set_ylabel('Conversion Rate')
    ax1.set_title('Conversion Rate by Variant\n(with 95% Confidence Intervals)')
    ax1.set_xticks(x)
    ax1.set_xticklabels(variants)
    ax1.set_ylim(0, max(rates) * 1.2)
    
    # Plot 2: Effect size visualization
    uplift = sig_test['relative_uplift']
    ci_lower_pct = (sig_test['ci_lower'] / metrics['control']['rate'])
    ci_upper_pct = (sig_test['ci_upper'] / metrics['control']['rate'])
    
    ax2.barh(['Effect'], [uplift * 100], color='green' if uplift > 0 else 'red', alpha=0.7)
    ax2.errorbar([uplift * 100], ['Effect'],
                 xerr=[[uplift * 100 - ci_lower_pct * 100], [ci_upper_pct * 100 - uplift * 100]],
                 fmt='none', color='black', capsize=5, capthick=2)
    
    # Add significance indicator
    sig_text = "✅ Significant" if sig_test['significant'] else "❌ Not Significant"
    ax2.text(uplift * 100, 0, f"  {uplift*100:+.1f}%\n  {sig_text}",
             va='center', fontweight='bold')
    
    ax2.axvline(0, color='black', linestyle='--', alpha=0.5)
    ax2.set_xlabel('Relative Uplift (%)')
    ax2.set_title(f'Treatment Effect\n(p-value: {sig_test["p_value"]:.4f})')
    
    plt.tight_layout()
    plt.savefig('ab_test_results.png', dpi=300, bbox_inches='tight')
    plt.show()

plot_ab_test_results(metrics, sig_test)
```

### Step 8: Generate Decision Recommendation

```python
def generate_recommendation(sig_test, guardrails, power_analysis, srm):
    """
    Provide clear recommendation based on all checks
    """
    
    print(f"\n{'='*60}")
    print("🎯 RECOMMENDATION")
    print('='*60)
    
    # Check for blockers
    blockers = []
    
    if srm['srm_detected']:
        blockers.append("Sample Ratio Mismatch detected - randomization issue")
    
    if power_analysis['power'] < 0.70:
        blockers.append(f"Underpowered ({power_analysis['power']:.0%}) - results unreliable")
    
    degraded_guardrails = [g for g in guardrails if g['degraded']]
    if degraded_guardrails:
        blockers.append(f"Guardrail metrics degraded: {[g['metric'] for g in degraded_guardrails]}")
    
    # Make recommendation
    if blockers:
        print(f"\n❌ DO NOT SHIP - Critical Issues Found:\n")
        for blocker in blockers:
            print(f"  • {blocker}")
        recommendation = "DO_NOT_SHIP"
    
    elif sig_test['significant'] and sig_test['relative_uplift'] > 0:
        print(f"\n✅ RECOMMEND SHIPPING")
        print(f"\n  Treatment shows {sig_test['relative_uplift']:+.1%} improvement")
        print(f"  Statistically significant (p={sig_test['p_value']:.4f})")
        print(f"  No guardrail issues detected")
        
        # Estimate impact
        if 'control' in metrics:
            baseline_rate = metrics['control']['rate']
            sample_size = metrics['control']['n']
            print(f"\n  Expected Impact:")
            print(f"    If applied to {sample_size:,} users monthly:")
            print(f"    Additional conversions: {sample_size * sig_test['absolute_uplift']:+,.0f}/month")
        
        recommendation = "SHIP"
    
    elif sig_test['significant'] and sig_test['relative_uplift'] < 0:
        print(f"\n❌ DO NOT SHIP")
        print(f"\n  Treatment shows {sig_test['relative_uplift']:.1%} degradation")
        print(f"  Statistically significant negative impact")
        recommendation = "DO_NOT_SHIP"
    
    else:
        print(f"\n⚠️  NO CLEAR WINNER")
        print(f"\n  Treatment shows {sig_test['relative_uplift']:+.1%} change")
        print(f"  But NOT statistically significant (p={sig_test['p_value']:.4f})")
        print(f"\n  Options:")
        print(f"    1. Ship if change is low-risk and directionally positive")
        print(f"    2. Run longer to gather more data")
        print(f"    3. Redesign with larger expected effect")
        recommendation = "INCONCLUSIVE"
    
    return recommendation

recommendation = generate_recommendation(sig_test, guardrails, power_analysis, srm)
```

## Context Validation

Before proceeding, verify:
- [ ] Test ran long enough to reach statistical power
- [ ] Randomization was properly implemented
- [ ] No SRM (sample ratio mismatch) detected
- [ ] Primary metric is clearly defined
- [ ] Have baseline data for power calculations
- [ ] Understand minimum detectable effect needed

## Output Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A/B TEST ANALYSIS REPORT
Test: Green Button vs Blue Button
Period: Dec 1-15, 2024
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ RECOMMENDATION: SHIP TREATMENT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESULTS SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Primary Metric: Conversion Rate

Control:
  Sample: 10,000 users
  Conversions: 1,200
  Rate: 12.0% (95% CI: 11.3% - 12.7%)

Treatment:
  Sample: 10,000 users
  Conversions: 1,350
  Rate: 13.5% (95% CI: 12.8% - 14.2%)

Effect:
  Absolute: +1.5 percentage points
  Relative: +12.5%
  95% CI: [+0.4%, +2.6%]

Statistical Significance:
  Z-score: 2.65
  P-value: 0.0080
  Result: ✅ SIGNIFICANT (p < 0.05)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ VALIDATION CHECKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sample Ratio: ✅ PASS
  Expected: 50/50
  Actual: 50.0% / 50.0%
  No randomization issues detected

Statistical Power: ✅ PASS
  Achieved: 85%
  Effect Size: 0.042 (Cohen's h)

Guardrail Metrics: ✅ PASS
  Page Load Time: No degradation
  Bounce Rate: -2.1% (improved)
  Error Rate: No change

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 EXPECTED IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monthly Volume: 300,000 users

Additional Conversions: +3,750/month
Revenue Impact: +$187,500/month
  (assuming $50 avg order value)

Confidence: High
Risk: Low

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✅ Ship treatment to 100% of users
2. Monitor for 1 week post-launch
3. Track conversion rate stays elevated
4. Iterate: Test other button colors?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 FILES GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ ab_test_results.png (visualization)
✓ statistical_analysis.csv (detailed metrics)
✓ power_analysis.txt (power calculations)
✓ guardrail_check.csv (all guardrail metrics)
```

## Common Scenarios

### Scenario 1: "Should we ship this new feature?"
→ Run full significance test
→ Check guardrail metrics
→ Calculate expected business impact
→ Provide clear ship/don't ship recommendation
→ Quantify confidence level

### Scenario 2: "Test is inconclusive after 2 weeks"
→ Calculate achieved power
→ Determine if more time would help
→ Estimate time needed to reach significance
→ Recommend: run longer, redesign, or make business decision

### Scenario 3: "Validate test design before launching"
→ Calculate required sample size
→ Estimate test duration
→ Review randomization approach
→ Check guardrail metrics are defined
→ Prevent common pitfalls

### Scenario 4: "Multiple variants to compare"
→ Use ANOVA or pairwise comparisons
→ Apply Bonferroni correction for multiple testing
→ Identify best performing variant
→ Check if any significantly better than control

### Scenario 5: "Test shows improvement but stakeholders skeptical"
→ Show statistical rigor (significance, power, CI)
→ Rule out SRM and other technical issues
→ Demonstrate guardrails not degraded
→ Provide expected business impact
→ Build confidence with data

## Handling Missing Context

**User shares results without test design:**
"To properly analyze, I need to know:
- What was tested (control vs treatment)
- How users were randomized
- What metric we're measuring
- Expected/desired effect size

Can you share the test plan?"

**User doesn't know if sample size is enough:**
"Let me calculate the required sample size based on:
- Baseline conversion rate
- Desired uplift to detect
- Acceptable error rates

Then compare to what you have."

**User concerned about p-value close to 0.05:**
"P-value of 0.049 is technically significant, but borderline. Let's:
- Check confidence interval (does it cross zero?)
- Review statistical power
- Consider practical significance
- Possibly run longer for more confidence"

**User wants to peek at results mid-test:**
"Peeking increases false positive rate. If we must:
- Apply alpha spending function
- Use sequential testing methods
- Or just note results are preliminary"

## Advanced Options

After basic analysis, offer:

**Bayesian Analysis**:
"Want probability that treatment is better? Bayesian approach gives you 'P(treatment > control)'"

**Sequential Testing**:
"Planning to check results multiple times? I can adjust for peeking using sequential testing methods"

**Heterogeneous Treatment Effects**:
"Want to see if treatment works better for certain user segments? I can analyze by subgroup"

**Long-term Impact Estimation**:
"I can estimate sustained lift accounting for novelty effect and regression to mean"

**Multi-Armed Bandit**:
"For continuous optimization, consider switching to bandit algorithm instead of fixed A/B test"

**Sample Size Calculator**:
"Planning your next test? I can calculate required sample size for desired power and effect"
