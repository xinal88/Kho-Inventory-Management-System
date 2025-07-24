# Module 2: Predictive Demand & Flow Engine (The Brain) 🧠

## Overview

Module 2 is the intelligent forecasting engine of the inventory management system. It uses Facebook Prophet for time series forecasting to predict future product demand, calculate optimal reorder points, and generate actionable inventory suggestions.

## Key Features

### 🔮 **Advanced Forecasting**
- **Prophet Model**: Facebook's robust time series forecasting
- **Product-Specific Models**: Individual forecasting for each product line
- **Seasonality Detection**: Automatic weekly, monthly, and yearly patterns
- **Trend Analysis**: Identifies increasing, decreasing, or stable demand trends
- **Confidence Intervals**: 95% confidence bounds for predictions

### 📊 **Comprehensive EDA**
- **Data Quality Assessment**: Missing data, outliers, and completeness analysis
- **Time Series Analysis**: Daily, weekly, and hourly patterns
- **Product Velocity Analysis**: Historical demand patterns per product
- **Seasonal Patterns**: Monthly and seasonal trend identification
- **Interactive Visualizations**: Comprehensive charts and graphs

### 🎯 **Intelligent Reorder Suggestions**
- **Dynamic Reorder Points**: Based on lead time and demand variability
- **Safety Stock Calculation**: Prevents stockouts with intelligent buffers
- **Priority Scoring**: Ranks products by urgency and importance
- **Risk Assessment**: Identifies high-risk stockout scenarios
- **Actionable Recommendations**: Clear, specific reorder instructions

### 🔗 **Integration Capabilities**
- **Module 1 Integration**: Real-time stock level updates
- **Dashboard Ready**: Formatted data for business dashboards
- **API Endpoints**: RESTful interfaces for system integration
- **External Data**: Weather, holidays, and economic indicators

## Installation

### Prerequisites
```bash
Python 3.8+
pip install -r requirements_module2.txt
```

### Required Dependencies
```
numpy>=1.21.0
pandas>=1.3.0
matplotlib>=3.4.0
seaborn>=0.11.0
prophet>=1.1.0
scikit-learn>=1.0.0
plotly>=5.0.0
```

## Quick Start

### 1. Basic Usage
```python
from module2_predictive_demand_engine import PredictiveDemandEngine

# Initialize the engine
engine = PredictiveDemandEngine('SuperMarket Analysis.csv')

# Run complete analysis
results = engine.run_comprehensive_analysis()

# Get dashboard data
dashboard_data = engine.get_dashboard_data()
```

### 2. Run the Demo
```bash
python demo_module2.py
```

### 3. Individual Components
```python
# EDA only
from module2_predictive_demand_eda import SupermarketDataAnalyzer
analyzer = SupermarketDataAnalyzer('data.csv')
analyzer.load_and_clean_data()
analyzer.generate_visualizations()

# Forecasting only
from module2_prophet_forecasting import DemandForecastingEngine
forecaster = DemandForecastingEngine('data.csv')
forecaster.load_and_prepare_data()
forecaster.train_models()
```

## Configuration

### Engine Configuration
```python
config = {
    'forecast_horizon_days': 30,      # How far ahead to forecast
    'lead_time_days': 7,              # Supplier lead time
    'safety_stock_factor': 1.5,       # Safety stock multiplier
    'confidence_level': 0.95,         # Forecast confidence level
    'min_order_quantity': 10,         # Minimum order size
    'max_order_quantity': 1000,       # Maximum order size
    'seasonality_mode': 'additive'    # Prophet seasonality mode
}

engine = PredictiveDemandEngine(config=config)
```

## Output Files

### Generated Reports
- **`module2_comprehensive_report.json`** - Complete analysis results
- **`module2_dashboard_data.json`** - Dashboard integration data
- **`module2_models_models.pkl`** - Trained Prophet models
- **`module2_models_forecasts.json`** - Forecast predictions

### Visualizations
- **`supermarket_eda_analysis.png`** - EDA overview charts
- **`[product]_forecast_analysis.png`** - Individual product forecasts

## API Integration

### Dashboard Endpoints
```python
# Get summary data for dashboard
dashboard_data = engine.get_dashboard_data()

# Key metrics available:
# - Total products analyzed
# - High/medium/low priority alerts
# - Top priority products
# - Velocity trends
# - Reorder alerts
```

### Module 1 Integration
```python
# Real-time stock updates
def update_stock_levels(product, current_stock):
    # Update reorder calculations based on current stock
    pass

# Stockout event handling
def handle_stockout(product):
    # Adjust forecasting models based on stockout
    pass
```

## Key Outputs

### 1. Velocity Predictions
```json
{
  "Health and beauty": {
    "avg_daily_velocity": 15.2,
    "trend_direction": "Increasing",
    "velocity_volatility": 3.4,
    "next_7_days": [14.5, 15.1, 16.2, ...],
    "confidence_lower": 12.8,
    "confidence_upper": 17.6
  }
}
```

### 2. Reorder Suggestions
```json
{
  "Health and beauty": {
    "reorder_point": 45.3,
    "suggested_order_quantity": 150,
    "urgency": "High",
    "priority_score": 85,
    "recommendation": "Order 150 units before Friday to avoid stockout",
    "risk_level": "High Risk",
    "action_required": "Immediate Order Required"
  }
}
```

### 3. Dashboard Data
```json
{
  "summary": {
    "total_products": 6,
    "high_priority_alerts": 2,
    "medium_priority_alerts": 3,
    "low_priority_alerts": 1
  },
  "top_priority_products": [...],
  "reorder_alerts": [...]
}
```

## Advanced Features

### External Data Integration
```python
# Weather data integration
def integrate_weather_data(weather_forecast):
    # Enhance predictions with weather patterns
    pass

# Holiday effects
def add_holiday_effects(holiday_calendar):
    # Account for holiday demand spikes
    pass
```

### Model Customization
```python
# Custom Prophet configuration
def create_custom_model(product_line):
    model = Prophet(
        growth='logistic',  # For products with market saturation
        seasonality_mode='multiplicative',  # For percentage-based seasonality
        changepoint_prior_scale=0.1  # More/less flexible trend changes
    )
    return model
```

## Performance Monitoring

### Model Quality Metrics
- **MAPE (Mean Absolute Percentage Error)**: Forecast accuracy
- **Model Quality Score**: Good/Fair/Poor classification
- **Confidence Interval Coverage**: Prediction reliability
- **Trend Detection Accuracy**: Trend identification success

### Business Impact Metrics
- **Stockout Prevention**: Reduced stockout incidents
- **Inventory Turnover**: Improved inventory efficiency
- **Order Optimization**: Reduced ordering costs
- **Demand Satisfaction**: Customer demand fulfillment

## Troubleshooting

### Common Issues

1. **Prophet Installation Issues**
   ```bash
   # On Windows
   conda install -c conda-forge prophet
   
   # On Linux/Mac
   pip install prophet
   ```

2. **Data Quality Issues**
   - Ensure date format is MM/DD/YYYY
   - Check for missing product line data
   - Verify quantity and sales columns are numeric

3. **Memory Issues with Large Datasets**
   - Process product lines individually
   - Reduce forecast horizon
   - Use data sampling for initial testing

### Support
For issues and questions:
1. Check the demo script: `python demo_module2.py`
2. Review the comprehensive report output
3. Verify data format matches expected schema

## Integration Examples

### With Module 1 (Stock Tracking)
```python
# Real-time integration
current_stock = module1.get_current_stock(product)
reorder_needed = current_stock < reorder_suggestions[product]['reorder_point']

if reorder_needed:
    order_quantity = reorder_suggestions[product]['suggested_order_quantity']
    module1.create_purchase_order(product, order_quantity)
```

### With Business Dashboard
```python
# Dashboard update
dashboard_data = engine.get_dashboard_data()
dashboard.update_metrics(dashboard_data['summary'])
dashboard.update_alerts(dashboard_data['reorder_alerts'])
```

### With Conversational Assistant
```python
# Natural language queries
def handle_query(query):
    if "reorder" in query.lower():
        return format_reorder_suggestions(reorder_suggestions)
    elif "forecast" in query.lower():
        return format_velocity_predictions(velocity_predictions)
```

---

**Module 2: Predictive Demand & Flow Engine** - Intelligent inventory forecasting for optimal stock management 🧠
