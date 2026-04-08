---
name: visualization-builder
description: Create effective, publication-ready data visualizations. Use when choosing chart types, designing dashboards, creating presentation visuals, or building interactive visualizations with best practices.
---

# Visualization Builder

## Quick Start

Create clear, impactful data visualizations that communicate insights effectively using visualization best practices and appropriate chart selection.

## Context Requirements

1. **Data**: What you're visualizing
2. **Message**: Key insight to communicate
3. **Audience**: Technical vs business, detail level needed
4. **Medium**: Dashboard, presentation, report, interactive
5. **Brand**: Colors, style guidelines

## Context Gathering

### For Data:
"What data are you visualizing?
- Variables (categorical, continuous, time)
- Sample size and granularity
- Comparisons needed (categories, time periods, segments)

Example: 'Monthly revenue by product category, 12 months, 5 categories'"

### For Message:
"What's the one key takeaway?
- Trend over time?
- Comparison between groups?
- Composition/breakdown?
- Relationship/correlation?
- Distribution?

Clear message → correct chart type."

### For Audience:
"Who will see this?
- **Technical**: Can handle complexity, likes detail
- **Executive**: Needs simplicity, focuses on insight
- **Public**: Requires self-explanatory design

Audience drives detail level and annotation needs."

## Workflow

### Step 1: Choose Chart Type

```python
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

def recommend_chart_type(data_type, message_type):
    """Recommend appropriate visualization"""
    
    recommendations = {
        ('time_series', 'trend'): 'Line chart',
        ('categories', 'comparison'): 'Bar chart (horizontal if many categories)',
        ('categories', 'composition'): 'Stacked bar or pie chart',
        ('two_variables', 'relationship'): 'Scatter plot',
        ('distribution', 'single'): 'Histogram or box plot',
        ('distribution', 'multiple'): 'Violin plot or overlaid histograms',
        ('geographic', 'comparison'): 'Choropleth map',
        ('hierarchical', 'composition'): 'Treemap or sunburst',
        ('flow', 'process'): 'Sankey diagram'
    }
    
    chart = recommendations.get((data_type, message_type))
    
    print(f"📊 Recommended Chart: {chart}")
    print(f"   For: {message_type} of {data_type}")
    
    return chart

# Example
recommend_chart_type('time_series', 'trend')
```

### Step 2: Design Publication-Quality Visualization

```python
def create_professional_chart(df, title, y_label):
    """Create polished, publication-ready chart"""
    
    # Set style
    sns.set_style("whitegrid")
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.size'] = 11
    
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # Plot data
    colors = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#6A994E']
    
    for i, col in enumerate(df.columns[1:]):
        ax.plot(df['date'], df[col], 
               marker='o', linewidth=2.5, 
               markersize=6, color=colors[i % len(colors)],
               label=col)
    
    # Styling
    ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
    ax.set_xlabel('', fontsize=12)
    ax.set_ylabel(y_label, fontsize=12)
    
    # Grid
    ax.grid(True, alpha=0.3, linestyle='--')
    ax.set_axisbelow(True)
    
    # Legend
    ax.legend(frameon=True, loc='best', fontsize=10)
    
    # Format y-axis
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x/1000:.0f}K'))
    
    # Annotations for key points
    max_idx = df[df.columns[1]].idxmax()
    max_val = df[df.columns[1]].max()
    ax.annotate(f'Peak: ${max_val/1000:.0f}K',
               xy=(df.loc[max_idx, 'date'], max_val),
               xytext=(10, 10), textcoords='offset points',
               fontsize=10, bbox=dict(boxstyle='round', fc='white', alpha=0.8),
               arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))
    
    plt.tight_layout()
    return fig

# Example data
dates = pd.date_range('2024-01-01', periods=12, freq='M')
data = pd.DataFrame({
    'date': dates,
    'Product A': np.random.randint(80, 120, 12) * 1000,
    'Product B': np.random.randint(60, 100, 12) * 1000
})

fig = create_professional_chart(data, 'Monthly Revenue by Product', 'Revenue')
plt.savefig('revenue_chart.png', dpi=300, bbox_inches='tight')
print("✅ Professional chart created")
```

### Step 3: Apply Visual Design Principles

```python
def apply_visual_hierarchy(ax, focus_element=None):
    """Emphasize key elements, de-emphasize secondary"""
    
    # De-emphasize gridlines
    ax.grid(True, alpha=0.2, color='gray', linestyle=':')
    
    # Emphasize focus element
    if focus_element:
        # Make other elements semi-transparent
        for line in ax.get_lines():
            if line.get_label() != focus_element:
                line.set_alpha(0.3)
                line.set_linewidth(1.5)
            else:
                line.set_linewidth(3)
                line.set_zorder(10)
    
    # Clean spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#333333')
    ax.spines['bottom'].set_color('#333333')
    
    return ax

print("✅ Visual hierarchy principles applied")
```

### Step 4: Add Context and Annotations

```python
def add_contextual_annotations(ax, insights, benchmarks=None):
    """Add explanatory text and reference lines"""
    
    # Add insight callouts
    for insight in insights:
        ax.annotate(
            insight['text'],
            xy=insight['position'],
            xytext=insight['text_position'],
            fontsize=9,
            bbox=dict(boxstyle='round,pad=0.5', fc='yellow', alpha=0.3),
            arrowprops=dict(arrowstyle='->', lw=1.5)
        )
    
    # Add benchmark lines
    if benchmarks:
        for benchmark in benchmarks:
            ax.axhline(benchmark['value'], 
                      color='red', linestyle='--', alpha=0.5,
                      label=benchmark['label'])
    
    # Add source
    fig = ax.get_figure()
    fig.text(0.99, 0.01, 'Source: Analytics Database | Generated: Jan 2025',
            ha='right', va='bottom', fontsize=8, color='gray')
    
    return ax

# Example usage
insights = [
    {
        'text': 'Holiday spike',
        'position': (dates[10], data['Product A'].iloc[10]),
        'text_position': (10, 20)
    }
]

benchmarks = [
    {'value': 90000, 'label': 'Target: $90K'}
]

print("✅ Contextual annotations added")
```

### Step 5: Create Dashboard Layout

```python
def create_dashboard_layout(metrics_dict):
    """Multi-panel dashboard with proper spacing"""
    
    fig = plt.figure(figsize=(16, 10))
    gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)
    
    # Large chart top left
    ax1 = fig.add_subplot(gs[0:2, 0:2])
    ax1.set_title('Primary Metric Trend', fontsize=14, fontweight='bold')
    
    # Supporting charts
    ax2 = fig.add_subplot(gs[0, 2])
    ax2.set_title('Breakdown', fontsize=12)
    
    ax3 = fig.add_subplot(gs[1, 2])
    ax3.set_title('Comparison', fontsize=12)
    
    # KPI cards at bottom
    ax4 = fig.add_subplot(gs[2, 0])
    ax5 = fig.add_subplot(gs[2, 1])
    ax6 = fig.add_subplot(gs[2, 2])
    
    # Style KPI cards
    for ax, (metric, value) in zip([ax4, ax5, ax6], metrics_dict.items()):
        ax.text(0.5, 0.6, f"${value:,.0f}", 
               ha='center', va='center', fontsize=24, fontweight='bold')
        ax.text(0.5, 0.3, metric,
               ha='center', va='center', fontsize=12, color='gray')
        ax.axis('off')
        ax.set_facecolor('#f8f9fa')
    
    return fig, [ax1, ax2, ax3, ax4, ax5, ax6]

metrics = {'Revenue': 125000, 'Customers': 450, 'AOV': 278}
fig, axes = create_dashboard_layout(metrics)
plt.savefig('dashboard.png', dpi=300, bbox_inches='tight')
print("✅ Dashboard layout created")
```

## Context Validation

- [ ] Chart type matches data and message
- [ ] Axes clearly labeled
- [ ] Legend is readable
- [ ] Key insights annotated
- [ ] Colors accessible (colorblind-safe)
- [ ] Source cited

## Output Template

```
[Professional visualization with:]

✓ Clear title
✓ Labeled axes with units
✓ Appropriate scale
✓ Legend (if multiple series)
✓ Key points annotated
✓ Benchmark lines if relevant
✓ Source attribution
✓ High-resolution export (300 DPI)
✓ Colorblind-friendly palette
✓ Consistent brand styling
```

## Common Scenarios

### Scenario 1: "Create exec presentation visual"
→ Simple, high-impact chart
→ Annotate key insight
→ Use brand colors
→ Large fonts, minimal detail
→ One message per chart

### Scenario 2: "Build interactive dashboard"
→ Hierarchical layout (primary + supporting)
→ Consistent styling across panels
→ Clear navigation
→ Responsive design
→ Performance optimized

### Scenario 3: "Show comparison between groups"
→ Use grouped/clustered bars
→ Order logically (alphabetical, by value)
→ Consistent color per group
→ Direct labels vs legend
→ Highlight largest difference

### Scenario 4: "Display time series with seasonality"
→ Line chart with trend line
→ Add seasonal decomposition
→ Annotate key events
→ Show confidence bands
→ Include year-over-year comparison

### Scenario 5: "Visualize complex relationships"
→ Start with scatter plot
→ Add trend line
→ Size/color encode 3rd variable
→ Filter to key segments
→ Interactive exploration if possible

## Handling Missing Context

**User says "make it look good":**
"I need specifics:
- What's the key message?
- Who's the audience?
- Where will this be shown?
- Any brand guidelines?
These drive design choices."

**Unclear chart type:**
"Let's decide together:
- Are you comparing values? → Bar chart
- Showing trend over time? → Line chart
- Showing composition? → Stacked bar/pie
- Showing relationship? → Scatter plot
What type of question are you answering?"

**Too much data for one chart:**
"Let's focus:
- What's the #1 insight?
- Can we filter to key segments?
- Should this be a dashboard instead?
- What can go in appendix?
Less is more for clarity."

## Advanced Options

**Interactive Visualizations**: Plotly, Altair for web-based exploration

**Animation**: Show change over time with animated transitions

**Small Multiples**: Repeat chart structure for comparison

**Accessibility**: Alt text, patterns in addition to color, screen reader compatible

**Automated Chart Generation**: Template-based chart creation from data
