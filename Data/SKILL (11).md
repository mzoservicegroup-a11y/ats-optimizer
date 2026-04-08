---
name: business-metrics-calculator
description: Standard business metric calculation with industry benchmarks. Use when calculating SaaS metrics (MRR, churn, LTV, CAC), e-commerce KPIs, or product analytics metrics with proper definitions.
---

# Business Metrics Calculator

## Quick Start

Calculate standard business metrics with proper definitions, validate calculations against industry standards, and provide context with benchmarks.

## Context Requirements

Before calculating metrics, I need:

1. **Business Model**: SaaS, e-commerce, marketplace, etc.
2. **Raw Data**: Underlying data for calculations
3. **Metric Definitions**: How metrics should be calculated
4. **Time Period**: Which period(s) to calculate for
5. **Segmentation** (optional): Break down by customer type, plan, etc.

## Context Gathering

### For Business Model:
"What type of business are we calculating metrics for?

**Common Models:**
- **SaaS/Subscription**: MRR, ARR, churn, LTV
- **E-commerce**: GMV, AOV, CAC, ROAS
- **Marketplace**: Take rate, liquidity, GMV
- **Product/App**: DAU/MAU, retention, engagement
- **Media/Content**: CPM, viewability, engagement

Each has standard metric definitions we should follow."

### For Raw Data:
"I need the underlying data. Please provide:

**For SaaS Metrics:**
```
customer_id | plan_type | mrr | start_date | end_date | status
12345       | pro       | 99  | 2024-01-01 | NULL     | active
```

**For E-commerce Metrics:**
```
order_id | customer_id | order_date | order_value | items
67890    | 12345      | 2024-12-15 | 250.00      | 3
```

**For Product Metrics:**
```
user_id | date       | sessions | events_count
12345   | 2024-12-15 | 5        | 45
```

What format is your data in?"

### For Metric Definitions:
"Do you have standard metric definitions documented?

**If yes:**
- Share your data dictionary or metric glossary
- I'll calculate using your definitions

**If no:**
- I'll use industry-standard definitions
- We'll document what each metric means
- You can adjust if needed

Common variations to clarify:
- Churn: Revenue churn vs logo churn vs net churn?
- MRR: Include one-time fees? How handle annual contracts?
- LTV: Simple average or cohort-based calculation?"

### For Time Period:
"Which time period(s) should I calculate for?

**Options:**
- **Single period**: December 2024
- **Time series**: Monthly from Jan-Dec 2024
- **Trailing**: Last 12 months rolling
- **Cohort-based**: By signup month

Most metrics are calculated monthly or quarterly."

## Workflow

### Step 1: Load and Validate Data

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns

# Load data
subscriptions = pd.read_csv('subscriptions.csv')
subscriptions['start_date'] = pd.to_datetime(subscriptions['start_date'])
subscriptions['end_date'] = pd.to_datetime(subscriptions['end_date'])

print(f"📊 Data Loaded:")
print(f"  Total Subscriptions: {len(subscriptions):,}")
print(f"  Date Range: {subscriptions['start_date'].min()} to {subscriptions['start_date'].max()}")
print(f"  Active Subscriptions: {subscriptions['status'].eq('active').sum():,}")

# Validate data quality
print(f"\n✓ Data Quality Checks:")
missing = subscriptions.isnull().sum()
if missing.sum() == 0:
    print(f"  ✅ No missing values")
else:
    print(f"  ⚠️  Missing values found:")
    print(missing[missing > 0])
```

**Checkpoint**: "Data loaded. Fields look correct?"

### Step 2: Calculate SaaS Metrics

```python
def calculate_saas_metrics(subscriptions, period_start, period_end):
    """
    Calculate standard SaaS metrics for a given period
    """
    
    metrics = {}
    
    # Filter to period
    period_data = subscriptions[
        (subscriptions['start_date'] <= period_end) &
        ((subscriptions['end_date'].isna()) | (subscriptions['end_date'] >= period_start))
    ]
    
    # 1. MRR (Monthly Recurring Revenue)
    metrics['MRR'] = period_data['mrr'].sum()
    
    # 2. ARR (Annual Recurring Revenue)
    metrics['ARR'] = metrics['MRR'] * 12
    
    # 3. Customer Count
    metrics['Total_Customers'] = len(period_data)
    
    # 4. ARPU (Average Revenue Per User)
    metrics['ARPU'] = metrics['MRR'] / metrics['Total_Customers'] if metrics['Total_Customers'] > 0 else 0
    
    # 5. New MRR (from new customers starting in period)
    new_customers = subscriptions[
        (subscriptions['start_date'] >= period_start) &
        (subscriptions['start_date'] <= period_end)
    ]
    metrics['New_MRR'] = new_customers['mrr'].sum()
    metrics['New_Customers'] = len(new_customers)
    
    # 6. Churned MRR (customers who ended in period)
    churned = subscriptions[
        (subscriptions['end_date'] >= period_start) &
        (subscriptions['end_date'] <= period_end)
    ]
    metrics['Churned_MRR'] = churned['mrr'].sum()
    metrics['Churned_Customers'] = len(churned)
    
    # 7. Churn Rate (%)
    start_customers = len(subscriptions[
        (subscriptions['start_date'] < period_start) &
        ((subscriptions['end_date'].isna()) | (subscriptions['end_date'] >= period_start))
    ])
    
    metrics['Customer_Churn_Rate'] = (metrics['Churned_Customers'] / start_customers * 100) if start_customers > 0 else 0
    metrics['Revenue_Churn_Rate'] = (metrics['Churned_MRR'] / (metrics['MRR'] - metrics['New_MRR'] + metrics['Churned_MRR']) * 100) if (metrics['MRR'] - metrics['New_MRR'] + metrics['Churned_MRR']) > 0 else 0
    
    # 8. Expansion MRR (upgrades)
    # Simplified - would need more data for true expansion calculation
    metrics['Expansion_MRR'] = 0  # Placeholder
    
    # 9. Net MRR Churn
    metrics['Net_MRR_Churn'] = metrics['Churned_MRR'] - metrics['Expansion_MRR']
    metrics['Net_MRR_Churn_Rate'] = (metrics['Net_MRR_Churn'] / (metrics['MRR'] - metrics['New_MRR'])) * 100 if (metrics['MRR'] - metrics['New_MRR']) > 0 else 0
    
    # 10. Quick Ratio (Growth Efficiency)
    metrics['Quick_Ratio'] = ((metrics['New_MRR'] + metrics['Expansion_MRR']) / metrics['Churned_MRR']) if metrics['Churned_MRR'] > 0 else float('inf')
    
    return metrics

# Calculate for December 2024
period_start = pd.Timestamp('2024-12-01')
period_end = pd.Timestamp('2024-12-31')

metrics = calculate_saas_metrics(subscriptions, period_start, period_end)

print(f"\n📊 SaaS Metrics for December 2024:")
print(f"{'='*50}")
for metric, value in metrics.items():
    if 'Rate' in metric or 'Ratio' in metric:
        print(f"  {metric}: {value:.2f}%")
    elif 'MRR' in metric or 'ARPU' in metric:
        print(f"  {metric}: ${value:,.2f}")
    else:
        print(f"  {metric}: {value:,.0f}")
```

### Step 3: Calculate LTV and CAC

```python
def calculate_ltv_cac(subscriptions, marketing_spend):
    """
    Calculate Customer Lifetime Value and Customer Acquisition Cost
    """
    
    # CAC (Customer Acquisition Cost)
    total_marketing = marketing_spend['amount'].sum()
    new_customers = len(subscriptions[subscriptions['start_date'] >= '2024-01-01'])
    CAC = total_marketing / new_customers if new_customers > 0 else 0
    
    # LTV (Lifetime Value) - Simple Method
    average_mrr = subscriptions['mrr'].mean()
    average_lifetime_months = 24  # Industry assumption or calculate from churn
    churn_rate = 0.05  # 5% monthly churn
    average_lifetime = 1 / churn_rate if churn_rate > 0 else 24
    
    LTV_simple = average_mrr * average_lifetime
    
    # LTV (Lifetime Value) - Cohort Method (more accurate)
    # Calculate for a specific cohort
    cohort = subscriptions[subscriptions['start_date'].dt.to_period('M') == '2023-01']
    
    if len(cohort) > 0:
        cohort_revenue = cohort['mrr'].sum()
        cohort_months = 12  # Track for 12 months
        LTV_cohort = (cohort_revenue / len(cohort)) * cohort_months
    else:
        LTV_cohort = LTV_simple
    
    # LTV:CAC Ratio
    ltv_cac_ratio = LTV_simple / CAC if CAC > 0 else 0
    
    # Payback Period (months to recover CAC)
    payback_months = CAC / average_mrr if average_mrr > 0 else 0
    
    results = {
        'CAC': CAC,
        'LTV_Simple': LTV_simple,
        'LTV_Cohort': LTV_cohort,
        'LTV_CAC_Ratio': ltv_cac_ratio,
        'Payback_Months': payback_months,
        'Average_MRR': average_mrr,
        'Average_Lifetime_Months': average_lifetime
    }
    
    print(f"\n💰 LTV & CAC Analysis:")
    print(f"{'='*50}")
    print(f"  CAC: ${results['CAC']:,.2f}")
    print(f"  LTV (Simple): ${results['LTV_Simple']:,.2f}")
    print(f"  LTV:CAC Ratio: {results['LTV_CAC_Ratio']:.2f}x")
    print(f"  Payback Period: {results['Payback_Months']:.1f} months")
    
    # Benchmarks
    print(f"\n  📊 Benchmarks:")
    if ltv_cac_ratio >= 3:
        print(f"    ✅ LTV:CAC Ratio: Healthy (>3x)")
    elif ltv_cac_ratio >= 1:
        print(f"    ⚠️  LTV:CAC Ratio: Below target (1-3x)")
    else:
        print(f"    🔴 LTV:CAC Ratio: Critical (<1x)")
    
    if payback_months <= 12:
        print(f"    ✅ Payback Period: Good (<12 months)")
    else:
        print(f"    ⚠️  Payback Period: Long (>12 months)")
    
    return results

# Assuming we have marketing spend data
marketing_spend = pd.DataFrame({
    'date': pd.date_range('2024-01-01', periods=12, freq='M'),
    'amount': [50000] * 12  # $50k/month
})

ltv_cac = calculate_ltv_cac(subscriptions, marketing_spend)
```

### Step 4: Calculate Retention Cohorts

```python
def calculate_retention_cohorts(subscriptions):
    """
    Calculate retention by cohort month
    """
    
    # Prepare cohort data
    subscriptions['cohort'] = subscriptions['start_date'].dt.to_period('M')
    subscriptions['cohort_month'] = subscriptions['cohort'].astype(str)
    
    # Create cohort matrix
    cohorts = subscriptions.groupby('cohort_month').size()
    
    # Calculate retention for each cohort
    retention_data = []
    
    for cohort_date in cohorts.index:
        cohort_subs = subscriptions[subscriptions['cohort_month'] == cohort_date]
        cohort_size = len(cohort_subs)
        
        # Calculate retention for each subsequent month
        for month_num in range(12):
            period_end = pd.Timestamp(cohort_date) + pd.DateOffset(months=month_num)
            
            retained = cohort_subs[
                (cohort_subs['end_date'].isna()) |
                (cohort_subs['end_date'] > period_end)
            ]
            
            retention_rate = len(retained) / cohort_size * 100
            
            retention_data.append({
                'cohort': cohort_date,
                'month': month_num,
                'retained': len(retained),
                'retention_rate': retention_rate
            })
    
    df_retention = pd.DataFrame(retention_data)
    
    # Pivot for heatmap
    retention_matrix = df_retention.pivot(
        index='cohort', 
        columns='month', 
        values='retention_rate'
    )
    
    # Plot retention heatmap
    plt.figure(figsize=(12, 8))
    sns.heatmap(retention_matrix, annot=True, fmt='.0f', cmap='RdYlGn', 
                vmin=0, vmax=100, cbar_kws={'label': 'Retention %'})
    plt.title('Cohort Retention Analysis')
    plt.xlabel('Months Since Start')
    plt.ylabel('Cohort Month')
    plt.tight_layout()
    plt.savefig('cohort_retention.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    print(f"\n📊 Retention by Cohort:")
    print(retention_matrix.head())
    
    return retention_matrix

retention_matrix = calculate_retention_cohorts(subscriptions)
```

### Step 5: Calculate Unit Economics

```python
def calculate_unit_economics(metrics, ltv_cac):
    """
    Calculate key unit economics metrics
    """
    
    print(f"\n💵 Unit Economics:")
    print(f"{'='*50}")
    
    # Gross Margin (assuming 80% for SaaS)
    gross_margin = 0.80
    gross_profit_per_customer = metrics['ARPU'] * gross_margin
    
    print(f"  ARPU: ${metrics['ARPU']:,.2f}/month")
    print(f"  Gross Margin: {gross_margin:.0%}")
    print(f"  Gross Profit/Customer: ${gross_profit_per_customer:,.2f}/month")
    
    # Magic Number (Sales Efficiency)
    # Net New ARR / Sales & Marketing Spend
    net_new_arr = (metrics['New_MRR'] - metrics['Churned_MRR']) * 12
    sales_marketing_spend = ltv_cac['CAC'] * metrics['New_Customers']
    magic_number = net_new_arr / sales_marketing_spend if sales_marketing_spend > 0 else 0
    
    print(f"\n  Magic Number: {magic_number:.2f}")
    if magic_number >= 0.75:
        print(f"    ✅ Strong sales efficiency (>0.75)")
    elif magic_number >= 0.5:
        print(f"    ⚠️  Moderate efficiency (0.5-0.75)")
    else:
        print(f"    🔴 Low efficiency (<0.5)")
    
    # Rule of 40
    growth_rate = (metrics['New_MRR'] / (metrics['MRR'] - metrics['New_MRR'])) * 100 if (metrics['MRR'] - metrics['New_MRR']) > 0 else 0
    profit_margin = gross_margin * 100  # Simplified
    rule_of_40 = growth_rate + profit_margin
    
    print(f"\n  Rule of 40:")
    print(f"    Growth Rate: {growth_rate:.1f}%")
    print(f"    Profit Margin: {profit_margin:.1f}%")
    print(f"    Combined: {rule_of_40:.1f}%")
    if rule_of_40 >= 40:
        print(f"    ✅ Healthy (≥40%)")
    else:
        print(f"    ⚠️  Below benchmark (<40%)")

calculate_unit_economics(metrics, ltv_cac)
```

### Step 6: Create Metrics Dashboard

```python
def create_metrics_dashboard(metrics_history):
    """
    Visualize key metrics over time
    """
    
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    
    # MRR Growth
    axes[0, 0].plot(metrics_history['month'], metrics_history['MRR'], marker='o')
    axes[0, 0].set_title('MRR Growth')
    axes[0, 0].set_ylabel('MRR ($)')
    axes[0, 0].grid(True, alpha=0.3)
    
    # Churn Rate
    axes[0, 1].plot(metrics_history['month'], metrics_history['Customer_Churn_Rate'], 
                   marker='o', color='red')
    axes[0, 1].axhline(y=5, color='orange', linestyle='--', label='Target (5%)')
    axes[0, 1].set_title('Customer Churn Rate')
    axes[0, 1].set_ylabel('Churn Rate (%)')
    axes[0, 1].legend()
    axes[0, 1].grid(True, alpha=0.3)
    
    # New vs Churned Customers
    x = range(len(metrics_history))
    axes[1, 0].bar([i-0.2 for i in x], metrics_history['New_Customers'], 
                   width=0.4, label='New', color='green', alpha=0.7)
    axes[1, 0].bar([i+0.2 for i in x], metrics_history['Churned_Customers'], 
                   width=0.4, label='Churned', color='red', alpha=0.7)
    axes[1, 0].set_title('New vs Churned Customers')
    axes[1, 0].set_ylabel('Customers')
    axes[1, 0].legend()
    axes[1, 0].grid(True, alpha=0.3)
    
    # ARPU
    axes[1, 1].plot(metrics_history['month'], metrics_history['ARPU'], marker='o', color='purple')
    axes[1, 1].set_title('ARPU Trend')
    axes[1, 1].set_ylabel('ARPU ($)')
    axes[1, 1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('metrics_dashboard.png', dpi=300, bbox_inches='tight')
    plt.show()

# Create sample time series (would use actual data)
metrics_history = pd.DataFrame({
    'month': pd.date_range('2024-01-01', periods=12, freq='M'),
    'MRR': [100000 + i*5000 for i in range(12)],
    'Customer_Churn_Rate': [5.2, 4.8, 5.1, 4.9, 5.3, 4.7, 4.6, 4.8, 5.0, 4.9, 4.7, 4.5],
    'New_Customers': [50, 55, 48, 52, 60, 58, 62, 65, 70, 68, 72, 75],
    'Churned_Customers': [25, 23, 24, 25, 28, 22, 21, 23, 25, 24, 22, 20],
    'ARPU': [45, 46, 47, 48, 48, 49, 50, 51, 51, 52, 53, 54]
})

create_metrics_dashboard(metrics_history)
```

### Step 7: Generate Benchmark Comparison

```python
def benchmark_metrics(metrics, industry='SaaS'):
    """
    Compare metrics against industry benchmarks
    """
    
    benchmarks = {
        'SaaS': {
            'Customer_Churn_Rate': {'good': 5, 'avg': 7, 'poor': 10},
            'Revenue_Churn_Rate': {'good': 5, 'avg': 10, 'poor': 15},
            'LTV_CAC_Ratio': {'good': 3, 'avg': 2, 'poor': 1},
            'Payback_Months': {'good': 12, 'avg': 18, 'poor': 24},
            'Quick_Ratio': {'good': 4, 'avg': 2, 'poor': 1}
        }
    }
    
    print(f"\n📊 Benchmark Comparison (vs {industry} Industry):")
    print(f"{'='*70}")
    
    for metric_name in ['Customer_Churn_Rate', 'Revenue_Churn_Rate', 'Quick_Ratio']:
        if metric_name in metrics:
            value = metrics[metric_name]
            bench = benchmarks[industry][metric_name]
            
            # Determine performance
            if metric_name.endswith('Rate') or metric_name == 'Payback_Months':
                # Lower is better
                if value <= bench['good']:
                    status = "✅ GOOD"
                elif value <= bench['avg']:
                    status = "⚠️  AVERAGE"
                else:
                    status = "🔴 POOR"
            else:
                # Higher is better
                if value >= bench['good']:
                    status = "✅ GOOD"
                elif value >= bench['avg']:
                    status = "⚠️  AVERAGE"
                else:
                    status = "🔴 POOR"
            
            print(f"\n  {metric_name}:")
            print(f"    Your Value: {value:.2f}%")
            print(f"    Industry Good: {bench['good']}%")
            print(f"    Industry Average: {bench['avg']}%")
            print(f"    Status: {status}")

benchmark_metrics(metrics, 'SaaS')
```

## Context Validation

Before proceeding, verify:
- [ ] Have complete data for calculation period
- [ ] Metric definitions align with business needs
- [ ] Understand calculation nuances (e.g., net vs gross churn)
- [ ] Have benchmark context for interpretation
- [ ] Know how metrics will be used for decisions

## Output Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUSINESS METRICS REPORT
Company: [Company Name]
Period: December 2024
Business Model: SaaS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 REVENUE METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MRR (Monthly Recurring Revenue)    $155,000
ARR (Annual Recurring Revenue)     $1,860,000
New MRR                            $12,500
Churned MRR                        $4,200
Net New MRR                        $8,300 (+5.7%)

ARPU (Avg Revenue Per User)        $52.50/mo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 CUSTOMER METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Customers                    2,952
New Customers                      75
Churned Customers                  22
Net Customer Growth                +53 (+1.8%)

Customer Churn Rate                4.7%  ✅ Good
Logo Retention                     95.3%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 UNIT ECONOMICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAC (Customer Acquisition Cost)    $667
LTV (Lifetime Value)                $1,260
LTV:CAC Ratio                      1.89x  ⚠️  Below target

Payback Period                     12.7 months
Quick Ratio                        2.8x  ⚠️  Average

Gross Margin                       82%
Magic Number                       0.71  ✅ Good

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 GROWTH & EFFICIENCY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MRR Growth Rate                    5.7% MoM
Revenue Churn Rate                 2.7%  ✅ Good
Net Revenue Churn                  -0.5% (negative is good)

Rule of 40                         87.7%  ✅ Healthy
  Growth Rate: 68.4%
  Profit Margin: 19.3%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 KEY INSIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ STRENGTHS:
  • Low customer churn (4.7% vs 7% benchmark)
  • Strong growth momentum (+5.7% MoM)
  • Excellent Rule of 40 score (87.7%)
  • Negative net revenue churn (expansion!)

⚠️  AREAS FOR IMPROVEMENT:
  • LTV:CAC ratio below 3x target
  • Need to improve customer acquisition efficiency
  • Payback period slightly long at 12.7 months

🎯 RECOMMENDATIONS:
  1. Optimize CAC: Target reducing to $450 (2.8x LTV:CAC)
  2. Expand existing customers: Already showing negative churn
  3. Improve payback: Focus on faster time-to-value

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 FILES GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ metrics_report.pdf (full report)
✓ metrics_dashboard.png (visualizations)
✓ cohort_retention.png (retention heatmap)
✓ monthly_metrics.csv (time series data)
```

## Common Scenarios

### Scenario 1: "Calculate our SaaS metrics for board deck"
→ Compute MRR, churn, LTV, CAC
→ Compare to previous quarters
→ Benchmark against industry
→ Create executive summary
→ Highlight key movements

### Scenario 2: "Validate our metric calculations"
→ Review current calculation methodology
→ Compare to industry standard definitions
→ Identify discrepancies
→ Document correct approach
→ Recalculate if needed

### Scenario 3: "Understand our unit economics"
→ Calculate LTV and CAC
→ Assess payback period
→ Compute magic number
→ Compare to benchmarks
→ Recommend improvements

### Scenario 4: "Break down metrics by customer segment"
→ Calculate all metrics by segment
→ Compare segment performance
→ Identify high/low value segments
→ Recommend segment strategies

### Scenario 5: "Track metrics over time"
→ Build monthly time series
→ Calculate growth rates
→ Identify trends and inflection points
→ Forecast future metrics
→ Set targets

## Handling Missing Context

**User doesn't know standard definitions:**
"I'll use industry-standard definitions and explain each metric as we calculate. We can adjust if your business has specific nuances."

**Incomplete data:**
"I see we're missing {field}. Options:
1. Estimate using industry averages
2. Calculate subset of metrics with available data
3. Document gaps for future tracking"

**Multiple business models:**
"Your business has both subscription and transaction revenue. I'll calculate metrics for each model separately, then provide blended view."

**Unclear on which metrics matter:**
"Let me calculate comprehensive suite, then we'll identify the 5-7 metrics most relevant for your business model and stage."

## Advanced Options

After basic calculations, offer:

**Predictive Metrics**:
"Want forward-looking metrics? I can forecast MRR, calculate expansion opportunities, project churn impact."

**Cohort Analysis**:
"I can break down all metrics by signup cohort to show how customer quality changes over time."

**Segment Performance**:
"Calculate metrics by customer segment (plan, industry, size) to identify high-value segments."

**Metric Decomposition**:
"I can break down aggregate metrics into components (e.g., churn = early churn + mature churn + seasonal)."

**Benchmarking Database**:
"I can compare your metrics to industry benchmarks by company size, geography, and business model."

**Automated Monitoring**:
"Set up automated metric calculations and alerts when metrics move outside expected ranges."
