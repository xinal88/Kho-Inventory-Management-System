"""
Module 2: Predictive Demand & Flow Engine (The Brain) 🧠
========================================================

This is the main integration module that combines EDA, Prophet forecasting, and reorder suggestions
to create a comprehensive demand prediction system for inventory management.

Features:
1. Automated EDA and data quality assessment
2. Prophet-based time series forecasting for each product line
3. Velocity prediction and trend analysis
4. Intelligent reorder suggestions with safety stock calculations
5. Integration interfaces for Module 1 (stock tracking) and Business Dashboard
6. External data integration capabilities (weather, holidays)

Author: AI Assistant
Date: 2025-07-23
"""

import warnings
warnings.filterwarnings('ignore')

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import json
import os

# Import our custom modules
from module2_predictive_demand_eda import SupermarketDataAnalyzer
from module2_prophet_forecasting import DemandForecastingEngine

class PredictiveDemandEngine:
    """
    Main Predictive Demand & Flow Engine that orchestrates all forecasting activities
    """
    
    def __init__(self, data_path='SuperMarket Analysis.csv', config=None):
        """Initialize the Predictive Demand Engine"""
        self.data_path = data_path
        self.config = config or self._default_config()
        
        # Initialize components
        self.analyzer = None
        self.forecasting_engine = None
        
        # Results storage
        self.eda_results = {}
        self.velocity_predictions = {}
        self.reorder_suggestions = {}
        self.performance_metrics = {}
        
        print("🧠 Predictive Demand & Flow Engine Initialized")
        print("=" * 60)
    
    def _default_config(self):
        """Default configuration for the engine"""
        return {
            'forecast_horizon_days': 30,
            'lead_time_days': 7,
            'safety_stock_factor': 1.5,
            'reorder_threshold_days': 3,
            'confidence_level': 0.95,
            'min_order_quantity': 10,
            'max_order_quantity': 1000,
            'enable_external_data': False,
            'enable_holiday_effects': True,
            'seasonality_mode': 'additive'
        }
    
    def run_comprehensive_analysis(self):
        """Run the complete predictive demand analysis pipeline"""
        print("🔍 Starting Comprehensive Demand Analysis Pipeline")
        print("=" * 60)
        
        # Step 1: Exploratory Data Analysis
        print("\n📊 Step 1: Exploratory Data Analysis")
        self.eda_results = self._run_eda()
        
        # Step 2: Prophet Forecasting
        print("\n🔮 Step 2: Prophet Forecasting & Velocity Prediction")
        self.velocity_predictions = self._run_forecasting()
        
        # Step 3: Reorder Suggestions
        print("\n📋 Step 3: Intelligent Reorder Suggestions")
        self.reorder_suggestions = self._generate_reorder_suggestions()
        
        # Step 4: Performance Assessment
        print("\n📈 Step 4: Performance Assessment")
        self.performance_metrics = self._assess_performance()
        
        # Step 5: Generate Reports
        print("\n📄 Step 5: Generate Reports")
        self._generate_comprehensive_report()
        
        print("\n✅ Comprehensive Analysis Complete!")
        return self._get_summary_results()
    
    def _run_eda(self):
        """Run exploratory data analysis"""
        self.analyzer = SupermarketDataAnalyzer(self.data_path)
        
        # Load and clean data
        df = self.analyzer.load_and_clean_data()
        
        # Run analysis components
        self.analyzer.basic_statistics()
        daily_sales, weekly_pattern, hourly_pattern = self.analyzer.time_series_analysis()
        product_velocity, velocity_stats = self.analyzer.product_velocity_analysis()
        monthly_sales, product_monthly = self.analyzer.seasonal_analysis()
        
        # Generate visualizations
        self.analyzer.generate_visualizations()
        
        # Data quality report
        quality_report = self.analyzer.data_quality_report()
        
        return {
            'data_quality': quality_report,
            'daily_sales': daily_sales,
            'weekly_pattern': weekly_pattern,
            'hourly_pattern': hourly_pattern,
            'product_velocity': product_velocity,
            'velocity_stats': velocity_stats,
            'monthly_sales': monthly_sales,
            'product_monthly': product_monthly
        }
    
    def _run_forecasting(self):
        """Run Prophet forecasting"""
        self.forecasting_engine = DemandForecastingEngine(df=self.analyzer.df)
        
        # Prepare data
        daily_data = self.forecasting_engine.load_and_prepare_data()
        
        # Train models
        models, forecasts = self.forecasting_engine.train_models(
            forecast_days=self.config['forecast_horizon_days']
        )
        
        # Generate velocity predictions
        velocity_predictions = self.forecasting_engine.generate_velocity_predictions(
            days_ahead=self.config['forecast_horizon_days']
        )
        
        # Save models
        self.forecasting_engine.save_models_and_forecasts()
        
        return velocity_predictions
    
    def _generate_reorder_suggestions(self):
        """Generate intelligent reorder suggestions"""
        reorder_suggestions = self.forecasting_engine.generate_reorder_suggestions(
            self.velocity_predictions,
            lead_time_days=self.config['lead_time_days'],
            safety_stock_factor=self.config['safety_stock_factor']
        )
        
        # Enhance suggestions with business logic
        enhanced_suggestions = {}
        for product, suggestion in reorder_suggestions.items():
            enhanced = suggestion.copy()

            # Add business intelligence
            enhanced['priority_score'] = self._calculate_priority_score(enhanced)
            enhanced['risk_level'] = self._assess_risk_level(enhanced)
            enhanced['action_required'] = self._determine_action_required(enhanced)
            enhanced['optimal_order_timing'] = self._calculate_optimal_timing(enhanced)

            enhanced_suggestions[product] = enhanced
        
        return enhanced_suggestions
    
    def _calculate_priority_score(self, suggestion):
        """Calculate priority score for reorder suggestions"""
        score = 0
        
        # Base score from velocity
        if suggestion['avg_daily_velocity'] > 0:
            score += min(suggestion['avg_daily_velocity'] * 10, 50)
        
        # Trend adjustment
        if suggestion['trend_direction'] == 'Increasing':
            score += 20
        elif suggestion['trend_direction'] == 'Decreasing':
            score -= 10
        
        # Urgency adjustment
        urgency_scores = {'High': 30, 'Normal': 10, 'Low': 0}
        score += urgency_scores.get(suggestion['urgency'], 0)
        
        return min(max(score, 0), 100)  # Clamp between 0-100
    
    def _assess_risk_level(self, suggestion):
        """Assess risk level for stockout"""
        if suggestion['urgency'] == 'High' and suggestion['trend_direction'] == 'Increasing':
            return 'High Risk'
        elif suggestion['urgency'] == 'Low' and suggestion['trend_direction'] == 'Decreasing':
            return 'Low Risk'
        else:
            return 'Medium Risk'
    
    def _determine_action_required(self, suggestion):
        """Determine if immediate action is required"""
        if suggestion['urgency'] == 'High':
            return 'Immediate Order Required'
        elif suggestion.get('priority_score', 0) > 70:
            return 'Order Within 2 Days'
        elif suggestion.get('priority_score', 0) > 40:
            return 'Order This Week'
        else:
            return 'Monitor Closely'
    
    def _calculate_optimal_timing(self, suggestion):
        """Calculate optimal order timing"""
        if suggestion['urgency'] == 'High':
            return 'Today'
        elif suggestion['trend_direction'] == 'Increasing':
            return 'Within 2 days'
        else:
            return 'Within 1 week'
    
    def _assess_performance(self):
        """Assess forecasting performance and model quality"""
        performance = {}
        
        for product in self.velocity_predictions.keys():
            # Get historical data
            historical_data = self.forecasting_engine.daily_data[product]
            recent_data = historical_data.tail(14)  # Last 2 weeks
            
            if len(recent_data[recent_data['y'] > 0]) > 0:
                # Calculate basic performance metrics
                actual_avg = recent_data['y'].mean()
                predicted_avg = self.velocity_predictions[product]['avg_daily_velocity']
                
                # Mean Absolute Percentage Error (simplified)
                if actual_avg > 0:
                    mape = abs(predicted_avg - actual_avg) / actual_avg * 100
                else:
                    mape = 0
                
                performance[product] = {
                    'actual_avg_velocity': actual_avg,
                    'predicted_avg_velocity': predicted_avg,
                    'mape': mape,
                    'model_quality': 'Good' if mape < 20 else 'Fair' if mape < 40 else 'Poor'
                }
        
        return performance
    
    def _generate_comprehensive_report(self):
        """Generate comprehensive analysis report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'analysis_summary': {
                'total_products': len(self.velocity_predictions),
                'high_priority_products': len([p for p in self.reorder_suggestions.values() if p['urgency'] == 'High']),
                'total_forecast_horizon': self.config['forecast_horizon_days'],
                'data_quality_score': self._calculate_data_quality_score()
            },
            'velocity_predictions': self.velocity_predictions,
            'reorder_suggestions': self.reorder_suggestions,
            'performance_metrics': self.performance_metrics,
            'eda_summary': self._summarize_eda_results()
        }
        
        # Save report
        with open('module2_comprehensive_report.json', 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print("📄 Comprehensive report saved to 'module2_comprehensive_report.json'")
        return report
    
    def _calculate_data_quality_score(self):
        """Calculate overall data quality score"""
        if not self.eda_results:
            return 0
        
        quality_report = self.eda_results['data_quality']
        
        # Base score from date coverage
        coverage_score = quality_report['date_coverage'] * 50
        
        # Completeness score
        completeness_score = 30 if len(quality_report['missing_dates']) == 0 else 20
        
        # Data volume score
        volume_score = min(quality_report['total_records'] / 1000 * 20, 20)
        
        return coverage_score + completeness_score + volume_score
    
    def _summarize_eda_results(self):
        """Summarize EDA results for the report"""
        if not self.eda_results:
            return {}
        
        return {
            'data_quality_score': self._calculate_data_quality_score(),
            'total_records': self.eda_results['data_quality']['total_records'],
            'date_range': self.eda_results['data_quality']['date_range'],
            'product_lines': len(self.velocity_predictions),
            'seasonality_detected': True  # Simplified
        }
    
    def _get_summary_results(self):
        """Get summary of all results"""
        return {
            'eda_results': self.eda_results,
            'velocity_predictions': self.velocity_predictions,
            'reorder_suggestions': self.reorder_suggestions,
            'performance_metrics': self.performance_metrics
        }
    
    def get_dashboard_data(self):
        """Get formatted data for Business Dashboard integration"""
        dashboard_data = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_products': len(self.velocity_predictions),
                'high_priority_alerts': len([p for p in self.reorder_suggestions.values() if p['urgency'] == 'High']),
                'medium_priority_alerts': len([p for p in self.reorder_suggestions.values() if p['urgency'] == 'Normal']),
                'low_priority_alerts': len([p for p in self.reorder_suggestions.values() if p['urgency'] == 'Low'])
            },
            'top_priority_products': self._get_top_priority_products(5),
            'velocity_trends': self._get_velocity_trends(),
            'reorder_alerts': self._get_reorder_alerts()
        }
        
        return dashboard_data
    
    def _get_top_priority_products(self, limit=5):
        """Get top priority products for dashboard"""
        sorted_products = sorted(
            self.reorder_suggestions.items(),
            key=lambda x: x[1]['priority_score'],
            reverse=True
        )
        
        return [
            {
                'product': product,
                'priority_score': data['priority_score'],
                'urgency': data['urgency'],
                'recommendation': data['recommendation'],
                'trend': data['trend_direction']
            }
            for product, data in sorted_products[:limit]
        ]
    
    def _get_velocity_trends(self):
        """Get velocity trends for dashboard"""
        trends = {}
        for product, prediction in self.velocity_predictions.items():
            trends[product] = {
                'current_velocity': prediction['avg_daily_velocity'],
                'trend_direction': prediction['trend_direction'],
                'next_7_days': prediction['next_7_days']
            }
        return trends
    
    def _get_reorder_alerts(self):
        """Get reorder alerts for dashboard"""
        alerts = []
        for product, suggestion in self.reorder_suggestions.items():
            if suggestion['urgency'] in ['High', 'Normal']:
                alerts.append({
                    'product': product,
                    'urgency': suggestion['urgency'],
                    'action': suggestion['action_required'],
                    'timing': suggestion['optimal_order_timing'],
                    'quantity': suggestion['suggested_order_quantity'],
                    'risk_level': suggestion['risk_level']
                })
        
        return sorted(alerts, key=lambda x: {'High': 3, 'Normal': 2, 'Low': 1}[x['urgency']], reverse=True)

def main():
    """Main execution function"""
    print("🧠 Module 2: Predictive Demand & Flow Engine")
    print("=" * 60)
    
    # Initialize engine
    engine = PredictiveDemandEngine()
    
    # Run comprehensive analysis
    results = engine.run_comprehensive_analysis()
    
    # Get dashboard data
    dashboard_data = engine.get_dashboard_data()
    
    # Save dashboard data
    with open('module2_dashboard_data.json', 'w') as f:
        json.dump(dashboard_data, f, indent=2, default=str)
    
    print("\n🎯 Key Insights:")
    print(f"  • {len(results['velocity_predictions'])} product lines analyzed")
    print(f"  • {dashboard_data['summary']['high_priority_alerts']} high-priority reorder alerts")
    print(f"  • {dashboard_data['summary']['medium_priority_alerts']} medium-priority alerts")
    
    print("\n📊 Dashboard data saved to 'module2_dashboard_data.json'")
    print("🔗 Ready for integration with Module 1 and Business Dashboard")
    
    return engine, results, dashboard_data

if __name__ == "__main__":
    engine, results, dashboard_data = main()
