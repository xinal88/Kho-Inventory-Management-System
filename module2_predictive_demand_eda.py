"""
Module 2: Predictive Demand & Flow Engine - Exploratory Data Analysis
=====================================================================

This module performs comprehensive EDA on supermarket sales data to understand:
1. Time series patterns and seasonality
2. Product line performance and velocity
3. Branch and location-based trends
4. Customer behavior patterns
5. Data quality and preprocessing requirements

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

# Set style for better visualizations
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

class SupermarketDataAnalyzer:
    """
    Comprehensive data analyzer for supermarket sales data
    """
    
    def __init__(self, data_path):
        """Initialize the analyzer with data path"""
        self.data_path = data_path
        self.df = None
        self.daily_sales = None
        self.product_velocity = None
        
    def load_and_clean_data(self):
        """Load and perform initial data cleaning"""
        print("Loading supermarket sales data...")
        
        # Load data
        self.df = pd.read_csv(self.data_path, encoding='UTF-8-SIG')
        
        print(f"Dataset shape: {self.df.shape}")
        print(f"Date range: {self.df['Date'].min()} to {self.df['Date'].max()}")
        
        # Convert date and time columns
        self.df['Date'] = pd.to_datetime(self.df['Date'], format='%m/%d/%Y')
        self.df['Time'] = pd.to_datetime(self.df['Time'], format='%I:%M:%S %p').dt.time
        
        # Create datetime column for time series analysis
        self.df['DateTime'] = pd.to_datetime(
            self.df['Date'].astype(str) + ' ' + self.df['Time'].astype(str)
        )
        
        # Extract time features
        self.df['Year'] = self.df['Date'].dt.year
        self.df['Month'] = self.df['Date'].dt.month
        self.df['Day'] = self.df['Date'].dt.day
        self.df['DayOfWeek'] = self.df['Date'].dt.dayofweek
        self.df['DayName'] = self.df['Date'].dt.day_name()
        self.df['Hour'] = pd.to_datetime(self.df['Time'], format='%H:%M:%S').dt.hour
        
        # Check for missing values
        missing_values = self.df.isnull().sum()
        if missing_values.sum() > 0:
            print("Missing values found:")
            print(missing_values[missing_values > 0])
        else:
            print("No missing values found.")
            
        # Check for duplicates
        duplicates = self.df.duplicated().sum()
        print(f"Duplicate rows: {duplicates}")
        
        if duplicates > 0:
            self.df.drop_duplicates(inplace=True)
            print("Duplicates removed.")
            
        return self.df
    
    def basic_statistics(self):
        """Generate basic statistics and overview"""
        print("\n" + "="*50)
        print("BASIC STATISTICS")
        print("="*50)
        
        # Dataset overview
        print(f"Total transactions: {len(self.df):,}")
        print(f"Date range: {self.df['Date'].min().strftime('%Y-%m-%d')} to {self.df['Date'].max().strftime('%Y-%m-%d')}")
        print(f"Total sales amount: ${self.df['Sales'].sum():,.2f}")
        print(f"Average transaction value: ${self.df['Sales'].mean():.2f}")
        
        # Product lines
        print(f"\nProduct lines: {self.df['Product line'].nunique()}")
        print("Product line distribution:")
        product_counts = self.df['Product line'].value_counts()
        for product, count in product_counts.items():
            percentage = (count / len(self.df)) * 100
            print(f"  {product}: {count:,} ({percentage:.1f}%)")
        
        # Branch analysis
        print(f"\nBranches: {self.df['Branch'].nunique()}")
        branch_sales = self.df.groupby('Branch')['Sales'].agg(['count', 'sum', 'mean'])
        print("Branch performance:")
        for branch in branch_sales.index:
            print(f"  {branch}: {branch_sales.loc[branch, 'count']:,} transactions, "
                  f"${branch_sales.loc[branch, 'sum']:,.2f} total, "
                  f"${branch_sales.loc[branch, 'mean']:.2f} avg")
    
    def time_series_analysis(self):
        """Analyze time series patterns"""
        print("\n" + "="*50)
        print("TIME SERIES ANALYSIS")
        print("="*50)
        
        # Daily sales aggregation
        self.daily_sales = self.df.groupby('Date').agg({
            'Sales': 'sum',
            'Quantity': 'sum',
            'Invoice ID': 'count'
        }).rename(columns={'Invoice ID': 'Transactions'})
        
        # Weekly patterns
        weekly_pattern = self.df.groupby('DayName')['Sales'].agg(['sum', 'mean', 'count'])
        weekly_pattern = weekly_pattern.reindex([
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ])
        
        print("Weekly sales patterns:")
        for day in weekly_pattern.index:
            print(f"  {day}: ${weekly_pattern.loc[day, 'sum']:,.2f} total, "
                  f"${weekly_pattern.loc[day, 'mean']:.2f} avg, "
                  f"{weekly_pattern.loc[day, 'count']:,} transactions")
        
        # Hourly patterns
        hourly_pattern = self.df.groupby('Hour')['Sales'].agg(['sum', 'mean', 'count'])
        peak_hour = hourly_pattern['sum'].idxmax()
        print(f"\nPeak sales hour: {peak_hour}:00 (${hourly_pattern.loc[peak_hour, 'sum']:,.2f})")
        
        return self.daily_sales, weekly_pattern, hourly_pattern
    
    def product_velocity_analysis(self):
        """Analyze product velocity and performance"""
        print("\n" + "="*50)
        print("PRODUCT VELOCITY ANALYSIS")
        print("="*50)
        
        # Product line velocity (daily average)
        self.product_velocity = self.df.groupby(['Date', 'Product line']).agg({
            'Quantity': 'sum',
            'Sales': 'sum'
        }).reset_index()
        
        # Calculate daily averages per product line
        velocity_stats = self.product_velocity.groupby('Product line').agg({
            'Quantity': ['mean', 'std', 'min', 'max'],
            'Sales': ['mean', 'std', 'min', 'max']
        }).round(2)
        
        print("Daily velocity statistics by product line:")
        print("(Quantity: units/day, Sales: $/day)")
        
        for product in velocity_stats.index:
            qty_mean = velocity_stats.loc[product, ('Quantity', 'mean')]
            qty_std = velocity_stats.loc[product, ('Quantity', 'std')]
            sales_mean = velocity_stats.loc[product, ('Sales', 'mean')]
            
            print(f"\n{product}:")
            print(f"  Avg daily quantity: {qty_mean:.1f} ± {qty_std:.1f} units")
            print(f"  Avg daily sales: ${sales_mean:.2f}")
        
        return self.product_velocity, velocity_stats
    
    def seasonal_analysis(self):
        """Analyze seasonal patterns"""
        print("\n" + "="*50)
        print("SEASONAL ANALYSIS")
        print("="*50)
        
        # Monthly trends
        monthly_sales = self.df.groupby('Month')['Sales'].agg(['sum', 'mean', 'count'])
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        print("Monthly sales patterns:")
        for month in monthly_sales.index:
            month_name = month_names[month-1]
            total = monthly_sales.loc[month, 'sum']
            avg = monthly_sales.loc[month, 'mean']
            count = monthly_sales.loc[month, 'count']
            print(f"  {month_name}: ${total:,.2f} total, ${avg:.2f} avg, {count:,} transactions")
        
        # Product seasonality
        product_monthly = self.df.groupby(['Month', 'Product line'])['Quantity'].sum().unstack(fill_value=0)
        
        return monthly_sales, product_monthly
    
    def generate_visualizations(self):
        """Generate comprehensive visualizations"""
        print("\n" + "="*50)
        print("GENERATING VISUALIZATIONS")
        print("="*50)
        
        # Create figure with subplots
        fig = plt.figure(figsize=(20, 15))
        
        # 1. Daily sales trend
        plt.subplot(3, 3, 1)
        plt.plot(self.daily_sales.index, self.daily_sales['Sales'], linewidth=2)
        plt.title('Daily Sales Trend', fontsize=14, fontweight='bold')
        plt.xlabel('Date')
        plt.ylabel('Sales ($)')
        plt.xticks(rotation=45)
        plt.grid(True, alpha=0.3)
        
        # 2. Product line distribution
        plt.subplot(3, 3, 2)
        product_sales = self.df.groupby('Product line')['Sales'].sum().sort_values(ascending=True)
        plt.barh(range(len(product_sales)), product_sales.values)
        plt.yticks(range(len(product_sales)), product_sales.index)
        plt.title('Sales by Product Line', fontsize=14, fontweight='bold')
        plt.xlabel('Total Sales ($)')
        
        # 3. Weekly pattern
        plt.subplot(3, 3, 3)
        weekly_sales = self.df.groupby('DayName')['Sales'].sum()
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekly_sales = weekly_sales.reindex(day_order)
        plt.bar(range(len(weekly_sales)), weekly_sales.values)
        plt.xticks(range(len(weekly_sales)), [day[:3] for day in weekly_sales.index], rotation=45)
        plt.title('Weekly Sales Pattern', fontsize=14, fontweight='bold')
        plt.ylabel('Total Sales ($)')
        
        # 4. Hourly pattern
        plt.subplot(3, 3, 4)
        hourly_sales = self.df.groupby('Hour')['Sales'].sum()
        plt.plot(hourly_sales.index, hourly_sales.values, marker='o', linewidth=2, markersize=6)
        plt.title('Hourly Sales Pattern', fontsize=14, fontweight='bold')
        plt.xlabel('Hour of Day')
        plt.ylabel('Total Sales ($)')
        plt.grid(True, alpha=0.3)
        
        # 5. Branch comparison
        plt.subplot(3, 3, 5)
        branch_sales = self.df.groupby('Branch')['Sales'].sum()
        plt.pie(branch_sales.values, labels=branch_sales.index, autopct='%1.1f%%', startangle=90)
        plt.title('Sales Distribution by Branch', fontsize=14, fontweight='bold')
        
        # 6. Monthly trend
        plt.subplot(3, 3, 6)
        monthly_sales = self.df.groupby('Month')['Sales'].sum()
        month_names = ['Jan', 'Feb', 'Mar']  # Only showing available months
        plt.bar(range(len(monthly_sales)), monthly_sales.values)
        plt.xticks(range(len(monthly_sales)), month_names[:len(monthly_sales)])
        plt.title('Monthly Sales Trend', fontsize=14, fontweight='bold')
        plt.ylabel('Total Sales ($)')
        
        # 7. Quantity vs Sales correlation
        plt.subplot(3, 3, 7)
        plt.scatter(self.df['Quantity'], self.df['Sales'], alpha=0.6)
        plt.title('Quantity vs Sales Correlation', fontsize=14, fontweight='bold')
        plt.xlabel('Quantity')
        plt.ylabel('Sales ($)')
        plt.grid(True, alpha=0.3)
        
        # 8. Customer type analysis
        plt.subplot(3, 3, 8)
        customer_sales = self.df.groupby('Customer type')['Sales'].sum()
        plt.bar(customer_sales.index, customer_sales.values)
        plt.title('Sales by Customer Type', fontsize=14, fontweight='bold')
        plt.ylabel('Total Sales ($)')
        
        # 9. Payment method distribution
        plt.subplot(3, 3, 9)
        payment_counts = self.df['Payment'].value_counts()
        plt.pie(payment_counts.values, labels=payment_counts.index, autopct='%1.1f%%', startangle=90)
        plt.title('Payment Method Distribution', fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        plt.savefig('supermarket_eda_analysis.png', dpi=300, bbox_inches='tight')
        plt.close()  # Close instead of show to avoid GUI issues
        
        print("Visualizations saved as 'supermarket_eda_analysis.png'")
    
    def data_quality_report(self):
        """Generate data quality report for forecasting"""
        print("\n" + "="*50)
        print("DATA QUALITY REPORT FOR FORECASTING")
        print("="*50)
        
        # Check data completeness
        date_range = pd.date_range(start=self.df['Date'].min(), end=self.df['Date'].max(), freq='D')
        missing_dates = set(date_range) - set(self.df['Date'].unique())
        
        print(f"Date completeness: {len(self.df['Date'].unique())}/{len(date_range)} days")
        if missing_dates:
            print(f"Missing dates: {len(missing_dates)}")
            for date in sorted(missing_dates)[:5]:  # Show first 5 missing dates
                print(f"  {date.strftime('%Y-%m-%d')}")
            if len(missing_dates) > 5:
                print(f"  ... and {len(missing_dates) - 5} more")
        
        # Check product line consistency
        print(f"\nProduct line consistency:")
        for product in self.df['Product line'].unique():
            product_dates = self.df[self.df['Product line'] == product]['Date'].nunique()
            total_dates = self.df['Date'].nunique()
            coverage = (product_dates / total_dates) * 100
            print(f"  {product}: {product_dates}/{total_dates} days ({coverage:.1f}%)")
        
        # Outlier detection
        print(f"\nOutlier analysis:")
        for column in ['Quantity', 'Sales', 'Unit price']:
            Q1 = self.df[column].quantile(0.25)
            Q3 = self.df[column].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            outliers = self.df[(self.df[column] < lower_bound) | (self.df[column] > upper_bound)]
            print(f"  {column}: {len(outliers)} outliers ({len(outliers)/len(self.df)*100:.1f}%)")
        
        return {
            'missing_dates': missing_dates,
            'date_coverage': len(self.df['Date'].unique()) / len(date_range),
            'total_records': len(self.df),
            'date_range': (self.df['Date'].min(), self.df['Date'].max())
        }

def main():
    """Main execution function"""
    print("Module 2: Predictive Demand & Flow Engine - EDA")
    print("=" * 60)
    
    # Initialize analyzer
    analyzer = SupermarketDataAnalyzer('SuperMarket Analysis.csv')
    
    # Load and clean data
    df = analyzer.load_and_clean_data()
    
    # Perform comprehensive analysis
    analyzer.basic_statistics()
    daily_sales, weekly_pattern, hourly_pattern = analyzer.time_series_analysis()
    product_velocity, velocity_stats = analyzer.product_velocity_analysis()
    monthly_sales, product_monthly = analyzer.seasonal_analysis()
    
    # Generate visualizations
    analyzer.generate_visualizations()
    
    # Data quality report
    quality_report = analyzer.data_quality_report()
    
    print("\n" + "="*60)
    print("EDA COMPLETE - Ready for Prophet Model Implementation")
    print("="*60)
    
    return analyzer, quality_report

if __name__ == "__main__":
    analyzer, quality_report = main()
