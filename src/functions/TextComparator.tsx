import { diffWords } from "diff";

export interface ComparisonResult {
  hasDifferences: boolean;
  additions: number;
  deletions: number;
  changes: Array<{
    value: string;
    added?: boolean;
    removed?: boolean;
  }>;
  similarityPercentage: number;
  formattedText1: string; 
  formattedText2: string; 
  formattedText1OnlyDiffs: string;
  formattedText2OnlyDiffs: string;
}

export default class TextComparator {
  compare(text1: string, text2: string): ComparisonResult {
    const diff = diffWords(text1, text2);
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    // First pass: build the formatted text with inline highlighting
    let tempText1 = "";
    let tempText2 = "";

    diff.forEach((part) => {
      const escapedValue = part.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      if (part.added) {
        additions++;
        tempText2 += `<span class="diff-added" style="color: #2ecc71; white-space: pre-wrap;">${escapedValue}</span>`;
      } else if (part.removed) {
        deletions++;
        tempText1 += `<span class="diff-removed" style="color: #e74c3c; white-space: pre-wrap;">${escapedValue}</span>`;
      } else {
        unchanged++;
        tempText1 += `<span style="color: var(--text-tertiary); white-space: pre-wrap;">${escapedValue}</span>`;
        tempText2 += `<span style="color: var(--text-tertiary); white-space: pre-wrap;">${escapedValue}</span>`;
      }
    });

    // Second pass: wrap lines with differences in highlighted divs
    const formattedText1 = this.highlightChangedLines(tempText1, 'removed');
    const formattedText2 = this.highlightChangedLines(tempText2, 'added');

    // Create filtered versions with only changed lines
    const formattedText1OnlyDiffs = this.filterChangedLines(tempText1, 'removed');
    const formattedText2OnlyDiffs = this.filterChangedLines(tempText2, 'added');

    const total = additions + deletions + unchanged;
    const similarityPercentage = total > 0 ? Math.round((unchanged / total) * 100) : 100;

    return {
      hasDifferences: additions > 0 || deletions > 0,
      additions,
      deletions,
      changes: diff,
      similarityPercentage,
      formattedText1,
      formattedText2,
      formattedText1OnlyDiffs,
      formattedText2OnlyDiffs,
    };
  }

  // Helper function to highlight lines with changes
  private highlightChangedLines(html: string, type: 'added' | 'removed'): string {
    const lines = html.split('\n');
    const bgColor = type === 'added'
      ? 'rgba(46, 204, 113, 0.1)'
      : 'rgba(231, 76, 60, 0.1)';
    const className = type === 'added' ? 'diff-added' : 'diff-removed';

    return lines.map(line => {
      const hasDiff = line.includes(`class="${className}"`);

      if (hasDiff) {
        return `<div style="background-color: ${bgColor}; padding: 2px 0; margin: 0; display: block;">${line}</div>`;
      }
      return `<div style="display: block;">${line}</div>`;
    }).join('\n');
  }

  // Helper function to show only lines with changes
  private filterChangedLines(html: string, type: 'added' | 'removed'): string {
    const lines = html.split('\n');
    const bgColor = type === 'added'
      ? 'rgba(46, 204, 113, 0.1)'
      : 'rgba(231, 76, 60, 0.1)';
    const className = type === 'added' ? 'diff-added' : 'diff-removed';

    const changedLines = lines.filter(line => line.includes(`class="${className}"`));

    if (changedLines.length === 0) {
      return `<div style="color: var(--text-tertiary); padding: 20px; text-align: center;">No ${type === 'added' ? 'additions' : 'deletions'}</div>`;
    }

    return changedLines.map(line => {
      return `<div style="background-color: ${bgColor}; padding: 2px 0; margin: 0; display: block;">${line}</div>`;
    }).join('\n');
  }
}

