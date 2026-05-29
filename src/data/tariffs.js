// Real electricity tariff data for Indian states
// Sources: APSPDCL (AP) and KERC/HRECS (Karnataka)

export const TARIFFS = {
  AP: {
    name: "Andhra Pradesh",
    utilities: {
      APSPDCL: {
        name: "APSPDCL (Southern)",
        categories: {
          domestic: {
            name: "LT-1 Domestic",
            description: "Residential households",
            // AP uses slab-based billing
            slabs: [
              { upTo: 50,   rate: 1.45 },
              { upTo: 100,  rate: 2.60 },
              { upTo: 200,  rate: 3.76 },
              { upTo: 300,  rate: 5.06 },
              { upTo: 400,  rate: 6.11 },
              { upTo: Infinity, rate: 7.00 },
            ],
            fixedCharge: 30,      // ₹/month (approx)
            customerCharge: 55,   // ₹/month
            // FPPCA surcharge ~10% approx
            surchargePercent: 10,
          },
          commercial: {
            name: "LT-2 Commercial",
            description: "Shops, offices, commercial establishments",
            flatRate: 8.50,
            fixedCharge: 80,
          },
        },
      },
      APEPDCL: {
        name: "APEPDCL (Eastern)",
        categories: {
          domestic: {
            name: "LT-1 Domestic",
            description: "Residential households",
            slabs: [
              { upTo: 50,   rate: 1.45 },
              { upTo: 100,  rate: 2.60 },
              { upTo: 200,  rate: 3.76 },
              { upTo: 300,  rate: 5.06 },
              { upTo: 400,  rate: 6.11 },
              { upTo: Infinity, rate: 7.00 },
            ],
            fixedCharge: 30,
            customerCharge: 55,
            surchargePercent: 10,
          },
        },
      },
    },
  },

  KA: {
    name: "Karnataka",
    utilities: {
      BESCOM: {
        name: "BESCOM (Bangalore)",
        categories: {
          domestic: {
            name: "LT-1 Domestic",
            description: "Residential households",
            flatRate: 5.80,       // FY2026-27 per KERC order
            fixedCharge: 150,     // ₹/kW/month (FY2026-27)
            fixedChargeNote: "Per kW of sanctioned load",
          },
          domestic_private_edu: {
            name: "LT-2 Private Schools/Hospitals",
            description: "Private educational & medical institutions",
            flatRate: 6.55,
            fixedCharge: 195,
          },
          commercial: {
            name: "LT-3 Commercial",
            description: "Shops, hotels, offices",
            flatRate: 6.80,
            fixedCharge: 215,
          },
          industrial: {
            name: "LT-5 Industrial",
            description: "Industrial & manufacturing",
            flatRate: 4.40,
            fixedCharge: 150,
          },
        },
      },
      HESCOM: {
        name: "HESCOM (Hubli)",
        categories: {
          domestic: {
            name: "LT-1 Domestic",
            flatRate: 5.80,
            fixedCharge: 150,
          },
        },
      },
      HRECS: {
        name: "HRECS (Hukeri Rural)",
        categories: {
          domestic: {
            name: "LT-1 Domestic",
            description: "Residential households — FY2026-27",
            flatRate: 5.80,      // 580 paise per KERC order 2025
            fixedCharge: 150,    // ₹150/kW/month FY2026-27
          },
          private_edu: {
            name: "LT-2 Private Edu/Hospitals",
            flatRate: 6.55,
            fixedCharge: 195,
          },
          commercial: {
            name: "LT-3 Commercial",
            flatRate: 6.80,
            fixedCharge: 215,
          },
        },
      },
    },
  },

  MH: {
    name: "Maharashtra",
    utilities: {
      MSEDCL: {
        name: "MSEDCL",
        categories: {
          domestic: {
            name: "Residential",
            slabs: [
              { upTo: 100,  rate: 3.07 },
              { upTo: 300,  rate: 7.51 },
              { upTo: 500,  rate: 10.05 },
              { upTo: Infinity, rate: 11.69 },
            ],
            fixedCharge: 95,
          },
        },
      },
    },
  },

  TN: {
    name: "Tamil Nadu",
    utilities: {
      TANGEDCO: {
        name: "TANGEDCO",
        categories: {
          domestic: {
            name: "LT-1 Domestic",
            slabs: [
              { upTo: 100,  rate: 0 },    // free up to 100 units
              { upTo: 200,  rate: 1.50 },
              { upTo: 400,  rate: 3.00 },
              { upTo: 500,  rate: 4.50 },
              { upTo: Infinity, rate: 6.00 },
            ],
            fixedCharge: 45,
          },
        },
      },
    },
  },

  TS: {
    name: "Telangana",
    utilities: {
      TSSPDCL: {
        name: "TSSPDCL (Southern)",
        categories: {
          domestic: {
            name: "LT-1 Domestic",
            slabs: [
              { upTo: 50,   rate: 1.45 },
              { upTo: 100,  rate: 2.60 },
              { upTo: 200,  rate: 3.76 },
              { upTo: 300,  rate: 5.70 },
              { upTo: Infinity, rate: 7.00 },
            ],
            fixedCharge: 45,
          },
        },
      },
    },
  },
};

// Calculate bill using slab-based tariff
export function calculateSlabBill(units, slabs, fixedCharge = 0, surchargePercent = 0) {
  let energyCost = 0;
  let remaining  = units;
  let prevUpTo   = 0;

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const slabUnits = Math.min(remaining, slab.upTo - prevUpTo);
    energyCost += slabUnits * slab.rate;
    remaining  -= slabUnits;
    prevUpTo    = slab.upTo;
  }

  const surcharge = (energyCost * surchargePercent) / 100;
  const total     = energyCost + surcharge + fixedCharge;
  const effectiveRate = units > 0 ? total / units : 0;

  return { energyCost, surcharge, fixedCharge, total, effectiveRate };
}

// Get effective rate for a given state/utility/category and units
export function getEffectiveRate(stateCode, utilityCode, categoryCode, units = 200) {
  const state    = TARIFFS[stateCode];
  if (!state) return 7.38;
  const utility  = state.utilities[utilityCode];
  if (!utility) return 7.38;
  const category = utility.categories[categoryCode];
  if (!category) return 7.38;

  if (category.flatRate) return category.flatRate;

  if (category.slabs) {
    const { effectiveRate } = calculateSlabBill(
      units, category.slabs,
      category.fixedCharge || 0,
      category.surchargePercent || 0
    );
    return +effectiveRate.toFixed(2);
  }

  return 7.38;
}

// Flat list of states for dropdowns
export const STATE_OPTIONS = Object.entries(TARIFFS).map(([code, s]) => ({
  code, name: s.name,
}));

export function getUtilityOptions(stateCode) {
  const state = TARIFFS[stateCode];
  if (!state) return [];
  return Object.entries(state.utilities).map(([code, u]) => ({ code, name: u.name }));
}

export function getCategoryOptions(stateCode, utilityCode) {
  const state = TARIFFS[stateCode];
  if (!state) return [];
  const utility = state.utilities[utilityCode];
  if (!utility) return [];
  return Object.entries(utility.categories).map(([code, c]) => ({ code, name: c.name, description: c.description }));
}
