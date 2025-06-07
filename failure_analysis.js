#!/usr/bin/env node

const fs = require('fs');
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

console.log('🔍 Failure Analysis - Understanding the Worst Cases');
console.log('===================================================\n');

// Our current calculator
function calculateReimbursement(tripDays, miles, receipts) {
    let baseAmount = tripDays * 111 + miles * 0.97;
    let receiptContribution = 0;
    
    if (receipts < 50) {
        receiptContribution = receipts * -1.3;
    } else if (receipts < 200) {
        receiptContribution = receipts * -0.7;
    } else if (receipts < 400) {
        receiptContribution = receipts * -0.4;
    } else if (receipts < 600) {
        receiptContribution = receipts * 0.1;
    } else if (receipts < 800) {
        receiptContribution = receipts * 0.25;
    } else if (receipts < 1200) {
        receiptContribution = receipts * 0.4;
    } else if (receipts < 1600) {
        receiptContribution = 800 * 0.4 + (receipts - 800) * 0.35;
    } else if (receipts < 2000) {
        receiptContribution = 800 * 0.4 + 400 * 0.35 + (receipts - 1200) * 0.3;
    } else {
        receiptContribution = 800 * 0.4 + 400 * 0.35 + 800 * 0.3 + (receipts - 2000) * 0.2;
    }
    
    const total = baseAmount + receiptContribution;
    return Math.round(total * 100) / 100;
}

// Find the worst cases
const errors = publicCases.map((c, index) => {
    const calculated = calculateReimbursement(c.input.trip_duration_days, c.input.miles_traveled, c.input.total_receipts_amount);
    const error = Math.abs(calculated - c.expected_output);
    return { 
        index: index + 1, 
        case: c, 
        calculated, 
        expected: c.expected_output, 
        error,
        days: c.input.trip_duration_days,
        miles: c.input.miles_traveled,
        receipts: c.input.total_receipts_amount
    };
});

errors.sort((a, b) => b.error - a.error);

console.log('🔥 TOP 15 WORST CASES:');
console.log('======================\n');

errors.slice(0, 15).forEach((e, i) => {
    console.log(`${i+1}. Case ${e.index}: ${e.days}d, ${e.miles}mi, $${e.receipts.toFixed(2)}`);
    console.log(`   Expected: $${e.expected.toFixed(2)}, Got: $${e.calculated.toFixed(2)}, Error: $${e.error.toFixed(2)}`);
    
    // Show what a simple calculation would be
    const simple = e.days * 100 + e.miles * 0.5;
    const receiptEffect = e.expected - simple;
    console.log(`   Simple base (100*days + 0.5*miles): $${simple.toFixed(2)}, Actual receipt effect: $${receiptEffect.toFixed(2)}`);
    console.log();
});

// Look for patterns in high receipts
console.log('📊 HIGH RECEIPT ANALYSIS:');
console.log('=========================\n');

const highReceiptCases = publicCases.filter(c => c.input.total_receipts_amount > 1500);
console.log(`Cases with >$1500 receipts: ${highReceiptCases.length}`);

highReceiptCases.slice(0, 10).forEach(c => {
    const simple = c.input.trip_duration_days * 100 + c.input.miles_traveled * 0.5;
    const receiptEffect = c.expected_output - simple;
    const ratio = c.input.total_receipts_amount > 0 ? receiptEffect / c.input.total_receipts_amount : 0;
    
    console.log(`${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount.toFixed(2)} → $${c.expected_output.toFixed(2)}`);
    console.log(`  Receipt effect: $${receiptEffect.toFixed(2)}, Ratio: ${ratio.toFixed(3)}`);
});

// Look for long trip patterns
console.log('\n📅 LONG TRIP ANALYSIS:');
console.log('======================\n');

const longTrips = publicCases.filter(c => c.input.trip_duration_days >= 10);
console.log(`Cases with ≥10 days: ${longTrips.length}`);

const longTripAvgPerDay = longTrips.reduce((sum, c) => sum + c.expected_output / c.input.trip_duration_days, 0) / longTrips.length;
const shortTrips = publicCases.filter(c => c.input.trip_duration_days <= 3);
const shortTripAvgPerDay = shortTrips.reduce((sum, c) => sum + c.expected_output / c.input.trip_duration_days, 0) / shortTrips.length;

console.log(`Long trips (≥10d) avg per day: $${longTripAvgPerDay.toFixed(2)}`);
console.log(`Short trips (≤3d) avg per day: $${shortTripAvgPerDay.toFixed(2)}`);

console.log('\n✅ Analysis complete!'); 