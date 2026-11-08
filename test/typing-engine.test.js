const assert = require('assert');
const TypingEngine = require('../js/typing-engine.js');

console.log('Running TypingEngine Unit Tests...');

// 1. Gross WPM Tests
{
    // 300 characters in 60s = 60 words / 1 min = 60 WPM
    const gwpm1 = TypingEngine.calculateGrossWPM(300, 60);
    assert.strictEqual(gwpm1, 60, `Expected 60 GWPM, got ${gwpm1}`);

    // Zero seconds boundary
    const gwpmZero = TypingEngine.calculateGrossWPM(300, 0);
    assert.strictEqual(gwpmZero, 0, `Expected 0 GWPM for 0s, got ${gwpmZero}`);

    // 2 minutes test: 600 chars in 120s = 120 words / 2 min = 60 WPM
    const gwpm2 = TypingEngine.calculateGrossWPM(600, 120);
    assert.strictEqual(gwpm2, 60, `Expected 60 GWPM for 2 mins, got ${gwpm2}`);
    console.log('  ✓ calculateGrossWPM passed');
}

// 2. Net WPM Tests
{
    // 250 correct chars in 60s = 50 words / 1 min = 50 WPM
    const nwpm1 = TypingEngine.calculateNetWPM(250, 60);
    assert.strictEqual(nwpm1, 50, `Expected 50 NWPM, got ${nwpm1}`);

    // 0 correct chars = 0 WPM
    const nwpmZero = TypingEngine.calculateNetWPM(0, 60);
    assert.strictEqual(nwpmZero, 0, `Expected 0 NWPM, got ${nwpmZero}`);
    console.log('  ✓ calculateNetWPM passed');
}

// 3. Exam Net WPM Tests (Penalty deduction)
{
    // 300 total chars (60 words), 5 errors in 1 min: 60 - 5 = 55 WPM
    const examWpm = TypingEngine.calculateExamNetWPM(300, 5, 60);
    assert.strictEqual(examWpm, 55, `Expected 55 Exam WPM, got ${examWpm}`);

    // More errors than words should floor to 0, not negative
    const examWpmFloor = TypingEngine.calculateExamNetWPM(50, 20, 60);
    assert.strictEqual(examWpmFloor, 0, `Expected 0 Exam WPM floor, got ${examWpmFloor}`);
    console.log('  ✓ calculateExamNetWPM passed');
}

// 4. Accuracy Tests
{
    // 90 correct out of 100 attempted = 90%
    const acc1 = TypingEngine.calculateAccuracy(90, 100);
    assert.strictEqual(acc1, 90, `Expected 90% accuracy, got ${acc1}`);

    // 0 attempted should be 100% (default clean state)
    const accEmpty = TypingEngine.calculateAccuracy(0, 0);
    assert.strictEqual(accEmpty, 100, `Expected 100% for empty test, got ${accEmpty}`);

    // Cap at 100%
    const accCapped = TypingEngine.calculateAccuracy(110, 100);
    assert.strictEqual(accCapped, 100, `Expected 100% cap, got ${accCapped}`);
    console.log('  ✓ calculateAccuracy passed');
}

// 5. Consistency Tests
{
    // Uniform timings (all 300ms) should yield high consistency (~100%)
    const uniform = [300, 300, 300, 300, 300];
    const consUniform = TypingEngine.calculateConsistency(uniform);
    assert.ok(consUniform >= 95, `Expected high consistency, got ${consUniform}`);

    // Empty or short timings return 100
    const shortTimings = [200];
    assert.strictEqual(TypingEngine.calculateConsistency(shortTimings), 100);
    console.log('  ✓ calculateConsistency passed');
}

// 6. Skill Tiers
{
    const master = TypingEngine.getSkillTier(110, 99);
    assert.strictEqual(master.level, 'master');

    const intermediate = TypingEngine.getSkillTier(45, 92);
    assert.strictEqual(intermediate.level, 'silver');

    const beginner = TypingEngine.getSkillTier(15, 80);
    assert.strictEqual(beginner.level, 'novice');
    console.log('  ✓ getSkillTier passed');
}

// 7. Error Analysis
{
    const target = 'the quick brown fox';
    const typed = 'the quik brown fix';
    const analysis = TypingEngine.analyzeTypingErrors(target, typed);
    assert.strictEqual(analysis.wordErrors, 2);
    assert.ok(analysis.topMistypedKeys.length > 0);
    assert.ok(analysis.recommendations.length > 0);
    console.log('  ✓ analyzeTypingErrors passed');
}

console.log('All TypingEngine tests passed successfully!\n');

