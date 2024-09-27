from flask import Flask, request, jsonify
import joblib
import requests
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

model = joblib.load('propertyModel.joblib')

@app.route('/predict_price', methods=['POST'])
def predict_price():
    try:
        property_data = request.get_json().get('property_data', None) 
        typeofRes = str(property_data.get('resType'))
        rooms = str(property_data.get('beds'))
        bath = str(property_data.get('baths'))
        sqft = str(property_data.get('sqfeet'))
        year = str(property_data.get('year'))

        input_data = [[typeofRes,rooms,bath,sqft,year]]
        price = model.predict(input_data)

        #return jsonify({'predicted_price': price}), 200
        #return jsonify({'predicted_price': '23'}), 200

    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
