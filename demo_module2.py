"""
Module 2: Predictive Demand & Flow Engine - Demonstration Script
================================================================

This script demonstrates the complete functionality of Module 2, including:
1. Running the full predictive demand analysis
2. Generating forecasts and reorder suggestions
3. Creating visualizations
4. Showing integration capabilities

Run this script to see Module 2 in action!

Author: AI Assistant
Date: 2025-07-23
"""

import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import matplotlib.pyplot as plt
import json
from datetime import datetime

# Import Module 2 components
from module2_predictive_demand_engine import PredictiveDemandEngine

def demonstrate_module2():
    """Demonstrate Module 2 functionality"""
    
    print("🚀 Module 2: Predictive Demand & Flow Engine Demo")
    print("=" * 60)
    print("This demo will showcase the complete demand forecasting pipeline")
    print("using the supermarket sales data.\n")
    
    # Initialize the engine
    print("🔧 Initializing Predictive Demand Engine...")
    engine = PredictiveDemandEngine(
        data_path='SuperMarket Analysis.csv',
        config={
            'forecast_horizon_days': 30,
            'lead_time_days': 7,
            'safety_stock_factor': 1.5,
            'confidence_level': 0.95
        }
    )
    
    # Run the complete analysis
    print("\n🔍 Running Comprehensive Analysis...")
    results = engine.run_comprehensive_analysis()
    
    # Display key results
    print("\n📊 ANALYSIS RESULTS SUMMARY")
    print("=" * 40)
    
    # EDA Summary
    if results['eda_results']:
        quality_report = results['eda_results']['data_quality']
        print(f"📈 Data Quality:")
        print(f"  • Total records: {quality_report['total_records']:,}")
        print(f"  • Date range: {quality_report['date_range'][0].strftime('%Y-%m-%d')} to {quality_report['date_range'][1].strftime('%Y-%m-%d')}")
        print(f"  • Date coverage: {quality_report['date_coverage']:.1%}")
    
    # Velocity Predictions Summary
    print(f"\n🔮 Velocity Predictions:")
    print(f"  • Product lines analyzed: {len(results['velocity_predictions'])}")
    
    for product, prediction in list(results['velocity_predictions'].items())[:3]:  # Show first 3
        print(f"  • {product}:")
        print(f"    - Avg daily velocity: {prediction['avg_daily_velocity']:.2f} units/day")
        print(f"    - Trend: {prediction['trend_direction']}")
        print(f"    - Volatility: {prediction['velocity_volatility']:.2f}")
    
    if len(results['velocity_predictions']) > 3:
        print(f"    ... and {len(results['velocity_predictions']) - 3} more products")
    
    # Reorder Suggestions Summary
    print(f"\n📋 Reorder Suggestions:")
    high_priority = [p for p in results['reorder_suggestions'].values() if p['urgency'] == 'High']
    normal_priority = [p for p in results['reorder_suggestions'].values() if p['urgency'] == 'Normal']
    low_priority = [p for p in results['reorder_suggestions'].values() if p['urgency'] == 'Low']
    
    print(f"  • High priority: {len(high_priority)} products")
    print(f"  • Normal priority: {len(normal_priority)} products")
    print(f"  • Low priority: {len(low_priority)} products")
    
    # Show top priority recommendations
    print(f"\n🎯 TOP PRIORITY RECOMMENDATIONS:")
    sorted_suggestions = sorted(
        results['reorder_suggestions'].items(),
        key=lambda x: x[1]['priority_score'],
        reverse=True
    )
    
    for i, (product, suggestion) in enumerate(sorted_suggestions[:3], 1):
        print(f"\n{i}. {product}")
        print(f"   Priority Score: {suggestion['priority_score']:.0f}/100")
        print(f"   Urgency: {suggestion['urgency']}")
        print(f"   Action: {suggestion['action_required']}")
        print(f"   Recommendation: {suggestion['recommendation']}")
        print(f"   Risk Level: {suggestion['risk_level']}")
    
    # Performance Metrics
    if results['performance_metrics']:
        print(f"\n📈 Model Performance:")
        good_models = [p for p in results['performance_metrics'].values() if p['model_quality'] == 'Good']
        fair_models = [p for p in results['performance_metrics'].values() if p['model_quality'] == 'Fair']
        poor_models = [p for p in results['performance_metrics'].values() if p['model_quality'] == 'Poor']
        
        print(f"  • Good quality models: {len(good_models)}")
        print(f"  • Fair quality models: {len(fair_models)}")
        print(f"  • Poor quality models: {len(poor_models)}")
    
    return engine, results

def demonstrate_dashboard_integration(engine):
    """Demonstrate dashboard integration capabilities"""
    
    print("\n🔗 DASHBOARD INTEGRATION DEMO")
    print("=" * 40)
    
    # Get dashboard data
    dashboard_data = engine.get_dashboard_data()
    
    print("📊 Dashboard Data Generated:")
    print(f"  • Timestamp: {dashboard_data['timestamp']}")
    print(f"  • Total products: {dashboard_data['summary']['total_products']}")
    print(f"  • High priority alerts: {dashboard_data['summary']['high_priority_alerts']}")
    print(f"  • Medium priority alerts: {dashboard_data['summary']['medium_priority_alerts']}")
    print(f"  • Low priority alerts: {dashboard_data['summary']['low_priority_alerts']}")
    
    # Show top priority products for dashboard
    print(f"\n🏆 Top Priority Products for Dashboard:")
    for i, product in enumerate(dashboard_data['top_priority_products'], 1):
        print(f"{i}. {product['product']} (Score: {product['priority_score']:.0f}, {product['urgency']})")
    
    # Show reorder alerts
    print(f"\n🚨 Reorder Alerts for Dashboard:")
    for i, alert in enumerate(dashboard_data['reorder_alerts'][:5], 1):  # Top 5 alerts
        print(f"{i}. {alert['product']}")
        print(f"   Urgency: {alert['urgency']} | Action: {alert['action']}")
        print(f"   Timing: {alert['timing']} | Quantity: {alert['quantity']:.0f}")
        print(f"   Risk: {alert['risk_level']}")
    
    return dashboard_data

def demonstrate_api_integration():
    """Demonstrate API integration capabilities"""
    
    print("\n🔌 API INTEGRATION DEMO")
    print("=" * 40)
    
    # Simulate API endpoints that Module 2 would provide
    api_endpoints = {
        'GET /api/v1/demand/forecast/{product_line}': 'Get forecast for specific product',
        'GET /api/v1/demand/velocity/{product_line}': 'Get velocity prediction for product',
        'GET /api/v1/reorder/suggestions': 'Get all reorder suggestions',
        'GET /api/v1/reorder/urgent': 'Get urgent reorder suggestions only',
        'GET /api/v1/dashboard/summary': 'Get dashboard summary data',
        'POST /api/v1/demand/retrain': 'Retrain forecasting models',
        'GET /api/v1/performance/metrics': 'Get model performance metrics'
    }
    
    print("📡 Available API Endpoints:")
    for endpoint, description in api_endpoints.items():
        print(f"  • {endpoint}")
        print(f"    {description}")
    
    # Simulate Module 1 integration
    print(f"\n🔗 Module 1 Integration Points:")
    integration_points = [
        "Real-time stock level updates → Adjust reorder points",
        "Stock movement data → Improve velocity predictions",
        "Stockout events → Validate forecast accuracy",
        "New product additions → Auto-create forecasting models"
    ]
    
    for point in integration_points:
        print(f"  • {point}")

def demonstrate_external_data_integration():
    """Demonstrate external data integration capabilities"""
    
    print("\n🌐 EXTERNAL DATA INTEGRATION DEMO")
    print("=" * 40)
    
    # Simulate external data sources
    external_sources = {
        'Weather Data': {
            'description': 'Local weather forecasts to predict seasonal demand',
            'example': 'Predict soda sales spike during heatwave',
            'integration': 'Weather API → Prophet external regressor'
        },
        'Public Holidays': {
            'description': 'Holiday calendar for demand spikes',
            'example': 'Increased food sales before holidays',
            'integration': 'Holiday calendar → Prophet holiday effects'
        },
        'Economic Indicators': {
            'description': 'Local economic data for demand correlation',
            'example': 'Consumer spending patterns',
            'integration': 'Economic API → Demand adjustment factors'
        },
        'Competitor Data': {
            'description': 'Market intelligence for demand insights',
            'example': 'Competitor pricing → Demand elasticity',
            'integration': 'Market data → Demand model enhancement'
        }
    }
    
    print("🌍 Potential External Data Sources:")
    for source, details in external_sources.items():
        print(f"\n📊 {source}:")
        print(f"  Description: {details['description']}")
        print(f"  Example: {details['example']}")
        print(f"  Integration: {details['integration']}")

def main():
    """Main demonstration function"""
    
    print("🎬 Starting Module 2 Complete Demonstration")
    print("=" * 60)
    
    try:
        # Core functionality demo
        engine, results = demonstrate_module2()
        
        # Dashboard integration demo
        dashboard_data = demonstrate_dashboard_integration(engine)
        
        # API integration demo
        demonstrate_api_integration()
        
        # External data integration demo
        demonstrate_external_data_integration()
        
        print("\n✅ DEMONSTRATION COMPLETE!")
        print("=" * 60)
        print("🧠 Module 2: Predictive Demand & Flow Engine is ready for production!")
        print("\n📁 Generated Files:")
        print("  • module2_comprehensive_report.json - Complete analysis report")
        print("  • module2_dashboard_data.json - Dashboard integration data")
        print("  • module2_models_models.pkl - Trained Prophet models")
        print("  • module2_models_forecasts.json - Forecast results")
        print("  • supermarket_eda_analysis.png - EDA visualizations")
        print("  • [product]_forecast_analysis.png - Individual product forecasts")
        
        print("\n🔗 Integration Ready:")
        print("  • Module 1 (Stock Tracking) - Real-time stock updates")
        print("  • Business Dashboard - Summary metrics and alerts")
        print("  • Conversational Assistant - Natural language queries")
        print("  • External APIs - Weather, holidays, economic data")
        
        return engine, results, dashboard_data
        
    except Exception as e:
        print(f"\n❌ Error during demonstration: {str(e)}")
        print("Please ensure all required dependencies are installed:")
        print("pip install -r requirements_module2.txt")
        return None, None, None

if __name__ == "__main__":
    engine, results, dashboard_data = main()
