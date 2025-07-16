import csv

def count_failures(filepath):
    count = 0
    with open(filepath, 'r') as f:
        reader = csv.reader(f)
        next(reader) # Skip header
        for row in reader:
            if row and row[-1] == '1': # Check if row is not empty and last element is '1'
                count += 1
    return count

if __name__ == "__main__":
    sensor_readings_filepath = '/Users/zhedang/Desktop/Projects/GridWatchAI/Data/sensor_readings.csv'
    num_failures = count_failures(sensor_readings_filepath)
    print(f"Number of failure events in sensor_readings.csv: {num_failures}")
