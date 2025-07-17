import numpy as np
import random
import uuid
from datetime import timedelta

# 你需要在主程序中定义START_DATE, END_DATE, TIME_INTERVAL_MINUTES, ASSET_SPECS，并传入assets和weather_df

def generate_sensor_data(assets, weather_df, start_date, end_date, time_interval_minutes, asset_specs):
    sensor_records = []
    # 预处理天气数据，统一字段名
    weather_df = weather_df.rename(columns={
        'Date/Time (LST)': 'timestamp',
        'Temp (°C)': 'external_temp_c',
        'Rel Hum (%)': 'humidity',
        'Precip. Amount (mm)': 'precipitation',
        'Wind Spd (km/h)': 'wind_speed'
    })
    weather_df['timestamp'] = pd.to_datetime(weather_df['timestamp'])
    weather_df.set_index('timestamp', inplace=True)
    
    print(f"Weather data shape: {weather_df.shape}")
    print(f"Weather columns: {list(weather_df.columns)}")
    print(f"Weather index range: {weather_df.index.min()} to {weather_df.index.max()}")

    current_time = start_date
    while current_time < end_date:
        # 获取最近的天气信息
        weather_info = weather_df.asof(current_time)
        ext_temp = weather_info.get('external_temp_c', 10)
        humidity = weather_info.get('humidity', 50)
        precipitation = weather_info.get('precipitation', 0)
        wind_speed = weather_info.get('wind_speed', 10)
        
        # 处理NaN值
        if pd.isna(ext_temp):
            ext_temp = 10
        if pd.isna(humidity):
            humidity = 50
        if pd.isna(precipitation):
            precipitation = 0
        if pd.isna(wind_speed):
            wind_speed = 10

        for asset in assets:
            spec = asset_specs[asset['asset_type']]

            # 正常数据生成
            time_factor = (np.sin(2 * np.pi * current_time.hour / 24) + 1) / 2
            day_factor = 0.8 if current_time.weekday() >= 5 else 1.0
            base_load = spec['load_range'][0] + (spec['load_range'][1] - spec['load_range'][0]) * time_factor * day_factor
            load_multiplier = 1.0
            if ext_temp > 25: load_multiplier += (ext_temp - 25) / 20
            if ext_temp < 0: load_multiplier += abs(ext_temp) / 30
            power_load_kw = round(base_load * load_multiplier + np.random.normal(0, 2), 2)
            voltage = round(spec['voltage'] * 1000 + np.random.normal(0, 5), 2)

            # --- Failure Injection Logic (目标1.5%故障率) ---
            failure_label = 0
            prob_of_failure = 0.012  # 基础概率提升

            # 温度压力（基于外部温度）
            if ext_temp > 30 or ext_temp < -10:
                prob_of_failure += 0.01

            # 负载压力
            if power_load_kw > spec['load_range'][1] * 1.10:
                prob_of_failure += 0.01
            if power_load_kw > spec['load_range'][1] * 1.20:
                prob_of_failure += 0.03

            # 天气相关压力
            if humidity > 85 and precipitation > 2:
                prob_of_failure += 0.01
            if precipitation > 10:
                prob_of_failure += 0.02
            if wind_speed > 30:
                prob_of_failure += 0.02
                if asset['asset_type'] == 'power_line':
                    prob_of_failure += 0.03
            if wind_speed > 60:
                prob_of_failure += 0.04

            # 极端天气叠加
            if (wind_speed > 30 and precipitation > 5) or (humidity > 90 and ext_temp < 5):
                prob_of_failure += 0.03

            # 极小概率的偶发故障
            if random.random() < 0.00001:
                prob_of_failure += 0.1

            if random.random() < prob_of_failure:
                failure_label = 1
                # 故障时读数异常
                power_load_kw *= random.uniform(1.5, 2.0)
                voltage *= random.uniform(0.9, 0.95)

            sensor_records.append({
                'reading_id': str(uuid.uuid4()),
                'asset_id': asset['asset_id'],
                'timestamp': current_time.isoformat(),
                'power_load_kw': power_load_kw,
                'voltage': voltage,
                'failure_label': failure_label
            })
        current_time += timedelta(minutes=time_interval_minutes)
    return sensor_records

import pandas as pd
from datetime import datetime

ASSET_SPECS = {
    "power_line": {"load_range": (20, 50), "temp_range": (0, 80), "voltage": 13.8},
    "transformer": {"load_range": (200, 300), "temp_range": (0, 120), "voltage": 690},
    "substation": {"load_range": (15, 60), "temp_range": (0, 60), "voltage": 138}
}

if __name__ == "__main__":
    # 读取资产
    assets_df = pd.read_csv("Data/grid_assets.csv")
    assets = assets_df.to_dict(orient="records")

    # 读取天气（使用合并后的weather.csv）
    weather_df = pd.read_csv("Data/weather.csv")

    # 时间范围（调整为2024年）
    start_date = datetime(2024, 1, 1)
    end_date = datetime(2025, 1, 1)
    time_interval_minutes = 60

    # 生成数据
    records = generate_sensor_data(
        assets, weather_df, start_date, end_date, time_interval_minutes, ASSET_SPECS
    )
    df = pd.DataFrame(records)
    df.to_csv("Data/sensor_readings.csv", index=False)