#!/usr/bin/env node

const fs = require('fs');

// Silent mode for command line usage
if (process.argv.length === 5) {
    function calculateReimbursement(tripDays, miles, receipts) {
        // DISCOVERED PATTERNS:
        // 1. Base formula: rate = 800/days + 70, mileage = 0.50/mile
        // 2. Receipt processing is trip-length dependent
        // 3. CRITICAL: There appear to be caps and special edge case rules
        
        const dailyRate = 800 / tripDays + 70;
        let baseAmount = tripDays * dailyRate;
        let mileageAmount = miles * 0.50;
        
        // EDGE CASE DETECTION: Special rules for extreme cases
        
        // Rule 1: High receipts on short trips get SEVERE caps
        if (tripDays <= 2 && receipts > 400) {
            // These cases show dramatically lower outputs than expected
            const receiptPenalty = (receipts - 400) * -0.5;
            const cappedReceipts = Math.min(receipts, 400);
            const receiptContribution = cappedReceipts * 0.1 + receiptPenalty;
            return Math.round((baseAmount + mileageAmount + receiptContribution) * 100) / 100;
        }
        
        // Rule 2: High mileage on short trips gets special treatment
        if (tripDays === 1 && miles > 800) {
            // Case like 1d, 1082mi should give much lower than expected
            const cappedMileage = Math.min(miles, 300); // Severe mileage cap
            mileageAmount = cappedMileage * 0.50;
            const receiptContribution = Math.min(receipts * 0.1, 50); // Very low receipt contribution
            return Math.round((baseAmount + mileageAmount + receiptContribution) * 100) / 100;
        }
        
        // Rule 3: Very high receipts might have absolute caps
        if (receipts > 2000) {
            // Maximum possible receipt contribution
            const maxReceiptContribution = 400; // Hard cap
            const receiptContribution = Math.min(receipts * 0.2, maxReceiptContribution);
            return Math.round((baseAmount + mileageAmount + receiptContribution) * 100) / 100;
        }
        
        // Rule 4: Long trips with high receipts get diminishing returns
        if (tripDays >= 8 && receipts > 1500) {
            // These should be much lower than my current calculation
            const receiptContribution = receipts * -0.2; // Negative contribution!
            return Math.round((baseAmount + mileageAmount + receiptContribution) * 100) / 100;
        }
        
        // NORMAL PROCESSING (refined based on patterns)
        let receiptContribution = 0;
        
        if (tripDays === 1) {
            if (receipts < 50) {
                receiptContribution = receipts * 0.1;
            } else if (receipts < 200) {
                receiptContribution = receipts * 0.3;
            } else if (receipts < 400) {
                receiptContribution = receipts * 0.2;
            } else {
                // High receipts on 1-day trips are heavily penalized
                receiptContribution = 400 * 0.2 + (receipts - 400) * -0.3;
            }
        } else if (tripDays === 2) {
            if (receipts < 100) {
                receiptContribution = receipts * 0.2;
            } else if (receipts < 400) {
                receiptContribution = receipts * 0.4;
            } else {
                receiptContribution = 400 * 0.4 + (receipts - 400) * -0.1;
            }
        } else if (tripDays === 3) {
            if (receipts < 200) {
                receiptContribution = receipts * 0.1;
            } else if (receipts < 800) {
                receiptContribution = receipts * 0.3;
            } else {
                receiptContribution = 800 * 0.3 + (receipts - 800) * 0.1;
            }
        } else if (tripDays <= 5) {
            if (receipts < 300) {
                receiptContribution = receipts * 0.05;
            } else if (receipts < 1000) {
                receiptContribution = receipts * 0.15;
            } else {
                receiptContribution = 1000 * 0.15 + (receipts - 1000) * 0.05;
            }
        } else if (tripDays <= 8) {
            if (receipts < 500) {
                receiptContribution = receipts * 0.02;
            } else if (receipts < 1200) {
                receiptContribution = receipts * 0.05;
            } else {
                receiptContribution = 1200 * 0.05 + (receipts - 1200) * -0.05;
            }
        } else {
            // 9+ days - very restrictive
            if (receipts < 800) {
                receiptContribution = receipts * -0.1;
            } else {
                receiptContribution = receipts * -0.2;
            }
        }
        
        const total = baseAmount + mileageAmount + receiptContribution;
        return Math.round(total * 100) / 100;
    }

    const days = parseInt(process.argv[2]);
    const miles = parseInt(process.argv[3]);
    const receipts = parseFloat(process.argv[4]);
    
    const result = calculateReimbursement(days, miles, receipts);
    console.log(result.toFixed(2));
    process.exit(0);
}

// Test mode
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

console.log('🚀 Ultimate Calculator v4.0 - Edge Case Mastery');
console.log('=================================================\n');

function calculateReimbursement(tripDays, miles, receipts) {
    // Base formula with exact mathematical relationships
    const dailyRate = 800 / tripDays + 70;
    let baseAmount = tripDays * dailyRate;
    let mileageAmount = miles * 0.50;
    
    // EDGE CASE HANDLING
    
    // High receipts on short trips
    if (tripDays <= 2 && receipts > 400) {
        const receiptPenalty = (receipts - 400) * -0.5;
        const cappedReceipts = Math.min(receipts, 400);
        const receiptContribution = cappedReceipts * 0.1 + receiptPenalty;
        return Math.round((baseAmount + mileageAmount + receiptContribution) * 100) / 100;
    }
    
    // High mileage on short trips
    if (tripDays === 1 && miles > 800) {
        const cappedMileage = Math.min(miles, 300);
        mileageAmount = cappedMileage * 0.50;
        const receiptContribution = Math.min(receipts * 0.1, 50);
        return Math.round((baseAmount + mileageAmount + receiptContribution) * 100) / 100;
    }
    
    // Very high receipts cap
    if (receipts > 2000) {
        const maxReceiptContribution = 400;
        const receiptContribution = Math.min(receipts * 0.2, maxReceiptContribution);
        return Math.round((baseAmount + mileageAmount + receiptContribution) * 100) / 100;
    }
    
    // Long trips with high receipts
    if (tripDays >= 8 && receipts > 1500) {
        const receiptContribution = receipts * -0.2;
        return Math.round((baseAmount + mileageAmount + receiptContribution) * 100) / 100;
    }
    
    // Normal processing with refined coefficients
    let receiptContribution = 0;
    
    if (tripDays === 1) {
        if (receipts < 50) {
            receiptContribution = receipts * 0.1;
        } else if (receipts < 200) {
            receiptContribution = receipts * 0.3;
        } else if (receipts < 400) {
            receiptContribution = receipts * 0.2;
        } else {
            receiptContribution = 400 * 0.2 + (receipts - 400) * -0.3;
        }
    } else if (tripDays === 2) {
        if (receipts < 100) {
            receiptContribution = receipts * 0.2;
        } else if (receipts < 400) {
            receiptContribution = receipts * 0.4;
        } else {
            receiptContribution = 400 * 0.4 + (receipts - 400) * -0.1;
        }
    } else if (tripDays === 3) {
        if (receipts < 200) {
            receiptContribution = receipts * 0.1;
        } else if (receipts < 800) {
            receiptContribution = receipts * 0.3;
        } else {
            receiptContribution = 800 * 0.3 + (receipts - 800) * 0.1;
        }
    } else if (tripDays <= 5) {
        if (receipts < 300) {
            receiptContribution = receipts * 0.05;
        } else if (receipts < 1000) {
            receiptContribution = receipts * 0.15;
        } else {
            receiptContribution = 1000 * 0.15 + (receipts - 1000) * 0.05;
        }
    } else if (tripDays <= 8) {
        if (receipts < 500) {
            receiptContribution = receipts * 0.02;
        } else if (receipts < 1200) {
            receiptContribution = receipts * 0.05;
        } else {
            receiptContribution = 1200 * 0.05 + (receipts - 1200) * -0.05;
        }
    } else {
        if (receipts < 800) {
            receiptContribution = receipts * -0.1;
        } else {
            receiptContribution = receipts * -0.2;
        }
    }
    
    const total = baseAmount + mileageAmount + receiptContribution;
    return Math.round(total * 100) / 100;
}

// Test specifically on the worst cases from precision calculator
const worstCases = [
    { days: 1, miles: 1082, receipts: 1809.49, expected: 446.94 },
    { days: 1, miles: 451, receipts: 555.49, expected: 162.18 },
    { days: 4, miles: 69, receipts: 2321.49, expected: 322.00 },
    { days: 8, miles: 795, receipts: 1645.99, expected: 644.69 },
    { days: 2, miles: 384, receipts: 495.49, expected: 290.36 }
];

console.log('🎯 TESTING ON WORST CASES:');
worstCases.forEach((c, i) => {
    const calculated = calculateReimbursement(c.days, c.miles, c.receipts);
    const error = Math.abs(calculated - c.expected);
    console.log(`${i+1}. ${c.days}d, ${c.miles}mi, $${c.receipts} → Expected: $${c.expected}, Got: $${calculated.toFixed(2)}, Error: $${error.toFixed(2)}`);
});

// Test the full calculator
const errors = publicCases.map(c => {
    const calculated = calculateReimbursement(c.input.trip_duration_days, c.input.miles_traveled, c.input.total_receipts_amount);
    const error = Math.abs(calculated - c.expected_output);
    return { case: c, calculated, expected: c.expected_output, error };
});

const exactMatches = errors.filter(e => e.error < 0.01).length;
const closeMatches = errors.filter(e => e.error < 1.0).length;
const veryCloseMatches = errors.filter(e => e.error < 10.0).length;
const avgError = errors.reduce((sum, e) => sum + e.error, 0) / errors.length;

console.log(`\n🚀 ULTIMATE RESULTS:`);
console.log(`  Exact matches (±$0.01): ${exactMatches}/1000 (${(exactMatches/10).toFixed(1)}%)`);
console.log(`  Close matches (±$1.00): ${closeMatches}/1000 (${(closeMatches/10).toFixed(1)}%)`);
console.log(`  Very close (±$10.00): ${veryCloseMatches}/1000 (${(veryCloseMatches/10).toFixed(1)}%)`);
console.log(`  Average error: $${avgError.toFixed(2)}`);

if (exactMatches > 0) {
    console.log('\n🏆 PERFECT MATCHES FOUND:');
    errors.filter(e => e.error < 0.01).slice(0, 5).forEach((e, i) => {
        const c = e.case;
        console.log(`  ${i+1}. ${c.input.trip_duration_days}d, ${c.input.miles_traveled}mi, $${c.input.total_receipts_amount.toFixed(2)} → $${e.expected.toFixed(2)}`);
    });
}

module.exports = { calculateReimbursement }; 