import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import sys
import os
import glob
import json

def generate_radar_drift(batch1_dir, batch2_dir, output_dir):
    print(f"Generating Radar Drift Analysis: {batch1_dir} vs {batch2_dir}")
    
    os.makedirs(output_dir, exist_ok=True)

    # Load Data
    def load_batch(directory):
        csv_files = glob.glob(os.path.join(directory, '*.csv'))
        df_list = []
        for f in csv_files:
            try:
                df = pd.read_csv(f)
                # Only keep successful matches for drift analysis to avoid noise from errors
                df = df[df['match'] == True]
                df_list.append(df)
            except Exception as e:
                print(f"Error reading {f}: {e}")
        return pd.concat(df_list, ignore_index=True) if df_list else pd.DataFrame()

    df1 = load_batch(batch1_dir)
    df2 = load_batch(batch2_dir)

    if df1.empty or df2.empty:
        print("One or both batches are empty. Skipping drift analysis.")
        return

    # Traits
    traits = ['ocean_ts_O', 'ocean_ts_C', 'ocean_ts_E', 'ocean_ts_A', 'ocean_ts_N']
    labels = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism']

    # Calculate Medians
    median1 = df1[traits].median().values
    median2 = df2[traits].median().values

    # Calculate Variance
    var1 = df1[traits].var().values
    var2 = df2[traits].var().values

    # --- Chart 1: Median Drift Radar ---
    angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
    angles += angles[:1] # Close the loop

    median1 = np.concatenate((median1, [median1[0]]))
    median2 = np.concatenate((median2, [median2[0]]))

    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))
    ax.fill(angles, median1, color='blue', alpha=0.25, label='Batch 1 Median')
    ax.plot(angles, median1, color='blue', linewidth=2)
    ax.fill(angles, median2, color='red', alpha=0.25, label='Batch 2 Median')
    ax.plot(angles, median2, color='red', linewidth=2)

    ax.set_yticklabels([])
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(labels)
    plt.title('OCEAN Median Drift: Batch 1 vs Batch 2')
    plt.legend(loc='upper right', bbox_to_anchor=(1.1, 1.1))
    plt.savefig(os.path.join(output_dir, 'radar_drift_median.png'))
    plt.close()

    # --- Chart 2: Centroid Shift Metrics ---
    # Calculate Euclidean distance between centroids
    centroid_dist = np.linalg.norm(median1[:-1] - median2[:-1])
    
    # Write Summary
    with open(os.path.join(output_dir, 'drift_summary.txt'), 'w') as f:
        f.write("Drift Analysis Summary\n")
        f.write("======================\n")
        f.write(f"Batch 1 Runs: {len(df1)}\n")
        f.write(f"Batch 2 Runs: {len(df2)}\n")
        f.write(f"Centroid Shift (Euclidean): {centroid_dist:.4f}\n\n")
        f.write("Trait Medians (Batch 1 -> Batch 2):\n")
        for i, label in enumerate(labels):
            f.write(f"  {label}: {median1[i]:.2f} -> {median2[i]:.2f} (Delta: {median2[i]-median1[i]:.2f})\n")
        
        if centroid_dist > 5.0: # Arbitrary threshold for "significant" drift on 0-100 scale
            f.write("\nWARNING: Significant centroid shift detected!\n")
        else:
            f.write("\nStatus: Stable (No significant drift)\n")

    print("Drift analysis completed.")

if __name__ == "__main__":
    # Default paths assuming running from repo root
    b1 = '/app/archive/csv' # Batch 1 (legacy path)
    b2 = '/app/archive/batch2/csv'
    out = '/app/archive/batch2/charts'
    
    if len(sys.argv) > 3:
        b1 = sys.argv[1]
        b2 = sys.argv[2]
        out = sys.argv[3]

    generate_radar_drift(b1, b2, out)
