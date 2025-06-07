#!/usr/bin/env node

const fs = require('fs');

// Load the test data for validation
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

// If we have command line arguments, calculate for those and exit early (silent mode)
if (process.argv.length === 5) {
    function calculateReimbursement(tripDays, miles, receipts) {
        // Base formula from regression analysis: 111*days + 0.97*miles
        let baseAmount = tripDays * 111 + miles * 0.97;
        
        // Receipt processing with discovered thresholds
        let receiptContribution = 0;
        
        if (receipts < 50) {
            // Heavy penalty for very low receipts
            receiptContribution = receipts * -1.3;
        } else if (receipts < 200) {
            // Penalty for low receipts  
            receiptContribution = receipts * -0.7;
        } else if (receipts < 400) {
            // Still penalized but less
            receiptContribution = receipts * -0.4;
        } else if (receipts < 600) {
            // Neutral zone
            receiptContribution = receipts * 0.1;
        } else if (receipts < 800) {
            // Positive contribution starts
            receiptContribution = receipts * 0.25;
        } else if (receipts < 1200) {
            // Good contribution
            receiptContribution = receipts * 0.4;
        } else if (receipts < 1600) {
            // Diminishing returns start
            receiptContribution = 800 * 0.4 + (receipts - 800) * 0.35;
        } else if (receipts < 2000) {
            // More diminishing
            receiptContribution = 800 * 0.4 + 400 * 0.35 + (receipts - 1200) * 0.3;
        } else {
            // Heavily diminished for very high
            receiptContribution = 800 * 0.4 + 400 * 0.35 + 800 * 0.3 + (receipts - 2000) * 0.2;
        }
        
        const total = baseAmount + receiptContribution;
        return Math.round(total * 100) / 100;
    }

    const days = parseInt(process.argv[2]);
    const miles = parseInt(process.argv[3]);
    const receipts = parseFloat(process.argv[4]);
    
    const result = calculateReimbursement(days, miles, receipts);
    console.log(result.toFixed(2));
    process.exit(0);
}

console.log('🎯 Refined Reimbursement Calculator (Data-Driven)');
console.log('=================================================\n');

function calculateReimbursement(tripDays, miles, receipts) {
    // Base formula from regression analysis: 111*days + 0.97*miles
    let baseAmount = tripDays * 111 + miles * 0.97;
    
    // Receipt processing with discovered thresholds
    let receiptContribution = 0;
    
    if (receipts < 50) {
        // Heavy penalty for very low receipts
        receiptContribution = receipts * -1.3;
    } else if (receipts < 200) {
        // Penalty for low receipts  
        receiptContribution = receipts * -0.7;
    } else if (receipts < 400) {
        // Still penalized but less
        receiptContribution = receipts * -0.4;
    } else if (receipts < 600) {
        // Neutral zone
        receiptContribution = receipts * 0.1;
    } else if (receipts < 800) {
        // Positive contribution starts
        receiptContribution = receipts * 0.25;
    } else if (receipts < 1200) {
        // Good contribution
        receiptContribution = receipts * 0.4;
    } else if (receipts < 1600) {
        // Diminishing returns start
        receiptContribution = 800 * 0.4 + (receipts - 800) * 0.35;
    } else if (receipts < 2000) {
        // More diminishing
        receiptContribution = 800 * 0.4 + 400 * 0.35 + (receipts - 1200) * 0.3;
    } else {
        // Heavily diminished for very high
        receiptContribution = 800 * 0.4 + 400 * 0.35 + 800 * 0.3 + (receipts - 2000) * 0.2;
    }
    
    const total = baseAmount + receiptContribution;
    return Math.round(total * 100) / 100;
}

// Test the refined calculator
function testCalculator() {
    const errors = publicCases.map(c => {
        const calculated = calculateReimbursement(
            c.input.trip_duration_days,
            c.input.miles_traveled,
            c.input.total_receipts_amount
        );
        const error = Math.abs(calculated - c.expected_output);
        return { case: c, calculated, expected: c.expected_output, error };
    });
    
    const exactMatches = errors.filter(e => e.error < 0.01).length;
    const closeMatches = errors.filter(e => e.error < 1.0).length;
    const veryCloseMatches = errors.filter(e => e.error < 10.0).length;
    const goodMatches = errors.filter(e => e.error < 50.0).length;
    const avgError = errors.reduce((sum, e) => sum + e.error, 0) / errors.length;
    const maxError = Math.max(...errors.map(e => e.error));
    
    console.log(`Refined Calculator Results:`);
    console.log(`  Exact matches (±$0.01): ${exactMatches}/${publicCases.length} (${(exactMatches/publicCases.length*100).toFixed(1)}%)`);
    console.log(`  Close matches (±$1.00): ${closeMatches}/${publicCases.length} (${(closeMatches/publicCases.length*100).toFixed(1)}%)`);
    console.log(`  Very close (±$10.00): ${veryCloseMatches}/${publicCases.length} (${(veryCloseMatches/publicCases.length*100).toFixed(1)}%)`);
    console.log(`  Good matches (±$50.00): ${goodMatches}/${publicCases.length} (${(goodMatches/publicCases.length*100).toFixed(1)}%)`);
    console.log(`  Average error: $${avgError.toFixed(2)}`);
    console.log(`  Max error: $${maxError.toFixed(2)}`);
    console.log();
    
    // Show some examples
    console.log(`Sample results (first 10 cases):`);
    errors.slice(0, 10).forEach((e, i) => {
        const c = e.case;
        console.log(`  ${i+1}. ${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount.toFixed(2)} → Expected: $${e.expected.toFixed(2)}, Got: $${e.calculated.toFixed(2)}, Error: $${e.error.toFixed(2)}`);
    });
    console.log();
    
    // Show error distribution
    const errorRanges = [
        { min: 0, max: 1, label: '±$1' },
        { min: 1, max: 5, label: '±$5' },
        { min: 5, max: 10, label: '±$10' },
        { min: 10, max: 50, label: '±$50' },
        { min: 50, max: 100, label: '±$100' },
        { min: 100, max: Infinity, label: '>$100' }
    ];
    
    console.log('Error Distribution:');
    errorRanges.forEach(range => {
        const count = errors.filter(e => e.error >= range.min && e.error < range.max).length;
        const pct = (count / errors.length * 100).toFixed(1);
        console.log(`  ${range.label}: ${count} cases (${pct}%)`);
    });
    
    return { exactMatches, avgError, errors };
}



// Otherwise run the full test
const results = testCalculator();

// Export for use in run.sh
module.exports = { calculateReimbursement }; 