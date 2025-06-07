#!/usr/bin/env node

const fs = require('fs');
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

// Silent mode for command line usage
if (process.argv.length === 5) {
    function calculateReimbursement(tripDays, miles, receipts) {
        // OPTIMAL MODEL WITH RECEIPT CAPPING
        // Based on ML analysis - Strategy 1 was best with $179.28 avg error
        
        // Base calculation: (400/days + 60) * days + 0.2 * miles
        const baseAmount = (400 / tripDays + 60) * tripDays + 0.2 * miles;
        
        // Receipt contribution with $800 cap (0.4 coefficient means cap at $2000 receipts)
        const receiptContribution = Math.min(receipts * 0.4, 800);
        
        const total = baseAmount + receiptContribution;
        
        return Math.round(total * 100) / 100;
    }

    const days = parseInt(process.argv[2]);
    const miles = parseInt(process.argv[3]);
    const receipts = parseFloat(process.argv[4]);
    
    const result = calculateReimbursement(days, miles, receipts);
    console.log(result.toFixed(2));
    process.exit(0);
}

console.log('🏆 OPTIMAL CAPPED RECEIPT MODEL v1.0');
console.log('====================================\n');

// Implement the optimal model
function calculateReimbursement(tripDays, miles, receipts) {
    const baseAmount = (400 / tripDays + 60) * tripDays + 0.2 * miles;
    const receiptContribution = Math.min(receipts * 0.4, 800);
    const total = baseAmount + receiptContribution;
    return Math.round(total * 100) / 100;
}

// Test the model
const errors = publicCases.map(c => {
    const calculated = calculateReimbursement(c.input.trip_duration_days, c.input.miles_traveled, c.input.total_receipts_amount);
    const error = Math.abs(calculated - c.expected_output);
    return { case: c, calculated, expected: c.expected_output, error };
});

const exactMatches = errors.filter(e => e.error < 0.01).length;
const closeMatches = errors.filter(e => e.error < 1.0).length;
const avgError = errors.reduce((sum, e) => sum + e.error, 0) / errors.length;

console.log('📊 OPTIMAL MODEL PERFORMANCE:');
console.log('=============================\n');
console.log(`Exact matches: ${exactMatches}/1000 (${(exactMatches/10).toFixed(1)}%)`);
console.log(`Close matches: ${closeMatches}/1000 (${(closeMatches/10).toFixed(1)}%)`);
console.log(`Average error: $${avgError.toFixed(2)}`);

console.log('\n📐 OPTIMAL FORMULA:');
console.log('Reimbursement = (400/days + 60) × days + 0.2 × miles + min(receipts × 0.4, 800)');

console.log('\n✅ Optimal capped model complete!');

module.exports = { calculateReimbursement }; 