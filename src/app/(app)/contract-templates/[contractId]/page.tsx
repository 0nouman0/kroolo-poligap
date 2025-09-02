"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, ArrowLeft, Download, Printer, Share, Building, Users, Shield, Handshake, Award, Home, TrendingUp, Car, ShoppingCart, Truck, Crown, Network, Briefcase, Globe, Heart, Zap, Wifi, Database, Code, Factory, Hammer, Wrench, Cog, GraduationCap, Plane, Scale, Gavel, DollarSign, CreditCard, PiggyBank, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ContractTemplate {
  id: string;
  name: string;
  icon: any;
  category: string;
  description: string;
  keyElements: string[];
  standardClauses: {
    title: string;
    content: string;
  }[];
  legalRequirements: string[];
  governingAuthority: string;
  lastUpdated: string;
}

const contractTemplates: { [key: string]: ContractTemplate } = {
  // Business Contracts
  "vendor": {
    id: "vendor",
    name: "Vendor Agreement",
    icon: Building,
    category: "Business",
    description: "A comprehensive vendor agreement template that establishes the terms and conditions for procurement of goods or services from external suppliers.",
    keyElements: [
      "Scope of Work/Services",
      "Payment Terms and Conditions",
      "Delivery and Performance Standards",
      "Quality Assurance Requirements",
      "Intellectual Property Rights",
      "Confidentiality and Non-Disclosure",
      "Termination Clauses",
      "Dispute Resolution Mechanisms"
    ],
    standardClauses: [
      {
        title: "1. PARTIES",
        content: "This Vendor Agreement ('Agreement') is entered into on [DATE] between [COMPANY NAME], a [STATE] corporation ('Company'), and [VENDOR NAME], a [STATE] [ENTITY TYPE] ('Vendor')."
      },
      {
        title: "2. SCOPE OF SERVICES",
        content: "Vendor agrees to provide the following goods/services: [DETAILED DESCRIPTION]. All services shall be performed in accordance with the specifications set forth in Exhibit A, which is incorporated herein by reference."
      },
      {
        title: "3. PAYMENT TERMS",
        content: "Company shall pay Vendor the amounts set forth in the pricing schedule attached as Exhibit B. Payment terms are Net [NUMBER] days from receipt of invoice. Late payments may incur a service charge of 1.5% per month."
      },
      {
        title: "4. PERFORMANCE STANDARDS",
        content: "Vendor shall perform all services in a professional and workmanlike manner in accordance with industry standards. All deliverables must meet the quality standards specified in Exhibit C."
      },
      {
        title: "5. INTELLECTUAL PROPERTY",
        content: "All intellectual property rights in any work product created under this Agreement shall remain with or be assigned to Company. Vendor grants Company a perpetual, royalty-free license to use any pre-existing IP necessary for the intended use."
      },
      {
        title: "6. CONFIDENTIALITY",
        content: "Vendor acknowledges that it may have access to confidential information of Company. Vendor agrees to maintain the confidentiality of such information and not to disclose it to any third party without prior written consent."
      },
      {
        title: "7. TERMINATION",
        content: "Either party may terminate this Agreement with [NUMBER] days written notice. Company may terminate immediately for cause, including breach of this Agreement or failure to meet performance standards."
      },
      {
        title: "8. GOVERNING LAW",
        content: "This Agreement shall be governed by and construed in accordance with the laws of [STATE], without regard to its conflict of law principles. Any disputes shall be resolved through binding arbitration."
      }
    ],
    legalRequirements: [
      "Compliance with applicable federal, state, and local laws",
      "Adherence to industry-specific regulations",
      "Proper business licensing and registration",
      "Insurance requirements and liability coverage",
      "Tax compliance and reporting obligations",
      "Data protection and privacy law compliance"
    ],
    governingAuthority: "Federal Trade Commission (FTC), State Commerce Departments, Industry-Specific Regulatory Bodies",
    lastUpdated: "2024-01-15"
  },

  "employment": {
    id: "employment",
    name: "Employment Contract",
    icon: Users,
    category: "Legal",
    description: "A comprehensive employment agreement template compliant with federal and state labor laws, establishing the terms and conditions of employment.",
    keyElements: [
      "Job Title and Description",
      "Compensation and Benefits",
      "Work Schedule and Location",
      "Confidentiality and Non-Compete",
      "Intellectual Property Assignment",
      "Termination Procedures",
      "Dispute Resolution",
      "Compliance with Labor Laws"
    ],
    standardClauses: [
      {
        title: "1. EMPLOYMENT RELATIONSHIP",
        content: "Company hereby employs Employee in the position of [JOB TITLE], and Employee accepts such employment, subject to the terms and conditions set forth in this Agreement. Employment is at-will unless otherwise specified."
      },
      {
        title: "2. DUTIES AND RESPONSIBILITIES",
        content: "Employee shall perform the duties and responsibilities set forth in the job description attached as Exhibit A, and such other duties as may be assigned by Company from time to time that are consistent with Employee's position."
      },
      {
        title: "3. COMPENSATION",
        content: "Company shall pay Employee a base salary of $[AMOUNT] per [PERIOD], payable in accordance with Company's standard payroll practices. Employee may be eligible for bonuses and other compensation as determined by Company."
      },
      {
        title: "4. BENEFITS",
        content: "Employee shall be entitled to participate in Company's employee benefit plans, including health insurance, retirement plans, and paid time off, subject to the terms and conditions of such plans."
      },
      {
        title: "5. CONFIDENTIALITY",
        content: "Employee acknowledges that during employment, Employee will have access to confidential information. Employee agrees to maintain the confidentiality of such information during and after employment."
      },
      {
        title: "6. INTELLECTUAL PROPERTY",
        content: "All inventions, discoveries, and improvements made by Employee during employment that relate to Company's business shall be the exclusive property of Company. Employee agrees to assign all rights to such intellectual property to Company."
      },
      {
        title: "7. TERMINATION",
        content: "This Agreement may be terminated by either party with [NUMBER] days written notice, or immediately for cause. Upon termination, Employee shall return all Company property and confidential information."
      },
      {
        title: "8. GOVERNING LAW",
        content: "This Agreement shall be governed by the laws of [STATE] and applicable federal employment laws, including but not limited to the Fair Labor Standards Act, Title VII, and the Americans with Disabilities Act."
      }
    ],
    legalRequirements: [
      "Fair Labor Standards Act (FLSA) compliance",
      "Equal Employment Opportunity (EEO) laws",
      "Americans with Disabilities Act (ADA) compliance",
      "State-specific employment laws",
      "Workers' compensation requirements",
      "Occupational Safety and Health Act (OSHA) compliance"
    ],
    governingAuthority: "Department of Labor (DOL), Equal Employment Opportunity Commission (EEOC), State Labor Departments",
    lastUpdated: "2024-01-15"
  },

  "nda": {
    id: "nda",
    name: "Non-Disclosure Agreement",
    icon: Shield,
    category: "Legal",
    description: "A legally binding non-disclosure agreement template to protect confidential information and trade secrets in business relationships.",
    keyElements: [
      "Definition of Confidential Information",
      "Obligations of Receiving Party",
      "Permitted Uses and Exceptions",
      "Duration of Confidentiality",
      "Return of Information",
      "Legal Remedies and Enforcement",
      "Governing Law and Jurisdiction"
    ],
    standardClauses: [
      {
        title: "1. PARTIES",
        content: "This Non-Disclosure Agreement ('Agreement') is entered into on [DATE] between [DISCLOSING PARTY NAME] ('Disclosing Party') and [RECEIVING PARTY NAME] ('Receiving Party')."
      },
      {
        title: "2. CONFIDENTIAL INFORMATION",
        content: "For purposes of this Agreement, 'Confidential Information' means any and all non-public, proprietary, or confidential information disclosed by Disclosing Party, including but not limited to technical data, trade secrets, business plans, financial information, and customer lists."
      },
      {
        title: "3. OBLIGATIONS",
        content: "Receiving Party agrees to: (a) maintain the confidentiality of all Confidential Information; (b) not disclose Confidential Information to any third party without prior written consent; (c) use Confidential Information solely for the purpose of [PURPOSE]."
      },
      {
        title: "4. EXCEPTIONS",
        content: "The obligations herein shall not apply to information that: (a) is publicly available; (b) was known to Receiving Party prior to disclosure; (c) is independently developed without use of Confidential Information; (d) is required to be disclosed by law."
      },
      {
        title: "5. TERM",
        content: "This Agreement shall remain in effect for a period of [NUMBER] years from the date of execution, unless terminated earlier by mutual written consent of the parties."
      },
      {
        title: "6. RETURN OF INFORMATION",
        content: "Upon termination of this Agreement or upon request by Disclosing Party, Receiving Party shall promptly return or destroy all materials containing Confidential Information and certify such return or destruction in writing."
      },
      {
        title: "7. REMEDIES",
        content: "Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to Disclosing Party. Therefore, Disclosing Party shall be entitled to seek injunctive relief and other equitable remedies without prejudice to other available remedies."
      },
      {
        title: "8. GOVERNING LAW",
        content: "This Agreement shall be governed by and construed in accordance with the laws of [STATE], without regard to conflict of law principles. Any disputes shall be resolved in the courts of [JURISDICTION]."
      }
    ],
    legalRequirements: [
      "Trade Secrets Act compliance",
      "Uniform Trade Secrets Act (UTSA) adherence",
      "State-specific confidentiality laws",
      "Intellectual property law compliance",
      "Contract law requirements",
      "Enforceability standards"
    ],
    governingAuthority: "State Courts, Federal Courts (for federal trade secret claims), USPTO for IP-related matters",
    lastUpdated: "2024-01-15"
  },

  "lease": {
    id: "lease",
    name: "Lease Agreement",
    icon: Home,
    category: "Property & Real Estate",
    description: "A comprehensive lease agreement template for residential or commercial property rentals, compliant with federal and state housing laws.",
    keyElements: [
      "Property Description and Use",
      "Lease Term and Rent Amount",
      "Security Deposit Requirements",
      "Maintenance and Repair Obligations",
      "Tenant Rights and Responsibilities",
      "Landlord Access Rights",
      "Termination and Renewal Terms",
      "Compliance with Housing Laws"
    ],
    standardClauses: [
      {
        title: "1. PARTIES AND PROPERTY",
        content: "This Lease Agreement is entered into on [DATE] between [LANDLORD NAME] ('Landlord') and [TENANT NAME] ('Tenant') for the property located at [PROPERTY ADDRESS] ('Premises')."
      },
      {
        title: "2. LEASE TERM",
        content: "The lease term shall commence on [START DATE] and end on [END DATE]. This lease shall automatically renew for additional [PERIOD] terms unless either party provides [NUMBER] days written notice of non-renewal."
      },
      {
        title: "3. RENT AND PAYMENT",
        content: "Tenant shall pay monthly rent of $[AMOUNT], due on the [DAY] day of each month. Late payments shall incur a late fee of $[AMOUNT] after a [NUMBER] day grace period. Rent shall be paid to [PAYMENT ADDRESS/METHOD]."
      },
      {
        title: "4. SECURITY DEPOSIT",
        content: "Tenant shall pay a security deposit of $[AMOUNT] upon execution of this lease. The deposit shall be held in accordance with state law and returned within [NUMBER] days after lease termination, less any deductions for damages or unpaid rent."
      },
      {
        title: "5. USE OF PREMISES",
        content: "The Premises shall be used solely for [RESIDENTIAL/COMMERCIAL] purposes. Tenant shall not use the Premises for any illegal activities or in violation of any applicable laws, ordinances, or regulations."
      },
      {
        title: "6. MAINTENANCE AND REPAIRS",
        content: "Landlord shall maintain the Premises in habitable condition and make necessary repairs to structural elements, plumbing, heating, and electrical systems. Tenant shall maintain the Premises in clean condition and promptly report any needed repairs."
      },
      {
        title: "7. LANDLORD ACCESS",
        content: "Landlord may enter the Premises for inspections, repairs, or showings with [NUMBER] hours advance notice, except in emergencies. Entry shall be at reasonable times and in accordance with state law."
      },
      {
        title: "8. TERMINATION",
        content: "This lease may be terminated by either party with [NUMBER] days written notice. Landlord may terminate immediately for non-payment of rent, violation of lease terms, or other cause as permitted by law."
      }
    ],
    legalRequirements: [
      "Fair Housing Act compliance",
      "State landlord-tenant laws",
      "Local housing codes and ordinances",
      "Security deposit regulations",
      "Habitability standards",
      "Eviction procedure requirements"
    ],
    governingAuthority: "Department of Housing and Urban Development (HUD), State Housing Authorities, Local Housing Departments",
    lastUpdated: "2024-01-15"
  },

  "service": {
    id: "service",
    name: "Service Agreement",
    icon: Handshake,
    category: "Commercial & Sales",
    description: "A professional service agreement template for defining the terms and conditions of service provision between service providers and clients.",
    keyElements: [
      "Service Description and Scope",
      "Performance Standards and Deliverables",
      "Payment Terms and Fee Structure",
      "Timeline and Milestones",
      "Intellectual Property Rights",
      "Liability and Indemnification",
      "Termination and Cancellation",
      "Dispute Resolution"
    ],
    standardClauses: [
      {
        title: "1. AGREEMENT OVERVIEW",
        content: "This Service Agreement ('Agreement') is entered into on [DATE] between [SERVICE PROVIDER NAME] ('Provider') and [CLIENT NAME] ('Client') for the provision of [SERVICE DESCRIPTION]."
      },
      {
        title: "2. SCOPE OF SERVICES",
        content: "Provider agrees to provide the services described in Exhibit A attached hereto. All services shall be performed in a professional manner consistent with industry standards and best practices."
      },
      {
        title: "3. PERFORMANCE STANDARDS",
        content: "Provider shall perform all services with due care and in accordance with the performance standards set forth in Exhibit B. All deliverables must meet the acceptance criteria specified by Client."
      },
      {
        title: "4. COMPENSATION",
        content: "Client shall pay Provider the fees set forth in the fee schedule attached as Exhibit C. Payment terms are [PAYMENT TERMS]. Additional services outside the scope may be charged separately."
      },
      {
        title: "5. TIMELINE",
        content: "Services shall be completed according to the timeline set forth in Exhibit D. Time is of the essence. Provider shall notify Client immediately of any delays that may affect the delivery schedule."
      },
      {
        title: "6. INTELLECTUAL PROPERTY",
        content: "All work product created specifically for Client under this Agreement shall be owned by Client. Provider retains ownership of pre-existing intellectual property and general methodologies."
      },
      {
        title: "7. LIABILITY AND INDEMNIFICATION",
        content: "Provider's liability shall be limited to the amount of fees paid under this Agreement. Each party agrees to indemnify the other against claims arising from their own negligent acts or omissions."
      },
      {
        title: "8. TERMINATION",
        content: "Either party may terminate this Agreement with [NUMBER] days written notice. Client shall pay for all services performed up to the termination date. Certain provisions shall survive termination."
      }
    ],
    legalRequirements: [
      "Consumer protection laws",
      "Professional licensing requirements",
      "Industry-specific regulations",
      "Tax and business registration compliance",
      "Insurance and bonding requirements",
      "Contract law principles"
    ],
    governingAuthority: "Federal Trade Commission (FTC), State Professional Licensing Boards, Industry Regulatory Bodies",
    lastUpdated: "2024-01-15"
  },

  // Additional Business Contracts
  "partnership": {
    id: "partnership",
    name: "Partnership Agreement",
    icon: Network,
    category: "Business",
    description: "A comprehensive partnership agreement template establishing the terms for business partnerships and joint ventures.",
    keyElements: ["Partnership Structure", "Capital Contributions", "Profit/Loss Distribution", "Management Responsibilities", "Decision Making Process", "Withdrawal/Dissolution"],
    standardClauses: [
      {
        title: "1. PARTNERSHIP FORMATION",
        content: "The parties hereby form a [TYPE] partnership under the laws of [STATE] for the purpose of [BUSINESS PURPOSE]. The partnership shall commence on [DATE] and continue until dissolved."
      },
      {
        title: "2. CAPITAL CONTRIBUTIONS",
        content: "Each partner shall contribute capital as set forth in Schedule A. Additional capital contributions may be required with unanimous consent of all partners."
      }
    ],
    legalRequirements: ["Partnership registration", "Tax obligations", "State partnership laws", "Business licensing"],
    governingAuthority: "State Secretary of State, IRS, State Tax Authorities",
    lastUpdated: "2024-01-15"
  },

  "software": {
    id: "software",
    name: "Software License Agreement",
    icon: Code,
    category: "Technology & IP",
    description: "A software licensing agreement template compliant with intellectual property laws and industry standards.",
    keyElements: ["License Grant", "Usage Restrictions", "Intellectual Property Rights", "Support and Maintenance", "Liability Limitations", "Termination Rights"],
    standardClauses: [
      {
        title: "1. LICENSE GRANT",
        content: "Licensor grants Licensee a [EXCLUSIVE/NON-EXCLUSIVE] license to use the software subject to the terms and conditions herein."
      },
      {
        title: "2. RESTRICTIONS",
        content: "Licensee shall not reverse engineer, decompile, or create derivative works of the software without express written permission."
      }
    ],
    legalRequirements: ["Copyright law compliance", "DMCA provisions", "Export control laws", "Privacy regulations"],
    governingAuthority: "USPTO, Copyright Office, Department of Commerce",
    lastUpdated: "2024-01-15"
  },

  "healthcare": {
    id: "healthcare",
    name: "Healthcare Service Agreement",
    icon: Heart,
    category: "Specialized Services",
    description: "A healthcare service agreement template compliant with HIPAA and healthcare regulations.",
    keyElements: ["Service Scope", "HIPAA Compliance", "Patient Rights", "Quality Standards", "Billing Procedures", "Regulatory Compliance"],
    standardClauses: [
      {
        title: "1. HEALTHCARE SERVICES",
        content: "Provider agrees to provide healthcare services in accordance with applicable medical standards and regulations."
      },
      {
        title: "2. HIPAA COMPLIANCE",
        content: "All parties shall comply with HIPAA privacy and security requirements for protected health information."
      }
    ],
    legalRequirements: ["HIPAA compliance", "State medical licensing", "Medicare/Medicaid regulations", "FDA requirements"],
    governingAuthority: "HHS, CMS, State Health Departments, Medical Licensing Boards",
    lastUpdated: "2024-01-15"
  },

  // Complete all remaining contract types
  "consulting": {
    id: "consulting",
    name: "Consulting Agreement",
    icon: TrendingUp,
    category: "Business",
    description: "Professional consulting services agreement template for independent contractors and consultants.",
    keyElements: ["Scope of Consulting Services", "Deliverables and Timeline", "Compensation Structure", "Intellectual Property Rights", "Confidentiality", "Independent Contractor Status"],
    standardClauses: [
      {
        title: "1. CONSULTING SERVICES",
        content: "Consultant agrees to provide professional consulting services as described in the Statement of Work attached hereto."
      },
      {
        title: "2. INDEPENDENT CONTRACTOR",
        content: "Consultant is an independent contractor and not an employee of Client. Consultant shall be responsible for all taxes and benefits."
      }
    ],
    legalRequirements: ["Independent contractor classification", "Tax compliance", "Professional licensing", "Insurance requirements"],
    governingAuthority: "IRS, State Tax Authorities, Professional Licensing Boards",
    lastUpdated: "2024-01-15"
  },

  "franchise": {
    id: "franchise",
    name: "Franchise Agreement",
    icon: Crown,
    category: "Business",
    description: "Comprehensive franchise agreement template compliant with FTC Franchise Rule and state franchise laws.",
    keyElements: ["Franchise Grant", "Territory Rights", "Fees and Royalties", "Training and Support", "Operating Standards", "Termination Rights"],
    standardClauses: [
      {
        title: "1. FRANCHISE GRANT",
        content: "Franchisor grants Franchisee the right to operate a franchise business under the franchisor's system and trademarks."
      },
      {
        title: "2. FRANCHISE FEES",
        content: "Franchisee shall pay initial franchise fee and ongoing royalty fees as specified in the fee schedule."
      }
    ],
    legalRequirements: ["FTC Franchise Rule compliance", "State franchise registration", "Disclosure document requirements", "Relationship law compliance"],
    governingAuthority: "FTC, State Franchise Regulators, State Attorney General Offices",
    lastUpdated: "2024-01-15"
  },

  "joint-venture": {
    id: "joint-venture",
    name: "Joint Venture Agreement",
    icon: Handshake,
    category: "Business",
    description: "Joint venture agreement template for collaborative business ventures and strategic partnerships.",
    keyElements: ["Venture Purpose", "Contributions and Responsibilities", "Management Structure", "Profit/Loss Sharing", "Intellectual Property", "Exit Strategy"],
    standardClauses: [
      {
        title: "1. JOINT VENTURE FORMATION",
        content: "The parties hereby form a joint venture for the purpose of [VENTURE PURPOSE] under the terms set forth herein."
      },
      {
        title: "2. CONTRIBUTIONS",
        content: "Each party shall contribute resources as specified in Schedule A, including capital, personnel, and intellectual property."
      }
    ],
    legalRequirements: ["Business registration", "Tax structure compliance", "Antitrust considerations", "Securities law compliance"],
    governingAuthority: "State Business Registration, IRS, DOJ Antitrust Division, SEC",
    lastUpdated: "2024-01-15"
  },

  "merger": {
    id: "merger",
    name: "Merger Agreement",
    icon: Briefcase,
    category: "Business",
    description: "Corporate merger agreement template for business combinations and acquisitions.",
    keyElements: ["Merger Structure", "Exchange Ratio", "Representations and Warranties", "Closing Conditions", "Termination Rights", "Regulatory Approvals"],
    standardClauses: [
      {
        title: "1. MERGER TRANSACTION",
        content: "Target Company shall merge with and into Acquiring Company in accordance with applicable corporate law."
      },
      {
        title: "2. CONSIDERATION",
        content: "Shareholders of Target Company shall receive consideration as specified in the exchange ratio schedule."
      }
    ],
    legalRequirements: ["Securities law compliance", "Antitrust clearance", "Shareholder approval", "Regulatory filings"],
    governingAuthority: "SEC, DOJ/FTC, State Corporate Authorities, Industry Regulators",
    lastUpdated: "2024-01-15"
  },

  "acquisition": {
    id: "acquisition",
    name: "Acquisition Agreement",
    icon: Building,
    category: "Business",
    description: "Asset or stock purchase agreement template for business acquisitions.",
    keyElements: ["Purchase Structure", "Purchase Price", "Due Diligence", "Representations and Warranties", "Indemnification", "Closing Conditions"],
    standardClauses: [
      {
        title: "1. PURCHASE AND SALE",
        content: "Seller agrees to sell and Buyer agrees to purchase the assets/stock described herein for the purchase price specified."
      },
      {
        title: "2. REPRESENTATIONS AND WARRANTIES",
        content: "Each party makes the representations and warranties set forth in the attached schedules."
      }
    ],
    legalRequirements: ["Securities law compliance", "Tax considerations", "Employment law compliance", "Environmental compliance"],
    governingAuthority: "SEC, IRS, State Corporate Authorities, Environmental Agencies",
    lastUpdated: "2024-01-15"
  },

  "outsourcing": {
    id: "outsourcing",
    name: "Outsourcing Agreement",
    icon: Globe,
    category: "Business",
    description: "Business process outsourcing agreement template for service provider relationships.",
    keyElements: ["Service Scope", "Service Level Agreements", "Performance Metrics", "Data Security", "Transition Planning", "Termination Assistance"],
    standardClauses: [
      {
        title: "1. OUTSOURCED SERVICES",
        content: "Service Provider agrees to provide the outsourced services described in the Service Schedule."
      },
      {
        title: "2. SERVICE LEVELS",
        content: "Service Provider shall meet the service level requirements and performance metrics specified herein."
      }
    ],
    legalRequirements: ["Data protection compliance", "Employment law considerations", "Cross-border regulations", "Industry-specific requirements"],
    governingAuthority: "Data Protection Authorities, Labor Departments, Industry Regulators",
    lastUpdated: "2024-01-15"
  },

  "supply-chain": {
    id: "supply-chain",
    name: "Supply Chain Agreement",
    icon: Truck,
    category: "Business",
    description: "Supply chain management agreement template for vendor and supplier relationships.",
    keyElements: ["Supply Requirements", "Quality Standards", "Delivery Terms", "Inventory Management", "Risk Management", "Sustainability Requirements"],
    standardClauses: [
      {
        title: "1. SUPPLY OBLIGATIONS",
        content: "Supplier agrees to provide goods/materials in accordance with the specifications and delivery schedule."
      },
      {
        title: "2. QUALITY ASSURANCE",
        content: "All supplied goods must meet the quality standards and specifications set forth in the quality manual."
      }
    ],
    legalRequirements: ["Product safety regulations", "Environmental compliance", "Import/export laws", "Labor standards"],
    governingAuthority: "FDA, EPA, Customs and Border Protection, Department of Labor",
    lastUpdated: "2024-01-15"
  },

  "manufacturing": {
    id: "manufacturing",
    name: "Manufacturing Agreement",
    icon: Factory,
    category: "Business",
    description: "Manufacturing services agreement template for production and assembly services.",
    keyElements: ["Manufacturing Specifications", "Quality Control", "Production Schedule", "Intellectual Property", "Regulatory Compliance", "Supply Chain Management"],
    standardClauses: [
      {
        title: "1. MANUFACTURING SERVICES",
        content: "Manufacturer agrees to produce goods according to the specifications and quality standards provided by Customer."
      },
      {
        title: "2. QUALITY CONTROL",
        content: "Manufacturer shall implement quality control procedures to ensure all products meet specified standards."
      }
    ],
    legalRequirements: ["Product safety standards", "Environmental regulations", "Worker safety compliance", "Industry certifications"],
    governingAuthority: "OSHA, EPA, FDA, Industry Certification Bodies",
    lastUpdated: "2024-01-15"
  },

  // Legal Contracts (continued)
  "confidentiality": {
    id: "confidentiality",
    name: "Confidentiality Agreement",
    icon: Shield,
    category: "Legal",
    description: "Confidentiality agreement template for protecting sensitive business information and trade secrets.",
    keyElements: ["Definition of Confidential Information", "Non-Disclosure Obligations", "Permitted Uses", "Return of Information", "Legal Remedies", "Duration of Agreement"],
    standardClauses: [
      {
        title: "1. CONFIDENTIAL INFORMATION",
        content: "Confidential Information includes all proprietary, technical, business, and financial information disclosed by the disclosing party."
      },
      {
        title: "2. NON-DISCLOSURE",
        content: "Receiving party agrees not to disclose confidential information to any third party without prior written consent."
      }
    ],
    legalRequirements: ["Trade secret protection", "Non-disclosure enforcement", "Jurisdiction compliance", "Remedies specification"],
    governingAuthority: "State Courts, Federal Courts for Trade Secret Claims",
    lastUpdated: "2024-01-15"
  },

  "non-compete": {
    id: "non-compete",
    name: "Non-Compete Agreement",
    icon: Scale,
    category: "Legal",
    description: "Non-compete agreement template for restricting competitive activities post-employment or business relationship.",
    keyElements: ["Scope of Restriction", "Geographic Limitations", "Time Duration", "Consideration", "Enforcement Mechanisms", "Severability"],
    standardClauses: [
      {
        title: "1. NON-COMPETE RESTRICTION",
        content: "Employee/Contractor agrees not to engage in competitive business activities within the specified geographic area and time period."
      },
      {
        title: "2. CONSIDERATION",
        content: "In consideration for this agreement, Employee/Contractor receives employment/compensation as specified herein."
      }
    ],
    legalRequirements: ["State non-compete laws", "Reasonableness standards", "Consideration requirements", "Blue pencil doctrine"],
    governingAuthority: "State Courts, State Labor Departments, Attorney General Offices",
    lastUpdated: "2024-01-15"
  },

  "settlement": {
    id: "settlement",
    name: "Settlement Agreement",
    icon: Gavel,
    category: "Legal",
    description: "Legal settlement agreement template for resolving disputes and claims outside of court.",
    keyElements: ["Dispute Description", "Settlement Terms", "Release of Claims", "Confidentiality", "Compliance Monitoring", "Enforcement"],
    standardClauses: [
      {
        title: "1. SETTLEMENT TERMS",
        content: "The parties agree to settle all claims and disputes as set forth in the terms and conditions herein."
      },
      {
        title: "2. RELEASE OF CLAIMS",
        content: "Each party releases the other from all claims, demands, and causes of action related to the dispute."
      }
    ],
    legalRequirements: ["Court approval if required", "Compliance with settlement laws", "Tax implications", "Enforceability standards"],
    governingAuthority: "State and Federal Courts, Tax Authorities",
    lastUpdated: "2024-01-15"
  },

  "arbitration": {
    id: "arbitration",
    name: "Arbitration Agreement",
    icon: Scale,
    category: "Legal",
    description: "Arbitration agreement template for alternative dispute resolution and binding arbitration proceedings.",
    keyElements: ["Arbitration Scope", "Arbitrator Selection", "Procedural Rules", "Discovery Limitations", "Award Enforcement", "Appeal Rights"],
    standardClauses: [
      {
        title: "1. ARBITRATION CLAUSE",
        content: "All disputes arising under this agreement shall be resolved through binding arbitration in accordance with the rules specified herein."
      },
      {
        title: "2. ARBITRATOR SELECTION",
        content: "Arbitrators shall be selected according to the procedures of the designated arbitration organization."
      }
    ],
    legalRequirements: ["Federal Arbitration Act compliance", "State arbitration laws", "Due process requirements", "Unconscionability standards"],
    governingAuthority: "Federal Courts, State Courts, Arbitration Organizations (AAA, JAMS)",
    lastUpdated: "2024-01-15"
  },

  "power-attorney": {
    id: "power-attorney",
    name: "Power of Attorney",
    icon: Gavel,
    category: "Legal",
    description: "Power of attorney document template for granting legal authority to act on behalf of another person.",
    keyElements: ["Grant of Authority", "Scope of Powers", "Effective Date", "Termination Conditions", "Agent Responsibilities", "Principal Protection"],
    standardClauses: [
      {
        title: "1. GRANT OF POWER",
        content: "Principal hereby grants Agent the power to act on Principal's behalf in the matters specified herein."
      },
      {
        title: "2. SCOPE OF AUTHORITY",
        content: "Agent's authority includes the specific powers enumerated in this document and is subject to the limitations set forth herein."
      }
    ],
    legalRequirements: ["State power of attorney laws", "Notarization requirements", "Witness requirements", "Recording requirements"],
    governingAuthority: "State Courts, County Recorders, Notary Authorities",
    lastUpdated: "2024-01-15"
  },

  // Property & Real Estate (continued)
  "rental": {
    id: "rental",
    name: "Rental Agreement",
    icon: Home,
    category: "Property & Real Estate",
    description: "Short-term rental agreement template for residential property rentals and vacation rentals.",
    keyElements: ["Rental Period", "Rental Rate", "Security Deposit", "Property Rules", "Maintenance Responsibilities", "Termination Terms"],
    standardClauses: [
      {
        title: "1. RENTAL TERMS",
        content: "Owner agrees to rent the property to Renter for the period and rate specified in this agreement."
      },
      {
        title: "2. PROPERTY CONDITION",
        content: "Renter acknowledges receiving the property in good condition and agrees to return it in the same condition."
      }
    ],
    legalRequirements: ["Local rental regulations", "Short-term rental permits", "Tax obligations", "Safety requirements"],
    governingAuthority: "Local Housing Authorities, Tax Departments, Fire Departments",
    lastUpdated: "2024-01-15"
  },

  "property-sale": {
    id: "property-sale",
    name: "Property Sale Agreement",
    icon: Home,
    category: "Property & Real Estate",
    description: "Real estate purchase agreement template for buying and selling residential or commercial property.",
    keyElements: ["Purchase Price", "Property Description", "Financing Terms", "Inspections", "Closing Conditions", "Title Requirements"],
    standardClauses: [
      {
        title: "1. PURCHASE AND SALE",
        content: "Seller agrees to sell and Buyer agrees to purchase the real property described herein for the purchase price specified."
      },
      {
        title: "2. CLOSING CONDITIONS",
        content: "The sale is contingent upon satisfaction of the conditions precedent set forth in this agreement."
      }
    ],
    legalRequirements: ["Real estate disclosure laws", "Title insurance requirements", "Recording requirements", "Transfer tax compliance"],
    governingAuthority: "State Real Estate Commissions, County Recorders, Tax Assessors",
    lastUpdated: "2024-01-15"
  },

  "mortgage": {
    id: "mortgage",
    name: "Mortgage Agreement",
    icon: Landmark,
    category: "Property & Real Estate",
    description: "Mortgage loan agreement template for real estate financing and security instruments.",
    keyElements: ["Loan Amount", "Interest Rate", "Payment Terms", "Security Interest", "Default Provisions", "Foreclosure Rights"],
    standardClauses: [
      {
        title: "1. LOAN TERMS",
        content: "Lender agrees to loan Borrower the principal amount at the interest rate and payment terms specified herein."
      },
      {
        title: "2. SECURITY INTEREST",
        content: "This loan is secured by a mortgage/deed of trust on the real property described in the attached legal description."
      }
    ],
    legalRequirements: ["Truth in Lending Act", "Real Estate Settlement Procedures Act", "State mortgage laws", "Recording requirements"],
    governingAuthority: "CFPB, State Banking Departments, County Recorders",
    lastUpdated: "2024-01-15"
  },

  "construction": {
    id: "construction",
    name: "Construction Contract",
    icon: Hammer,
    category: "Property & Real Estate",
    description: "Construction agreement template for building and renovation projects.",
    keyElements: ["Scope of Work", "Materials and Labor", "Timeline", "Payment Schedule", "Change Orders", "Warranty"],
    standardClauses: [
      {
        title: "1. CONSTRUCTION WORK",
        content: "Contractor agrees to provide all labor, materials, and services necessary to complete the construction project as specified."
      },
      {
        title: "2. PAYMENT TERMS",
        content: "Owner shall pay Contractor according to the payment schedule based on completion of specified milestones."
      }
    ],
    legalRequirements: ["Contractor licensing", "Building permits", "Lien law compliance", "Worker safety regulations"],
    governingAuthority: "State Contractor Licensing Boards, Building Departments, OSHA",
    lastUpdated: "2024-01-15"
  },

  "maintenance": {
    id: "maintenance",
    name: "Maintenance Agreement",
    icon: Wrench,
    category: "Property & Real Estate",
    description: "Property maintenance service agreement template for ongoing maintenance and repair services.",
    keyElements: ["Maintenance Services", "Service Schedule", "Response Times", "Parts and Labor", "Emergency Services", "Performance Standards"],
    standardClauses: [
      {
        title: "1. MAINTENANCE SERVICES",
        content: "Service Provider agrees to provide maintenance services for the property/equipment as described in the service schedule."
      },
      {
        title: "2. SERVICE STANDARDS",
        content: "All maintenance work shall be performed in accordance with industry standards and manufacturer specifications."
      }
    ],
    legalRequirements: ["Professional licensing", "Insurance requirements", "Safety compliance", "Environmental regulations"],
    governingAuthority: "State Licensing Boards, Insurance Departments, Environmental Agencies",
    lastUpdated: "2024-01-15"
  },

  // Commercial & Sales (continued)
  "purchase": {
    id: "purchase",
    name: "Purchase Agreement",
    icon: ShoppingCart,
    category: "Commercial & Sales",
    description: "Purchase agreement template for buying and selling goods and products.",
    keyElements: ["Product Description", "Purchase Price", "Delivery Terms", "Payment Terms", "Warranties", "Risk of Loss"],
    standardClauses: [
      {
        title: "1. PURCHASE AND SALE",
        content: "Seller agrees to sell and Buyer agrees to purchase the goods described herein at the price and terms specified."
      },
      {
        title: "2. DELIVERY TERMS",
        content: "Delivery shall be made in accordance with the delivery schedule and terms set forth in this agreement."
      }
    ],
    legalRequirements: ["UCC compliance", "Consumer protection laws", "Product safety standards", "Warranty requirements"],
    governingAuthority: "FTC, State Consumer Protection Agencies, Product Safety Commissions",
    lastUpdated: "2024-01-15"
  },

  "distribution": {
    id: "distribution",
    name: "Distribution Agreement",
    icon: Truck,
    category: "Commercial & Sales",
    description: "Distribution agreement template for product distribution and sales channel partnerships.",
    keyElements: ["Distribution Rights", "Territory", "Sales Targets", "Marketing Support", "Pricing", "Termination"],
    standardClauses: [
      {
        title: "1. DISTRIBUTION RIGHTS",
        content: "Supplier grants Distributor the right to distribute products within the specified territory under the terms herein."
      },
      {
        title: "2. SALES OBLIGATIONS",
        content: "Distributor agrees to use best efforts to promote and sell the products within the assigned territory."
      }
    ],
    legalRequirements: ["Antitrust compliance", "International trade laws", "Product liability", "Advertising regulations"],
    governingAuthority: "DOJ Antitrust Division, FTC, Customs and Border Protection",
    lastUpdated: "2024-01-15"
  },

  "sales": {
    id: "sales",
    name: "Sales Agreement",
    icon: DollarSign,
    category: "Commercial & Sales",
    description: "Sales agreement template for commercial sales transactions and customer relationships.",
    keyElements: ["Product/Service Description", "Pricing", "Payment Terms", "Delivery", "Customer Support", "Returns"],
    standardClauses: [
      {
        title: "1. SALES TERMS",
        content: "Seller agrees to provide the products/services to Customer according to the terms and conditions set forth herein."
      },
      {
        title: "2. PAYMENT OBLIGATIONS",
        content: "Customer agrees to pay the amounts due according to the payment schedule and terms specified."
      }
    ],
    legalRequirements: ["Sales tax compliance", "Consumer protection laws", "Truth in advertising", "Return policy requirements"],
    governingAuthority: "State Tax Authorities, FTC, State Consumer Protection Agencies",
    lastUpdated: "2024-01-15"
  },

  "subscription": {
    id: "subscription",
    name: "Subscription Agreement",
    icon: CreditCard,
    category: "Commercial & Sales",
    description: "Subscription service agreement template for recurring service relationships.",
    keyElements: ["Service Description", "Subscription Terms", "Billing Cycle", "Cancellation Rights", "Service Levels", "Data Usage"],
    standardClauses: [
      {
        title: "1. SUBSCRIPTION SERVICES",
        content: "Provider agrees to provide subscription services to Customer for the term and fee specified herein."
      },
      {
        title: "2. BILLING AND PAYMENT",
        content: "Customer authorizes Provider to charge the subscription fee according to the billing cycle selected."
      }
    ],
    legalRequirements: ["Automatic renewal laws", "Cancellation rights", "Data protection", "Consumer protection"],
    governingAuthority: "FTC, State Consumer Protection Agencies, Data Protection Authorities",
    lastUpdated: "2024-01-15"
  },

  "warranty": {
    id: "warranty",
    name: "Warranty Agreement",
    icon: Shield,
    category: "Commercial & Sales",
    description: "Product warranty agreement template for warranty coverage and service obligations.",
    keyElements: ["Warranty Coverage", "Warranty Period", "Exclusions", "Remedy Procedures", "Service Obligations", "Limitations"],
    standardClauses: [
      {
        title: "1. WARRANTY COVERAGE",
        content: "Manufacturer warrants that the product will be free from defects in materials and workmanship for the warranty period."
      },
      {
        title: "2. WARRANTY REMEDIES",
        content: "In the event of a warranty claim, Manufacturer will repair, replace, or refund as specified in the remedy procedures."
      }
    ],
    legalRequirements: ["Magnuson-Moss Warranty Act", "UCC warranty provisions", "State warranty laws", "Consumer protection"],
    governingAuthority: "FTC, State Consumer Protection Agencies, State Attorney General Offices",
    lastUpdated: "2024-01-15"
  },

  // Technology & IP (continued)
  "saas": {
    id: "saas",
    name: "SaaS Agreement",
    icon: Wifi,
    category: "Technology & IP",
    description: "Software as a Service agreement template for cloud-based software services.",
    keyElements: ["Service Description", "Service Levels", "Data Security", "User Access", "Support", "Termination"],
    standardClauses: [
      {
        title: "1. SAAS SERVICES",
        content: "Provider grants Customer access to the software service hosted on Provider's systems subject to the terms herein."
      },
      {
        title: "2. DATA SECURITY",
        content: "Provider will implement reasonable security measures to protect Customer data in accordance with industry standards."
      }
    ],
    legalRequirements: ["Data protection laws", "Privacy regulations", "Security breach notification", "Export controls"],
    governingAuthority: "FTC, State Data Protection Authorities, Department of Commerce",
    lastUpdated: "2024-01-15"
  },

  "data-processing": {
    id: "data-processing",
    name: "Data Processing Agreement",
    icon: Database,
    category: "Technology & IP",
    description: "Data processing agreement template for GDPR and privacy law compliance.",
    keyElements: ["Processing Purposes", "Data Categories", "Security Measures", "Data Subject Rights", "Breach Notification", "International Transfers"],
    standardClauses: [
      {
        title: "1. DATA PROCESSING",
        content: "Processor agrees to process personal data only in accordance with Controller's instructions and applicable data protection laws."
      },
      {
        title: "2. SECURITY MEASURES",
        content: "Processor will implement appropriate technical and organizational measures to ensure data security."
      }
    ],
    legalRequirements: ["GDPR compliance", "State privacy laws", "CCPA compliance", "Security breach laws"],
    governingAuthority: "Data Protection Authorities, State Privacy Regulators, FTC",
    lastUpdated: "2024-01-15"
  },

  "hosting": {
    id: "hosting",
    name: "Hosting Agreement",
    icon: Zap,
    category: "Technology & IP",
    description: "Web hosting service agreement template for website and application hosting.",
    keyElements: ["Hosting Services", "Uptime Guarantees", "Resource Limits", "Support Services", "Data Backup", "Acceptable Use"],
    standardClauses: [
      {
        title: "1. HOSTING SERVICES",
        content: "Host agrees to provide hosting services for Customer's website/application according to the service specifications."
      },
      {
        title: "2. SERVICE LEVELS",
        content: "Host will use commercially reasonable efforts to maintain the uptime and performance levels specified herein."
      }
    ],
    legalRequirements: ["Data protection", "Telecommunications regulations", "Content liability", "Acceptable use policies"],
    governingAuthority: "FCC, State Public Utility Commissions, Data Protection Authorities",
    lastUpdated: "2024-01-15"
  },

  "development": {
    id: "development",
    name: "Development Agreement",
    icon: Code,
    category: "Technology & IP",
    description: "Software development agreement template for custom software development projects.",
    keyElements: ["Development Scope", "Specifications", "Deliverables", "Intellectual Property", "Testing", "Maintenance"],
    standardClauses: [
      {
        title: "1. DEVELOPMENT SERVICES",
        content: "Developer agrees to develop custom software according to the specifications and requirements provided by Client."
      },
      {
        title: "2. INTELLECTUAL PROPERTY",
        content: "Ownership of developed software and related intellectual property shall be as specified in the IP assignment schedule."
      }
    ],
    legalRequirements: ["Copyright law", "Work for hire provisions", "Export controls", "Open source compliance"],
    governingAuthority: "USPTO, Copyright Office, Department of Commerce",
    lastUpdated: "2024-01-15"
  },

  "api": {
    id: "api",
    name: "API Agreement",
    icon: Cog,
    category: "Technology & IP",
    description: "Application Programming Interface agreement template for API access and usage.",
    keyElements: ["API Access", "Usage Limits", "Authentication", "Rate Limiting", "Support", "Compliance"],
    standardClauses: [
      {
        title: "1. API ACCESS",
        content: "Provider grants Developer access to the API subject to the terms, conditions, and usage limits specified herein."
      },
      {
        title: "2. USAGE RESTRICTIONS",
        content: "Developer agrees to use the API only for permitted purposes and in compliance with usage guidelines."
      }
    ],
    legalRequirements: ["Terms of service compliance", "Data protection", "Export controls", "Intellectual property"],
    governingAuthority: "FTC, Data Protection Authorities, USPTO",
    lastUpdated: "2024-01-15"
  },

  // Specialized Services (continued)
  "education": {
    id: "education",
    name: "Education Service Agreement",
    icon: GraduationCap,
    category: "Specialized Services",
    description: "Educational services agreement template for schools, training, and educational programs.",
    keyElements: ["Educational Services", "Curriculum", "Student Rights", "Tuition and Fees", "Academic Standards", "Compliance"],
    standardClauses: [
      {
        title: "1. EDUCATIONAL SERVICES",
        content: "Institution agrees to provide educational services to Student according to the academic program and standards specified."
      },
      {
        title: "2. STUDENT OBLIGATIONS",
        content: "Student agrees to comply with institutional policies, academic requirements, and code of conduct."
      }
    ],
    legalRequirements: ["FERPA compliance", "Title IX compliance", "ADA compliance", "State education regulations"],
    governingAuthority: "Department of Education, State Education Departments, Accreditation Bodies",
    lastUpdated: "2024-01-15"
  },

  "transportation": {
    id: "transportation",
    name: "Transportation Agreement",
    icon: Car,
    category: "Specialized Services",
    description: "Transportation services agreement template for freight, logistics, and passenger transport.",
    keyElements: ["Transportation Services", "Routes and Schedules", "Cargo/Passenger Safety", "Insurance", "Liability", "Regulatory Compliance"],
    standardClauses: [
      {
        title: "1. TRANSPORTATION SERVICES",
        content: "Carrier agrees to provide transportation services according to the routes, schedules, and service specifications."
      },
      {
        title: "2. SAFETY AND COMPLIANCE",
        content: "Carrier shall comply with all applicable transportation safety regulations and maintain required insurance coverage."
      }
    ],
    legalRequirements: ["DOT regulations", "Commercial vehicle requirements", "Insurance mandates", "Safety standards"],
    governingAuthority: "Department of Transportation, FMCSA, State Transportation Departments",
    lastUpdated: "2024-01-15"
  },

  "logistics": {
    id: "logistics",
    name: "Logistics Agreement",
    icon: Plane,
    category: "Specialized Services",
    description: "Logistics services agreement template for supply chain and freight management.",
    keyElements: ["Logistics Services", "Supply Chain Management", "Warehousing", "Distribution", "Tracking", "Performance Metrics"],
    standardClauses: [
      {
        title: "1. LOGISTICS SERVICES",
        content: "Provider agrees to provide comprehensive logistics services including warehousing, distribution, and supply chain management."
      },
      {
        title: "2. PERFORMANCE STANDARDS",
        content: "Provider shall meet the performance metrics and service levels specified in the service level agreement."
      }
    ],
    legalRequirements: ["Transportation regulations", "Customs compliance", "Warehouse licensing", "Insurance requirements"],
    governingAuthority: "DOT, Customs and Border Protection, State Warehouse Authorities",
    lastUpdated: "2024-01-15"
  },

  "insurance": {
    id: "insurance",
    name: "Insurance Agreement",
    icon: Shield,
    category: "Specialized Services",
    description: "Insurance policy agreement template for various types of insurance coverage.",
    keyElements: ["Coverage Terms", "Policy Limits", "Premiums", "Deductibles", "Claims Process", "Exclusions"],
    standardClauses: [
      {
        title: "1. INSURANCE COVERAGE",
        content: "Insurer agrees to provide insurance coverage to Insured according to the terms, conditions, and limits specified in the policy."
      },
      {
        title: "2. CLAIMS PROCEDURES",
        content: "In the event of a covered loss, Insured must follow the claims procedures and provide required documentation."
      }
    ],
    legalRequirements: ["State insurance regulations", "Policy disclosure requirements", "Claims handling standards", "Solvency requirements"],
    governingAuthority: "State Insurance Commissioners, NAIC, Federal Insurance Regulators",
    lastUpdated: "2024-01-15"
  },

  "financial": {
    id: "financial",
    name: "Financial Services Agreement",
    icon: PiggyBank,
    category: "Specialized Services",
    description: "Financial services agreement template for banking, investment, and financial advisory services.",
    keyElements: ["Service Description", "Fees and Charges", "Risk Disclosures", "Regulatory Compliance", "Privacy Protection", "Dispute Resolution"],
    standardClauses: [
      {
        title: "1. FINANCIAL SERVICES",
        content: "Provider agrees to provide financial services to Client according to the terms and regulatory requirements specified herein."
      },
      {
        title: "2. REGULATORY COMPLIANCE",
        content: "Provider shall comply with all applicable financial services regulations and maintain required licenses and registrations."
      }
    ],
    legalRequirements: ["Banking regulations", "Securities laws", "Consumer financial protection", "Anti-money laundering"],
    governingAuthority: "CFPB, SEC, FINRA, Federal Banking Regulators, State Financial Regulators",
    lastUpdated: "2024-01-15"
  }
};

export default function ContractTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.contractId as string;
  
  const template = contractTemplates[contractId];

  if (!template) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Template Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The requested contract template could not be found.
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const IconComponent = template.icon;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <IconComponent className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{template.name}</h1>
              <Badge variant="secondary">{template.category}</Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Template Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Template Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{template.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Governing Authority</h4>
              <p className="text-sm text-muted-foreground">{template.governingAuthority}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Last Updated</h4>
              <p className="text-sm text-muted-foreground">{template.lastUpdated}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Key Elements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {template.keyElements.map((element, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm">{element}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Standard Clauses */}
      <Card>
        <CardHeader>
          <CardTitle>Standard Contract Clauses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {template.standardClauses.map((clause, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-semibold text-primary">{clause.title}</h4>
              <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                {clause.content}
              </p>
              {index < template.standardClauses.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Legal Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Requirements & Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {template.legalRequirements.map((requirement, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2" />
                <span className="text-sm">{requirement}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200">Legal Disclaimer</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This template is provided for informational purposes only and does not constitute legal advice. 
                Always consult with qualified legal counsel before using any contract template. Laws vary by 
                jurisdiction and may change over time. The user assumes all responsibility for ensuring 
                compliance with applicable laws and regulations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
