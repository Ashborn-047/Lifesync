import pandas as pd
import matplotlib.pyplot as plt
import glob
import os
import sys

def analyze_bias():
    # Find latest CSV
    csv_files = glob.glob('/app/archive/csv/*.csv')
    if not csv_files:
        print("No CSV files found.")
        return

    latest_csv = max(csv_files, key=os.path.getctime)
    print(f"Analyzing {latest_csv}...")

    df = pd.read_csv(latest_csv)

    # Persona Distribution
    persona_counts = df['PERSONA_TS'].value_counts()
    
    plt.figure(figsize=(12, 6))
    persona_counts.plot(kind='bar')
    plt.title('Persona Distribution (TS Engine)')
    plt.xlabel('Persona')
    plt.ylabel('Count')
    plt.tight_layout()
    plt.savefig('/app/archive/charts/persona_distribution.png')
    print("Saved persona_distribution.png")

    # OCEAN Distributions
    fig, axes = plt.subplots(1, 5, figsize=(20, 4))
    traits = ['O', 'C', 'E', 'A', 'N']
    for i, trait in enumerate(traits):
        df[f'OCEAN_TS_{trait}'].hist(ax=axes[i], bins=20)
        axes[i].set_title(f'{trait} Distribution')
    
    plt.tight_layout()
    plt.savefig('/app/archive/charts/ocean_distribution.png')
    print("Saved ocean_distribution.png")

    # Generate Report
    report = f"""
# Bias Analysis Report
**Source:** {latest_csv}
**Total Runs:** {len(df)}

## Persona Distribution
{persona_counts.to_markdown()}

## Top 3 Personas
{persona_counts.head(3).to_markdown()}

## Bottom 3 Personas
{persona_counts.tail(3).to_markdown()}
    """

    with open('/app/archive/reports/persona_bias_report.md', 'w') as f:
        f.write(report)
    print("Saved persona_bias_report.md")

if __name__ == "__main__":
    analyze_bias()
