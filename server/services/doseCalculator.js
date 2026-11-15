/**
 * Dose Splitting Calculation & Safety Engine
 */
const DrugCatalog = require('../models/DrugCatalog');

async function calculateDoseSplitOptions(prescribedBrand, prescribedMg, dailyFrequency) {
  // 1. Find prescribed drug details
  const targetDrug = await DrugCatalog.findOne({ brandName: new RegExp(prescribedBrand, 'i'), strengthMg: prescribedMg });
  
  if (!targetDrug) {
    return { success: false, message: "Drug not found in database catalog." };
  }

  // 2. SAFETY GUARDRAIL: Check if form allows splitting
  if (targetDrug.dosageForm !== 'TABLET' || targetDrug.isExtendedRelease) {
    return {
      canSplit: false,
      reason: "SAFETY WARNING: Extended-release, capsule, or coated drugs cannot be safely split."
    };
  }

  // 3. Search for higher-dose versions of the SAME active ingredient
  const higherDoseOptions = await DrugCatalog.find({
    activeIngredient: targetDrug.activeIngredient,
    strengthMg: { $gt: prescribedMg },
    dosageForm: 'TABLET',
    isExtendedRelease: false,
    isScored: true
  });

  if (higherDoseOptions.length === 0) {
    return {
      canSplit: false,
      reason: "No scored, higher-dosage alternatives available for splitting."
    };
  }

  // 4. Calculate pricing & savings options
  const currentCostPerMg = targetDrug.pricePerPack / (targetDrug.packSize * targetDrug.strengthMg);
  const currentMonthlyExpense = (targetDrug.pricePerPack / targetDrug.packSize) * dailyFrequency * 30;

  const recommendations = higherDoseOptions.map(altDrug => {
    const splitRatio = altDrug.strengthMg / prescribedMg; // e.g., 10mg / 5mg = 2 (half tablet daily)
    const dailyPillCount = dailyFrequency / splitRatio;
    const monthlyPillsNeeded = dailyPillCount * 30;
    const monthlyCost = (altDrug.pricePerPack / altDrug.packSize) * monthlyPillsNeeded;
    const monthlySavings = currentMonthlyExpense - monthlyCost;

    return {
      recommendedBrand: altDrug.brandName,
      recommendedStrength: `${altDrug.strengthMg} mg`,
      instruction: `Take 1/${splitRatio} tablet daily`,
      currentMonthlyExpense: currentMonthlyExpense.toFixed(2),
      newMonthlyCost: monthlyCost.toFixed(2),
      monthlySavings: monthlySavings.toFixed(2),
      savingsPercentage: ((monthlySavings / currentMonthlyExpense) * 100).toFixed(1) + "%"
    };
  });

  return {
    canSplit: true,
    prescribed: `${prescribedBrand} ${prescribedMg}mg`,
    recommendations
  };
}

module.exports = { calculateDoseSplitOptions };