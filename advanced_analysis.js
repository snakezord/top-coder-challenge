#!/usr/bin/env node

const fs = require('fs');
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

console.log('🚀 Advanced Pattern Recognition - Perfect Score Analysis');
console.log('======================================================\n');

// Helper function for polynomial regression
function polynomialRegression(data, degree = 2) {
    const n = data.length;
    if (n === 0) return null;
    
    // Create polynomial features
    const X = data.map(d => {
        const row = [1]; // intercept
        for (let i = 1; i <= degree; i++) {
            row.push(Math.pow(d.x, i));
        }
        return row;
    });
    
    const y = data.map(d => d.y);
    
    // Simple linear algebra for small matrices
    // This is a simplified implementation
    return { degree, data };
}

// 1. EXACT PATTERN MATCHING - Look for cases with identical inputs
console.log('🔍 EXACT PATTERN MATCHING:');
console.log('==========================\n');

const exactPatterns = {};
publicCases.forEach((c, index) => {
    const key = `${c.input.trip_duration_days}_${c.input.miles_traveled}_${c.input.total_receipts_amount}`;
    if (!exactPatterns[key]) exactPatterns[key] = [];
    exactPatterns[key].push({ index, case: c });
});

const duplicateInputs = Object.entries(exactPatterns).filter(([key, cases]) => cases.length > 1);
console.log(`Found ${duplicateInputs.length} sets of duplicate inputs:`);
duplicateInputs.forEach(([key, cases]) => {
    console.log(`Input: ${key.replace(/_/g, ', ')}`);
    cases.forEach(c => {
        console.log(`  Case ${c.index + 1}: Output $${c.case.expected_output}`);
    });
    console.log();
});

// 2. FIND SIMPLE MATHEMATICAL RELATIONSHIPS
console.log('📊 MATHEMATICAL RELATIONSHIP DISCOVERY:');
console.log('=======================================\n');

// Look for cases where output = f(days, miles, receipts) with simple formulas
function testSimpleFormulas() {
    const formulas = [
        // Linear combinations
        (d, m, r) => d * 100 + m * 0.5 + r * 0.8,
        (d, m, r) => d * 120 + m * 0.4 + r * 0.6,
        (d, m, r) => d * 90 + m * 0.6 + r * 0.7,
        
        // With interaction terms
        (d, m, r) => d * 100 + m * 0.5 + r * 0.3 + (d * m * 0.01),
        (d, m, r) => d * 100 + m * 0.5 + Math.sqrt(r) * 10,
        (d, m, r) => d * 100 + Math.log(m + 1) * 50 + r * 0.5,
        
        // Conditional formulas
        (d, m, r) => {
            let base = d * 100 + m * 0.5;
            if (d >= 10) base *= 0.7; // Long trip penalty
            if (r > 1000) base += (r - 1000) * 0.2;
            else base += r * 0.5;
            return base;
        }
    ];
    
    formulas.forEach((formula, i) => {
        let exactMatches = 0;
        let totalError = 0;
        
        publicCases.forEach(c => {
            const calculated = formula(c.input.trip_duration_days, c.input.miles_traveled, c.input.total_receipts_amount);
            const error = Math.abs(calculated - c.expected_output);
            if (error < 0.01) exactMatches++;
            totalError += error;
        });
        
        console.log(`Formula ${i + 1}: ${exactMatches} exact matches, avg error: $${(totalError / publicCases.length).toFixed(2)}`);
    });
}

testSimpleFormulas();

// 3. LOOK FOR EXACT COEFFICIENT PATTERNS
console.log('\n🎯 COEFFICIENT PATTERN ANALYSIS:');
console.log('=================================\n');

// Group by trip duration and find patterns
const byDuration = {};
publicCases.forEach(c => {
    const days = c.input.trip_duration_days;
    if (!byDuration[days]) byDuration[days] = [];
    byDuration[days].push(c);
});

console.log('Per-day analysis by trip duration:');
Object.entries(byDuration).forEach(([days, cases]) => {
    if (cases.length >= 5) {
        // Try to find the exact per-day rate for this duration
        const avgPerDay = cases.reduce((sum, c) => sum + c.expected_output / c.input.trip_duration_days, 0) / cases.length;
        
        // Find cases with minimal receipts and miles to isolate the base rate
        const simpleCases = cases.filter(c => c.input.total_receipts_amount < 50 && c.input.miles_traveled < 100);
        if (simpleCases.length > 0) {
            const simpleAvgPerDay = simpleCases.reduce((sum, c) => sum + c.expected_output / c.input.trip_duration_days, 0) / simpleCases.length;
            console.log(`${days} days: ${cases.length} cases, avg $${avgPerDay.toFixed(2)}/day, simple cases: $${simpleAvgPerDay.toFixed(2)}/day`);
        } else {
            console.log(`${days} days: ${cases.length} cases, avg $${avgPerDay.toFixed(2)}/day`);
        }
    }
});

// 4. DECISION TREE APPROACH - Find exact decision boundaries
console.log('\n🌳 DECISION TREE PATTERN DISCOVERY:');
console.log('===================================\n');

function findDecisionBoundaries() {
    // Look for clear thresholds in the data
    const thresholds = {
        days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        miles: [50, 100, 200, 400, 600, 800, 1000],
        receipts: [25, 50, 100, 200, 500, 1000, 1500, 2000]
    };
    
    // Test each threshold for significant differences
    thresholds.days.forEach(threshold => {
        const below = publicCases.filter(c => c.input.trip_duration_days < threshold);
        const above = publicCases.filter(c => c.input.trip_duration_days >= threshold);
        
        if (below.length > 50 && above.length > 50) {
            const belowAvg = below.reduce((sum, c) => sum + c.expected_output / c.input.trip_duration_days, 0) / below.length;
            const aboveAvg = above.reduce((sum, c) => sum + c.expected_output / c.input.trip_duration_days, 0) / above.length;
            const difference = Math.abs(belowAvg - aboveAvg);
            
            if (difference > 50) {
                console.log(`Days threshold ${threshold}: Below avg $${belowAvg.toFixed(2)}/day, Above avg $${aboveAvg.toFixed(2)}/day, Diff: $${difference.toFixed(2)}`);
            }
        }
    });
}

findDecisionBoundaries();

// 5. LOOK FOR POLYNOMIAL RELATIONSHIPS
console.log('\n📈 POLYNOMIAL RELATIONSHIP ANALYSIS:');
console.log('====================================\n');

// Test polynomial relationships for each variable
function analyzePolynomialRelationships() {
    // Days vs per-day rate
    const daysData = [];
    Object.entries(byDuration).forEach(([days, cases]) => {
        if (cases.length >= 5) {
            const avgPerDay = cases.reduce((sum, c) => sum + c.expected_output / c.input.trip_duration_days, 0) / cases.length;
            daysData.push({ x: parseInt(days), y: avgPerDay });
        }
    });
    
    console.log('Days vs Per-Day Rate relationship:');
    daysData.forEach(d => {
        console.log(`${d.x} days: $${d.y.toFixed(2)}/day`);
    });
    
    // Try to fit a curve: y = ax^b + c or y = a/x + b
    console.log('\nTesting curve fits:');
    console.log('Inverse relationship: rate = a/days + b');
    
    // Simple curve fitting attempt
    if (daysData.length >= 3) {
        // Test y = a/x + b
        let bestA = 0, bestB = 0, bestError = Infinity;
        
        for (let a = 100; a <= 2000; a += 50) {
            for (let b = 0; b <= 200; b += 10) {
                let totalError = 0;
                daysData.forEach(d => {
                    const predicted = a / d.x + b;
                    totalError += Math.abs(predicted - d.y);
                });
                
                if (totalError < bestError) {
                    bestError = totalError;
                    bestA = a;
                    bestB = b;
                }
            }
        }
        
        console.log(`Best fit: rate = ${bestA}/days + ${bestB}, error: ${bestError.toFixed(2)}`);
        
        // Test this formula
        daysData.forEach(d => {
            const predicted = bestA / d.x + bestB;
            console.log(`${d.x} days: actual $${d.y.toFixed(2)}, predicted $${predicted.toFixed(2)}, error $${Math.abs(predicted - d.y).toFixed(2)}`);
        });
    }
}

analyzePolynomialRelationships();

// 6. FIND EXACT FORMULAS FOR SPECIFIC CASES
console.log('\n🔬 EXACT FORMULA DISCOVERY:');
console.log('===========================\n');

// Look for very specific patterns that might reveal the exact formula
function findExactFormulas() {
    // Find cases with round numbers that might reveal the underlying logic
    const roundCases = publicCases.filter(c => 
        c.input.trip_duration_days <= 5 && 
        c.input.miles_traveled % 50 === 0 && 
        c.input.total_receipts_amount < 100
    );
    
    console.log('Round number cases (might reveal base formula):');
    roundCases.slice(0, 10).forEach(c => {
        console.log(`${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount} → $${c.expected_output}`);
    });
    
    // Try to reverse engineer the exact formula from these
    if (roundCases.length > 0) {
        console.log('\nReverse engineering attempts:');
        roundCases.slice(0, 5).forEach(c => {
            const days = c.input.trip_duration_days;
            const miles = c.input.miles_traveled;
            const receipts = c.input.total_receipts_amount;
            const output = c.expected_output;
            
            // Test various formulas
            const tests = [
                { name: 'days*a + miles*b + receipts*c', calc: (a, b, c) => days * a + miles * b + receipts * c },
                { name: 'days*a + miles*b', calc: (a, b) => days * a + miles * b },
                { name: 'days*a + sqrt(miles)*b', calc: (a, b) => days * a + Math.sqrt(miles) * b }
            ];
            
            tests.forEach(test => {
                // Try to solve for coefficients
                if (test.name === 'days*a + miles*b' && miles > 0) {
                    const a = (output - miles * 0.5) / days;
                    const b = 0.5;
                    const predicted = test.calc(a, b);
                    console.log(`Case: ${days}d, ${miles}mi → $${output}: ${test.name} with a=${a.toFixed(2)}, b=${b.toFixed(2)} = $${predicted.toFixed(2)}`);
                }
            });
        });
    }
}

findExactFormulas();

console.log('\n✅ Advanced analysis complete! Next: Build perfect calculator based on findings.'); 