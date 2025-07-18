import pandas as pd
import xgboost as xgb
import os

def prepare_data(assets_path, weather_path, sensor_readings_path):
    """
    Loads data and aggregates it to a DAILY level for a more robust prediction.
    """
    print("Loading data...")
    df_assets = pd.read_csv(assets_path)
    df_weather = pd.read_csv(weather_path)
    df_sensor = pd.read_csv(sensor_readings_path)

    print("Preprocessing data to daily granularity...")
    
    # --- 1. Aggregate Sensor Data to Daily Level ---
    # Convert timestamp to datetime
    df_sensor['timestamp'] = pd.to_datetime(df_sensor['timestamp'])
    
    # Create a 'date' column for grouping
    df_sensor['date'] = df_sensor['timestamp'].dt.date
    
    # For each asset on each day, determine if there was ANY failure.
    # We group by asset and date, and take the max of the failure_label.
    # If there was at least one '1', the max will be 1. Otherwise, it's 0.
    daily_failures = df_sensor.groupby(['asset_id', 'date'])['failure_label'].max().reset_index()
    daily_failures.rename(columns={'failure_label': 'had_failure_on_day'}, inplace=True)

    # --- 2. Aggregate Weather Data to Daily Level ---
    # Convert weather timestamp to datetime
    df_weather['date'] = pd.to_datetime(df_weather['Date/Time (LST)']).dt.date
    
    # Define how to aggregate each weather column
    weather_aggregations = {
        'Temp (°C)': 'mean',
        'Dew Point Temp (°C)': 'mean',
        'Rel Hum (%)': 'mean',
        'Wind Spd (km/h)': 'max',
        'Stn Press (kPa)': 'mean',
        'Precip. Amount (mm)': 'sum' # Total rainfall for the day
    }
    
    # Group by date and apply the aggregations
    daily_weather = df_weather.groupby('date').agg(weather_aggregations).reset_index()
    # Rename columns for clarity
    daily_weather.columns = ['date', 'temp_mean', 'dew_point_mean', 'humidity_mean', 'wind_speed_max', 'pressure_mean', 'precip_total']

    # --- 3. Merge Datasets ---
    print("Merging daily data...")
    # Merge daily failures with static asset data
    df_merged = pd.merge(daily_failures, df_assets, on='asset_id', how='left')
    
    # Merge the result with daily weather data
    # We need to convert the 'date' columns to the same type before merging
    df_merged['date'] = pd.to_datetime(df_merged['date'])
    daily_weather['date'] = pd.to_datetime(daily_weather['date'])
    df_final = pd.merge(df_merged, daily_weather, on='date', how='left')

    # --- 4. Feature Engineering ---
    print("Engineering features...")
    feature_cols = [
        'temp_mean', 'dew_point_mean', 'humidity_mean', 
        'wind_speed_max', 'pressure_mean', 'precip_total'
    ]
    categorical_cols = ['asset_type']
    
    df_final = pd.get_dummies(df_final, columns=categorical_cols, prefix='type')
    encoded_cols = [col for col in df_final.columns if col.startswith('type_')]
    all_feature_cols = feature_cols + encoded_cols
    
    # Our new target column
    target_col = 'had_failure_on_day'

    df_final.dropna(subset=all_feature_cols, inplace=True)
    
    print("Data preparation complete.")
    return df_final, all_feature_cols, target_col
def train_and_predict():
    """
    Main function to run the data preparation, model training, and prediction.
    """
    # Define file paths relative to the script's location in the ML/ folder
    base_path = os.path.dirname(__file__)
    data_path = os.path.join(base_path, '..', 'Data')
    
    assets_csv = os.path.join(data_path, 'grid_assets.csv')
    weather_csv = os.path.join(data_path, 'weather.csv')
    sensor_readings_csv = os.path.join(data_path, 'sensor_readings.csv')
    output_csv = os.path.join(data_path, 'failure_predictions.csv')

    # 1. Prepare the data (this part is working correctly)
    full_data, feature_cols, target_col = prepare_data(assets_csv, weather_csv, sensor_readings_csv)

    # --- THIS IS THE CORRECTED SECTION ---
    # 2. Split data into training and prediction sets based on the 'date' column
    print("Splitting data into train (Jan-Oct) and predict (Nov-Dec) sets...")
    
    # We now use the 'date' column, which exists in our aggregated data
    train_df = full_data[full_data['date'].dt.month <= 10]
    predict_df = full_data[full_data['date'].dt.month >= 11]

    X_train = train_df[feature_cols]
    y_train = train_df[target_col]
    
    X_predict = predict_df[feature_cols]
    # --- END OF CORRECTION ---

    if X_predict.empty:
        print("No data available for November-December prediction. Exiting.")
        return

    # 3. Train the XGBoost model
    print("Training XGBoost model...")
    model = xgb.XGBClassifier(
        objective='binary:logistic',
        use_label_encoder=False,
        eval_metric='logloss',
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    print("Model training complete.")

    # 4. Predict probabilities on the Nov-Dec data
    print("Predicting failure probabilities for Nov-Dec...")
    failure_probabilities = model.predict_proba(X_predict)[:, 1]

    # 5. Format and save the output
    print("Formatting and saving predictions...")
    results_df = pd.DataFrame({
        # We also use 'date' here instead of 'timestamp'
        'asset_id': predict_df['asset_id'],
        'date': predict_df['date'],
        'failure_probability': failure_probabilities
    })
    
    results_df.sort_values(by=['date', 'asset_id'], inplace=True)

    # We can rename the 'date' column to 'prediction_date' for clarity in the output file
    results_df.rename(columns={'date': 'prediction_date'}, inplace=True)

    results_df.to_csv(output_csv, index=False)
    print(f"Successfully saved predictions to {output_csv}")
    print("Prediction sample:")
    print(results_df.head())


if __name__ == '__main__':
    train_and_predict()