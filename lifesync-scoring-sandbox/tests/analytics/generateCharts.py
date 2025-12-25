import pandas as pd
import matplotlib.pyplot as plt
import sys
import os
import glob
import json

def generate_charts(run_dir):
    print(f"Generating charts for {run_dir}...")
    csv_files = glob.glob(os.path.join(run_dir, '*.csv'))
    if not csv_files:
        print("No CSV files found.")
        return

    # Load all CSVs
    df_list = []
    for f in csv_files:
        try:
            df = pd.read_csv(f)
            df['scenario'] = os.path.basename(f).replace('.csv', '')
            df_list.append(df)
        except Exception as e:
            print(f"Error reading {f}: {e}")

    if not df_list:
        return

    df = pd.concat(df_list, ignore_index=True)
    
    # Ensure output directory exists
    output_dir = os.path.join(os.path.dirname(run_dir), 'charts')
    os.makedirs(output_dir, exist_ok=True)

    # 1. Persona Distribution (Bar Chart)
    plt.figure(figsize=(12, 6))
    # Count personas per scenario
    persona_counts = df.groupby(['scenario', 'persona_ts']).size().unstack(fill_value=0)
    persona_counts.plot(kind='bar', stacked=True)
    plt.title('Persona Distribution by Scenario')
    plt.xlabel('Scenario')
    plt.ylabel('Count')
    plt.legend(title='Persona', bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'persona_distribution.png'))
    plt.close()

    # 2. Match Rate by Scenario
    plt.figure(figsize=(8, 6))
    match_rates = df.groupby('scenario')['match'].mean() * 100
    match_rates.plot(kind='bar', color='skyblue')
    plt.title('Match Rate (%) by Scenario')
    plt.ylabel('Match Rate (%)')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'match_rates.png'))
    plt.close()

    # 3. Mismatch Heatmap (Pattern Type vs Scenario) - Simplified as Table or Scatter
    mismatches = df[df['match'] == False]
    if not mismatches.empty:
        plt.figure(figsize=(12, 8))
        # Create a matrix of mismatches
        heatmap_data = mismatches.groupby(['pattern_type', 'scenario']).size().unstack(fill_value=0)
        plt.imshow(heatmap_data, cmap='Reds', aspect='auto')
        plt.colorbar(label='Mismatch Count')
        plt.xticks(range(len(heatmap_data.columns)), heatmap_data.columns, rotation=45)
        plt.yticks(range(len(heatmap_data.index)), heatmap_data.index)
        plt.title('Mismatch Count Heatmap')
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'mismatch_heatmap.png'))
        plt.close()

    print("Charts generated.")

if __name__ == "__main__":
    archive_dir = sys.argv[1] if len(sys.argv) > 1 else '/app/archive'
    generate_charts(os.path.join(archive_dir, 'csv'))
