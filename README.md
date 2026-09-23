# hack-3fa15a7b-fact-check
Hackathon team repository for Fact check
## Matching Pipeline

The application processes a user request in the following order:

1. Filter contractors by category and city.
2. Check availability for the selected date.
3. Check budget, event format, language, and duration.
4. Calculate a deterministic matching score.
5. Sort candidates deterministically.
6. Return up to 3 contractors with concrete matching reasons.

AI will be used for generating human-readable explanations based only on verified matching facts.