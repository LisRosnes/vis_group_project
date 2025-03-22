import pandas as pd
import os
import glob
from functools import reduce

def clean_value(val):
    """
    Cleans the value by removing '%' and ',' if present and converting to float.
    If conversion fails, returns NaN.
    """
    try:
        # Remove '%' and ',' and any surrounding whitespace
        cleaned_val = str(val).replace('%', '').replace(',', '').strip()
        return float(cleaned_val)
    except:
        return pd.NA  # Return NaN for missing or invalid values

def main():
    # Define the current working directory
    current_dir = os.getcwd()

    # Initialize an empty list to hold metric DataFrames
    metric_data_frames = []

    # Initialize a DataFrame to aggregate Start Year and End Year
    year_info_df = pd.DataFrame()

    # Define key columns for merging
    key_columns = ["StateFIPS", "CountyFIPS", "State", "County"]

    # List all subdirectories in the current directory
    subdirs = [os.path.join(current_dir, d) for d in os.listdir(current_dir) 
               if os.path.isdir(os.path.join(current_dir, d))]

    if not subdirs:
        print("No subdirectories found in the current directory.")
        return

    for subdir in subdirs:
        # Find all CSV files in the subdirectory
        csv_files = glob.glob(os.path.join(subdir, '*.csv'))
        
        if len(csv_files) == 0:
            print(f"No CSV files found in {subdir}. Skipping this folder.")
            continue
        elif len(csv_files) > 1:
            print(f"Multiple CSV files found in {subdir}. Expected only one. Skipping this folder.")
            continue

        file = csv_files[0]  # Get the single CSV file
        metric_name = os.path.splitext(os.path.basename(file))[0].replace(' ', '_')

        try:
            # Read the CSV file
            df = pd.read_csv(file)
        except Exception as e:
            print(f"Error reading {file}: {e}. Skipping this file.")
            continue

        # Determine if the CSV has 'Start Year' and 'End Year' or 'year'
        if {'Start Year', 'End Year'}.issubset(df.columns):
            # CSV has 'Start Year' and 'End Year'
            required_columns = key_columns + ["Start Year", "End Year", "Value"]
            if not set(required_columns).issubset(df.columns):
                print(f"Skipping {file}: Missing required columns {required_columns}.")
                continue
            df = df[required_columns].copy()

            # Clean metric value
            df[metric_name] = df["Value"].apply(clean_value)
            df.drop(columns=["Value"], inplace=True)

            # Aggregate Start Year and End Year
            # For each county, keep the earliest Start Year and latest End Year
            agg_years = df.groupby(key_columns).agg({
                "Start Year": "min",
                "End Year": "max"
            }).reset_index()

            if year_info_df.empty:
                year_info_df = agg_years
            else:
                # Merge and update Start Year and End Year
                year_info_df = pd.merge(year_info_df, agg_years, on=key_columns, how='outer', suffixes=('_existing', '_new'))

                # Update Start Year to the earliest
                year_info_df["Start Year"] = year_info_df[["Start Year_existing", "Start Year_new"]].min(axis=1)

                # Update End Year to the latest
                year_info_df["End Year"] = year_info_df[["End Year_existing", "End Year_new"]].max(axis=1)

                # Drop the intermediate columns
                year_info_df.drop(columns=["Start Year_existing", "Start Year_new", "End Year_existing", "End Year_new"], inplace=True)

            # Prepare the metric DataFrame
            metric_df = df.drop(columns=["Start Year", "End Year"])
            # Since year_info_df already has Start Year and End Year, we don't need them here
            metric_df = metric_df.drop_duplicates(subset=key_columns)

        elif 'Year' in df.columns:
            # CSV has only 'year'
            required_columns = key_columns + ["Year", "Value"]
            if not set(required_columns).issubset(df.columns):
                print(f"Skipping {file}: Missing required columns {required_columns}.")
                continue
            df = df[required_columns].copy()

            # Rename 'year' to 'Start Year' and set 'End Year' to 0
            df.rename(columns={"Year": "Start Year"}, inplace=True)
            df["End Year"] = 0

            # Clean metric value
            df[metric_name] = df["Value"].apply(clean_value)
            df.drop(columns=["Value"], inplace=True)

            # Aggregate Start Year and End Year
            # For each county, keep the earliest Start Year and latest End Year
            agg_years = df.groupby(key_columns).agg({
                "Start Year": "min",
                "End Year": "max"
            }).reset_index()

            if year_info_df.empty:
                year_info_df = agg_years
            else:
                # Merge and update Start Year and End Year
                year_info_df = pd.merge(year_info_df, agg_years, on=key_columns, how='outer', suffixes=('_existing', '_new'))

                # Update Start Year to the earliest
                year_info_df["Start Year"] = year_info_df[["Start Year_existing", "Start Year_new"]].min(axis=1)

                # Update End Year to the latest
                year_info_df["End Year"] = year_info_df[["End Year_existing", "End Year_new"]].max(axis=1)

                # Drop the intermediate columns
                year_info_df.drop(columns=["Start Year_existing", "Start Year_new", "End Year_existing", "End Year_new"], inplace=True)

            # Prepare the metric DataFrame
            metric_df = df.drop(columns=["Start Year", "End Year"])
            # Since year_info_df already has Start Year and End Year, we don't need them here
            metric_df = metric_df.drop_duplicates(subset=key_columns)

        else:
            print(f"Skipping {file}: Neither 'Start Year'/'End Year' nor 'year' columns found.")
            continue

        # Merge the metric data
        metric_data_frames.append(metric_df)

    # Check if any metric DataFrames were loaded
    if not metric_data_frames:
        print("No valid CSV files were processed. Exiting.")
        return

    # Merge all metric DataFrames on key columns using outer join
    merged_metrics_df = reduce(lambda left, right: pd.merge(left, right, on=key_columns, how='outer'), metric_data_frames)

    # Merge the aggregated year information with the merged metrics
    merged_df = pd.merge(year_info_df, merged_metrics_df, on=key_columns, how='left')

    # Reorder columns: StateFIPS, State, CountyFIPS, County, Start Year, End Year, then metrics
    ordered_columns = key_columns + ["Start Year", "End Year"] + \
                      [col for col in merged_df.columns if col not in key_columns + ["Start Year", "End Year"]]

    merged_df = merged_df[ordered_columns]

    # Convert Start Year and End Year to integers if possible
    merged_df["Start Year"] = pd.to_numeric(merged_df["Start Year"], errors='coerce').astype('Int64')
    merged_df["End Year"] = pd.to_numeric(merged_df["End Year"], errors='coerce').astype('Int64')

    # Save the merged DataFrame to a new CSV
    output_file = os.path.join(current_dir, 'merged_data.csv')
    try:
        merged_df.to_csv(output_file, index=False)
        print(f"Merged data saved to {output_file}")
    except Exception as e:
        print(f"Error saving merged data: {e}")

if __name__ == "__main__":
    main()
