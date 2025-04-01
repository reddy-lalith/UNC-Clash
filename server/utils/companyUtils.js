const Company = require('../models/Company');

// Add custom logo URL mappings for companies without websites
const CUSTOM_LOGOS = {
  'First Frontier Ventures': 'https://media.licdn.com/dms/image/v2/D560BAQFXeeMAHmqk1Q/company-logo_200_200/company-logo_200_200/0/1713578193792?e=1748476800&v=beta&t=IsltWC3wdUgDUPdyxWK396pxDwYo7VorKFrSCwX2E1g',
  '919 Hype Drip LLC': 'https://media.licdn.com/dms/image/v2/D4D0BAQGeg7pS_TP7bw/company-logo_200_200/company-logo_200_200/0/1682566154325?e=1749081600&v=beta&t=rhPVDlTLizcvHoYi7jo9_0s61TzSS-_x5oDJ5pXxmkQ',
  'EY': "https://media.licdn.com/dms/image/v2/C510BAQGpRhkpxp5A9A/company-logo_100_100/company-logo_100_100/0/1630570672166/ernstandyoung_logo?e=1749081600&v=beta&t=XmOrujZKPHAHDmSMX8rrYmqEOQWkJI-GXin_QtmjtrI",
  'QuiVive Global Advisory LLC' : "https://media.licdn.com/dms/image/v2/C4D0BAQGTTz2oeliVFg/company-logo_200_200/company-logo_200_200/0/1630562081752?e=1749081600&v=beta&t=Qoq0b_360kw5bg99u-6v6e3MRyTmT1fq2OQSAr4_2Jc",
  'J.P. Morgan' : "https://cdn.brandfetch.io/jpmorgan.com/fallback/lettermark/theme/dark/h/256/w/256/icon?c=1bfwsmEH20zzEfSNTed",
  'Q-munity (acquired by The Quantum Insider)' : "https://media.licdn.com/dms/image/v2/D4E0BAQGzamMbTy6f_g/company-logo_200_200/company-logo_200_200/0/1714762029807/q_munity_logo?e=1749081600&v=beta&t=8umpsbSzrbiiUQbomhocrOUmgO_-aBJ7CEN8kH1UDVg",
  'Night Owl Capital Management LLC' : 'https://media.licdn.com/dms/image/v2/D560BAQGKpRWQd9es6g/company-logo_100_100/company-logo_100_100/0/1725385476870/night_owl_capital_management_llc_logo?e=1749081600&v=beta&t=jmk3kpKlrWn0I8tljZW7B_SGWjv4gWddW_VR0Zky7Z0',
  'White Oak Partners LLC' : 'https://media.licdn.com/dms/image/v2/D4E0BAQElfS-ckttahQ/company-logo_200_200/company-logo_200_200/0/1725545874154/white_oak_partners_logo?e=2147483647&v=beta&t=XUb24-6Pv-_Y8DIaL8WE_UMyKJuGKMTMDZpiZYeoueM',
  'Wrap Golf' : 'https://media.licdn.com/dms/image/v2/D4E0BAQHTYVpqd4QnOw/company-logo_200_200/company-logo_200_200/0/1711328992189?e=1749081600&v=beta&t=SthbXrFGhMCCD6aicLtAcNKg7IwFWIO3PlHgXp0GcVU',
  'UNC Management Company' : 'https://media.licdn.com/dms/image/v2/C560BAQGjN979lbcubw/company-logo_200_200/company-logo_200_200/0/1631343737562?e=1749081600&v=beta&t=wFgLjxeqX2ECfKm5X_PQcQ0tP3MivKyTWMJhzqOyMhc',
  'The Forge Initiative' : 'https://media.licdn.com/dms/image/v2/C4D0BAQHGllQ-vMS1ng/company-logo_200_200/company-logo_200_200/0/1631344860164?e=2147483647&v=beta&t=EyPGNx4c_GOVuUl4hkPVTkK0T6kSoAXVMeTYvZgLpug',
  'Carolina Financial Group LLC' : 'https://media.licdn.com/dms/image/v2/C510BAQE76IxfHFjaSA/company-logo_200_200/company-logo_200_200/0/1631390737487?e=2147483647&v=beta&t=rD_SO4TawETPyyGxu2Qi0rZ0O3JDVcy8eOpJOBLA6ZA',
  'Carolina Women in Business (Undergraduate)' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6sVHrp7RJTDzx55wtQc6asVbJchfrg0dX3A&s',
  'Covey Capital Advisors, LLC' : 'https://images.crunchbase.com/image/upload/c_pad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_2/v1478495467/eegcjwloznrdax40fb5i.png'

};

// Only add companies that need custom domain mapping
const COMPANY_DOMAINS = {
  'Alphabet': 'google.com',
  'Meta': 'facebook.com',
  'X': 'twitter.com',
  'Bank of America': 'bankofamerica.com',
  'Jane Street': 'janestreet.com',
  'First Frontier Ventures': 'firstfrontier.com',
  'DoubleJack Growth Partners': 'doublejackgrowth.com',
  'PNC': 'pnc.com',
  'Flow Traders': 'flowtraders.com',
  'Lenovo': 'lenovo.com',
  'Velocity Labs': 'velocitync.com',
  'Baird': 'rwbaird.com',
  'Janus Henderson Investors' : 'janushenderson.com',
  'Windage Partners' : 'windage.com',
  '37th & Moss' : '37thandmoss.com',
  'Warren Equity Partners' : 'warrenequity.com',
  'Khazanah Nasional Berhad' : 'khazanah.com',
  'Ares Management Corporation' : 'aresmgmt.com',
  'Horizon Development Properties, Inc.' : 'hdpclt.com',
  'Meritage Partners' : 'meritage-partners.com',
  'Draper Asset Management' : 'draperasset.com',
  'RBC Capital Markets' : 'rbc.com',





 
  // Add more only when the default approach doesn't work
};

async function getOrCreateCompany(companyName, forceRefresh = false) {
  try {
    let company = await Company.findOne({
      $or: [
        { name: companyName },
        { aliases: companyName }
      ]
    });

    // Generate logo URL (use custom logo if available)
    const customLogo = CUSTOM_LOGOS[companyName];
    const domain = COMPANY_DOMAINS[companyName] ||
      companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '') + '.com';

    const logoUrl = customLogo || `https://img.logo.dev/${domain}?token=pk_a--SFGmkQ-qcVEuPVoGL2A&format=png`;

    if (!company) {
      console.log(`Creating new company: ${companyName}`);
      console.log(`Generated Logo URL: ${logoUrl}`);

      company = new Company({
        name: companyName,
        logoUrl,
        domain: COMPANY_DOMAINS[companyName] || '',
        aliases: []
      });

      await company.save();
    } else if (forceRefresh) {
      console.log(`Force refreshing logo for ${companyName} to ${logoUrl}`);
      company.logoUrl = logoUrl;
      await company.save();
    } else {
      console.log('Found existing company:', {
        name: company.name,
        logoUrl: company.logoUrl
      });
    }

    return company;
  } catch (error) {
    console.error(`Error handling company ${companyName}:`, error);
    return null;
  }
}

module.exports = { getOrCreateCompany };
