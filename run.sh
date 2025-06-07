#!/bin/bash

# Black Box Challenge - Reimbursement Calculator
# Usage: ./run.sh <trip_duration_days> <miles_traveled> <total_receipts_amount>

# Call our new data-driven calculator
node data_driven_calculator.js "$1" "$2" "$3" 