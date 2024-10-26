import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

#Load the simulated dataset
df = pd.read_csv('Property_Data.csv')

#Separate the features (X) and the target variable (y)
X = df[['Bedrooms', 'Bathrooms', 'Sqft', 'Year_Built']]
y = df['Price (ETH)']

#Split the data into training and testing sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

#Initialize the RandomForestRegressor
model = RandomForestRegressor(n_estimators=100, random_state=42)

#Train the model
model.fit(X_train, y_train)

#Make predictions on the test set
y_pred = model.predict(X_test)

#Evaluate the model
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred, squared=False)

print(f"Mean Absolute Error (MAE): {mae:.2f} ETH")
print(f"Mean Squared Error (MSE): {mse:.2f} ETH")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f} ETH")

#Save the trained model as a .joblib file
joblib.dump(model, 'property_model.joblib')
print("Model trained and saved as 'real_estate_price_prediction_model.joblib'")