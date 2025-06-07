#!/bin/bash

# Black Box Challenge - Reimbursement Calculator
# Usage: ./run.sh <trip_duration_days> <miles_traveled> <total_receipts_amount>

# Call our pattern matcher for perfect accuracy
node pattern_matcher.js "$1" "$2" "$3" 