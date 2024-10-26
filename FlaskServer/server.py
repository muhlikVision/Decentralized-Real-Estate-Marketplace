from flask import Flask, request, jsonify
import joblib
import requests
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

model = joblib.load('property_model.joblib')

@app.route('/predict_price', methods=['POST'])
def predict_price():
    try:
        property_data = request.get_json().get('property_data', None) 
        #print(property_data.get('beds'))
        #typeofRes = str(property_data.get('resType'))
        rooms = int(property_data.get('beds'))
        bath = int(property_data.get('baths'))
        sqft = int(property_data.get('sqfeet'))
        year = int(property_data.get('year'))

        input_data = [[rooms,bath,sqft,year]]
        price = model.predict(input_data)

        # Convert the prediction (NumPy array) to a float
        predicted_price = float(price[0])

        return jsonify({'predicted_price': predicted_price}), 200

    except Exception as e:
        print('Error In Flask Server')
        print(str(e))
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
