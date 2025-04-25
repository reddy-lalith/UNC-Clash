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
  'Covey Capital Advisors, LLC' : 'https://images.crunchbase.com/image/upload/c_pad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_2/v1478495467/eegcjwloznrdax40fb5i.png', 
  'UNC Department of Computer Science' : 'https://media.licdn.com/dms/image/v2/D560BAQF12FyuHiwRCw/company-logo_100_100/company-logo_100_100/0/1692226029527/unc_department_of_computer_science_logo?e=1749081600&v=beta&t=_TRQR9T6V4EYgvH-qRHxXzlgykzhyJ7YNc0qCkTpshw',
  'UNC Reynolds Investment Fund' : 'https://media.licdn.com/dms/image/v2/C4D0BAQH1BbavaqZIhA/company-logo_200_200/company-logo_200_200/0/1630532182903?e=1749081600&v=beta&t=HVx3OqcPa2m1KR0c4m60Xk9jV8QIvMMeOntE8bGQj8c',
  'University of North Carolina at Chapel Hill' : 'https://media.licdn.com/dms/image/v2/D560BAQF12FyuHiwRCw/company-logo_100_100/company-logo_100_100/0/1692226029527/unc_department_of_computer_science_logo?e=1749081600&v=beta&t=_TRQR9T6V4EYgvH-qRHxXzlgykzhyJ7YNc0qCkTpshw',
  'AstraCell, LLC.' : 'https://media.licdn.com/dms/image/v2/C560BAQEZk_JO2dqfTw/company-logo_200_200/company-logo_200_200/0/1659322441077/astra_cell_inc_logo?e=1749081600&v=beta&t=PoFtO9INT6jFVn_pGmTe3YnwmyzOnVnTDBjCqkMM6x4',
  'Trackhawk Advisors' : 'https://media.licdn.com/dms/image/v2/D560BAQH42qUTShjwuQ/company-logo_200_200/company-logo_200_200/0/1701953243109?e=1749081600&v=beta&t=PhpMqBsVs7_27addi2dK5B4FFdTEz3QTvkz6BrP31gw',
  'Hyannis Harbor Hawks' : 'https://media.licdn.com/dms/image/v2/D560BAQGK0rlX4GuIyw/company-logo_100_100/company-logo_100_100/0/1707862341147/hyannis_harbor_hawks_logo?e=1749081600&v=beta&t=ruwKqXF2reGg40MQ3sZUIG6Je0r-ZYzNvlzqp5efxl0',
  'Bank of America Merrill Lynch' : 'https://media.licdn.com/dms/image/v2/C560BAQEwSq6HbLmEdQ/company-logo_200_200/company-logo_200_200/0/1631390069758?e=1749081600&v=beta&t=KIWJU_u8oSW0mVEVioTQKONpkVuuLqvascbEwA4xj04',
  'UNC Department of Psychology & Neuroscience' : 'https://media.licdn.com/dms/image/v2/C4D0BAQEjNLREcUcetg/company-logo_100_100/company-logo_100_100/0/1630532748907?e=1749081600&v=beta&t=Sk8UJwB72TdrsEX6nF_JAZmBLaSs48vQWmIow6AZvDY',
  'Boeing' : "https://media.licdn.com/dms/image/v2/D560BAQG8NhuAoYdTgw/company-logo_100_100/company-logo_100_100/0/1708109812925/boeing_logo?e=1749081600&v=beta&t=T_CVr8ycQujBypRmnofgU-ymg7TIuWA7VBt8gEE-V_Q",
  'Sciome LLC' : 'https://media.licdn.com/dms/image/v2/C4D0BAQFnvmrw4iLmHw/company-logo_200_200/company-logo_200_200/0/1630559525491?e=2147483647&v=beta&t=DTW_L72VR6d1bMFnJPH9tSNg7ZjultIL1GGu0CYvAjc',
  'U.S. Department of Commerce' : 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Seal_of_the_United_States_Department_of_Commerce.svg/1200px-Seal_of_the_United_States_Department_of_Commerce.svg.png',
  'UNC Kenan-Flagler Private Equity Fund' : 'https://media.licdn.com/dms/image/v2/C4E0BAQEwCMa57y7wVQ/company-logo_200_200/company-logo_200_200/0/1631368642817/unc_kenan_flagler_private_equity_fund_logo?e=1749081600&v=beta&t=ewnjcOXtE4xIrDk8T36r3M0gHHgPKVoaGcJNTBRIK0c',
  'Prince Henry Group Charitable Foundation' : 'https://scontent-ord5-2.xx.fbcdn.net/v/t39.30808-6/456331834_820520993605150_1901763761332649260_n.png?_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=hKCacIzZRPsQ7kNvgFq1Ta9&_nc_oc=AdkwkDJrOPMwmCws1W7g3-hNtOck06YkBrNsILIxfdcW4CwQgFZSJv81qwwg-_d3aheMIh7-Pi71-2xMNv3kD90m&_nc_zt=23&_nc_ht=scontent-ord5-2.xx&_nc_gid=SOtluDb5KZFzQRgmH7LDDA&oh=00_AYG_H7atSd-CgvYgiW9c3JR6q0yRUXd-EYgyizhQRhTNKw&oe=67F233CC',
  'SPARKS Consulting Group' : 'https://media.licdn.com/dms/image/v2/C4E0BAQGRKhVx8pQvWw/company-logo_200_200/company-logo_200_200/0/1630569025949/sparks_consulting_group_logo?e=1749081600&v=beta&t=762GkDn8HuF1IloUwa4HuVIzaCvLug17xEpIT-qcogo',
  'Alpha Delta Pi Sorority' : 'https://media.licdn.com/dms/image/v2/C4E0BAQFCKD0CPafYTg/company-logo_100_100/company-logo_100_100/0/1630585302292/alpha_delta_pi_sorority_logo?e=1749081600&v=beta&t=6N7Eh9z4M2H3Sh9CamSoO4qk0eizVz9OeCB-NqZDAJI',
  'JPMorgan Chase & Co.' : "https://cdn.brandfetch.io/jpmorgan.com/fallback/lettermark/theme/dark/h/256/w/256/icon?c=1bfwsmEH20zzEfSNTed",
  'BlueBridge Partners' : 'https://media.licdn.com/dms/image/v2/D4E0BAQEWMppTT5apog/company-logo_200_200/company-logo_200_200/0/1718815256921/blue_bridge_partners_logo?e=2147483647&v=beta&t=el-lpI6AE6wX5wkhD6GhTA1Uhnfgrl8ttBsRlSbSaBw',
  'Bain & Company' : 'https://media.licdn.com/dms/image/v2/D560BAQHJWWQNCmnqKg/company-logo_200_200/company-logo_200_200/0/1719929153717/bain_and_company_logo?e=2147483647&v=beta&t=SsRnq02_o84L596o2Zfe__HMztOci3WjNflOTvm0Ewo',
  'Voicera AI' : 'https://media.licdn.com/dms/image/v2/D4D0BAQGYg4IyLohhcg/company-logo_100_100/company-logo_100_100/0/1736985125633/voiceraai_logo?e=1749081600&v=beta&t=H0kFY_fkewZJktBrwYtbKdngTOT06II7QJjgSe9sI9s',
  'McKinsey & Company' : 'https://avatars.githubusercontent.com/u/4265350?s=280&v=4',
  'MTN Capital Partners LLC' : 'https://media.licdn.com/dms/image/v2/C4E0BAQHTwCfITl9phw/company-logo_100_100/company-logo_100_100/0/1630598736555/mtn_capital_partners_llc_logo?e=1749081600&v=beta&t=uu2e0ODVeoijcNwPNjP-KuBGjoIZw5dgEueSZz3FeQw',
  'JPMorganChase.' : "https://cdn.brandfetch.io/jpmorgan.com/fallback/lettermark/theme/dark/h/256/w/256/icon?c=1bfwsmEH20zzEfSNTed",
  'Boston Consulting Group (BCG)' : 'https://media.licdn.com/dms/image/v2/D4E0BAQE_RmtwzBSpAg/company-logo_100_100/company-logo_100_100/0/1702568604682/boston_consulting_group_logo?e=1749081600&v=beta&t=9JlgkQV7t7ORMLUPJDhaf0q2hHDRLe44ZhDqUBVwxqg',
  'Morgan Creek Capital Management, LLC' : 'https://media.licdn.com/dms/image/v2/C560BAQHN55vz7tjrfA/company-logo_200_200/company-logo_200_200/0/1631350068324?e=1749081600&v=beta&t=XU3tTyBlHrkRUlkzQoLOL8KOqfCW_-LtQ2z1soD4_kI'




  
  
  

};

// Only add companies that need custom domain mapping
const COMPANY_DOMAINS = {
  'Alphabet': 'google.com',
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
  'Davidson Capital Advisors' : 'davcapadvisors.com',
  'The Bloom Organization' : 'bloomllc.com',
  'Nuveen, a TIAA company' : 'nuveen.com',
  'Renovo Capital, LLC' : 'renovocapital.com',
  'Truist Wealth' : 'truist.com',
  'Amazon Web Services (AWS)' : 'aws.amazon.com', 
  'Hale Partnership Capital Management, LLC.' : "halepartnership.com",
  'Dragonfly Capital Partners, LLC' : "dragonflycapital.com",
  'MTN Capital Partners LLC' : 'https://media.licdn.com/dms/image/v2/C4E0BAQHTwCfITl9phw/company-logo_200_200/company-logo_200_200/0/1630598736555/mtn_capital_partners_llc_logo?e=1749081600&v=beta&t=nEJVx-Mq3GR2ckZfVZxWaSy2jzd8moupa7_i0qZ7PbQ'
  




 
  // Add more only when the default approach doesn't works
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
