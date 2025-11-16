"""
Script to identify and flag invalid assessments from the unbalanced question bug.

Run this after deploying the fix to mark existing invalid assessments.

Usage:
    python -m scripts.fix_invalid_assessments --dry-run  # Preview changes
    python -m scripts.fix_invalid_assessments --apply    # Actually update database
"""

import sys
import argparse
from datetime import datetime
from typing import List, Dict, Optional
import logging
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from supabase import create_client, Client
from src.api.config import config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_supabase_client() -> Client:
    """Initialize Supabase client"""
    url = config.get_supabase_url()
    key = config.get_supabase_key()
    
    if not url or not key:
        raise ValueError("Supabase credentials not configured")
    
    return create_client(url, key)

def identify_invalid_assessments(supabase: Client, fix_date: Optional[str] = None) -> List[Dict]:
    """
    Find assessments that are likely invalid due to unbalanced questions.
    
    Criteria for invalid assessment:
    1. Exactly 4 traits at 0.5 (50%) in trait_scores JSONB
    2. OR MBTI contains 'X' characters
    3. Completed before the fix date (if provided)
    """
    
    logger.info("Searching for invalid assessments...")
    
    # Query all assessments
    query = supabase.table('personality_assessments').select('id, created_at, trait_scores, mbti_code')
    
    # Filter by date if provided
    if fix_date:
        query = query.lt('created_at', fix_date)
    
    result = query.execute()
    
    invalid_assessments = []
    
    for assessment in result.data:
        trait_scores = assessment.get('trait_scores') or {}
        mbti_code = assessment.get('mbti_code', '')
        
        # Check if trait_scores is a dict (JSONB)
        if not isinstance(trait_scores, dict):
            continue
        
        # Extract trait values
        openness = trait_scores.get('Openness')
        conscientiousness = trait_scores.get('Conscientiousness')
        extraversion = trait_scores.get('Extraversion')
        agreeableness = trait_scores.get('Agreeableness')
        neuroticism = trait_scores.get('Neuroticism')
        
        scores = [conscientiousness, extraversion, agreeableness, neuroticism]
        
        # Check pattern 1: Four traits at exactly 0.5 (excluding Openness which might be valid)
        four_at_half = sum(1 for s in scores if s is not None and abs(s - 0.5) < 0.01) == 4
        
        # Check pattern 2: MBTI contains X
        has_x_in_mbti = 'X' in str(mbti_code) if mbti_code else False
        
        # Check pattern 3: Openness is high but others are all 0.5 (classic bug pattern)
        openness_high = openness is not None and openness > 0.6
        all_others_half = four_at_half and openness_high
        
        if four_at_half or has_x_in_mbti or all_others_half:
            reason = []
            if four_at_half:
                reason.append('Four traits at 50%')
            if has_x_in_mbti:
                reason.append('Invalid MBTI (contains X)')
            if all_others_half:
                reason.append('Unbalanced question set (high Openness, others at 50%)')
            
            invalid_assessments.append({
                'id': assessment['id'],
                'created_at': assessment.get('created_at'),
                'mbti_code': mbti_code,
                'reason': '; '.join(reason),
                'trait_scores': trait_scores
            })
    
    logger.info(f"Found {len(invalid_assessments)} potentially invalid assessments")
    return invalid_assessments

def mark_for_retake(supabase: Client, assessment_ids: List[str], reason: str, dry_run: bool = True):
    """Mark assessments as needing retake"""
    
    if dry_run:
        logger.info(f"[DRY RUN] Would mark {len(assessment_ids)} assessments for retake")
        for aid in assessment_ids[:5]:
            logger.info(f"  - {aid}")
        if len(assessment_ids) > 5:
            logger.info(f"  ... and {len(assessment_ids) - 5} more")
        return
    
    logger.info(f"Marking {len(assessment_ids)} assessments as needs_retake...")
    
    try:
        # Update in batches to avoid query size limits
        batch_size = 100
        total_updated = 0
        
        for i in range(0, len(assessment_ids), batch_size):
            batch = assessment_ids[i:i + batch_size]
            result = supabase.table('personality_assessments')\
                .update({
                    'needs_retake': True,
                    'needs_retake_reason': reason
                })\
                .in_('id', batch)\
                .execute()
            
            total_updated += len(result.data) if result.data else 0
        
        logger.info(f"✅ Successfully marked {total_updated} assessments")
        return total_updated
        
    except Exception as e:
        logger.error(f"❌ Error marking assessments: {e}")
        raise

def main():
    parser = argparse.ArgumentParser(description='Fix invalid personality assessments')
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without applying them'
    )
    parser.add_argument(
        '--apply',
        action='store_true',
        help='Actually apply the changes to the database'
    )
    parser.add_argument(
        '--fix-date',
        type=str,
        default='2024-11-17 00:00:00',
        help='Only flag assessments created before this date (YYYY-MM-DD HH:MM:SS)'
    )
    
    args = parser.parse_args()
    
    if not (args.dry_run or args.apply):
        parser.error('Must specify either --dry-run or --apply')
    
    dry_run = args.dry_run
    
    try:
        supabase = get_supabase_client()
    except Exception as e:
        logger.error(f"Failed to connect to Supabase: {e}")
        sys.exit(1)
    
    logger.info(f"{'[DRY RUN] ' if dry_run else ''}Starting invalid assessment fix...")
    logger.info(f"Fix deployment date: {args.fix_date}")
    
    # Step 1: Identify invalid assessments
    invalid_assessments = identify_invalid_assessments(supabase, args.fix_date)
    
    if len(invalid_assessments) == 0:
        logger.info("✅ No invalid assessments found!")
        return
    
    # Step 2: Display summary
    logger.info("\n" + "="*60)
    logger.info("INVALID ASSESSMENTS SUMMARY")
    logger.info("="*60)
    
    for i, assessment in enumerate(invalid_assessments[:10], 1):  # Show first 10
        logger.info(f"\n{i}. Assessment ID: {assessment['id']}")
        logger.info(f"   Created: {assessment['created_at']}")
        logger.info(f"   MBTI: {assessment['mbti_code']}")
        logger.info(f"   Reason: {assessment['reason']}")
        logger.info(f"   Trait Scores: {assessment['trait_scores']}")
    
    if len(invalid_assessments) > 10:
        logger.info(f"\n... and {len(invalid_assessments) - 10} more")
    
    logger.info("\n" + "="*60)
    
    # Step 3: Mark for retake
    assessment_ids = [a['id'] for a in invalid_assessments]
    mark_for_retake(
        supabase,
        assessment_ids,
        reason="Unbalanced question set (pre-fix deployment)",
        dry_run=dry_run
    )
    
    logger.info("\n✅ Script completed successfully!")

if __name__ == "__main__":
    main()

