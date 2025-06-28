import math
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in environment or .env file")

genai.configure(api_key=GEMINI_API_KEY)

app = Flask(__name__)
CORS(app)

def generate_ai_explanation(scenario, inputs, results):
    prompt = f"""
    Explain these wireless network calculations to an engineering student:
    Scenario: {scenario}
    Inputs: {inputs}
    Results: {results}
    Focus on:
    1. Key formulas used
    2. Practical implications
    3. One optimization suggestion
    """
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        formula_hints = {
            "Wireless Communication System": "Output = Input × Rate",
            "OFDM System": "Symbol Rate = Subcarriers × Bits per Symbol / Symbol Duration",
            "Link Budget Calculation": "Rx Power = Tx Power + Gains − Path Loss",
            "Cellular System Design": "Capacity = Channels × Cells / Cluster Size"
        }
        fallback_explanation = f"""Default Explanation (AI offline):
            Scenario: {scenario}
            Formulas used: {formula_hints.get(scenario, 'General formula')}
            Optimization: Consider increasing signal strength or reducing distance.
            (Error: {str(e)})"""
        return fallback_explanation


# Wireless Communication System
@app.route('/api/wireless', methods=['POST'])
def compute_wireless():
    data = request.json
    try:
        fs = float(data['samplingRate'])
        q = int(data['quantizationBits'])
        r1 = float(data['sourceCodingRate'])
        r2 = float(data['channelCodingRate'])
        r3 = float(data['interleavingRate'])
        r4 = float(data['burstFormattingRate'])

        # Calculations
        sampler_output = fs
        quantizer_output = sampler_output * q
        source_encoder_output = quantizer_output * r1
        channel_encoder_output = source_encoder_output * r2
        interleaver_output = channel_encoder_output * r3
        burst_output = interleaver_output * r4

        results = {
            "samplerOutput": sampler_output,
            "quantizerOutput": quantizer_output,
            "sourceEncoderOutput": source_encoder_output,
            "channelEncoderOutput": channel_encoder_output,
            "interleaverOutput": interleaver_output,
            "burstFormatterOutput": burst_output
        }

        explanation = generate_ai_explanation("Wireless Communication System", data, results)

        return jsonify({
            "success": True,
            "results": results,
            "explanation": explanation
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# OFDM System
@app.route('/api/ofdm', methods=['POST'])
def compute_ofdm():
    data = request.json
    try:
        N_subcarriers = int(data['subcarriers'])
        bits_per_symbol = int(data['bitsPerSymbol'])
        symbol_duration_us = float(data['symbolDuration'])
        N_parallel_blocks = int(data['parallelBlocks'])

        symbol_duration = symbol_duration_us * 1e-6
        re_rate = bits_per_symbol / symbol_duration
        symbol_rate = re_rate * N_subcarriers
        rb_rate = symbol_rate * 12 / N_subcarriers
        max_capacity = symbol_rate * N_parallel_blocks
        spectral_efficiency = (max_capacity / 1e6) / (N_subcarriers * 0.015)

        results = {
            "resourceElementRate": re_rate,
            "symbolRate": symbol_rate / 1e6,
            "resourceBlockRate": rb_rate / 1e3,
            "maxCapacity": max_capacity / 1e9,
            "spectralEfficiency": spectral_efficiency
        }

        explanation = generate_ai_explanation("OFDM System", data, results)

        return jsonify({
            "success": True,
            "results": results,
            "explanation": explanation
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# Link Budget Calculation
@app.route('/api/linkbudget', methods=['POST'])
def compute_link_budget():
    data = request.json
    try:
        tx_power = float(data['txPower'])
        tx_gain = float(data['txAntennaGain'])
        rx_gain = float(data['rxAntennaGain'])
        freq_mhz = float(data['frequency'])
        distance_km = float(data['distance'])

        freq_ghz = freq_mhz / 1000
        fspl = 20 * math.log10(distance_km) + 20 * math.log10(freq_ghz) + 92.45
        rx_power = tx_power + tx_gain + rx_gain - fspl

        results = {
            "receivedPower": round(rx_power, 2),
            "pathLoss": round(fspl, 2),
            "transmittedPower": tx_power
        }

        explanation = generate_ai_explanation("Link Budget Calculation", data, results)

        return jsonify({
            "success": True,
            "results": results,
            "explanation": explanation
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# Cellular System Design
@app.route('/api/cellular', methods=['POST'])
def compute_cellular():
    data = request.json
    try:
        area = float(data['area'])
        users_per_km2 = float(data['userDensity'])
        channels_per_cell = int(data['channelsPerCell'])
        cluster_size = int(data['clusterSize'])

        cells_needed = math.ceil(area * users_per_km2 / (channels_per_cell * 50))
        frequency_reuse_factor = 1 / cluster_size
        capacity = (channels_per_cell * cells_needed) / cluster_size

        results = {
            "cellsNeeded": cells_needed,
            "frequencyReuseFactor": frequency_reuse_factor,
            "systemCapacity": capacity
        }

        explanation = generate_ai_explanation("Cellular System Design", data, results)

        return jsonify({
            "success": True,
            "results": results,
            "explanation": explanation
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)
