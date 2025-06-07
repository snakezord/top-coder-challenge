#!/usr/bin/env node

const fs = require('fs');

// Load the test data for validation
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

console.log('🧮 Pattern-Based Reimbursement Calculator');
console.log('=========================================\n');

function calculateReimbursement(tripDays, miles, receipts) {
    // Based on analysis, this appears to be a complex system with multiple factors
    
    // 1. Base per-day amount that varies by trip length
    let baseDailyRate = 100; // Starting assumption
    
    // Trip length coefficient (shorter trips get higher per-day rates)
    if (tripDays === 1) {
        baseDailyRate = 140;
    } else if (tripDays === 2) {
        baseDailyRate = 105;
    } else if (tripDays === 3) {
        baseDailyRate = 95;
    } else if (tripDays <= 5) {
        baseDailyRate = 90;
    } else if (tripDays <= 8) {
        baseDailyRate = 85;
    } else if (tripDays <= 12) {
        baseDailyRate = 80;
    } else {
        baseDailyRate = 75;
    }
    
    let baseAmount = tripDays * baseDailyRate;
    
    // 2. Mileage calculation with efficiency bonuses
    let mileageComponent = 0;
    const efficiency = miles / tripDays;
    
    // Base mileage rate appears to be around 0.5-0.6 per mile
    let mileageRate = 0.58;
    
    // Efficiency bonus/penalty
    if (efficiency >= 75 && efficiency <= 150) {
        mileageRate = 0.65; // Sweet spot bonus
    } else if (efficiency > 150 && efficiency <= 250) {
        mileageRate = 0.60; // High efficiency
    } else if (efficiency > 250) {
        mileageRate = 0.45; // Too much driving penalty
    } else if (efficiency < 50) {
        mileageRate = 0.50; // Low efficiency penalty
    }
    
    mileageComponent = miles * mileageRate;
    
    // 3. Receipt processing with penalties and bonuses
    let receiptComponent = 0;
    const dailySpending = receipts / tripDays;
    
    if (receipts < 25) {
        // Small receipt penalty
        receiptComponent = receipts * 0.3;
    } else if (receipts < 100) {
        // Low receipts get modest treatment
        receiptComponent = receipts * 0.5;
    } else if (receipts < 500) {
        // Medium receipts get good treatment
        receiptComponent = receipts * 0.7;
    } else if (receipts < 1000) {
        // Higher receipts start diminishing
        receiptComponent = 500 * 0.7 + (receipts - 500) * 0.6;
    } else if (receipts < 1500) {
        // High receipts diminish more
        receiptComponent = 500 * 0.7 + 500 * 0.6 + (receipts - 1000) * 0.5;
    } else {
        // Very high receipts capped
        receiptComponent = 500 * 0.7 + 500 * 0.6 + 500 * 0.5 + (receipts - 1500) * 0.3;
    }
    
    // 4. Trip length bonuses/penalties based on spending patterns
    if (tripDays >= 5 && dailySpending > 80 && dailySpending < 150) {
        // Medium trips with reasonable spending get bonus
        baseAmount *= 1.1;
    }
    
    if (tripDays > 10 && dailySpending > 150) {
        // Long trips with high spending get penalty
        receiptComponent *= 0.8;
    }
    
    // 5. Efficiency bonuses
    if (efficiency >= 100 && efficiency <= 200 && tripDays >= 3) {
        // Efficiency bonus for multi-day trips
        mileageComponent *= 1.15;
    }
    
    const total = baseAmount + mileageComponent + receiptComponent;
    return Math.round(total * 100) / 100; // Round to 2 decimal places
}

// Test the calculator
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
    const avgError = errors.reduce((sum, e) => sum + e.error, 0) / errors.length;
    const maxError = Math.max(...errors.map(e => e.error));
    
    console.log(`Pattern-Based Calculator Results:`);
    console.log(`  Exact matches (±$0.01): ${exactMatches}/${publicCases.length} (${(exactMatches/publicCases.length*100).toFixed(1)}%)`);
    console.log(`  Close matches (±$1.00): ${closeMatches}/${publicCases.length} (${(closeMatches/publicCases.length*100).toFixed(1)}%)`);
    console.log(`  Very close (±$10.00): ${veryCloseMatches}/${publicCases.length} (${(veryCloseMatches/publicCases.length*100).toFixed(1)}%)`);
    console.log(`  Average error: $${avgError.toFixed(2)}`);
    console.log(`  Max error: $${maxError.toFixed(2)}`);
    console.log();
    
    if (exactMatches < 100) {
        console.log(`Sample results (first 10 cases):`);
        errors.slice(0, 10).forEach((e, i) => {
            const c = e.case;
            console.log(`  ${i+1}. ${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount.toFixed(2)} → Expected: $${e.expected.toFixed(2)}, Got: $${e.calculated.toFixed(2)}, Error: $${e.error.toFixed(2)}`);
        });
        console.log();
        
        console.log(`Worst cases:`);
        errors.sort((a, b) => b.error - a.error).slice(0, 5).forEach((e, i) => {
            const c = e.case;
            console.log(`  ${i+1}. ${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount.toFixed(2)} → Expected: $${e.expected.toFixed(2)}, Got: $${e.calculated.toFixed(2)}, Error: $${e.error.toFixed(2)}`);
        });
    }
    
    return { exactMatches, avgError, errors };
}

const results = testCalculator();

// If we have command line arguments, calculate for those
if (process.argv.length === 5) {
    const days = parseInt(process.argv[2]);
    const miles = parseInt(process.argv[3]);
    const receipts = parseFloat(process.argv[4]);
    
    const result = calculateReimbursement(days, miles, receipts);
    console.log(result.toFixed(2));
} else {
    console.log('💡 Next step: Analyze the patterns in the worst cases to improve the model.');
}

// Export for use in other scripts
module.exports = { calculateReimbursement }; 