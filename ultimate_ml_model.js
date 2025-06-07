#!/usr/bin/env node

const fs = require('fs');
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

// Silent mode for command line usage
if (process.argv.length === 5) {
    function calculateReimbursement(tripDays, miles, receipts) {
        // ULTIMATE MODEL - Handles all edge cases discovered
        
        // Base formula from ML: (400/days + 60) * days + 0.2 * miles + 0.4 * receipts
        let baseAmount = (400 / tripDays + 60) * tripDays + 0.2 * miles;
        
        // ADVANCED RECEIPT PROCESSING with caps and diminishing returns
        let receiptContribution = 0;
        
        if (receipts <= 0) {
            receiptContribution = 0;
        } else if (receipts <= 500) {
            // Normal receipt processing
            receiptContribution = receipts * 0.4;
        } else if (receipts <= 1200) {
            // High receipts with slight diminishing returns
            receiptContribution = 500 * 0.4 + (receipts - 500) * 0.35;
        } else if (receipts <= 2000) {
            // Very high receipts with strong diminishing returns
            receiptContribution = 500 * 0.4 + 700 * 0.35 + (receipts - 1200) * 0.2;
        } else {
            // Ultra high receipts - minimal additional benefit
            receiptContribution = 500 * 0.4 + 700 * 0.35 + 800 * 0.2 + (receipts - 2000) * 0.05;
        }
        
        // SPECIAL HANDLING FOR HIGH-RECEIPT LOW-OUTPUT CASES
        // These are the cases causing our worst errors
        if (receipts > 1500 && tripDays <= 5) {
            // Apply special correction for high-receipt short trips
            const expectedLowOutput = baseAmount + receiptContribution;
            const correctionFactor = Math.max(0.3, 1 - (receipts - 1500) / 3000);
            receiptContribution *= correctionFactor;
        }
        
        // TRIP-SPECIFIC ADJUSTMENTS
        let tripAdjustment = 0;
        
        // Very short high-mileage trips
        if (tripDays <= 2 && miles > 800) {
            tripAdjustment = -50; // Penalty for unrealistic efficiency
        }
        
        // Long trips with reasonable receipts
        if (tripDays >= 10 && receipts < 1000) {
            tripAdjustment = -20; // Slight penalty for long trips with low receipts
        }
        
        const total = baseAmount + receiptContribution + tripAdjustment;
        
        // BOUNDS based on realistic ranges observed in data
        const minimum = tripDays * 25;
        const maximum = tripDays * 1000 + Math.min(receipts, 1000);
        
        return Math.round(Math.max(minimum, Math.min(maximum, total)) * 100) / 100;
    }

    const days = parseInt(process.argv[2]);
    const miles = parseInt(process.argv[3]);
    const receipts = parseFloat(process.argv[4]);
    
    const result = calculateReimbursement(days, miles, receipts);
    console.log(result.toFixed(2));
    process.exit(0);
}

console.log('🚀 ULTIMATE ML MODEL v2.0 - Zero Error Target');
console.log('==============================================\n');

// ANALYZE WORST CASES FROM PREVIOUS MODEL
console.log('🔍 ANALYZING WORST-CASE PATTERNS:');
console.log('=================================\n');

function analyzeWorstCases() {
    // Calculate errors using current best formula
    const errors = publicCases.map(c => {
        const days = c.input.trip_duration_days;
        const miles = c.input.miles_traveled;
        const receipts = c.input.total_receipts_amount;
        
        // Current best formula
        const predicted = (400 / days + 60) * days + 0.2 * miles + 0.4 * receipts;
        const error = Math.abs(predicted - c.expected_output);
        
        return {
            case: c,
            predicted,
            expected: c.expected_output,
            error,
            receiptIntensity: receipts / (days * miles + 1),
            efficiency: miles / days
        };
    });
    
    // Sort by error to analyze worst cases
    errors.sort((a, b) => b.error - a.error);
    
    console.log('Top 10 worst cases and their patterns:');
    errors.slice(0, 10).forEach((e, i) => {
        const c = e.case.input;
        console.log(`${i+1}. ${c.trip_duration_days}d, ${c.miles_traveled}mi, $${c.total_receipts_amount.toFixed(2)}`);
        console.log(`   Expected: $${e.expected.toFixed(2)}, Predicted: $${e.predicted.toFixed(2)}, Error: $${e.error.toFixed(2)}`);
        console.log(`   Receipt intensity: ${e.receiptIntensity.toFixed(4)}, Efficiency: ${e.efficiency.toFixed(1)} mi/day`);
        console.log();
    });
    
    // Find patterns in worst cases
    const worstCases = errors.slice(0, 50);
    const avgReceipts = worstCases.reduce((sum, e) => sum + e.case.input.total_receipts_amount, 0) / worstCases.length;
    const avgDays = worstCases.reduce((sum, e) => sum + e.case.input.trip_duration_days, 0) / worstCases.length;
    const avgMiles = worstCases.reduce((sum, e) => sum + e.case.input.miles_traveled, 0) / worstCases.length;
    
    console.log('WORST CASE PATTERNS:');
    console.log(`Average receipts in worst cases: $${avgReceipts.toFixed(2)}`);
    console.log(`Average days in worst cases: ${avgDays.toFixed(1)}`);
    console.log(`Average miles in worst cases: ${avgMiles.toFixed(1)}`);
    
    // Count cases with extremely high receipts
    const highReceiptErrors = worstCases.filter(e => e.case.input.total_receipts_amount > 1500).length;
    console.log(`High receipt cases (>$1500) in worst 50: ${highReceiptErrors}/50`);
    
    return worstCases;
}

const worstCases = analyzeWorstCases();

// DEVELOP CORRECTION FORMULAS
console.log('\n🧮 DEVELOPING CORRECTION FORMULAS:');
console.log('==================================\n');

function developCorrections() {
    console.log('Testing correction strategies...');
    
    // Strategy 1: Receipt capping
    let strategy1Errors = [];
    publicCases.forEach(c => {
        const days = c.input.trip_duration_days;
        const miles = c.input.miles_traveled;
        const receipts = c.input.total_receipts_amount;
        
        let baseAmount = (400 / days + 60) * days + 0.2 * miles;
        let receiptContrib = Math.min(receipts * 0.4, 800); // Cap receipts at $800 contribution
        
        const predicted = baseAmount + receiptContrib;
        const error = Math.abs(predicted - c.expected_output);
        strategy1Errors.push(error);
    });
    
    const strategy1AvgError = strategy1Errors.reduce((a, b) => a + b, 0) / strategy1Errors.length;
    console.log(`Strategy 1 (Receipt capping): $${strategy1AvgError.toFixed(2)} avg error`);
    
    // Strategy 2: Diminishing returns
    let strategy2Errors = [];
    publicCases.forEach(c => {
        const days = c.input.trip_duration_days;
        const miles = c.input.miles_traveled;
        const receipts = c.input.total_receipts_amount;
        
        let baseAmount = (400 / days + 60) * days + 0.2 * miles;
        let receiptContrib;
        
        if (receipts <= 1000) {
            receiptContrib = receipts * 0.4;
        } else {
            receiptContrib = 1000 * 0.4 + (receipts - 1000) * 0.1; // Diminishing returns
        }
        
        const predicted = baseAmount + receiptContrib;
        const error = Math.abs(predicted - c.expected_output);
        strategy2Errors.push(error);
    });
    
    const strategy2AvgError = strategy2Errors.reduce((a, b) => a + b, 0) / strategy2Errors.length;
    console.log(`Strategy 2 (Diminishing returns): $${strategy2AvgError.toFixed(2)} avg error`);
    
    // Strategy 3: Context-aware corrections
    let strategy3Errors = [];
    publicCases.forEach(c => {
        const days = c.input.trip_duration_days;
        const miles = c.input.miles_traveled;
        const receipts = c.input.total_receipts_amount;
        
        let baseAmount = (400 / days + 60) * days + 0.2 * miles;
        let receiptContrib = receipts * 0.4;
        
        // High receipt correction for short trips
        if (receipts > 1500 && days <= 5) {
            receiptContrib = receipts * 0.15; // Much lower coefficient
        }
        
        const predicted = baseAmount + receiptContrib;
        const error = Math.abs(predicted - c.expected_output);
        strategy3Errors.push(error);
    });
    
    const strategy3AvgError = strategy3Errors.reduce((a, b) => a + b, 0) / strategy3Errors.length;
    console.log(`Strategy 3 (Context-aware): $${strategy3AvgError.toFixed(2)} avg error`);
    
    return strategy3AvgError < strategy2AvgError && strategy3AvgError < strategy1AvgError ? 3 : 
           strategy2AvgError < strategy1AvgError ? 2 : 1;
}

const bestStrategy = developCorrections();
console.log(`\nBest strategy: ${bestStrategy}`);

// CREATE FINAL ULTIMATE MODEL
function calculateReimbursement(tripDays, miles, receipts) {
    let baseAmount = (400 / tripDays + 60) * tripDays + 0.2 * miles;
    let receiptContribution = 0;
    
    if (receipts <= 0) {
        receiptContribution = 0;
    } else if (receipts <= 500) {
        receiptContribution = receipts * 0.4;
    } else if (receipts <= 1200) {
        receiptContribution = 500 * 0.4 + (receipts - 500) * 0.35;
    } else if (receipts <= 2000) {
        receiptContribution = 500 * 0.4 + 700 * 0.35 + (receipts - 1200) * 0.2;
    } else {
        receiptContribution = 500 * 0.4 + 700 * 0.35 + 800 * 0.2 + (receipts - 2000) * 0.05;
    }
    
    // High-receipt short-trip correction
    if (receipts > 1500 && tripDays <= 5) {
        const correctionFactor = Math.max(0.3, 1 - (receipts - 1500) / 3000);
        receiptContribution *= correctionFactor;
    }
    
    let tripAdjustment = 0;
    if (tripDays <= 2 && miles > 800) {
        tripAdjustment = -50;
    }
    if (tripDays >= 10 && receipts < 1000) {
        tripAdjustment = -20;
    }
    
    const total = baseAmount + receiptContribution + tripAdjustment;
    const minimum = tripDays * 25;
    const maximum = tripDays * 1000 + Math.min(receipts, 1000);
    
    return Math.round(Math.max(minimum, Math.min(maximum, total)) * 100) / 100;
}

// Test the ultimate model
const errors = publicCases.map(c => {
    const calculated = calculateReimbursement(c.input.trip_duration_days, c.input.miles_traveled, c.input.total_receipts_amount);
    const error = Math.abs(calculated - c.expected_output);
    return { case: c, calculated, expected: c.expected_output, error };
});

const exactMatches = errors.filter(e => e.error < 0.01).length;
const closeMatches = errors.filter(e => e.error < 1.0).length;
const veryCloseMatches = errors.filter(e => e.error < 10.0).length;
const avgError = errors.reduce((sum, e) => sum + e.error, 0) / errors.length;

console.log('\n🎯 ULTIMATE MODEL PERFORMANCE:');
console.log('==============================\n');
console.log(`Exact matches (±$0.01): ${exactMatches}/1000 (${(exactMatches/10).toFixed(1)}%)`);
console.log(`Close matches (±$1.00): ${closeMatches}/1000 (${(closeMatches/10).toFixed(1)}%)`);
console.log(`Very close (±$10.00): ${veryCloseMatches}/1000 (${(veryCloseMatches/10).toFixed(1)}%)`);
console.log(`Average error: $${avgError.toFixed(2)}`);

// Progress tracking
console.log('\n📈 PROGRESS TOWARD ZERO:');
console.log('========================');
console.log('Simple regression: $243.41 avg error');
console.log('ML optimized: $197.60 avg error');
console.log(`Ultimate model: $${avgError.toFixed(2)} avg error`);

const improvement = 197.60 - avgError;
if (improvement > 20) {
    console.log(`\n🚀 MAJOR BREAKTHROUGH! Improved by $${improvement.toFixed(2)}!`);
} else if (improvement > 5) {
    console.log(`\n✅ Good improvement of $${improvement.toFixed(2)}!`);
} else if (improvement > 0) {
    console.log(`\n📈 Small improvement of $${improvement.toFixed(2)}.`);
} else {
    console.log(`\n⚠️  No improvement. Need different approach.`);
}

if (avgError < 100) {
    console.log('🎉 APPROACHING ZERO ERROR TARGET!');
} else if (avgError < 150) {
    console.log('👍 Strong performance, close to target!');
}

console.log('\n✅ Ultimate ML model analysis complete!');

module.exports = { calculateReimbursement }; 