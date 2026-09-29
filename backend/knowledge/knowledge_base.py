from typing import List, Dict, Any, Optional

class KnowledgeDocument:
    def __init__(self, doc_id: str, title: str, source: str, category: str, content: str, disclaimer: str = "DEMO / NOT CLINICAL GUIDANCE"):
        self.doc_id = doc_id
        self.title = title
        self.source = source
        self.category = category
        self.content = content
        self.disclaimer = disclaimer

    def to_dict(self) -> Dict[str, Any]:
        return {
            "doc_id": self.doc_id,
            "title": self.title,
            "source": self.source,
            "category": self.category,
            "content": self.content,
            "disclaimer": self.disclaimer
        }

class KnowledgeBase:
    """
    Curated clinical oncology knowledge base simulation.
    All entries explicitly stamped with 'DEMO / NOT CLINICAL GUIDANCE'.
    Supports keyword, semantic tag, and gene/drug retrieval.
    """

    def __init__(self):
        self._documents: List[KnowledgeDocument] = [
            KnowledgeDocument(
                doc_id="NCCN-NSCLC-2024-EGFR",
                title="Simulated NCCN Principle: Sensitizing EGFR Mutations in Advanced NSCLC",
                source="Simulated Guideline Digest (DEMO / NOT CLINICAL GUIDANCE)",
                category="SOP/Guideline",
                content=(
                    "For patients with sensitizing EGFR mutations (Exon 19 del or L858R) in metastatic NSCLC: "
                    "Preferred first-line standard of care simulation: Third-generation EGFR TKI (Osimertinib). "
                    "In patients experiencing secondary T790M or MET amplification resistance, combined targeted therapy "
                    "or clinical trial evaluation is recommended. Monitor renal function and QTc intervals."
                )
            ),
            KnowledgeDocument(
                doc_id="NCCN-NSCLC-2024-KRAS",
                title="Simulated NCCN Principle: KRAS G12C Mutation Targeted Therapy",
                source="Simulated Guideline Digest (DEMO / NOT CLINICAL GUIDANCE)",
                category="SOP/Guideline",
                content=(
                    "For patients with confirmed KRAS G12C mutation previously treated with platinum-based doublet "
                    "and immunotherapy: Sotorasib or Adagrasib oral targeted therapy demonstrated clinical activity. "
                    "Elevated ALT/AST requires routine bi-weekly monitoring during first 3 months of treatment."
                )
            ),
            KnowledgeDocument(
                doc_id="FDA-DRUG-OSIMERTINIB-2023",
                title="Simulated FDA Safety Bulletin: Osimertinib Warnings and Precautionary Monitoring",
                source="Simulated Regulatory Bulletin (DEMO / NOT CLINICAL GUIDANCE)",
                category="FDA Bulletin",
                content=(
                    "Adverse reactions: Interstitial Lung Disease (ILD)/pneumonitis occurred in 3.9% of patients; "
                    "withhold immediately if suspected. QTc interval prolongation occurred in 4.9%. Cardiomyopathy "
                    "and severe fatigue warrant dose reduction from 80mg to 40mg once daily or temporary holiday."
                )
            ),
            KnowledgeDocument(
                doc_id="TRIAL-NCT-0941829-FLAURA2",
                title="Simulated Trial Registry: NCT0941829 - Platinum/Pemetrexed + EGFR TKI Expansion",
                source="Simulated ClinicalTrials.gov (DEMO / NOT CLINICAL GUIDANCE)",
                category="Trial Registry",
                content=(
                    "Phase III randomized trial evaluating Osimertinib plus platinum doublet chemotherapy "
                    "in advanced EGFR mutant NSCLC with high circulating tumor DNA (ctDNA) dynamics or CNS risk. "
                    "Inclusion: EGFR Exon 19 del / L858R, ANC >= 1.5, Creatinine <= 1.5x ULN. Available Slot: 1."
                )
            ),
            KnowledgeDocument(
                doc_id="TRIAL-NCT-0883192-KRYSTAL",
                title="Simulated Trial Registry: NCT0883192 - Next-Gen KRAS/SHP2 Combination",
                source="Simulated ClinicalTrials.gov (DEMO / NOT CLINICAL GUIDANCE)",
                category="Trial Registry",
                content=(
                    "Phase II trial evaluating KRAS G12C inhibitor combined with SHP2 inhibitor for recurrent NSCLC. "
                    "Inclusion: Confirmed KRAS G12C, progression after checkpoint inhibitor, adequate hepatic reserve "
                    "(ALT/AST <= 2.5x ULN). Available Slot: 1."
                )
            ),
            KnowledgeDocument(
                doc_id="PHARM-FORMULARY-INST-2024",
                title="Institutional Pharmacy Oncology Formulary and Co-pay Tier",
                source="Hospital Pharmacy & Therapeutics Committee (DEMO / NOT CLINICAL GUIDANCE)",
                category="Pharmacy Formulary",
                content=(
                    "Formulary Status: Osimertinib 80mg, 40mg (Tier 4 Specialty, Prior Auth required). "
                    "Sotorasib 960mg daily (Tier 4 Specialty). Adagrasib 600mg BID (Tier 4 Specialty). "
                    "Pemetrexed IV infusion (Tier 2 Preferred Inpatient/Infusion). Renal dose reduction schedule available."
                )
            )
        ]

    def query(self, search_text: str, category: Optional[str] = None, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Simple deterministic keyword & tag relevance matching for research demo.
        """
        tokens = [t.lower() for t in search_text.replace(",", " ").replace("-", " ").split() if len(t) > 2]
        scored_docs = []

        for doc in self._documents:
            if category and doc.category.lower() != category.lower():
                continue
            text_to_search = (doc.title + " " + doc.content).lower()
            score = sum(1 for token in tokens if token in text_to_search)
            if score > 0 or not tokens:
                scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        results = [doc.to_dict() for _, doc in scored_docs[:limit]]
        if not results:
            # Fallback to top documents if no keyword matched
            results = [doc.to_dict() for doc in self._documents[:limit]]
        return results

# Singleton instance
knowledge_base = KnowledgeBase()
