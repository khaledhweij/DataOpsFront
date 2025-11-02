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
  formattedText1: string; // Original text with red highlights
  formattedText2: string; // New text with green highlights
}

export default class TextComparator {
  compare(text1: string, text2: string): ComparisonResult {
    const diff = diffWords(text1, text2);

    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    let formattedText1 = "";
    let formattedText2 = "";

    diff.forEach((part) => {
      const escapedValue = part.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      if (part.added) {
        additions++;
        formattedText2 += `<span style="color: #2ecc71; white-space: pre-wrap;">${escapedValue}</span>`;
      } else if (part.removed) {
        deletions++;
        formattedText1 += `<span style="color: #e74c3c; white-space: pre-wrap;">${escapedValue}</span>`;
      } else {
        unchanged++;
        formattedText1 += `<span style="color: #000; white-space: pre-wrap;">${escapedValue}</span>`;
        formattedText2 += `<span style="color: #000; white-space: pre-wrap;">${escapedValue}</span>`;
      }
    });

    const total = additions + deletions + unchanged;
    const similarityPercentage =
      total > 0 ? Math.round((unchanged / total) * 100) : 100;

    return {
      hasDifferences: additions > 0 || deletions > 0,
      additions,
      deletions,
      changes: diff,
      similarityPercentage,
      formattedText1,
      formattedText2,
    };
  }
}
