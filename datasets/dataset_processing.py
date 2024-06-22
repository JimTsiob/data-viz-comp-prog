import pandas as pd

# Load the two CSV files
df1 = pd.read_csv('questions.csv')
df2 = pd.read_csv('solutions.csv')

# Merge the two DataFrames on the QCode column
merged_df = pd.merge(df1, df2, on='QCode')

print(merged_df.columns)

# ====================== find average time taken per difficulty ====================== 

valid_levels = ['beginner','easy', 'medium', 'hard', 'challenge']

# Filter the DataFrame to keep only the valid levels
filtered_df = merged_df[merged_df['level'].isin(valid_levels)]

# Remove rows with dashes in the 'time_taken' column
filtered_df_no_dashes = filtered_df[filtered_df['TimeTaken'] != '-']

# Convert the 'time_taken' column to float
filtered_df_no_dashes['TimeTaken'] = filtered_df_no_dashes['TimeTaken'].astype(float)

# Remove rows with NaN values in the 'time_taken' column
df_cleaned = filtered_df_no_dashes.dropna(subset=['TimeTaken'])

# Group by 'level' and calculate the mean of 'time_taken'
average_time = df_cleaned.groupby('level')['TimeTaken'].mean().reset_index()

# Rename columns for clarity
average_time.columns = ['level', 'average_time_taken']

# Create csv
average_time.to_csv('average_time_per_diff.csv', index=False)
print("avg time csv file ready.")

# ====================== Number of accepted solutions per difficulty ======================

# Filter rows where the status is 'accepted'
accepted_df = filtered_df_no_dashes[filtered_df_no_dashes['Status'] == 'accepted']

# Group by 'level' and count the number of rows in each group
accepted_count_by_level = accepted_df.groupby('level').size().reset_index(name='accepted_count')


# Create csv
accepted_count_by_level.to_csv('number_of_accepted_solutions_per_level.csv', index=False)
print("number of solutions per level csv ready.")


# ====================== 2 users with the highest number of accepted solutions for challenge problems ======================

# Filter rows where the level is 'challenge' and the status is 'accepted'
challenge_accepted_df = filtered_df_no_dashes[(filtered_df_no_dashes['level'] == 'challenge') & (filtered_df_no_dashes['Status'] == 'accepted')]

# Group by 'userId' and count the number of accepted solutions for each user
accepted_count_by_user = challenge_accepted_df.groupby('UserID').size().reset_index(name='accepted_count')

# Sort the counts in descending order
sorted_counts = accepted_count_by_user.sort_values(by='accepted_count', ascending=False)

# Select the top 2 users
top_2_users = sorted_counts.head(2)

# Print their usernames
print(top_2_users)

# ====================== Fastest programming language by time taken ======================
# Group by 'language' and calculate the mean of 'time_taken'
mean_time_by_language = filtered_df_no_dashes.groupby('Language')['TimeTaken'].mean().reset_index()
mean_time_by_language.to_csv('fastest_language_by_time_taken.csv', index=False)
print("Fastest language by time taken csv ready.")

# ====================== Average time taken for all types of solutions ======================
# Group by 'status' and calculate the mean of 'time_taken'
mean_time_by_status = filtered_df_no_dashes.groupby('Status')['TimeTaken'].mean().reset_index()
mean_time_by_status.to_csv('average_time_taken_all_statuses.csv', index=False)
print("average time taken for all statuses csv ready.")


# ====================== Tested vs Untested solutions ======================
print(filtered_df_no_dashes['Status'].unique())

filtered_df_no_dashes = filtered_df_no_dashes.dropna(subset=['Status'])

# Define a function to categorize statuses
def categorize_status(status):
    if status == 'accepted':
        return 'accepted'
    elif 'runtime error' in status:
        return 'runtime error'
    else:
        return 'other'

# Apply the function to create a new column 'GeneralStatus'
filtered_df_no_dashes['GeneralStatus'] = filtered_df_no_dashes['Status'].apply(categorize_status)

# Create a new column 'Test_Status' to indicate 'Tested' or 'Untested'
filtered_df_no_dashes['Test_Status'] = filtered_df_no_dashes['Tester'].apply(lambda x: 'Untested' if pd.isna(x) or x == '' else 'Tested')

print(filtered_df_no_dashes['Test_Status'].unique())

# Filter the DataFrame to include only rows with 'accepted' or 'compilation error' status
# filtered_df = filtered_df_no_dashes[filtered_df_no_dashes['Status'].isin(['accepted', 'runtime error(SIGXFSZ)'])]
print(filtered_df_no_dashes['GeneralStatus'].unique())
print(filtered_df_no_dashes['Test_Status'].unique())

# Group by 'Test_Status' and 'Status' and count the occurrences
grouped_df = filtered_df_no_dashes.groupby(['Test_Status', 'GeneralStatus']).size().reset_index(name='Count')

grouped_df.to_csv('tested_vs_untested_solutions.csv', index=False)
print('tested_vs_untested_solutions.csv ready.')
