#!/usr/bin/env node

const fs = require('fs');

// Load the test data
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

console.log('🔍 Black Box Reimbursement System Analysis');
console.log('==========================================\n');

console.log(`📊 Total test cases: ${publicCases.length}\n`);

// Basic statistics
function calculateStats(values) {
    const sorted = values.sort((a, b) => a - b);
    return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        median: sorted[Math.floor(sorted.length / 2)]
    };
}

// Analyze input ranges
const tripDays = publicCases.map(c => c.input.trip_duration_days);
const miles = publicCases.map(c => c.input.miles_traveled);
const receipts = publicCases.map(c => c.input.total_receipts_amount);
const outputs = publicCases.map(c => c.expected_output);

console.log('📈 Input Data Ranges:');
console.log('Trip Duration:', calculateStats(tripDays));
console.log('Miles Traveled:', calculateStats(miles));
console.log('Receipt Amounts:', calculateStats(receipts));
console.log('Reimbursements:', calculateStats(outputs));
console.log();

// Analyze by trip duration - looking for the 5-day bonus pattern
console.log('🗓️  Analysis by Trip Duration:');
const byDuration = {};
publicCases.forEach(c => {
    const days = c.input.trip_duration_days;
    if (!byDuration[days]) byDuration[days] = [];
    byDuration[days].push({
        miles: c.input.miles_traveled,
        receipts: c.input.total_receipts_amount,
        output: c.expected_output,
        perDay: c.expected_output / days,
        milesPerDay: c.input.miles_traveled / days,
        receiptsPerDay: c.input.total_receipts_amount / days
    });
});

for (let days = 1; days <= 15; days++) {
    if (byDuration[days] && byDuration[days].length > 5) {
        const avgPerDay = byDuration[days].reduce((sum, item) => sum + item.perDay, 0) / byDuration[days].length;
        console.log(`${days} days: ${byDuration[days].length} cases, avg $${avgPerDay.toFixed(2)}/day`);
    }
}
console.log();

// Look for efficiency bonus patterns (miles per day)
console.log('🚗 Efficiency Analysis (Miles per Day):');
const efficiencyBuckets = {};
publicCases.forEach(c => {
    const efficiency = c.input.miles_traveled / c.input.trip_duration_days;
    const bucket = Math.floor(efficiency / 25) * 25; // Group by 25-mile ranges
    if (!efficiencyBuckets[bucket]) efficiencyBuckets[bucket] = [];
    efficiencyBuckets[bucket].push({
        efficiency,
        output: c.expected_output,
        days: c.input.trip_duration_days,
        receipts: c.input.total_receipts_amount
    });
});

Object.keys(efficiencyBuckets)
    .sort((a, b) => Number(a) - Number(b))
    .slice(0, 15) // Show first 15 buckets
    .forEach(bucket => {
        if (efficiencyBuckets[bucket].length > 10) {
            const cases = efficiencyBuckets[bucket];
            const avgOutput = cases.reduce((sum, c) => sum + c.output, 0) / cases.length;
            console.log(`${bucket}-${Number(bucket) + 24} miles/day: ${cases.length} cases, avg $${avgOutput.toFixed(2)}`);
        }
    });
console.log();

// Analyze mileage patterns - looking for tiered rates
console.log('📏 Mileage Rate Analysis:');
const mileageAnalysis = publicCases.map(c => ({
    miles: c.input.miles_traveled,
    days: c.input.trip_duration_days,
    receipts: c.input.total_receipts_amount,
    output: c.expected_output,
    // Estimate mileage component by subtracting base per diem
    estimatedMileageComponent: c.expected_output - (c.input.trip_duration_days * 100),
    ratePerMile: c.input.miles_traveled > 0 ? 
        (c.expected_output - (c.input.trip_duration_days * 100)) / c.input.miles_traveled : 0
})).filter(item => item.miles > 0 && item.ratePerMile > 0 && item.ratePerMile < 2);

// Group by mileage ranges
const mileageRanges = [
    { min: 0, max: 100 },
    { min: 100, max: 200 },
    { min: 200, max: 400 },
    { min: 400, max: 600 },
    { min: 600, max: 1000 }
];

mileageRanges.forEach(range => {
    const inRange = mileageAnalysis.filter(item => 
        item.miles >= range.min && item.miles < range.max
    );
    if (inRange.length > 5) {
        const avgRate = inRange.reduce((sum, item) => sum + item.ratePerMile, 0) / inRange.length;
        console.log(`${range.min}-${range.max} miles: ${inRange.length} cases, avg $${avgRate.toFixed(3)}/mile`);
    }
});
console.log();

// Receipt amount analysis - looking for diminishing returns
console.log('🧾 Receipt Amount Analysis:');
const receiptRanges = [
    { min: 0, max: 50 },
    { min: 50, max: 200 },
    { min: 200, max: 500 },
    { min: 500, max: 1000 },
    { min: 1000, max: 2000 }
];

receiptRanges.forEach(range => {
    const inRange = publicCases.filter(c => 
        c.input.total_receipts_amount >= range.min && 
        c.input.total_receipts_amount < range.max
    );
    if (inRange.length > 10) {
        const avgOutput = inRange.reduce((sum, c) => sum + c.expected_output, 0) / inRange.length;
        const avgReceiptUsage = inRange.reduce((sum, c) => {
            // Rough estimate of receipt contribution
            const basePayout = c.input.trip_duration_days * 100 + c.input.miles_traveled * 0.5;
            return sum + Math.max(0, c.expected_output - basePayout);
        }, 0) / inRange.length;
        console.log(`$${range.min}-${range.max} receipts: ${inRange.length} cases, avg payout $${avgOutput.toFixed(2)}, est receipt contribution $${avgReceiptUsage.toFixed(2)}`);
    }
});
console.log();

// Look for the rounding bug (.49 and .99 cents)
console.log('💰 Rounding Bug Analysis:');
const roundingCases = {
    '49_cents': publicCases.filter(c => {
        const cents = Math.round((c.input.total_receipts_amount % 1) * 100);
        return cents === 49;
    }),
    '99_cents': publicCases.filter(c => {
        const cents = Math.round((c.input.total_receipts_amount % 1) * 100);
        return cents === 99;
    }),
    'other_cents': publicCases.filter(c => {
        const cents = Math.round((c.input.total_receipts_amount % 1) * 100);
        return cents !== 49 && cents !== 99;
    })
};

Object.entries(roundingCases).forEach(([key, cases]) => {
    if (cases.length > 0) {
        const avgOutput = cases.reduce((sum, c) => sum + c.expected_output, 0) / cases.length;
        console.log(`${key}: ${cases.length} cases, avg payout $${avgOutput.toFixed(2)}`);
    }
});
console.log();

// Special analysis for 5-day trips (looking for the bonus)
console.log('🎯 5-Day Trip Special Analysis:');
const fiveDayTrips = publicCases.filter(c => c.input.trip_duration_days === 5);
if (fiveDayTrips.length > 0) {
    console.log(`Found ${fiveDayTrips.length} five-day trips`);
    
    // Compare with 4-day and 6-day trips for similar characteristics
    const fourDayTrips = publicCases.filter(c => c.input.trip_duration_days === 4);
    const sixDayTrips = publicCases.filter(c => c.input.trip_duration_days === 6);
    
    const fiveAvg = fiveDayTrips.reduce((sum, c) => sum + c.expected_output, 0) / fiveDayTrips.length;
    const fourAvg = fourDayTrips.length > 0 ? 
        fourDayTrips.reduce((sum, c) => sum + c.expected_output, 0) / fourDayTrips.length : 0;
    const sixAvg = sixDayTrips.length > 0 ? 
        sixDayTrips.reduce((sum, c) => sum + c.expected_output, 0) / sixDayTrips.length : 0;
    
    console.log(`4-day trips average: $${(fourAvg/4).toFixed(2)}/day`);
    console.log(`5-day trips average: $${(fiveAvg/5).toFixed(2)}/day`);
    console.log(`6-day trips average: $${(sixAvg/6).toFixed(2)}/day`);
}
console.log();

// Find some specific examples that might reveal patterns
console.log('🔍 Pattern Examples:');

// Low receipt examples
const lowReceiptExamples = publicCases
    .filter(c => c.input.total_receipts_amount < 25)
    .slice(0, 5);
console.log('Low receipt examples:');
lowReceiptExamples.forEach((c, i) => {
    console.log(`  ${i+1}. ${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount} → $${c.expected_output}`);
});

// High efficiency examples
const highEfficiencyExamples = publicCases
    .filter(c => c.input.miles_traveled / c.input.trip_duration_days > 180)
    .slice(0, 5);
console.log('\nHigh efficiency examples (>180 mi/day):');
highEfficiencyExamples.forEach((c, i) => {
    const efficiency = c.input.miles_traveled / c.input.trip_duration_days;
    console.log(`  ${i+1}. ${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi (${efficiency.toFixed(1)}/day), $${c.input.total_receipts_amount} → $${c.expected_output}`);
});

console.log('\n✅ Analysis complete! Use this data to build your reimbursement model.'); 