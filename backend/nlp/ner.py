import re
from typing import List, Dict, Any, Tuple
from backend.nlp.negation import is_entity_negated

GENE_MUTATIONS = [
    "EGFR", "EGFR L858R", "EGFR T790M", "Exon 19 del", "Exon 20 ins",
    "KRAS", "KRAS G12C", "KRAS G12D", "KRAS G12V",
    "ALK", "EML4-ALK", "ROS1", "BRAF", "BRAF V600E",
    "MET", "MET exon 14", "RET", "HER2", "ERBB2", "TP53", "STK11", "KEAP1"
]

DRUG_NAMES = [
    "Osimertinib", "Tagrisso", "Sotorasib", "Lumakras", "Adagrasib", "Krazati",
    "Pembrolizumab", "Keytruda", "Atezolizumab", "Tecentriq", "Nivolumab", "Opdivo",
    "Carboplatin", "Cisplatin", "Pemetrexed", "Alimta", "Paclitaxel", "Docetaxel",
    "Gefitinib", "Iressa", "Erlotinib", "Tarceva", "Afatinib", "Gilotrif",
    "Alectinib", "Alecensa", "Brigatinib", "Lorlatinib", "Capmatinib", "Tepotinib"
]

ADVERSE_EVENTS = [
    "severe fatigue", "fatigue", "shortness of breath", "dyspnea", "pneumonitis",
    "interstitial lung disease", "cough", "chest pain", "rash", "acneiform rash",
    "diarrhea", "nausea", "vomiting", "hepatotoxicity", "elevated transaminases",
    "qtc prolongation", "peripheral neuropathy", "neutropenia", "thrombocytopenia",
    "hemoptysis", "anorexia", "stomatitis"
]

DOSAGE_PATTERN = re.compile(
    r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|mg\/m2|mg\/kg)(?:\s*(?:daily|qd|bid|tid|weekly|q3w|po|iv))?\b",
    re.IGNORECASE
)

class RuleBasedClinicalNER:
    """
    Transparent Rule-Based & Dictionary NER Baseline.
    Architecture designed with decoupled interfaces so a Hugging Face / ClinicalBERT
    token classification pipeline can be plugged in seamlessly.
    """

    @classmethod
    def extract_entities(cls, text: str) -> Dict[str, Any]:
        extracted_genes = []
        extracted_drugs = []
        extracted_dosages = []
        extracted_aes = []
        negated_entities = []

        lower_text = text.lower()

        # 1. Gene extraction (match longest strings first)
        for gene in sorted(GENE_MUTATIONS, key=len, reverse=True):
            pattern = r"\b" + re.escape(gene.lower()) + r"\b"
            if re.search(pattern, lower_text):
                is_neg, reason = is_entity_negated(gene, text)
                if is_neg:
                    negated_entities.append(f"{gene} ({reason})")
                else:
                    if gene not in extracted_genes:
                        extracted_genes.append(gene)

        # 2. Drug extraction
        for drug in sorted(DRUG_NAMES, key=len, reverse=True):
            pattern = r"\b" + re.escape(drug.lower()) + r"\b"
            if re.search(pattern, lower_text):
                is_neg, reason = is_entity_negated(drug, text)
                if is_neg:
                    negated_entities.append(f"{drug} ({reason})")
                else:
                    if drug not in extracted_drugs:
                        extracted_drugs.append(drug)

        # 3. Dosage extraction
        dosages_found = DOSAGE_PATTERN.findall(text)
        for dose in dosages_found:
            clean_dose = dose.strip()
            if clean_dose not in extracted_dosages:
                extracted_dosages.append(clean_dose)

        # 4. Adverse Event extraction (match longer compound phrases first)
        for ae in sorted(ADVERSE_EVENTS, key=len, reverse=True):
            pattern = r"\b" + re.escape(ae.lower()) + r"\b"
            if re.search(pattern, lower_text):
                is_neg, reason = is_entity_negated(ae, text)
                if is_neg:
                    negated_entities.append(f"{ae} ({reason})")
                else:
                    # Avoid subphrase duplicate (e.g. if 'severe fatigue' matched, skip 'fatigue')
                    if not any(ae in existing and ae != existing for existing in extracted_aes):
                        if ae not in extracted_aes:
                            extracted_aes.append(ae)

        return {
            "gene_mutation": extracted_genes,
            "drug_name": extracted_drugs,
            "dosage": extracted_dosages,
            "adverse_event": extracted_aes,
            "negated_entities": negated_entities,
            "engine": "Transparent Rule-Based Medical NER Baseline (Dictionary & NegEx)"
        }
