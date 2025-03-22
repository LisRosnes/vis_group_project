import pandas as pd

# Read in the two CSV files.
df1 = pd.read_csv("merged_data.csv")   # This is your dataset with binge_drinking, infant_mortality, etc.
df2 = pd.read_csv("transformed_demographics_county.csv")  # This is your dataset with the race columns

# Inspect the first few rows (optional)
# print(df1.head())
# print(df2.head())

# If both CSVs have the same naming for the key columns, you can merge directly.
# In your case, you have columns like 'StateFIPS' and 'CountyFIPS'.
# If you want to ensure that the county matches exactly, you can also include 'County' in the merge key.
# For example, if you are confident the county names match exactly:
merge_keys = ["StateFIPS", "CountyFIPS", "County"]

# If the county names are identical, use the keys below.
# Otherwise, you can merge only on the FIPS codes.
# merge_keys = ["StateFIPS", "CountyFIPS"]

# Select only the race columns from df2 (starting from "All Non-White Races including Hispanic" to the end)
# Note: Adjust the column names if necessary.
race_columns = [
    "All Non-White Races including Hispanic",
    "American Indian/Alaskan Native including Hispanic",
    "Asian/Pacific Islander including Hispanic",
    "Black including Hispanic",
    "Hispanic All Races",
    "Other including Hispanic",
    "White including Hispanic"
]
# Include the merge keys from df2 as well (if they exist)
df2_subset = df2[merge_keys + race_columns]

# Merge the two dataframes on the keys.
merged_df = pd.merge(df1, df2_subset, on=merge_keys, how="left")

# Check if the merge worked as expected (optional)
print(merged_df.head())

# Save the merged dataframe to a new CSV.
merged_df.to_csv("merged_output.csv", index=False)
