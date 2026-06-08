import os
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

def generate_patient_pdf_report(patient: dict, admission: dict, assessment: dict, output_dir: str = "reports") -> str:
    """
    Generates a beautifully styled, enterprise-grade clinical readmission risk report.
    Returns the absolute path of the generated PDF file.
    """
    os.makedirs(output_dir, exist_ok=True)
    filename = f"readmission_report_{patient['patient_mrn']}_{admission['id']}.pdf"
    filepath = os.path.join(output_dir, filename)
    
    # Setup document
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles for clinical presentation
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1A365D') # Slate Blue
    )
    
    section_style = ParagraphStyle(
        'SecTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#2C5282'),
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#2D3748')
    )
    
    meta_label_style = ParagraphStyle(
        'MetaLabel',
        parent=styles['BodyText'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#4A5568')
    )
    
    meta_val_style = ParagraphStyle(
        'MetaValue',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1A202C')
    )
    
    narrative_style = ParagraphStyle(
        'Narrative',
        parent=styles['BodyText'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#2D3748'),
        backColor=colors.HexColor('#F7FAFC'),
        borderColor=colors.HexColor('#E2E8F0'),
        borderWidth=1,
        borderPadding=10,
        spaceBefore=6,
        spaceAfter=12
    )

    story = []
    
    # Header Banner Table
    header_data = [
        [
            Paragraph("CLINICAL DECISION SUPPORT SYSTEM (CDSS)", ParagraphStyle('BannerL', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#718096'))),
            Paragraph("CONFIDENTIAL MEDICAL REPORT", ParagraphStyle('BannerR', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, alignment=2, textColor=colors.HexColor('#E53E3E')))
        ]
    ]
    header_table = Table(header_data, colWidths=[4.0*inch, 3.5*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    
    # Report Title
    story.append(Paragraph("Patient Readmission Risk Assessment", title_style))
    story.append(Spacer(1, 15))
    
    # Section 1: Patient Demographics & Admission Details (side by side in table)
    story.append(Paragraph("1. Patient Demographics & Admission Info", section_style))
    
    dob_str = patient.get("date_of_birth", "")
    if isinstance(dob_str, datetime.datetime):
        dob_str = dob_str.strftime("%m/%d/%Y")
        
    adm_str = admission.get("admission_date", "")
    if isinstance(adm_str, datetime.datetime):
        adm_str = adm_str.strftime("%m/%d/%Y")
        
    dis_str = admission.get("discharge_date", "")
    if isinstance(dis_str, datetime.datetime):
        dis_str = dis_str.strftime("%m/%d/%Y")

    meta_table_data = [
        [
            Paragraph("Patient Name / ID:", meta_label_style), Paragraph(f"Patient {patient.get('id')}", meta_val_style),
            Paragraph("Admission Date:", meta_label_style), Paragraph(adm_str, meta_val_style)
        ],
        [
            Paragraph("MRN:", meta_label_style), Paragraph(patient.get("patient_mrn", "N/A"), meta_val_style),
            Paragraph("Discharge Date:", meta_label_style), Paragraph(dis_str, meta_val_style)
        ],
        [
            Paragraph("Gender:", meta_label_style), Paragraph(patient.get("gender", "N/A"), meta_val_style),
            Paragraph("Admission Type:", meta_label_style), Paragraph(admission.get("admission_type", "N/A"), meta_val_style)
        ],
        [
            Paragraph("Race:", meta_label_style), Paragraph(patient.get("race", "N/A"), meta_val_style),
            Paragraph("Discharge Disposition:", meta_label_style), Paragraph(admission.get("discharge_disposition", "N/A"), meta_val_style)
        ],
        [
            Paragraph("DOB / Age:", meta_label_style), Paragraph(f"{dob_str} ({patient.get('age', 'N/A')} yrs)", meta_val_style),
            Paragraph("Primary Insurance:", meta_label_style), Paragraph(admission.get("insurance", "N/A"), meta_val_style)
        ]
    ]
    
    meta_table = Table(meta_table_data, colWidths=[1.3*inch, 2.35*inch, 1.3*inch, 2.55*inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))
    
    # Section 2: Readmission Risk Assessment
    story.append(Paragraph("2. 30-Day Readmission Risk Analysis", section_style))
    
    prob = assessment.get("probability", 0.0)
    tier = assessment.get("risk_tier", "Low")
    
    # Choose color based on risk tier
    bg_color = '#EDFDFD' # light teal
    border_color = '#319795' # teal
    text_color = '#234E52' # dark teal
    if tier == "Medium":
        bg_color = '#FEFCBF' # light yellow
        border_color = '#D69E2E' # yellow
        text_color = '#744210' # dark yellow
    elif tier == "High":
        bg_color = '#FED7D7' # light red
        border_color = '#E53E3E' # red
        text_color = '#742A2A' # dark red
        
    risk_value_paragraph = Paragraph(
        f"<b>Calculated Readmission Risk:</b> {prob*100:.1f}%<br/>"
        f"<b>Risk Classification:</b> {tier.upper()} RISK",
        ParagraphStyle('RiskLabel', parent=styles['Normal'], fontName='Helvetica', fontSize=11, leading=16, textColor=colors.HexColor(text_color))
    )
    
    risk_panel_data = [[risk_value_paragraph]]
    risk_panel_table = Table(risk_panel_data, colWidths=[7.5*inch])
    risk_panel_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg_color)),
        ('BOX', (0,0), (-1,-1), 2, colors.HexColor(border_color)),
        ('PADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(risk_panel_table)
    story.append(Spacer(1, 15))
    
    # Section 3: Explainable AI Clinical Insights (SHAP)
    story.append(Paragraph("3. Explainable AI (SHAP) Clinical Driver Analysis", section_style))
    
    narrative_text = assessment.get("risk_explanation", "No explanation narrative available.")
    story.append(Paragraph(f"<b>Narrative Explanation:</b><br/>{narrative_text}", narrative_style))
    story.append(Spacer(1, 8))
    
    # Table of key feature contributions
    story.append(Paragraph("<b>Top Risk Drivers (Waterfall Breakdown):</b>", ParagraphStyle('Sub', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=14)))
    story.append(Spacer(1, 4))
    
    contrib_headers = [
        Paragraph("<b>Clinical Feature</b>", meta_label_style),
        Paragraph("<b>Patient Value</b>", meta_label_style),
        Paragraph("<b>SHAP Impact</b>", meta_label_style),
        Paragraph("<b>Clinical Interpretation</b>", meta_label_style)
    ]
    
    contrib_rows = [contrib_headers]
    
    shap_waterfall = assessment.get("shap_waterfall", [])
    if not shap_waterfall:
        shap_waterfall = []
        
    for item in shap_waterfall[:6]:
        feat_name = item.get("display_name", item.get("feature", "N/A"))
        raw_val = item.get("value", 0.0)
        shap_val = item.get("shap_value", 0.0)
        
        # Human formatting of feature value
        val_str = str(raw_val)
        if raw_val == 1.0 and ("gender" in item["feature"] or "race" in item["feature"] or "age" in item["feature"] or "insurance" in item["feature"]):
            val_str = "Present"
        elif raw_val == 0.0 and ("gender" in item["feature"] or "race" in item["feature"] or "age" in item["feature"] or "insurance" in item["feature"]):
            val_str = "Absent"
        elif isinstance(raw_val, float):
            val_str = f"{raw_val:.2f}"
            
        impact_dir = "Increases Risk" if shap_val > 0 else "Decreases Risk"
        impact_color = '#E53E3E' if shap_val > 0 else '#319795'
        impact_text = f"<font color='{impact_color}'><b>{impact_dir} (+{abs(shap_val)*100:.1f}%)</b></font>" if shap_val > 0 else f"<font color='{impact_color}'><b>{impact_dir} (-{abs(shap_val)*100:.1f}%)</b></font>"
        
        interpret_str = "Neutral impact"
        if item["feature"] == "num_prev_admissions" and raw_val > 0:
            interpret_str = "Prior encounters strongly flag readmission vulnerability."
        elif item["feature"] == "length_of_stay" and raw_val > 5:
            interpret_str = "Prolonged hospitalization indicates high severity index."
        elif item["feature"] == "num_diagnoses" and raw_val > 3:
            interpret_str = "Multiple co-existing discharge diagnoses."
        elif item["feature"] == "comorbidity_score" and raw_val > 2:
            interpret_str = "High comorbidity load increases complications."
        elif "age_group_70+" in item["feature"] and raw_val == 1:
            interpret_str = "Elderly care demographics require transition assistance."
            
        contrib_rows.append([
            Paragraph(feat_name, meta_val_style),
            Paragraph(val_str, meta_val_style),
            Paragraph(impact_text, meta_val_style),
            Paragraph(interpret_str, meta_val_style)
        ])
        
    contrib_table = Table(contrib_rows, colWidths=[1.8*inch, 1.2*inch, 2.0*inch, 2.5*inch])
    contrib_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(contrib_table)
    story.append(Spacer(1, 15))
    
    # Section 4: Recommended Follow-Up Actions
    story.append(Paragraph("4. Recommended Follow-Up Transitional Care Actions", section_style))
    
    recs = []
    if tier == "High":
        recs = [
            "<b>Transitional Coordinator Follow-up:</b> Schedule nurse call within 24 hours of discharge.",
            "<b>PCP Appointment:</b> Arrange a primary care visit within 7 days of discharge (High Priority).",
            "<b>Medication Reconciliation:</b> Pharmacist review of complex post-discharge drugs (Anticoagulants, Insulin, Cardiotropics).",
            "<b>Home Health Referral:</b> Initiate skilled nursing home visit for daily vital signs and symptom checks."
        ]
    elif tier == "Medium":
        recs = [
            "<b>Transitional Coordinator Follow-up:</b> Schedule check-in call within 48 hours of discharge.",
            "<b>PCP Appointment:</b> Arrange a primary care visit within 14 days of discharge.",
            "<b>Self-Management Education:</b> Provide booklets on condition indicators (CHF weight logs, diabetic care guides)."
        ]
    else:
        recs = [
            "<b>Standard Post-Discharge Call:</b> Routine nurse follow-up call at 72 hours.",
            "<b>Routine PCP Appointment:</b> Follow up as scheduled in 2-4 weeks."
        ]
        
    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=5
    )
    
    for r in recs:
        story.append(Paragraph(f"• {r}", bullet_style))
        
    story.append(Spacer(1, 25))
    
    # Footer Sign-off
    footer_data = [
        [
            Paragraph("Assessed by: _________________________", meta_label_style),
            Paragraph("Review Date: _________________________", meta_label_style)
        ],
        [
            Paragraph("Clinical Decision Support Tool - Model Version: " + assessment.get("model_version", "v1.0"), ParagraphStyle('Foot', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#A0AEC0'))),
            Paragraph("CDSS Readmission Platform V1.0", ParagraphStyle('FootR', parent=styles['Normal'], fontSize=8, alignment=2, textColor=colors.HexColor('#A0AEC0')))
        ]
    ]
    footer_table = Table(footer_data, colWidths=[3.75*inch, 3.75*inch])
    footer_table.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(footer_table)
    
    # Build Document
    doc.build(story)
    
    return filepath
