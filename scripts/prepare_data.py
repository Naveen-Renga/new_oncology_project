import os
import json
import pandas as pd
from backend.ml.train import generate_nsclc_research_dataset
from backend.slm.dataset import export_dataset_json

def main():
    print("Preparing OncoPrecision research datasets...")
    os.makedirs("./data/raw", exist_ok=True)
    os.makedirs("./data/processed", exist_ok=True)
    os.makedirs("./data/synthetic", exist_ok=True)

    # 1. Generate full 11,507 row cohort for ML benchmarking
    df = generate_nsclc_research_dataset(n_samples=11507)
    raw_path = "./data/raw/nsclc_cohort_raw.csv"
    df.to_csv(raw_path, index=False)
    print(f"Generated raw cohort ({len(df)} records) -> {raw_path}")

    # 2. Export SLM prompt-response pairs
    slm_path = "./data/synthetic/slm_pairs.json"
    export_dataset_json(slm_path)
    print(f"Exported SLM dataset pairs -> {slm_path}")

    print("Data preparation complete!")

if __name__ == "__main__":
    main()
