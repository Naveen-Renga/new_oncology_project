import time
import uuid
from typing import Dict, Any, List
from backend.agent.state import AgentState, ToolExecutionTrace
from backend.agent.tools import AgentTools
from backend.agent.policies import AgentClinicalPolicies
from backend.agent.audit import AgentRunAuditor
from backend.safety.audit import SafetyAuditLogger

def run_agentic_decision_support(
    patient_data: Dict[str, Any],
    clinical_objective: str = "Optimize targeted therapy and trial prioritization under organ toxicity constraints",
    patient_b_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Executes a complete ReAct-style Decision-Support Workflow:
    GOAL -> REASON -> ACT -> OBSERVE -> REASON -> DECISION SUPPORT -> HUMAN APPROVAL GATE.
    """
    run_id = f"RUN-{uuid.uuid4().hex[:8].upper()}"
    patient_id = patient_data.get("patient_id", "PT-NSCLC-0104")
    traces: List[Dict[str, Any]] = []
    step = 1

    # --- Step 1: Reason on Patient Risk & Kinetics ---
    t0 = time.perf_counter()
    risk_output = AgentTools.patient_risk_tool(patient_data)
    lat1 = round((time.perf_counter() - t0) * 1000, 2)
    traces.append({
        "step": step,
        "tool": "Patient Risk Tool (Stage 1 ML)",
        "input": {"patient_id": patient_id},
        "output": risk_output,
        "reasoning": "Assess baseline predictive risk level and probability calibration before evaluating clinical trials or therapies.",
        "latency_ms": lat1
    })
    step += 1

    # --- Step 2: Act & Observe: Query SOP / Guidelines ---
    t0 = time.perf_counter()
    gene = patient_data.get("egfr_status", "EGFR")
    guideline_output = AgentTools.sop_guideline_tool(f"NSCLC {gene}")
    lat2 = round((time.perf_counter() - t0) * 1000, 2)
    traces.append({
        "step": step,
        "tool": "SOP / Guideline Retrieval Tool",
        "input": {"search_topic": f"NSCLC {gene}"},
        "output": guideline_output,
        "reasoning": f"Retrieve institutional SOPs and guideline digests for {gene} positive advanced NSCLC.",
        "latency_ms": lat2
    })
    step += 1

    # --- Step 3: Act & Observe: Query Simulated Trial Registry ---
    t0 = time.perf_counter()
    trial_output = AgentTools.trial_registry_tool(
        biomarker_query=gene,
        patient_labs={
            "creatinine_mg_dl": patient_data.get("creatinine_mg_dl", 1.0),
            "alt_u_l": patient_data.get("alt_u_l", 25.0)
        }
    )
    lat3 = round((time.perf_counter() - t0) * 1000, 2)
    traces.append({
        "step": step,
        "tool": "Trial Registry Tool",
        "input": {"biomarker_target": gene, "creatinine": patient_data.get("creatinine_mg_dl", 1.0)},
        "output": trial_output,
        "reasoning": "Identify open clinical trial protocols matching genomic profile and verify organ inclusion boundaries.",
        "latency_ms": lat3
    })
    step += 1

    # --- Step 4: Act & Observe: Check Pharmacy Formulary ---
    t0 = time.perf_counter()
    matched_drug = "Osimertinib" if "egfr" in gene.lower() else "Sotorasib"
    pharm_output = AgentTools.pharmacy_formulary_tool(
        drug_name=matched_drug,
        renal_creatinine=patient_data.get("creatinine_mg_dl", 1.0)
    )
    lat4 = round((time.perf_counter() - t0) * 1000, 2)
    traces.append({
        "step": step,
        "tool": "Pharmacy Formulary Tool",
        "input": {"drug_name": matched_drug},
        "output": pharm_output,
        "reasoning": f"Verify institutional formulary availability, co-pay tier, and organ impairment dosing precautions for {matched_drug}.",
        "latency_ms": lat4
    })
    step += 1

    # --- Step 5: Optional Comparative Evaluation (Single Slot Scenario) ---
    prioritization_result = None
    if patient_b_data:
        t0 = time.perf_counter()
        top_trial = trial_output["trials"][0] if trial_output["trials"] else {}
        prioritization_result = AgentClinicalPolicies.evaluate_trial_slot_prioritization(
            patient_a={"id": patient_id, "genomics": gene, "ctdna_change_pct": patient_data.get("ctdna_change_pct", 15.0), "creatinine_mg_dl": patient_data.get("creatinine_mg_dl", 1.0)},
            patient_b=patient_b_data,
            trial=top_trial
        )
        lat5 = round((time.perf_counter() - t0) * 1000, 2)
        traces.append({
            "step": step,
            "tool": "Comparative Prioritization Policy",
            "input": {"patient_a": patient_id, "patient_b": patient_b_data.get("id", "Patient B")},
            "output": prioritization_result,
            "reasoning": "Evaluate ethical and clinical criteria for constrained trial slot allocation.",
            "latency_ms": lat5
        })
        step += 1

    # --- Step 6: Reason & Synthesize Decision-Support Recommendation ---
    eligible_trials = [t for t in trial_output.get("trials", []) if t.get("patient_eligible")]
    recommended_trial = eligible_trials[0] if eligible_trials else None

    summary_paragraphs = [
        f"Goal: {clinical_objective}.",
        f"1. Risk Assessment: Stage 1 ML model indicates {risk_output['risk_level']} risk with calibrated probabilities: {risk_output['probabilities']}.",
        f"2. Guideline Alignment: Institutional guidelines recommend targeted therapy combination or clinical trial consideration for {gene}-altered NSCLC.",
        f"3. Trial Feasibility: Candidate protocol '{recommended_trial['title'] if recommended_trial else 'No trial with open slot'}' verified for organ safety.",
        f"4. Formulary Status: Standard agent '{matched_drug}' is in-stock under {pharm_output['formulary_entry']['tier']} with monitoring precautions.",
    ]
    if prioritization_result:
        summary_paragraphs.append(f"5. Slot Prioritization: {prioritization_result['decision_support_rationale']}")

    summary_text = " \n".join(summary_paragraphs)

    evidence_citations = [
        {"doc_id": "NCCN-NSCLC-2024-EGFR", "title": "Simulated Guideline Digest (DEMO / NOT CLINICAL GUIDANCE)"},
        {"doc_id": "TRIAL-NCT-0941829", "title": "Simulated Trial Registry NCT0941829"},
        {"doc_id": "PHARM-FORMULARY-2024", "title": "Hospital Oncology Formulary"}
    ]

    response_data = {
        "run_id": run_id,
        "patient_id": patient_id,
        "goal": clinical_objective,
        "traces": traces,
        "decision_support_summary": summary_text,
        "recommended_trial": recommended_trial,
        "recommended_therapy": pharm_output["formulary_entry"],
        "evidence_citations": evidence_citations,
        "requires_human_approval": True,
        "status": "Awaiting Human Approval",
        "disclaimer": "DECISION SUPPORT / RESEARCH SIMULATION: Requires human clinician approval prior to clinical order or trial enrollment."
    }

    # Record in agent audit and system safety logs
    AgentRunAuditor.record_run(response_data)
    SafetyAuditLogger.record(
        stage="Agent",
        input_reference=f"Run: {run_id} | Patient: {patient_id}",
        output_summary=f"Decision-support generated for {patient_id}. Recommended trial: {recommended_trial['trial_id'] if recommended_trial else 'None'}. Gated for human approval.",
        model_name="ReAct Agentic Workflow (LangGraph Pattern)",
        confidence=0.92,
        requires_approval=True,
        approval_status="Pending"
    )

    return response_data
