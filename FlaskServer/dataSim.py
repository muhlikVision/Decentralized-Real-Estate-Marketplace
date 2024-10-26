import numpy as np
import pandas as pd
import random

#Data generation parameters
n_samples = 100000  # Number of rows (properties) in the dataset
min_year = 1950  # Minimum year built
max_year = 2023  # Maximum year built

#Function to calculate price in ETH based on factors
def calculate_price(bedrooms, bathrooms, sqft, year_built):
    base_price = 10  # Base price in ETH
    bedroom_factor = 0.5 * bedrooms  # Increase per bedroom (0.5 ETH per bedroom)
    bathroom_factor = 0.3 * bathrooms  # Increase per bathroom (0.3 ETH per bathroom)
    sqft_factor = 0.002 * sqft  # Increase per sqft (0.0002 ETH per sqft)
    year_factor = 0.5 * (year_built - 1950)  # Increase based on how new the house is (0.02 ETH per year after 1950)
    return base_price + bedroom_factor + bathroom_factor + sqft_factor + year_factor

#Lists to hold generated data
data = []

#enerate data
for i in range(n_samples):
    bedrooms = random.randint(1, 6)  # Random bedrooms between 1 and 6
    bathrooms = random.randint(1, bedrooms)  # Random bathrooms, must be less than or equal to bedrooms
    sqft = random.randint(500, 5000)  # Random square footage between 500 and 5000
    year_built = random.randint(min_year, max_year)  # Random year built
    price = calculate_price(bedrooms, bathrooms, sqft, year_built)  # Calculate price in ETH

    # Append row to the dataset
    data.append([bedrooms, bathrooms, sqft, year_built, price])

#reate a pandas DataFrame
columns = ['Bedrooms', 'Bathrooms', 'Sqft', 'Year_Built', 'Price (ETH)']
df = pd.DataFrame(data, columns=columns)
print(df.head(100))
#Save the dataset to a CSV file
df.to_csv('Property_Data.csv', index=False)

print("Dataset generated and saved as 'data_eth.csv'")