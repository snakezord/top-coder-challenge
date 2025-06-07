#!/usr/bin/env node

const fs = require('fs');
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

// Silent mode for command line usage
if (process.argv.length === 5) {
    function calculateReimbursement(tripDays, miles, receipts) {
        // FINAL OPTIMIZED MODEL
        // Based on critical insight: receipts have NEGATIVE effects at low amounts!
        
        // 1. BASE CALCULATION (from regression analysis)
        const baseAmount = (400 / tripDays + 80) * tripDays + 0.3 * miles;
        
        // 2. RECEIPT PROCESSING WITH NEGATIVE EFFECTS
        // Critical discovery: Low receipts REDUCE reimbursement!
        let receiptEffect = 0;
        
        if (receipts <= 0) {
            receiptEffect = 0;
        } else if (receipts < 100) {
            // Very low receipts: strong negative effect
            receiptEffect = receipts * -3.0; // Heavy penalty
        } else if (receipts < 300) {
            // Low receipts: moderate negative effect
            receiptEffect = -300 + (receipts - 100) * -1.5;
        } else if (receipts < 600) {
            // Medium receipts: transition from negative to positive
            receiptEffect = -600 + (receipts - 300) * 0.5;
        } else if (receipts < 1200) {
            // High receipts: positive contribution
            receiptEffect = -450 + (receipts - 600) * 1.2;
        } else if (receipts < 2000) {
            // Very high receipts: strong positive contribution
            receiptEffect = 270 + (receipts - 1200) * 0.8;
        } else {
            // Ultra high receipts: diminishing returns
            receiptEffect = 910 + (receipts - 2000) * 0.3;
        }
        
        // 3. APPLY RECEIPT EFFECT TO BASE
        const total = baseAmount + receiptEffect;
        
        // 4. REASONABLE BOUNDS
        const minimum = tripDays * 35; // At least $35/day
        const maximum = tripDays * 1500; // At most $1500/day
        
        return Math.round(Math.max(minimum, Math.min(maximum, total)) * 100) / 100;
    }

    const days = parseInt(process.argv[2]);
    const miles = parseInt(process.argv[3]);
    const receipts = parseFloat(process.argv[4]);
    
    const result = calculateReimbursement(days, miles, receipts);
    console.log(result.toFixed(2));
    process.exit(0);
}

console.log('🎯 Final Optimized Model v1.0');
console.log('=============================\n');
console.log('💡 KEY INSIGHT: Low receipts REDUCE reimbursement!');
console.log('   This legacy system penalizes minimal receipts.');
console.log();

// Create the final calculator
function calculateReimbursement(tripDays, miles, receipts) {
    // Base calculation from regression
    const baseAmount = (400 / tripDays + 80) * tripDays + 0.3 * miles;
    
    // Receipt processing with negative effects for low amounts
    let receiptEffect = 0;
    if (receipts <= 0) {
        receiptEffect = 0;
    } else if (receipts < 100) {
        receiptEffect = receipts * -3.0; // Heavy penalty for minimal receipts
    } else if (receipts < 300) {
        receiptEffect = -300 + (receipts - 100) * -1.5; // Moderate penalty
    } else if (receipts < 600) {
        receiptEffect = -600 + (receipts - 300) * 0.5; // Transition zone
    } else if (receipts < 1200) {
        receiptEffect = -450 + (receipts - 600) * 1.2; // Positive contribution
    } else if (receipts < 2000) {
        receiptEffect = 270 + (receipts - 1200) * 0.8; // Strong positive
    } else {
        receiptEffect = 910 + (receipts - 2000) * 0.3; // Diminishing returns
    }
    
    const total = baseAmount + receiptEffect;
    const minimum = tripDays * 35;
    const maximum = tripDays * 1500;
    
    return Math.round(Math.max(minimum, Math.min(maximum, total)) * 100) / 100;
}

// Demonstrate the receipt effect curve
console.log('📊 RECEIPT EFFECT CURVE:');
console.log('========================\n');

const receiptTestValues = [0, 25, 50, 100, 200, 400, 600, 800, 1000, 1500, 2000];
receiptTestValues.forEach(r => {
    const testDays = 3, testMiles = 200;
    const base = (400 / testDays + 80) * testDays + 0.3 * testMiles;
    const total = calculateReimbursement(testDays, testMiles, r);
    const effect = total - base;
    console.log(`$${r.toString().padStart(4)} receipts → Effect: $${effect.toFixed(2).padStart(7)} (Total: $${total.toFixed(2)})`);
});

// Test on a few specific cases
console.log('\n🧪 TEST CASES:');
console.log('==============\n');

const specificTests = [
    { days: 1, miles: 50, receipts: 10 },    // Very low receipts
    { days: 3, miles: 200, receipts: 150 },  // Low receipts  
    { days: 5, miles: 400, receipts: 800 },  // High receipts
    { days: 2, miles: 100, receipts: 1500 }  // Very high receipts
];

specificTests.forEach((test, i) => {
    const result = calculateReimbursement(test.days, test.miles, test.receipts);
    const base = (400 / test.days + 80) * test.days + 0.3 * test.miles;
    const effect = result - base;
    console.log(`Test ${i+1}: ${test.days}d, ${test.miles}mi, $${test.receipts}`);
    console.log(`  Base: $${base.toFixed(2)}, Effect: $${effect.toFixed(2)}, Total: $${result.toFixed(2)}`);
});

// Evaluate on training data
const errors = publicCases.map(c => {
    const calculated = calculateReimbursement(c.input.trip_duration_days, c.input.miles_traveled, c.input.total_receipts_amount);
    const error = Math.abs(calculated - c.expected_output);
    return { case: c, calculated, expected: c.expected_output, error };
});

const exactMatches = errors.filter(e => e.error < 0.01).length;
const closeMatches = errors.filter(e => e.error < 1.0).length;
const veryCloseMatches = errors.filter(e => e.error < 10.0).length;
const avgError = errors.reduce((sum, e) => sum + e.error, 0) / errors.length;

console.log('\n📊 FINAL MODEL PERFORMANCE:');
console.log('===========================\n');
console.log(`Exact matches (±$0.01): ${exactMatches}/1000 (${(exactMatches/10).toFixed(1)}%)`);
console.log(`Close matches (±$1.00): ${closeMatches}/1000 (${(closeMatches/10).toFixed(1)}%)`);
console.log(`Very close (±$10.00): ${veryCloseMatches}/1000 (${(veryCloseMatches/10).toFixed(1)}%)`);
console.log(`Average error: $${avgError.toFixed(2)}`);

// Compare with our best previous models
console.log('\n📈 PROGRESS COMPARISON:');
console.log('======================');
console.log('Pattern Matcher (memorization): $0.00 avg error (but won\'t generalize)');
console.log('Regression Model: $243.42 avg error');
console.log('Enhanced Model: $325.04 avg error');
console.log(`Final Model: $${avgError.toFixed(2)} avg error`);

if (avgError < 200) {
    console.log('\n🎉 EXCELLENT! This model should generalize well to new data.');
    console.log('✅ Ready for production use on private test cases.');
} else if (avgError < 300) {
    console.log('\n👍 GOOD! This model shows promise for generalization.');
    console.log('🔧 May need minor adjustments for optimal performance.');
} else {
    console.log('\n⚠️  Still higher error than desired.');
    console.log('🔧 Consider further refinement of coefficients.');
}

console.log('\n✅ Final model analysis complete!');

module.exports = { calculateReimbursement }; 