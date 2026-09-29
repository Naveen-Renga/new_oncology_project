import json
from backend.app.database import Base, engine, SessionLocal
from backend.app.models.models import User, Patient, ClinicalNote, ModelMetric, AuditLog

def seed_db():
    print("Initializing and seeding database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Seed Clinician User
        if not db.query(User).filter_by(username="dr.oncoclinician").first():
            user = User(
                username="dr.oncoclinician",
                role="thoracic_oncologist",
                department="Precision Thoracic Oncology"
            )
            db.add(user)
            db.commit()
            print("Seeded primary clinician user.")

        # Seed Patients
        with open("./data/sample/nsclc_sample.json", "r") as f:
            sample_patients = json.load(f)

        for p_data in sample_patients:
            pid = p_data["patient_id"]
            if not db.query(Patient).filter_by(id=pid).first():
                pat = Patient(
                    id=pid,
                    age=p_data["age"],
                    sex=p_data["sex"],
                    smoking_history=p_data["smoking_history"],
                    primary_diagnosis=p_data["primary_diagnosis"],
                    stage_category=p_data["stage_category"],
                    clinical_labs={
                        "creatinine_mg_dl": p_data["creatinine_mg_dl"],
                        "alt_u_l": p_data["alt_u_l"],
                        "ast_u_l": p_data["ast_u_l"],
                        "platelets_k_ul": p_data["platelets_k_ul"],
                        "anc_k_ul": p_data["anc_k_ul"],
                        "tmb_mut_mb": p_data["tmb_mut_mb"],
                        "ctdna_change_pct": p_data["ctdna_change_pct"]
                    },
                    biomarkers={
                        "egfr_status": p_data["egfr_status"],
                        "alk_status": p_data["alk_status"],
                        "kras_status": p_data["kras_status"],
                        "pdl1_tps_pct": p_data["pdl1_tps_pct"]
                    }
                )
                db.add(pat)

                note = ClinicalNote(
                    patient_id=pid,
                    author_role="Thoracic Oncologist",
                    raw_text=p_data["clinical_note"],
                    deidentified_text=p_data["clinical_note"]
                )
                db.add(note)

        db.commit()
        print("Database seeded with sample patients and clinical notes successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
