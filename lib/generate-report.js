const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageBreak, LevelFormat, Footer
} = require('docx');
const fs = require('fs');

const FULL_REPORT_CONTENT = {
  ico_gdpr: {
    obligations: [
      {
        title: "Establish a lawful basis for processing (Article 6)",
        plain: "Before your AI system can use people's personal data, you need a documented legal reason for doing so. For most businesses this will be 'legitimate interests', essentially that you have a genuine business reason that doesn't override people's rights. You need to write this down before you deploy.",
        detail: "Before processing any personal data you must identify and document a lawful basis. For most commercial AI deployments this will be legitimate interests (Article 6(1)(f)) or contract performance (Article 6(1)(b)). Consent is rarely appropriate as the sole basis for AI systems due to the difficulty of making it freely given and withdrawable. Document your chosen basis in your Record of Processing Activities (ROPA).",
        citation: "UK GDPR Article 6(1); ICO Guidance on Lawful Basis"
      },
      {
        title: "Conduct a Data Protection Impact Assessment (Article 35)",
        plain: "A DPIA is a written risk assessment that you must complete before deploying your AI system. It is not optional, it is a legal requirement for AI systems that make decisions about people. It does not need to be long, but it does need to be done and kept on file.",
        detail: "A DPIA is mandatory where processing is likely to result in high risk to individuals. AI systems that make automated decisions about individuals, process special category data at scale, or systematically monitor individuals must have a DPIA completed before deployment. The DPIA must identify risks, assess their severity and likelihood, and document the measures taken to mitigate them.",
        citation: "UK GDPR Article 35(1); ICO DPIA Guidance, Section 3"
      },
      {
        title: "Tell people what your AI system does with their data (Articles 13-14)",
        plain: "Your privacy notice needs to specifically mention that you use AI, what it does, and that it may make decisions about them. Most privacy notices written before 2022 don't cover this adequately. This is one of the most commonly missed obligations and one of the easiest to fix.",
        detail: "Individuals must be informed that their data is being processed by an AI system, the purposes and legal basis, any automated decision-making taking place, and their rights. This information must be provided at the point of data collection in clear, plain language.",
        citation: "UK GDPR Articles 13-14; ICO Transparency Guidance"
      },
      {
        title: "Give people the right to challenge AI decisions (Article 22)",
        plain: "If your AI makes decisions that significantly affect people, approving or rejecting a loan, flagging someone for review, determining what they can access, those people have the right to ask a human to review the decision. You need a process for handling these requests. Most businesses don't have one.",
        detail: "If your AI system makes solely automated decisions that produce legal or similarly significant effects on individuals, you must provide a mechanism for human review, allow individuals to express their point of view, allow them to contest the decision, and explain how the decision was reached.",
        citation: "UK GDPR Article 22(1)(3); ICO Guidance on AI and Data Protection, Section 2.1"
      },
      {
        title: "Appoint a Data Protection Officer if required (Article 37)",
        plain: "If your AI system processes sensitive data at scale, or monitors individuals systematically, you may be legally required to appoint a Data Protection Officer. If you need one and don't have one, this is a significant gap.",
        detail: "A DPO is mandatory for public authorities, organisations that carry out large-scale systematic monitoring of individuals, or organisations that process special category data on a large scale.",
        citation: "UK GDPR Article 37(1); ICO DPO Guidance"
      }
    ],
    consequences: {
      heading: "What happens if you don't address this",
      points: [
        "The ICO can issue fines of up to £17.5 million or 4% of global annual turnover, whichever is higher. In practice, fines for AI-related breaches are increasing year on year.",
        "The ICO has specific enforcement powers around automated decision-making and has used them. Investigations are triggered by individual complaints, data breaches, or proactive audits.",
        "A data breach involving an AI system that was not properly documented, no DPIA, no lawful basis, no transparency notice, significantly increases the likelihood of regulatory action and the size of any fine.",
        "Reputational damage from an ICO investigation or enforcement notice is often more damaging than the fine itself, particularly for businesses that rely on customer trust."
      ]
    },
    actions: [
      "Complete a Data Protection Impact Assessment before deploying the AI system. The ICO has a free template on its website.",
      "Update your privacy notice to specifically mention the AI system and how individuals can exercise their rights.",
      "Document your lawful basis for processing in writing.",
      "Create a process for individuals to request human review of automated decisions.",
      "Map all personal data flows into and out of the AI system and record them in a Register of Processing Activities."
    ]
  },

  fca: {
    obligations: [
      {
        title: "Deliver genuinely good outcomes for customers (Consumer Duty)",
        plain: "The FCA's Consumer Duty is a higher standard than what came before. It is not enough to avoid the worst harms, you must actively work to deliver good outcomes. For AI systems this means you cannot deploy a model and forget about it. You need to check whether it is actually producing fair, helpful results for customers on an ongoing basis.",
        detail: "Consumer Duty requires firms to deliver good outcomes across four areas: products and services; price and value; consumer understanding; and consumer support. Your AI system must be designed and operated to achieve these outcomes.",
        citation: "FCA PS22/9, PRIN 2A.2; Consumer Duty Final Rules"
      },
      {
        title: "Prevent foreseeable harm (PRIN 2A.2.2)",
        plain: "You are responsible for harm your AI system causes even if you did not intend it. If it was reasonably predictable that the model might produce unfair outcomes for certain customers, and you did not take steps to prevent it, the FCA will hold you accountable.",
        detail: "Firms must take reasonable steps to avoid causing foreseeable harm to retail customers. For AI systems this means conducting pre-deployment testing for bias and adverse outcomes, monitoring in-production performance, and having a documented process for remediating harm.",
        citation: "FCA PS22/9, PRIN 2A.2.2; Consumer Duty Guidance, para 4.7"
      },
      {
        title: "Manage model risk properly (DP5/22)",
        plain: "The FCA expects you to treat your AI model like any other significant business risk. This means documenting how it was built, testing it properly before go-live, monitoring its performance afterwards, and having a process for making changes safely. This is one of the most common gaps the FCA finds in SME financial services firms.",
        detail: "FCA expects firms to have a documented model risk management framework covering model development and validation; model approval governance; ongoing monitoring; model change management; and model inventory.",
        citation: "FCA DP5/22, Section 3.2; FCA Model Risk Management Principles"
      },
      {
        title: "Ensure your AI does not discriminate in credit decisions",
        plain: "If your AI affects whether someone gets credit, at what price, or on what terms, you must be able to show it does not produce unfair outcomes based on protected characteristics. This applies even if you did not intend the model to discriminate, if the outcomes are discriminatory, that is sufficient.",
        detail: "Credit decisioning AI must not produce outcomes that discriminate against customers on the basis of protected characteristics. You must demonstrate the model has been tested for discriminatory outcomes and that protected characteristics are not used as direct inputs or proxied through correlated variables.",
        citation: "FCA PS22/9; Equality Act 2010 s.29; FCA Guidance on Fair Treatment"
      },
      {
        title: "Document everything and assign senior accountability",
        plain: "The FCA can ask to see your documentation at any time. A named Senior Manager must be able to explain how your AI works and what controls are in place. 'We didn't have anyone responsible' is not an acceptable answer.",
        detail: "FCA supervision may require documentation of how your AI system works, how it was validated, what monitoring is in place, and how consumer outcomes are assessed. Senior management must be accountable under SMCR.",
        citation: "FCA SYSC 9.1; Senior Managers and Certification Regime (SMCR)"
      }
    ],
    consequences: {
      heading: "What happens if you don't address this",
      points: [
        "The FCA has significantly increased its focus on AI in financial services. Consumer Duty enforcement is active, the FCA has stated it will take action against firms that cannot demonstrate good consumer outcomes.",
        "For credit decisioning specifically, a regulatory review that finds discriminatory outcomes can result in requirements to remediate affected customers, with significant cost and reputational consequences.",
        "Senior Managers can be held personally accountable under SMCR. Individual enforcement action against named executives is a real risk where AI governance failures are found.",
        "Loss of FCA authorisation is the most severe outcome, but in practice the FCA more commonly requires remediation, imposes requirements, or publishes findings, all of which carry serious reputational damage."
      ]
    },
    actions: [
      "Conduct a Consumer Duty gap analysis for your AI system across all four Consumer Duty pillars.",
      "Document your model risk management approach before the next supervisory review.",
      "Commission an independent bias audit before go-live and annually thereafter.",
      "Establish ongoing monitoring of model performance with defined thresholds that trigger review.",
      "Map accountability for the AI system to a named Senior Manager under SMCR."
    ]
  },

  cma: {
    obligations: [
      {
        title: "Do not mislead consumers through AI-generated content",
        plain: "If your AI generates recommendations, rankings, or content that consumers see, you cannot present it in a way that is misleading. Consumers must not be given a false impression about why they are seeing certain products, prices, or recommendations.",
        detail: "Your AI system must not create false impressions about products, services, prices, or the nature of recommendations. AI-generated content that appears independent or objective must not conceal its AI origin or commercial basis.",
        citation: "Consumer Protection from Unfair Trading Regulations 2008, Regulation 5; CMA AI Foundation Models Review, Chapter 5"
      },
      {
        title: "Be transparent about how AI influences what consumers see",
        plain: "If AI is deciding what products, prices, or content a consumer sees, you need to be upfront about that when it would matter to their decision. The CMA is actively investigating this area.",
        detail: "Where AI influences what products, services, or content consumers see, the basis for that influence must be disclosed where it would be material to the consumer's decision.",
        citation: "Digital Markets, Competition and Consumers Act 2024, Part 4; CMA Consumer Protection Guidance"
      },
      {
        title: "Ensure AI-driven pricing is fair and transparent",
        plain: "Dynamic pricing powered by AI is legal, but it must not mislead consumers about what they will pay. You cannot use AI to exploit vulnerable consumers or hide the true cost through drip pricing.",
        detail: "AI-driven dynamic pricing must not constitute unfair commercial practice. Prices must be displayed clearly and consumers must not be misled. Drip pricing tactics facilitated by AI systems are prohibited.",
        citation: "DMCC Act 2024, s.230; CPRs 2008, Regulation 6"
      }
    ],
    consequences: {
      heading: "What happens if you don't address this",
      points: [
        "The CMA has broad enforcement powers under the Digital Markets, Competition and Consumers Act 2024, including the ability to impose fines of up to 10% of global turnover for breaches of consumer protection law.",
        "The CMA has identified AI in consumer markets as a priority area and has active investigations underway. Consumer-facing AI businesses are in scope.",
        "Individual consumers can bring private claims for damages under unfair commercial practices legislation. A pattern of misleading AI-generated recommendations could generate significant class action exposure.",
        "Adverse CMA findings are published and widely reported, creating reputational damage that can be disproportionate to the size of the business."
      ]
    },
    actions: [
      "Review all consumer-facing AI outputs to ensure they do not create false impressions.",
      "Audit personalisation and recommendation algorithms for unfair commercial practices.",
      "Add clear disclosure where AI generates or significantly influences content presented to consumers.",
      "Review AI-driven dynamic pricing against DMCC Act 2024 requirements.",
      "Monitor CMA guidance on AI, enforcement activity in this area is increasing."
    ]
  },

  mhra: {
    obligations: [
      {
        title: "Determine whether your software is a medical device",
        plain: "This is the most important question you need to answer, and you need a regulatory specialist to help you do it. If your software is intended to diagnose, monitor, treat, or predict health conditions for individual patients, it is likely a medical device. Getting this wrong is a criminal offence.",
        detail: "Software intended by the manufacturer for a medical purpose for individual patients may qualify as a medical device under the Medical Devices Regulations 2002. MHRA's guidance provides a qualification decision tool.",
        citation: "Medical Devices Regulations 2002 (SI 2002/618), Regulation 2(1); MHRA Guidance, Chapter 3"
      },
      {
        title: "Register with MHRA before going to market",
        plain: "If your software is a medical device, you must register it with the MHRA before you make it available to anyone, including in a pilot or beta test with real patients. There is no grace period. Placing an unregistered medical device on the market is a criminal offence.",
        detail: "If the software qualifies as a medical device, it must be registered with the MHRA before being placed on the UK market. This applies from the point the software is made available for use.",
        citation: "Medical Devices Regulations 2002, Regulation 27; MHRA Guidance on Registration"
      },
      {
        title: "Implement clinical risk management (DCB0129)",
        plain: "Health software used in clinical settings must follow a specific clinical risk management standard called DCB0129. This requires you to identify what could go wrong, assess the risk, put controls in place, and appoint a Clinical Safety Officer.",
        detail: "Health software that may be used in clinical settings must implement a clinical risk management system in accordance with DCB0129. A Clinical Safety Officer must be appointed.",
        citation: "MHRA DCB0129, Section 4.1; NHS Digital Clinical Safety Guidance"
      },
      {
        title: "Complete conformity assessment and apply UKCA marking",
        plain: "Medical devices need a formal conformity assessment before they can be sold in the UK. Lower risk devices can self-certify; higher risk devices need an independent Approved Body. This takes time and money, budget for it early.",
        detail: "Medical devices placed on the UK market must undergo conformity assessment appropriate to their risk classification and bear the UKCA mark. Class IIa and above requires an Approved Body.",
        citation: "Medical Devices Regulations 2002, Regulation 7; MHRA UKCA Marking Guidance"
      }
    ],
    consequences: {
      heading: "What happens if you don't address this",
      points: [
        "Placing an unregistered medical device on the UK market is a criminal offence under the Medical Devices Regulations 2002. This applies to individuals as well as the company, directors can face personal prosecution.",
        "The MHRA has powers to issue Field Safety Notices, require device recalls, and suspend or revoke market authorisation. A recall of a software product affecting patient safety generates serious regulatory and reputational consequences.",
        "NHS and other healthcare procurement increasingly requires documented evidence of MHRA registration and clinical safety compliance. Without it, you will be excluded from significant market opportunities regardless of regulatory enforcement.",
        "Personal injury claims from patients harmed by unregistered medical software carry significant financial exposure, and the absence of required regulatory approval would be highly relevant in any litigation."
      ]
    },
    actions: [
      "Use MHRA's free qualification decision tool to formally determine whether your software is a medical device. Document the outcome.",
      "If it qualifies: do not make it available to users until MHRA registration is complete. Engage a regulatory affairs specialist immediately.",
      "Appoint a Clinical Safety Officer and initiate a DCB0129-compliant clinical risk management process.",
      "Engage an Approved Body early if your device is Class IIa or above, the process can take 6 to 18 months.",
      "Do not treat a pilot or beta test as outside the regulations, the rules apply from the point the software is used with real patients."
    ]
  },

  ehrc: {
    obligations: [
      {
        title: "Prevent indirect discrimination through AI outputs (Equality Act s.19)",
        plain: "Your AI system can discriminate without meaning to. If the model produces outcomes that disproportionately disadvantage people of a particular race, gender, age, or other protected characteristic, even without using those characteristics directly, that is indirect discrimination and it is unlawful.",
        detail: "Indirect discrimination occurs when an AI system applies a provision, criterion, or practice that puts persons sharing a protected characteristic at a particular disadvantage, and the practice cannot be justified as proportionate. The nine protected characteristics are: age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, and sexual orientation.",
        citation: "Equality Act 2010, s.19(1); s.4 (protected characteristics)"
      },
      {
        title: "Monitor AI outputs for discriminatory patterns",
        plain: "Checking for bias at deployment is not enough. AI models can develop discriminatory patterns over time as the world changes and the model falls out of step with it. You need a regular process for reviewing whether your model is producing fair outcomes across different groups.",
        detail: "Employers and service providers using AI in decisions about individuals must monitor outcomes for patterns that may indicate indirect discrimination. Monitoring must be ongoing, model drift can introduce discriminatory patterns over time.",
        citation: "EHRC Technical Guidance on AI and Equality, Chapter 2, s.2.3; Equality Act 2010, s.19"
      },
      {
        title: "Conduct an equality impact assessment",
        plain: "Before deploying an AI system that affects decisions about people, you should formally assess whether it could produce discriminatory outcomes. A structured assessment of the risks, the data, and the likely outputs is sufficient. Public sector organisations have a legal duty to do this.",
        detail: "An equality impact assessment should be conducted to identify potential discriminatory effects on protected groups. Public sector bodies have an additional Public Sector Equality Duty requiring them to have due regard to equality.",
        citation: "Equality Act 2010, s.149 (PSED); EHRC Guidance on Equality Impact Assessment"
      },
      {
        title: "Provide meaningful explanations for decisions affecting individuals",
        plain: "If your AI influences a decision that significantly affects someone, they should be able to understand in plain terms why. 'An algorithm decided' is not a sufficient explanation. This is both a legal obligation and a basic expectation of fairness.",
        detail: "Where an AI system makes decisions that significantly affect individuals, those individuals should be able to obtain a meaningful explanation of the basis for the decision.",
        citation: "ICO and Alan Turing Institute, Explaining Decisions Made with AI, Part 1, s.1.5; Equality Act 2010"
      }
    ],
    consequences: {
      heading: "What happens if you don't address this",
      points: [
        "Individuals who have been discriminated against by an AI system can bring Employment Tribunal or County Court claims. There is no cap on compensation in discrimination cases brought in the Employment Tribunal.",
        "The EHRC has enforcement powers including the ability to conduct formal investigations, issue unlawful act notices, and enter into binding agreements requiring remediation.",
        "Algorithmic discrimination cases are increasingly high-profile. A finding of discrimination against a named company generates significant press coverage and reputational damage, particularly in sectors where trust is commercially important.",
        "Regulators in other jurisdictions (particularly the EU under the AI Act) treat algorithmic discrimination as a priority enforcement area. A finding in one jurisdiction increases exposure in others."
      ]
    },
    actions: [
      "Conduct an equality impact assessment for the AI system before deployment, covering all nine protected characteristics.",
      "Audit training data for historical bias that could be encoded in the model.",
      "Implement ongoing monitoring of model outputs to detect discriminatory patterns.",
      "Create a process for individuals to request an explanation of AI-influenced decisions.",
      "Review at least annually, model drift can introduce bias over time."
    ]
  },

  dsit: {
    obligations: [
      {
        title: "Apply the five cross-cutting AI principles",
        plain: "The UK Government has set out five principles that apply to all AI deployments, regardless of sector. These guide how every regulator in the UK interprets their rules in an AI context. They are: safety; transparency; fairness; accountability; and the ability for people to challenge decisions.",
        detail: "DSIT's five principles are: safety, security and robustness; appropriate transparency and explainability; fairness; accountability and governance; and contestability and redress. While not yet statutory, they guide regulatory interpretation across all sectors.",
        citation: "UK Government AI Regulation White Paper 2023, Chapter 3, s.3.2"
      },
      {
        title: "Implement board-level AI governance",
        plain: "Someone at senior level in your organisation needs to own the AI system. It needs to be on the risk register. If something goes wrong, regulators will ask who was responsible. The answer needs to be a named person.",
        detail: "DSIT expects boards and senior leadership to take ownership of AI governance. AI systems should be included in the organisation's risk register with a named senior individual accountable for each material deployment.",
        citation: "DSIT AI Regulation White Paper, s.2.4; DSIT AIME Framework"
      },
      {
        title: "Consider completing the AI Management Essentials assessment",
        plain: "DSIT offers a free voluntary assessment tool called AIME that helps you understand your AI governance maturity. It is increasingly referenced by enterprise customers in procurement and by regulated sector supervisors. It takes a few hours and gives you a clear picture of your gaps.",
        detail: "The DSIT AI Management Essentials (AIME) framework provides a voluntary baseline assessment of AI governance maturity. AIME completion is increasingly referenced by enterprise procurement and regulated sector supervisors.",
        citation: "DSIT AIME Framework, Framework Overview"
      }
    ],
    consequences: {
      heading: "What happens if you don't address this",
      points: [
        "The DSIT principles are not yet statutory, so there is no direct enforcement action for non-compliance with this framework alone. However, failure to apply them will be highly relevant in any regulatory investigation under sector-specific rules.",
        "Enterprise and public sector customers increasingly require evidence of AI governance maturity as a condition of procurement. Absence of a documented governance framework will exclude you from a growing proportion of commercial opportunities.",
        "The UK Government has signalled that the principles-based approach may be replaced with statutory obligations if voluntary adoption is insufficient. Getting ahead of this now reduces future compliance burden.",
        "Directors and senior managers in regulated sectors who cannot demonstrate governance accountability for AI systems face increasing personal exposure as regulatory frameworks mature."
      ]
    },
    actions: [
      "Add all material AI deployments to the organisation's risk register with named owners.",
      "Complete the free DSIT AIME assessment at aime.gov.uk to identify governance gaps.",
      "Develop or update your AI policy to explicitly address the five DSIT principles.",
      "Establish a regular AI governance review, at minimum annually.",
      "Document the human oversight mechanisms in place for each AI system."
    ]
  },

  eu_ai_act: {
    obligations: [
      {
        title: "Check whether your system involves prohibited AI practices (Article 5)",
        plain: "Some AI practices are banned outright under the EU AI Act, regardless of how the system is classified. If your system manipulates people through techniques they are not aware of, exploits vulnerable groups, or is used for social scoring, it cannot be deployed to EU users at all. Check this first.",
        detail: "Prohibited practices include: AI systems that manipulate persons through subliminal techniques; systems that exploit vulnerabilities of specific groups; real-time remote biometric identification in public spaces; social scoring systems by public authorities; and AI used to predict criminal offences based solely on profiling.",
        citation: "EU AI Act (Regulation 2024/1689), Article 5"
      },
      {
        title: "Determine whether your system is high-risk (Annex III)",
        plain: "The EU AI Act categorises AI systems by risk. High-risk categories include AI used in hiring, credit scoring, benefits decisions, and biometric identification. If your system falls into one of these categories, you have until August 2026 to meet the full requirements, but preparation needs to start now.",
        detail: "High-risk AI systems are listed in Annex III. These include systems used in: biometric identification; critical infrastructure; education and training; employment; access to essential services including credit scoring; law enforcement; migration; and administration of justice.",
        citation: "EU AI Act, Annex III; Article 6(2)"
      },
      {
        title: "Prepare technical documentation for high-risk systems (Article 11)",
        plain: "If your system is high-risk, you must have comprehensive written documentation describing how it works, what data it was trained on, how it was tested, and what risks were identified. This must exist before you go live. It is not a retrospective exercise.",
        detail: "High-risk AI systems must have comprehensive technical documentation prepared before the system is placed on the market, describing the intended purpose, training data, testing methodology, performance metrics, and risk mitigation measures.",
        citation: "EU AI Act, Article 11; Annex IV"
      },
      {
        title: "Ensure meaningful human oversight of high-risk systems (Article 14)",
        plain: "High-risk AI systems must be designed so that a human can step in, override the system, or shut it down. You cannot deploy a high-risk system that operates completely autonomously. The humans in the loop must actually have the information and authority to exercise oversight.",
        detail: "High-risk AI systems must allow effective oversight by natural persons during operation. The system must be capable of being overridden or interrupted and must provide sufficient information to allow oversight to be exercised.",
        citation: "EU AI Act, Article 14(1)(4)"
      },
      {
        title: "Complete conformity assessment and register the system (Articles 43-49)",
        plain: "Before deploying a high-risk AI system to EU users, you must complete a conformity assessment, register the system in the EU AI database, and apply the CE marking. For most high-risk categories you can self-certify. This takes time, do not leave it until 2026.",
        detail: "Before placing a high-risk AI system on the EU market, providers must complete a conformity assessment, register in the EU database, draw up a declaration of conformity, and apply the CE marking.",
        citation: "EU AI Act, Articles 16, 43, 48, 49"
      },
      {
        title: "Check obligations for general-purpose AI models (Articles 51-55)",
        plain: "If your AI system uses a large language model such as GPT, Claude, or Gemini, additional obligations apply and they are already in force. You need to provide technical documentation to anyone you supply the system to, and you need a copyright compliance policy.",
        detail: "If your AI system is built on or includes a general-purpose AI model, obligations include providing technical documentation to downstream providers and implementing a copyright compliance policy. These obligations are in force as of August 2024.",
        citation: "EU AI Act, Articles 51-55; GPAI Code of Practice"
      }
    ],
    consequences: {
      heading: "What happens if you don't address this",
      points: [
        "The EU AI Act provides for fines of up to 35 million euros or 7% of global annual turnover for prohibited practices, and up to 15 million euros or 3% of turnover for other violations. These are among the largest regulatory fines available under any European law.",
        "UK businesses with EU customers are in scope. Brexit does not provide any exemption, the Act applies based on where the AI is deployed, not where the provider is established.",
        "The EU AI Office, established in 2024, has enforcement powers and is actively developing its supervisory approach. The August 2026 deadline for high-risk systems is a hard deadline, not a target.",
        "Non-compliant high-risk AI systems can be prohibited from the EU market entirely. For businesses where EU revenue is material, this represents an existential commercial risk."
      ]
    },
    actions: [
      "Confirm whether any element of your AI deployment involves prohibited practices under Article 5.",
      "Classify your AI system against Annex III to determine whether high-risk obligations apply.",
      "If high-risk: begin technical documentation immediately. Do not wait until 2026.",
      "Appoint an EU representative if your organisation has no EU establishment.",
      "Review GPAI obligations if your system uses a large language model, these are already in force.",
      "Subscribe to updates from the EU AI Office at artificialintelligenceact.eu."
    ]
  }
};

const PRIORITY_ACTIONS = {
  ico_gdpr: [
    { action: "Complete a Data Protection Impact Assessment (DPIA)", priority: 1, rationale: "Legally required before deployment. Absence of a DPIA is one of the most common triggers for ICO enforcement action." },
    { action: "Update your privacy notice to cover your AI system and automated decision-making", priority: 2, rationale: "Easy to fix, high visibility to regulators and customers. Most privacy notices written before 2022 do not cover AI adequately." },
    { action: "Create a process for individuals to request human review of automated decisions", priority: 3, rationale: "Article 22 compliance gap. Required for any system making significant automated decisions about individuals." }
  ],
  fca: [
    { action: "Map accountability for the AI system to a named Senior Manager under SMCR", priority: 1, rationale: "Without named accountability, every other governance gap is compounded. This is the first thing the FCA will look for." },
    { action: "Document your model risk management approach", priority: 2, rationale: "Absence of model risk documentation is the most common finding in FCA AI-related supervisory work." },
    { action: "Conduct a Consumer Duty gap analysis for your AI system", priority: 3, rationale: "Consumer Duty enforcement is active. Demonstrating a structured approach to outcomes significantly reduces regulatory risk." }
  ],
  cma: [
    { action: "Review consumer-facing AI outputs for misleading content or undisclosed AI influence", priority: 1, rationale: "Highest enforcement priority for the CMA in AI. Consumer-facing recommendation and ranking systems are under active scrutiny." }
  ],
  mhra: [
    { action: "Use MHRA's qualification tool to formally determine whether your software is a medical device", priority: 1, rationale: "This is a binary legal question. Deploying without knowing the answer is not an acceptable position. Placing an unregistered medical device on the market is a criminal offence." },
    { action: "Engage a regulatory affairs specialist if the software qualifies as a medical device", priority: 2, rationale: "MHRA compliance for medical devices is complex and time-consuming. Specialist support is not optional for this category." }
  ],
  ehrc: [
    { action: "Conduct an equality impact assessment before deployment", priority: 1, rationale: "Establishes the baseline. Without it, you have no documented evidence that discriminatory outcomes were considered." },
    { action: "Implement ongoing monitoring for discriminatory patterns in AI outputs", priority: 2, rationale: "Model drift is a real risk. A system that was fair at deployment can become discriminatory over time without monitoring." }
  ],
  dsit: [
    { action: "Add the AI system to the organisation's risk register with a named owner", priority: 1, rationale: "Foundational governance requirement. Establishes accountability and creates the basis for all other governance activity." }
  ],
  eu_ai_act: [
    { action: "Classify your AI system against Annex III to determine high-risk status", priority: 1, rationale: "Everything else depends on this. If your system is high-risk, the August 2026 deadline is closer than it appears." },
    { action: "Begin technical documentation if the system is high-risk", priority: 2, rationale: "Technical documentation cannot be produced retrospectively. It must describe decisions made during development. Start now." },
    { action: "Check GPAI obligations if your system uses a large language model", priority: 3, rationale: "These obligations are already in force. Many businesses building on LLMs are unaware they are already in scope." }
  ]
};

function buildReport(assessmentData) {
  const { riskLevel, regimes, slots } = assessmentData;
  const riskLabels = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk' };
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const borders = { top: border, bottom: border, left: border, right: border };

  const children = [];

  // ── Cover page ────────────────────────────────────────────────────────
  children.push(
    new Paragraph({ children: [new TextRun({ text: 'VALARAUDIT', font: 'Arial', size: 20, color: '999999', characterSpacing: 200 })], spacing: { after: 2400 } }),
    new Paragraph({ children: [new TextRun({ text: 'AI Regulatory Compliance Report', font: 'Arial', size: 48, bold: true })], spacing: { after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: slots.ai_description || 'AI Deployment Assessment', font: 'Arial', size: 28, color: '666666' })], spacing: { after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: 'Risk Classification: ', font: 'Arial', size: 24, bold: true }), new TextRun({ text: riskLabels[riskLevel] || riskLevel, font: 'Arial', size: 24 })], spacing: { after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'Sector: ', font: 'Arial', size: 24, bold: true }), new TextRun({ text: slots.sector || 'Not specified', font: 'Arial', size: 24 })], spacing: { after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'Regimes identified: ', font: 'Arial', size: 24, bold: true }), new TextRun({ text: String(regimes.length), font: 'Arial', size: 24 })], spacing: { after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'Report date: ', font: 'Arial', size: 24, bold: true }), new TextRun({ text: today, font: 'Arial', size: 24 })], spacing: { after: 2400 } }),
    new Paragraph({ children: [new TextRun({ text: 'ValarAudit powered by Mawdsley Advisory', font: 'Arial', size: 20, color: '999999' })], spacing: { after: 240 } }),
    new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } }, spacing: { after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: 'DISCLAIMER', font: 'Arial', size: 20, bold: true, color: '666666' })], spacing: { after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'This report is regulatory guidance based on published frameworks and the answers provided in the assessment. It is not legal advice. The citation store is human-verified against source documents but regulation changes. Always verify obligations against current published guidance from the relevant regulator. If your situation is complex, consult a qualified solicitor or compliance professional.', font: 'Arial', size: 18, color: '666666' })], spacing: { after: 240 } }),
    new Paragraph({ children: [new PageBreak()], spacing: { after: 0 } })
  );

  // ── Executive summary ────────────────────────────────────────────────
  children.push(
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Executive Summary', font: 'Arial', size: 32, bold: true })], spacing: { before: 0, after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: `This report sets out the regulatory obligations that apply to the following AI deployment: ${slots.ai_description || 'the assessed AI system'}. The assessment was conducted using ValarAudit, which maps AI deployment characteristics to UK regulatory regimes using a human-verified citation store.`, font: 'Arial', size: 22 })], spacing: { after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: `The assessment identified ${regimes.length} applicable regulatory regime${regimes.length !== 1 ? 's' : ''} and classified the overall risk level as ${riskLabels[riskLevel] || riskLevel}.`, font: 'Arial', size: 22 })], spacing: { after: 180 } }),
    new Paragraph({ children: [new TextRun({ text: 'How to read this report', font: 'Arial', size: 24, bold: true })], spacing: { after: 180 } }),
    new Paragraph({ children: [new TextRun({ text: 'Each regulatory regime is presented in the same format. There are two layers to each obligation:', font: 'Arial', size: 22 })], spacing: { after: 180 } }),
    new Paragraph({ children: [new TextRun({ text: 'What this means for you', font: 'Arial', size: 22, bold: true, color: '1a3a5c' }), new TextRun({ text: ', a plain English explanation written for founders and product managers. Start here. This tells you what you need to do and why it matters in practical terms.', font: 'Arial', size: 22 })], spacing: { after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'The detail', font: 'Arial', size: 22, bold: true, color: '444444' }), new TextRun({ text: ', the technical legal explanation with source citations. This is for when you need to share the report with a solicitor, compliance professional, or your board, and they need to verify the underlying obligations.', font: 'Arial', size: 22 })], spacing: { after: 180 } }),
    new Paragraph({ children: [new TextRun({ text: 'At the end of each section you will find a consequences summary, what actually happens if these obligations are not addressed, and a set of recommended actions. The final page of the report brings the most important actions across all regimes into a single priority-ordered list to help you decide where to focus first.', font: 'Arial', size: 22 })], spacing: { after: 240 } })
  );

  // Summary table
  children.push(
    new Paragraph({ children: [new TextRun({ text: 'Regimes in Scope', font: 'Arial', size: 24, bold: true })], spacing: { after: 240 } }),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2800, 1400, 4826],
      rows: [
        new TableRow({
          children: [
            new TableCell({ borders, width: { size: 2800, type: WidthType.DXA }, shading: { fill: '000000', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: 'Regime', font: 'Arial', size: 20, bold: true, color: 'FFFFFF' })] })] }),
            new TableCell({ borders, width: { size: 1400, type: WidthType.DXA }, shading: { fill: '000000', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: 'Regulator', font: 'Arial', size: 20, bold: true, color: 'FFFFFF' })] })] }),
            new TableCell({ borders, width: { size: 4826, type: WidthType.DXA }, shading: { fill: '000000', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: 'Why this applies to your deployment', font: 'Arial', size: 20, bold: true, color: 'FFFFFF' })] })] }),
          ]
        }),
        ...regimes.map(regime => new TableRow({
          children: [
            new TableCell({ borders, width: { size: 2800, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: regime.name, font: 'Arial', size: 20 })] })] }),
            new TableCell({ borders, width: { size: 1400, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: regime.regulator, font: 'Arial', size: 20 })] })] }),
            new TableCell({ borders, width: { size: 4826, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: regime.trigger_reason, font: 'Arial', size: 20 })] })] }),
          ]
        }))
      ]
    }),
    new Paragraph({ children: [new PageBreak()], spacing: { after: 0 } })
  );

  // ── Per-regime sections ──────────────────────────────────────────────
  regimes.forEach((regime, idx) => {
    const content = FULL_REPORT_CONTENT[regime.id];

    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: regime.name, font: 'Arial', size: 32, bold: true })], spacing: { before: 0, after: 120 } }),
      new Paragraph({ children: [new TextRun({ text: `Regulator: ${regime.regulator}`, font: 'Arial', size: 20, color: '666666' })], spacing: { after: 240 } }),
      new Paragraph({ children: [new TextRun({ text: 'Why this regime applies to your deployment', font: 'Arial', size: 24, bold: true })], spacing: { after: 120 } }),
      new Paragraph({ children: [new TextRun({ text: regime.trigger_reason, font: 'Arial', size: 22 })], spacing: { after: 180 } })
    );

    if (content) {
      children.push(new Paragraph({ children: [new TextRun({ text: 'Specific Obligations', font: 'Arial', size: 24, bold: true })], spacing: { after: 240 } }));

      content.obligations.forEach((ob, i) => {
        children.push(
          new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${ob.title}`, font: 'Arial', size: 22, bold: true })], spacing: { before: 240, after: 120 } }),
          // Plain English, blue text, no border
          new Paragraph({ children: [new TextRun({ text: 'What this means for you', font: 'Arial', size: 20, bold: true, color: '1a3a5c' })], spacing: { after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: ob.plain, font: 'Arial', size: 20, color: '1a3a5c' })], spacing: { after: 180 } }),
          // Technical detail
          new Paragraph({ children: [new TextRun({ text: 'The detail', font: 'Arial', size: 20, bold: true, color: '444444' })], spacing: { after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: ob.detail, font: 'Arial', size: 20, color: '444444' })], spacing: { after: 120 } }),
          new Paragraph({ children: [new TextRun({ text: 'Citation: ', font: 'Arial', size: 18, bold: true, color: '888888' }), new TextRun({ text: ob.citation, font: 'Arial', size: 18, color: '888888', italics: true })], spacing: { after: 180 } })
        );
      });

      // Consequences section
      if (content.consequences) {
        children.push(
          new Paragraph({ children: [new TextRun({ text: content.consequences.heading, font: 'Arial', size: 24, bold: true })], spacing: { before: 200, after: 160 } })
        );
        content.consequences.points.forEach(point => {
          children.push(
            new Paragraph({
              numbering: { reference: 'bullets', level: 0 },
              children: [new TextRun({ text: point, font: 'Arial', size: 22 })],
              spacing: { after: 120 }
            })
          );
        });
      }

      // Recommended actions
      children.push(new Paragraph({ children: [new TextRun({ text: 'Recommended Actions', font: 'Arial', size: 24, bold: true })], spacing: { before: 200, after: 160 } }));
      content.actions.forEach(action => {
        children.push(new Paragraph({ numbering: { reference: 'numbers', level: 0 }, children: [new TextRun({ text: action, font: 'Arial', size: 22 })], spacing: { after: 120 } }));
      });
    }

    if (regime.citations?.length > 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: 'Source Documents', font: 'Arial', size: 24, bold: true })], spacing: { before: 200, after: 160 } }));
      regime.citations.forEach(c => {
        children.push(
          new Paragraph({ children: [new TextRun({ text: `${c.document}${c.reference ? ', ' + c.reference : ''}`, font: 'Arial', size: 20, bold: true })], spacing: { after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: c.description || '', font: 'Arial', size: 20, color: '666666' })], spacing: { after: 120 } })
        );
      });
    }

    // Divider between regimes instead of page break
    if (idx < regimes.length - 1) {
      children.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' } }, spacing: { before: 480, after: 480 } }));
    }
  });

  // ── Priority actions page ──────────────────────────────────────────────
  children.push(
    new Paragraph({ children: [new PageBreak()], spacing: { after: 0 } }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Where to Start: Priority Actions', font: 'Arial', size: 32, bold: true })], spacing: { before: 0, after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: 'The following actions are drawn from across all applicable regulatory regimes and ordered by priority. Priority is based on a combination of two factors: the likelihood that the absence of this action will be noticed by a regulator, auditor, or affected individual; and the severity of the consequence if it is. Actions marked Priority 1 should be addressed before deployment or as a matter of urgency if the system is already live.', font: 'Arial', size: 22 })], spacing: { after: 240 } })
  );

  // Collect and sort all priority actions for triggered regimes
  const allPriorityActions = [];
  regimes.forEach(regime => {
    const pa = PRIORITY_ACTIONS[regime.id];
    if (pa) {
      pa.forEach(item => {
        allPriorityActions.push({ ...item, regime: regime.name, regulator: regime.regulator });
      });
    }
  });
  allPriorityActions.sort((a, b) => a.priority - b.priority);

  // Priority 1
  const p1 = allPriorityActions.filter(a => a.priority === 1);
  if (p1.length > 0) {
    children.push(new Paragraph({ children: [new TextRun({ text: 'Priority 1, Address immediately', font: 'Arial', size: 24, bold: true, color: 'cc0000' })], spacing: { after: 240 } }));
    p1.forEach(item => {
      children.push(
        new Paragraph({ children: [new TextRun({ text: item.action, font: 'Arial', size: 22, bold: true })], spacing: { after: 60 } }),
        new Paragraph({ children: [new TextRun({ text: `Regime: ${item.regime} (${item.regulator})`, font: 'Arial', size: 20, color: '666666', italics: true })], spacing: { after: 60 } }),
        new Paragraph({ children: [new TextRun({ text: item.rationale, font: 'Arial', size: 20 })], spacing: { after: 240 } })
      );
    });
  }

  // Priority 2
  const p2 = allPriorityActions.filter(a => a.priority === 2);
  if (p2.length > 0) {
    children.push(new Paragraph({ children: [new TextRun({ text: 'Priority 2, Address within 30 days', font: 'Arial', size: 24, bold: true, color: 'cc6600' })], spacing: { before: 200, after: 160 } }));
    p2.forEach(item => {
      children.push(
        new Paragraph({ children: [new TextRun({ text: item.action, font: 'Arial', size: 22, bold: true })], spacing: { after: 60 } }),
        new Paragraph({ children: [new TextRun({ text: `Regime: ${item.regime} (${item.regulator})`, font: 'Arial', size: 20, color: '666666', italics: true })], spacing: { after: 60 } }),
        new Paragraph({ children: [new TextRun({ text: item.rationale, font: 'Arial', size: 20 })], spacing: { after: 240 } })
      );
    });
  }

  // Priority 3
  const p3 = allPriorityActions.filter(a => a.priority === 3);
  if (p3.length > 0) {
    children.push(new Paragraph({ children: [new TextRun({ text: 'Priority 3, Address within 90 days', font: 'Arial', size: 24, bold: true, color: '336600' })], spacing: { before: 200, after: 160 } }));
    p3.forEach(item => {
      children.push(
        new Paragraph({ children: [new TextRun({ text: item.action, font: 'Arial', size: 22, bold: true })], spacing: { after: 60 } }),
        new Paragraph({ children: [new TextRun({ text: `Regime: ${item.regime} (${item.regulator})`, font: 'Arial', size: 20, color: '666666', italics: true })], spacing: { after: 60 } }),
        new Paragraph({ children: [new TextRun({ text: item.rationale, font: 'Arial', size: 20 })], spacing: { after: 240 } })
      );
    });
  }

  // ── Disclaimer page ───────────────────────────────────────────────────
  children.push(
    new Paragraph({ children: [new PageBreak()], spacing: { after: 0 } }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Important Disclaimer', font: 'Arial', size: 32, bold: true })], spacing: { before: 0, after: 360 } }),
    new Paragraph({ children: [new TextRun({ text: 'This report has been generated by ValarAudit powered by Mawdsley Advisory. It provides regulatory guidance based on published frameworks and the information provided during the assessment.', font: 'Arial', size: 22 })], spacing: { after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: 'This report is not legal advice. It does not constitute a legal opinion and should not be relied upon as such. The information is based on regulatory frameworks in force at the date of generation and is subject to change.', font: 'Arial', size: 22 })], spacing: { after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: 'The citation store used to generate this report is human-verified against source documents. However, regulatory guidance and interpretations change. Always verify obligations against current published guidance from the relevant regulator before taking action.', font: 'Arial', size: 22 })], spacing: { after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: 'If any of the obligations identified in this report may apply to your organisation, seek advice from a qualified solicitor or compliance professional.', font: 'Arial', size: 22 })], spacing: { after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: `Generated by ValarAudit powered by Mawdsley Advisory | ${today}`, font: 'Arial', size: 20, color: '999999' })] })
  );

  return new Document({
    numbering: {
      config: [
        { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
      ]
    },
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [{ id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, font: 'Arial' }, paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } }]
    },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
              children: [new TextRun({
                text: 'Important disclaimer: This output is regulatory guidance based on published frameworks and your self-reported answers. It is not legal advice. The citation store is human-verified against source documents but regulation changes. Always verify obligations against current published guidance from the relevant regulator. You should consult a qualified solicitor or compliance professional before acting on these results. Questions about your results? Contact us at alistair@mawdsleyadvisory.com.',
                font: 'Arial', size: 14, color: '888888'
              })],
              spacing: { before: 120 }
            })
          ]
        })
      },
      children
    }]
  });
}

const testData = {
  riskLevel: 'high',
  slots: {
    sector: 'Financial services',
    ai_description: 'An AI system that assesses creditworthiness and makes lending decisions for consumer loan applications',
    decision_making: 'yes',
    data_types: ['financial', 'general_personal'],
    customer_facing: 'yes',
    eu_exposure: 'yes',
    credit_decisioning: 'yes',
    ai_medical_device: null
  },
  regimes: [
    { id: 'ico_gdpr', name: 'UK GDPR and Data Protection Act 2018', regulator: 'ICO', trigger_reason: 'Your AI system processes personal data, which brings it within the scope of UK GDPR and the Data Protection Act 2018. Because the system makes or influences decisions about individuals, Article 22 automated decision-making obligations may also apply.', summary: '', citations: [{ document: 'UK GDPR', reference: 'Article 22(1)', description: 'Right not to be subject to solely automated decision-making' }] },
    { id: 'fca', name: 'FCA Consumer Duty and AI in Financial Services', regulator: 'FCA', trigger_reason: 'Your AI system makes credit or lending decisions. This triggers FCA Consumer Duty obligations, algorithmic fairness requirements, and model risk management expectations under DP5/22.', summary: '', citations: [{ document: 'FCA PS22/9', reference: 'Chapter 4', description: 'Consumer Duty obligations' }] },
    { id: 'ehrc', name: 'Equality Act 2010, Algorithmic Bias', regulator: 'EHRC', trigger_reason: 'Your AI system makes or influences decisions about individuals. This engages Equality Act 2010 obligations around indirect discrimination.', summary: '', citations: [{ document: 'Equality Act 2010', reference: 's.19(1)', description: 'Indirect discrimination' }] },
    { id: 'dsit', name: 'DSIT AI Governance Framework', regulator: 'DSIT', trigger_reason: 'The DSIT AI governance framework and its five cross-cutting principles apply to all AI deployments in the UK.', summary: '', citations: [] },
    { id: 'eu_ai_act', name: 'EU AI Act', regulator: 'European Commission', trigger_reason: 'Your AI system serves EU users and influences decisions about individuals. It may qualify as a high-risk system under Annex III of the EU AI Act.', summary: '', citations: [{ document: 'EU AI Act', reference: 'Article 2(1)', description: 'Scope' }] }
  ]
};

const doc = buildReport(testData);
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/claude/ValarAudit_Sample_Report_v5.docx', buffer);
  console.log('Report v3 generated');
});
