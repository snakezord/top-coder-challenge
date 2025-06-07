#!/usr/bin/env node

const fs = require('fs');

// Load the test data
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

console.log('🔬 Deep Analysis - Reverse Engineering the Formula');
console.log('================================================\n');

// Function to test if a simple formula works
function testFormula(cases, formulaFunc, name) {
    const errors = cases.map(c => {
        const calculated = formulaFunc(c.input.trip_duration_days, c.input.miles_traveled, c.input.total_receipts_amount);
        const error = Math.abs(calculated - c.expected_output);
        return { case: c, calculated, expected: c.expected_output, error };
    });
    
    const exactMatches = errors.filter(e => e.error < 0.01).length;
    const closeMatches = errors.filter(e => e.error < 1.0).length;
    const avgError = errors.reduce((sum, e) => sum + e.error, 0) / errors.length;
    const maxError = Math.max(...errors.map(e => e.error));
    
    console.log(`${name}:`);
    console.log(`  Exact matches: ${exactMatches}/${cases.length} (${(exactMatches/cases.length*100).toFixed(1)}%)`);
    console.log(`  Close matches: ${closeMatches}/${cases.length} (${(closeMatches/cases.length*100).toFixed(1)}%)`);
    console.log(`  Average error: $${avgError.toFixed(2)}`);
    console.log(`  Max error: $${maxError.toFixed(2)}`);
    
    if (exactMatches < 50) {
        console.log(`  Worst cases:`);
        errors.sort((a, b) => b.error - a.error).slice(0, 3).forEach((e, i) => {
            console.log(`    ${i+1}. ${e.case.input.trip_duration_days}d, ${e.case.input.miles_traveled}mi, $${e.case.input.total_receipts_amount.toFixed(2)} → Expected: $${e.expected.toFixed(2)}, Got: $${e.calculated.toFixed(2)}, Error: $${e.error.toFixed(2)}`);
        });
    }
    console.log();
    
    return { exactMatches, avgError, errors };
}

// Test basic linear combination
console.log('📊 Testing Basic Linear Models:');

testFormula(publicCases, (days, miles, receipts) => {
    return days * 100 + miles * 0.58 + receipts * 0.8;
}, 'Basic Linear (100*days + 0.58*miles + 0.8*receipts)');

testFormula(publicCases, (days, miles, receipts) => {
    return days * 120 + miles * 0.5 + receipts * 0.6;
}, 'Alternative Linear (120*days + 0.5*miles + 0.6*receipts)');

// Let's analyze some specific simple cases to understand the base formula
console.log('🔍 Analyzing Simple Cases to Find Base Formula:');

// Find cases with very low receipts and miles to isolate the per-day component
const simpleCases = publicCases
    .filter(c => c.input.total_receipts_amount < 20 && c.input.miles_traveled < 50)
    .sort((a, b) => a.input.trip_duration_days - b.input.trip_duration_days);

console.log('Simple cases (low receipts, low miles):');
simpleCases.slice(0, 10).forEach(c => {
    const perDay = c.expected_output / c.input.trip_duration_days;
    console.log(`${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount.toFixed(2)} → $${c.expected_output.toFixed(2)} ($${perDay.toFixed(2)}/day)`);
});
console.log();

// Analyze cases with zero or minimal receipts to isolate day+mile formula
const minimalReceiptCases = publicCases
    .filter(c => c.input.total_receipts_amount < 10)
    .slice(0, 20);

console.log('Minimal receipt cases analysis:');
minimalReceiptCases.forEach(c => {
    const dayComponent = c.expected_output / c.input.trip_duration_days;
    const mileageComponent = c.input.miles_traveled > 0 ? 
        (c.expected_output - c.input.trip_duration_days * 100) / c.input.miles_traveled : 0;
    console.log(`${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount.toFixed(2)} → $${c.expected_output.toFixed(2)}`);
    console.log(`  Per day: $${dayComponent.toFixed(2)}, Est mileage rate: $${mileageComponent.toFixed(3)}/mi`);
});
console.log();

// Look for patterns in the mileage calculation
console.log('📏 Detailed Mileage Analysis:');

function analyzeMileagePattern() {
    // Group by similar trip lengths and low receipts to isolate mileage effect
    const mileageGroups = {};
    
    publicCases
        .filter(c => c.input.total_receipts_amount < 100) // Low receipts to minimize that variable
        .forEach(c => {
            const dayKey = c.input.trip_duration_days;
            if (!mileageGroups[dayKey]) mileageGroups[dayKey] = [];
            mileageGroups[dayKey].push({
                miles: c.input.miles_traveled,
                output: c.expected_output,
                receipts: c.input.total_receipts_amount,
                estimatedMileageComponent: c.expected_output - c.input.trip_duration_days * 100
            });
        });
    
    // Analyze each day group
    Object.entries(mileageGroups).forEach(([days, cases]) => {
        if (cases.length > 5) {
            console.log(`${days}-day trips (low receipts):`);
            cases.sort((a, b) => a.miles - b.miles).slice(0, 5).forEach(c => {
                const ratePerMile = c.miles > 0 ? c.estimatedMileageComponent / c.miles : 0;
                console.log(`  ${c.miles}mi, $${c.receipts.toFixed(2)} receipts → $${c.output.toFixed(2)} ($${ratePerMile.toFixed(3)}/mi)`);
            });
            console.log();
        }
    });
}

analyzeMileagePattern();

// Test for tiered mileage rates
console.log('🎯 Testing Tiered Mileage Rates:');

function calculateTieredMileage(miles) {
    if (miles <= 100) {
        return miles * 0.58;
    } else if (miles <= 400) {
        return 100 * 0.58 + (miles - 100) * 0.52;
    } else {
        return 100 * 0.58 + 300 * 0.52 + (miles - 400) * 0.48;
    }
}

testFormula(publicCases.filter(c => c.input.total_receipts_amount < 50), (days, miles, receipts) => {
    return days * 100 + calculateTieredMileage(miles) + receipts;
}, 'Tiered Mileage (low receipts only)');

// Look for receipt processing patterns
console.log('🧾 Receipt Processing Analysis:');

function analyzeReceiptPattern() {
    // Group by similar trip characteristics to isolate receipt effect
    const receiptGroups = [];
    
    publicCases.forEach(c => {
        const basePayout = c.input.trip_duration_days * 100 + c.input.miles_traveled * 0.5; // Rough base estimate
        const receiptContribution = c.expected_output - basePayout;
        const receiptUtilization = c.input.total_receipts_amount > 0 ? 
            receiptContribution / c.input.total_receipts_amount : 0;
        
        receiptGroups.push({
            days: c.input.trip_duration_days,
            miles: c.input.miles_traveled,
            receipts: c.input.total_receipts_amount,
            output: c.expected_output,
            receiptContribution,
            receiptUtilization,
            efficiency: c.input.miles_traveled / c.input.trip_duration_days
        });
    });
    
    // Analyze receipt utilization by amount ranges
    const ranges = [
        { min: 0, max: 100 },
        { min: 100, max: 500 },
        { min: 500, max: 1000 },
        { min: 1000, max: 2000 }
    ];
    
    ranges.forEach(range => {
        const inRange = receiptGroups.filter(r => 
            r.receipts >= range.min && r.receipts < range.max
        );
        
        if (inRange.length > 10) {
            const avgUtilization = inRange
                .filter(r => r.receipts > 0)
                .reduce((sum, r) => sum + r.receiptUtilization, 0) / 
                inRange.filter(r => r.receipts > 0).length;
            
            console.log(`$${range.min}-${range.max} receipts: ${inRange.length} cases, avg utilization: ${(avgUtilization * 100).toFixed(1)}%`);
        }
    });
}

analyzeReceiptPattern();

// Look for the trip duration coefficient pattern
console.log('📅 Trip Duration Coefficient Analysis:');

function findDurationCoefficients() {
    const durationAnalysis = {};
    
    // For each duration, find cases with similar miles and receipts
    publicCases.forEach(c => {
        const days = c.input.trip_duration_days;
        if (!durationAnalysis[days]) durationAnalysis[days] = [];
        
        // Try to estimate what the base coefficient per day might be
        const estimatedPerDay = c.expected_output / days;
        const mileageContribution = c.input.miles_traveled * 0.5; // rough estimate
        const receiptContribution = c.input.total_receipts_amount * 0.6; // rough estimate
        const baseDayRate = (c.expected_output - mileageContribution - receiptContribution) / days;
        
        durationAnalysis[days].push({
            case: c,
            estimatedPerDay,
            baseDayRate,
            efficiency: c.input.miles_traveled / days
        });
    });
    
    // Show the base day rates for each duration
    Object.entries(durationAnalysis).forEach(([days, cases]) => {
        if (cases.length > 5) {
            const avgBaseDayRate = cases.reduce((sum, c) => sum + c.baseDayRate, 0) / cases.length;
            const avgPerDay = cases.reduce((sum, c) => sum + c.estimatedPerDay, 0) / cases.length;
            console.log(`${days} days: ${cases.length} cases, avg $${avgPerDay.toFixed(2)}/day total, est base: $${avgBaseDayRate.toFixed(2)}/day`);
        }
    });
}

findDurationCoefficients();

console.log('\n✅ Deep analysis complete! Next: build the actual calculator.'); 