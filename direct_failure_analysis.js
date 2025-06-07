#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

console.log('🔍 DIRECT COMMAND LINE FAILURE ANALYSIS');
console.log('=======================================\n');
console.log('Testing each case exactly as eval.sh does...\n');

const failures = [];
const successes = [];

publicCases.forEach((testCase, index) => {
    try {
        const command = `./run.sh ${testCase.input.trip_duration_days} ${testCase.input.miles_traveled} ${testCase.input.total_receipts_amount}`;
        const result = execSync(command, { encoding: 'utf8' }).trim();
        const calculated = parseFloat(result);
        const expected = testCase.expected_output;
        const error = Math.abs(calculated - expected);
        
        const caseData = {
            index: index,
            days: testCase.input.trip_duration_days,
            miles: testCase.input.miles_traveled,
            receipts: testCase.input.total_receipts_amount,
            expected: expected,
            calculated: calculated,
            error: error
        };
        
        if (error > 0.01) {
            failures.push(caseData);
        } else {
            successes.push(caseData);
        }
        
        if ((index + 1) % 100 === 0) {
            console.log(`Processed ${index + 1}/1000 cases...`);
        }
        
    } catch (err) {
        console.error(`Error processing case ${index}:`, err.message);
    }
});

console.log(`\n✅ Successes: ${successes.length}/1000 (${(successes.length/10).toFixed(1)}%)`);
console.log(`❌ Failures: ${failures.length}/1000 (${(failures.length/10).toFixed(1)}%)`);

if (failures.length > 0) {
    // Sort failures by error size
    failures.sort((a, b) => b.error - a.error);
    
    console.log('\n🔍 TOP 20 FAILURES (by error size):');
    console.log('=====================================');
    failures.slice(0, 20).forEach((f, i) => {
        const hasDecimals = f.miles % 1 !== 0 || f.receipts % 1 !== 0;
        console.log(`${i+1}. Case ${f.index}: ${f.days}d, ${f.miles}mi, $${f.receipts.toFixed(2)} → Expected: $${f.expected.toFixed(2)}, Got: $${f.calculated.toFixed(2)}, Error: $${f.error.toFixed(4)} ${hasDecimals ? '(decimal)' : '(integer)'}`);
    });
    
    // Analyze patterns in failures
    console.log('\n📊 FAILURE PATTERN ANALYSIS:');
    console.log('============================');
    
    const failuresByDays = {};
    const decimalFailures = failures.filter(f => f.miles % 1 !== 0 || f.receipts % 1 !== 0);
    const integerFailures = failures.filter(f => f.miles % 1 === 0 && f.receipts % 1 === 0);
    
    failures.forEach(f => {
        failuresByDays[f.days] = (failuresByDays[f.days] || 0) + 1;
    });
    
    console.log('\nFailures by trip duration:');
    Object.entries(failuresByDays).sort((a, b) => b[1] - a[1]).forEach(([days, count]) => {
        console.log(`  ${days} days: ${count} failures`);
    });
    
    console.log(`\nDecimal vs Integer failures:`);
    console.log(`  Decimal cases: ${decimalFailures.length} failures`);
    console.log(`  Integer cases: ${integerFailures.length} failures`);
    
    // Export failures for targeted improvements
    fs.writeFileSync('failures.json', JSON.stringify(failures, null, 2));
    console.log('\n📝 Failures exported to failures.json for detailed analysis');
    
    console.log('\n🎯 SPECIFIC IMPROVEMENT TARGETS:');
    console.log('===============================');
    failures.slice(0, 10).forEach((f, i) => {
        console.log(`TARGET ${i+1}: ${f.days} days, ${f.miles} miles, $${f.receipts.toFixed(2)} receipts`);
        console.log(`  Expected: $${f.expected.toFixed(2)}, Got: $${f.calculated.toFixed(2)}, Need: ${f.expected > f.calculated ? '+' : ''}$${(f.expected - f.calculated).toFixed(4)}`);
    });
}

console.log('\n🎯 READY FOR TARGETED IMPROVEMENTS!'); 