import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# Reliable predictive feature columns (EXCLUDING patient_id and artificial TNM/tumor size columns)
NUMERICAL_FEATURES = [
    "age",
    "creatinine_mg_dl",
    "alt_u_l",
    "ast_u_l",
    "platelets_k_ul",
    "anc_k_ul",
    "tmb_mut_mb",
    "ctdna_change_pct",
    "pdl1_tps_pct"
]

CATEGORICAL_FEATURES = [
    "smoking_history",
    "egfr_status",
    "alk_status",
    "kras_status"
]

# Explicitly prohibited features to prevent data leakage and artificial bias
PROHIBITED_FEATURES = [
    "patient_id",
    "TNM_T",
    "TNM_N",
    "TNM_M",
    "tumor_size_cm",
    "tumor_location",
    "histology_type",
    "ECOG_performance_status",
    "metastasis_site"
]

def clean_and_validate_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Performs schema validation, duplicate detection, and missing-value analysis.
    Ensures patient_id and artificial columns are stripped from feature matrices.
    """
    initial_rows = len(df)
    duplicates = int(df.duplicated(subset=["patient_id"]).sum()) if "patient_id" in df.columns else 0
    df_clean = df.drop_duplicates(subset=["patient_id"]) if "patient_id" in df.columns else df.copy()

    # Missing value analysis
    missing_counts = df_clean.isnull().sum().to_dict()

    # Drop prohibited columns
    cols_to_drop = [c for c in PROHIBITED_FEATURES if c in df_clean.columns]
    df_features = df_clean.drop(columns=cols_to_drop, errors="ignore")

    audit_summary = {
        "initial_rows": initial_rows,
        "clean_rows": len(df_clean),
        "duplicate_records_removed": duplicates,
        "prohibited_columns_dropped": cols_to_drop,
        "missing_value_summary": {k: v for k, v in missing_counts.items() if v > 0}
    }

    return df_features, audit_summary

def build_preprocessing_pipeline() -> ColumnTransformer:
    """
    Constructs a scikit-learn ColumnTransformer:
    - Numerical: Median imputation + StandardScaler
    - Categorical: Most frequent imputation + OneHotEncoder
    """
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )
    return preprocessor
