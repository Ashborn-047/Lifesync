"""
LifeSync Personality Engine - PDF Generator
Generates PDF reports for personality assessments
"""

import io
from datetime import datetime
from typing import Dict, Optional

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4, letter
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.pdfgen import canvas
    from reportlab.platypus import (
        PageBreak,
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


def generate_pdf(
    assessment_id: str,
    traits: Dict[str, float],
    facets: Dict[str, float],
    mbti: str,
    explanation: Optional[str] = None,
    name: Optional[str] = None
) -> bytes:
    """
    Generate a PDF report for a personality assessment.
    
    Args:
        assessment_id: Assessment ID
        traits: Dictionary of trait scores (O, C, E, A, N)
        facets: Dictionary of facet scores
        mbti: MBTI proxy code
        explanation: LLM-generated explanation text
        name: Optional name for the report
    
    Returns:
        PDF file as bytes
    """
    if not REPORTLAB_AVAILABLE:
        raise ImportError(
            "reportlab is required for PDF generation. "
            "Install with: pip install reportlab"
        )
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#667eea'),
        spaceAfter=30,
        alignment=1  # Center
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#764ba2'),
        spaceAfter=12
    )
    
    # Title
    elements.append(Paragraph("LifeSync Personality Report", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Date and ID
    date_str = datetime.now().strftime("%B %d, %Y")
    if name:
        elements.append(Paragraph(f"<b>Name:</b> {name}", styles['Normal']))
    elements.append(Paragraph(f"<b>Date:</b> {date_str}", styles['Normal']))
    elements.append(Paragraph(f"<b>Assessment ID:</b> {assessment_id[:8]}...", styles['Normal']))
    elements.append(Spacer(1, 0.3*inch))
    
    # MBTI Type
    elements.append(Paragraph("Your MBTI Type", heading_style))
    elements.append(Paragraph(f"<font size=20><b>{mbti}</b></font>", styles['Normal']))
    elements.append(Spacer(1, 0.2*inch))
    
    # Trait Scores
    elements.append(Paragraph("Big Five Trait Scores", heading_style))
    
    trait_names = {
        'O': 'Openness',
        'C': 'Conscientiousness',
        'E': 'Extraversion',
        'A': 'Agreeableness',
        'N': 'Neuroticism'
    }
    
    trait_data = [['Trait', 'Score (%)']]
    for trait_key in ['O', 'C', 'E', 'A', 'N']:
        score = traits.get(trait_key, 0) * 100 if isinstance(traits.get(trait_key), float) else traits.get(trait_key, 0)
        trait_name = trait_names.get(trait_key, trait_key)
        trait_data.append([trait_name, f"{score:.1f}%"])
    
    trait_table = Table(trait_data, colWidths=[4*inch, 2*inch])
    trait_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(trait_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Facet Scores (Top 10)
    if facets:
        elements.append(Paragraph("Top Facet Scores", heading_style))
        
        # Sort facets by score
        sorted_facets = sorted(facets.items(), key=lambda x: x[1], reverse=True)[:10]
        
        facet_data = [['Facet', 'Score (%)']]
        for facet_key, facet_score in sorted_facets:
            score = facet_score * 100 if isinstance(facet_score, float) else facet_score
            facet_data.append([facet_key, f"{score:.1f}%"])
        
        facet_table = Table(facet_data, colWidths=[4*inch, 2*inch])
        facet_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#764ba2')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(facet_table)
        elements.append(Spacer(1, 0.3*inch))
    
    # Explanation
    if explanation:
        elements.append(PageBreak())
        elements.append(Paragraph("AI-Generated Insights", heading_style))
        # Split explanation into paragraphs
        explanation_paragraphs = explanation.split('\n\n')
        for para in explanation_paragraphs:
            if para.strip():
                elements.append(Paragraph(para.strip(), styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

