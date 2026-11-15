const DrugCatalog = require('../models/DrugCatalog');

// @desc    Calculate cost optimization via dose splitting
// @route   POST /api/dose/optimize
// @access  Private
const optimizeDose = async (req, res) => {
  try {
    const { genericName, requiredStrengthNum, dailyFrequency } = req.body; 
    // Example request body:
    // { "genericName": "Metformin", "requiredStrengthNum": 500, "dailyFrequency": 2 }

    // Find all catalog entries matching the generic medicine name
    const matchingDrugs = await DrugCatalog.find({ 
      genericName: { $regex: new RegExp(genericName, 'i') } 
    });

    if (!matchingDrugs || matchingDrugs.length === 0) {
      return res.status(404).json({ message: 'No medication found in catalog for optimization.' });
    }

    // Analyze options and calculate cost per mg
    const options = matchingDrugs.map(drug => {
      const strengthVal = parseInt(drug.strength); // e.g., "500mg" -> 500
      const costPerUnit = drug.pricePerPack / drug.packSize;
      const costPerMg = costPerUnit / strengthVal;

      return {
        brandName: drug.brandName,
        strength: drug.strength,
        form: drug.form,
        packSize: drug.packSize,
        pricePerPack: drug.pricePerPack,
        costPerUnit,
        costPerMg
      };
    });

    // Sort options by lowest cost per milligram (most economical)
    options.sort((a, b) => a.costPerMg - b.costPerMg);

    // Standard option matching user's exact required strength
    const standardOption = options.find(o => parseInt(o.strength) === requiredStrengthNum) || options[0];
    
    // Best split option (e.g., double strength tablet split in half)
    const bestSplitOption = options[0]; 

    // Monthly cost calculations (based on 30 days)
    const standardMonthlyCost = standardOption.costPerUnit * dailyFrequency * 30;
    
    // Ratio calculation if splitting a higher dose tablet (e.g., 500mg required / 1000mg available = 0.5 tablets per dose)
    const splitRatio = requiredStrengthNum / parseInt(bestSplitOption.strength);
    const splitMonthlyCost = bestSplitOption.costPerUnit * (dailyFrequency * splitRatio) * 30;
    
    const monthlySavings = Math.max(0, standardMonthlyCost - splitMonthlyCost);

    res.json({
      message: 'Dose optimization calculated successfully',
      standardOption,
      bestSplitOption,
      estimatedMonthlySavings: monthlySavings.toFixed(2),
      allAvailableOptions: options
    });
  } catch (error) {
    console.error('Dose Optimization Error:', error);
    res.status(500).json({ message: 'Server error during dose optimization', error: error.message });
  }
};

module.exports = { optimizeDose };