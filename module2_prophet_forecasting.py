"""
Module 2: Predictive Demand & Flow Engine - Prophet Forecasting Implementation
==============================================================================

This module implements Facebook Prophet for time series forecasting of product demand.
Features:
1. Individual Prophet models for each product line
2. Seasonality detection and modeling
3. Holiday effects and external regressors
4. Velocity prediction and trend analysis
5. Confidence intervals and uncertainty quantification

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
import pickle
import json

# Prophet and forecasting libraries
try:
    from prophet import Prophet
    from prophet.plot import plot_plotly, plot_components_plotly
    from prophet.diagnostics import cross_validation, performance_metrics
except ImportError:
    print("Prophet not installed. Installing...")
    import subprocess
    subprocess.check_call(["pip", "install", "prophet"])
    from prophet import Prophet
    from prophet.plot import plot_plotly, plot_components_plotly
    from prophet.diagnostics import cross_validation, performance_metrics

# Removed plotly dependencies for compatibility

class DemandForecastingEngine:
    """
    Advanced demand forecasting engine using Facebook Prophet
    """
    
    def __init__(self, data_path=None, df=None):
        """Initialize the forecasting engine"""
        self.data_path = data_path
        self.df = df
        self.models = {}
        self.forecasts = {}
        self.product_lines = []
        self.daily_data = None
        
    def load_and_prepare_data(self):
        """Load and prepare data for Prophet forecasting"""
        if self.df is None:
            print("Loading data from file...")
            self.df = pd.read_csv(self.data_path, encoding='UTF-8-SIG')
        
        # Convert date column
        self.df['Date'] = pd.to_datetime(self.df['Date'], format='%m/%d/%Y')
        
        # Get unique product lines
        self.product_lines = self.df['Product line'].unique()
        print(f"Product lines identified: {len(self.product_lines)}")
        for i, product in enumerate(self.product_lines, 1):
            print(f"  {i}. {product}")
        
        # Prepare daily aggregated data for each product line
        self.daily_data = {}
        
        for product in self.product_lines:
            product_df = self.df[self.df['Product line'] == product]
            
            # Aggregate daily sales and quantity
            daily_agg = product_df.groupby('Date').agg({
                'Quantity': 'sum',
                'Sales': 'sum',
                'Invoice ID': 'count'  # Number of transactions
            }).reset_index()
            
            daily_agg.columns = ['ds', 'y', 'sales', 'transactions']
            
            # Ensure complete date range
            date_range = pd.date_range(
                start=self.df['Date'].min(),
                end=self.df['Date'].max(),
                freq='D'
            )
            
            # Create complete date dataframe
            complete_dates = pd.DataFrame({'ds': date_range})
            daily_agg = complete_dates.merge(daily_agg, on='ds', how='left')
            daily_agg.fillna(0, inplace=True)
            
            # Add additional features
            daily_agg['day_of_week'] = daily_agg['ds'].dt.dayofweek
            daily_agg['month'] = daily_agg['ds'].dt.month
            daily_agg['is_weekend'] = (daily_agg['day_of_week'] >= 5).astype(int)
            
            self.daily_data[product] = daily_agg
            
        print(f"Data prepared for {len(self.daily_data)} product lines")
        return self.daily_data
    
    def create_prophet_model(self, product_line, custom_seasonalities=True):
        """Create and configure Prophet model for a specific product line"""
        
        # Base Prophet model configuration
        model = Prophet(
            growth='linear',  # Can be 'linear' or 'logistic'
            seasonality_mode='additive',  # Can be 'additive' or 'multiplicative'
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,  # Not relevant for daily data
            interval_width=0.95,  # 95% confidence intervals
            changepoint_prior_scale=0.05,  # Flexibility of trend changes
            seasonality_prior_scale=10.0,  # Flexibility of seasonality
        )
        
        if custom_seasonalities:
            # Add custom seasonalities
            model.add_seasonality(
                name='monthly',
                period=30.5,
                fourier_order=5
            )
            
            # Add weekend effect as regressor
            model.add_regressor('is_weekend')
        
        return model
    
    def train_models(self, forecast_days=30):
        """Train Prophet models for all product lines"""
        print("\nTraining Prophet models...")
        print("=" * 50)
        
        self.models = {}
        self.forecasts = {}
        
        for product in self.product_lines:
            print(f"\nTraining model for: {product}")
            
            # Get data for this product
            data = self.daily_data[product].copy()
            
            # Create and train model
            model = self.create_prophet_model(product)
            
            try:
                # Fit the model
                model.fit(data[['ds', 'y', 'is_weekend']])
                
                # Create future dataframe
                future = model.make_future_dataframe(periods=forecast_days)
                
                # Add regressors to future dataframe
                future['is_weekend'] = (future['ds'].dt.dayofweek >= 5).astype(int)
                
                # Make predictions
                forecast = model.predict(future)
                
                # Store model and forecast
                self.models[product] = model
                self.forecasts[product] = forecast
                
                # Calculate basic metrics
                historical_data = data[data['y'] > 0]  # Only non-zero days
                if len(historical_data) > 0:
                    avg_daily_demand = historical_data['y'].mean()
                    std_daily_demand = historical_data['y'].std()
                    
                    print(f"  Historical avg daily demand: {avg_daily_demand:.2f} units")
                    print(f"  Historical std daily demand: {std_daily_demand:.2f} units")
                    
                    # Get next 7 days forecast
                    future_forecast = forecast.tail(forecast_days)
                    next_week = future_forecast.head(7)
                    avg_predicted = next_week['yhat'].mean()
                    
                    print(f"  Predicted avg daily demand (next 7 days): {avg_predicted:.2f} units")
                    
                else:
                    print(f"  Warning: No historical sales data for {product}")
                    
            except Exception as e:
                print(f"  Error training model for {product}: {str(e)}")
                continue
        
        print(f"\nSuccessfully trained {len(self.models)} models")
        return self.models, self.forecasts
    
    def generate_velocity_predictions(self, days_ahead=30):
        """Generate velocity predictions and trends"""
        print("\nGenerating velocity predictions...")
        print("=" * 50)
        
        velocity_predictions = {}
        
        for product in self.models.keys():
            forecast = self.forecasts[product]
            model = self.models[product]
            
            # Get future predictions
            future_data = forecast.tail(days_ahead)
            
            # Calculate velocity metrics
            velocity_metrics = {
                'product_line': product,
                'avg_daily_velocity': future_data['yhat'].mean(),
                'velocity_trend': future_data['trend'].iloc[-1] - future_data['trend'].iloc[0],
                'peak_day_velocity': future_data['yhat'].max(),
                'min_day_velocity': future_data['yhat'].min(),
                'velocity_volatility': future_data['yhat'].std(),
                'confidence_lower': future_data['yhat_lower'].mean(),
                'confidence_upper': future_data['yhat_upper'].mean(),
                'next_7_days': future_data.head(7)['yhat'].tolist(),
                'next_30_days': future_data['yhat'].tolist()
            }
            
            # Identify trend direction
            if velocity_metrics['velocity_trend'] > 0.1:
                velocity_metrics['trend_direction'] = 'Increasing'
            elif velocity_metrics['velocity_trend'] < -0.1:
                velocity_metrics['trend_direction'] = 'Decreasing'
            else:
                velocity_metrics['trend_direction'] = 'Stable'
            
            velocity_predictions[product] = velocity_metrics
            
            print(f"\n{product}:")
            print(f"  Avg daily velocity: {velocity_metrics['avg_daily_velocity']:.2f} units/day")
            print(f"  Trend: {velocity_metrics['trend_direction']}")
            print(f"  Volatility: {velocity_metrics['velocity_volatility']:.2f}")
        
        return velocity_predictions
    
    def generate_reorder_suggestions(self, velocity_predictions, current_stock=None, lead_time_days=7, safety_stock_factor=1.5):
        """Generate intelligent reorder suggestions"""
        print("\nGenerating reorder suggestions...")
        print("=" * 50)
        
        reorder_suggestions = {}
        
        for product, velocity in velocity_predictions.items():
            # Calculate demand during lead time
            lead_time_demand = velocity['avg_daily_velocity'] * lead_time_days
            
            # Calculate safety stock
            safety_stock = velocity['velocity_volatility'] * safety_stock_factor * np.sqrt(lead_time_days)
            
            # Calculate reorder point
            reorder_point = lead_time_demand + safety_stock
            
            # Calculate economic order quantity (simplified)
            avg_daily_demand = velocity['avg_daily_velocity']
            suggested_order_quantity = max(avg_daily_demand * 14, 10)  # 2 weeks supply, minimum 10 units
            
            # Generate suggestion
            suggestion = {
                'product_line': product,
                'reorder_point': reorder_point,
                'suggested_order_quantity': suggested_order_quantity,
                'lead_time_demand': lead_time_demand,
                'safety_stock': safety_stock,
                'avg_daily_velocity': avg_daily_demand,
                'trend_direction': velocity['trend_direction'],
                'urgency': 'Normal'
            }
            
            # Determine urgency based on trend and volatility
            if velocity['trend_direction'] == 'Increasing' and velocity['velocity_volatility'] > avg_daily_demand * 0.5:
                suggestion['urgency'] = 'High'
                suggestion['suggested_order_quantity'] *= 1.3  # Increase order quantity
            elif velocity['trend_direction'] == 'Decreasing':
                suggestion['urgency'] = 'Low'
                suggestion['suggested_order_quantity'] *= 0.8  # Decrease order quantity
            
            # Add specific recommendations
            if avg_daily_demand > 0:
                days_of_supply = suggested_order_quantity / avg_daily_demand
                suggestion['days_of_supply'] = days_of_supply
                
                if velocity['trend_direction'] == 'Increasing':
                    suggestion['recommendation'] = f"Order {suggestion['suggested_order_quantity']:.0f} units before Friday to avoid stockout. Demand is increasing."
                elif velocity['trend_direction'] == 'Decreasing':
                    suggestion['recommendation'] = f"Consider ordering {suggestion['suggested_order_quantity']:.0f} units. Demand is decreasing, monitor closely."
                else:
                    suggestion['recommendation'] = f"Order {suggestion['suggested_order_quantity']:.0f} units to maintain {days_of_supply:.1f} days of supply."
            else:
                suggestion['recommendation'] = f"Monitor {product} - very low demand predicted."
            
            reorder_suggestions[product] = suggestion
            
            print(f"\n{product}:")
            print(f"  Reorder point: {reorder_point:.1f} units")
            print(f"  Suggested order: {suggested_order_quantity:.0f} units")
            print(f"  Urgency: {suggestion['urgency']}")
            print(f"  Recommendation: {suggestion['recommendation']}")
        
        return reorder_suggestions
    
    def create_forecast_visualizations(self, product_line=None):
        """Create comprehensive forecast visualizations"""
        if product_line is None:
            # Create visualization for first product line as example
            product_line = list(self.models.keys())[0]
        
        if product_line not in self.models:
            print(f"No model found for {product_line}")
            return
        
        model = self.models[product_line]
        forecast = self.forecasts[product_line]
        
        # Use matplotlib for simpler visualization
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))

        # Main forecast plot
        historical_data = self.daily_data[product_line]

        # Plot 1: Main forecast
        ax1 = axes[0, 0]
        ax1.scatter(historical_data['ds'], historical_data['y'], alpha=0.6, s=20, label='Historical', color='blue')
        ax1.plot(forecast['ds'], forecast['yhat'], color='red', linewidth=2, label='Forecast')
        ax1.fill_between(forecast['ds'], forecast['yhat_lower'], forecast['yhat_upper'],
                        alpha=0.3, color='red', label='Confidence Interval')
        ax1.set_title(f'{product_line} - Demand Forecast')
        ax1.set_xlabel('Date')
        ax1.set_ylabel('Quantity')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # Plot 2: Trend
        ax2 = axes[0, 1]
        ax2.plot(forecast['ds'], forecast['trend'], color='green', linewidth=2)
        ax2.set_title(f'{product_line} - Trend')
        ax2.set_xlabel('Date')
        ax2.set_ylabel('Trend')
        ax2.grid(True, alpha=0.3)

        # Plot 3: Weekly seasonality (if available)
        ax3 = axes[1, 0]
        if 'weekly' in forecast.columns:
            ax3.plot(forecast['ds'], forecast['weekly'], color='purple', linewidth=2)
            ax3.set_title(f'{product_line} - Weekly Seasonality')
        else:
            # Show residuals instead
            residuals = historical_data['y'] - forecast.loc[:len(historical_data)-1, 'yhat']
            ax3.scatter(historical_data['ds'], residuals, alpha=0.6, s=20)
            ax3.axhline(y=0, color='red', linestyle='--')
            ax3.set_title(f'{product_line} - Residuals')
        ax3.set_xlabel('Date')
        ax3.grid(True, alpha=0.3)

        # Plot 4: Forecast components summary
        ax4 = axes[1, 1]
        future_30_days = forecast.tail(30)
        ax4.bar(range(len(future_30_days)), future_30_days['yhat'], alpha=0.7, color='orange')
        ax4.set_title(f'{product_line} - Next 30 Days Forecast')
        ax4.set_xlabel('Days Ahead')
        ax4.set_ylabel('Predicted Quantity')
        ax4.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(f'{product_line}_forecast_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()

        return fig
    
    def save_models_and_forecasts(self, filepath_prefix='module2_models'):
        """Save trained models and forecasts"""
        print(f"\nSaving models and forecasts...")
        
        # Save models
        with open(f'{filepath_prefix}_models.pkl', 'wb') as f:
            pickle.dump(self.models, f)
        
        # Save forecasts as JSON (Prophet objects can't be JSON serialized)
        forecasts_json = {}
        for product, forecast in self.forecasts.items():
            forecasts_json[product] = forecast.to_dict('records')
        
        with open(f'{filepath_prefix}_forecasts.json', 'w') as f:
            json.dump(forecasts_json, f, default=str, indent=2)
        
        print(f"Models saved to {filepath_prefix}_models.pkl")
        print(f"Forecasts saved to {filepath_prefix}_forecasts.json")
    
    def load_models_and_forecasts(self, filepath_prefix='module2_models'):
        """Load saved models and forecasts"""
        try:
            with open(f'{filepath_prefix}_models.pkl', 'rb') as f:
                self.models = pickle.load(f)
            
            with open(f'{filepath_prefix}_forecasts.json', 'r') as f:
                forecasts_json = json.load(f)
                self.forecasts = {}
                for product, forecast_data in forecasts_json.items():
                    self.forecasts[product] = pd.DataFrame(forecast_data)
            
            print(f"Models and forecasts loaded successfully")
            return True
        except FileNotFoundError:
            print("No saved models found")
            return False

def main():
    """Main execution function"""
    print("Module 2: Predictive Demand & Flow Engine - Prophet Forecasting")
    print("=" * 70)
    
    # Initialize forecasting engine
    engine = DemandForecastingEngine(data_path='SuperMarket Analysis.csv')
    
    # Load and prepare data
    daily_data = engine.load_and_prepare_data()
    
    # Train models
    models, forecasts = engine.train_models(forecast_days=30)
    
    # Generate velocity predictions
    velocity_predictions = engine.generate_velocity_predictions(days_ahead=30)
    
    # Generate reorder suggestions
    reorder_suggestions = engine.generate_reorder_suggestions(velocity_predictions)
    
    # Save models and results
    engine.save_models_and_forecasts()
    
    print("\n" + "="*70)
    print("PROPHET FORECASTING COMPLETE")
    print("="*70)
    
    return engine, velocity_predictions, reorder_suggestions

if __name__ == "__main__":
    engine, velocity_predictions, reorder_suggestions = main()
