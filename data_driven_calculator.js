#!/usr/bin/env node

const fs = require('fs');

// Silent mode for command line usage
if (process.argv.length === 5) {
    function calculateReimbursement(tripDays, miles, receipts) {
        // The system clearly has very different per-day rates based on trip length
        let dailyRate;
        if (tripDays === 1) {
            dailyRate = 140; // High rate for single days
        } else if (tripDays === 2) {
            dailyRate = 105; // Still good for 2 days
        } else if (tripDays === 3) {
            dailyRate = 95; // Decent for 3 days
        } else if (tripDays <= 5) {
            dailyRate = 85; // Medium for 4-5 days
        } else if (tripDays <= 8) {
            dailyRate = 70; // Lower for 6-8 days
        } else if (tripDays <= 12) {
            dailyRate = 60; // Very low for long trips
        } else {
            dailyRate = 50; // Penalized heavily for very long trips
        }
        
        let baseAmount = tripDays * dailyRate;
        
        // Mileage component - lower rate than I thought
        let mileageAmount = miles * 0.45;
        
        // Receipt processing - MUCH more conservative
        let receiptContribution = 0;
        
        // The system seems to penalize receipts heavily, especially for long trips
        if (tripDays >= 8) {
            // Long trips get penalized on receipts
            if (receipts < 100) {
                receiptContribution = receipts * -0.5; // Penalty for low receipts
            } else if (receipts < 500) {
                receiptContribution = receipts * 0.1; // Minimal contribution
            } else if (receipts < 1000) {
                receiptContribution = 500 * 0.1 + (receipts - 500) * 0.05; // Very low
            } else {
                receiptContribution = 500 * 0.1 + 500 * 0.05 + (receipts - 1000) * -0.1; // NEGATIVE for high amounts!
            }
        } else if (tripDays >= 5) {
            // Medium trips
            if (receipts < 50) {
                receiptContribution = receipts * -0.3;
            } else if (receipts < 300) {
                receiptContribution = receipts * 0.2;
            } else if (receipts < 800) {
                receiptContribution = receipts * 0.3;
            } else {
                receiptContribution = 800 * 0.3 + (receipts - 800) * 0.1;
            }
        } else {
            // Short trips (1-4 days) - more generous
            if (receipts < 25) {
                receiptContribution = receipts * -0.2;
            } else if (receipts < 200) {
                receiptContribution = receipts * 0.3;
            } else if (receipts < 600) {
                receiptContribution = receipts * 0.5;
            } else if (receipts < 1200) {
                receiptContribution = 600 * 0.5 + (receipts - 600) * 0.4;
            } else {
                receiptContribution = 600 * 0.5 + 600 * 0.4 + (receipts - 1200) * 0.2;
            }
        }
        
        const total = baseAmount + mileageAmount + receiptContribution;
        return Math.round(total * 100) / 100;
    }

    const days = parseInt(process.argv[2]);
    const miles = parseInt(process.argv[3]);
    const receipts = parseFloat(process.argv[4]);
    
    const result = calculateReimbursement(days, miles, receipts);
    console.log(result.toFixed(2));
    process.exit(0);
}

// Test mode
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

console.log('📊 Data-Driven Calculator v2.0');
console.log('===============================\n');

function calculateReimbursement(tripDays, miles, receipts) {
    // Trip-length-based daily rates (from analysis)
    let dailyRate;
    if (tripDays === 1) {
        dailyRate = 140;
    } else if (tripDays === 2) {
        dailyRate = 105;
    } else if (tripDays === 3) {
        dailyRate = 95;
    } else if (tripDays <= 5) {
        dailyRate = 85;
    } else if (tripDays <= 8) {
        dailyRate = 70;
    } else if (tripDays <= 12) {
        dailyRate = 60;
    } else {
        dailyRate = 50;
    }
    
    let baseAmount = tripDays * dailyRate;
    let mileageAmount = miles * 0.45;
    let receiptContribution = 0;
    
    // Receipt processing based on trip length
    if (tripDays >= 8) {
        // Long trips - heavily penalized receipts
        if (receipts < 100) {
            receiptContribution = receipts * -0.5;
        } else if (receipts < 500) {
            receiptContribution = receipts * 0.1;
        } else if (receipts < 1000) {
            receiptContribution = 500 * 0.1 + (receipts - 500) * 0.05;
        } else {
            receiptContribution = 500 * 0.1 + 500 * 0.05 + (receipts - 1000) * -0.1;
        }
    } else if (tripDays >= 5) {
        // Medium trips
        if (receipts < 50) {
            receiptContribution = receipts * -0.3;
        } else if (receipts < 300) {
            receiptContribution = receipts * 0.2;
        } else if (receipts < 800) {
            receiptContribution = receipts * 0.3;
        } else {
            receiptContribution = 800 * 0.3 + (receipts - 800) * 0.1;
        }
    } else {
        // Short trips - more generous
        if (receipts < 25) {
            receiptContribution = receipts * -0.2;
        } else if (receipts < 200) {
            receiptContribution = receipts * 0.3;
        } else if (receipts < 600) {
            receiptContribution = receipts * 0.5;
        } else if (receipts < 1200) {
            receiptContribution = 600 * 0.5 + (receipts - 600) * 0.4;
        } else {
            receiptContribution = 600 * 0.5 + 600 * 0.4 + (receipts - 1200) * 0.2;
        }
    }
    
    const total = baseAmount + mileageAmount + receiptContribution;
    return Math.round(total * 100) / 100;
}

// Test the new calculator
const errors = publicCases.map(c => {
    const calculated = calculateReimbursement(c.input.trip_duration_days, c.input.miles_traveled, c.input.total_receipts_amount);
    const error = Math.abs(calculated - c.expected_output);
    return { case: c, calculated, expected: c.expected_output, error };
});

const exactMatches = errors.filter(e => e.error < 0.01).length;
const closeMatches = errors.filter(e => e.error < 1.0).length;
const veryCloseMatches = errors.filter(e => e.error < 10.0).length;
const goodMatches = errors.filter(e => e.error < 50.0).length;
const avgError = errors.reduce((sum, e) => sum + e.error, 0) / errors.length;

console.log(`Results:`);
console.log(`  Exact matches (±$0.01): ${exactMatches}/1000 (${(exactMatches/10).toFixed(1)}%)`);
console.log(`  Close matches (±$1.00): ${closeMatches}/1000 (${(closeMatches/10).toFixed(1)}%)`);
console.log(`  Very close (±$10.00): ${veryCloseMatches}/1000 (${(veryCloseMatches/10).toFixed(1)}%)`);
console.log(`  Good matches (±$50.00): ${goodMatches}/1000 (${(goodMatches/10).toFixed(1)}%)`);
console.log(`  Average error: $${avgError.toFixed(2)}`);

// Show some examples
console.log('\nFirst 10 cases:');
errors.slice(0, 10).forEach((e, i) => {
    const c = e.case;
    console.log(`  ${i+1}. ${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount.toFixed(2)} → Expected: $${e.expected.toFixed(2)}, Got: $${e.calculated.toFixed(2)}, Error: $${e.error.toFixed(2)}`);
});

module.exports = { calculateReimbursement }; 