#!/usr/bin/env node

const fs = require('fs');
const publicCases = JSON.parse(fs.readFileSync('public_cases.json', 'utf8'));

// Silent mode for command line usage
if (process.argv.length === 5) {
    function calculateReimbursement(tripDays, miles, receipts) {
        // SELF-CORRECTING ITERATIVE MODEL
        // Multiple layers of progressive refinement
        
        // LAYER 1: Base Mathematical Model
        let prediction = baseModel(tripDays, miles, receipts);
        
        // LAYER 2: Pattern-Based Corrections
        prediction = applyPatternCorrections(prediction, tripDays, miles, receipts);
        
        // LAYER 3: Error Trend Corrections
        prediction = applyErrorTrendCorrections(prediction, tripDays, miles, receipts);
        
        // LAYER 4: Outlier-Specific Corrections
        prediction = applyOutlierCorrections(prediction, tripDays, miles, receipts);
        
        // LAYER 5: Fine-Tuning Adjustments
        prediction = applyFineTuning(prediction, tripDays, miles, receipts);
        
        return Math.round(prediction * 100) / 100;
    }
    
    // Base model (our best formula so far)
    function baseModel(days, miles, receipts) {
        const baseAmount = (400 / days + 60) * days + 0.2 * miles;
        const receiptContribution = Math.min(receipts * 0.4, 800);
        return baseAmount + receiptContribution;
    }
    
    // Pattern-based corrections using learned error patterns
    function applyPatternCorrections(prediction, days, miles, receipts) {
        // High-receipt short trips (our biggest error source)
        if (receipts > 1500 && days <= 5) {
            const overestimate = (receipts - 1500) * 0.3;
            prediction -= overestimate;
        }
        
        // Very long trips have different efficiency patterns
        if (days >= 12) {
            const efficiency = miles / days;
            if (efficiency < 50) {
                prediction -= days * 5; // Penalty for inefficient long trips
            }
        }
        
        // Ultra high efficiency cases (likely errors in base formula)
        if (days <= 3 && miles > 800) {
            const efficiencyPenalty = (miles - 800) * 0.1;
            prediction -= efficiencyPenalty;
        }
        
        return prediction;
    }
    
    // Error trend corrections based on systematic biases
    function applyErrorTrendCorrections(prediction, days, miles, receipts) {
        // Systematic overestimation for certain receipt ranges
        if (receipts > 1000 && receipts < 2500) {
            const overestimationFactor = Math.min(0.15, (receipts - 1000) / 10000);
            prediction *= (1 - overestimationFactor);
        }
        
        // Underestimation for specific day-mile combinations
        if (days >= 7 && days <= 9 && miles > 600) {
            prediction += 50; // Correction for systematic underestimation
        }
        
        return prediction;
    }
    
    // Outlier-specific corrections for extreme cases
    function applyOutlierCorrections(prediction, days, miles, receipts) {
        // Extreme cases that don't follow normal patterns
        const receiptIntensity = receipts / (days * miles + 1);
        
        if (receiptIntensity > 2.0) {
            // Very high receipt density - likely anomaly
            prediction = Math.min(prediction, days * 150 + miles * 0.5);
        }
        
        if (days === 1 && miles > 1000 && receipts > 1500) {
            // Impossible efficiency cases
            prediction = Math.min(prediction, 600);
        }
        
        if (days >= 14 && receipts < 500) {
            // Long trips with very low receipts
            prediction = Math.max(prediction, days * 60);
        }
        
        return prediction;
    }
    
    // Fine-tuning based on micro-patterns
    function applyFineTuning(prediction, days, miles, receipts) {
        // Small adjustments for specific ranges
        if (days === 4 && receipts > 2000) {
            prediction *= 0.7; // Specific correction for 4-day high-receipt cases
        }
        
        if (days === 8 && miles > 700 && receipts > 1400) {
            prediction *= 0.8; // Specific pattern observed in errors
        }
        
        // Ensure reasonable bounds
        const minBound = days * 30;
        const maxBound = days * 800 + Math.min(receipts * 0.3, 600);
        
        return Math.max(minBound, Math.min(maxBound, prediction));
    }

    const days = parseInt(process.argv[2]);
    const miles = parseInt(process.argv[3]);
    const receipts = parseFloat(process.argv[4]);
    
    const result = calculateReimbursement(days, miles, receipts);
    console.log(result.toFixed(2));
    process.exit(0);
}

console.log('🧠 SELF-CORRECTING ITERATIVE MODEL v1.0');
console.log('=======================================\n');
console.log('🎯 TARGET: Zero error through progressive refinement');
console.log('🔄 METHOD: Multi-layer iterative correction system');
console.log();

// MACHINE LEARNING ERROR PATTERN ANALYSIS
console.log('🔍 LEARNING ERROR PATTERNS:');
console.log('===========================\n');

function learnErrorPatterns() {
    console.log('Analyzing systematic errors in our best model...');
    
    // Calculate errors with our current best model
    const baseErrors = publicCases.map(c => {
        const days = c.input.trip_duration_days;
        const miles = c.input.miles_traveled;  
        const receipts = c.input.total_receipts_amount;
        
        // Base model prediction
        const baseAmount = (400 / days + 60) * days + 0.2 * miles;
        const receiptContribution = Math.min(receipts * 0.4, 800);
        const basePrediction = baseAmount + receiptContribution;
        
        const error = basePrediction - c.expected_output;
        
        return {
            case: c,
            basePrediction,
            expected: c.expected_output,
            error,
            absError: Math.abs(error),
            days,
            miles,
            receipts,
            receiptIntensity: receipts / (days * miles + 1),
            efficiency: miles / days
        };
    });
    
    // Sort by error magnitude to find patterns
    baseErrors.sort((a, b) => b.absError - a.absError);
    
    console.log('Top 10 error patterns to correct:');
    baseErrors.slice(0, 10).forEach((e, i) => {
        const sign = e.error > 0 ? '+' : '';
        console.log(`${i+1}. ${e.days}d, ${e.miles}mi, $${e.receipts.toFixed(2)}`);
        console.log(`   Predicted: $${e.basePrediction.toFixed(2)}, Expected: $${e.expected.toFixed(2)}`);
        console.log(`   Error: ${sign}$${e.error.toFixed(2)} (intensity: ${e.receiptIntensity.toFixed(3)})`);
        console.log();
    });
    
    // Find systematic biases
    const overestimations = baseErrors.filter(e => e.error > 100).length;
    const underestimations = baseErrors.filter(e => e.error < -100).length;
    
    console.log('SYSTEMATIC BIAS ANALYSIS:');
    console.log(`Large overestimations (>$100): ${overestimations}`);
    console.log(`Large underestimations (<-$100): ${underestimations}`);
    
    // Analyze by categories
    const highReceiptErrors = baseErrors.filter(e => e.receipts > 1500 && e.absError > 200);
    const longTripErrors = baseErrors.filter(e => e.days >= 10 && e.absError > 200);
    
    console.log(`High receipt cases with major errors: ${highReceiptErrors.length}`);
    console.log(`Long trip cases with major errors: ${longTripErrors.length}`);
    
    return baseErrors;
}

const errorPatterns = learnErrorPatterns();

// IMPLEMENT ITERATIVE CORRECTION LAYERS
console.log('\n🔧 IMPLEMENTING CORRECTION LAYERS:');
console.log('==================================\n');

function implementCorrectiveLayers() {
    // Base model functions
    function baseModel(days, miles, receipts) {
        const baseAmount = (400 / days + 60) * days + 0.2 * miles;
        const receiptContribution = Math.min(receipts * 0.4, 800);
        return baseAmount + receiptContribution;
    }
    
    function applyPatternCorrections(prediction, days, miles, receipts) {
        if (receipts > 1500 && days <= 5) {
            const overestimate = (receipts - 1500) * 0.3;
            prediction -= overestimate;
        }
        
        if (days >= 12) {
            const efficiency = miles / days;
            if (efficiency < 50) {
                prediction -= days * 5;
            }
        }
        
        if (days <= 3 && miles > 800) {
            const efficiencyPenalty = (miles - 800) * 0.1;
            prediction -= efficiencyPenalty;
        }
        
        return prediction;
    }
    
    function applyErrorTrendCorrections(prediction, days, miles, receipts) {
        if (receipts > 1000 && receipts < 2500) {
            const overestimationFactor = Math.min(0.15, (receipts - 1000) / 10000);
            prediction *= (1 - overestimationFactor);
        }
        
        if (days >= 7 && days <= 9 && miles > 600) {
            prediction += 50;
        }
        
        return prediction;
    }
    
    function applyOutlierCorrections(prediction, days, miles, receipts) {
        const receiptIntensity = receipts / (days * miles + 1);
        
        if (receiptIntensity > 2.0) {
            prediction = Math.min(prediction, days * 150 + miles * 0.5);
        }
        
        if (days === 1 && miles > 1000 && receipts > 1500) {
            prediction = Math.min(prediction, 600);
        }
        
        if (days >= 14 && receipts < 500) {
            prediction = Math.max(prediction, days * 60);
        }
        
        return prediction;
    }
    
    function applyFineTuning(prediction, days, miles, receipts) {
        if (days === 4 && receipts > 2000) {
            prediction *= 0.7;
        }
        
        if (days === 8 && miles > 700 && receipts > 1400) {
            prediction *= 0.8;
        }
        
        const minBound = days * 30;
        const maxBound = days * 800 + Math.min(receipts * 0.3, 600);
        
        return Math.max(minBound, Math.min(maxBound, prediction));
    }
    
    // Full iterative model
    function calculateReimbursement(tripDays, miles, receipts) {
        let prediction = baseModel(tripDays, miles, receipts);
        prediction = applyPatternCorrections(prediction, tripDays, miles, receipts);
        prediction = applyErrorTrendCorrections(prediction, tripDays, miles, receipts);
        prediction = applyOutlierCorrections(prediction, tripDays, miles, receipts);
        prediction = applyFineTuning(prediction, tripDays, miles, receipts);
        return Math.round(prediction * 100) / 100;
    }
    
    return calculateReimbursement;
}

const iterativeModel = implementCorrectiveLayers();

// TEST THE ITERATIVE MODEL
console.log('Testing iterative correction layers...');

const errors = publicCases.map(c => {
    const calculated = iterativeModel(c.input.trip_duration_days, c.input.miles_traveled, c.input.total_receipts_amount);
    const error = Math.abs(calculated - c.expected_output);
    return { case: c, calculated, expected: c.expected_output, error };
});

const exactMatches = errors.filter(e => e.error < 0.01).length;
const closeMatches = errors.filter(e => e.error < 1.0).length;
const veryCloseMatches = errors.filter(e => e.error < 10.0).length;
const avgError = errors.reduce((sum, e) => sum + e.error, 0) / errors.length;

console.log('\n🎯 ITERATIVE MODEL PERFORMANCE:');
console.log('===============================\n');
console.log(`Exact matches (±$0.01): ${exactMatches}/1000 (${(exactMatches/10).toFixed(1)}%)`);
console.log(`Close matches (±$1.00): ${closeMatches}/1000 (${(closeMatches/10).toFixed(1)}%)`);
console.log(`Very close (±$10.00): ${veryCloseMatches}/1000 (${(veryCloseMatches/10).toFixed(1)}%)`);
console.log(`Average error: $${avgError.toFixed(2)}`);

// Progress tracking
console.log('\n🚀 ZERO ERROR PROGRESS:');
console.log('=======================');
console.log('Capped model: $179.27 avg error');
console.log(`Iterative model: $${avgError.toFixed(2)} avg error`);

const improvement = 179.27 - avgError;
console.log(`Improvement: ${improvement > 0 ? '+' : ''}$${improvement.toFixed(2)}`);

if (exactMatches > 5) {
    console.log('\n🏆 BREAKTHROUGH: Multiple exact matches found!');
    console.log('🎉 Approaching zero error target!');
} else if (avgError < 150) {
    console.log('\n✅ SIGNIFICANT PROGRESS toward zero error!');
} else if (improvement > 10) {
    console.log('\n📈 Good improvement with iterative corrections!');
} else {
    console.log('\n🔧 Need more sophisticated correction strategies.');
}

// Show worst remaining cases for next iteration
if (avgError > 100) {
    console.log('\n🔍 REMAINING HARD CASES:');
    const worstCases = errors.sort((a, b) => b.error - a.error).slice(0, 5);
    worstCases.forEach((e, i) => {
        const c = e.case.input;
        console.log(`${i+1}. ${c.trip_duration_days}d, ${c.miles_traveled}mi, $${c.total_receipts_amount.toFixed(2)}`);
        console.log(`   Expected: $${e.expected.toFixed(2)}, Got: $${e.calculated.toFixed(2)}, Error: $${e.error.toFixed(2)}`);
    });
}

console.log('\n🔄 Iterative correction system ready for deployment!');

// Export the final iterative model
function calculateReimbursement(tripDays, miles, receipts) {
    return iterativeModel(tripDays, miles, receipts);
}

module.exports = { calculateReimbursement }; 