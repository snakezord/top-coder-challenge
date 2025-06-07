#!/usr/bin/env node

const fs = require('fs');

// Load the test data
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

console.log('🎯 Cluster Analysis - Finding Real Patterns');
console.log('==========================================\n');

// Function to find similar cases and extract patterns
function findCalculationPattern() {
    // Group cases by similar characteristics
    const groups = {};
    
    publicCases.forEach((c, index) => {
        const days = c.input.trip_duration_days;
        const miles = c.input.miles_traveled;
        const receipts = c.input.total_receipts_amount;
        const output = c.expected_output;
        
        // Create grouping key based on trip characteristics
        const dayGroup = days <= 2 ? 'short' : days <= 5 ? 'medium' : days <= 8 ? 'long' : 'verylong';
        const mileGroup = miles < 100 ? 'low' : miles < 400 ? 'medium' : miles < 800 ? 'high' : 'veryhigh';
        const receiptGroup = receipts < 100 ? 'low' : receipts < 500 ? 'medium' : receipts < 1000 ? 'high' : 'veryhigh';
        
        const key = `${dayGroup}_${mileGroup}_${receiptGroup}`;
        if (!groups[key]) groups[key] = [];
        
        groups[key].push({
            index,
            days,
            miles,
            receipts,
            output,
            perDay: output / days,
            efficiency: miles / days,
            receiptRatio: output / Math.max(receipts, 1)
        });
    });
    
    // Analyze each group to find patterns
    console.log('📊 Group Analysis:');
    Object.entries(groups).forEach(([key, cases]) => {
        if (cases.length >= 10) {
            const avgOutput = cases.reduce((sum, c) => sum + c.output, 0) / cases.length;
            const avgPerDay = cases.reduce((sum, c) => sum + c.perDay, 0) / cases.length;
            const avgEfficiency = cases.reduce((sum, c) => sum + c.efficiency, 0) / cases.length;
            
            console.log(`${key}: ${cases.length} cases`);
            console.log(`  Avg output: $${avgOutput.toFixed(2)}, per day: $${avgPerDay.toFixed(2)}, efficiency: ${avgEfficiency.toFixed(1)} mi/day`);
            
            // Show a few examples
            console.log(`  Examples:`);
            cases.slice(0, 3).forEach(c => {
                console.log(`    ${c.days}d, ${c.miles}mi, $${c.receipts.toFixed(2)} → $${c.output.toFixed(2)}`);
            });
            console.log();
        }
    });
}

findCalculationPattern();

// Look for mathematical relationships by examining extreme cases
console.log('🔬 Mathematical Relationship Analysis:');

function findMathematicalPatterns() {
    // Find cases with similar day/mile combinations but different receipts
    const dayMileCombos = {};
    
    publicCases.forEach(c => {
        const key = `${c.input.trip_duration_days}_${Math.floor(c.input.miles_traveled / 50) * 50}`;
        if (!dayMileCombos[key]) dayMileCombos[key] = [];
        dayMileCombos[key].push(c);
    });
    
    // Find combinations with multiple cases to see receipt effects
    Object.entries(dayMileCombos).forEach(([key, cases]) => {
        if (cases.length >= 3) {
            console.log(`\nSimilar trips (${key.replace('_', ' days, ~')} miles):`);
            cases.sort((a, b) => a.input.total_receipts_amount - b.input.total_receipts_amount)
                .slice(0, 5)
                .forEach(c => {
                    const baseEstimate = c.input.trip_duration_days * 100 + c.input.miles_traveled * 0.5;
                    const receiptContribution = c.expected_output - baseEstimate;
                    console.log(`  $${c.input.total_receipts_amount.toFixed(2)} receipts → $${c.expected_output.toFixed(2)} (receipt contrib: $${receiptContribution.toFixed(2)})`);
                });
        }
    });
    
    // Look for linear relationships in specific ranges
    console.log('\n📈 Looking for Linear Relationships:');
    
    // Analyze cases with very low receipts to isolate base formula
    const lowReceiptCases = publicCases.filter(c => c.input.total_receipts_amount < 50);
    console.log(`\nLow receipt cases (${lowReceiptCases.length} cases):`);
    
    // Try to fit: output = A * days + B * miles + C
    // Using linear regression approach
    let sumX1 = 0, sumX2 = 0, sumY = 0, sumX1Y = 0, sumX2Y = 0, sumX1X2 = 0, sumX1Sq = 0, sumX2Sq = 0;
    const n = lowReceiptCases.length;
    
    lowReceiptCases.forEach(c => {
        const x1 = c.input.trip_duration_days;
        const x2 = c.input.miles_traveled;
        const y = c.expected_output;
        
        sumX1 += x1;
        sumX2 += x2;
        sumY += y;
        sumX1Y += x1 * y;
        sumX2Y += x2 * y;
        sumX1X2 += x1 * x2;
        sumX1Sq += x1 * x1;
        sumX2Sq += x2 * x2;
    });
    
    // Simple linear regression for days coefficient
    const daysCoeff = (n * sumX1Y - sumX1 * sumY) / (n * sumX1Sq - sumX1 * sumX1);
    const milesCoeff = (n * sumX2Y - sumX2 * sumY) / (n * sumX2Sq - sumX2 * sumX2);
    
    console.log(`Low receipt linear regression:`);
    console.log(`  Days coefficient: ${daysCoeff.toFixed(2)}`);
    console.log(`  Miles coefficient: ${milesCoeff.toFixed(3)}`);
    
    // Test this formula on low receipt cases
    let totalError = 0;
    console.log(`  Testing on low receipt cases:`);
    lowReceiptCases.slice(0, 5).forEach(c => {
        const predicted = daysCoeff * c.input.trip_duration_days + milesCoeff * c.input.miles_traveled;
        const error = Math.abs(predicted - c.expected_output);
        totalError += error;
        console.log(`    ${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi → Expected: $${c.expected_output.toFixed(2)}, Predicted: $${predicted.toFixed(2)}, Error: $${error.toFixed(2)}`);
    });
    
    console.log(`  Average error: $${(totalError / Math.min(5, lowReceiptCases.length)).toFixed(2)}`);
}

findMathematicalPatterns();

// Find the actual receipt processing formula
console.log('\n🧾 Receipt Processing Formula Discovery:');

function analyzeReceiptFormula() {
    // Group by similar base characteristics (days + miles) to isolate receipt effects
    const baseGroups = {};
    
    publicCases.forEach(c => {
        // Create a base calculation estimate
        const baseEstimate = c.input.trip_duration_days * 100 + c.input.miles_traveled * 0.5;
        const receiptEffect = c.expected_output - baseEstimate;
        
        // Group by receipt ranges
        const receiptRange = Math.floor(c.input.total_receipts_amount / 200) * 200;
        const key = `${receiptRange}-${receiptRange + 199}`;
        
        if (!baseGroups[key]) baseGroups[key] = [];
        baseGroups[key].push({
            receipts: c.input.total_receipts_amount,
            receiptEffect,
            ratio: c.input.total_receipts_amount > 0 ? receiptEffect / c.input.total_receipts_amount : 0,
            case: c
        });
    });
    
    console.log('Receipt effect by amount ranges:');
    Object.entries(baseGroups).forEach(([range, cases]) => {
        if (cases.length >= 10) {
            const avgRatio = cases.reduce((sum, c) => sum + c.ratio, 0) / cases.length;
            const avgEffect = cases.reduce((sum, c) => sum + c.receiptEffect, 0) / cases.length;
            console.log(`$${range}: ${cases.length} cases, avg ratio: ${avgRatio.toFixed(3)}, avg effect: $${avgEffect.toFixed(2)}`);
        }
    });
}

analyzeReceiptFormula();

// Try to find the actual formula by looking at specific cases
console.log('\n🎯 Reverse Engineering Specific Cases:');

function reverseEngineerCases() {
    // Find some very simple cases to understand the base formula
    const simpleCases = publicCases.filter(c => 
        c.input.total_receipts_amount < 30 && 
        c.input.miles_traveled < 200 &&
        c.input.trip_duration_days <= 5
    ).sort((a, b) => a.input.trip_duration_days - b.input.trip_duration_days);
    
    console.log('Simple cases for reverse engineering:');
    simpleCases.slice(0, 10).forEach(c => {
        console.log(`${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount.toFixed(2)} → $${c.expected_output.toFixed(2)}`);
        
        // Try different formulas
        const formula1 = c.input.trip_duration_days * 100 + c.input.miles_traveled * 0.58;
        const formula2 = c.input.trip_duration_days * 120 + c.input.miles_traveled * 0.45;
        const formula3 = c.input.trip_duration_days * 105 + c.input.miles_traveled * 0.55;
        
        console.log(`  Formula attempts: $${formula1.toFixed(2)}, $${formula2.toFixed(2)}, $${formula3.toFixed(2)}`);
    });
}

reverseEngineerCases();

console.log('\n✅ Cluster analysis complete! Use insights to build better model.'); 