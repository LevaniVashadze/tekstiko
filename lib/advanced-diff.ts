/**
 * Simplified diff system for accurate text comparison
 */

// Debug logging utility
const DEBUG = true; // Set to false to disable logging

function log(...args: unknown[]) {
  if (DEBUG) {
    console.log("[DIFF DEBUG]", ...args);
  }
}

export interface DiffElement {
  text: string;
  type: "correct" | "incorrect" | "missing" | "extra";
  isWord: boolean;
  correction?: string;
}

/**
 * Simple tokenizer that splits text into words and punctuation
 */
function tokenize(text: string): string[] {
  // Split on spaces, keeping punctuation with words
  const tokens = text
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);

  log("Tokenize input:", JSON.stringify(text));
  log("Tokenize output:", tokens);
  return tokens;
}

/**
 * Normalize text for comparison (remove extra spaces, normalize case)
 */
function normalizeForComparison(text: string): string {
  const normalized = text.toLowerCase().normalize("NFC").trim();
  log("Normalize:", JSON.stringify(text), "->", JSON.stringify(normalized));
  return normalized;
}

/**
 * Check if two tokens are similar enough to be considered the same
 */
function tokensAreSimilar(token1: string, token2: string): boolean {
  log(
    "Comparing tokens:",
    JSON.stringify(token1),
    "vs",
    JSON.stringify(token2)
  );

  const norm1 = normalizeForComparison(token1);
  const norm2 = normalizeForComparison(token2);

  // Exact match
  if (norm1 === norm2) {
    log("  -> Exact match after normalization");
    return true;
  }

  log("  -> No exact match");
  return false;
}

/**
 * Check if two tokens have the same base word but different punctuation
 */
function tokensHaveSameWord(
  token1: string,
  token2: string
): {
  isSameWord: boolean;
  missingPunctuation?: string;
  extraPunctuation?: string;
  userWord?: string;
  correctWord?: string;
} {
  const norm1 = normalizeForComparison(token1);
  const norm2 = normalizeForComparison(token2);

  // Check if they're the same after removing punctuation
  const word1 = norm1.replace(/[.,!?;:()\[\]{}"'\-–—…]/g, "");
  const word2 = norm2.replace(/[.,!?;:()\[\]{}"'\-–—…]/g, "");

  if (word1.length > 0 && word2.length > 0 && word1 === word2) {
    // Extract punctuation from both tokens
    const punctuation1 = norm1.replace(word1, "");
    const punctuation2 = norm2.replace(word2, "");

    // User is missing punctuation (correct has punctuation, user doesn't)
    if (punctuation2.length > 0 && punctuation1.length === 0) {
      return {
        isSameWord: true,
        missingPunctuation: punctuation2,
        userWord: word1,
        correctWord: word2,
      };
    }

    // User has extra punctuation (user has punctuation, correct doesn't)
    if (punctuation1.length > 0 && punctuation2.length === 0) {
      return {
        isSameWord: true,
        extraPunctuation: punctuation1,
        userWord: word1,
        correctWord: word2,
      };
    }
  }

  return { isSameWord: false };
}

/**
 * Create a simple diff between user and correct text
 */
export function createSimpleDiff(
  userText: string,
  correctText: string
): DiffElement[] {
  log("=== Starting diff creation ===");
  log("User text:", JSON.stringify(userText));
  log("Correct text:", JSON.stringify(correctText));

  const userTokens = tokenize(userText);
  const correctTokens = tokenize(correctText);

  log("User tokens:", userTokens);
  log("Correct tokens:", correctTokens);

  const result: DiffElement[] = [];

  let userIndex = 0;
  let correctIndex = 0;

  while (userIndex < userTokens.length || correctIndex < correctTokens.length) {
    log(`\n--- Step ${result.length + 1} ---`);
    log(
      `User index: ${userIndex}/${userTokens.length}, Correct index: ${correctIndex}/${correctTokens.length}`
    );

    const userToken = userTokens[userIndex];
    const correctToken = correctTokens[correctIndex];

    log(
      "Current tokens:",
      userToken ? JSON.stringify(userToken) : "undefined",
      "vs",
      correctToken ? JSON.stringify(correctToken) : "undefined"
    );

    // Both tokens exist
    if (userToken && correctToken) {
      log("Both tokens exist, comparing...");
      if (tokensAreSimilar(userToken, correctToken)) {
        // Tokens match exactly
        log("Tokens match - marking as correct");
        result.push({
          text: userToken,
          type: "correct",
          isWord: /\w/.test(userToken),
        });
        userIndex++;
        correctIndex++;
      } else {
        const wordComparison = tokensHaveSameWord(userToken, correctToken);
        if (wordComparison.isSameWord && wordComparison.missingPunctuation) {
          // Same base word but missing punctuation - mark word as correct, then add missing punctuation
          log(
            "Same word but missing punctuation - marking word as correct and adding missing punctuation"
          );

          // Add the word as correct
          result.push({
            text: wordComparison.userWord || userToken,
            type: "correct",
            isWord: true,
          });

          // Add the missing punctuation
          result.push({
            text: wordComparison.missingPunctuation,
            type: "missing",
            isWord: false,
            correction: wordComparison.missingPunctuation,
          });

          userIndex++;
          correctIndex++;
        } else if (
          wordComparison.isSameWord &&
          wordComparison.extraPunctuation
        ) {
          // Same base word but extra punctuation - mark word as correct, then mark extra punctuation as incorrect
          log(
            "Same word but extra punctuation - marking word as correct and extra punctuation as incorrect"
          );

          // Add the word as correct
          result.push({
            text: wordComparison.userWord || wordComparison.correctWord || "",
            type: "correct",
            isWord: true,
          });

          // Add the extra punctuation as extra (red highlighting)
          result.push({
            text: wordComparison.extraPunctuation,
            type: "extra",
            isWord: false,
            correction: "", // No correction needed, should be removed
          });

          userIndex++;
          correctIndex++;
        } else {
          log("Tokens differ, checking for later matches...");

          // Check if user token appears later in correct text
          let foundLater = -1;
          const searchRange = Math.min(correctIndex + 3, correctTokens.length);
          log(
            `Searching for user token "${userToken}" in correct tokens ${
              correctIndex + 1
            } to ${searchRange - 1}`
          );

          for (let i = correctIndex + 1; i < searchRange; i++) {
            log(`  Checking correct[${i}]: "${correctTokens[i]}"`);
            if (tokensAreSimilar(userToken, correctTokens[i])) {
              foundLater = i;
              log(`  Found match at index ${i}`);
              break;
            }
          }

          if (foundLater > -1) {
            log(
              `User token found later in correct text at index ${foundLater}`
            );
            // Add missing tokens before the match
            for (let i = correctIndex; i < foundLater; i++) {
              log(`Adding missing token: "${correctTokens[i]}"`);
              result.push({
                text: correctTokens[i],
                type: "missing",
                isWord: /\w/.test(correctTokens[i]),
                correction: correctTokens[i],
              });
            }
            correctIndex = foundLater;
          } else {
            log(
              "User token not found later in correct text, checking reverse..."
            );

            // Check if correct token appears later in user text
            let userFoundLater = -1;
            const userSearchRange = Math.min(userIndex + 3, userTokens.length);
            log(
              `Searching for correct token "${correctToken}" in user tokens ${
                userIndex + 1
              } to ${userSearchRange - 1}`
            );

            for (let i = userIndex + 1; i < userSearchRange; i++) {
              log(`  Checking user[${i}]: "${userTokens[i]}"`);
              if (tokensAreSimilar(userTokens[i], correctToken)) {
                userFoundLater = i;
                log(`  Found match at index ${i}`);
                break;
              }
            }

            if (userFoundLater > -1) {
              log(
                `Correct token found later in user text at index ${userFoundLater}`
              );
              // Mark tokens as extra
              for (let i = userIndex; i < userFoundLater; i++) {
                log(`Adding extra token: "${userTokens[i]}"`);
                result.push({
                  text: userTokens[i],
                  type: "extra",
                  isWord: /\w/.test(userTokens[i]),
                });
              }
              userIndex = userFoundLater;
            } else {
              log(
                "No later matches found - marking as incorrect with correction"
              );
              // Different tokens - mark as incorrect
              result.push({
                text: userToken,
                type: "incorrect",
                isWord: /\w/.test(userToken),
                correction: correctToken,
              });
              userIndex++;
              correctIndex++;
            }
          }
        }
      }
    }
    // Only user token exists (extra)
    else if (userToken && !correctToken) {
      log("Only user token exists - marking as extra");
      result.push({
        text: userToken,
        type: "extra",
        isWord: /\w/.test(userToken),
      });
      userIndex++;
    }
    // Only correct token exists (missing)
    else if (!userToken && correctToken) {
      log("Only correct token exists - marking as missing");
      result.push({
        text: correctToken,
        type: "missing",
        isWord: /\w/.test(correctToken),
        correction: correctToken,
      });
      correctIndex++;
    }

    log("Result so far:", result.map((r) => `${r.text}[${r.type}]`).join(" "));
  }

  log("\n=== Diff creation complete ===");
  log("Final result:", result);
  return result;
}

/**
 * Create enhanced visualization for the component
 */
export function createEnhancedVisualization(
  userText: string,
  correctText: string
): Array<{
  text: string;
  type: "correct" | "incorrect" | "extra" | "missing";
  correction?: string;
  isMissing?: boolean;
  missingType?: "punctuation" | "word";
}> {
  const diff = createSimpleDiff(userText, correctText);

  return diff.map((element) => ({
    text: element.text,
    type: element.type as "correct" | "incorrect" | "extra" | "missing",
    correction: element.correction,
    isMissing: element.type === "missing",
    missingType: element.isWord ? "word" : "punctuation",
  }));
}
