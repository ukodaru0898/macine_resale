"""
Placeholder optimizer script.
This is a very small Flask server that accepts POST /api/optimize with text/csv
and returns a modified CSV with some sample recommended values for yellow columns.

Install dependencies: pip install flask pandas
Run: python optimize.py

This is a stub for demonstration; replace with your real optimization logic.
"""
from flask import Flask, request, Response
from flask_cors import CORS
import pandas as pd
import io

app = Flask(__name__)
CORS(app)

@app.route('/api/optimize', methods=['POST'])
def optimize():
    # Expect text/csv in body
    csv = request.data.decode('utf-8')
    # The front-end sends repeated headers for each table; we'll parse the CSV and only adjust numeric value
    # columns that are after the table_id and row_id columns.
    from io import StringIO
    import csv as csvmod

    reader = csvmod.reader(StringIO(csv))
    out = []
    header = None
    for row in reader:
        if not row:
            continue
        if header is None:
            # this is a header row for a table
            header = row
            out.append(','.join(row))
            continue
        # row looks like: [table_id, row_id, col1, col2, ...]
        # do not modify the first two columns (table_id and row_id)
        table_id = row[0]
        row_id = row[1] if len(row) > 1 else ''
        new_row = row.copy()
        for i in range(2, len(row)):
            cell = row[i]
            try:
                f = float(cell)
                new_row[i] = str(round(f * 1.05, 2))
            except Exception:
                # keep string fields unchanged
                new_row[i] = cell
        out.append(','.join(new_row))

    out_csv = '\n'.join(out)

    # `out` contains the resulting rows
    out_csv = '\n'.join(out)
    # echo back
    return Response(out_csv, mimetype='text/csv')

if __name__ == '__main__':
    app.run('127.0.0.1', port=8000, debug=True)
