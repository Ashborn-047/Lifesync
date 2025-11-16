/**
 * LifeSync TraitBar Component Tests
 * Tests for null handling in TraitBar component (Solution D)
 * 
 * This test suite ensures that:
 * 1. Null scores display "No Data" message
 * 2. Valid scores display correctly with percentage
 * 3. Component handles edge cases properly
 * 
 * Run with: npm test -- TraitBar.test.tsx
 */

import { render, screen } from '@testing-library/react';
import TraitBar from '@/components/ui/TraitBar';

describe('TraitBar Component - Null Handling Tests', () => {
  it('should render null score with "No Data" message', () => {
    console.log('='.repeat(60));
    console.log('TEST: Null score displays "No Data"');
    console.log('='.repeat(60));
    
    render(
      <TraitBar
        trait="Conscientiousness"
        score={null}
        max={100}
        showValue={true}
      />
    );

    console.log('Rendered TraitBar with null score');
    
    // Should show "No Data" text
    const noDataText = screen.getByText('No Data');
    expect(noDataText).toBeInTheDocument();
    console.log('✅ Found "No Data" text');

    // Should show "Not enough questions answered" message
    const messageText = screen.getByText(/Not enough questions answered/i);
    expect(messageText).toBeInTheDocument();
    console.log('✅ Found "Not enough questions answered" message');
    
    console.log('✅ Test passed: Null score correctly displays "No Data"');
  });

  it('should render valid score with percentage', () => {
    console.log('='.repeat(60));
    console.log('TEST: Valid score displays percentage');
    console.log('='.repeat(60));
    
    render(
      <TraitBar
        trait="Openness"
        score={75}
        max={100}
        showValue={true}
      />
    );

    console.log('Rendered TraitBar with score 75');
    
    // Should show percentage (75.0%)
    const percentageText = screen.getByText('75.0%');
    expect(percentageText).toBeInTheDocument();
    console.log('✅ Found percentage text: 75.0%');

    // Should show trait name
    const traitName = screen.getByText('Openness');
    expect(traitName).toBeInTheDocument();
    console.log('✅ Found trait name: Openness');
    
    console.log('✅ Test passed: Valid score correctly displays percentage');
  });

  it('should handle score conversion from 0-1 scale to 0-100', () => {
    console.log('='.repeat(60));
    console.log('TEST: Score conversion (0-1 to 0-100)');
    console.log('='.repeat(60));
    
    // Score of 0.75 should display as 75%
    render(
      <TraitBar
        trait="Extraversion"
        score={0.75}
        max={1}
        showValue={true}
      />
    );

    console.log('Rendered TraitBar with score 0.75 (0-1 scale), max=1');
    
    // Should show 75.0% (0.75 * 100 = 75)
    const percentageText = screen.getByText('75.0%');
    expect(percentageText).toBeInTheDocument();
    console.log('✅ Found percentage text: 75.0% (correctly converted)');
    
    console.log('✅ Test passed: Score conversion works correctly');
  });

  it('should not show value when showValue is false', () => {
    console.log('='.repeat(60));
    console.log('TEST: Hide value when showValue=false');
    console.log('='.repeat(60));
    
    render(
      <TraitBar
        trait="Agreeableness"
        score={80}
        max={100}
        showValue={false}
      />
    );

    console.log('Rendered TraitBar with showValue=false');
    
    // Should not show percentage
    const percentageText = screen.queryByText('80.0%');
    expect(percentageText).not.toBeInTheDocument();
    console.log('✅ Percentage text correctly hidden');
    
    // Should still show trait name
    const traitName = screen.getByText('Agreeableness');
    expect(traitName).toBeInTheDocument();
    console.log('✅ Trait name still visible');
    
    console.log('✅ Test passed: Value correctly hidden when showValue=false');
  });

  it('should handle edge case: score = 0', () => {
    console.log('='.repeat(60));
    console.log('TEST: Edge case - score = 0');
    console.log('='.repeat(60));
    
    render(
      <TraitBar
        trait="Neuroticism"
        score={0}
        max={100}
        showValue={true}
      />
    );

    console.log('Rendered TraitBar with score 0');
    
    // Should show 0.0%
    const percentageText = screen.getByText('0.0%');
    expect(percentageText).toBeInTheDocument();
    console.log('✅ Found percentage text: 0.0%');
    
    console.log('✅ Test passed: Edge case (score=0) handled correctly');
  });

  it('should handle edge case: score = 100', () => {
    console.log('='.repeat(60));
    console.log('TEST: Edge case - score = 100');
    console.log('='.repeat(60));
    
    render(
      <TraitBar
        trait="Openness"
        score={100}
        max={100}
        showValue={true}
      />
    );

    console.log('Rendered TraitBar with score 100');
    
    // Should show 100.0%
    const percentageText = screen.getByText('100.0%');
    expect(percentageText).toBeInTheDocument();
    console.log('✅ Found percentage text: 100.0%');
    
    console.log('✅ Test passed: Edge case (score=100) handled correctly');
  });
});

