---
name: time-series-analysis
description: Temporal pattern detection and forecasting. Use when analyzing trends over time, detecting seasonality, identifying anomalies in time series, or building simple forecasting models.
---

# Time Series Analysis

## Quick Start

Analyze temporal data to identify trends, seasonality, and anomalies, then create forecasts with confidence intervals for business planning.

## Context Requirements

Before analyzing time series, I need:

1. **Time Series Data**: Values measured over time
2. **Time Granularity**: Daily, weekly, monthly, hourly, etc.
3. **Forecast Horizon**: How far ahead to predict
4. **Known Events** (optional): Holidays, campaigns, incidents that affect data
5. **Business Context**: What drives changes in this metric

## Context Gathering

### For Time Series Data:
"I need historical data with timestamps:

**Format:**
```
date       | metric_value
2024-01-01 | 1,250
2024-01-02 | 1,320
2024-01-03 | 1,180
...
```

**Requirements:**
- Regular intervals (no gaps preferred)
- At least 2+ seasonal cycles of data
  - Daily data: 2+ years
  - Weekly data: 2+ years  
  - Monthly data: 3+ years
  
**Additional Variables** (optional but helpful):
- External factors (marketing spend, weather, etc.)
- Holiday indicators
- Event flags

What time period do you have data for?"

### For Granularity:
"What's the natural granularity of your data?

**Options:**
- **Hourly**: Web traffic, API calls
- **Daily**: User signups, revenue, sessions
- **Weekly**: Aggregate business metrics
- **Monthly**: Financial reporting, subscriptions
- **Quarterly**: Board-level metrics

Choose based on:
1. How data is collected
2. Decision-making frequency
3. Forecast use case"

### For Forecast Horizon:
"How far ahead do you need to forecast?

**Common Horizons:**
- **Short-term**: 1-7 days (operational planning)
- **Medium-term**: 1-3 months (budget cycles)
- **Long-term**: 6-12 months (strategic planning)

Note: Forecast accuracy decreases with longer horizons."

### For Seasonal Patterns:
"Does this metric have known patterns?

**Common Patterns:**
- **Day of week**: Higher on weekdays vs weekends
- **Monthly**: Month-end spikes, seasonal trends
- **Quarterly**: Q4 surge for retail
- **Annual**: Holiday seasons, fiscal year cycles
- **Multiple**: Weekly + Annual (e.g., summer weekends)

Understanding patterns improves forecast accuracy."

### For External Factors:
"What external factors influence this metric?

**Examples:**
- Marketing campaigns (start/end dates)
- Product launches
- Pricing changes
- Competitor actions
- Economic indicators
- Weather (for some businesses)
- Holidays

These can be included in advanced forecasting models."

## Workflow

### Step 1: Load and Visualize Time Series

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import adfuller, acf, pacf
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

# Load data
df = pd.read_csv('time_series_data.csv')
df['date'] = pd.to_datetime(df['date'])
df = df.sort_values('date')
df.set_index('date', inplace=True)

print(f"📊 Time Series Loaded:")
print(f"  Start: {df.index.min()}")
print(f"  End: {df.index.max()}")
print(f"  Length: {len(df)} observations")
print(f"  Frequency: {df.index.inferred_freq or 'Unknown'}")

# Plot raw time series
plt.figure(figsize=(14, 6))
plt.plot(df.index, df['value'], linewidth=1.5)
plt.title('Time Series Plot')
plt.xlabel('Date')
plt.ylabel('Value')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('time_series_plot.png', dpi=300, bbox_inches='tight')
plt.show()
```

**Checkpoint**: "Data loaded. Time range looks good? Any obvious issues?"

### Step 2: Check for Stationarity

```python
def test_stationarity(timeseries):
    """
    Test if time series is stationary using Augmented Dickey-Fuller test
    """
    
    # Perform ADF test
    result = adfuller(timeseries.dropna())
    
    print('\n📈 Stationarity Test (Augmented Dickey-Fuller):')
    print(f'  ADF Statistic: {result[0]:.4f}')
    print(f'  P-value: {result[1]:.4f}')
    print(f'  Critical Values:')
    for key, value in result[4].items():
        print(f'    {key}: {value:.3f}')
    
    if result[1] <= 0.05:
        print(f'  ✅ STATIONARY: Reject null hypothesis (p < 0.05)')
        print(f'     Time series has no unit root')
        stationary = True
    else:
        print(f'  ⚠️  NON-STATIONARY: Cannot reject null hypothesis (p > 0.05)')
        print(f'     Time series may have trend/seasonality')
        print(f'     Consider differencing or detrending')
        stationary = False
    
    return stationary

is_stationary = test_stationarity(df['value'])
```

### Step 3: Decompose Time Series

```python
def decompose_time_series(df, period=None):
    """
    Decompose time series into trend, seasonal, and residual components
    """
    
    # Determine period if not specified
    if period is None:
        freq = df.index.inferred_freq
        if freq and 'D' in freq:
            period = 7  # Weekly seasonality for daily data
        elif freq and ('W' in freq or 'M' in freq):
            period = 12  # Annual seasonality for weekly/monthly data
        else:
            period = 12  # Default
    
    # Perform decomposition
    decomposition = seasonal_decompose(df['value'], model='additive', period=period)
    
    # Plot components
    fig, axes = plt.subplots(4, 1, figsize=(14, 10))
    
    # Original
    df['value'].plot(ax=axes[0], title='Original Time Series')
    axes[0].set_ylabel('Value')
    
    # Trend
    decomposition.trend.plot(ax=axes[1], title='Trend Component')
    axes[1].set_ylabel('Trend')
    
    # Seasonal
    decomposition.seasonal.plot(ax=axes[2], title='Seasonal Component')
    axes[2].set_ylabel('Seasonal')
    
    # Residual
    decomposition.resid.plot(ax=axes[3], title='Residual Component')
    axes[3].set_ylabel('Residual')
    
    plt.tight_layout()
    plt.savefig('decomposition.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    # Calculate strength of components
    trend_strength = 1 - (decomposition.resid.var() / 
                         (decomposition.trend + decomposition.resid).var())
    seasonal_strength = 1 - (decomposition.resid.var() / 
                             (decomposition.seasonal + decomposition.resid).var())
    
    print(f"\n📊 Decomposition Analysis:")
    print(f"  Trend Strength: {trend_strength:.1%}")
    print(f"  Seasonal Strength: {seasonal_strength:.1%}")
    
    if trend_strength > 0.6:
        print(f"  ↗️  Strong trend detected")
    if seasonal_strength > 0.6:
        print(f"  🔄 Strong seasonality detected")
    
    return decomposition

decomposition = decompose_time_series(df)
```

### Step 4: Detect Anomalies

```python
def detect_anomalies(df, method='iqr', window=30):
    """
    Detect anomalies in time series using multiple methods
    """
    
    anomalies = pd.DataFrame(index=df.index)
    anomalies['value'] = df['value']
    
    # Method 1: IQR-based detection
    if method in ['iqr', 'all']:
        rolling_median = df['value'].rolling(window=window, center=True).median()
        rolling_std = df['value'].rolling(window=window, center=True).std()
        
        # Calculate z-score equivalent
        z_score = np.abs((df['value'] - rolling_median) / rolling_std)
        anomalies['iqr_anomaly'] = z_score > 3
    
    # Method 2: Statistical outliers (MAD - Median Absolute Deviation)
    if method in ['mad', 'all']:
        median = df['value'].median()
        mad = np.median(np.abs(df['value'] - median))
        modified_z_score = 0.6745 * (df['value'] - median) / mad
        anomalies['mad_anomaly'] = np.abs(modified_z_score) > 3.5
    
    # Method 3: Residual-based (using decomposition)
    if method in ['residual', 'all']:
        try:
            decomp = seasonal_decompose(df['value'], model='additive', period=7)
            resid_std = decomp.resid.std()
            anomalies['residual_anomaly'] = np.abs(decomp.resid) > 3 * resid_std
        except:
            anomalies['residual_anomaly'] = False
    
    # Combine methods (any method flags as anomaly)
    if method == 'all':
        anomalies['is_anomaly'] = (
            anomalies['iqr_anomaly'] | 
            anomalies['mad_anomaly'] | 
            anomalies['residual_anomaly']
        )
    else:
        anomalies['is_anomaly'] = anomalies[f'{method}_anomaly']
    
    # Plot anomalies
    plt.figure(figsize=(14, 6))
    plt.plot(df.index, df['value'], label='Normal', alpha=0.7)
    
    if anomalies['is_anomaly'].any():
        anomaly_points = anomalies[anomalies['is_anomaly']]
        plt.scatter(anomaly_points.index, anomaly_points['value'], 
                   color='red', s=100, label='Anomaly', zorder=5)
    
    plt.title('Anomaly Detection')
    plt.xlabel('Date')
    plt.ylabel('Value')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('anomalies.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    # Report anomalies
    anomaly_dates = anomalies[anomalies['is_anomaly']].index
    print(f"\n🚨 Anomalies Detected: {len(anomaly_dates)}")
    
    if len(anomaly_dates) > 0:
        print(f"\n  Top 5 Most Extreme Anomalies:")
        top_anomalies = anomalies[anomalies['is_anomaly']].nlargest(5, 'value')
        for date, row in top_anomalies.iterrows():
            print(f"    {date.strftime('%Y-%m-%d')}: {row['value']:,.0f}")
    
    return anomalies

anomalies = detect_anomalies(df, method='all')
```

### Step 5: Build Forecast Model

```python
def build_forecast_model(df, forecast_periods=30):
    """
    Build ARIMA forecast model
    """
    
    # Split into train/test
    train_size = int(len(df) * 0.8)
    train, test = df[:train_size], df[train_size:]
    
    print(f"\n🔮 Building Forecast Model:")
    print(f"  Train size: {len(train)} observations")
    print(f"  Test size: {len(test)} observations")
    print(f"  Forecast horizon: {forecast_periods} periods")
    
    # Auto ARIMA (simple version - could use pmdarima.auto_arima for better)
    # Using simple ARIMA(1,1,1) as default
    model = ARIMA(train['value'], order=(1, 1, 1))
    model_fit = model.fit()
    
    print(f"\n  Model: ARIMA(1,1,1)")
    print(f"  AIC: {model_fit.aic:.2f}")
    
    # Forecast on test set
    forecast_test = model_fit.forecast(steps=len(test))
    
    # Calculate errors
    mae = mean_absolute_error(test['value'], forecast_test)
    rmse = np.sqrt(mean_squared_error(test['value'], forecast_test))
    mape = np.mean(np.abs((test['value'] - forecast_test) / test['value'])) * 100
    
    print(f"\n  📊 Test Set Performance:")
    print(f"    MAE: {mae:.2f}")
    print(f"    RMSE: {rmse:.2f}")
    print(f"    MAPE: {mape:.1f}%")
    
    # Refit on full dataset
    model_full = ARIMA(df['value'], order=(1,1,1))
    model_full_fit = model_full.fit()
    
    # Generate future forecast
    forecast_result = model_full_fit.get_forecast(steps=forecast_periods)
    forecast_mean = forecast_result.predicted_mean
    forecast_ci = forecast_result.conf_int()
    
    # Create forecast dates
    last_date = df.index[-1]
    freq = df.index.inferred_freq or 'D'
    forecast_dates = pd.date_range(start=last_date + pd.Timedelta(days=1),
                                   periods=forecast_periods, freq=freq)
    
    forecast_df = pd.DataFrame({
        'forecast': forecast_mean.values,
        'lower_ci': forecast_ci.iloc[:, 0].values,
        'upper_ci': forecast_ci.iloc[:, 1].values
    }, index=forecast_dates)
    
    return model_full_fit, forecast_df, mae, rmse, mape

model, forecast, mae, rmse, mape = build_forecast_model(df, forecast_periods=30)
```

### Step 6: Visualize Forecast

```python
def plot_forecast(df, forecast, title='Time Series Forecast'):
    """
    Visualize historical data and forecast with confidence intervals
    """
    
    fig, ax = plt.subplots(figsize=(14, 6))
    
    # Plot historical data
    ax.plot(df.index, df['value'], label='Historical', linewidth=2)
    
    # Plot forecast
    ax.plot(forecast.index, forecast['forecast'], 
           label='Forecast', linewidth=2, linestyle='--', color='red')
    
    # Plot confidence interval
    ax.fill_between(forecast.index, 
                    forecast['lower_ci'], 
                    forecast['upper_ci'], 
                    alpha=0.2, color='red', label='95% Confidence Interval')
    
    # Add vertical line at forecast start
    ax.axvline(df.index[-1], color='black', linestyle=':', alpha=0.5)
    
    ax.set_xlabel('Date')
    ax.set_ylabel('Value')
    ax.set_title(title)
    ax.legend()
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('forecast.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    # Print forecast summary
    print(f"\n📅 Forecast Summary:")
    print(f"\n  Next 7 Days:")
    print(forecast.head(7).to_string())

plot_forecast(df, forecast)
```

### Step 7: Analyze Forecast Uncertainty

```python
def analyze_uncertainty(forecast):
    """
    Quantify forecast uncertainty
    """
    
    forecast['uncertainty_pct'] = (
        (forecast['upper_ci'] - forecast['lower_ci']) / forecast['forecast'] * 100
    )
    
    print(f"\n📊 Forecast Uncertainty Analysis:")
    print(f"  Average uncertainty: {forecast['uncertainty_pct'].mean():.1f}%")
    print(f"  Near-term (Day 1-7): {forecast['uncertainty_pct'][:7].mean():.1f}%")
    print(f"  Medium-term (Day 8-14): {forecast['uncertainty_pct'][7:14].mean():.1f}%")
    print(f"  Long-term (Day 15+): {forecast['uncertainty_pct'][14:].mean():.1f}%")
    
    if forecast['uncertainty_pct'].mean() < 10:
        confidence = "High"
    elif forecast['uncertainty_pct'].mean() < 20:
        confidence = "Moderate"
    else:
        confidence = "Low"
    
    print(f"\n  Forecast Confidence: {confidence}")
    
    return confidence

confidence = analyze_uncertainty(forecast)
```

### Step 8: Generate Insights and Recommendations

```python
def generate_insights(df, decomposition, anomalies, forecast, confidence):
    """
    Synthesize findings into actionable insights
    """
    
    print(f"\n{'='*70}")
    print("💡 KEY INSIGHTS")
    print('='*70)
    
    # Trend insight
    recent_trend = decomposition.trend.dropna().iloc[-30:].mean()
    older_trend = decomposition.trend.dropna().iloc[-60:-30].mean()
    trend_change = (recent_trend - older_trend) / older_trend * 100
    
    print(f"\n📈 TREND:")
    if abs(trend_change) < 5:
        print(f"  Status: Stable")
        print(f"  Recent vs Previous: {trend_change:+.1f}%")
    elif trend_change > 5:
        print(f"  Status: ↗️  Growing")
        print(f"  Recent vs Previous: {trend_change:+.1f}%")
        print(f"  Action: Capitalize on growth momentum")
    else:
        print(f"  Status: ↘️  Declining")
        print(f"  Recent vs Previous: {trend_change:+.1f}%")
        print(f"  Action: Investigate drivers of decline")
    
    # Seasonality insight
    seasonal_range = decomposition.seasonal.max() - decomposition.seasonal.min()
    seasonal_pct = seasonal_range / df['value'].mean() * 100
    
    print(f"\n🔄 SEASONALITY:")
    print(f"  Seasonal variation: {seasonal_pct:.1f}% of average")
    if seasonal_pct > 20:
        print(f"  Status: Strong seasonal pattern")
        print(f"  Action: Plan inventory/staffing for seasonal peaks")
    elif seasonal_pct > 10:
        print(f"  Status: Moderate seasonal pattern")
        print(f"  Action: Consider seasonal adjustments")
    else:
        print(f"  Status: Minimal seasonality")
    
    # Anomaly insight
    anomaly_count = anomalies['is_anomaly'].sum()
    anomaly_pct = anomaly_count / len(anomalies) * 100
    
    print(f"\n🚨 ANOMALIES:")
    print(f"  Total detected: {anomaly_count} ({anomaly_pct:.1f}%)")
    if anomaly_pct > 5:
        print(f"  Status: High anomaly rate")
        print(f"  Action: Investigate data quality or unusual events")
    else:
        print(f"  Status: Normal anomaly rate")
    
    # Forecast insight
    forecast_direction = "increase" if forecast['forecast'].iloc[7] > df['value'].iloc[-1] else "decrease"
    forecast_change = abs(forecast['forecast'].iloc[7] - df['value'].iloc[-1]) / df['value'].iloc[-1] * 100
    
    print(f"\n🔮 FORECAST (Next 7 Days):")
    print(f"  Direction: {forecast_direction.title()}")
    print(f"  Expected change: {forecast_change:.1f}%")
    print(f"  Forecast confidence: {confidence}")
    
    if confidence == "High":
        print(f"  Action: Use forecast for planning with confidence")
    elif confidence == "Moderate":
        print(f"  Action: Use forecast but build in buffer")
    else:
        print(f"  Action: Use forecast as directional guide only")

generate_insights(df, decomposition, anomalies, forecast, confidence)

# Save results
forecast.to_csv('forecast_results.csv')
anomalies.to_csv('detected_anomalies.csv')
```

## Context Validation

Before proceeding, verify:
- [ ] Have sufficient historical data (2+ seasonal cycles)
- [ ] Time series has regular intervals (minimal gaps)
- [ ] Understand seasonal patterns and external factors
- [ ] Forecast horizon aligns with business planning needs
- [ ] Know how forecast will be used (decision context)

## Output Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIME SERIES ANALYSIS REPORT
Metric: Daily Active Users
Period: Jan 2023 - Dec 2024 (730 days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 HISTORICAL ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Time Series Characteristics:
  ✅ Stationary: Yes (ADF p-value: 0.012)
  📈 Trend Strength: 75% (Strong upward trend)
  🔄 Seasonal Strength: 62% (Clear weekly pattern)
  📉 Noise Level: 15%

Decomposition Summary:
  • Trend: +25% growth over period
  • Seasonality: 30% variation peak-to-trough
  • Pattern: Higher on weekdays, dips on weekends

Anomalies Detected: 15 (2.1% of days)
  Top Anomalies:
    • 2024-07-04: 45,000 users (holiday spike)
    • 2024-11-28: 52,000 users (Black Friday)
    • 2024-03-15: 18,000 users (outage)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔮 FORECAST (Next 30 Days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Model: ARIMA(1,1,1)
  AIC: 8,234.5
  Test MAPE: 5.2% (Good accuracy)

Forecast Confidence: HIGH

Next 7 Days Forecast:
  Day 1: 32,500 [31,800 - 33,200]
  Day 2: 33,100 [32,300 - 33,900]
  Day 3: 33,800 [32,900 - 34,700]
  Day 4: 34,200 [33,200 - 35,200]
  Day 5: 34,500 [33,400 - 35,600]
  Day 6: 30,800 [29,700 - 31,900] (Weekend dip)
  Day 7: 29,500 [28,300 - 30,700] (Weekend dip)

Month Ahead:
  Average: 32,750 users/day
  Range: [31,200 - 34,300]
  Uncertainty: ±10%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 KEY INSIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. STRONG GROWTH TRAJECTORY
   • 25% increase over 2-year period
   • Accelerating in recent months
   • Momentum: Positive

2. PREDICTABLE WEEKLY PATTERN
   • 30% higher on weekdays vs weekends
   • Stable pattern enables accurate forecasting
   • Opportunity: Target weekend engagement

3. HOLIDAY IMPACT SIGNIFICANT
   • Major holidays show +50% spikes
   • Plan capacity for upcoming holidays
   • Black Friday 2024: 52k users (record high)

4. SEASONAL TRENDS
   • Q4 strongest quarter (holiday shopping)
   • Summer months show slight dip
   • Plan marketing around seasonal patterns

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMMEDIATE:
  1. Use forecast for next month's capacity planning
  2. Prepare for 32-35k daily users range
  3. Build 15% buffer for weekend dips

STRATEGIC:
  4. Investigate weekend engagement opportunities
  5. Prepare for holiday peaks (Q4 2025)
  6. Monitor trend for any deceleration signals

MONITORING:
  7. Set up automated anomaly alerts
  8. Refresh forecast weekly
  9. Track actual vs forecast accuracy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 FILES GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ time_series_plot.png (historical data)
✓ decomposition.png (trend/seasonal components)
✓ anomalies.png (anomaly detection)
✓ forecast.png (30-day forecast with CI)
✓ forecast_results.csv (detailed forecast)
✓ detected_anomalies.csv (anomaly list)
```

## Common Scenarios

### Scenario 1: "Forecast next quarter's revenue"
→ Build ARIMA or Prophet model
→ Include seasonality and trends
→ Generate point estimates + confidence intervals
→ Validate against historical accuracy
→ Provide business planning ranges

### Scenario 2: "Detect anomalies in web traffic"
→ Establish baseline using historical patterns
→ Flag statistical outliers
→ Investigate anomaly causes
→ Set up automated monitoring
→ Create alert thresholds

### Scenario 3: "Understand what's driving metric changes"
→ Decompose into trend/seasonal/residual
→ Quantify strength of each component
→ Correlate with external events
→ Identify primary drivers
→ Provide actionable insights

### Scenario 4: "Capacity planning for infrastructure"
→ Forecast peak usage periods
→ Add buffer for uncertainty
→ Include known upcoming events
→ Calculate required resources
→ Monitor actual vs forecast

### Scenario 5: "Compare YoY growth trends"
→ Normalize for seasonality
→ Calculate year-over-year changes
→ Test statistical significance
→ Identify inflection points
→ Project future trajectories

## Handling Missing Context

**User has irregular time series:**
"Your data has gaps. Options:
1. Impute missing values (forward fill, interpolation)
2. Model irregular time series (different approach)
3. Aggregate to courser time grain (daily → weekly)

Which makes most sense for your use case?"

**User doesn't know forecast horizon:**
"Let me ask: What decisions will this forecast inform?
- Operational planning: 1-2 weeks
- Budget cycles: 1-3 months
- Strategic planning: 6-12 months

Typical sweet spot: 30-90 days ahead"

**Limited historical data:**
"With only {X} observations, forecast uncertainty will be high. Can you:
- Provide more history from archive/logs?
- Use business assumptions to supplement?
- Start with simple moving average approach?"

**Multiple seasonal patterns:**
"I see daily, weekly, AND annual patterns. We should:
1. Model each separately
2. Use more sophisticated model (Prophet, TBATS)
3. Focus on most important pattern

Which matters most for your use case?"

## Advanced Options

After basic analysis, offer:

**Prophet Model**:
"For complex seasonality + holidays, I can use Facebook Prophet for more robust forecasts."

**Multivariate Forecasting**:
"If you have external variables (marketing spend, weather), I can include them for better predictions."

**Ensemble Forecasting**:
"I can combine multiple models (ARIMA, Prophet, etc.) for more reliable forecasts."

**Intervention Analysis**:
"I can quantify impact of specific events (product launches, outages) on the time series."

**Automatic Monitoring**:
"I can set up automated forecast updates and anomaly alerts that run daily/weekly."

**Confidence Intervals Calibration**:
"I can validate if confidence intervals are well-calibrated using historical forecasts."
