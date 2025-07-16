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
    weather_df['timestamp'] = weather_df['timestamp'].astype(str)
    weather_df.set_index('timestamp', inplace=True)

    current_time = start_date
    while current_time < end_date:
        # 获取最近的天气信息
        weather_info = weather_df.asof(current_time.strftime('%Y-%m-%d %H:%M'))
        ext_temp = weather_info.get('external_temp_c', 10)
        humidity = weather_info.get('humidity', 50)
        precipitation = weather_info.get('precipitation', 0)
        wind_speed = weather_info.get('wind_speed', 10)

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
            internal_temp_c = round(spec['temp_range'][0] + (power_load_kw / spec['load_range'][1]) * 25 + (ext_temp / 5), 2)
            voltage = round(spec['voltage'] * 1000 + np.random.normal(0, 5), 2)

            # --- Failure Injection Logic (与天气等特征相关) ---
            failure_label = 0
            prob_of_failure = 0.0001  # 基础概率

            # 温度压力
            if internal_temp_c > spec['temp_range'][1] * 1.05:
                prob_of_failure += 0.01
            if internal_temp_c > spec['temp_range'][1] * 1.10:
                prob_of_failure += 0.05
            if ext_temp > 35 or ext_temp < -15:
                prob_of_failure += 0.01  # 极端外部温度

            # 负载压力
            if power_load_kw > spec['load_range'][1] * 1.15:
                prob_of_failure += 0.01
            if power_load_kw > spec['load_range'][1] * 1.25:
                prob_of_failure += 0.05

            # 天气相关压力
            if humidity > 90 and precipitation > 5:
                prob_of_failure += 0.01  # 高湿+大雨
            if precipitation > 20:
                prob_of_failure += 0.02  # 暴雨
            if wind_speed > 50:
                prob_of_failure += 0.02
                if asset['asset_type'] == 'power_line':
                    prob_of_failure += 0.03  # 输电线更易受风影响
            if wind_speed > 80:
                prob_of_failure += 0.05  # 极端大风

            # 极端天气叠加
            if (wind_speed > 50 and precipitation > 10) or (humidity > 95 and ext_temp < 0):
                prob_of_failure += 0.03

            # 极小概率的偶发故障
            if random.random() < 0.00001:
                prob_of_failure += 0.1

            if random.random() < prob_of_failure:
                failure_label = 1
                # 故障时读数异常
                power_load_kw *= random.uniform(1.5, 2.0)
                internal_temp_c *= random.uniform(1.2, 1.4)
                voltage *= random.uniform(0.9, 0.95)

            sensor_records.append({
                'reading_id': str(uuid.uuid4()),
                'asset_id': asset['asset_id'],
                'timestamp': current_time.isoformat(),
                'power_load_kw': power_load_kw,
                'temperature_c': internal_temp_c,
                'voltage': voltage,
                'failure_label': failure_label
            })
        current_time += timedelta(minutes=time_interval_minutes)
    return sensor_records