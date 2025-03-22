import pandas as pd

# 1. Read the CSV file (adjust the filename/path as needed)
df = pd.read_csv("demographics_2016_2020_county/data_115435.csv")

# # 2. Clean the "Value" column: remove "%" and convert to float
df["Value"] = df["Value"].str.replace("%", "", regex=False).astype(float)

# 3. Define the columns that identify a county
county_cols = ["StateFIPS", "State", "CountyFIPS", "County"]

# Group by county and race, then average the "Value" across years
df_grouped = df.groupby(county_cols + ["Race Ethnicity"], as_index=False)["Value"].mean()

# (Optional) If "Data Comment" is the same (or empty) for all rows you can take the first occurrence per county.
# For demonstration, we assume Data Comment is constant per county so we take the first one.
df_comments = df.groupby(county_cols, as_index=False)["Data Comment"].first()

# 4. Pivot so that each Race Ethnicity becomes its own column
df_pivot = df_grouped.pivot(index=county_cols, columns="Race Ethnicity", values="Value").reset_index()

# Merge back the "Data Comment" column if needed
df_final = pd.merge(df_pivot, df_comments, on=county_cols, how="left")

# 5. Add a column for "Year" that shows the range of years used in the average
df_final["Year"] = "2016-2019"

# Optional: rearrange columns so that identifying info comes first
# Assuming you want the order: StateFIPS, State, CountyFIPS, County, Year, Data Comment, then the race columns.
race_cols = [col for col in df_final.columns if col not in county_cols + ["Year", "Data Comment"]]
df_final = df_final[county_cols + ["Year", "Data Comment"] + race_cols]

numeric_cols = df_final.select_dtypes(include=["float", "int"]).columns
df_final[numeric_cols] = df_final[numeric_cols].round(1)

# 8. Export the final DataFrame to a new CSV file (Data Comment column already removed)
df_final.to_csv("transformed_data_rounded.csv", index=False, float_format="%.1f")

print(df_final)
