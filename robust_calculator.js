#!/usr/bin/env node

const fs = require('fs');
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

// Silent mode for command line usage
if (process.argv.length === 5) {
    function calculateReimbursement(tripDays, miles, receipts) {
        // ROBUST MATHEMATICAL MODEL - Based on comprehensive analysis
        
        // 1. VARIABLE DAILY RATE (Inverse relationship discovered)
        // From analysis: rate decreases as trip gets longer
        // Formula: rate = 800/days + 70 (from polynomial analysis)
        const dailyRate = (800 / tripDays) + 70;
        
        // 2. BASE AMOUNT (Days component)
        const baseAmount = tripDays * dailyRate;
        
        // 3. MILEAGE COMPONENT (Linear relationship)
        // From regression analysis: coefficient around 0.50-0.58
        const mileageAmount = miles * 0.55;
        
        // 4. RECEIPT PROCESSING (Complex non-linear relationship)
        let receiptContribution = 0;
        
        if (receipts <= 0) {
            receiptContribution = 0;
        } else if (receipts < 25) {
            // Very low receipts: slight negative effect
            receiptContribution = receipts * -0.5;
        } else if (receipts < 100) {
            // Low receipts: negative to neutral effect
            receiptContribution = -12.5 + (receipts - 25) * -0.2;
        } else if (receipts < 300) {
            // Medium receipts: transition from negative to positive
            receiptContribution = -27.5 + (receipts - 100) * 0.1;
        } else if (receipts < 600) {
            // High receipts: positive contribution
            receiptContribution = -7.5 + (receipts - 300) * 0.3;
        } else if (receipts < 1000) {
            // Very high receipts: strong positive contribution
            receiptContribution = 82.5 + (receipts - 600) * 0.4;
        } else if (receipts < 1500) {
            // Extremely high receipts: diminishing returns
            receiptContribution = 242.5 + (receipts - 1000) * 0.25;
        } else {
            // Ultra high receipts: minimal additional benefit
            receiptContribution = 367.5 + (receipts - 1500) * 0.1;
        }
        
        // 5. TRIP LENGTH PENALTY (Discovered in failure analysis)
        // Long trips have efficiency penalties
        let lengthPenalty = 0;
        if (tripDays >= 10) {
            lengthPenalty = (tripDays - 9) * 15; // $15 penalty per day beyond 9
        } else if (tripDays >= 7) {
            lengthPenalty = (tripDays - 6) * 8; // $8 penalty per day beyond 6
        }
        
        // 6. EFFICIENCY BONUS/PENALTY
        // High mileage with short trips gets slight bonus
        const efficiency = miles / tripDays;
        let efficiencyAdjustment = 0;
        if (efficiency > 400 && tripDays <= 3) {
            efficiencyAdjustment = Math.min((efficiency - 400) * 0.05, 20);
        } else if (efficiency < 50 && tripDays >= 5) {
            efficiencyAdjustment = -Math.min((50 - efficiency) * 0.1, 15);
        }
        
        // 7. FINAL CALCULATION
        const subtotal = baseAmount + mileageAmount + receiptContribution - lengthPenalty + efficiencyAdjustment;
        
        // 8. MINIMUM FLOOR (System always pays something reasonable)
        const minimum = tripDays * 50; // At least $50 per day
        const total = Math.max(subtotal, minimum);
        
        return Math.round(total * 100) / 100;
    }

    const days = parseInt(process.argv[2]);
    const miles = parseInt(process.argv[3]);
    const receipts = parseFloat(process.argv[4]);
    
    const result = calculateReimbursement(days, miles, receipts);
    console.log(result.toFixed(2));
    process.exit(0);
}

console.log('🧮 Robust Mathematical Calculator v1.0');
console.log('=====================================\n');

function calculateReimbursement(tripDays, miles, receipts) {
    // Variable daily rate based on inverse relationship
    const dailyRate = (800 / tripDays) + 70;
    const baseAmount = tripDays * dailyRate;
    
    // Mileage component
    const mileageAmount = miles * 0.55;
    
    // Complex receipt processing
    let receiptContribution = 0;
    if (receipts <= 0) {
        receiptContribution = 0;
    } else if (receipts < 25) {
        receiptContribution = receipts * -0.5;
    } else if (receipts < 100) {
        receiptContribution = -12.5 + (receipts - 25) * -0.2;
    } else if (receipts < 300) {
        receiptContribution = -27.5 + (receipts - 100) * 0.1;
    } else if (receipts < 600) {
        receiptContribution = -7.5 + (receipts - 300) * 0.3;
    } else if (receipts < 1000) {
        receiptContribution = 82.5 + (receipts - 600) * 0.4;
    } else if (receipts < 1500) {
        receiptContribution = 242.5 + (receipts - 1000) * 0.25;
    } else {
        receiptContribution = 367.5 + (receipts - 1500) * 0.1;
    }
    
    // Trip length penalty
    let lengthPenalty = 0;
    if (tripDays >= 10) {
        lengthPenalty = (tripDays - 9) * 15;
    } else if (tripDays >= 7) {
        lengthPenalty = (tripDays - 6) * 8;
    }
    
    // Efficiency adjustment
    const efficiency = miles / tripDays;
    let efficiencyAdjustment = 0;
    if (efficiency > 400 && tripDays <= 3) {
        efficiencyAdjustment = Math.min((efficiency - 400) * 0.05, 20);
    } else if (efficiency < 50 && tripDays >= 5) {
        efficiencyAdjustment = -Math.min((50 - efficiency) * 0.1, 15);
    }
    
    const subtotal = baseAmount + mileageAmount + receiptContribution - lengthPenalty + efficiencyAdjustment;
    const minimum = tripDays * 50;
    const total = Math.max(subtotal, minimum);
    
    return Math.round(total * 100) / 100;
}

// Test examples showing formula components
console.log('🧪 FORMULA COMPONENT ANALYSIS:');
console.log('==============================\n');

const testCases = [
    { days: 1, miles: 100, receipts: 50, desc: "Short trip, medium miles, low receipts" },
    { days: 3, miles: 200, receipts: 150, desc: "Medium trip, medium miles, medium receipts" },
    { days: 7, miles: 500, receipts: 800, desc: "Long trip, high miles, high receipts" },
    { days: 12, miles: 300, receipts: 400, desc: "Very long trip with penalty" },
    { days: 2, miles: 1000, receipts: 100, desc: "High efficiency bonus case" }
];

testCases.forEach((test, i) => {
    console.log(`Test ${i+1}: ${test.desc}`);
    console.log(`Input: ${test.days} days, ${test.miles} miles, $${test.receipts} receipts`);
    
    // Show component breakdown
    const dailyRate = (800 / test.days) + 70;
    const baseAmount = test.days * dailyRate;
    const mileageAmount = test.miles * 0.55;
    
    let receiptContribution = 0;
    const r = test.receipts;
    if (r <= 0) receiptContribution = 0;
    else if (r < 25) receiptContribution = r * -0.5;
    else if (r < 100) receiptContribution = -12.5 + (r - 25) * -0.2;
    else if (r < 300) receiptContribution = -27.5 + (r - 100) * 0.1;
    else if (r < 600) receiptContribution = -7.5 + (r - 300) * 0.3;
    else if (r < 1000) receiptContribution = 82.5 + (r - 600) * 0.4;
    else if (r < 1500) receiptContribution = 242.5 + (r - 1000) * 0.25;
    else receiptContribution = 367.5 + (r - 1500) * 0.1;
    
    let lengthPenalty = 0;
    if (test.days >= 10) lengthPenalty = (test.days - 9) * 15;
    else if (test.days >= 7) lengthPenalty = (test.days - 6) * 8;
    
    const efficiency = test.miles / test.days;
    let efficiencyAdj = 0;
    if (efficiency > 400 && test.days <= 3) efficiencyAdj = Math.min((efficiency - 400) * 0.05, 20);
    else if (efficiency < 50 && test.days >= 5) efficiencyAdj = -Math.min((50 - efficiency) * 0.1, 15);
    
    const result = calculateReimbursement(test.days, test.miles, test.receipts);
    
    console.log(`  Daily rate: $${dailyRate.toFixed(2)}/day`);
    console.log(`  Base amount: $${baseAmount.toFixed(2)} (${test.days} × $${dailyRate.toFixed(2)})`);
    console.log(`  Mileage: $${mileageAmount.toFixed(2)} (${test.miles} × $0.55)`);
    console.log(`  Receipt contribution: $${receiptContribution.toFixed(2)}`);
    console.log(`  Length penalty: $${lengthPenalty.toFixed(2)}`);
    console.log(`  Efficiency adjustment: $${efficiencyAdj.toFixed(2)}`);
    console.log(`  TOTAL: $${result.toFixed(2)}`);
    console.log();
});

// Test on training data
const errors = publicCases.map(c => {
    const calculated = calculateReimbursement(c.input.trip_duration_days, c.input.miles_traveled, c.input.total_receipts_amount);
    const error = Math.abs(calculated - c.expected_output);
    return { case: c, calculated, expected: c.expected_output, error };
});

const exactMatches = errors.filter(e => e.error < 0.01).length;
const closeMatches = errors.filter(e => e.error < 1.0).length;
const veryCloseMatches = errors.filter(e => e.error < 10.0).length;
const avgError = errors.reduce((sum, e) => sum + e.error, 0) / errors.length;

console.log('📊 ROBUST MODEL PERFORMANCE:');
console.log('============================\n');
console.log(`Exact matches (±$0.01): ${exactMatches}/1000 (${(exactMatches/10).toFixed(1)}%)`);
console.log(`Close matches (±$1.00): ${closeMatches}/1000 (${(closeMatches/10).toFixed(1)}%)`);
console.log(`Very close (±$10.00): ${veryCloseMatches}/1000 (${(veryCloseMatches/10).toFixed(1)}%)`);
console.log(`Average error: $${avgError.toFixed(2)}`);

// Show improvement areas
if (avgError > 100) {
    console.log('\n🔧 AREAS FOR IMPROVEMENT:');
    const worstCases = errors.sort((a, b) => b.error - a.error).slice(0, 5);
    worstCases.forEach((e, i) => {
        const c = e.case;
        console.log(`${i+1}. ${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount.toFixed(2)}`);
        console.log(`   Expected: $${e.expected.toFixed(2)}, Got: $${e.calculated.toFixed(2)}, Error: $${e.error.toFixed(2)}`);
    });
}

console.log('\n✅ Robust mathematical model ready for evaluation!');

module.exports = { calculateReimbursement }; 