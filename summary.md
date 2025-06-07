# Black Box Challenge - Analysis Summary

## What We Discovered

### Key Patterns:

1. **Trip length heavily affects per-day rates**: 1 day = $874/day, 14 days = $122/day
2. **Receipt processing is complex**: Can have NEGATIVE effects for high amounts on long trips
3. **Mileage has tiered rates**: Not linear, diminishing returns after ~100 miles
4. **Multiple calculation paths**: Different logic based on trip characteristics

### Our Best Calculator:

- Variable daily rates based on trip length (140→50 per day)
- Mileage at $0.45/mile
- Trip-dependent receipt processing with penalties for long trips
- **Performance**: 0% exact matches, $449 average error

### Why It's Difficult:

- 60 years of business rule evolution
- Complex interaction effects between variables
- Possible non-deterministic elements
- Legacy system with accumulated quirks and patches

## Current Status:

- **Score**: 44,999 (lower is better)
- **Ready for submission** but likely needs advanced ML techniques for optimal performance
- Demonstrates the complexity of reverse-engineering legacy systems

The system we've built captures major patterns but this challenge would benefit from machine learning approaches for the final precision needed.
