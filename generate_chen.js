const fs = require('fs');

function generateChen(filename, entities, relationships) {
    let mmd = "flowchart TD\n\n";
    
    // 1. Define Entities
    for (const [entity, _] of Object.entries(entities)) {
        mmd += `    ${entity}[${entity}]\n`;
    }
    mmd += "\n";

    // 2. Define Relationships
    for (let i = 0; i < relationships.length; i++) {
        const r = relationships[i];
        const relId = `REL_${i}`;
        mmd += `    ${relId}{${r.name}}\n`;
        mmd += `    ${r.from} --- ${relId}\n`;
        mmd += `    ${relId} --- ${r.to}\n`;
    }
    mmd += "\n";

    // 3. Define Attributes
    for (const [entity, attributes] of Object.entries(entities)) {
        for (let i = 0; i < attributes.length; i++) {
            const attrId = `${entity}_ATTR_${i}`;
            const attrLabel = attributes[i].replace(/ /g, '_');
            mmd += `    ${attrId}([${attrLabel}])\n`;
            mmd += `    ${entity} --- ${attrId}\n`;
        }
    }

    fs.writeFileSync(filename, mmd);
}

// ─── CORE ───
generateChen('chen_core.mmd', {
    Users: ["id PK", "first_name", "last_name", "email UK", "password", "phone", "id_number", "address", "role", "created_at"],
    ChangeRequests: ["id PK", "request_id", "change_type", "current_value", "new_value", "status", "created_at"],
    ChangeRequestMessages: ["id PK", "sender", "message", "created_at"]
}, [
    { from: "Users", to: "ChangeRequests", name: "creates" },
    { from: "ChangeRequests", to: "ChangeRequestMessages", name: "contains" }
]);

// ─── FINANCE ───
generateChen('chen_finance.mmd', {
    Users: ["id PK"],
    Accounts: ["id PK", "account_id UK", "balance", "created_at"],
    Transactions: ["id PK", "type", "amount", "fee", "status", "recipient", "created_at"],
    Cards: ["id PK", "card_type", "card_number", "status", "prepaid_balance"],
    CardDeliveries: ["id PK", "address", "city", "status", "estimated_delivery"],
    Beneficiaries: ["id PK", "type", "name", "account_number", "bank_name"],
    Loans: ["id PK", "amount", "tenure", "interest", "status", "approved_at"]
}, [
    { from: "Users", to: "Accounts", name: "has" },
    { from: "Users", to: "Transactions", name: "sends" },
    { from: "Users", to: "Cards", name: "owns" },
    { from: "Cards", to: "CardDeliveries", name: "triggers" },
    { from: "Users", to: "Beneficiaries", name: "manages" },
    { from: "Users", to: "Loans", name: "applies_for" }
]);

// ─── KYC ───
generateChen('chen_kyc.mmd', {
    Users: ["id PK"],
    KycApplications: ["id PK", "status", "id_front", "id_back", "selfie", "proof_of_address", "match_score", "match_passed", "rejection_reason"],
    KycRequests: ["id PK", "message", "status", "document_file", "created_at"]
}, [
    { from: "Users", to: "KycApplications", name: "submits" },
    { from: "Users", to: "KycRequests", name: "receives" }
]);

console.log("MMD files generated.");
