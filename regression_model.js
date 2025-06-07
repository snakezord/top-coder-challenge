#!/usr/bin/env node

const fs = require('fs');
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

// Silent mode for command line usage
if (process.argv.length === 5) {
    function calculateReimbursement(tripDays, miles, receipts) {
        // Use the optimal formula: (400/days + 80) * days + 0.3 * miles + 0.3 * receipts
        const result = (400 / tripDays + 80) * tripDays + 0.3 * miles + 0.3 * receipts;
        return Math.round(result * 100) / 100;
    }

    const days = parseInt(process.argv[2]);
    const miles = parseInt(process.argv[3]);
    const receipts = parseFloat(process.argv[4]);
    
    const result = calculateReimbursement(days, miles, receipts);
    console.log(result.toFixed(2));
    process.exit(0);
}

console.log('📊 Advanced Regression Model v1.0');
console.log('==================================\n');

// Regression analysis to find optimal coefficients
function performRegressionAnalysis() {
    console.log('🔍 PERFORMING REGRESSION ANALYSIS:');
    console.log('==================================\n');
    
    // Create feature matrix
    const features = publicCases.map(c => {
        const days = c.input.trip_duration_days;
        const miles = c.input.miles_traveled;
        const receipts = c.input.total_receipts_amount;
        
        return [
            1, // intercept
            days,
            miles,
            receipts,
            days * days,
            miles * miles,
            receipts * receipts,
            days * miles,
            days * receipts,
            miles * receipts,
            1 / days,
            Math.log(miles + 1),
            Math.log(receipts + 1),
            miles / days, // efficiency
            receipts / days // receipt per day
        ];
    });
    
    const targets = publicCases.map(c => c.expected_output);
    
    // Simple linear regression using normal equations
    // X^T * X * beta = X^T * y
    console.log('Analyzing feature correlations...');
    
    // Calculate correlation matrix
    const featureNames = [
        'intercept', 'days', 'miles', 'receipts', 'days²', 'miles²', 'receipts²',
        'days×miles', 'days×receipts', 'miles×receipts', '1/days', 'log(miles)',
        'log(receipts)', 'efficiency', 'receipt/day'
    ];
    
    // Simple correlation analysis
    featureNames.forEach((name, i) => {
        if (i === 0) return; // skip intercept
        
        const featureValues = features.map(f => f[i]);
        const correlation = calculateCorrelation(featureValues, targets);
        console.log(`${name}: correlation = ${correlation.toFixed(4)}`);
    });
}

function calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
}

performRegressionAnalysis();

// Grid search to find best simple formula
console.log('\n🎯 GRID SEARCH FOR OPTIMAL COEFFICIENTS:');
console.log('========================================\n');

function gridSearch() {
    let bestFormula = null;
    let bestError = Infinity;
    
    // Test different coefficient combinations
    const daysRange = [80, 90, 100, 110, 120, 130, 140];
    const milesRange = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
    const receiptsRange = [-0.5, -0.3, -0.1, 0, 0.1, 0.3, 0.5];
    const inverseRange = [400, 500, 600, 700, 800, 900, 1000];
    
    console.log('Searching optimal coefficients...');
    
    daysRange.forEach(daysCoeff => {
        milesRange.forEach(milesCoeff => {
            receiptsRange.forEach(receiptsCoeff => {
                inverseRange.forEach(inverseCoeff => {
                    
                    // Test this combination
                    let totalError = 0;
                    let worstError = 0;
                    
                    publicCases.forEach(c => {
                        const days = c.input.trip_duration_days;
                        const miles = c.input.miles_traveled;
                        const receipts = c.input.total_receipts_amount;
                        
                        // Formula: (inverseCoeff/days + daysCoeff) * days + milesCoeff * miles + receiptsCoeff * receipts
                        const predicted = (inverseCoeff / days + daysCoeff) * days + 
                                        milesCoeff * miles + 
                                        receiptsCoeff * receipts;
                        
                        const error = Math.abs(predicted - c.expected_output);
                        totalError += error;
                        worstError = Math.max(worstError, error);
                    });
                    
                    const avgError = totalError / publicCases.length;
                    
                    if (avgError < bestError) {
                        bestError = avgError;
                        bestFormula = {
                            daysCoeff,
                            milesCoeff,
                            receiptsCoeff,
                            inverseCoeff,
                            avgError,
                            worstError
                        };
                    }
                });
            });
        });
    });
    
    console.log('Best formula found:');
    console.log(`  Formula: (${bestFormula.inverseCoeff}/days + ${bestFormula.daysCoeff}) * days + ${bestFormula.milesCoeff} * miles + ${bestFormula.receiptsCoeff} * receipts`);
    console.log(`  Average error: $${bestFormula.avgError.toFixed(2)}`);
    console.log(`  Worst error: $${bestFormula.worstError.toFixed(2)}`);
    
    return bestFormula;
}

const optimalFormula = gridSearch();

// Test the optimal formula
function calculateReimbursementOptimal(tripDays, miles, receipts) {
    const formula = optimalFormula;
    const result = (formula.inverseCoeff / tripDays + formula.daysCoeff) * tripDays + 
                   formula.milesCoeff * miles + 
                   formula.receiptsCoeff * receipts;
    return Math.round(result * 100) / 100;
}

// Evaluate the optimal formula
const errors = publicCases.map(c => {
    const calculated = calculateReimbursementOptimal(c.input.trip_duration_days, c.input.miles_traveled, c.input.total_receipts_amount);
    const error = Math.abs(calculated - c.expected_output);
    return { case: c, calculated, expected: c.expected_output, error };
});

const exactMatches = errors.filter(e => e.error < 0.01).length;
const closeMatches = errors.filter(e => e.error < 1.0).length;
const veryCloseMatches = errors.filter(e => e.error < 10.0).length;
const avgError = errors.reduce((sum, e) => sum + e.error, 0) / errors.length;

console.log('\n📊 OPTIMAL FORMULA PERFORMANCE:');
console.log('===============================\n');
console.log(`Exact matches (±$0.01): ${exactMatches}/1000 (${(exactMatches/10).toFixed(1)}%)`);
console.log(`Close matches (±$1.00): ${closeMatches}/1000 (${(closeMatches/10).toFixed(1)}%)`);
console.log(`Very close (±$10.00): ${veryCloseMatches}/1000 (${(veryCloseMatches/10).toFixed(1)}%)`);
console.log(`Average error: $${avgError.toFixed(2)}`);

// Show best cases
if (exactMatches > 0) {
    console.log('\n🎯 EXACT MATCHES FOUND:');
    errors.filter(e => e.error < 0.01).slice(0, 5).forEach((e, i) => {
        const c = e.case;
        console.log(`${i+1}. ${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount.toFixed(2)} → $${e.expected.toFixed(2)}`);
    });
}

console.log('\n✅ Regression analysis complete!');

// Create optimized calculator function for command line
function calculateReimbursement(tripDays, miles, receipts) {
    const formula = optimalFormula;
    const result = (formula.inverseCoeff / tripDays + formula.daysCoeff) * tripDays + 
                   formula.milesCoeff * miles + 
                   formula.receiptsCoeff * receipts;
    return Math.round(result * 100) / 100;
}

module.exports = { calculateReimbursement }; 