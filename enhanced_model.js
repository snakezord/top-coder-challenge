#!/usr/bin/env node

const fs = require('fs');
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

// Silent mode for command line usage
if (process.argv.length === 5) {
    function calculateReimbursement(tripDays, miles, receipts) {
        // ENHANCED MODEL - Focus on Receipt Processing Patterns
        
        // 1. BASE CALCULATION (from regression analysis)
        // Formula: (400/days + 80) * days + 0.3 * miles
        const baseAmount = (400 / tripDays + 80) * tripDays + 0.3 * miles;
        
        // 2. SOPHISTICATED RECEIPT PROCESSING
        // Based on detailed analysis of receipt patterns
        let receiptContribution = 0;
        
        if (receipts <= 0) {
            receiptContribution = 0;
        } else {
            // Use polynomial approach for different receipt ranges
            if (receipts < 50) {
                // Very low receipts: mostly neutral with slight penalties
                receiptContribution = receipts * 0.2;
            } else if (receipts < 200) {
                // Low receipts: building up
                receiptContribution = 10 + (receipts - 50) * 0.4;
            } else if (receipts < 500) {
                // Medium receipts: linear growth
                receiptContribution = 70 + (receipts - 200) * 0.6;
            } else if (receipts < 1000) {
                // High receipts: strong growth
                receiptContribution = 250 + (receipts - 500) * 0.8;
            } else if (receipts < 1500) {
                // Very high receipts: diminishing returns
                receiptContribution = 650 + (receipts - 1000) * 0.5;
            } else {
                // Ultra high receipts: minimal additional benefit
                receiptContribution = 900 + (receipts - 1500) * 0.2;
            }
        }
        
        // 3. TRIP LENGTH EFFICIENCY ADJUSTMENT
        // Long trips become less efficient per day
        let efficiencyFactor = 1.0;
        if (tripDays <= 2) {
            efficiencyFactor = 1.1; // Short trips get bonus
        } else if (tripDays >= 10) {
            efficiencyFactor = 0.85; // Long trips get penalty
        } else if (tripDays >= 7) {
            efficiencyFactor = 0.95;
        }
        
        // 4. MILEAGE EFFICIENCY (based on trip characteristics)
        const milesPerDay = miles / tripDays;
        let mileageBonus = 0;
        if (milesPerDay > 300) {
            mileageBonus = Math.min((milesPerDay - 300) * 0.1, 50);
        }
        
        // 5. FINAL CALCULATION
        const total = (baseAmount + receiptContribution) * efficiencyFactor + mileageBonus;
        
        // 6. APPLY REASONABLE BOUNDS
        const minimum = tripDays * 40; // At least $40/day
        const maximum = tripDays * 1200; // At most $1200/day
        
        return Math.round(Math.max(minimum, Math.min(maximum, total)) * 100) / 100;
    }

    const days = parseInt(process.argv[2]);
    const miles = parseInt(process.argv[3]);
    const receipts = parseFloat(process.argv[4]);
    
    const result = calculateReimbursement(days, miles, receipts);
    console.log(result.toFixed(2));
    process.exit(0);
}

console.log('🚀 Enhanced Receipt-Focused Model v1.0');
console.log('======================================\n');

// Analyze receipt patterns in detail
function analyzeReceiptPatterns() {
    console.log('📋 DETAILED RECEIPT PATTERN ANALYSIS:');
    console.log('=====================================\n');
    
    // Group by receipt ranges and analyze patterns
    const receiptRanges = [
        { min: 0, max: 50, name: "Very Low" },
        { min: 50, max: 200, name: "Low" },
        { min: 200, max: 500, name: "Medium" },
        { min: 500, max: 1000, name: "High" },
        { min: 1000, max: 1500, name: "Very High" },
        { min: 1500, max: 3000, name: "Ultra High" }
    ];
    
    receiptRanges.forEach(range => {
        const casesInRange = publicCases.filter(c => 
            c.input.total_receipts_amount >= range.min && 
            c.input.total_receipts_amount < range.max
        );
        
        if (casesInRange.length > 10) {
            // Calculate base amount for comparison
            const avgBaseAmount = casesInRange.reduce((sum, c) => {
                const base = (400 / c.input.trip_duration_days + 80) * c.input.trip_duration_days + 0.3 * c.input.miles_traveled;
                return sum + base;
            }, 0) / casesInRange.length;
            
            const avgActualAmount = casesInRange.reduce((sum, c) => sum + c.expected_output, 0) / casesInRange.length;
            const avgReceiptEffect = avgActualAmount - avgBaseAmount;
            const avgReceiptAmount = casesInRange.reduce((sum, c) => sum + c.input.total_receipts_amount, 0) / casesInRange.length;
            const receiptRatio = avgReceiptAmount > 0 ? avgReceiptEffect / avgReceiptAmount : 0;
            
            console.log(`${range.name} receipts ($${range.min}-$${range.max}): ${casesInRange.length} cases`);
            console.log(`  Avg receipt amount: $${avgReceiptAmount.toFixed(2)}`);
            console.log(`  Avg base amount: $${avgBaseAmount.toFixed(2)}`);
            console.log(`  Avg actual amount: $${avgActualAmount.toFixed(2)}`);
            console.log(`  Avg receipt effect: $${avgReceiptEffect.toFixed(2)}`);
            console.log(`  Receipt ratio: ${receiptRatio.toFixed(3)}`);
            console.log();
        }
    });
}

analyzeReceiptPatterns();

// Create the enhanced calculator
function calculateReimbursement(tripDays, miles, receipts) {
    // Base calculation
    const baseAmount = (400 / tripDays + 80) * tripDays + 0.3 * miles;
    
    // Enhanced receipt processing
    let receiptContribution = 0;
    if (receipts <= 0) {
        receiptContribution = 0;
    } else if (receipts < 50) {
        receiptContribution = receipts * 0.2;
    } else if (receipts < 200) {
        receiptContribution = 10 + (receipts - 50) * 0.4;
    } else if (receipts < 500) {
        receiptContribution = 70 + (receipts - 200) * 0.6;
    } else if (receipts < 1000) {
        receiptContribution = 250 + (receipts - 500) * 0.8;
    } else if (receipts < 1500) {
        receiptContribution = 650 + (receipts - 1000) * 0.5;
    } else {
        receiptContribution = 900 + (receipts - 1500) * 0.2;
    }
    
    // Efficiency adjustments
    let efficiencyFactor = 1.0;
    if (tripDays <= 2) efficiencyFactor = 1.1;
    else if (tripDays >= 10) efficiencyFactor = 0.85;
    else if (tripDays >= 7) efficiencyFactor = 0.95;
    
    const milesPerDay = miles / tripDays;
    let mileageBonus = 0;
    if (milesPerDay > 300) {
        mileageBonus = Math.min((milesPerDay - 300) * 0.1, 50);
    }
    
    const total = (baseAmount + receiptContribution) * efficiencyFactor + mileageBonus;
    const minimum = tripDays * 40;
    const maximum = tripDays * 1200;
    
    return Math.round(Math.max(minimum, Math.min(maximum, total)) * 100) / 100;
}

// Test examples
console.log('🧪 ENHANCED MODEL EXAMPLES:');
console.log('===========================\n');

const testCases = [
    { days: 1, miles: 100, receipts: 25 },
    { days: 3, miles: 200, receipts: 300 },
    { days: 7, miles: 500, receipts: 800 },
    { days: 12, miles: 400, receipts: 1200 }
];

testCases.forEach((test, i) => {
    const result = calculateReimbursement(test.days, test.miles, test.receipts);
    console.log(`Test ${i+1}: ${test.days}d, ${test.miles}mi, $${test.receipts} → $${result.toFixed(2)}`);
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

console.log('\n📊 ENHANCED MODEL PERFORMANCE:');
console.log('==============================\n');
console.log(`Exact matches (±$0.01): ${exactMatches}/1000 (${(exactMatches/10).toFixed(1)}%)`);
console.log(`Close matches (±$1.00): ${closeMatches}/1000 (${(closeMatches/10).toFixed(1)}%)`);
console.log(`Very close (±$10.00): ${veryCloseMatches}/1000 (${(veryCloseMatches/10).toFixed(1)}%)`);
console.log(`Average error: $${avgError.toFixed(2)}`);

if (avgError < 200) {
    console.log('\n🎉 SIGNIFICANT IMPROVEMENT ACHIEVED!');
    console.log('This enhanced model shows strong potential for generalization.');
} else {
    console.log('\n🔧 STILL ROOM FOR IMPROVEMENT:');
    const worstCases = errors.sort((a, b) => b.error - a.error).slice(0, 3);
    worstCases.forEach((e, i) => {
        const c = e.case;
        console.log(`${i+1}. ${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount.toFixed(2)}`);
        console.log(`   Expected: $${e.expected.toFixed(2)}, Got: $${e.calculated.toFixed(2)}, Error: $${e.error.toFixed(2)}`);
    });
}

console.log('\n✅ Enhanced model analysis complete!');

module.exports = { calculateReimbursement }; 