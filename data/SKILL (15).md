---
name: segmentation-analysis
description: Customer/user segmentation with actionable insights. Use when identifying distinct customer groups, analyzing segment-specific behavior, profiling high-value segments, or testing segmentation hypotheses.
---

# Segmentation Analysis

## Quick Start

Identify meaningful user segments through data-driven clustering or rule-based segmentation, profile each segment, and generate actionable insights for targeted strategies.

## Context Requirements

Before analyzing segments, I need:

1. **User Data**: Individual-level data with attributes and behaviors
2. **Segmentation Approach**: Clustering (data-driven) vs rule-based (business logic)
3. **Key Variables**: What attributes/behaviors define segments
4. **Business Context**: What decisions will segmentation inform
5. **Existing Segments** (optional): Current segmentation to validate/improve

## Context Gathering

### For User Data:
"I need user-level data showing who your users are and what they do:

**Demographics/Attributes:**
- User ID, signup date, location, plan type, etc.

**Behavioral Data:**
- Purchase history, engagement metrics, feature usage
- Example: 'sessions_per_month', 'revenue_lifetime', 'last_active_date'

**Format Options:**
```
user_id | age | plan  | monthly_spend | sessions_month | ...
12345   | 32  | pro   | 99.00         | 45             | ...
```

What user data do you have available?"

### For Segmentation Approach:
"How do you want to segment users?

**Option 1 - Data-Driven (Clustering):**
- Let the data reveal natural groups
- K-means, hierarchical clustering, etc.
- Good when you don't know segments upfront
- Example: 'Find 5 distinct user types'

**Option 2 - Rule-Based (Business Logic):**
- Define segments with specific rules
- Based on domain knowledge
- Good when you have hypotheses
- Example: 'Heavy users: >20 sessions/month, Light: <5'

**Option 3 - RFM (Recency, Frequency, Monetary):**
- Classic e-commerce segmentation
- Based on purchase behavior
- Creates segments like 'Champions', 'At Risk', etc.

Which approach fits your needs?"

### For Key Variables:
"Which attributes/behaviors matter most for segmentation?

**Engagement Variables:**
- Login frequency, session duration
- Feature usage patterns
- Content consumption

**Value Variables:**
- Revenue, LTV, average order value
- Plan type, subscription tier

**Lifecycle Variables:**
- Days since signup, cohort
- Activation status, churn risk

**Demographic Variables:**
- Industry, company size, role
- Geography, device preference

Select 3-7 most important variables for meaningful segmentation."

### For Business Context:
"What will you do with these segments?

**Common Use Cases:**
- **Product development**: Prioritize features for high-value segments
- **Marketing**: Targeted messaging and campaigns
- **Pricing**: Custom plans for different segments
- **Retention**: Segment-specific engagement strategies
- **Sales**: Tailor approach by customer type

Knowing the goal helps create actionable segments."

### For Validation:
"Do you have existing segments to compare against?

If yes:
- I can validate if current segments are distinct
- Show overlap/gaps in current segmentation
- Suggest improvements

If no:
- I'll create segments from scratch
- Validate with business logic checks"

## Workflow

### Step 1: Load and Explore Data

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from scipy.cluster.hierarchy import dendrogram, linkage
from scipy.spatial.distance import pdist

# Load user data
users = pd.read_csv('user_data.csv')

print(f"📊 User Data Loaded:")
print(f"  Total Users: {len(users):,}")
print(f"  Features: {len(users.columns)}")
print(f"\n  Columns: {users.columns.tolist()}")

# Check for missing values
missing = users.isnull().sum()
if missing.sum() > 0:
    print(f"\n⚠️  Missing Values:")
    print(missing[missing > 0])
```

**Checkpoint**: "Data loaded. Ready to select segmentation variables?"

### Step 2: Select and Prepare Segmentation Variables

```python
# Define segmentation variables
segment_vars = [
    'monthly_sessions',
    'total_revenue',
    'days_since_signup',
    'feature_adoption_score',
    'support_tickets'
]

# Create clean dataset
df_segment = users[['user_id'] + segment_vars].copy()

# Handle missing values
df_segment = df_segment.dropna()

# Remove outliers (optional - use with caution)
def remove_outliers_iqr(df, columns):
    """Remove outliers using IQR method"""
    df_clean = df.copy()
    for col in columns:
        Q1 = df_clean[col].quantile(0.25)
        Q3 = df_clean[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        df_clean = df_clean[(df_clean[col] >= lower) & (df_clean[col] <= upper)]
    return df_clean

df_segment = remove_outliers_iqr(df_segment, segment_vars)

print(f"\n📋 Segmentation Dataset:")
print(f"  Users: {len(df_segment):,}")
print(f"  Variables: {segment_vars}")
print(f"\n  Summary Statistics:")
print(df_segment[segment_vars].describe())

# Standardize features (important for clustering)
scaler = StandardScaler()
df_scaled = pd.DataFrame(
    scaler.fit_transform(df_segment[segment_vars]),
    columns=segment_vars,
    index=df_segment.index
)
```

### Step 3: Determine Optimal Number of Segments

```python
def find_optimal_clusters(df_scaled, max_k=10):
    """
    Use elbow method and silhouette score to find optimal k
    """
    from sklearn.metrics import silhouette_score
    
    inertias = []
    silhouettes = []
    K_range = range(2, max_k + 1)
    
    for k in K_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(df_scaled)
        inertias.append(kmeans.inertia_)
        silhouettes.append(silhouette_score(df_scaled, kmeans.labels_))
    
    # Plot results
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    
    # Elbow plot
    ax1.plot(K_range, inertias, marker='o')
    ax1.set_xlabel('Number of Clusters (k)')
    ax1.set_ylabel('Inertia (Within-Cluster Sum of Squares)')
    ax1.set_title('Elbow Method for Optimal k')
    ax1.grid(True, alpha=0.3)
    
    # Silhouette plot
    ax2.plot(K_range, silhouettes, marker='o', color='green')
    ax2.set_xlabel('Number of Clusters (k)')
    ax2.set_ylabel('Silhouette Score')
    ax2.set_title('Silhouette Score by k (higher is better)')
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('optimal_clusters.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    # Recommend k
    best_k = K_range[np.argmax(silhouettes)]
    print(f"\n📊 Optimal Clusters Analysis:")
    print(f"  Recommended k: {best_k} (highest silhouette score)")
    print(f"  Silhouette scores: {dict(zip(K_range, [f'{s:.3f}' for s in silhouettes]))}")
    
    return best_k

optimal_k = find_optimal_clusters(df_scaled, max_k=8)
```

**Checkpoint**: "Based on the analysis, does {optimal_k} segments make business sense? Or prefer a different number?"

### Step 4: Create Segments (K-Means Clustering)

```python
# Run K-means with optimal k
n_clusters = optimal_k  # or user-specified

kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
df_segment['segment'] = kmeans.fit_predict(df_scaled)

print(f"\n✅ Segmentation Complete:")
print(f"  Created {n_clusters} segments")
print(f"\n  Segment Distribution:")
print(df_segment['segment'].value_counts().sort_index())
```

### Step 5: Profile Each Segment

```python
def profile_segments(df_segment, segment_vars):
    """
    Create detailed profiles for each segment
    """
    
    profiles = []
    
    for seg_id in sorted(df_segment['segment'].unique()):
        seg_data = df_segment[df_segment['segment'] == seg_id]
        
        profile = {
            'segment_id': seg_id,
            'size': len(seg_data),
            'pct_of_total': len(seg_data) / len(df_segment) * 100
        }
        
        # Calculate mean for each variable
        for var in segment_vars:
            profile[f'{var}_mean'] = seg_data[var].mean()
            profile[f'{var}_median'] = seg_data[var].median()
        
        profiles.append(profile)
    
    df_profiles = pd.DataFrame(profiles)
    
    # Calculate relative importance (vs overall average)
    for var in segment_vars:
        overall_mean = df_segment[var].mean()
        df_profiles[f'{var}_vs_avg'] = (
            (df_profiles[f'{var}_mean'] - overall_mean) / overall_mean * 100
        )
    
    return df_profiles

profiles = profile_segments(df_segment, segment_vars)

print(f"\n📊 Segment Profiles:\n")
print(profiles.to_string(index=False))
```

### Step 6: Name and Interpret Segments

```python
def name_segments(profiles, segment_vars):
    """
    Assign meaningful names based on segment characteristics
    """
    
    segment_names = {}
    
    for _, row in profiles.iterrows():
        seg_id = int(row['segment_id'])
        
        # Identify defining characteristics
        characteristics = []
        
        for var in segment_vars:
            vs_avg = row[f'{var}_vs_avg']
            
            if abs(vs_avg) > 50:  # 50% above/below average
                direction = "High" if vs_avg > 0 else "Low"
                characteristics.append(f"{direction} {var.replace('_', ' ').title()}")
        
        # Create name
        if not characteristics:
            name = f"Average Users"
        else:
            name = " & ".join(characteristics[:2])  # Use top 2 characteristics
        
        segment_names[seg_id] = name
        
        print(f"\nSegment {seg_id}: {name}")
        print(f"  Size: {row['size']:,} users ({row['pct_of_total']:.1f}%)")
        print(f"  Key Characteristics:")
        for var in segment_vars:
            mean_val = row[f'{var}_mean']
            vs_avg = row[f'{var}_vs_avg']
            print(f"    • {var}: {mean_val:.1f} ({vs_avg:+.0f}% vs avg)")
    
    return segment_names

segment_names = name_segments(profiles, segment_vars)

# Add names to segment data
df_segment['segment_name'] = df_segment['segment'].map(segment_names)
```

### Step 7: Visualize Segments

```python
def visualize_segments(df_segment, df_scaled, segment_vars):
    """
    Create comprehensive segment visualizations
    """
    
    # PCA for 2D visualization
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(df_scaled)
    
    fig = plt.figure(figsize=(16, 10))
    
    # Plot 1: PCA scatter
    ax1 = plt.subplot(2, 3, 1)
    scatter = ax1.scatter(pca_result[:, 0], pca_result[:, 1], 
                         c=df_segment['segment'], cmap='viridis', alpha=0.6)
    ax1.set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)')
    ax1.set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)')
    ax1.set_title('Segment Distribution (PCA)')
    plt.colorbar(scatter, ax=ax1, label='Segment')
    
    # Plot 2: Segment sizes
    ax2 = plt.subplot(2, 3, 2)
    segment_counts = df_segment['segment_name'].value_counts()
    ax2.barh(range(len(segment_counts)), segment_counts.values)
    ax2.set_yticks(range(len(segment_counts)))
    ax2.set_yticklabels(segment_counts.index)
    ax2.set_xlabel('Number of Users')
    ax2.set_title('Segment Sizes')
    
    for i, v in enumerate(segment_counts.values):
        ax2.text(v, i, f' {v:,}', va='center')
    
    # Plot 3-5: Key variables by segment
    for idx, var in enumerate(segment_vars[:3], start=3):
        ax = plt.subplot(2, 3, idx)
        
        data_by_segment = [df_segment[df_segment['segment'] == seg][var].values 
                          for seg in sorted(df_segment['segment'].unique())]
        
        ax.boxplot(data_by_segment, labels=[segment_names[i] 
                   for i in sorted(df_segment['segment'].unique())])
        ax.set_ylabel(var.replace('_', ' ').title())
        ax.set_title(f'{var.replace("_", " ").title()} by Segment')
        ax.tick_params(axis='x', rotation=45)
    
    # Plot 6: Radar chart
    ax6 = plt.subplot(2, 3, 6, projection='polar')
    
    # Normalize profiles for radar chart
    angles = np.linspace(0, 2 * np.pi, len(segment_vars), endpoint=False).tolist()
    angles += angles[:1]
    
    for seg_id in sorted(df_segment['segment'].unique()):
        seg_data = df_segment[df_segment['segment'] == seg_id]
        values = [seg_data[var].mean() / df_segment[var].max() 
                 for var in segment_vars]
        values += values[:1]
        
        ax6.plot(angles, values, 'o-', linewidth=2, 
                label=segment_names[seg_id])
        ax6.fill(angles, values, alpha=0.15)
    
    ax6.set_xticks(angles[:-1])
    ax6.set_xticklabels([var.replace('_', ' ').title() for var in segment_vars])
    ax6.set_title('Segment Profiles (Normalized)')
    ax6.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0))
    
    plt.tight_layout()
    plt.savefig('segment_analysis.png', dpi=300, bbox_inches='tight')
    plt.show()

visualize_segments(df_segment, df_scaled, segment_vars)
```

### Step 8: Generate Actionable Insights

```python
def generate_segment_insights(df_segment, profiles, segment_names):
    """
    Create actionable recommendations for each segment
    """
    
    print(f"\n{'='*70}")
    print("💡 ACTIONABLE INSIGHTS BY SEGMENT")
    print('='*70)
    
    # Identify high-value segments
    if 'total_revenue' in df_segment.columns:
        segment_revenue = df_segment.groupby('segment')['total_revenue'].sum().sort_values(ascending=False)
        top_revenue_seg = segment_revenue.index[0]
        
        print(f"\n🏆 HIGHEST VALUE SEGMENT: {segment_names[top_revenue_seg]}")
        print(f"  Revenue: ${segment_revenue.iloc[0]:,.0f}")
        print(f"  Size: {len(df_segment[df_segment['segment'] == top_revenue_seg]):,} users")
        print(f"  Action: Prioritize retention and expansion for this segment")
    
    # Identify growth opportunity segments
    if 'monthly_sessions' in df_segment.columns:
        for seg_id, name in segment_names.items():
            seg_data = df_segment[df_segment['segment'] == seg_id]
            
            print(f"\n📊 {name}:")
            print(f"  Size: {len(seg_data):,} users")
            
            # Characterize segment
            if 'total_revenue' in seg_data.columns:
                avg_revenue = seg_data['total_revenue'].mean()
                print(f"  Avg Revenue: ${avg_revenue:.2f}")
            
            engagement = seg_data['monthly_sessions'].mean()
            print(f"  Avg Sessions: {engagement:.1f}/month")
            
            # Recommendations
            print(f"  Recommended Actions:")
            
            if engagement > df_segment['monthly_sessions'].mean() * 1.5:
                print(f"    ✓ High engagement - Focus on monetization")
                print(f"    ✓ Test premium features/upsells")
            elif engagement < df_segment['monthly_sessions'].mean() * 0.5:
                print(f"    ⚠️  Low engagement - Focus on activation")
                print(f"    ✓ Onboarding improvements")
                print(f"    ✓ Re-engagement campaigns")
            else:
                print(f"    ✓ Moderate engagement - Growth opportunity")
                print(f"    ✓ Feature education")
                print(f"    ✓ Use case expansion")

generate_segment_insights(df_segment, profiles, segment_names)
```

### Step 9: Create Segment Strategy Matrix

```python
def create_strategy_matrix(profiles, segment_names):
    """
    Map segments to recommended strategies
    """
    
    strategies = []
    
    for seg_id, name in segment_names.items():
        profile = profiles[profiles['segment_id'] == seg_id].iloc[0]
        
        # Determine strategy based on profile
        if 'total_revenue_mean' in profile:
            revenue = profile['total_revenue_mean']
            engagement = profile.get('monthly_sessions_mean', 0)
            
            if revenue > profiles['total_revenue_mean'].mean():
                if engagement > profiles.get('monthly_sessions_mean', pd.Series([0])).mean():
                    strategy = "Retain & Expand"
                    priority = "High"
                else:
                    strategy = "Re-engage"
                    priority = "Medium"
            else:
                if engagement > profiles.get('monthly_sessions_mean', pd.Series([0])).mean():
                    strategy = "Monetize"
                    priority = "High"
                else:
                    strategy = "Activate or Sunset"
                    priority = "Low"
        else:
            strategy = "Analyze Further"
            priority = "Medium"
        
        strategies.append({
            'segment': name,
            'size': int(profile['size']),
            'strategy': strategy,
            'priority': priority
        })
    
    df_strategy = pd.DataFrame(strategies)
    
    print(f"\n{'='*70}")
    print("📋 SEGMENT STRATEGY MATRIX")
    print('='*70)
    print(df_strategy.to_string(index=False))
    
    return df_strategy

strategy_matrix = create_strategy_matrix(profiles, segment_names)

# Save results
df_segment.to_csv('user_segments.csv', index=False)
profiles.to_csv('segment_profiles.csv', index=False)
strategy_matrix.to_csv('segment_strategies.csv', index=False)
```

## Context Validation

Before proceeding, verify:
- [ ] Have sufficient user-level data with relevant variables
- [ ] Segmentation variables are clean and meaningful
- [ ] Sample size is adequate for clustering (min 100 users per expected segment)
- [ ] Understand business context for interpreting segments
- [ ] Have stakeholder buy-in on segmentation approach

## Output Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGMENTATION ANALYSIS REPORT
User Base: 50,000 customers
Analysis Date: January 11, 2025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 SEGMENTS IDENTIFIED: 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGMENT 1: Power Users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Size: 8,500 users (17%)

Profile:
  • Monthly Sessions: 45 (+180% vs avg)
  • Total Revenue: $1,250 (+220% vs avg)
  • Feature Adoption: 85% (+95% vs avg)
  • Support Tickets: 2 (-33% vs avg)

Characteristics:
  ✓ Highly engaged across all features
  ✓ Highest revenue contribution (45% of total)
  ✓ Low support needs
  ✓ Strong product advocates

Recommended Strategy:
  Priority: HIGH
  Focus: Retention & Expansion
  
  Actions:
  1. VIP program with dedicated support
  2. Beta access to new features
  3. Referral incentives
  4. Advocacy/community leadership
  
  Risk: High churn impact - monitor closely

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGMENT 2: Growth Potential
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Size: 15,000 users (30%)

Profile:
  • Monthly Sessions: 12 (-25% vs avg)
  • Total Revenue: $450 (+15% vs avg)
  • Feature Adoption: 35% (-20% vs avg)
  • Support Tickets: 4 (+33% vs avg)

Characteristics:
  ✓ Willing to pay but under-engaged
  ✓ Using only core features
  ✓ Higher support needs

Recommended Strategy:
  Priority: HIGH
  Focus: Feature Education & Engagement
  
  Actions:
  1. Onboarding optimization
  2. Feature discovery campaigns
  3. Use case webinars
  4. In-app guidance improvements
  
  Opportunity: +$200/user if engaged like Segment 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGMENT 3: Free Riders
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Size: 12,000 users (24%)

Profile:
  • Monthly Sessions: 8 (-50% vs avg)
  • Total Revenue: $0 (-100% vs avg)
  • Feature Adoption: 25% (-43% vs avg)
  • Days Since Signup: 180 (+125% vs avg)

Characteristics:
  ✓ Long-term free tier users
  ✓ Minimal engagement
  ✓ Not converting to paid

Recommended Strategy:
  Priority: MEDIUM
  Focus: Monetization or Graduation
  
  Actions:
  1. Freemium limit enforcement
  2. Value demonstration campaigns
  3. Upgrade incentives
  4. Or: Accept as brand awareness
  
  Decision Point: Monetize or reduce support costs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGMENT 4: At Risk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Size: 6,500 users (13%)

Profile:
  • Monthly Sessions: 2 (-88% vs avg)
  • Total Revenue: $300 (-23% vs avg)
  • Days Since Last Active: 45 (+350% vs avg)
  • Feature Adoption: 20% (-54% vs avg)

Characteristics:
  ⚠️  Dramatically declining engagement
  ⚠️  Still paying but not using product
  ⚠️  High churn risk

Recommended Strategy:
  Priority: HIGH
  Focus: Win-Back & Retention
  
  Actions:
  1. IMMEDIATE: Win-back campaign
  2. Churn risk outreach
  3. Investigate friction points
  4. Offer migration/offboarding support
  
  Critical: Prevent churn in next 30 days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGMENT 5: New Adopters
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Size: 8,000 users (16%)

Profile:
  • Days Since Signup: 15 (-85% vs avg)
  • Monthly Sessions: 18 (+13% vs avg)
  • Total Revenue: $250 (-36% vs avg)
  • Feature Adoption: 45% (+3% vs avg)

Characteristics:
  ✓ Recent signups
  ✓ Good early engagement
  ✓ Still in trial/onboarding

Recommended Strategy:
  Priority: HIGH
  Focus: Activation & Conversion
  
  Actions:
  1. Optimize onboarding flow
  2. Trial-to-paid conversion campaigns
  3. Quick wins demonstration
  4. Early success check-ins
  
  Goal: Graduate to Power Users or Growth segments

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRATEGIC PRIORITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Protect Power Users (17% of users, 45% of revenue)
   → Retention programs, VIP treatment

2. Engage Growth Potential (30% of users)
   → Feature education, +$3M revenue opportunity

3. Win Back At Risk (13% of users)
   → Prevent $2M annual churn

4. Convert New Adopters (16% of users)
   → Onboarding optimization

5. Decision on Free Riders (24% of users)
   → Monetize or optimize costs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Week 1:
  • Present segmentation to stakeholders
  • Validate segment definitions
  • Prioritize 2-3 segments for immediate action

Week 2-4:
  • Launch targeted campaigns for priority segments
  • Implement segment tracking in analytics
  • Create segment-specific dashboards

Ongoing:
  • Monitor segment migration (users moving between segments)
  • Refresh segmentation quarterly
  • Measure strategy effectiveness

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILES GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ user_segments.csv (user-level segments)
✓ segment_profiles.csv (aggregate profiles)
✓ segment_strategies.csv (recommended actions)
✓ segment_analysis.png (visualizations)
✓ optimal_clusters.png (cluster analysis)
```

## Common Scenarios

### Scenario 1: "Who are our best customers?"
→ Run clustering analysis
→ Identify high-value segment characteristics
→ Profile demographics and behaviors
→ Create lookalike targeting strategy
→ Calculate segment LTV

### Scenario 2: "Create personas for product team"
→ Use clustering to find natural groups
→ Enrich with qualitative research
→ Name segments memorably
→ Document use cases and pain points
→ Map to product roadmap

### Scenario 3: "Why is churn high? Which users are at risk?"
→ Segment by engagement + revenue
→ Identify "at risk" segment
→ Analyze common characteristics
→ Predict churn risk for individual users
→ Design win-back campaigns

### Scenario 4: "Validate existing segmentation"
→ Compare business-defined vs data-driven segments
→ Calculate segment overlap/distinctiveness
→ Show gaps in current segmentation
→ Recommend improvements
→ Measure segment performance over time

### Scenario 5: "Personalize marketing by customer type"
→ Create actionable segments (not too many)
→ Profile messaging preferences by segment
→ Calculate segment-specific metrics
→ Build targeting rules for tools
→ Track campaign performance by segment

## Handling Missing Context

**User wants segmentation but unclear on purpose:**
"Let me understand what you'll do with segments:
- Targeted marketing campaigns?
- Product prioritization?
- Pricing strategy?
- Customer success focus?

The use case determines the right segmentation approach."

**User has limited behavioral data:**
"We can start with firmographic/demographic segmentation (company size, industry, plan type), then enrich with behavioral data as it becomes available."

**User asks "how many segments?":**
"Typical range is 3-7 segments - enough to be actionable, not so many you can't treat them differently. Let me analyze the data to recommend optimal number."

**Too many variables to choose from:**
"Let's prioritize variables that:
1. Vary significantly across users
2. Relate to business outcomes (revenue, retention)
3. Are actionable (you can target differently)

Start with 3-5 most important."

## Advanced Options

After basic segmentation, offer:

**RFM Analysis**:
"For e-commerce/subscription businesses, I can create classic RFM (Recency, Frequency, Monetary) segments with 11 standard categories."

**Predictive Segmentation**:
"I can add predictive scores (churn risk, upsell propensity) to segments for more actionable targeting."

**Hierarchical Segmentation**:
"Want nested segments? Example: 3 macro segments, each split into 2-3 micro segments for 6-9 total."

**Segment Migration Analysis**:
"I can track how users move between segments over time to measure strategy effectiveness."

**Lookalike Modeling**:
"Based on best segment, I can score new users on similarity for early identification."

**Dynamic Segmentation**:
"I can set up automated re-segmentation as user behavior changes, with alerts when users change segments."
